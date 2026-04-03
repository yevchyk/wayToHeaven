import type { SceneMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1CityGateSceneMeta: SceneMeta = {
  id: 'chapter-1/scene/city-gate',
  title: 'Gate Check Sandbox',
  chapterId: 'chapter-1',
  sceneOrder: 90,
  mainSceneFlowId: 'chapter-1/scene/city-gate',
  description: 'Prototype city checkpoint kept as a systems sandbox and not used in the Chapter 1 main route.',
  defaultBackgroundId: chapter1BackgroundIds.cityGate,
};
