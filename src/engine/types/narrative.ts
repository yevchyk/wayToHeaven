import type { CharacterEmotion, SpeakerSide } from '@engine/types/dialogue';

export type NarrativeAssetKind =
  | 'background'
  | 'portrait'
  | 'cg'
  | 'overlay'
  | 'map'
  | 'music'
  | 'sfx';

export interface NarrativeAssetDefinition {
  id: string;
  kind: NarrativeAssetKind;
  chapterId: string;
  label: string;
  sourcePath?: string;
}

export type NarrativeCharacterRole = 'heroine' | 'npc';

export type PortraitPlaceholderPreset = 'default' | 'dress' | 'dress-torn' | 'dress-ripped';

export interface NarrativeCharacterOutfitDefinition {
  id: string;
  label: string;
  defaultPortraitId?: string;
  portraitRefs?: Partial<Record<CharacterEmotion, string>>;
  placeholderPreset?: PortraitPlaceholderPreset;
}

export interface NarrativeCharacterData {
  id: string;
  chapterId: string;
  displayName: string;
  role?: NarrativeCharacterRole;
  portraitRefs: Partial<Record<CharacterEmotion, string>>;
  defaultEmotion?: CharacterEmotion;
  defaultPortraitId?: string;
  defaultSide?: SpeakerSide;
  defaultOutfitId?: string;
  outfits?: Record<string, NarrativeCharacterOutfitDefinition>;
  description?: string;
}

export interface ChapterMeta {
  id: string;
  title: string;
  order: number;
  startSceneId: string;
  description?: string;
  startingBackgroundId?: string;
}

export interface SceneMeta {
  id: string;
  title: string;
  chapterId: string;
  sceneOrder: number;
  mainSceneFlowId?: string;
  description?: string;
  defaultBackgroundId?: string;
  defaultMusicId?: string;
}
