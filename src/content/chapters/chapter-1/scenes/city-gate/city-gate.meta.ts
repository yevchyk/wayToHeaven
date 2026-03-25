import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1CityGateSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/city-gate',
  title: 'Gate Check',
  chapterId: 'chapter-1',
  sceneOrder: 4,
  mainDialogueId: 'intro-dialogue',
  description: 'The guard tests the player’s composure at the city checkpoint.',
  defaultBackgroundId: chapter1BackgroundIds.cityGate,
};
