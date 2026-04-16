import {
  calculateAttackDamage,
  calculateSkillDamage,
  resolveActionDamageKind,
} from '@engine/formulas/damage';
import { buildBattleUnitRuntime } from '@engine/formulas/runtimeUnits';
import { calculateCritChance, calculateHitChance } from '@engine/formulas/hitChance';
import {
  cloneBattleRuntime,
  cloneBattleUnit,
  cloneBattleUnits,
} from '@engine/systems/battle/battleRuntimeCloning';
import { CombatLogBuilder } from '@engine/systems/battle/CombatLogBuilder';
import { TurnQueueBuilder } from '@engine/systems/battle/TurnQueueBuilder';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  BattleActionSelection,
  BattleResolutionResult,
  BattleRuntime,
  BattleTemplate,
} from '@engine/types/battle';
import type { ItemTargetScope } from '@engine/types/item';
import type { SkillData, SkillStatusApplication } from '@engine/types/skill';
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
        return this.resolveItem(runtime, selection, source);
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

  private resolveItem(
    runtime: BattleRuntime,
    selection: BattleActionSelection,
    source: BattleUnitRuntime,
  ): BattleResolutionResult {
    const item = selection.itemId ? this.rootStore.inventory.inspectItem(selection.itemId) : null;

    if (!item) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            `${source.name} reaches for an item that is no longer there.`,
          ),
        ],
      };
    }

    const target =
      item.targetScope === 'none' || item.targetScope === undefined
        ? null
        : this.resolveItemTarget(runtime, source, item.targetScope, selection.targetId);

    if (this.itemRequiresTarget(item.targetScope) && !target) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            `${source.name} has no valid target for ${item.name}.`,
          ),
        ],
      };
    }

    const beforeTarget = target ? this.getUnitById(runtime, target.unitId) : null;
    const beforeHp = beforeTarget?.currentHp ?? null;
    const beforeMana = beforeTarget?.currentMana ?? null;
    const useResult = this.rootStore.inventory.useItem(item.id, {
      sourceUnitId: source.unitId,
      ...(target ? { targetUnitId: target.unitId } : {}),
    });

    if (!useResult.consumed) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            useResult.message ?? `${source.name} cannot use ${item.name} right now.`,
          ),
        ],
      };
    }

    const runtimeAfterItem =
      this.rootStore.battle.battleRuntime?.battleId === runtime.battleId
        ? this.rootStore.battle.battleRuntime
        : runtime;
    const updatedTarget =
      target && runtimeAfterItem
        ? [...runtimeAfterItem.allies, ...runtimeAfterItem.enemies].find(
            (unit) => unit.unitId === target.unitId,
          ) ?? null
        : null;
    const logEntries = [
      this.combatLogBuilder.createActionEntry(
        runtime,
        target
          ? `${source.name} uses ${item.name} on ${target.name}.`
          : `${source.name} uses ${item.name}.`,
        source.unitId,
        target?.unitId,
      ),
    ];
    const healedAmount =
      updatedTarget && beforeHp !== null ? Math.max(0, updatedTarget.currentHp - beforeHp) : 0;
    const restoredMana =
      updatedTarget && beforeMana !== null ? Math.max(0, updatedTarget.currentMana - beforeMana) : 0;
    const damageDealt =
      updatedTarget && beforeHp !== null ? Math.max(0, beforeHp - updatedTarget.currentHp) : 0;
    const defeatedUnitIds = updatedTarget && updatedTarget.currentHp === 0 ? [updatedTarget.unitId] : [];

    if (updatedTarget && healedAmount > 0) {
      logEntries.push(
        this.combatLogBuilder.createHealEntry(
          runtime,
          `${updatedTarget.name} recovers ${healedAmount} health.`,
          source.unitId,
          updatedTarget.unitId,
          healedAmount,
        ),
      );
    }

    if (updatedTarget && restoredMana > 0) {
      logEntries.push(
        this.combatLogBuilder.createStatusEntry(
          runtime,
          `${updatedTarget.name} recovers ${restoredMana} mana.`,
          source.unitId,
          updatedTarget.unitId,
          restoredMana,
        ),
      );
    }

    if (updatedTarget && damageDealt > 0) {
      logEntries.push(
        this.combatLogBuilder.createDamageEntry(
          runtime,
          `${updatedTarget.name} takes ${damageDealt} damage.`,
          source.unitId,
          updatedTarget.unitId,
          damageDealt,
        ),
      );
    }

    if (updatedTarget?.currentHp === 0) {
      logEntries.push(
        this.combatLogBuilder.createSystemEntry(runtime, `${updatedTarget.name} falls in battle.`),
      );
    }

    return {
      selection: {
        ...selection,
        ...(target ? { targetId: target.unitId } : {}),
      },
      allies: cloneBattleUnits(runtimeAfterItem.allies),
      enemies: cloneBattleUnits(runtimeAfterItem.enemies),
      defeatedUnitIds,
      damageDealt,
      logEntries,
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
    const skill = this.resolveSkillForUnit(source, skillId);

    if (skillId === 'basic-attack') {
      return this.resolveTargetedDamageAction(runtime, { ...selection, skillId }, source, {
        actionMessage: `${source.name} uses ${skill?.name ?? 'Basic Attack'} on`,
        damageCalculator: calculateAttackDamage,
      });
    }

    if (skill?.targetPattern === 'all-enemies') {
      return this.resolveMultiTargetDamageAction(runtime, { ...selection, skillId }, source, {
        actionMessage: `${source.name} unleashes ${skill.name}.`,
        damageCalculator: (attacker, target, isCritical) =>
          calculateSkillDamage(attacker, target, skill, isCritical),
        skill,
      });
    }

    return this.resolveTargetedDamageAction(runtime, { ...selection, skillId }, source, {
      actionMessage: `${source.name} channels ${skill?.name ?? skillId} into`,
      damageCalculator: (attacker, target, isCritical) =>
        calculateSkillDamage(attacker, target, skill, isCritical),
      skill,
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
      skill?: SkillData | null;
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

    const damageKind = resolveActionDamageKind(selection, options.skill ?? null);
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
    let nextRuntime = {
      ...runtime,
      ...this.replaceUnit(runtime, updatedTarget),
    };
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

    if (updatedTarget.currentHp > 0 && options.skill?.statusApplications?.length) {
      const statusResult = this.applySkillStatusApplications(
        nextRuntime,
        source,
        updatedTarget.unitId,
        options.skill.statusApplications,
      );

      nextRuntime = statusResult.runtime;
      logEntries.push(...statusResult.logEntries);
    }

    return {
      selection: {
        ...selection,
        targetId: target.unitId,
      },
      allies: cloneBattleUnits(nextRuntime.allies),
      enemies: cloneBattleUnits(nextRuntime.enemies),
      defeatedUnitIds,
      damageDealt,
      didHit,
      didCrit,
      logEntries,
    };
  }

  private resolveMultiTargetDamageAction(
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
      skill?: SkillData | null;
    },
  ): BattleResolutionResult {
    const targets = this.resolveTargets(runtime, source, options.skill);

    if (targets.length === 0) {
      return {
        selection,
        allies: cloneBattleUnits(runtime.allies),
        enemies: cloneBattleUnits(runtime.enemies),
        defeatedUnitIds: [],
        logEntries: [
          this.combatLogBuilder.createSystemEntry(
            runtime,
            `${source.name} has no valid targets for ${selection.type}.`,
          ),
        ],
      };
    }

    const damageKind = resolveActionDamageKind(selection, options.skill ?? null);
    const logEntries = [
      this.combatLogBuilder.createActionEntry(runtime, options.actionMessage, source.unitId),
    ];
    const defeatedUnitIds: string[] = [];
    let totalDamageDealt = 0;
    let didHit = false;
    let didCrit = false;
    let nextRuntime = cloneBattleRuntime(runtime);

    targets.forEach((originalTarget) => {
      const target = this.getUnitById(nextRuntime, originalTarget.unitId);

      if (!target || target.currentHp <= 0) {
        return;
      }

      const targetDidHit =
        this.random() <=
        this.rootStore.statusProcessor.getAdjustedHitChance(
          calculateHitChance(source, target),
          source,
          target,
        );

      if (!targetDidHit) {
        logEntries.push(
          this.combatLogBuilder.createMissEntry(
            runtime,
            `${source.name} misses ${target.name}.`,
            source.unitId,
            target.unitId,
          ),
        );

        return;
      }

      didHit = true;
      const targetDidCrit =
        this.random() <=
        this.rootStore.statusProcessor.getAdjustedCritChance(
          calculateCritChance(source, target),
          source,
        );
      const damageDealt = this.rootStore.statusProcessor.getAdjustedDamage(
        options.damageCalculator(source, target, targetDidCrit),
        source,
        target,
        damageKind,
      );
      const updatedTarget: BattleUnitRuntime = {
        ...cloneBattleUnit(target),
        currentHp: Math.max(0, target.currentHp - damageDealt),
      };

      if (targetDidCrit) {
        didCrit = true;
        logEntries.push(
          this.combatLogBuilder.createSystemEntry(runtime, `${source.name} lands a critical hit on ${target.name}.`),
        );
      }

      totalDamageDealt += damageDealt;
      logEntries.push(
        this.combatLogBuilder.createDamageEntry(
          runtime,
          `${target.name} takes ${damageDealt} damage.`,
          source.unitId,
          target.unitId,
          damageDealt,
        ),
      );

      nextRuntime = {
        ...nextRuntime,
        ...this.replaceUnit(nextRuntime, updatedTarget),
      };

      if (updatedTarget.currentHp === 0) {
        defeatedUnitIds.push(updatedTarget.unitId);
        logEntries.push(
          this.combatLogBuilder.createSystemEntry(runtime, `${target.name} falls in battle.`),
        );
      }

      if (updatedTarget.currentHp > 0 && options.skill?.statusApplications?.length) {
        const statusResult = this.applySkillStatusApplications(
          nextRuntime,
          source,
          updatedTarget.unitId,
          options.skill.statusApplications,
        );

        nextRuntime = statusResult.runtime;
        logEntries.push(...statusResult.logEntries);
      }
    });

    return {
      selection,
      allies: cloneBattleUnits(nextRuntime.allies),
      enemies: cloneBattleUnits(nextRuntime.enemies),
      defeatedUnitIds,
      damageDealt: totalDamageDealt,
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
    const targets = this.getOpposingLivingUnits(runtime, source);

    if (targets.length === 0) {
      return null;
    }

    if (!targetId) {
      return targets[0] ?? null;
    }

    return targets.find((unit) => unit.unitId === targetId) ?? null;
  }

  private resolveTargets(
    runtime: BattleRuntime,
    source: BattleUnitRuntime,
    skill: SkillData | null | undefined,
  ) {
    switch (skill?.targetPattern) {
      case 'all-enemies':
        return this.getOpposingLivingUnits(runtime, source);
      case 'single-ally':
      case 'self':
        return (source.side === 'ally' ? runtime.allies : runtime.enemies).filter(
          (unit) => unit.currentHp > 0,
        );
      case 'single-enemy':
      default:
        return this.getOpposingLivingUnits(runtime, source);
    }
  }

  private resolveItemTarget(
    runtime: BattleRuntime,
    source: BattleUnitRuntime,
    targetScope: ItemTargetScope,
    targetId?: string,
  ) {
    if (targetScope === 'self') {
      return source;
    }

    if (targetScope === 'ally') {
      const targets = (source.side === 'ally' ? runtime.allies : runtime.enemies).filter(
        (unit) => unit.currentHp > 0,
      );

      if (!targetId) {
        return targets[0] ?? null;
      }

      return targets.find((unit) => unit.unitId === targetId) ?? null;
    }

    if (targetScope === 'enemy') {
      return this.resolveTarget(runtime, source, targetId);
    }

    return null;
  }

  private itemRequiresTarget(targetScope: ItemTargetScope | undefined) {
    return targetScope === 'ally' || targetScope === 'enemy';
  }

  private resolveSkillForUnit(source: BattleUnitRuntime, skillId: string) {
    const skill = this.rootStore.getSkillById(skillId);

    if (!skill) {
      return null;
    }

    const skillRankBonus = source.skillRanks[skillId] ?? 0;

    return {
      ...skill,
      basePower: (skill.basePower ?? 0) + skillRankBonus,
    };
  }

  private getOpposingLivingUnits(runtime: BattleRuntime, source: BattleUnitRuntime) {
    return (source.side === 'ally' ? runtime.enemies : runtime.allies).filter(
      (unit) => unit.currentHp > 0,
    );
  }

  private applySkillStatusApplications(
    runtime: BattleRuntime,
    source: BattleUnitRuntime,
    targetUnitId: string,
    statusApplications: SkillStatusApplication[],
  ) {
    let nextRuntime = cloneBattleRuntime(runtime);
    const logEntries: BattleResolutionResult['logEntries'] = [];

    statusApplications.forEach((application) => {
      if (this.random() > application.chance) {
        return;
      }

      const result = this.rootStore.statusProcessor.applyStatusToRuntime(
        nextRuntime,
        targetUnitId,
        application.statusType,
        {
          sourceUnitId: source.unitId,
          ...(application.duration !== undefined ? { remainingDuration: application.duration } : {}),
          ...(application.potency !== undefined ? { potency: application.potency } : {}),
          ...(application.stacks !== undefined ? { stacks: application.stacks } : {}),
        },
      );

      if (!result.applied) {
        return;
      }

      nextRuntime = result.runtime;
      const target = this.getUnitById(nextRuntime, targetUnitId);

      if (!target) {
        return;
      }

      logEntries.push(
        this.combatLogBuilder.createStatusEntry(
          runtime,
          `${target.name} is afflicted with ${application.statusType}.`,
          source.unitId,
          target.unitId,
        ),
      );
    });

    return {
      runtime: nextRuntime,
      logEntries,
    };
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
