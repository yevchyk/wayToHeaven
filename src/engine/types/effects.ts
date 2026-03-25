import type { FlagValue } from '@engine/types/flags';
import type { MetaKey } from '@engine/types/meta';
import type { GameStatKey } from '@engine/types/stats';
import type { TagId } from '@engine/types/tags';
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

export interface ChangeMetaEffect {
  type: 'changeMeta';
  key: MetaKey;
  delta: number;
}

export interface ChangeStatEffect {
  type: 'changeStat';
  key: GameStatKey;
  delta: number;
}

export interface SetStatEffect {
  type: 'setStat';
  key: GameStatKey;
  value: number;
}

export interface UnlockStatEffect {
  type: 'unlockStat';
  key: GameStatKey;
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

export interface StartBattleEffect {
  type: 'startBattle';
  battleTemplateId: string;
}

export interface StartTravelBoardEffect {
  type: 'startTravelBoard';
  boardId: string;
  startNodeId?: string;
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
  | ChangeMetaEffect
  | ChangeStatEffect
  | SetStatEffect
  | UnlockStatEffect
  | AddTagEffect
  | RemoveTagEffect
  | GiveItemEffect
  | RemoveItemEffect
  | RestoreResourceEffect
  | StartBattleEffect
  | StartTravelBoardEffect
  | ChangeLocationEffect
  | SetBackgroundEffect
  | PlayMusicEffect
  | StopMusicEffect
  | PlaySfxEffect
  | ShowCgEffect
  | HideCgEffect
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
