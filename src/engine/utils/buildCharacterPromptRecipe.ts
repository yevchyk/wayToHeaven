import type {
  CharacterPromptEmotionNote,
  CharacterPromptRecipe,
  CharacterPromptRenderMode,
  CharacterPromptSelection,
  CharacterPromptShotProfile,
  CharacterPromptStylePack,
  CharacterPromptSubjectProfile,
  CharacterPromptTargetReference,
} from '@engine/types/characterAuthoring';

interface CharacterPromptRecipeParams {
  subject: CharacterPromptSubjectProfile;
  targetReference: CharacterPromptTargetReference;
  stylePack: CharacterPromptStylePack;
  shotProfile: CharacterPromptShotProfile;
  emotionNote?: CharacterPromptEmotionNote | undefined;
}

function compactLine(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

function buildRenderTargetBlock(targetReference: CharacterPromptTargetReference) {
  switch (targetReference.renderMode) {
    case 'composite-head':
      return compactLine([
        'Create a transparent PNG head overlay for the heroine composite rig.',
        'Keep only the face, neck transition, and any hair strands that belong to the head layer itself.',
        'Do not redraw the full body, clothes, hands, weapon, or any background.',
        targetReference.layerId ? `Target layer: ${targetReference.layerId}.` : null,
        targetReference.note,
      ]);
    case 'rig-layer':
      return compactLine([
        'Create a transparent PNG rig layer for the heroine composite system.',
        'Render only the requested isolated layer and keep the camera angle consistent with the existing heroine rig.',
        'Do not include other body parts or any background.',
        targetReference.layerId ? `Target layer: ${targetReference.layerId}.` : null,
        targetReference.note,
      ]);
    case 'flat-portrait':
    default:
      return compactLine([
        'Create a full visual novel dialogue portrait on a transparent background.',
        'Keep the portrait readable at dialogue scale with a stable silhouette and no background scene.',
        'This subject should remain a flat portrait sheet, not a layered composite rig.',
        targetReference.note,
      ]);
  }
}

function buildEmotionBlock(
  targetReference: CharacterPromptTargetReference,
  emotionNote?: CharacterPromptEmotionNote,
) {
  if (emotionNote) {
    return emotionNote.promptBlock;
  }

  if (targetReference.emotionId) {
    return `Primary emotional read: ${targetReference.emotionId}. The feeling must be immediately readable at visual novel portrait scale without needing extra props or background storytelling.`;
  }

  if (targetReference.layerId) {
    return `This asset is a structural rig layer (${targetReference.layerId}), so accuracy and continuity matter more than expressive variation.`;
  }

  return 'Keep the expression and material read stable enough that this asset can slot into the current runtime without re-authoring the surrounding scene.';
}

function buildContinuityBlock(
  subject: CharacterPromptSubjectProfile,
  targetReference: CharacterPromptTargetReference,
) {
  return compactLine([
    ...subject.continuityNotes,
    `Replace or create the runtime target at ${targetReference.assetFieldPath}.`,
    `Content file: ${targetReference.contentFilePath}.`,
    targetReference.assetId ? `Asset id: ${targetReference.assetId}.` : null,
  ]);
}

export function buildCharacterPromptRecipe({
  subject,
  targetReference,
  stylePack,
  shotProfile,
  emotionNote,
}: CharacterPromptRecipeParams): CharacterPromptRecipe {
  const blocks = {
    identity: subject.identityBlock,
    renderTarget: buildRenderTargetBlock(targetReference),
    emotion: buildEmotionBlock(targetReference, emotionNote),
    style: stylePack.promptBlock,
    shot: shotProfile.promptBlock,
    continuity: buildContinuityBlock(subject, targetReference),
  };

  const fullPrompt = [
    'Create production-ready character art for WeyToHeaven.',
    `Subject identity: ${blocks.identity}`,
    `Render target: ${blocks.renderTarget}`,
    `Expression or layer goal: ${blocks.emotion}`,
    `Style pack: ${blocks.style}`,
    `Framing: ${blocks.shot}`,
    `Continuity constraints: ${blocks.continuity}`,
  ].join('\n\n');

  const shortPrompt = compactLine([
    'WeyToHeaven character art.',
    blocks.identity,
    blocks.renderTarget,
    blocks.emotion,
    blocks.style,
    blocks.shot,
  ]);

  return {
    fullPrompt,
    shortPrompt,
    negativePrompt: stylePack.negativePrompt,
    blocks,
  };
}

export function resolveCharacterPromptSelection(
  selection: CharacterPromptSelection,
  profiles: {
    subjects: Record<string, CharacterPromptSubjectProfile>;
    targets: Record<string, CharacterPromptTargetReference>;
    stylePacks: Record<string, CharacterPromptStylePack>;
    shotProfiles: Record<string, CharacterPromptShotProfile>;
    emotionNotes: Record<string, CharacterPromptEmotionNote>;
  },
) {
  const subject = profiles.subjects[selection.subjectId];
  const targetReference = profiles.targets[selection.targetReferenceId];
  const stylePack = profiles.stylePacks[selection.stylePackId];
  const shotProfile = profiles.shotProfiles[selection.shotId];
  const emotionNote =
    targetReference?.emotionId ? profiles.emotionNotes[targetReference.emotionId] : undefined;

  return {
    subject,
    targetReference,
    stylePack,
    shotProfile,
    emotionNote,
  };
}

export function matchesRenderMode(
  entry: { compatibleRenderModes?: readonly CharacterPromptRenderMode[] },
  renderMode: CharacterPromptRenderMode,
) {
  return !entry.compatibleRenderModes || entry.compatibleRenderModes.includes(renderMode);
}
