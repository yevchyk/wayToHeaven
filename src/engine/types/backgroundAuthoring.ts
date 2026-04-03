export interface BackgroundRuntimeReference {
  id: string;
  title: string;
  sceneId: string;
  backgroundId: string | null;
  contentFilePath: string;
  note?: string;
}

export interface BackgroundMasterLocationProfile {
  id: string;
  title: string;
  chapterId: string;
  summary: string;
  locationBlock: string;
  continuityNotes: string[];
  defaultVibeId: string;
}

export interface BackgroundRoomProfile {
  id: string;
  locationId: string;
  title: string;
  summary: string;
  locationBlock: string;
  continuityNotes: string[];
  referenceBackgroundId: string | null;
  defaultVariantId: string;
  runtimeReferences: BackgroundRuntimeReference[];
}

export interface BackgroundGeneralVibeProfile {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  compatibleLocationIds?: string[];
}

export interface BackgroundSceneEffectProfile {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  styleToken: string;
  compatibleLocationIds?: string[];
  compatibleRoomIds?: string[];
}

export interface BackgroundSituationPreset {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  compatibleLocationIds?: string[];
  compatibleRoomIds?: string[];
}

export interface BackgroundGenerationStylePack {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  negativePrompt: string;
}

export interface BackgroundPromptVariant {
  id: string;
  title: string;
  summary: string;
  promptBlock: string;
  compatibleRoomIds?: string[];
}

export interface BackgroundScenePreset {
  id: string;
  title: string;
  summary: string;
  sceneId: string;
  locationId: string;
  roomId: string;
  vibeId: string;
  situationId: string;
  stylePackId: string;
  variantId: string;
  effectIds: string[];
  referenceBackgroundId: string | null;
  contentFilePath: string;
}

export interface BackgroundPromptSelection {
  locationId: string;
  roomId: string;
  vibeId: string;
  situationId: string;
  stylePackId: string;
  variantId: string;
  effectIds: string[];
}

export interface BackgroundPromptWorkbenchData {
  locations: readonly BackgroundMasterLocationProfile[];
  rooms: readonly BackgroundRoomProfile[];
  generalVibes: readonly BackgroundGeneralVibeProfile[];
  sceneEffects: readonly BackgroundSceneEffectProfile[];
  situations: readonly BackgroundSituationPreset[];
  stylePacks: readonly BackgroundGenerationStylePack[];
  variants: readonly BackgroundPromptVariant[];
  scenePresets: readonly BackgroundScenePreset[];
}

export interface BackgroundPromptRecipe {
  fullPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  blocks: {
    generalVibe: string;
    location: string;
    sceneEffects: string;
    situation: string;
    style: string;
    variant: string;
  };
}
