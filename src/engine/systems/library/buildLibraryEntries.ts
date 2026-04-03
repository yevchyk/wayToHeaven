import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { CitySceneData } from '@engine/types/city';
import type { TravelBoardData, TravelNodeType } from '@engine/types/travel';
import type { NarrativeCharacterData, SceneMeta } from '@engine/types/narrative';
import type { LocationData, LocationNodeType, NodeInteraction } from '@engine/types/world';

import {
  buildCityLocationLibraryEntryId,
  buildSceneLocationLibraryEntryId,
  buildTravelLocationLibraryEntryId,
  buildWorldLocationLibraryEntryId,
} from './libraryDiscovery';

export type LibraryTabId = 'characters' | 'locations';

export interface LibraryEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageAssetId: string | null;
  imageSourcePath?: string;
  tags: string[];
}

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

function formatChapterLabel(chapterId?: string) {
  if (!chapterId) {
    return null;
  }

  return chapterId
    .split(/[-/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function humanizeWord(value: string) {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getLocationNodeTypeLabel(type: LocationNodeType) {
  switch (type) {
    case 'start':
      return 'старт';
    case 'path':
      return 'шлях';
    case 'landmark':
      return 'орієнтир';
    case 'safe':
      return 'безпечний вузол';
    case 'encounter':
      return 'сутичка';
  }
}

function getTravelNodeTypeLabel(type: TravelNodeType) {
  switch (type) {
    case 'battle':
      return 'битва';
    case 'loot':
      return 'здобич';
    case 'empty':
      return 'порожній вузол';
    case 'trap':
      return 'пастка';
    case 'question':
      return 'вибір';
    case 'heal':
      return 'лікування';
    case 'rest':
      return 'відпочинок';
    case 'story':
      return 'сюжет';
    case 'exit':
      return 'вихід';
    case 'eliteBattle':
      return 'елітна битва';
    case 'shop':
      return 'торгівля';
    case 'boss':
      return 'бос';
  }
}

function getInteractionLabel(interaction: NodeInteraction) {
  switch (interaction.type) {
    case 'battle':
      return 'бойова подія';
    case 'dialogue':
      return 'діалог';
    case 'sceneFlow':
      return 'сцена';
    case 'none':
      return null;
  }
}

function buildCharacterDescription(character: NarrativeCharacterData) {
  if (character.description) {
    return character.description;
  }

  const portraitCount = Object.keys(character.portraitRefs).length;
  const outfitCount = Object.keys(character.outfits ?? {}).length;
  const roleLabel = character.role === 'heroine' ? 'героїня' : 'персонаж';
  const portraitLine =
    portraitCount > 0
      ? `У контенті вже є ${portraitCount} портретних стани для цього образу.`
      : 'Окремі портретні стани для цього образу ще не підключені.';
  const outfitLine =
    outfitCount > 0
      ? `Також доступно ${outfitCount} варіантів одягу або постановки.`
      : 'Окремі варіанти одягу для цього запису ще не описані.';

  return `${character.displayName} поки що не має окремого бібліотечного опису. Це ${roleLabel} з поточного narrative registry. ${portraitLine} ${outfitLine}`;
}

function buildCharacterTags(character: NarrativeCharacterData) {
  const portraitCount = Object.keys(character.portraitRefs).length;
  const outfitCount = Object.keys(character.outfits ?? {}).length;

  return uniqueValues(
    [
      character.role === 'heroine' ? 'героїня' : 'персонаж',
      formatChapterLabel(character.chapterId),
      portraitCount > 0 ? `${portraitCount} емоцій` : null,
      outfitCount > 0 ? `${outfitCount} образи` : null,
      character.defaultEmotion ? humanizeWord(character.defaultEmotion) : null,
    ].filter((value): value is string => Boolean(value)),
  );
}

function buildLocationDescription(location: LocationData) {
  if (location.description) {
    return location.description;
  }

  const nodeCount = Object.keys(location.nodes).length;

  return `${location.title} ще не має окремого бібліотечного опису. У world registry ця локація містить ${nodeCount} вузлів і стартує з точки ${location.startNodeId}.`;
}

function buildLocationTags(location: LocationData) {
  const nodes = Object.values(location.nodes);
  const interactionLabels = uniqueValues(
    nodes
      .map((node) => (node.interaction ? getInteractionLabel(node.interaction) : null))
      .filter((value): value is string => Boolean(value)),
  );
  const nodeTypeLabels = uniqueValues(nodes.map((node) => getLocationNodeTypeLabel(node.type)));

  return uniqueValues(
    [
      'світова локація',
      `${nodes.length} вузлів`,
      ...nodeTypeLabels.slice(0, 2),
      ...interactionLabels.slice(0, 2),
    ],
  );
}

function buildCitySceneDescription(scene: CitySceneData) {
  if (scene.description) {
    return scene.description;
  }

  return `${scene.locationName} ще не має окремого опису. Це міська сцена для ${scene.cityName} з ${scene.actions.length} доступними діями.`;
}

function buildCitySceneTags(scene: CitySceneData) {
  return uniqueValues(
    [
      'міська сцена',
      scene.chapterId ? formatChapterLabel(scene.chapterId) : null,
      scene.cityName,
      scene.districtLabel ?? null,
      scene.statusLabel ?? null,
      `${scene.actions.length} дій`,
    ].filter((value): value is string => Boolean(value)),
  );
}

function buildTravelBoardDescription(board: TravelBoardData) {
  if (board.description) {
    return board.description;
  }

  return `${board.title} ще не має окремого опису. Це travel board із ${Object.keys(board.nodes).length} вузлами та стартовою точкою ${board.startNodeId}.`;
}

function buildTravelBoardTags(board: TravelBoardData) {
  const nodeTypeLabels = uniqueValues(
    Object.values(board.nodes).map((node) => getTravelNodeTypeLabel(node.type)),
  );

  return uniqueValues(
    [
      'маршрут',
      board.chapterId ? formatChapterLabel(board.chapterId) : null,
      `${Object.keys(board.nodes).length} вузлів`,
      ...nodeTypeLabels.slice(0, 3),
    ].filter((value): value is string => Boolean(value)),
  );
}

function buildSceneMetaDescription(scene: SceneMeta) {
  if (scene.description) {
    return scene.description;
  }

  const chapterLabel = formatChapterLabel(scene.chapterId) ?? scene.chapterId;

  return `${scene.title} ще не має окремого бібліотечного опису. Це сюжетна сцена з ${chapterLabel}, яка працює як scene-level entry point для runtime.`;
}

function buildSceneMetaTags(scene: SceneMeta) {
  return uniqueValues(
    [
      'сюжетна сцена',
      formatChapterLabel(scene.chapterId),
      `порядок ${scene.sceneOrder}`,
      scene.defaultBackgroundId ? 'має фон' : null,
    ].filter((value): value is string => Boolean(value)),
  );
}

function getAssetSourcePath(rootStore: GameRootStore, assetId: string | null) {
  if (!assetId) {
    return undefined;
  }

  return rootStore.narrativeAssetRegistry[assetId]?.sourcePath;
}

export function buildCharacterLibraryEntries(rootStore: GameRootStore): LibraryEntry[] {
  return Object.values(rootStore.narrativeCharacterRegistry)
    .map((character) => {
      const imageAssetId = character.defaultPortraitId ?? Object.values(character.portraitRefs)[0] ?? null;

      return {
        id: character.id,
        title: character.displayName,
        subtitle: character.role === 'heroine' ? 'Головна героїня' : 'Персонаж світу',
        description: buildCharacterDescription(character),
        imageAssetId,
        imageSourcePath: getAssetSourcePath(rootStore, imageAssetId),
        tags: buildCharacterTags(character),
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'uk'));
}

export function buildLocationLibraryEntries(rootStore: GameRootStore): LibraryEntry[] {
  const worldLocations = Object.values(rootStore.locationRegistry).map((location) => ({
    id: buildWorldLocationLibraryEntryId(location.id),
    title: location.title,
    subtitle: 'Світова локація',
    description: buildLocationDescription(location),
    imageAssetId: location.backgroundId ?? null,
    imageSourcePath: getAssetSourcePath(rootStore, location.backgroundId ?? null),
    tags: buildLocationTags(location),
  }));

  const cityScenes = Object.values(rootStore.citySceneRegistry).map((scene) => ({
    id: buildCityLocationLibraryEntryId(scene.id),
    title: scene.locationName,
    subtitle: scene.districtLabel ? `${scene.cityName} · ${scene.districtLabel}` : scene.cityName,
    description: buildCitySceneDescription(scene),
    imageAssetId: scene.backgroundId ?? null,
    imageSourcePath: getAssetSourcePath(rootStore, scene.backgroundId ?? null),
    tags: buildCitySceneTags(scene),
  }));

  const travelBoards = Object.values(rootStore.travelBoardRegistry).map((board) => ({
    id: buildTravelLocationLibraryEntryId(board.id),
    title: board.title,
    subtitle: 'Маршрут мандрівки',
    description: buildTravelBoardDescription(board),
    imageAssetId: board.backgroundId ?? null,
    imageSourcePath: getAssetSourcePath(rootStore, board.backgroundId ?? null),
    tags: buildTravelBoardTags(board),
  }));

  const sceneEntries = Object.values(rootStore.sceneRegistry).map((scene) => ({
    id: buildSceneLocationLibraryEntryId(scene.id),
    title: scene.title,
    subtitle: formatChapterLabel(scene.chapterId)
      ? `${formatChapterLabel(scene.chapterId)} · Сюжетна сцена`
      : 'Сюжетна сцена',
    description: buildSceneMetaDescription(scene),
    imageAssetId: scene.defaultBackgroundId ?? null,
    imageSourcePath: getAssetSourcePath(rootStore, scene.defaultBackgroundId ?? null),
    tags: buildSceneMetaTags(scene),
  }));

  return [...worldLocations, ...cityScenes, ...travelBoards, ...sceneEntries].sort((left, right) =>
    left.title.localeCompare(right.title, 'uk'),
  );
}
