import { makeAutoObservable } from 'mobx';

import { actionUsesTarget, skillUsesTarget } from '@engine/formulas/damage';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  cloneBattleRuntime,
  cloneBattleUnit,
  toPartyUnitRuntime,
} from '@engine/systems/battle/battleRuntimeCloning';
import type {
  BattleActionSelection,
  BattleActionType,
  BattleOutcome,
  BattlePhase,
  BattleRuntime,
  CombatLogEntry,
} from '@engine/types/battle';
import type { DamageKind } from '@engine/types/combat';
import type { EffectTargetScope, GameEffect, ResourceKey } from '@engine/types/effects';
import type { ItemData } from '@engine/types/item';
import type { ResolvedLootEntry } from '@engine/types/loot';
import type { BattleStoreSnapshot } from '@engine/types/save';
import type { StatusCategory, StatusType } from '@engine/types/status';
import type { ScreenId } from '@engine/types/ui';
import type { BattleUnitRuntime } from '@engine/types/unit';

interface BattleRewardBundle {
  experience: number;
  loot: ResolvedLootEntry[];
  effects: GameEffect[];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export class BattleStore {
  readonly rootStore: GameRootStore;

  battleRuntime: BattleRuntime | null = null;
  returnScreenId: ScreenId | null = null;
  pendingBattleTemplateId: string | null = null;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get activeBattleId() {
    return this.battleRuntime?.templateId ?? null;
  }

  get activeBattleRef() {
    return this.activeBattleId;
  }

  get phase(): BattlePhase {
    return this.battleRuntime?.phase ?? 'idle';
  }

  get combatLog(): CombatLogEntry[] {
    return this.battleRuntime?.combatLog ?? [];
  }

  get selectedAction() {
    return this.battleRuntime?.selectedAction ?? null;
  }

  get selectedActionId() {
    return this.selectedAction?.type ?? null;
  }

  get selectedTargetId() {
    return this.battleRuntime?.selectedTargetId ?? null;
  }

  get round() {
    return this.battleRuntime?.round ?? 0;
  }

  get turnQueue() {
    return this.battleRuntime?.turnQueue ?? [];
  }

  get hasActiveBattle() {
    return this.battleRuntime !== null;
  }

  get hasPendingBattle() {
    return this.pendingBattleTemplateId !== null;
  }

  get allies() {
    return this.battleRuntime?.allies ?? [];
  }

  get enemies() {
    return this.battleRuntime?.enemies ?? [];
  }

  get allUnits() {
    return [...this.allies, ...this.enemies];
  }

  get currentUnit() {
    return this.battleRuntime?.currentUnitId
      ? this.getUnitById(this.battleRuntime.currentUnitId)
      : null;
  }

  get livingAllies() {
    return this.allies.filter((unit) => unit.currentHp > 0);
  }

  get livingEnemies() {
    return this.enemies.filter((unit) => unit.currentHp > 0);
  }

  get isAwaitingPlayerInput() {
    return this.phase === 'playerInput';
  }

  get isEnemyTurn() {
    return this.phase === 'enemyThinking';
  }

  get preferredItemEntry() {
    return this.rootStore.inventory.battleUsableEntries[0] ?? null;
  }

  get selectedItem() {
    if (this.selectedAction?.type !== 'item' || !this.selectedAction.itemId) {
      return null;
    }

    return this.rootStore.inventory.inspectItem(this.selectedAction.itemId);
  }

  get selectedSkill() {
    if (this.selectedAction?.type !== 'skill' || !this.selectedAction.skillId) {
      return null;
    }

    return this.rootStore.getSkillById(this.selectedAction.skillId) ?? null;
  }

  get selectedActionTargetSide(): BattleUnitRuntime['side'] | null {
    const selection = this.selectedAction;

    if (!selection) {
      return null;
    }

    if (selection.type === 'attack') {
      return 'enemy';
    }

    if (selection.type === 'skill') {
      switch (this.selectedSkill?.targetPattern) {
        case 'single-ally':
          return 'ally';
        case 'single-enemy':
          return 'enemy';
        default:
          return null;
      }
    }

    if (selection.type !== 'item') {
      return null;
    }

    switch (this.selectedItem?.targetScope) {
      case 'ally':
        return 'ally';
      case 'enemy':
        return 'enemy';
      default:
        return null;
    }
  }

  get selectedActionRequiresTarget() {
    return this.selectionRequiresTarget(this.selectedAction);
  }

  get snapshot(): BattleStoreSnapshot {
    return {
      battleRuntime: this.battleRuntime ? cloneBattleRuntime(this.battleRuntime) : null,
      returnScreenId: this.returnScreenId,
      pendingBattleTemplateId: this.pendingBattleTemplateId,
    };
  }

  startBattle(templateId: string, options: { skipIntro?: boolean } = {}) {
    this.rootStore.assertBattleTemplateValid(templateId);
    const template = this.rootStore.getBattleTemplateById(templateId);

    if (!template) {
      throw new Error(`Battle template "${templateId}" was not found.`);
    }

    const introSceneFlowId = template.introSceneFlowId;
    const introDialogueId = template.introDialogueId;

    if (!options.skipIntro && introSceneFlowId) {
      this.pendingBattleTemplateId = templateId;
      this.rootStore.sceneFlowController.startSceneFlow(introSceneFlowId);

      return null;
    }

    if (!options.skipIntro && introDialogueId) {
      this.pendingBattleTemplateId = templateId;
      this.rootStore.dialogue.startDialogue(introDialogueId);

      return null;
    }

    this.pendingBattleTemplateId = null;
    this.returnScreenId = this.rootStore.ui.activeScreen === 'battle' ? null : this.rootStore.ui.activeScreen;
    this.rootStore.combatLogBuilder.reset();
    this.battleRuntime = cloneBattleRuntime(this.rootStore.battleResolver.createBattleRuntime(templateId));
    this.rootStore.ui.setScreen('battle');
    this.beginCurrentTurn();
    void this.rootStore.saves.autoSave(template.title ?? templateId);

    return this.battleRuntime;
  }

  resumePendingBattle() {
    if (!this.pendingBattleTemplateId) {
      return null;
    }

    const templateId = this.pendingBattleTemplateId;

    return this.startBattle(templateId, { skipIntro: true });
  }

  selectAction(
    actionType: BattleActionType | null,
    options: {
      actionId?: string;
      skillId?: string;
      itemId?: string;
      targetId?: string;
    } = {},
  ) {
    const runtime = this.requireBattleRuntime();
    const currentUnit = this.requireCurrentUnit();

    if (!actionType) {
      this.battleRuntime = {
        ...runtime,
        selectedAction: null,
        selectedTargetId: null,
      };

      return;
    }

    this.battleRuntime = {
      ...runtime,
      selectedAction: {
        type: actionType,
        sourceUnitId: currentUnit.unitId,
        ...options,
      },
      selectedTargetId: options.targetId ?? runtime.selectedTargetId,
    };
  }

  selectTarget(targetId: string | null) {
    const runtime = this.requireBattleRuntime();

    this.battleRuntime = {
      ...runtime,
      selectedTargetId: targetId,
    };
  }

  performPlayerAction(
    actionType: BattleActionType,
    options: {
      skillId?: string;
      itemId?: string;
      targetId?: string;
    } = {},
  ) {
    if (!this.isAwaitingPlayerInput) {
      throw new Error('The battle is not currently waiting for player input.');
    }

    this.selectAction(actionType, options);

    if (options.targetId) {
      this.selectTarget(options.targetId);
    }

    return this.submitSelectedAction();
  }

  submitSelectedAction() {
    if (!this.isAwaitingPlayerInput) {
      throw new Error('Cannot submit a player action outside of the player input phase.');
    }

    const runtime = this.requireBattleRuntime();
    const selection = runtime.selectedAction;

    if (!selection) {
      throw new Error('No player action is currently selected.');
    }

    const finalizedSelection = this.selectionRequiresTarget(selection)
      ? (() => {
          const resolvedTargetId =
            selection.targetId ??
            runtime.selectedTargetId ??
            this.getAvailableTargetsForSelection(selection)[0]?.unitId;

          return resolvedTargetId
            ? {
                ...selection,
                targetId: resolvedTargetId,
              }
            : selection;
        })()
      : selection;

    if (this.selectionRequiresTarget(finalizedSelection) && !finalizedSelection.targetId) {
      throw new Error(`Action "${finalizedSelection.type}" requires a target.`);
    }

    return this.resolveAndAdvance(finalizedSelection);
  }

  runEnemyTurn() {
    if (!this.isEnemyTurn) {
      throw new Error('Enemy turns can only run during the enemyThinking phase.');
    }

    const runtime = this.requireBattleRuntime();
    const currentUnit = this.requireCurrentUnit();
    const selection = this.rootStore.battleAI.chooseAction(runtime, currentUnit);

    return this.resolveAndAdvance(selection);
  }

  getAvailableTargets() {
    const currentUnit = this.currentUnit;

    if (!currentUnit) {
      return [];
    }

    return currentUnit.side === 'ally' ? this.livingEnemies : this.livingAllies;
  }

  getAvailableTargetsForSelection(selection = this.selectedAction) {
    const currentUnit = this.currentUnit;

    if (!currentUnit || !selection) {
      return [];
    }

    if (selection.type === 'skill') {
      const skill = selection.skillId ? this.rootStore.getSkillById(selection.skillId) ?? null : null;

      switch (skill?.targetPattern) {
        case 'single-ally':
          return this.livingAllies;
        case 'single-enemy':
          return this.livingEnemies;
        default:
          return [];
      }
    }

    if (selection.type === 'item') {
      const item = selection.itemId ? this.rootStore.inventory.inspectItem(selection.itemId) : null;

      if (item?.targetScope === 'ally') {
        return this.livingAllies;
      }

      if (item?.targetScope === 'enemy') {
        return this.livingEnemies;
      }

      return [];
    }

    return this.getAvailableTargets();
  }

  restoreResourceToScope(
    scope: EffectTargetScope,
    resource: ResourceKey,
    amount: number,
    targetId?: string,
  ) {
    const runtime = this.battleRuntime;

    if (!runtime || amount <= 0) {
      return [];
    }

    const targetUnitIds = this.resolveScopeUnitIds(scope, targetId);
    const restoredUnitIds: string[] = [];
    let nextRuntime = cloneBattleRuntime(runtime);

    targetUnitIds.forEach((unitId) => {
      const unit = [...nextRuntime.allies, ...nextRuntime.enemies].find((entry) => entry.unitId === unitId);

      if (!unit) {
        return;
      }

      const nextValue =
        resource === 'hp'
          ? clamp(unit.currentHp + amount, 0, unit.derivedStats.maxHp)
          : clamp(unit.currentMana + amount, 0, unit.derivedStats.maxMana);

      const currentValue = resource === 'hp' ? unit.currentHp : unit.currentMana;

      if (nextValue === currentValue) {
        return;
      }

      const updatedUnit: BattleUnitRuntime = {
        ...cloneBattleUnit(unit),
        ...(resource === 'hp' ? { currentHp: nextValue } : { currentMana: nextValue }),
      };

      nextRuntime = this.replaceUnit(nextRuntime, updatedUnit);
      restoredUnitIds.push(unitId);
    });

    if (restoredUnitIds.length > 0) {
      this.battleRuntime = nextRuntime;
      this.syncAlliesBackToParty();
    }

    return restoredUnitIds;
  }

  dealDamageToScope(
    scope: EffectTargetScope,
    amount: number,
    options: {
      damageKind?: DamageKind;
      sourceUnitId?: string;
      targetId?: string;
    } = {},
  ) {
    const runtime = this.battleRuntime;

    if (!runtime || amount <= 0) {
      return {
        damagedUnitIds: [],
        totalDamage: 0,
      };
    }

    const targetUnitIds = this.resolveScopeUnitIds(scope, options.targetId);
    const sourceUnit = options.sourceUnitId
      ? [...runtime.allies, ...runtime.enemies].find((unit) => unit.unitId === options.sourceUnitId) ?? null
      : null;
    const damagedUnitIds: string[] = [];
    let totalDamage = 0;
    let nextRuntime = cloneBattleRuntime(runtime);

    targetUnitIds.forEach((unitId) => {
      const unit = [...nextRuntime.allies, ...nextRuntime.enemies].find((entry) => entry.unitId === unitId);

      if (!unit) {
        return;
      }

      const damageDealt = this.rootStore.statusProcessor.getAdjustedDamage(
        amount,
        sourceUnit ?? unit,
        unit,
        options.damageKind ?? 'physical',
      );

      if (damageDealt <= 0) {
        return;
      }

      const updatedUnit: BattleUnitRuntime = {
        ...cloneBattleUnit(unit),
        currentHp: clamp(unit.currentHp - damageDealt, 0, unit.derivedStats.maxHp),
      };
      const appliedDamage = unit.currentHp - updatedUnit.currentHp;

      if (appliedDamage <= 0) {
        return;
      }

      nextRuntime = this.replaceUnit(nextRuntime, updatedUnit);
      totalDamage += appliedDamage;
      damagedUnitIds.push(unitId);
    });

    if (damagedUnitIds.length > 0) {
      this.battleRuntime = nextRuntime;
      this.syncAlliesBackToParty();
    }

    return {
      damagedUnitIds,
      totalDamage,
    };
  }

  removeStatusFromScope(scope: EffectTargetScope, statusType: StatusType, targetId?: string) {
    const runtime = this.battleRuntime;

    if (!runtime) {
      return 0;
    }

    const targetUnitIds = this.resolveScopeUnitIds(scope, targetId);
    let removedCount = 0;
    let nextRuntime = cloneBattleRuntime(runtime);

    targetUnitIds.forEach((unitId) => {
      const result = this.rootStore.statusProcessor.removeStatusFromRuntime(nextRuntime, unitId, statusType);

      nextRuntime = result.runtime;
      removedCount += result.removedCount;
    });

    if (removedCount > 0) {
      this.battleRuntime = nextRuntime;
      this.syncAlliesBackToParty();
    }

    return removedCount;
  }

  cleanseStatusesFromScope(
    scope: EffectTargetScope,
    options: {
      onlyNegative?: boolean;
      category?: StatusCategory;
      limit?: number;
      targetId?: string;
    } = {},
  ) {
    const runtime = this.battleRuntime;

    if (!runtime) {
      return 0;
    }

    const targetUnitIds = this.resolveScopeUnitIds(scope, options.targetId);
    let removedCount = 0;
    let remainingLimit = options.limit;
    let nextRuntime = cloneBattleRuntime(runtime);

    targetUnitIds.forEach((unitId) => {
      if (remainingLimit !== undefined && remainingLimit <= 0) {
        return;
      }

      const result = this.rootStore.statusProcessor.cleanseStatusesFromRuntime(nextRuntime, unitId, {
        ...(options.onlyNegative !== undefined ? { onlyNegative: options.onlyNegative } : {}),
        ...(options.category !== undefined ? { category: options.category } : {}),
        ...(remainingLimit !== undefined ? { limit: remainingLimit } : {}),
      });

      nextRuntime = result.runtime;
      removedCount += result.removedCount;

      if (remainingLimit !== undefined) {
        remainingLimit -= result.removedCount;
      }
    });

    if (removedCount > 0) {
      this.battleRuntime = nextRuntime;
      this.syncAlliesBackToParty();
    }

    return removedCount;
  }

  endBattle() {
    const shouldRestoreScreen = this.rootStore.ui.activeScreen === 'battle';
    const returnScreenId = this.returnScreenId;

    if (this.rootStore.ui.activeModal?.id === 'battle-rewards') {
      this.rootStore.ui.closeModal();
    }

    if (this.rootStore.progression.hasPendingBattleSummary) {
      this.rootStore.progression.clearBattleSummary();
    }

    this.battleRuntime = null;
    this.returnScreenId = null;

    if (shouldRestoreScreen) {
      this.rootStore.ui.setScreen(returnScreenId ?? (this.rootStore.world.hasActiveLocation ? 'world' : 'home'));
    }
  }

  reset() {
    this.battleRuntime = null;
    this.returnScreenId = null;
    this.pendingBattleTemplateId = null;
  }

  restore(snapshot: BattleStoreSnapshot) {
    this.battleRuntime = snapshot.battleRuntime ? cloneBattleRuntime(snapshot.battleRuntime) : null;
    this.returnScreenId = snapshot.returnScreenId;
    this.pendingBattleTemplateId = snapshot.pendingBattleTemplateId;

    if (this.battleRuntime) {
      this.syncAlliesBackToParty();
    }
  }

  private resolveAndAdvance(selection: BattleActionSelection) {
    this.setPhase('resolvingAction');

    const runtime = this.requireBattleRuntime();
    const result = this.rootStore.battleResolver.resolveAction(runtime, selection);
    const nextRuntime: BattleRuntime = {
      ...runtime,
      allies: result.allies,
      enemies: result.enemies,
      combatLog: [...runtime.combatLog, ...result.logEntries],
      selectedAction: null,
      selectedTargetId: null,
    };

    this.battleRuntime = cloneBattleRuntime(nextRuntime);
    this.syncAlliesBackToParty();
    this.applyStatusTiming('turnEnd', selection.sourceUnitId);

    const outcome = this.getOutcome();

    if (outcome) {
      this.finishBattle(outcome);

      return result;
    }

    this.advanceQueue();

    return result;
  }

  private advanceQueue() {
    const runtime = this.requireBattleRuntime();
    const remainingQueue = runtime.turnQueue.filter(
      (unitId, index) => index > 0 && (this.getUnitById(unitId)?.currentHp ?? 0) > 0,
    );

    if (remainingQueue.length > 0) {
      this.battleRuntime = {
        ...runtime,
        turnQueue: remainingQueue,
        currentUnitId: remainingQueue[0] ?? null,
        selectedAction: null,
        selectedTargetId: null,
        phase: 'turnStart',
      };
      this.beginCurrentTurn();

      return;
    }

    const rebuiltQueue = this.rootStore.turnQueueBuilder.build(this.allUnits);

    if (rebuiltQueue.length === 0) {
      const outcome = this.getOutcome();

      if (outcome) {
        this.finishBattle(outcome);
      }

      return;
    }

    this.battleRuntime = {
      ...runtime,
      round: runtime.round + 1,
      turnQueue: rebuiltQueue,
      currentUnitId: rebuiltQueue[0] ?? null,
      selectedAction: null,
      selectedTargetId: null,
      phase: 'turnStart',
    };
    this.beginCurrentTurn();
  }

  private beginCurrentTurn() {
    const runtime = this.requireBattleRuntime();
    const currentUnit = this.currentUnit;

    if (!currentUnit) {
      const outcome = this.getOutcome();

      if (outcome) {
        this.finishBattle(outcome);
      }

      return;
    }

    const updatedCurrentUnit = currentUnit.isDefending
      ? {
          ...currentUnit,
          isDefending: false,
        }
      : currentUnit;

    if (updatedCurrentUnit !== currentUnit) {
      this.battleRuntime = this.replaceUnit(runtime, updatedCurrentUnit);
    }

    const turnStartResult = this.applyStatusTiming('turnStart', updatedCurrentUnit.unitId);
    const currentUnitAfterStatus = this.currentUnit;
    const outcome = this.getOutcome();

    if (outcome) {
      this.finishBattle(outcome);

      return;
    }

    if (!currentUnitAfterStatus || currentUnitAfterStatus.currentHp <= 0) {
      this.advanceQueue();

      return;
    }

    if (turnStartResult.shouldSkipTurn) {
      this.applyStatusTiming('turnEnd', currentUnitAfterStatus.unitId);

      const skipOutcome = this.getOutcome();

      if (skipOutcome) {
        this.finishBattle(skipOutcome);

        return;
      }

      this.advanceQueue();

      return;
    }

    this.setPhase(updatedCurrentUnit.side === 'enemy' ? 'enemyThinking' : 'playerInput');
  }

  private finishBattle(outcome: BattleOutcome) {
    const runtime = this.requireBattleRuntime();
    const outcomeLog = this.rootStore.combatLogBuilder.createOutcomeEntry(runtime, outcome);
    const rewardBundle = this.collectOutcomeRewards(runtime.templateId, outcome);
    const outcomeEffects = rewardBundle.effects;

    this.battleRuntime = {
      ...runtime,
      phase: outcome,
      turnQueue: [],
      currentUnitId: null,
      selectedAction: null,
      selectedTargetId: null,
      combatLog: [...runtime.combatLog, outcomeLog],
    };
    this.syncAlliesBackToParty();

    if (outcomeEffects.length > 0) {
      this.rootStore.executeEffects(outcomeEffects);
    }

    if (outcome === 'victory') {
      const template = this.rootStore.getBattleTemplateById(runtime.templateId);
      const shouldShowRewardSummary = template?.showRewardSummary ?? false;
      
      if (shouldShowRewardSummary) {
        const rewardSummary = this.rootStore.progression.awardBattleRewards({
          battleId: runtime.templateId,
          battleTitle: template?.title ?? runtime.templateId,
          recipientUnitIds: runtime.allies.map((unit) => unit.unitId),
          experience: rewardBundle.experience,
          loot: rewardBundle.loot,
        });

        if (rewardSummary) {
          this.rootStore.ui.openModal('battle-rewards');
        }
      }
    }
  }

  private collectOutcomeRewards(templateId: string, outcome: BattleOutcome): BattleRewardBundle {
    const template = this.rootStore.getBattleTemplateById(templateId);

    if (!template) {
      return {
        experience: 0,
        loot: [],
        effects: [],
      };
    }

    if (outcome === 'defeat') {
      return {
        experience: 0,
        loot: [],
        effects: [...(template.defeatEffects ?? [])],
      };
    }

    const loot = new Map<string, number>();
    let experience = template.experienceReward ?? 0;
    const rewardEffects = template.enemyUnitIds.flatMap((enemyTemplateId) => {
      const enemyTemplate = this.rootStore.getEnemyTemplateById(enemyTemplateId);

      if (!enemyTemplate) {
        return [];
      }

      experience += enemyTemplate.experienceReward ?? 0;

      (enemyTemplate.rewardItemIds ?? []).forEach((itemId) => {
        loot.set(itemId, (loot.get(itemId) ?? 0) + 1);
      });
      this.rootStore.lootTableResolver
        .resolve(
          enemyTemplate.rewardTableId ? this.rootStore.getLootTableById(enemyTemplate.rewardTableId) : null,
        )
        .forEach((entry) => {
          loot.set(entry.itemId, (loot.get(entry.itemId) ?? 0) + entry.quantity);
        });

      return [...(enemyTemplate.rewardEffects ?? [])];
    });
    this.rootStore.lootTableResolver
      .resolve(template.rewardTableId ? this.rootStore.getLootTableById(template.rewardTableId) : null)
      .forEach((entry) => {
        loot.set(entry.itemId, (loot.get(entry.itemId) ?? 0) + entry.quantity);
      });

    const lootEffects = Array.from(loot.entries()).map(
      ([itemId, quantity]): GameEffect => ({
        type: 'giveItem',
        itemId,
        quantity,
      }),
    );

    return {
      experience,
      loot: Array.from(loot.entries()).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      })),
      effects: [...(template.victoryEffects ?? []), ...rewardEffects, ...lootEffects],
    };
  }

  private syncAlliesBackToParty() {
    this.allies.forEach((unit) => {
      this.rootStore.party.upsertUnitState(toPartyUnitRuntime(unit));
    });
  }

  private replaceUnit(runtime: BattleRuntime, updatedUnit: BattleUnitRuntime) {
    if (updatedUnit.side === 'ally') {
      return {
        ...runtime,
        allies: runtime.allies.map((unit) =>
          unit.unitId === updatedUnit.unitId ? cloneBattleUnit(updatedUnit) : cloneBattleUnit(unit),
        ),
        enemies: runtime.enemies.map(cloneBattleUnit),
      };
    }

    return {
      ...runtime,
      allies: runtime.allies.map(cloneBattleUnit),
      enemies: runtime.enemies.map((unit) =>
        unit.unitId === updatedUnit.unitId ? cloneBattleUnit(updatedUnit) : cloneBattleUnit(unit),
      ),
    };
  }

  private setPhase(phase: BattlePhase) {
    const runtime = this.requireBattleRuntime();

    this.battleRuntime = {
      ...runtime,
      phase,
    };
  }

  private getOutcome(): BattleOutcome | null {
    if (this.livingEnemies.length === 0 && this.livingAllies.length === 0) {
      return 'defeat';
    }

    if (this.livingEnemies.length === 0 && this.allies.length > 0) {
      return 'victory';
    }

    if (this.livingAllies.length === 0 && this.enemies.length > 0) {
      return 'defeat';
    }

    return null;
  }

  private getUnitById(unitId: string) {
    return this.allUnits.find((unit) => unit.unitId === unitId) ?? null;
  }

  private resolveScopeUnitIds(scope: EffectTargetScope, targetId?: string) {
    if (scope === 'unit') {
      return targetId ? this.allUnits.filter((unit) => unit.unitId === targetId).map((unit) => unit.unitId) : [];
    }

    if (scope === 'player') {
      const playerUnitId = this.rootStore.party.playerUnitId;

      return playerUnitId ? this.allies.filter((unit) => unit.unitId === playerUnitId).map((unit) => unit.unitId) : [];
    }

    return this.allies.map((unit) => unit.unitId);
  }

  private applyStatusTiming(timing: 'turnStart' | 'turnEnd', unitId: string) {
    const runtime = this.requireBattleRuntime();
    const result =
      timing === 'turnStart'
        ? this.rootStore.statusProcessor.processTurnStart(runtime, unitId)
        : this.rootStore.statusProcessor.processTurnEnd(runtime, unitId);

    this.battleRuntime = {
      ...result.runtime,
      combatLog: [...result.runtime.combatLog, ...result.logEntries],
    };
    this.syncAlliesBackToParty();

    return result;
  }

  private requireBattleRuntime() {
    if (!this.battleRuntime) {
      throw new Error('No active battle is currently running.');
    }

    return this.battleRuntime;
  }

  private requireCurrentUnit() {
    const currentUnit = this.currentUnit;

    if (!currentUnit) {
      throw new Error('The battle does not currently have an active unit.');
    }

    return currentUnit;
  }

  private selectionRequiresTarget(selection: BattleActionSelection | null) {
    if (!selection) {
      return false;
    }

    if (selection.type === 'skill') {
      return skillUsesTarget(selection.skillId ? this.rootStore.getSkillById(selection.skillId) ?? null : null);
    }

    if (actionUsesTarget(selection.type)) {
      return true;
    }

    if (selection.type !== 'item') {
      return false;
    }

    return this.itemRequiresTarget(
      selection.itemId ? this.rootStore.inventory.inspectItem(selection.itemId) : null,
    );
  }

  private itemRequiresTarget(item: ItemData | null) {
    return item?.targetScope === 'ally' || item?.targetScope === 'enemy';
  }
}
