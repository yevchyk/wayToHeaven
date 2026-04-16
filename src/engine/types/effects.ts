import type { FlagValue } from '@engine/types/flags';
import type { MetaKey } from '@engine/types/meta';
import type { NarrativeProfileKey } from '@engine/types/profile';
import type { QuestDefinition } from '@engine/types/quest';
import type { RelationshipAxis, RelationshipId } from '@engine/types/relationships';
import type { DamageKind } from '@engine/types/combat';
import type { StatusCategory, StatusType } from '@engine/types/status';
import type { TagId } from '@engine/types/tags';
import type { TimeCost, TimeSegment } from '@engine/types/time';
import type { ModalId, ScreenId } from '@engine/types/ui';

export type EffectTargetScope = 'player' | 'party' | 'unit';
export type ResourceKey = 'hp' | 'mana';

export type ScriptArgumentValue = string | number | boolean | null;

export interface SetFlagEffect {
  type: 'setFlag';
  flagId?: string;
  key?: string;
  value: FlagValue;
}

export interface SetCharacterOutfitEffect {
  type: 'setCharacterOutfit';
  characterId: string;
  outfitId: string;
}

export interface UnlockSceneReplayEffect {
  type: 'unlockSceneReplay';
  sceneId: string;
}

export interface ChangeMetaEffect {
  type: 'changeMeta';
  key: MetaKey;
  delta: number;
}

export interface AddQuestEffect {
  type: 'addQuest';
  questId: QuestDefinition['id'];
}

export interface AdvanceQuestEffect {
  type: 'advanceQuest';
  questId: QuestDefinition['id'];
  delta?: number;
  objectiveId?: string;
}

export interface CompleteQuestEffect {
  type: 'completeQuest';
  questId: QuestDefinition['id'];
}

export interface ChangeStatEffect {
  type: 'changeStat';
  key: NarrativeProfileKey;
  delta: number;
}

export interface ChangeRelationshipEffect {
  type: 'changeRelationship';
  relationshipId?: RelationshipId;
  key?: string;
  axis?: RelationshipAxis;
  delta: number;
}

export interface ChangeProfileEffect {
  type: 'changeProfile';
  key: NarrativeProfileKey;
  delta: number;
}

export interface SetStatEffect {
  type: 'setStat';
  key: NarrativeProfileKey;
  value: number;
}

export interface SetProfileEffect {
  type: 'setProfile';
  key: NarrativeProfileKey;
  value: number;
}

export interface UnlockStatEffect {
  type: 'unlockStat';
  key: NarrativeProfileKey;
}

export interface UnlockProfileEffect {
  type: 'unlockProfile';
  key: NarrativeProfileKey;
}

export interface AddTagEffect {
  type: 'addTag';
  tag: TagId;
  targetScope: EffectTargetScope;
  targetId?: string;
}

export interface RemoveTagEffect {
  type: 'removeTag';
  tag: TagId;
  targetScope: EffectTargetScope;
  targetId?: string;
}

export interface GiveItemEffect {
  type: 'giveItem';
  itemId: string;
  quantity: number;
}

export interface RemoveItemEffect {
  type: 'removeItem';
  itemId: string;
  quantity: number;
}

export interface RestoreResourceEffect {
  type: 'restoreResource';
  resource: ResourceKey;
  amount: number;
  targetScope: EffectTargetScope;
  targetId?: string;
}

export interface DealDamageEffect {
  type: 'dealDamage';
  amount: number;
  targetScope: EffectTargetScope;
  damageKind?: DamageKind;
  sourceUnitId?: string;
  targetId?: string;
}

export interface RemoveStatusEffect {
  type: 'removeStatus';
  statusType: StatusType;
  targetScope: EffectTargetScope;
  targetId?: string;
}

export interface CleanseStatusesEffect {
  type: 'cleanseStatuses';
  targetScope: EffectTargetScope;
  targetId?: string;
  onlyNegative?: boolean;
  category?: StatusCategory;
  limit?: number;
}

export interface AdvanceTimeEffect extends TimeCost {
  type: 'advanceTime';
  setDay?: number;
  setHour?: number;
  setSegment?: TimeSegment;
  applyDefaultConsequences?: boolean;
}

export interface StartBattleEffect {
  type: 'startBattle';
  battleTemplateId: string;
}

export interface StartTravelBoardEffect {
  type: 'startTravelBoard';
  boardId: string;
  startNodeId?: string;
}

export interface StartMinigameEffect {
  type: 'startMinigame';
  minigameId: string;
}

export interface ChangeLocationEffect {
  type: 'changeLocation';
  locationId: string;
  nodeId?: string;
}

export interface SetBackgroundEffect {
  type: 'setBackground';
  backgroundId: string;
}

export interface PlayMusicEffect {
  type: 'playMusic';
  musicId: string;
}

export interface StopMusicEffect {
  type: 'stopMusic';
}

export interface PlaySfxEffect {
  type: 'playSfx';
  sfxId: string;
}

export interface ShowCgEffect {
  type: 'showCG';
  cgId: string;
}

export interface HideCgEffect {
  type: 'hideCG';
}

export interface SetOverlayEffect {
  type: 'setOverlay';
  overlayId: string;
}

export interface ClearOverlayEffect {
  type: 'clearOverlay';
}

export interface OpenScreenEffect {
  type: 'openScreen';
  screenId: ScreenId;
}

export interface OpenModalEffect {
  type: 'openModal';
  modalId: ModalId;
  payload?: Record<string, unknown>;
}

export interface RunScriptEffect {
  type: 'runScript';
  scriptId: string;
  args?: Record<string, ScriptArgumentValue>;
}

export interface JumpToNodeEffect {
  type: 'jumpToNode';
  nodeId: string;
}

export type GameEffect =
  | SetFlagEffect
  | SetCharacterOutfitEffect
  | UnlockSceneReplayEffect
  | ChangeMetaEffect
  | AddQuestEffect
  | AdvanceQuestEffect
  | CompleteQuestEffect
  | ChangeStatEffect
  | ChangeProfileEffect
  | ChangeRelationshipEffect
  | SetStatEffect
  | SetProfileEffect
  | UnlockStatEffect
  | UnlockProfileEffect
  | AddTagEffect
  | RemoveTagEffect
  | GiveItemEffect
  | RemoveItemEffect
  | RestoreResourceEffect
  | DealDamageEffect
  | RemoveStatusEffect
  | CleanseStatusesEffect
  | AdvanceTimeEffect
  | StartBattleEffect
  | StartTravelBoardEffect
  | StartMinigameEffect
  | ChangeLocationEffect
  | SetBackgroundEffect
  | PlayMusicEffect
  | StopMusicEffect
  | PlaySfxEffect
  | ShowCgEffect
  | HideCgEffect
  | SetOverlayEffect
  | ClearOverlayEffect
  | OpenScreenEffect
  | OpenModalEffect
  | RunScriptEffect
  | JumpToNodeEffect;

export type EffectExecutionStatus = 'applied' | 'skipped' | 'missingScript';

export interface EffectExecutionResult<TEffect extends GameEffect = GameEffect> {
  effect: TEffect;
  status: EffectExecutionStatus;
  details?: string;
  childResults?: EffectExecutionResult[];
}

export interface EffectBatchResult {
  results: EffectExecutionResult[];
  appliedCount: number;
  skippedCount: number;
  missingScriptCount: number;
}
