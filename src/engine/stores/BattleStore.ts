import { makeAutoObservable } from 'mobx';

import { actionUsesTarget } from '@engine/formulas/damage';
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
import type { EffectTargetScope, GameEffect, ResourceKey } from '@engine/types/effects';
import type { ScreenId } from '@engine/types/ui';
import type { BattleUnitRuntime } from '@engine/types/unit';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export class BattleStore {
  readonly rootStore: GameRootStore;

  battleRuntime: BattleRuntime | null = null;
  returnScreenId: ScreenId | null = null;

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

  startBattle(templateId: string) {
    this.rootStore.assertBattleTemplateValid(templateId);
    this.returnScreenId = this.rootStore.ui.activeScreen === 'battle' ? null : this.rootStore.ui.activeScreen;
    this.rootStore.combatLogBuilder.reset();
    this.battleRuntime = cloneBattleRuntime(this.rootStore.battleResolver.createBattleRuntime(templateId));
    this.rootStore.ui.setScreen('battle');
    this.beginCurrentTurn();

    return this.battleRuntime;
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

    const finalizedSelection = actionUsesTarget(selection.type)
      ? (() => {
          const resolvedTargetId =
            selection.targetId ?? runtime.selectedTargetId ?? this.getAvailableTargets()[0]?.unitId;

          return resolvedTargetId
            ? {
                ...selection,
                targetId: resolvedTargetId,
              }
            : selection;
        })()
      : selection;

    if (actionUsesTarget(finalizedSelection.type) && !finalizedSelection.targetId) {
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

  endBattle() {
    const shouldRestoreScreen = this.rootStore.ui.activeScreen === 'battle';
    const returnScreenId = this.returnScreenId;

    this.battleRuntime = null;
    this.returnScreenId = null;

    if (shouldRestoreScreen) {
      this.rootStore.ui.setScreen(returnScreenId ?? (this.rootStore.world.hasActiveLocation ? 'world' : 'home'));
    }
  }

  reset() {
    this.battleRuntime = null;
    this.returnScreenId = null;
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
    const outcomeEffects = this.collectOutcomeEffects(runtime.templateId, outcome);

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
  }

  private collectOutcomeEffects(templateId: string, outcome: BattleOutcome): GameEffect[] {
    const template = this.rootStore.getBattleTemplateById(templateId);

    if (!template) {
      return [];
    }

    if (outcome === 'defeat') {
      return [...(template.defeatEffects ?? [])];
    }

    const rewardEffects = template.enemyUnitIds.flatMap((enemyTemplateId) => {
      const enemyTemplate = this.rootStore.getEnemyTemplateById(enemyTemplateId);

      if (!enemyTemplate) {
        return [];
      }

      const itemEffects = (enemyTemplate.rewardItemIds ?? []).map(
        (itemId): GameEffect => ({
          type: 'giveItem',
          itemId,
          quantity: 1,
        }),
      );

      return [...(enemyTemplate.rewardEffects ?? []), ...itemEffects];
    });

    return [...(template.victoryEffects ?? []), ...rewardEffects];
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
}
