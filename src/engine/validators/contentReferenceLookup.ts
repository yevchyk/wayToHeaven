import type { BattleTemplate } from '@engine/types/battle';
import type { CitySceneData } from '@engine/types/city';
import type { DialogueData } from '@engine/types/dialogue';
import type { ItemData } from '@engine/types/item';
import type { StatusDefinition, StatusType } from '@engine/types/status';
import type { TravelBoardData } from '@engine/types/travel';
import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';
import type { LocationData } from '@engine/types/world';

export interface ContentReferenceLookup {
  hasBattle(battleTemplateId: string): boolean;
  hasCityScene(sceneId: string): boolean;
  hasTravelBoard(boardId: string): boolean;
  hasDialogue(dialogueId: string): boolean;
  hasItem(itemId: string): boolean;
  hasLocation(locationId: string): boolean;
  hasLocationNode(locationId: string, nodeId: string): boolean;
  hasScript(scriptId: string): boolean;
  hasCharacterInstance(instanceId: string): boolean;
  hasCharacterTemplate(templateId: string): boolean;
  hasEnemyTemplate(templateId: string): boolean;
  hasStatus(statusType: StatusType): boolean;
}

export interface ContentRegistrySnapshot {
  battles: Record<string, BattleTemplate>;
  cityScenes: Record<string, CitySceneData>;
  travelBoards: Record<string, TravelBoardData>;
  dialogues: Record<string, DialogueData>;
  items: Record<string, ItemData>;
  locations: Record<string, LocationData>;
  characterTemplates: Record<string, CharacterTemplate>;
  characterInstances: Record<string, CharacterInstance>;
  enemyTemplates: Record<string, EnemyTemplate>;
  statusDefinitions: Record<string, StatusDefinition>;
  defaultPartyInstanceIds: readonly string[];
}

export function createContentReferenceLookup(
  snapshot: ContentRegistrySnapshot,
  options: {
    hasScript?: (scriptId: string) => boolean;
  } = {},
): ContentReferenceLookup {
  return {
    hasBattle: (battleTemplateId) => battleTemplateId in snapshot.battles,
    hasCityScene: (sceneId) => sceneId in snapshot.cityScenes,
    hasTravelBoard: (boardId) => boardId in snapshot.travelBoards,
    hasDialogue: (dialogueId) => dialogueId in snapshot.dialogues,
    hasItem: (itemId) => itemId in snapshot.items,
    hasLocation: (locationId) => locationId in snapshot.locations,
    hasLocationNode: (locationId, nodeId) => Boolean(snapshot.locations[locationId]?.nodes[nodeId]),
    hasScript: (scriptId) => options.hasScript?.(scriptId) ?? false,
    hasCharacterInstance: (instanceId) => instanceId in snapshot.characterInstances,
    hasCharacterTemplate: (templateId) => templateId in snapshot.characterTemplates,
    hasEnemyTemplate: (templateId) => templateId in snapshot.enemyTemplates,
    hasStatus: (statusType) => statusType in snapshot.statusDefinitions,
  };
}
