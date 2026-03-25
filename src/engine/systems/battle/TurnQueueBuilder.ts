import type { BattleUnitRuntime } from '@engine/types/unit';

type InitiativeResolver = (unit: BattleUnitRuntime) => number;

function compareBattleUnits(
  left: BattleUnitRuntime,
  right: BattleUnitRuntime,
  getInitiative: InitiativeResolver,
) {
  const initiativeDelta = getInitiative(right) - getInitiative(left);

  if (initiativeDelta !== 0) {
    return initiativeDelta;
  }

  if (left.side !== right.side) {
    return left.side === 'ally' ? -1 : 1;
  }

  return left.unitId.localeCompare(right.unitId);
}

export class TurnQueueBuilder {
  private readonly getInitiative: InitiativeResolver;

  constructor(getInitiative: InitiativeResolver = (unit) => unit.derivedStats.initiative) {
    this.getInitiative = getInitiative;
  }

  build(units: readonly BattleUnitRuntime[]) {
    return [...units]
      .filter((unit) => unit.currentHp > 0)
      .sort((left, right) => compareBattleUnits(left, right, this.getInitiative))
      .map((unit) => unit.unitId);
  }
}
