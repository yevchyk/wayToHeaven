import type { EquippedItemIds } from '@engine/types/appearance';
import type { BattleRuntime } from '@engine/types/battle';
import type { MiniGameStoreSnapshot } from '@engine/types/minigame';
import type { ActiveModal, OverlayId, ScreenId } from '@engine/types/ui';
import type { MetaSnapshot } from '@engine/types/meta';
import type { BacklogEntry, DialogueSkipMode } from '@engine/types/playerShell';
import type {
  NarrativeProfileSnapshot,
  NarrativeProfileUnlockSnapshot,
} from '@engine/types/profile';
import type { QuestSnapshot } from '@engine/types/quest';
import type { RelationshipSnapshot } from '@engine/types/relationships';
import type {
  SceneFlowPresentationState,
  SceneFlowSession,
} from '@engine/types/sceneFlow';
import type { PartyUnitRuntime } from '@engine/types/unit';
import type { WorldVisit } from '@engine/types/world';
import type { ProgressionSnapshot } from '@engine/types/progression';
import type { TimeSnapshot } from '@engine/types/time';

export const GAME_SAVE_SCHEMA_VERSION = 8;

export type GameSaveSlotKind = 'manual' | 'quick' | 'auto';

export interface UISnapshot {
  activeScreen: ScreenId;
  activeModal: ActiveModal | null;
  overlays: OverlayId[];
}

export interface WorldSnapshot {
  currentLocationId: string | null;
  currentNodeId: string | null;
  availableTransitionNodeIds: string[];
  visitHistory: WorldVisit[];
  triggeredInteractionNodeIds: string[];
}

export interface InventorySnapshot {
  itemCounts: Record<string, number>;
}

export interface FlagsSnapshot {
  booleanFlags: Record<string, boolean>;
  numericFlags: Record<string, number>;
  stringFlags: Record<string, string>;
  setFlags: Record<string, string[]>;
}

export interface PartySnapshot {
  rosterIds: string[];
  activePartyIds: string[];
  reservePartyIds: string[];
  selectedCharacterId: string | null;
  unitStates: PartyUnitRuntime[];
  equippedItemsByUnitId: Record<string, EquippedItemIds>;
}

export interface AppearanceSnapshot {
  outfitOverridesByCharacterId: Record<string, string>;
}

export interface SceneFlowSnapshot {
  flowStack: SceneFlowSession[];
  visitedHubFlowIds: string[];
  triggeredHubTransitionKeys: string[];
  ambientPresentation: SceneFlowPresentationState;
}

export interface DialogueRuntimeSnapshot {
  revealedCharacterCount: number;
  activeTextPageIndex?: number;
  autoModeEnabled: boolean;
  skipMode: DialogueSkipMode;
  currentNodeWasSeenOnEnter: boolean;
}

export interface SeenContentSnapshot {
  sceneFlowIds: string[];
  nodeKeys: string[];
  discoveredCharacterIds: string[];
  discoveredLocationEntryIds: string[];
  discoveredSceneEntryIds?: string[];
}

export interface BacklogSnapshot {
  entries: BacklogEntry[];
}

export interface QuestStoreSnapshot {
  states: QuestSnapshot;
}

export interface BattleStoreSnapshot {
  battleRuntime: BattleRuntime | null;
  returnScreenId: ScreenId | null;
  pendingBattleTemplateId: string | null;
}

export interface GameSaveSummary {
  slotId: string;
  kind: GameSaveSlotKind;
  label: string;
  savedAt: string;
  schemaVersion: number;
  activeScreen: ScreenId;
  activeRuntimeLayer: string;
  sceneId: string | null;
  flowId: string | null;
  nodeId: string | null;
  battleId: string | null;
}

export interface GameSaveRuntimeSnapshot {
  ui: UISnapshot;
  world: WorldSnapshot;
  meta: MetaSnapshot;
  time?: TimeSnapshot;
  profile: NarrativeProfileSnapshot;
  profileUnlocks: NarrativeProfileUnlockSnapshot;
  relationships: RelationshipSnapshot;
  stats?: NarrativeProfileSnapshot;
  statUnlocks?: NarrativeProfileUnlockSnapshot;
  flags: FlagsSnapshot;
  inventory: InventorySnapshot;
  party: PartySnapshot;
  appearance: AppearanceSnapshot;
  sceneFlow: SceneFlowSnapshot;
  dialogue: DialogueRuntimeSnapshot;
  battle: BattleStoreSnapshot;
  progression?: ProgressionSnapshot;
  miniGame?: MiniGameStoreSnapshot;
  quests?: QuestStoreSnapshot;
  backlog: BacklogSnapshot;
  seenContent: SeenContentSnapshot;
}

export interface GameSaveSnapshot {
  schemaVersion: number;
  summary: GameSaveSummary;
  runtime: GameSaveRuntimeSnapshot;
  rng: {
    mode: 'stateless';
  };
}
