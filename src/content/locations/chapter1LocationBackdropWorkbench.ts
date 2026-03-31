import type { CitySceneData } from '@engine/types/city';
import type { SceneMeta } from '@engine/types/narrative';
import type { TravelBoardData } from '@engine/types/travel';

import { chapter1AwakeningSceneMeta } from '@content/chapters/chapter-1/scenes/awakening/awakening.meta';
import { chapter1CityGateSceneMeta } from '@content/chapters/chapter-1/scenes/city-gate/city-gate.meta';
import { chapter1IntroSceneMeta } from '@content/chapters/chapter-1/scenes/intro/intro.meta';
import { chapter1PrisonFallSceneMeta } from '@content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta';
import { citySceneRegistry } from '@content/registries/citySceneRegistry';
import { travelBoardRegistry } from '@content/registries/travelBoardRegistry';

export type LocationBackdropWorkbenchKind = 'cityScene' | 'travelBoard' | 'sceneMeta';

export interface LocationBackdropWorkbenchEntry {
  id: string;
  kind: LocationBackdropWorkbenchKind;
  title: string;
  subtitle: string;
  description: string;
  backgroundId: string | null;
  contentFilePath: string;
  assetFieldPath: string;
  improvementHints: string[];
}

function buildCitySceneEntry(scene: CitySceneData, contentFilePath: string): LocationBackdropWorkbenchEntry {
  return {
    id: scene.id,
    kind: 'cityScene',
    title: scene.locationName,
    subtitle: [scene.cityName, scene.districtLabel].filter(Boolean).join(' · '),
    description: scene.description ?? 'No scene description yet.',
    backgroundId: scene.backgroundId ?? null,
    contentFilePath,
    assetFieldPath: 'backgroundId',
    improvementHints: [
      'Поміняй `description`, щоб одразу підсилити атмосферу сцени в хедері та hover-preview.',
      'Переглянь `actions`: саме вони продають, що тут можна робити і який настрій у локації.',
      'Якщо картинка добра, але сцена плоска, зазвичай проблема не в background, а в слабких action descriptions.',
    ],
  };
}

function buildTravelBoardEntry(board: TravelBoardData, contentFilePath: string): LocationBackdropWorkbenchEntry {
  return {
    id: board.id,
    kind: 'travelBoard',
    title: board.title,
    subtitle: 'Travel Route',
    description: board.description ?? 'No route description yet.',
    backgroundId: board.backgroundId ?? null,
    contentFilePath,
    assetFieldPath: 'backgroundId',
    improvementHints: [
      'Покращуй `description`, щоб route мав сильний загальний вайб ще до першого кроку.',
      'Якщо хочеш, щоб сама локація відчувалася живою, дописуй `nodes[*].title` і `nodes[*].description`.',
      'Route background має працювати як mood board для всієї дошки, не як ілюстрація одного вузла.',
    ],
  };
}

function buildSceneMetaEntry(
  sceneMeta: SceneMeta,
  contentFilePath: string,
  mainFlowFilePath: string,
): LocationBackdropWorkbenchEntry {
  return {
    id: sceneMeta.id,
    kind: 'sceneMeta',
    title: sceneMeta.title,
    subtitle: 'Scene Default Background',
    description: sceneMeta.description ?? 'No scene description yet.',
    backgroundId: sceneMeta.defaultBackgroundId ?? null,
    contentFilePath,
    assetFieldPath: 'defaultBackgroundId',
    improvementHints: [
      'Це default background для всієї сцени; якщо окремі вузли мають інші фони, прав їх у scene-generation пакеті.',
      `Main scene-flow source: ${mainFlowFilePath}`,
      'Якщо хочеш підсилити staging, міняй не тільки фон, а й `title` / `description` сцени.',
    ],
  };
}

const chapter1TempleExitScene = citySceneRegistry['chapter-1/city/temple-exit'] as CitySceneData;
const chapter1MarketLaneScene = citySceneRegistry['chapter-1/city/market-lane'] as CitySceneData;
const chapter1SiltBarScene = citySceneRegistry['chapter-1/city/silt-bar'] as CitySceneData;
const chapter1ShrineCourtScene = citySceneRegistry['chapter-1/city/shrine-court'] as CitySceneData;
const chapter1UndergroundRouteBoard = travelBoardRegistry['chapter-1/travel/underground-route'] as TravelBoardData;

export const chapter1CityLocationBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildCitySceneEntry(
    chapter1TempleExitScene,
    'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  ),
  buildCitySceneEntry(
    chapter1MarketLaneScene,
    'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  ),
  buildCitySceneEntry(
    chapter1SiltBarScene,
    'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  ),
  buildCitySceneEntry(
    chapter1ShrineCourtScene,
    'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts',
  ),
];

export const chapter1TravelBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildTravelBoardEntry(
    chapter1UndergroundRouteBoard,
    'src/content/chapters/chapter-1/travel/underground-route.scene-generation.ts',
  ),
];

export const chapter1SceneMetaBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildSceneMetaEntry(
    chapter1IntroSceneMeta,
    'src/content/chapters/chapter-1/scenes/intro/intro.meta.ts',
    'src/content/chapters/chapter-1/scenes/intro/intro.scene-generation.ts',
  ),
  buildSceneMetaEntry(
    chapter1AwakeningSceneMeta,
    'src/content/chapters/chapter-1/scenes/awakening/awakening.meta.ts',
    'src/content/chapters/chapter-1/scenes/awakening/awakening.scene-generation.ts',
  ),
  buildSceneMetaEntry(
    chapter1PrisonFallSceneMeta,
    'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta.ts',
    'scene flow not authored yet',
  ),
  buildSceneMetaEntry(
    chapter1CityGateSceneMeta,
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.meta.ts',
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.scene-generation.ts',
  ),
];
