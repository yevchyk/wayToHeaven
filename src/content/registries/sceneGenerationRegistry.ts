import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import {
  chapter1AwakeningSceneGenerationDocument,
  chapter1IntroBallAndAssaultSceneGenerationDocument,
  chapter1CaravanToHugenUmSceneGenerationDocument,
  chapter1CityGateSceneGenerationDocument,
  chapter1CityHubsSceneGenerationDocument,
  chapter1IntroSceneGenerationDocument,
  chapter1IntroTwoOfThreeSceneGenerationDocument,
  chapter1PrisonFallSceneGenerationDocument,
  chapter1ThornDepartureSceneGenerationDocument,
  chapter1UndergroundRouteSceneGenerationDocument,
  chapter2ArrivalSceneGenerationDocument,
  chapter2FirstDealSceneGenerationDocument,
  chapter2HugenUmHubsSceneGenerationDocument,
} from '@content/scene-generation';

export const sceneGenerationRegistry: Record<string, SceneGenerationDocument> = {
  [chapter1IntroSceneGenerationDocument.id]: chapter1IntroSceneGenerationDocument,
  [chapter1IntroTwoOfThreeSceneGenerationDocument.id]: chapter1IntroTwoOfThreeSceneGenerationDocument,
  [chapter1IntroBallAndAssaultSceneGenerationDocument.id]: chapter1IntroBallAndAssaultSceneGenerationDocument,
  [chapter1PrisonFallSceneGenerationDocument.id]: chapter1PrisonFallSceneGenerationDocument,
  [chapter1AwakeningSceneGenerationDocument.id]: chapter1AwakeningSceneGenerationDocument,
  [chapter1CaravanToHugenUmSceneGenerationDocument.id]: chapter1CaravanToHugenUmSceneGenerationDocument,
  [chapter1CityGateSceneGenerationDocument.id]: chapter1CityGateSceneGenerationDocument,
  [chapter1ThornDepartureSceneGenerationDocument.id]: chapter1ThornDepartureSceneGenerationDocument,
  [chapter1CityHubsSceneGenerationDocument.id]: chapter1CityHubsSceneGenerationDocument,
  [chapter1UndergroundRouteSceneGenerationDocument.id]: chapter1UndergroundRouteSceneGenerationDocument,
  [chapter2ArrivalSceneGenerationDocument.id]: chapter2ArrivalSceneGenerationDocument,
  [chapter2FirstDealSceneGenerationDocument.id]: chapter2FirstDealSceneGenerationDocument,
  [chapter2HugenUmHubsSceneGenerationDocument.id]: chapter2HugenUmHubsSceneGenerationDocument,
};
