import {
  calculateAttackDamage,
  calculateSkillDamage,
  resolveActionDamageKind,
} from '@engine/formulas/damage';
import { buildBattleUnitRuntime } from '@engine/formulas/runtimeUnits';
import { calculateCritChance, calculateHitChance } from '@engine/formulas/hitChance';
import { cloneBattleUnit, cloneBattleUnits } from '@engine/systems/battle/battleRuntimeCloning';
import { CombatLogBuilder } from '@engine/systems/battle/CombatLogBuilder';
import { TurnQueueBuilder } from '@engine/systems/battle/TurnQueueBuilder';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  BattleActionSelection,
  BattleResolutionResult,
  BattleRuntime,
  BattleTemplate,
} from '@engine/types/battle';
import type { BattleUnitRuntime, PartyUnitRuntime } from '@engine/types/unit';

type RandomSource = () => number;

export class BattleResolver {
  readonly rootStore: GameRootStore;
  readonly turnQueueBuilder: TurnQueueBuilder;
  readonly combatLogBuilder: CombatLogBuilder;

  private readonly random: RandomSource;
  private runtimeSequence = 0;

  constructor(
    rootStore: GameRootStore,
    turnQueueBuilder: TurnQueueBuilder,
    combatLogBuilder: CombatLogBuilder,
    random: RandomSource = Math.random,
  ) {
    this.rootStore = rootStore;
    this.turnQueueBuilder = turnQueueBuilder;
    this.combatLogBuilder = combatLogBuilder;
    this.random = random;
  }

  createBattleRuntime(templateId: string): BattleRuntime {
    const template = this.rootStore.getBattleTemplateById(templateId);

    if (!template) {
      throw new Error(`Battle template "${templateId}" was not found.`);
    }

    const allies = this.createAllies(template);
    const enemies = this.createEnemies(template);
    const turnQueue = this.turnQueueBuilder.build([...allies, ...enemies]);
    const runtime: BattleRuntime = {
      battleId: `battle-${template.id}-${++this.runtimeSequence}`,
      templateId: template.id,
      phase: 'initializing',
      round: 1,
      turnQueue,
      currentUnitId: turnQueue[0] ?? null,
      allies,
      enemies,
      combatLog: [],
      selectedAction: null,
      selectedTargetId: null,
    };

    return {
      ...runtime,
      combatLog: [
        this.combatLogBuilder.createSystemEntry(
          runtime,
          template.title ? `Battle begins: ${template.title}.` : `Battle begins: ${template.id}.`,
        ),
      ],
    };
  }

