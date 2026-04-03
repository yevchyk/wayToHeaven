import type { BattleTemplate } from '@engine/types/battle';

export const caravanSaltPassBattle: BattleTemplate = {
  id: 'caravan-salt-pass-battle',
  title: 'Stone Teeth Clash',
  enemyUnitIds: ['salt-pass-raider-enemy'],
  allyUnitIds: ['main-hero', 'road-companion'],
  enemyAiProfile: 'random',
  victoryEffects: [
    {
      type: 'setFlag',
      flagId: 'chapter1.caravan.saltPassCleared',
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
      flagId: 'chapter1.caravan.saltPassBroken',
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
    {
      type: 'changeMeta',
      key: 'hunger',
      delta: 1,
    },
  ],
};
