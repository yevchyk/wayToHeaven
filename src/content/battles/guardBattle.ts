import type { BattleTemplate } from '@engine/types/battle';

export const guardBattle: BattleTemplate = {
  id: 'guard-battle',
  title: 'Roadside Clash',
  enemyUnitIds: ['guard-enemy'],
  allyUnitIds: ['main-hero', 'road-companion'],
  enemyAiProfile: 'random',
  victoryEffects: [
    {
      type: 'setFlag',
      flagId: 'guardBattleWon',
      value: true,
    },
    {
      type: 'setFlag',
      flagId: 'pilgrimRoadCleared',
      value: true,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
  ],
  defeatEffects: [
    {
      type: 'setFlag',
      flagId: 'guardBattleLost',
      value: true,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: -1,
    },
  ],
};
