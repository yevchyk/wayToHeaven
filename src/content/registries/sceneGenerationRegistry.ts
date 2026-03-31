import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import {
  chapter1AwakeningSceneGenerationDocument,
  chapter1CityGateSceneGenerationDocument,
  chapter1CityHubsSceneGenerationDocument,
  chapter1IntroSceneGenerationDocument,
  chapter1UndergroundRouteSceneGenerationDocument,
} from '@content/scene-generation';

export const sceneGenerationRegistry: Record<string, SceneGenerationDocument> = {
  [chapter1IntroSceneGenerationDocument.id]: chapter1IntroSceneGenerationDocument,
  [chapter1AwakeningSceneGenerationDocument.id]: chapter1AwakeningSceneGenerationDocument,
  [chapter1CityGateSceneGenerationDocument.id]: chapter1CityGateSceneGenerationDocument,
  [chapter1CityHubsSceneGenerationDocument.id]: chapter1CityHubsSceneGenerationDocument,
  [chapter1UndergroundRouteSceneGenerationDocument.id]: chapter1UndergroundRouteSceneGenerationDocument,
};
