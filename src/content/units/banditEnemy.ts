import type { EnemyTemplate } from '@engine/types/unit';

export const banditEnemyTemplate: EnemyTemplate = {
  id: 'bandit-enemy',
  kind: 'enemy',
  name: 'Road Bandit',
  description: 'A desperate cutthroat striking from cover.',
  faction: 'enemy',
  aiProfile: 'random',
  level: 1,
  baseStats: {
    strength: 5,
    agility: 7,
    sexuality: 3,
    magicAffinity: 1,
    initiative: 6,
    mana: 1,
    health: 5,
  },
  startingTags: ['human', 'living', 'bandit'],
  startingStatuses: [],
  skillIds: ['basic-attack'],
};
