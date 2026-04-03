import type { EnemyTemplate } from '@engine/types/unit';

export const saltPassRaiderEnemyTemplate: EnemyTemplate = {
  id: 'salt-pass-raider-enemy',
  kind: 'enemy',
  name: 'Salt Pass Raider',
  description: 'A tunnel raider used to striking in cramped stone corridors.',
  faction: 'enemy',
  aiProfile: 'random',
  level: 1,
  baseStats: {
    strength: 6,
    agility: 6,
    sexuality: 2,
    magicAffinity: 1,
    initiative: 5,
    mana: 1,
    health: 6,
  },
  startingTags: ['human', 'living', 'raider'],
  startingStatuses: [],
  skillIds: ['basic-attack'],
};
