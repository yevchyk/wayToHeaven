import type { BattleTemplate } from '@engine/types/battle';

export const caravanAmbushBattle: BattleTemplate = {
  id: 'caravan-ambush-battle',
  title: 'Salt Pass Ambush',
  enemyUnitIds: ['bandit-enemy'],
  allyUnitIds: ['main-hero', 'road-companion'],
  enemyAiProfile: 'random',
  victoryEffects: [
    {
      type: 'setFlag',
      flagId: 'chapter1.caravan.ambushWon',
      value: true,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
    {
      type: 'changeMeta',
      key: 'safety',
      delta: -1,
    },
  ],
  defeatEffects: [
    {
      type: 'setFlag',
      flagId: 'chapter1.caravan.ambushLost',
      value: true,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: -1,
    },
    {
      type: 'changeMeta',
      key: 'safety',
      delta: -2,
    },
  ],
};
