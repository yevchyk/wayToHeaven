import type { Condition } from '@engine/types/conditions';
import type { GameEffect } from '@engine/types/effects';
import type { FlagValue } from '@engine/types/flags';
import type { MetaSnapshot } from '@engine/types/meta';
import type { GameStatKey, GameStatSnapshot } from '@engine/types/stats';
import type { ActionTone } from '@engine/types/actions';

export const CHARACTER_EMOTIONS = [
  'neutral',
  'stern',
  'warm',
  'angry',
  'sad',
  'fearful',
  'joyful',
  'determined',
  'calm',
  'afraid',
  'soft',
  'composed',
  'thinking',
  'playful',
  'cold',
  'cocky',
  'serious',
  'polite',
  'nervous',
  'embarrassed',
  'professional',
  'curious',
  'sharp',
  'mocking',
  'commanding',
  'cruel',
  'shocked',
  'defiant',
  'smug',
  'resigned',
  'fragile',
  'grim',
  'superior',
  'amused',
  'tired',
  'battle_ready',
  'protective',
  'broken',
  'shifty',
  'hard',
  'hateful',
  'dominant',
  'trembling',
  'falling',
  'hollow',
  'whisper',
  'hunger',
  'invasion',
  'hurt',
  'humiliated',
  'disappointed',
] as const;

export type CharacterEmotion = (typeof CHARACTER_EMOTIONS)[number];

export type Emotion = CharacterEmotion;

export type DialogueNodeType = 'dialogue' | 'narration' | 'choice' | 'event';

export type SpeakerSide = 'left' | 'right' | 'center';

export type AdultMarkerLevel = 'none' | 'suggestive' | 'explicit';

export interface AdultMarkerConfig {
  enabled: boolean;
  tags?: string[];
  level?: AdultMarkerLevel;
}

export type AdultMarker = AdultMarkerLevel | AdultMarkerConfig;

export interface StageSlotCharacter {
  speakerId: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
}

export interface StageCharacter {
  id: string;
  speakerId: string;
  side: SpeakerSide;
  portraitId?: string;
  emotion?: CharacterEmotion;
  isVisible?: boolean;
}

export interface StageState {
  characters?: StageCharacter[];
  left?: StageSlotCharacter | null;
  center?: StageSlotCharacter | null;
  right?: StageSlotCharacter | null;
  extra?: StageSlotCharacter[];
  focusCharacterId?: string;
  backgroundId?: string;
  cgId?: string;
  overlayId?: string;
}

export interface MusicAction {
  mode?: 'play' | 'stop';
  action?: 'play' | 'stop' | 'switch';
  musicId?: string;
  fadeMs?: number;
  loop?: boolean;
}

export interface SfxAction {
  sfxId?: string;
  id?: string;
  volume?: number;
  delayMs?: number;
}

export type DialogueSfx = SfxAction | readonly SfxAction[];

export interface SceneTransition {
  type: 'cut' | 'fade' | 'dissolve' | 'flash';
  durationMs?: number;
}

export interface DialogueMeta {
  chapterId?: string;
  sceneId?: string;
  sceneTitle?: string;
  title?: string;
  defaultBackgroundId?: string;
  defaultMusicId?: string;
  defaultCgId?: string;
  defaultOverlayId?: string;
}

export type DialogueEffect = GameEffect;

export interface DialogueChoice {
  id: string;
  text: string;
  tone?: ActionTone;
  conditions?: Condition[];
  effects?: DialogueEffect[];
  nextNodeId?: string;
}

export interface DialogueNodeBase {
  id: string;
  type: DialogueNodeType;
  speakerId?: string;
  speakerSide?: SpeakerSide;
  text?: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
  backgroundId?: string;
  cgId?: string;
  overlayId?: string;
  stage?: StageState;
  music?: MusicAction;
  sfx?: DialogueSfx;
  transition?: SceneTransition;
  adultMarker?: AdultMarker;
  conditions?: Condition[];
  isEnd?: boolean;
  onEnterEffects?: DialogueEffect[];
  onExitEffects?: DialogueEffect[];
  nextNodeId?: string;
}

export interface DialogueTextNode extends DialogueNodeBase {
  type: 'dialogue' | 'narration';
  text: string;
  choices?: never;
}

export interface DialogueChoiceNode extends DialogueNodeBase {
  type: 'choice';
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueEventNode extends DialogueNodeBase {
  type: 'event';
  text?: string;
  choices?: never;
}

export type DialogueNode = DialogueTextNode | DialogueChoiceNode | DialogueEventNode;

export interface DialogueData {
  id: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
  title?: string;
  speakerIds?: string[];
  meta?: DialogueMeta;
}

export interface DialogueRuntimeState {
  currentDialogueId: string | null;
  currentNodeId: string | null;
  flags: Record<string, FlagValue | undefined>;
  stats: GameStatSnapshot;
  meta: MetaSnapshot;
  currentBackgroundId: string | null;
  currentMusicId: string | null;
  currentCgId: string | null;
  currentOverlayId: string | null;
  unlockedStats: Record<GameStatKey, boolean>;
}