  resolveAction(runtime: BattleRuntime, selection: BattleActionSelection): BattleResolutionResult {
    const source = this.getUnitById(runtime, selection.sourceUnitId);

    if (!source || source.currentHp <= 0) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            `Action skipped because ${selection.sourceUnitId} is unavailable.`,
          ),
        ],
      };
    }

    switch (selection.type) {
      case 'defend':
        return this.resolveDefend(runtime, selection, source);
      case 'item':
        return this.resolveItemPlaceholder(runtime, selection, source);
      case 'skill':
        return this.resolveSkill(runtime, selection, source);
      case 'attack':
      default:
        return this.resolveAttack(runtime, selection, source);
    }
  }

  private createAllies(template: BattleTemplate) {
    if (this.rootStore.party.members.length === 0) {
      const seededPartyIds =
        template.allyUnitIds && template.allyUnitIds.length > 0
          ? [...template.allyUnitIds]
          : [...this.rootStore.defaultPartyInstanceIds];

      if (seededPartyIds.length > 0) {
        this.rootStore.party.loadParty(seededPartyIds);
      }
    }

    if (this.rootStore.party.activeUnits.length === 0 && this.rootStore.party.members.length > 0) {
      this.rootStore.party.setActiveParty(this.rootStore.party.rosterIds);
    }

    const activeUnits = this.rootStore.party.activeUnits;

    if (activeUnits.length === 0) {
      throw new Error(`Battle "${template.id}" cannot start without an active party.`);
    }

    return activeUnits.map((unit) => this.toBattleUnit(unit));
  }

  private createEnemies(template: BattleTemplate) {
    const enemyCounts = new Map<string, number>();

    return template.enemyUnitIds.map((enemyTemplateId) => {
      const enemyTemplate = this.rootStore.getEnemyTemplateById(enemyTemplateId);

      if (!enemyTemplate) {
        throw new Error(`Enemy template "${enemyTemplateId}" was not found.`);
      }

      const nextCount = (enemyCounts.get(enemyTemplateId) ?? 0) + 1;

      enemyCounts.set(enemyTemplateId, nextCount);

      return buildBattleUnitRuntime(enemyTemplate, {
        runtimeId: nextCount === 1 ? enemyTemplateId : `${enemyTemplateId}-${nextCount}`,
        side: 'enemy',
        level: enemyTemplate.level ?? 1,
      });
    });
  }

  private toBattleUnit(unit: PartyUnitRuntime): BattleUnitRuntime {
    return {
      ...cloneBattleUnit({
        ...unit,
        side: 'ally',
      }),
      side: 'ally',
    };
  }

  private resolveDefend(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
  ): BattleResolutionResult {
    const updatedSource: BattleUnitRuntime = {
      ...cloneBattleUnit(source),
      isDefending: true,
    };
    const { allies, enemies } = this.replaceUnit(runtime, updatedSource);

    return {
      selection,
      allies,
      enemies,
      defeatedUnitIds: [],
      logEntries: [
        this.combatLogBuilder.createActionEntry(
          runtime,
          `${source.name} braces for impact.`,
          source.unitId,
        ),
      ],
    };
  }

  private resolveItemPlaceholder(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
  ): BattleResolutionResult {
    return {
      selection,
      allies: cloneBattleUnits(runtime.allies),
      enemies: cloneBattleUnits(runtime.enemies),
      defeatedUnitIds: [],
      logEntries: [
        this.combatLogBuilder.createActionEntry(
          runtime,
          `${source.name} reaches for an item, but item actions are not implemented yet.`,
          source.unitId,
        ),
      ],
    };
  }

  private resolveAttack(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
  ): BattleResolutionResult {
    return this.resolveTargetedDamageAction(runtime, selection, source, {
      actionMessage: `${source.name} attacks`,
      damageCalculator: calculateAttackDamage,
    });
  }

  private resolveSkill(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
  ): BattleResolutionResult {
    const skillId = selection.skillId ?? source.skillIds[0] ?? 'basic-attack';

    if (skillId === 'basic-attack') {
      return this.resolveTargetedDamageAction(runtime, { ...selection, skillId }, source, {
        actionMessage: `${source.name} uses Basic Attack on`,
        damageCalculator: calculateAttackDamage,
      });
    }

    return this.resolveTargetedDamageAction(runtime, { ...selection, skillId }, source, {
      actionMessage: `${source.name} channels ${skillId} into`,
      damageCalculator: calculateSkillDamage,
    });
  }

  private resolveTargetedDamageAction(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
    options: {
      actionMessage: string;
      damageCalculator: (
        attacker: BattleUnitRuntime,
        target: BattleUnitRuntime,
        isCritical?: boolean,
      ) => number;
    },
  ): BattleResolutionResult {
    const target = this.resolveTarget(runtime, source, selection.targetId);

    if (!target) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            `${source.name} has no valid target for ${selection.type}.`,
          ),
        ],
      };
    }

    const damageKind = resolveActionDamageKind(selection);
    const didHit =
      this.random() <=
      this.rootStore.statusProcessor.getAdjustedHitChance(
        calculateHitChance(source, target),
        source,
        target,
      );
    const logEntries = [
      this.combatLogBuilder.createActionEntry(
        runtime,
        `${options.actionMessage} ${target.name}.`,
        source.unitId,
        target.unitId,
      ),
    ];

    if (!didHit) {
      return {
        selection: {
          ...selection,
          targetId: target.unitId,
        },
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        didHit,
        logEntries: [
          ...logEntries,
          this.combatLogBuilder.createMissEntry(
            runtime,
            `${source.name} misses ${target.name}.`,
            source.unitId,
            target.unitId,
          ),
        ],
      };
    }

    const didCrit =
      this.random() <=
      this.rootStore.statusProcessor.getAdjustedCritChance(
        calculateCritChance(source, target),
        source,
      );
    const damageDealt = this.rootStore.statusProcessor.getAdjustedDamage(
      options.damageCalculator(source, target, didCrit),
      source,
      target,
      damageKind,
    );
    const updatedTarget: BattleUnitRuntime = {
      ...cloneBattleUnit(target),
      currentHp: Math.max(0, target.currentHp - damageDealt),
    };
    const { allies, enemies } = this.replaceUnit(runtime, updatedTarget);
    const defeatedUnitIds = updatedTarget.currentHp === 0 ? [updatedTarget.unitId] : [];

    if (didCrit) {
      logEntries.push(
        this.combatLogBuilder.createSystemEntry(runtime, `${source.name} lands a critical hit.`),
      );
    }

    logEntries.push(
      this.combatLogBuilder.createDamageEntry(
        runtime,
        `${target.name} takes ${damageDealt} damage.`,
        source.unitId,
        target.unitId,
        damageDealt,
      ),
    );

    if (updatedTarget.currentHp === 0) {
      logEntries.push(
        this.combatLogBuilder.createSystemEntry(runtime, `${target.name} falls in battle.`),
      );
    }

    return {
      selection: {
        ...selection,
        targetId: target.unitId,
      },
      allies,
      enemies,
      defeatedUnitIds,
      damageDealt,
      didHit,
      didCrit,
      logEntries,
    };
  }

  private resolveTarget(
    runtime: BattleRuntime,
    source: BattleUnitRuntime,
    targetId?: string,
  ): BattleUnitRuntime | null {
    const targets = (source.side === 'ally' ? runtime.enemies : runtime.allies).filter(
      (unit) => unit.currentHp > 0,
    );

    if (targets.length === 0) {
      return null;
    }

    if (!targetId) {
      return targets[0] ?? null;
    }

    return targets.find((unit) => unit.unitId === targetId) ?? null;
  }

  private replaceUnit(runtime: BattleRuntime, updatedUnit: BattleUnitRuntime) {
    if (updatedUnit.side === 'ally') {
      return {
        allies: runtime.allies.map((unit) =>
          unit.unitId === updatedUnit.unitId ? updatedUnit : cloneBattleUnit(unit),
        ),
        enemies: cloneBattleUnits(runtime.enemies),
      };
    }

    return {
      allies: cloneBattleUnits(runtime.allies),
      enemies: runtime.enemies.map((unit) =>
        unit.unitId === updatedUnit.unitId ? updatedUnit : cloneBattleUnit(unit),
      ),
    };
  }

  private getUnitById(runtime: BattleRuntime, unitId: string) {
    return [...runtime.allies, ...runtime.enemies].find((unit) => unit.unitId === unitId) ?? null;
  }
}
