import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1AwakeningSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/awakening',
  title: 'Awakening',
  chapterId: 'chapter-1',
  sceneOrder: 2,
  mainDialogueId: 'chapter-1/dialogues/awakening',
  description: 'Reserved for the first post-intro prison sequence if Chapter 1 remains pure novel longer.',
  defaultBackgroundId: chapter1BackgroundIds.prisonCell,
};
