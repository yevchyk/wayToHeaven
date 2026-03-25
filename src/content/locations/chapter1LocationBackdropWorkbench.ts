import type { CitySceneData } from '@engine/types/city';
import type { SceneMeta } from '@engine/types/narrative';
import type { TravelBoardData } from '@engine/types/travel';

import { chapter1MarketLaneScene } from '@content/chapters/chapter-1/city/market-lane.scene';
import { chapter1ShrineCourtScene } from '@content/chapters/chapter-1/city/shrine-court.scene';
import { chapter1SiltBarScene } from '@content/chapters/chapter-1/city/silt-bar.scene';
import { chapter1TempleExitScene } from '@content/chapters/chapter-1/city/temple-exit.scene';
import { chapter1AwakeningSceneMeta } from '@content/chapters/chapter-1/scenes/awakening/awakening.meta';
import { chapter1CityGateSceneMeta } from '@content/chapters/chapter-1/scenes/city-gate/city-gate.meta';
import { chapter1IntroSceneMeta } from '@content/chapters/chapter-1/scenes/intro/intro.meta';
import { chapter1PrisonFallSceneMeta } from '@content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta';
import { chapter1UndergroundRouteBoard } from '@content/chapters/chapter-1/travel/underground-route.board';

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
  mainDialogueFilePath: string,
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
      'Це default background для всієї сцени; якщо окремі діалогові вузли мають інші фони, прав їх у dialogue файлі.',
      `Main dialogue file: ${mainDialogueFilePath}`,
      'Якщо хочеш підсилити staging, міняй не тільки фон, а й `title` / `description` сцени.',
    ],
  };
}

export const chapter1CityLocationBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildCitySceneEntry(
    chapter1TempleExitScene,
    'src/content/chapters/chapter-1/city/temple-exit.scene.ts',
  ),
  buildCitySceneEntry(
    chapter1MarketLaneScene,
    'src/content/chapters/chapter-1/city/market-lane.scene.ts',
  ),
  buildCitySceneEntry(
    chapter1SiltBarScene,
    'src/content/chapters/chapter-1/city/silt-bar.scene.ts',
  ),
  buildCitySceneEntry(
    chapter1ShrineCourtScene,
    'src/content/chapters/chapter-1/city/shrine-court.scene.ts',
  ),
];

export const chapter1TravelBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildTravelBoardEntry(
    chapter1UndergroundRouteBoard,
    'src/content/chapters/chapter-1/travel/underground-route.board.ts',
  ),
];

export const chapter1SceneMetaBackdropEntries: LocationBackdropWorkbenchEntry[] = [
  buildSceneMetaEntry(
    chapter1IntroSceneMeta,
    'src/content/chapters/chapter-1/scenes/intro/intro.meta.ts',
    'src/content/chapters/chapter-1/scenes/intro/intro.dialogue.ts',
  ),
  buildSceneMetaEntry(
    chapter1AwakeningSceneMeta,
    'src/content/chapters/chapter-1/scenes/awakening/awakening.meta.ts',
    'src/content/chapters/chapter-1/scenes/awakening/awakening.dialogue.ts',
  ),
  buildSceneMetaEntry(
    chapter1PrisonFallSceneMeta,
    'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta.ts',
    'src/content/dialogues/introDialogue.ts',
  ),
  buildSceneMetaEntry(
    chapter1CityGateSceneMeta,
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.meta.ts',
    'src/content/chapters/chapter-1/scenes/city-gate/city-gate.dialogue.ts',
  ),
];
