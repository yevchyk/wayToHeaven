import type { EnemyTemplate } from '@engine/types/unit';

export const guardEnemyTemplate: EnemyTemplate = {
  id: 'guard-enemy',
  kind: 'enemy',
  name: 'Gate Guard',
  description: 'A trained guard ready to block the road.',
  battleVisual: {
    portraitSourcePath: 'src/content/shared/placeholders/portraits/rough-man.jpg',
  },
  faction: 'enemy',
  aiProfile: 'random',
  level: 1,
  baseStats: {
    strength: 6,
    agility: 5,
    sexuality: 2,
    magicAffinity: 1,
    initiative: 4,
    mana: 2,
    health: 7,
  },
  startingTags: ['human', 'living', 'guard'],
  startingStatuses: [],
  skillIds: ['basic-attack'],
  rewardItemIds: ['pilgrim-seal'],
  rewardEffects: [
    {
      type: 'changeMeta',
      key: 'reputation',
      delta: 1,
    },
  ],
};
