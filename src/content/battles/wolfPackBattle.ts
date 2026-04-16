import type { BattleTemplate } from '@engine/types/battle';

export const wolfPackBattle: BattleTemplate = {
  id: 'wolf-pack-battle',
  title: 'Dust Road Wolf Pack',
  enemyUnitIds: ['wolf-enemy', 'wolf-enemy'],
  allyUnitIds: ['main-hero'],
  enemyAiProfile: 'random',
  rewardTableId: 'wolf-pack-roadside',
  showRewardSummary: true,
  victoryEffects: [
    {
      type: 'setFlag',
      flagId: 'wolfPackCleared',
      value: true,
    },
  ],
  defeatEffects: [
    {
      type: 'setFlag',
      flagId: 'wolfPackLost',
      value: true,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: -1,
    },
  ],
};
