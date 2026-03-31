import type { ActionTone } from '@engine/types/actions';
import type { Condition } from '@engine/types/conditions';
import type {
  CharacterEmotion,
  DialogueNodeType,
  DialogueSfx,
  MusicAction,
  SceneTransition,
  SpeakerSide,
} from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';

export const SCENE_GENERATION_SCHEMA_VERSION = 1 as const;

export type SceneGenerationSchemaVersion = typeof SCENE_GENERATION_SCHEMA_VERSION;

export interface SceneGenerationMeta {
  chapterId: string;
  defaultBackgroundId?: string;
  defaultMusicId?: string;
  defaultCgId?: string;
  defaultOverlayId?: string;
  defaultStage?: SceneGenerationStageState;
}

export interface SceneGenerationStageCharacter {
  speakerId: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
  outfitId?: string;
  isVisible?: boolean;
}

export interface SceneGenerationStageState {
  characters?: SceneGenerationStageCharacter[];
  focusCharacterId?: string;
}

export interface SceneGenerationBackgroundChange {
  image: string;
  transition?: 'cut' | 'fade' | 'dissolve' | 'flash';
  style?: string;
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
}

export interface SceneGenerationChoice {
  id: string;
  text: string;
  description?: string;
  tone?: ActionTone;
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
  cgId?: string;
  overlayId?: string;
  music?: MusicAction;
  stage?: SceneGenerationStageState;
  transition?: SceneTransition;
  conditions?: Condition[];
  onConditionFail?: SceneGenerationFallbackTarget;
  tags?: string[];
  routeRules?: SceneGenerationRouteRules;
  nodes: Record<string, SceneGenerationNode>;
}

export interface SceneGenerationDocument {
  id: string;
  schemaVersion: SceneGenerationSchemaVersion;
  title: string;
  meta: SceneGenerationMeta;
  scenes: Record<string, SceneGenerationScene>;
}
