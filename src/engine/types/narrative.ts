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

export interface NarrativeCharacterData {
  id: string;
  chapterId: string;
  displayName: string;
  portraitRefs: Partial<Record<CharacterEmotion, string>>;
  defaultEmotion?: CharacterEmotion;
  defaultPortraitId?: string;
  defaultSide?: SpeakerSide;
  description?: string;
}

export interface ChapterMeta {
  id: string;
  title: string;
  order: number;
  startSceneId: string;
  description?: string;
  startDialogueId?: string;
  startingBackgroundId?: string;
}

export interface SceneMeta {
  id: string;
  title: string;
  chapterId: string;
  sceneOrder: number;
  mainDialogueId: string;
  description?: string;
  defaultBackgroundId?: string;
  defaultMusicId?: string;
}
