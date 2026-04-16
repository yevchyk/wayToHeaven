import type { BattleTemplate } from '@engine/types/battle';
import type { CitySceneData } from '@engine/types/city';
import type { DialogueData } from '@engine/types/dialogue';
import type { ItemData } from '@engine/types/item';
import type { LootTableData } from '@engine/types/loot';
import type { QuestDefinition } from '@engine/types/quest';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import type { StatusDefinition, StatusType } from '@engine/types/status';
import type { TravelBoardData } from '@engine/types/travel';
import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';
import type { LocationData } from '@engine/types/world';

export interface ContentReferenceLookup {
  hasBattle(battleTemplateId: string): boolean;
  hasCityScene(sceneId: string): boolean;
  hasTravelBoard(boardId: string): boolean;
  hasDialogue(dialogueId: string): boolean;
  hasSceneFlow(sceneFlowId: string): boolean;
  hasItem(itemId: string): boolean;
  hasLootTable(lootTableId: string): boolean;
  hasQuest(questId: string): boolean;
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
  sceneFlows: Record<string, SceneFlowData>;
  items: Record<string, ItemData>;
  lootTables: Record<string, LootTableData>;
  quests: Record<string, QuestDefinition>;
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
  const hasSceneFlowOfMode = (sceneFlowId: string, mode: SceneFlowData['mode']) =>
    snapshot.sceneFlows[sceneFlowId]?.mode === mode;

  return {
    hasBattle: (battleTemplateId) => battleTemplateId in snapshot.battles,
    hasCityScene: (sceneId) => sceneId in snapshot.cityScenes || hasSceneFlowOfMode(sceneId, 'hub'),
    hasTravelBoard: (boardId) => boardId in snapshot.travelBoards || hasSceneFlowOfMode(boardId, 'route'),
    hasDialogue: (dialogueId) => dialogueId in snapshot.dialogues || hasSceneFlowOfMode(dialogueId, 'sequence'),
    hasSceneFlow: (sceneFlowId) => sceneFlowId in snapshot.sceneFlows,
    hasItem: (itemId) => itemId in snapshot.items,
    hasLootTable: (lootTableId) => lootTableId in snapshot.lootTables,
    hasQuest: (questId) => questId in snapshot.quests,
    hasLocation: (locationId) => locationId in snapshot.locations,
    hasLocationNode: (locationId, nodeId) => Boolean(snapshot.locations[locationId]?.nodes[nodeId]),
    hasScript: (scriptId) => options.hasScript?.(scriptId) ?? false,
    hasCharacterInstance: (instanceId) => instanceId in snapshot.characterInstances,
    hasCharacterTemplate: (templateId) => templateId in snapshot.characterTemplates,
    hasEnemyTemplate: (templateId) => templateId in snapshot.enemyTemplates,
    hasStatus: (statusType) => statusType in snapshot.statusDefinitions,
  };
}
