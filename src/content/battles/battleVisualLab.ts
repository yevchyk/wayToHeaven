import type { BattleTemplate } from '@engine/types/battle';

export const battleVisualLab: BattleTemplate = {
  id: 'battle-visual-lab',
  title: 'Battle Visual Lab',
  enemyUnitIds: ['wolf-enemy', 'wolf-enemy'],
  allyUnitIds: ['main-hero'],
  enemyAiProfile: 'random',
  showRewardSummary: false,
};
