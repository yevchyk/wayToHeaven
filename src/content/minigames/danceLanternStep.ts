import type { DanceMiniGameData } from '@engine/types/minigame';

export const danceLanternStep: DanceMiniGameData = {
  id: 'chapter-1/minigame/dance/lantern-step',
  kind: 'dance',
  title: 'Ліхтарний крок',
  description:
    'Лови ритм по стрілках. Активна стрілка блимає перед ударом, а влучні серії дають кращий темп для наступних танцювальних сцен.',
  skillId: 'dance',
  previewWindowMs: 420,
  hitWindowMs: 170,
  requiredHits: 6,
  prompts: [
    { id: 'step-1', direction: 'left', beatTimeMs: 1000 },
    { id: 'step-2', direction: 'up', beatTimeMs: 1700 },
    { id: 'step-3', direction: 'right', beatTimeMs: 2400 },
    { id: 'step-4', direction: 'down', beatTimeMs: 3100 },
    { id: 'step-5', direction: 'left', beatTimeMs: 3800 },
    { id: 'step-6', direction: 'right', beatTimeMs: 4500 },
    { id: 'step-7', direction: 'up', beatTimeMs: 5200 },
    { id: 'step-8', direction: 'down', beatTimeMs: 5900 },
  ],
  successEffects: [
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
  ],
};
