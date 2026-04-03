import type { FishingMiniGameData } from '@engine/types/minigame';

export const fishingReedBank: FishingMiniGameData = {
  id: 'chapter-1/minigame/fishing/reed-bank',
  kind: 'fishing',
  title: 'Тиха заводь',
  description:
    'Утримуй натяг у зеленій зоні. Вдала риболовля піднімає навик рибалки й дає стабільніший контроль у наступних спробах.',
  skillId: 'fishing',
  durationMs: 18000,
  goal: 100,
  zoneWidth: 0.22,
  tensionRisePerSecond: 0.48,
  tensionFallPerSecond: 0.3,
  zoneDriftPerSecond: 0.16,
  progressGainPerSecond: 22,
  progressDecayPerSecond: 18,
  successEffects: [
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
  ],
};
