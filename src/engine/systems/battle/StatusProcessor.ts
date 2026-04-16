import {
  applyNumericTagModifiers,
  getBooleanTagToggle,
  getNumericTagModifierSummary,
  getStatusImmunitiesForTags,
} from '@engine/registries/tagRulesRegistry';
import { createStatusEffectInstance } from '@engine/registries/statusDefinitionsRegistry';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { BattleRuntime } from '@engine/types/battle';
import type { DamageKind } from '@engine/types/combat';
import type {
  StatusCategory,
  StatusEffectInstance,
  StatusTickTiming,
  StatusType,
} from '@engine/types/status';
import type { TagId } from '@engine/types/tags';
import type { BattleUnitRuntime, PartyUnitRuntime } from '@engine/types/unit';

interface StatusTimingResult {
  runtime: BattleRuntime;
  logEntries: ReturnType<GameRootStore['combatLogBuilder']['createEntry']>[];
  shouldSkipTurn: boolean;
}

interface StatusApplicationResult<TUnit extends { statuses: StatusEffectInstance[]; tags: TagId[] }> {
  unit: TUnit;
  applied: boolean;
  reason?: string;
}

interface ApplyStatusOptions {
  sourceUnitId?: string;
  potency?: number;
  remainingDuration?: number;
  stacks?: number;
}

interface CleanseStatusOptions {
  onlyNegative?: boolean;
  category?: StatusCategory;
  limit?: number;
}

function cloneStatus(status: StatusEffectInstance): StatusEffectInstance {
  return {
    ...status,
    ...(status.grantedTags ? { grantedTags: [...status.grantedTags] } : {}),
    ...(status.metadata ? { metadata: { ...status.metadata } } : {}),
  };
}

function cloneStatuses(statuses: readonly StatusEffectInstance[]) {
  return statuses.map(cloneStatus);
}

function cloneBattleUnit(unit: BattleUnitRuntime): BattleUnitRuntime {
  return {
    ...unit,
    baseStats: { ...unit.baseStats },
    derivedStats: { ...unit.derivedStats },
    tags: [...unit.tags],
    statuses: cloneStatuses(unit.statuses),
    skillIds: [...unit.skillIds],
    skillRanks: { ...(unit.skillRanks ?? {}) },
  };
}

