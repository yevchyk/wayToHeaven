import type { DialogueStore } from '@engine/stores/DialogueStore';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  CharacterEmotion,
  SpeakerSide,
  StageCharacter,
  StageSlotCharacter,
} from '@engine/types/dialogue';

const narrativeImageModules = import.meta.glob('/src/content/chapters/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'avif'] as const;

interface CharacterCandidate {
  speakerId: string;
  displayName: string;
  emotion: CharacterEmotion | null;
  portraitId: string | null;
  preferredSide: SpeakerSide | null;
}

interface CharacterCandidateInput {
  speakerId?: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
  preferredSide?: SpeakerSide | null;
}

export interface DialogueVisualAsset {
  assetId: string | null;
  kind: 'background' | 'portrait';
  label: string;
  url: string | null;
  isPlaceholder: boolean;
}

export interface DialoguePortraitSlot {
  side: 'left' | 'right';
  displayName: string | null;
  portrait: DialogueVisualAsset;
  isActive: boolean;
}

function humanizeValue(value: string) {
  return value
    .replace(/\.[^.]+$/, '')
    .split(/[\/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

function normalizeModulePath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return normalizedPath.replace(/\/+/g, '/');
}

function buildConventionalModulePaths(assetId: string) {
  if (!assetId.startsWith('chapter-')) {
    return [];
  }

  const [chapterId, assetFolder, ...restParts] = assetId.split('/');
  const relativeAssetPath = restParts.join('/');

  if (!relativeAssetPath) {
    return [];
  }

  const assetBasePath = relativeAssetPath.replace(/\.(png|webp|jpg|jpeg|avif)$/i, '');
  const explicitPath = /\.(png|webp|jpg|jpeg|avif)$/i.test(relativeAssetPath)
    ? [`/src/content/chapters/${chapterId}/images/${assetFolder}/${relativeAssetPath}`]
    : [];
  const extensionVariants = IMAGE_EXTENSIONS.map(
    (extension) => `/src/content/chapters/${chapterId}/images/${assetFolder}/${assetBasePath}.${extension}`,
  );

  return uniqueValues([...explicitPath, ...extensionVariants].map(normalizeModulePath));
}

function resolveAssetUrl(rootStore: GameRootStore, assetId: string | null) {
  if (!assetId) {
    return null;
  }

  const assetDefinition = rootStore.getNarrativeAssetById(assetId);
  const candidatePaths = uniqueValues(
    [
      assetDefinition?.sourcePath ? normalizeModulePath(assetDefinition.sourcePath) : null,
      ...buildConventionalModulePaths(assetId),
    ].filter((value): value is string => Boolean(value)),
  );

  for (const candidatePath of candidatePaths) {
    const resolvedUrl = narrativeImageModules[candidatePath];

    if (resolvedUrl) {
      return resolvedUrl;
    }
  }

  return null;
}

function resolveAssetLabel(rootStore: GameRootStore, assetId: string | null, fallbackLabel: string) {
  if (!assetId) {
    return fallbackLabel;
  }

  return rootStore.getNarrativeAssetById(assetId)?.label ?? humanizeValue(assetId) ?? fallbackLabel;
}

function resolvePortraitId(
  rootStore: GameRootStore,
  speakerId: string,
  emotion: CharacterEmotion | null,
  portraitId: string | null,
) {
  if (portraitId) {
    return portraitId;
  }

  const character = rootStore.getNarrativeCharacterById(speakerId);

  if (!character) {
    return null;
  }

  if (emotion && character.portraitRefs[emotion]) {
    return character.portraitRefs[emotion] ?? null;
  }

  return character.defaultPortraitId ?? null;
}

function resolveDisplayName(rootStore: GameRootStore, speakerId: string) {
  return rootStore.getNarrativeCharacterById(speakerId)?.displayName ?? formatSpeakerLabel(speakerId) ?? speakerId;
}

function toCandidateInput(
  entry: {
    speakerId: string;
    emotion?: CharacterEmotion;
    portraitId?: string;
  },
  preferredSide?: SpeakerSide | null,
): CharacterCandidateInput {
  const candidateInput: CharacterCandidateInput = {
    speakerId: entry.speakerId,
  };

  if (entry.emotion) {
    candidateInput.emotion = entry.emotion;
  }

  if (entry.portraitId) {
    candidateInput.portraitId = entry.portraitId;
  }

  if (preferredSide !== undefined) {
    candidateInput.preferredSide = preferredSide;
  }

  return candidateInput;
}

function upsertCandidate(
  rootStore: GameRootStore,
  candidates: Map<string, CharacterCandidate>,
  candidateOrder: string[],
  entry: CharacterCandidateInput,
) {
  if (!entry.speakerId) {
    return;
  }

  const existing = candidates.get(entry.speakerId);
  const character = rootStore.getNarrativeCharacterById(entry.speakerId);
  const nextEmotion = entry.emotion ?? existing?.emotion ?? character?.defaultEmotion ?? null;
  const nextPortraitId =
    entry.portraitId ??
    resolvePortraitId(rootStore, entry.speakerId, nextEmotion, existing?.portraitId ?? null) ??
    existing?.portraitId ??
    null;
  const nextPreferredSide = entry.preferredSide ?? existing?.preferredSide ?? character?.defaultSide ?? null;
  const nextCandidate: CharacterCandidate = {
    speakerId: entry.speakerId,
    displayName: resolveDisplayName(rootStore, entry.speakerId),
    emotion: nextEmotion,
    portraitId: nextPortraitId,
    preferredSide: nextPreferredSide,
  };

  if (!existing) {
    candidateOrder.push(entry.speakerId);
  }

  candidates.set(entry.speakerId, nextCandidate);
}

function resolveCurrentSpeakerSide(
  currentSpeakerId: string,
  currentSpeakerSide: SpeakerSide | null,
  currentSpeaker: CharacterCandidate,
  slotAssignments: Partial<Record<'left' | 'right', string>>,
) {
  if (currentSpeakerSide === 'left' || currentSpeakerSide === 'right') {
    return currentSpeakerSide;
  }

  if (slotAssignments.left === currentSpeakerId) {
    return 'left';
  }

  if (slotAssignments.right === currentSpeakerId) {
    return 'right';
  }

  if (currentSpeaker.preferredSide === 'left' || currentSpeaker.preferredSide === 'right') {
    return currentSpeaker.preferredSide;
  }

  return currentSpeakerSide === 'center' ? 'right' : 'right';
}

function selectNextCandidate(
  candidates: Map<string, CharacterCandidate>,
  candidateOrder: string[],
  assignedSpeakerIds: Set<string>,
  preferredSide: 'left' | 'right',
) {
  const remainingCandidates = candidateOrder
    .map((speakerId) => candidates.get(speakerId) ?? null)
    .filter((candidate): candidate is CharacterCandidate => Boolean(candidate))
    .filter((candidate) => !assignedSpeakerIds.has(candidate.speakerId));

  const preferredCandidate = remainingCandidates.find((candidate) => candidate.preferredSide === preferredSide);

  return preferredCandidate ?? remainingCandidates[0] ?? null;
}

export function resolveNarrativeVisualAsset(
  rootStore: GameRootStore,
  assetId: string | null,
  kind: 'background' | 'portrait',
  fallbackLabel: string,
): DialogueVisualAsset {
  const url = resolveAssetUrl(rootStore, assetId);

  return {
    assetId,
    kind,
    label: resolveAssetLabel(rootStore, assetId, fallbackLabel),
    url,
    isPlaceholder: !url,
  };
}

function buildSlot(
  rootStore: GameRootStore,
  side: 'left' | 'right',
  speakerId: string | null,
  candidates: Map<string, CharacterCandidate>,
  currentSpeakerId: string | null,
): DialoguePortraitSlot {
  if (!speakerId) {
    return {
      side,
      displayName: null,
      portrait: {
        assetId: null,
        kind: 'portrait',
        label: 'Scene Partner',
        url: null,
        isPlaceholder: true,
      },
      isActive: false,
    };
  }

  const candidate = candidates.get(speakerId);
  const displayName = candidate?.displayName ?? resolveDisplayName(rootStore, speakerId);
  const portrait = resolveNarrativeVisualAsset(
    rootStore,
    candidate?.portraitId ?? null,
    'portrait',
    displayName,
  );

  return {
    side,
    displayName,
    portrait,
    isActive: speakerId === currentSpeakerId,
  };
}

function collectStageCandidates(
  rootStore: GameRootStore,
  dialogue: DialogueStore,
  candidates: Map<string, CharacterCandidate>,
  candidateOrder: string[],
) {
  const stage = dialogue.currentStage;

  const stageCharacters: StageCharacter[] = stage?.characters ?? [];
  const extraCharacters: StageSlotCharacter[] = stage?.extra ?? [];

  if (stage?.left) {
    upsertCandidate(rootStore, candidates, candidateOrder, toCandidateInput(stage.left, 'left'));
  }

  if (stage?.center) {
    upsertCandidate(rootStore, candidates, candidateOrder, toCandidateInput(stage.center, 'center'));
  }

  if (stage?.right) {
    upsertCandidate(rootStore, candidates, candidateOrder, toCandidateInput(stage.right, 'right'));
  }

  for (const character of stageCharacters) {
    upsertCandidate(rootStore, candidates, candidateOrder, toCandidateInput(character, character.side));
  }

  for (const character of extraCharacters) {
    upsertCandidate(rootStore, candidates, candidateOrder, toCandidateInput(character));
  }

  if (dialogue.currentSpeakerId) {
    upsertCandidate(
      rootStore,
      candidates,
      candidateOrder,
      toCandidateInput(
        {
          speakerId: dialogue.currentSpeakerId,
          ...(dialogue.currentEmotion ? { emotion: dialogue.currentEmotion } : {}),
          ...(dialogue.currentPortraitId ? { portraitId: dialogue.currentPortraitId } : {}),
        },
        dialogue.currentSpeakerSide,
      ),
    );
  }
}

export function formatSpeakerLabel(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveDialogueBackdrop(rootStore: GameRootStore, dialogue: DialogueStore) {
  const backdropAssetId = dialogue.currentBackgroundId ?? dialogue.currentCgId ?? dialogue.currentOverlayId ?? null;
  const fallbackLabel = dialogue.currentSceneTitle ?? dialogue.activeDialogue?.title ?? 'Dialogue Scene';

  return resolveNarrativeVisualAsset(rootStore, backdropAssetId, 'background', fallbackLabel);
}

export function resolveDialoguePortraitSlots(rootStore: GameRootStore, dialogue: DialogueStore) {
  const candidates = new Map<string, CharacterCandidate>();
  const candidateOrder: string[] = [];
  const slotAssignments: Partial<Record<'left' | 'right', string>> = {};

  if (dialogue.currentStage?.left?.speakerId) {
    slotAssignments.left = dialogue.currentStage.left.speakerId;
  }

  if (dialogue.currentStage?.right?.speakerId) {
    slotAssignments.right = dialogue.currentStage.right.speakerId;
  }

  collectStageCandidates(rootStore, dialogue, candidates, candidateOrder);

  const currentSpeakerId = dialogue.currentSpeakerId;
  const currentSpeaker = currentSpeakerId ? candidates.get(currentSpeakerId) ?? null : null;

  if (currentSpeakerId && currentSpeaker) {
    const currentSpeakerTargetSide = resolveCurrentSpeakerSide(
      currentSpeakerId,
      dialogue.currentSpeakerSide,
      currentSpeaker,
      slotAssignments,
    );

    slotAssignments[currentSpeakerTargetSide] = currentSpeakerId;
  }

  const assignedSpeakerIds = new Set(
    [slotAssignments.left, slotAssignments.right].filter((value): value is string => Boolean(value)),
  );

  if (!slotAssignments.left) {
    const nextLeftCandidate = selectNextCandidate(candidates, candidateOrder, assignedSpeakerIds, 'left');

    if (nextLeftCandidate) {
      slotAssignments.left = nextLeftCandidate.speakerId;
      assignedSpeakerIds.add(nextLeftCandidate.speakerId);
    }
  }

  if (!slotAssignments.right) {
    const nextRightCandidate = selectNextCandidate(candidates, candidateOrder, assignedSpeakerIds, 'right');

    if (nextRightCandidate) {
      slotAssignments.right = nextRightCandidate.speakerId;
      assignedSpeakerIds.add(nextRightCandidate.speakerId);
    }
  }

  return {
    left: buildSlot(rootStore, 'left', slotAssignments.left ?? null, candidates, currentSpeakerId),
    right: buildSlot(rootStore, 'right', slotAssignments.right ?? null, candidates, currentSpeakerId),
  };
}
