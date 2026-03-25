import type { CitySceneData } from '@engine/types/city';

import { chapter1MarketLaneScene } from '@content/chapters/chapter-1/city/market-lane.scene';
import { chapter1ShrineCourtScene } from '@content/chapters/chapter-1/city/shrine-court.scene';
import { chapter1SiltBarScene } from '@content/chapters/chapter-1/city/silt-bar.scene';
import { chapter1TempleExitScene } from '@content/chapters/chapter-1/city/temple-exit.scene';

export const citySceneRegistry: Record<string, CitySceneData> = {
  [chapter1TempleExitScene.id]: chapter1TempleExitScene,
  [chapter1MarketLaneScene.id]: chapter1MarketLaneScene,
  [chapter1SiltBarScene.id]: chapter1SiltBarScene,
  [chapter1ShrineCourtScene.id]: chapter1ShrineCourtScene,
};
