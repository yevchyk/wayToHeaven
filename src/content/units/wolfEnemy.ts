import type { EnemyTemplate } from '@engine/types/unit';

export const wolfEnemyTemplate: EnemyTemplate = {
  id: 'wolf-enemy',
  kind: 'enemy',
  name: 'Hollow Wolf',
  description: 'A lean steppe wolf that fights by rushes, bites and blood scent.',
  battleVisual: {
    portraitSourcePath: 'src/content/shared/placeholders/battle-portraits/wolf-sigil.png',
  },
  faction: 'enemy',
  aiProfile: 'random',
  level: 1,
  baseStats: {
    strength: 5,
    agility: 6,
    sexuality: 1,
    magicAffinity: 0,
    initiative: 3,
    mana: 0,
    health: 5,
  },
  startingTags: ['beast', 'living', 'wolf'],
  startingStatuses: [],
  skillIds: ['wolf-rend'],
  experienceReward: 5,
};