function cloneBattleRuntime(runtime: BattleRuntime): BattleRuntime {
  return {
    ...runtime,
    turnQueue: [...runtime.turnQueue],
    allies: runtime.allies.map(cloneBattleUnit),
    enemies: runtime.enemies.map(cloneBattleUnit),
    combatLog: runtime.combatLog.map((entry) => ({ ...entry })),
    selectedAction: runtime.selectedAction ? { ...runtime.selectedAction } : null,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundCombatValue(value: number) {
  return Math.max(0, Math.round(value));
}

export class StatusProcessor {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  getEffectiveTags(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }) {
    return Array.from(
      new Set([
        ...unit.tags,
        ...unit.statuses.flatMap((status) => {
          const definition = this.rootStore.statusDefinitionsRegistry[status.type];

          return [...(definition?.grantsTags ?? []), ...(status.grantedTags ?? [])];
        }),
      ]),
    );
  }

  hasTag(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }, tag: TagId) {
    return this.getEffectiveTags(unit).includes(tag);
  }

  canUnitAct(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }) {
    return getBooleanTagToggle(this.getEffectiveTags(unit), 'canAct') ?? true;
  }

  canReceiveHealing(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }) {
    return getBooleanTagToggle(this.getEffectiveTags(unit), 'canReceiveHealing') ?? true;
  }

  getAdjustedInitiative(unit: BattleUnitRuntime) {
    return applyNumericTagModifiers(
      unit.derivedStats.initiative,
      this.getEffectiveTags(unit),
      'initiative',
    );
  }

  getAdjustedHitChance(baseChance: number, attacker: BattleUnitRuntime, target: BattleUnitRuntime) {
    const attackerTags = this.getEffectiveTags(attacker);
    const targetTags = this.getEffectiveTags(target);
    const hitChance = applyNumericTagModifiers(baseChance, attackerTags, 'hitChance');
    const evasionSummary = getNumericTagModifierSummary(targetTags, 'evasion');

    return clamp((hitChance - evasionSummary.flat) / evasionSummary.multiplier, 0.05, 0.99);
  }

  getAdjustedCritChance(baseChance: number, attacker: BattleUnitRuntime) {
    return clamp(
      applyNumericTagModifiers(baseChance, this.getEffectiveTags(attacker), 'critChance'),
      0.01,
      0.99,
    );
  }

  getAdjustedDamage(
    baseDamage: number,
    attacker: BattleUnitRuntime,
    target: BattleUnitRuntime,
    damageKind: DamageKind,
  ) {
    const outgoing = applyNumericTagModifiers(
      baseDamage,
      this.getEffectiveTags(attacker),
      'damage',
      { damageKind },
    );
    const incoming = applyNumericTagModifiers(
      outgoing,
      this.getEffectiveTags(target),
      'damageTaken',
      { damageKind },
    );

    return Math.max(1, roundCombatValue(incoming));
  }

  getAdjustedHealing(baseHealing: number, target: BattleUnitRuntime) {
    if (!this.canReceiveHealing(target)) {
      return 0;
    }

    return Math.max(
      0,
      roundCombatValue(
        applyNumericTagModifiers(
          baseHealing,
          this.getEffectiveTags(target),
          'healingReceived',
          { damageKind: 'healing' },
        ),
      ),
    );
  }

  getStatusImmunities(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }) {
    const effectiveTags = this.getEffectiveTags(unit);
    const statusGrantedImmunities = unit.statuses.flatMap((status) => {
      const definition = this.rootStore.statusDefinitionsRegistry[status.type];

      return definition?.grantsImmunities ?? [];
    });

    return new Set([...getStatusImmunitiesForTags(effectiveTags), ...statusGrantedImmunities]);
  }

  canApplyStatus(unit: { tags: TagId[]; statuses: StatusEffectInstance[] }, statusType: StatusType) {
    const definition = this.rootStore.statusDefinitionsRegistry[statusType];

    if (!definition) {
      return false;
    }

    const effectiveTags = this.getEffectiveTags(unit);
    const isBlockedByTag = (definition.blockedByTags ?? []).some((tag) => effectiveTags.includes(tag));

    if (isBlockedByTag) {
      return false;
    }

    return !this.getStatusImmunities(unit).has(statusType);
  }

  applyStatusToUnit<TUnit extends { statuses: StatusEffectInstance[]; tags: TagId[] }>(
    unit: TUnit,
    statusType: StatusType,
    options: ApplyStatusOptions = {},
  ): StatusApplicationResult<TUnit> {
    const definition = this.rootStore.statusDefinitionsRegistry[statusType];

    if (!definition) {
      throw new Error(`Status definition "${statusType}" was not found.`);
    }

    if (!this.canApplyStatus(unit, statusType)) {
      return {
        unit: {
          ...unit,
          statuses: cloneStatuses(unit.statuses),
          tags: [...unit.tags],
        },
        applied: false,
        reason: `${statusType} is blocked by immunity.`,
      };
    }

    const controlResistance =
      definition.category === 'control'
        ? applyNumericTagModifiers(0, this.getEffectiveTags(unit), 'controlResistance')
        : 0;
    const adjustedDuration = Math.max(
      0,
      Math.ceil((options.remainingDuration ?? definition.defaultDuration) * (1 - controlResistance)),
    );

    if (adjustedDuration <= 0) {
      return {
        unit: {
          ...unit,
          statuses: cloneStatuses(unit.statuses),
          tags: [...unit.tags],
        },
        applied: false,
        reason: `${statusType} was fully resisted.`,
      };
    }

    const nextUnit = {
      ...unit,
      statuses: cloneStatuses(unit.statuses),
      tags: [...unit.tags],
    };
    const existingIndex = nextUnit.statuses.findIndex((status) => status.type === statusType);
    const existingStatus = existingIndex >= 0 ? nextUnit.statuses[existingIndex] : undefined;
    const createdStatus = createStatusEffectInstance(statusType, {
      id:
        options.sourceUnitId && existingStatus
          ? existingStatus.id
          : `${statusType}-${nextUnit.statuses.length + 1}`,
      ...(options.sourceUnitId ? { sourceUnitId: options.sourceUnitId } : {}),
      ...(options.potency !== undefined ? { potency: options.potency } : {}),
      remainingDuration: adjustedDuration,
      stacks: options.stacks ?? 1,
    });

    if (!existingStatus) {
      nextUnit.statuses.push(createdStatus);

      return {
        unit: nextUnit,
        applied: true,
      };
    }

    switch (definition.stackPolicy) {
      case 'ignore':
        return {
          unit: nextUnit,
          applied: false,
          reason: `${statusType} is already active.`,
        };
      case 'replace':
        nextUnit.statuses[existingIndex] = createdStatus;
        break;
      case 'refresh':
        nextUnit.statuses[existingIndex] = {
          ...existingStatus,
          remainingDuration: adjustedDuration,
          ...(createdStatus.potency !== undefined
            ? { potency: createdStatus.potency }
            : existingStatus.potency !== undefined
              ? { potency: existingStatus.potency }
              : {}),
          ...(createdStatus.grantedTags
            ? { grantedTags: createdStatus.grantedTags }
            : existingStatus.grantedTags
              ? { grantedTags: existingStatus.grantedTags }
              : {}),
        };
        break;
      case 'stack':
        nextUnit.statuses[existingIndex] = {
          ...existingStatus,
          remainingDuration: adjustedDuration,
          stacks: definition.maxStacks
            ? Math.min(existingStatus.stacks + (options.stacks ?? 1), definition.maxStacks)
            : existingStatus.stacks + (options.stacks ?? 1),
          ...(createdStatus.potency !== undefined
            ? { potency: createdStatus.potency }
            : existingStatus.potency !== undefined
              ? { potency: existingStatus.potency }
              : {}),
        };
        break;
    }

    return {
      unit: nextUnit,
      applied: true,
    };
  }

  applyStatusToRuntime(
    runtime: BattleRuntime,
    unitId: string,
    statusType: StatusType,
    options: ApplyStatusOptions = {},
  ) {
    const unit = this.getUnitById(runtime, unitId);

    if (!unit) {
      return {
        runtime: cloneBattleRuntime(runtime),
        applied: false,
        reason: `Battle unit "${unitId}" was not found.`,
      };
    }

    const result = this.applyStatusToUnit(unit, statusType, options);

    if (!result.applied) {
      return {
        runtime: cloneBattleRuntime(runtime),
        applied: false,
        reason: result.reason,
      };
    }

    return {
      runtime: this.replaceUnit(runtime, result.unit as BattleUnitRuntime),
      applied: true,
    };
  }

  removeStatusFromUnit<TUnit extends { statuses: StatusEffectInstance[]; tags: TagId[] }>(
    unit: TUnit,
    statusType: StatusType,
  ) {
    const nextUnit = {
      ...unit,
      statuses: cloneStatuses(unit.statuses),
      tags: [...unit.tags],
    };
    const nextStatuses = nextUnit.statuses.filter((status) => status.type !== statusType);

    if (nextStatuses.length === nextUnit.statuses.length) {
      return {
        unit: nextUnit,
        removedCount: 0,
      };
    }

    nextUnit.statuses = nextStatuses;

    return {
      unit: nextUnit,
      removedCount: unit.statuses.length - nextStatuses.length,
    };
  }

  removeStatusFromRuntime(runtime: BattleRuntime, unitId: string, statusType: StatusType) {
    const unit = this.getUnitById(runtime, unitId);

    if (!unit) {
      return {
        runtime: cloneBattleRuntime(runtime),
        removedCount: 0,
      };
    }

    const result = this.removeStatusFromUnit(unit, statusType);

    return {
      runtime:
        result.removedCount > 0
          ? this.replaceUnit(runtime, result.unit as BattleUnitRuntime)
          : cloneBattleRuntime(runtime),
      removedCount: result.removedCount,
    };
  }

  cleanseStatusesFromUnit<TUnit extends { statuses: StatusEffectInstance[]; tags: TagId[] }>(
    unit: TUnit,
    options: CleanseStatusOptions = {},
  ) {
    const nextUnit = {
      ...unit,
      statuses: cloneStatuses(unit.statuses),
      tags: [...unit.tags],
    };
    let removedCount = 0;

    nextUnit.statuses = nextUnit.statuses.filter((status) => {
      const definition = this.rootStore.statusDefinitionsRegistry[status.type];
      const matchesNegative = options.onlyNegative ? definition?.isNegative ?? false : true;
      const matchesCategory = options.category ? definition?.category === options.category : true;
      const underLimit = options.limit === undefined || removedCount < options.limit;
      const shouldRemove = matchesNegative && matchesCategory && underLimit;

      if (shouldRemove) {
        removedCount += 1;
      }

      return !shouldRemove;
    });

    return {
      unit: nextUnit,
      removedCount,
    };
  }

  cleanseStatusesFromRuntime(
    runtime: BattleRuntime,
    unitId: string,
    options: CleanseStatusOptions = {},
  ) {
    const unit = this.getUnitById(runtime, unitId);

    if (!unit) {
      return {
        runtime: cloneBattleRuntime(runtime),
        removedCount: 0,
      };
    }

    const result = this.cleanseStatusesFromUnit(unit, options);

    return {
      runtime:
        result.removedCount > 0
          ? this.replaceUnit(runtime, result.unit as BattleUnitRuntime)
          : cloneBattleRuntime(runtime),
      removedCount: result.removedCount,
    };
  }

  processTurnStart(runtime: BattleRuntime, unitId: string) {
    return this.processTiming(runtime, unitId, 'turnStart');
  }

  processTurnEnd(runtime: BattleRuntime, unitId: string) {
    return this.processTiming(runtime, unitId, 'turnEnd');
  }

  private processTiming(
    runtime: BattleRuntime,
    unitId: string,
    timing: Extract<StatusTickTiming, 'turnStart' | 'turnEnd'>,
  ): StatusTimingResult {
    const unit = this.getUnitById(runtime, unitId);

    if (!unit || unit.currentHp <= 0) {
      return {
        runtime: cloneBattleRuntime(runtime),
        logEntries: [],
        shouldSkipTurn: false,
      };
    }

    const shouldSkipTurn = timing === 'turnStart' ? !this.canUnitAct(unit) : false;
    const updatedUnit = cloneBattleUnit(unit);
    const logEntries: ReturnType<GameRootStore['combatLogBuilder']['createEntry']>[] = [];

    updatedUnit.statuses = updatedUnit.statuses.flatMap((status) => {
      const definition = this.rootStore.statusDefinitionsRegistry[status.type];

      if (!definition || definition.tickTiming !== timing) {
        return [cloneStatus(status)];
      }

      const amount =
        ((status.potency ?? definition.defaultPotency ?? definition.payload?.amount ?? 0) || 0) *
        (definition.payload?.scalesWithStacks ? status.stacks : 1);

      if (definition.payload?.kind === 'damage' && amount > 0) {
        const damage = this.getAdjustedDamage(
          amount,
          updatedUnit,
          updatedUnit,
          definition.payload.damageKind ?? 'physical',
        );

        updatedUnit.currentHp = Math.max(0, updatedUnit.currentHp - damage);
        logEntries.push(
          this.rootStore.combatLogBuilder.createStatusEntry(
            runtime,
            `${updatedUnit.name} suffers ${damage} ${status.type} damage.`,
            updatedUnit.unitId,
            updatedUnit.unitId,
            damage,
          ),
        );
      }

      if (definition.payload?.kind === 'heal' && amount > 0) {
        const healing = this.getAdjustedHealing(amount, updatedUnit);

        if (healing > 0) {
          updatedUnit.currentHp = Math.min(updatedUnit.derivedStats.maxHp, updatedUnit.currentHp + healing);
          logEntries.push(
            this.rootStore.combatLogBuilder.createHealEntry(
              runtime,
              `${updatedUnit.name} recovers ${healing} health from ${status.type}.`,
              updatedUnit.unitId,
              updatedUnit.unitId,
              healing,
            ),
          );
        }
      }

      const remainingDuration = status.remainingDuration - 1;

      if (remainingDuration <= 0) {
        return [];
      }

      return [
        {
          ...cloneStatus(status),
          remainingDuration,
        },
      ];
    });

    if (timing === 'turnStart' && shouldSkipTurn && updatedUnit.currentHp > 0) {
      logEntries.push(
        this.rootStore.combatLogBuilder.createStatusEntry(
          runtime,
          `${updatedUnit.name} is unable to act.`,
          updatedUnit.unitId,
        ),
      );
    }

    return {
      runtime: this.replaceUnit(runtime, updatedUnit),
      logEntries,
      shouldSkipTurn,
    };
  }

  private replaceUnit(runtime: BattleRuntime, updatedUnit: BattleUnitRuntime) {
    const nextRuntime = cloneBattleRuntime(runtime);

    if (updatedUnit.side === 'ally') {
      nextRuntime.allies = nextRuntime.allies.map((unit) =>
        unit.unitId === updatedUnit.unitId ? cloneBattleUnit(updatedUnit) : unit,
      );
    } else {
      nextRuntime.enemies = nextRuntime.enemies.map((unit) =>
        unit.unitId === updatedUnit.unitId ? cloneBattleUnit(updatedUnit) : unit,
      );
    }

    return nextRuntime;
  }

  private getUnitById(runtime: BattleRuntime, unitId: string) {
    return [...runtime.allies, ...runtime.enemies].find((unit) => unit.unitId === unitId) ?? null;
  }
}
