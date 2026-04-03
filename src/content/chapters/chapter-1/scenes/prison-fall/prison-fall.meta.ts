import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1PrisonFallSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/prison-fall',
  title: 'Prison Fall',
  chapterId: 'chapter-1',
  sceneOrder: 2,
  mainSceneFlowId: 'chapter-1/scene/prison-fall',
  description: 'Functional aftermath bridge between the prologue collapse and the awakening route.',
  defaultBackgroundId: chapter1BackgroundIds.prisonCell,
};
