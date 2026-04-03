import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1AwakeningSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/awakening',
  title: 'Awakening',
  chapterId: 'chapter-1',
  sceneOrder: 3,
  mainSceneFlowId: 'chapter-1/scene/awakening',
  description: 'Post-fall awakening sequence after the prison-fall bridge resolves.',
  defaultBackgroundId: chapter1BackgroundIds.prisonCell,
};
