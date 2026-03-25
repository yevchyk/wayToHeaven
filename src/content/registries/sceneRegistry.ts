import type { SceneMeta } from '@engine/types/narrative';

import { chapter1AwakeningSceneMeta } from '@content/chapters/chapter-1/scenes/awakening/awakening.meta';
import { chapter1CityGateSceneMeta } from '@content/chapters/chapter-1/scenes/city-gate/city-gate.meta';
import { chapter1IntroSceneMeta } from '@content/chapters/chapter-1/scenes/intro/intro.meta';
import { chapter1PrisonFallSceneMeta } from '@content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta';

export const sceneRegistry: Record<string, SceneMeta> = {
  [chapter1IntroSceneMeta.id]: chapter1IntroSceneMeta,
  [chapter1AwakeningSceneMeta.id]: chapter1AwakeningSceneMeta,
  [chapter1PrisonFallSceneMeta.id]: chapter1PrisonFallSceneMeta,
  [chapter1CityGateSceneMeta.id]: chapter1CityGateSceneMeta,
};
