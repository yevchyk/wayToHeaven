import type { ActionTone } from '@engine/types/actions';
import type { Condition } from '@engine/types/conditions';
import type {
  CharacterEmotion,
  DialogueSfx,
  DialogueNodeType,
  MusicAction,
  SceneTransition,
  SpeakerSide,
  StageState,
} from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';
import type {
  TravelBoardPhase,
  TravelLogEntry,
  TravelNodeType,
} from '@engine/types/travel';
import type { ScreenId } from '@engine/types/ui';

export type SceneFlowSourceType = 'dialogue' | 'travelBoard' | 'cityScene' | 'sceneGeneration';
export type SceneFlowMode = 'sequence' | 'route' | 'hub';
export type SceneFlowNodeKind = 'line' | 'choice' | 'event' | 'route';
export type SceneFlowEncounterKind =
  | 'battle'
  | 'dialogue'
  | 'loot'
  | 'script'
  | 'effects'
  | 'exit'
  | 'none';

export interface SceneFlowSourceRef {
  type: SceneFlowSourceType;
  id: string;
}

export interface SceneFlowFallbackTarget {
  nextNodeId?: string;
  nextSceneId?: string;
  openSceneFlowId?: string;
  end?: boolean;
}

export interface SceneFlowTransition {
  id: string;
  label?: string;
  tone?: ActionTone;
  description?: string;
  conditions?: Condition[];
  effects?: GameEffect[];
  nextNodeId?: string;
  nextSceneId?: string;
  openSceneFlowId?: string;
  once?: boolean;
  tags?: string[];
}

export interface SceneFlowEncounter {
  kind: SceneFlowEncounterKind;
  battleTemplateId?: string;
  dialogueId?: string;
  openSceneFlowId?: string;
  scriptId?: string;
  itemId?: string;
  itemQuantity?: number;
  effects?: GameEffect[];
  completesFlow?: boolean;
}

export interface SceneFlowRouteLayout {
  x: number;
  y: number;
  hidden?: boolean;
  oneTime?: boolean;
  tags?: string[];
}

export interface SceneFlowBackgroundPatch {
  image: string;
  transition?: SceneTransition;
  style?: string | null;
}

export interface SceneFlowPresentationPatch {
  stage?: StageState | null;
  background?: SceneFlowBackgroundPatch;
  music?: MusicAction;
  cgId?: string | null;
  overlayId?: string | null;
  sfx?: DialogueSfx;
  transition?: SceneTransition;
}

export interface SceneFlowNode {
  id: string;
  kind: SceneFlowNodeKind;
  sourceNodeType?: DialogueNodeType | TravelNodeType;
  title?: string;
  text?: string;
  speakerId?: string;
  speakerSide?: SpeakerSide;
  emotion?: CharacterEmotion;
  portraitId?: string;
  backgroundId?: string;
  cgId?: string;
  overlayId?: string;
  music?: MusicAction;
  sfx?: DialogueSfx;
  stage?: StageState;
  transition?: SceneTransition;
  tags?: string[];
  conditions?: Condition[];
  onConditionFail?: SceneFlowFallbackTarget;
  presentationPatch?: SceneFlowPresentationPatch;
  onEnterEffects?: GameEffect[];
  onExitEffects?: GameEffect[];
  transitions: SceneFlowTransition[];
  encounter?: SceneFlowEncounter;
  route?: SceneFlowRouteLayout;
}

export interface SceneFlowRouteRules {
  rollRange?: {
    min: number;
    max: number;
  };
  scoutCharges?: number;
  scoutDepth?: number;
  revealNonHiddenAtStart?: boolean;
}

export interface SceneFlowHubMeta {
  cityId?: string;
  cityName?: string;
  locationName?: string;
  districtLabel?: string;
  statusLabel?: string;
}

export interface SceneFlowData {
  id: string;
  title: string;
  mode: SceneFlowMode;
  startNodeId: string;
  nodes: Record<string, SceneFlowNode>;
  source: SceneFlowSourceRef;
  chapterId?: string;
  description?: string;
  tags?: string[];
  conditions?: Condition[];
  onConditionFail?: SceneFlowFallbackTarget;
  defaultBackgroundId?: string;
  defaultBackgroundStyle?: string | null;
  defaultMusicId?: string;
  defaultMusic?: MusicAction;
  defaultCgId?: string;
  defaultOverlayId?: string;
  defaultStage?: StageState;
  defaultTransition?: SceneTransition;
  hubMeta?: SceneFlowHubMeta;
  routeRules?: SceneFlowRouteRules;
}

export interface SceneFlowPresentationState {
  backgroundId: string | null;
  musicId: string | null;
  cgId: string | null;
  overlayId: string | null;
  lastSfxId: string | null;
  currentStage: StageState | null;
  backgroundStyle: string | null;
  activeTransition: SceneTransition | null;
}

export interface SceneFlowRouteRuntime {
  phase: TravelBoardPhase;
  revealedNodeIds: string[];
  visitedNodeIds: string[];
  resolvedNodeIds: string[];
  remainingSteps: number;
  lastRoll: number | null;
  scoutCharges: number;
  scoutDepth: number;
  eventLog: TravelLogEntry[];
}

export interface SceneFlowSession {
  sessionId: string;
  flowId: string;
  mode: SceneFlowMode;
  sourceType: SceneFlowSourceType;
  sceneId: string | null;
  currentNodeId: string;
  visibleTransitionIds: string[];
  visitedNodeIds: string[];
  pendingJumpNodeId: string | null;
  returnScreenId: ScreenId | null;
  presentation: SceneFlowPresentationState;
  routeRuntime: SceneFlowRouteRuntime | null;
}
