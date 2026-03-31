import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1PrisonFallSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/prison-fall',
  title: 'Prison Fall',
  chapterId: 'chapter-1',
  sceneOrder: 3,
  description: 'Reserved for a future branching prison collapse scene.',
  defaultBackgroundId: chapter1BackgroundIds.introRoom,
};
