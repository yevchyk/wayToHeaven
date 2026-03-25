import type { BattleActionSelection, BattleActionType, BattleRuntime } from '@engine/types/battle';
import type { BattleUnitRuntime } from '@engine/types/unit';

type RandomSource = () => number;

function pickRandomValue<TValue>(values: readonly TValue[], random: RandomSource) {
  const selectedValue = values[Math.floor(random() * values.length)];

  if (selectedValue === undefined) {
    throw new Error('Cannot pick a random value from an empty list.');
  }

  return selectedValue;
}

export class BattleAI {
  private readonly random: RandomSource;

  constructor(random: RandomSource = Math.random) {
    this.random = random;
  }

  chooseAction(runtime: BattleRuntime, unit: BattleUnitRuntime): BattleActionSelection {
    const livingTargets = this.getLivingTargets(runtime, unit.side);

    if (livingTargets.length === 0) {
      return {
        type: 'defend',
        sourceUnitId: unit.unitId,
      };
    }

    const availableActionTypes: BattleActionType[] = ['attack', 'defend'];

    if (unit.skillIds.length > 0) {
      availableActionTypes.push('skill');
    }

    const type = pickRandomValue(availableActionTypes, this.random);

    if (type === 'defend') {
      return {
        type,
        sourceUnitId: unit.unitId,
      };
    }

    const targetId = pickRandomValue(livingTargets, this.random).unitId;

    if (type === 'skill') {
      const skillId = pickRandomValue(unit.skillIds, this.random);

      return {
        type,
        sourceUnitId: unit.unitId,
        skillId,
        targetId,
      };
    }

    return {
      type,
      sourceUnitId: unit.unitId,
      targetId,
    };
  }

  private getLivingTargets(runtime: BattleRuntime, sourceSide: BattleUnitRuntime['side']) {
    return (sourceSide === 'ally' ? runtime.enemies : runtime.allies).filter(
      (unit) => unit.currentHp > 0,
    );
  }
}
