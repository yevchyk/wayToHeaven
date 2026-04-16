import type { CharacterEmotion } from '@engine/types/dialogue';

export type CharacterPromptRenderMode = 'flat-portrait' | 'composite-head' | 'rig-layer';

export interface CharacterPromptSubjectProfile {
  id: string;
  characterId: string;
  chapterId: string;
  displayName: string;
  summary: string;
  primaryRenderMode: CharacterPromptRenderMode;
  identityBlock: string;
  continuityNotes: string[];
  defaultStylePackId: string;
}

export interface CharacterPromptTargetReference {
  id: string;
  subjectId: string;
  title: string;
  summary: string;
  renderMode: CharacterPromptRenderMode;
  assetId: string | null;
  sourcePath?: string | undefined;
  contentFilePath: string;
  assetFieldPath: string;
  emotionId?: CharacterEmotion | undefined;
  layerId?: string | undefined;
  note?: string | undefined;
}

export interface CharacterPromptStylePack {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  negativePrompt: string;
  compatibleRenderModes?: readonly CharacterPromptRenderMode[];
}

export interface CharacterPromptShotProfile {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  compatibleRenderModes?: readonly CharacterPromptRenderMode[];
}

export interface CharacterPromptEmotionNote {
  id: string;
  title: string;
  promptBlock: string;
}

export interface CharacterPromptWorkbenchData {
  subjects: readonly CharacterPromptSubjectProfile[];
  targetReferences: readonly CharacterPromptTargetReference[];
  stylePacks: readonly CharacterPromptStylePack[];
  shotProfiles: readonly CharacterPromptShotProfile[];
  emotionNotes: readonly CharacterPromptEmotionNote[];
}

export interface CharacterPromptSelection {
  subjectId: string;
  targetReferenceId: string;
  stylePackId: string;
  shotId: string;
}

export interface CharacterPromptRecipe {
  fullPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  blocks: {
    identity: string;
    renderTarget: string;
    emotion: string;
    style: string;
    shot: string;
    continuity: string;
  };
}
