import type { BaseStats, DerivedStats } from '@engine/types/unit';

function roundTo(value: number, digits: number) {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
}

export function calculateDerivedStats(baseStats: BaseStats): DerivedStats {
  return {
    physicalAttack: baseStats.strength * 2 + baseStats.agility,
    magicalAttack: baseStats.magicAffinity * 2 + baseStats.sexuality,
    armor: baseStats.health + baseStats.strength,
    resistance: baseStats.magicAffinity + baseStats.sexuality + Math.floor(baseStats.mana / 2),
    accuracy: 60 + baseStats.agility * 4 + baseStats.initiative,
    evasion: baseStats.agility * 3 + baseStats.initiative * 2,
    critChance: roundTo(
      0.05 + baseStats.agility * 0.01 + baseStats.sexuality * 0.005,
      3,
    ),
    critPower: roundTo(
      1.5 + baseStats.strength * 0.03 + baseStats.sexuality * 0.02,
      2,
    ),
    maxHp: baseStats.health * 12 + baseStats.strength * 3,
    maxMana: baseStats.mana * 10 + baseStats.magicAffinity * 4,
    initiative: baseStats.initiative + baseStats.agility * 2,
  };
}

