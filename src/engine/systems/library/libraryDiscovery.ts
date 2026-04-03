import type { StageCharacter, StageSlotCharacter, StageState } from '@engine/types/dialogue';
import type { SceneFlowNode } from '@engine/types/sceneFlow';

function getStageCharacterId(character: Pick<StageCharacter, 'speakerId' | 'isVisible'>) {
  if (character.isVisible === false) {
    return null;
  }

  return character.speakerId;
}

function getSlotCharacterId(character: StageSlotCharacter | null | undefined) {
  return character?.speakerId ?? null;
}

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

export function buildWorldLocationLibraryEntryId(locationId: string) {
  return `world:${locationId}`;
}

export function buildCityLocationLibraryEntryId(sceneId: string) {
  return `city:${sceneId}`;
}

export function buildTravelLocationLibraryEntryId(boardId: string) {
  return `travel:${boardId}`;
}

export function buildSceneLocationLibraryEntryId(sceneId: string) {
  return `scene:${sceneId}`;
}

export function collectCharacterIdsFromStage(stage: StageState | null | undefined) {
  if (!stage) {
    return [];
  }

  return uniqueValues(
    [
      ...(stage.characters ?? []).map(getStageCharacterId),
      getSlotCharacterId(stage.left),
      getSlotCharacterId(stage.center),
      getSlotCharacterId(stage.right),
      ...(stage.extra ?? []).map(getSlotCharacterId),
      stage.focusCharacterId ?? null,
    ].filter((characterId): characterId is string => Boolean(characterId)),
  );
}

export function collectCharacterIdsFromSceneFlowNode(
  node: Pick<SceneFlowNode, 'speakerId' | 'stage'>,
  activeStage?: StageState | null,
) {
  return uniqueValues(
    [
      node.speakerId ?? null,
      ...collectCharacterIdsFromStage(activeStage ?? node.stage),
    ].filter((characterId): characterId is string => Boolean(characterId)),
  );
}
