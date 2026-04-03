import type {
  BackgroundGeneralVibeProfile,
  BackgroundGenerationStylePack,
  BackgroundMasterLocationProfile,
  BackgroundPromptRecipe,
  BackgroundPromptSelection,
  BackgroundPromptVariant,
  BackgroundRoomProfile,
  BackgroundSceneEffectProfile,
  BackgroundSituationPreset,
} from '@engine/types/backgroundAuthoring';

interface BackgroundPromptRecipeParams {
  location: BackgroundMasterLocationProfile;
  room: BackgroundRoomProfile;
  generalVibe: BackgroundGeneralVibeProfile;
  sceneEffects: readonly BackgroundSceneEffectProfile[];
  situation: BackgroundSituationPreset;
  stylePack: BackgroundGenerationStylePack;
  variant: BackgroundPromptVariant;
}

function compactLine(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

function buildLocationBlock(params: {
  location: BackgroundMasterLocationProfile;
  room: BackgroundRoomProfile;
}) {
  return compactLine([
    `Base location: ${params.location.title}.`,
    params.location.locationBlock,
    `Current room or zone: ${params.room.title}.`,
    params.room.locationBlock,
  ]);
}

function buildSceneEffectsBlock(sceneEffects: readonly BackgroundSceneEffectProfile[]) {
  return compactLine(sceneEffects.map((sceneEffect) => sceneEffect.promptBlock));
}

export function buildBackgroundPromptRecipe({
  location,
  room,
  generalVibe,
  sceneEffects,
  situation,
  stylePack,
  variant,
}: BackgroundPromptRecipeParams): BackgroundPromptRecipe {
  const sceneEffectsBlock = buildSceneEffectsBlock(sceneEffects);
  const blocks = {
    generalVibe: generalVibe.promptBlock,
    location: buildLocationBlock({ location, room }),
    sceneEffects: sceneEffectsBlock,
    situation: situation.promptBlock,
    style: stylePack.promptBlock,
    variant: variant.promptBlock,
  };

  const fullPrompt = [
    'Create a high-end visual novel background for WeyToHeaven.',
    `General vibe: ${blocks.generalVibe}`,
    `Location foundation: ${blocks.location}`,
    ...(blocks.sceneEffects ? [`Scene effects: ${blocks.sceneEffects}`] : []),
    `Current situation: ${blocks.situation}`,
    `Generation style: ${blocks.style}`,
    `Shot variant: ${blocks.variant}`,
  ].join('\n\n');

  const shortPrompt = compactLine([
    'Dark fantasy visual novel background.',
    blocks.generalVibe,
    blocks.location,
    blocks.sceneEffects,
    blocks.situation,
    blocks.style,
    blocks.variant,
  ]);

  return {
    fullPrompt,
    shortPrompt,
    negativePrompt: stylePack.negativePrompt,
    blocks,
  };
}

export function resolveBackgroundPromptSelection(
  selection: BackgroundPromptSelection,
  profiles: {
    locations: Record<string, BackgroundMasterLocationProfile>;
    rooms: Record<string, BackgroundRoomProfile>;
    generalVibes: Record<string, BackgroundGeneralVibeProfile>;
    situations: Record<string, BackgroundSituationPreset>;
    stylePacks: Record<string, BackgroundGenerationStylePack>;
    variants: Record<string, BackgroundPromptVariant>;
  },
) {
  return {
    location: profiles.locations[selection.locationId],
    room: profiles.rooms[selection.roomId],
    generalVibe: profiles.generalVibes[selection.vibeId],
    situation: profiles.situations[selection.situationId],
    stylePack: profiles.stylePacks[selection.stylePackId],
    variant: profiles.variants[selection.variantId],
  };
}
