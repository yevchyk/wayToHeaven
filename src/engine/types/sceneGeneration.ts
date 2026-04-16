import type { ActionTone } from '@engine/types/actions';
import type { Condition } from '@engine/types/conditions';
import type {
  CharacterEmotion,
  DialogueNodeType,
  DialogueSfx,
  MusicAction,
  SceneTransition,
  SpeakerSide,
  StageCharacterPlacement,
} from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';
import type { TimeCost } from '@engine/types/time';

export const SCENE_GENERATION_SCHEMA_VERSION = 1 as const;

export type SceneGenerationSchemaVersion = typeof SCENE_GENERATION_SCHEMA_VERSION;

export interface SceneGenerationMeta {
  chapterId: string;
  language?: string;
  defaultBackgroundId?: string;
  defaultBackgroundStyle?: string | null;
  defaultMusicId?: string;
  defaultCgId?: string;
  defaultOverlayId?: string;
  defaultStage?: SceneGenerationStageState;
  notes?: string;
}

export interface SceneGenerationStageCharacter {
  speakerId: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
  outfitId?: string;
  isVisible?: boolean;
  placement?: StageCharacterPlacement;
}

export interface SceneGenerationStageState {
  characters?: SceneGenerationStageCharacter[];
  focusCharacterId?: string;
}

export interface SceneGenerationBackgroundChange {
  image: string;
  transition?: 'cut' | 'fade' | 'dissolve' | 'flash';
  style?: string | null;
}

export interface SceneGenerationSceneChange {
  stage?: SceneGenerationStageState | null;
  background?: SceneGenerationBackgroundChange;
  music?: MusicAction;
  cgId?: string | null;
  overlayId?: string | null;
  sfx?: DialogueSfx;
  transition?: SceneTransition;
}

export interface SceneGenerationFallbackTarget {
  nextNodeId?: string;
  nextSceneId?: string;
  openSceneFlowId?: string;
  end?: boolean;
}

export interface SceneGenerationEncounter {
  kind: 'battle' | 'dialogue' | 'loot' | 'script' | 'effects' | 'exit' | 'none';
  battleTemplateId?: string;
  dialogueId?: string;
  openSceneFlowId?: string;
  scriptId?: string;
  itemId?: string;
  itemQuantity?: number;
  effects?: GameEffect[];
  completesFlow?: boolean;
}

export interface SceneGenerationRouteLayout {
  x: number;
  y: number;
  hidden?: boolean;
  oneTime?: boolean;
  tags?: string[];
}

export interface SceneGenerationRouteRules {
  rollRange?: {
    min: number;
    max: number;
  };
  scoutCharges?: number;
  scoutDepth?: number;
  revealNonHiddenAtStart?: boolean;
  stepTimeCost?: TimeCost;
}

export interface SceneGenerationReplayConfig {
  enabled: boolean;
  unlockOnStart?: boolean;
}

export interface SceneGenerationChoice {
  id: string;
  text: string;
  description?: string;
  tone?: ActionTone;
  timeCost?: TimeCost;
  conditions?: Condition[];
  effects?: GameEffect[];
  nextNodeId?: string;
  nextSceneId?: string;
  openSceneFlowId?: string;
  once?: boolean;
  tags?: string[];
}

export interface SceneGenerationNode {
  id: string;
  type: DialogueNodeType;
  title?: string;
  speakerId?: string;
  speakerSide?: SpeakerSide;
  emotion?: CharacterEmotion;
  portraitId?: string;
  backgroundId?: string;
  cgId?: string;
  overlayId?: string;
  music?: MusicAction;
  sfx?: DialogueSfx;
  transition?: SceneTransition;
  stage?: SceneGenerationStageState;
  text?: string;
  conditions?: Condition[];
  onConditionFail?: SceneGenerationFallbackTarget;
  onEnterEffects?: GameEffect[];
  onExitEffects?: GameEffect[];
  sceneChange?: SceneGenerationSceneChange;
  choices?: SceneGenerationChoice[];
  nextNodeId?: string;
  nextSceneId?: string;
  openSceneFlowId?: string;
  isEnd?: boolean;
  tags?: string[];
  encounter?: SceneGenerationEncounter;
  route?: SceneGenerationRouteLayout;
}

export interface SceneGenerationScene {
  id: string;
  mode?: 'sequence' | 'hub' | 'route';
  title?: string;
  description?: string;
  cityId?: string;
  cityName?: string;
  locationName?: string;
  districtLabel?: string;
  statusLabel?: string;
  startNodeId: string;
  backgroundId?: string;
  backgroundStyle?: string | null;
  cgId?: string;
  overlayId?: string;
  music?: MusicAction;
  stage?: SceneGenerationStageState;
  transition?: SceneTransition;
  conditions?: Condition[];
  onConditionFail?: SceneGenerationFallbackTarget;
  tags?: string[];
  routeRules?: SceneGenerationRouteRules;
  replay?: SceneGenerationReplayConfig;
  nodes: Record<string, SceneGenerationNode>;
}

export interface SceneGenerationDocument {
  id: string;
  schemaVersion: SceneGenerationSchemaVersion;
  title: string;
  meta: SceneGenerationMeta;
  scenes: Record<string, SceneGenerationScene>;
}






















