import type { SceneMeta } from '@engine/types/narrative';

import { chapter2BackgroundIds, chapter2MusicIds } from '../../assets';

export const chapter2ArrivalSceneMeta: SceneMeta = {
  id: 'chapter-2/scene/arrival',
  title: 'Вхід у Гуген-Ум',
  chapterId: 'chapter-2',
  sceneOrder: 1,
  mainSceneFlowId: 'chapter-2/scene/arrival',
  description: 'The caravan reaches Hugen-Um and Mirella is turned from traveler into an entry in the city ledger.',
  defaultBackgroundId: chapter2BackgroundIds.arrivalGate,
  defaultMusicId: chapter2MusicIds.cityPressure,
};
