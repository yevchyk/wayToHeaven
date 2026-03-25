import type {
  BattleOutcome,
  BattleRuntime,
  CombatLogEntry,
  CombatLogEntryType,
} from '@engine/types/battle';

interface CombatLogEntryInput {
  type: CombatLogEntryType;
  message: string;
  sourceUnitId?: string;
  targetUnitId?: string;
  value?: number;
}

export class CombatLogBuilder {
  private sequence = 0;

  reset() {
    this.sequence = 0;
  }

  createEntry(runtime: BattleRuntime, input: CombatLogEntryInput): CombatLogEntry {
    this.sequence += 1;

    return {
      id: `${runtime.battleId}-log-${this.sequence}`,
      round: runtime.round,
      ...input,
    };
  }

  createSystemEntry(runtime: BattleRuntime, message: string) {
    return this.createEntry(runtime, {
      type: 'system',
      message,
    });
  }

  createActionEntry(
    runtime: BattleRuntime,
    message: string,
    sourceUnitId?: string,
    targetUnitId?: string,
  ) {
    const optionalFields = {
      ...(sourceUnitId ? { sourceUnitId } : {}),
      ...(targetUnitId ? { targetUnitId } : {}),
    };

    return this.createEntry(runtime, {
      type: 'action',
      message,
      ...optionalFields,
    });
  }

  createDamageEntry(
    runtime: BattleRuntime,
    message: string,
    sourceUnitId: string,
    targetUnitId: string,
    value: number,
  ) {
    return this.createEntry(runtime, {
      type: 'damage',
      message,
      sourceUnitId,
      targetUnitId,
      value,
    });
  }

  createHealEntry(
    runtime: BattleRuntime,
    message: string,
    sourceUnitId: string,
    targetUnitId: string,
    value: number,
  ) {
    return this.createEntry(runtime, {
      type: 'heal',
      message,
      sourceUnitId,
      targetUnitId,
      value,
    });
  }

  createStatusEntry(
    runtime: BattleRuntime,
    message: string,
    sourceUnitId?: string,
    targetUnitId?: string,
    value?: number,
  ) {
    const optionalFields = {
      ...(sourceUnitId ? { sourceUnitId } : {}),
      ...(targetUnitId ? { targetUnitId } : {}),
      ...(value !== undefined ? { value } : {}),
    };

    return this.createEntry(runtime, {
      type: 'status',
      message,
      ...optionalFields,
    });
  }

  createMissEntry(
    runtime: BattleRuntime,
    message: string,
    sourceUnitId: string,
    targetUnitId: string,
  ) {
    return this.createEntry(runtime, {
      type: 'miss',
      message,
      sourceUnitId,
      targetUnitId,
    });
  }

  createOutcomeEntry(runtime: BattleRuntime, outcome: BattleOutcome) {
    return this.createEntry(runtime, {
      type: 'outcome',
      message: outcome === 'victory' ? 'Victory.' : 'Defeat.',
    });
  }
}
