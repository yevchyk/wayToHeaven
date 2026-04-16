import type { SceneMeta } from '@engine/types/narrative';

import { chapter1AwakeningSceneMeta } from '@content/chapters/chapter-1/scenes/awakening/awakening.meta';
import { chapter1CaravanToHugenUmSceneMeta } from '@content/chapters/chapter-1/scenes/caravan-to-hugen-um/caravan-to-hugen-um.meta';
import { chapter1CityGateSceneMeta } from '@content/chapters/chapter-1/scenes/city-gate/city-gate.meta';
import { chapter1IntroBallAndAssaultSceneMeta } from '@content/chapters/chapter-1/scenes/intro/ball-and-assault.meta';
import { chapter1IntroSceneMeta } from '@content/chapters/chapter-1/scenes/intro/intro.meta';
import { chapter1IntroTwoOfThreeSceneMeta } from '@content/chapters/chapter-1/scenes/intro/two-of-three.meta';
import { chapter1PrisonFallSceneMeta } from '@content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta';
import { chapter1FatherBetrayalReplaySceneMeta } from '@content/chapters/chapter-1/scenes/thorn-departure/replays/father-betrayal.replay.meta';
import { chapter1CorsetTieReplaySceneMeta } from '@content/chapters/chapter-1/scenes/thorn-departure/replays/corset-tie.replay.meta';
import { chapter1ThornDepartureSceneMeta } from '@content/chapters/chapter-1/scenes/thorn-departure/thorn-departure.meta';
import { chapter2ArrivalSceneMeta } from '@content/chapters/chapter-2/scenes/arrival/arrival.meta';
import { chapter2FirstDealSceneMeta } from '@content/chapters/chapter-2/scenes/first-deal/first-deal.meta';

export const sceneRegistry: Record<string, SceneMeta> = {
  [chapter1IntroSceneMeta.id]: chapter1IntroSceneMeta,
  [chapter1IntroTwoOfThreeSceneMeta.id]: chapter1IntroTwoOfThreeSceneMeta,
  [chapter1IntroBallAndAssaultSceneMeta.id]: chapter1IntroBallAndAssaultSceneMeta,
  [chapter1AwakeningSceneMeta.id]: chapter1AwakeningSceneMeta,
  [chapter1CaravanToHugenUmSceneMeta.id]: chapter1CaravanToHugenUmSceneMeta,
  [chapter1PrisonFallSceneMeta.id]: chapter1PrisonFallSceneMeta,
  [chapter1CityGateSceneMeta.id]: chapter1CityGateSceneMeta,
  [chapter1ThornDepartureSceneMeta.id]: chapter1ThornDepartureSceneMeta,
  [chapter1CorsetTieReplaySceneMeta.id]: chapter1CorsetTieReplaySceneMeta,
  [chapter1FatherBetrayalReplaySceneMeta.id]: chapter1FatherBetrayalReplaySceneMeta,
  [chapter2ArrivalSceneMeta.id]: chapter2ArrivalSceneMeta,
  [chapter2FirstDealSceneMeta.id]: chapter2FirstDealSceneMeta,
};
