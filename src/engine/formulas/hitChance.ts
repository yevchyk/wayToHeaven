import type { BattleUnitRuntime } from '@engine/types/unit';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateHitChance(attacker: BattleUnitRuntime, target: BattleUnitRuntime) {
  const accuracyDelta = attacker.derivedStats.accuracy - target.derivedStats.evasion;

  return clamp(0.75 + accuracyDelta / 200, 0.35, 0.95);
}

export function calculateCritChance(attacker: BattleUnitRuntime, target: BattleUnitRuntime) {
  const resistancePenalty = target.derivedStats.resistance / 500;

  return clamp(attacker.derivedStats.critChance - resistancePenalty, 0.02, 0.6);
}

