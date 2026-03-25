import { calculateDerivedStats } from '@engine/formulas/derivedStats';
import type { BaseStats } from '@engine/types/unit';

describe('calculateDerivedStats', () => {
  it('derives combat and resource stats from base attributes', () => {
    const baseStats: BaseStats = {
      strength: 7,
      agility: 6,
      sexuality: 3,
      magicAffinity: 2,
      initiative: 5,
      mana: 4,
      health: 8,
    };

    expect(calculateDerivedStats(baseStats)).toEqual({
      physicalAttack: 20,
      magicalAttack: 7,
      armor: 15,
      resistance: 7,
      accuracy: 89,
      evasion: 28,
      critChance: 0.125,
      critPower: 1.77,
      maxHp: 117,
      maxMana: 48,
      initiative: 17,
    });
  });
});

