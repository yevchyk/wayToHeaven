import type { DialogueStore } from '@engine/stores/DialogueStore';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  CharacterCompositeLayer,
  NormalizedCharacterCompositeStage,
} from '@engine/types/characterComposite';
import type {
  CharacterEmotion,
  SpeakerSide,
  StageCharacter,
  StageState,
  StageSlotCharacter,
} from '@engine/types/dialogue';
import { buildCharacterCompositeLayers } from '@engine/utils/buildCharacterCompositeLayers';
import {
  humanizeContentAssetLabel,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';

interface CharacterCandidate {
  speakerId: string;
  displayName: string;
  emotion: CharacterEmotion | null;
  portraitId: string | null;
  preferredSide: SpeakerSide | null;
  outfitId: string | null;
  isVisible: boolean;
  placeholderPreset: 'default' | 'dress' | 'dress-torn' | 'dress-ripped';
}

interface CharacterCandidateInput {
  speakerId?: string;
  emotion?: CharacterEmotion;
  portraitId?: string;
  preferredSide?: SpeakerSide | null;
  outfitId?: string | null;
  isVisible?: boolean;
}

interface NarrativePortraitResolverDependencies {
  resolveImageUrl: (assetId: string | null, sourcePath?: string) => string | null;
}

const defaultNarrativePortraitResolverDependencies: NarrativePortraitResolverDependencies = {
  resolveImageUrl: resolveContentImageUrl,
};

export interface DialogueVisualAsset {
  type: 'asset';
  assetId: string | null;
  kind: 'background' | 'portrait';
  label: string;
  url: string | null;
  isPlaceholder: boolean;
}

export interface DialogueCompositeLayerVisual extends CharacterCompositeLayer {
  url: string | null;
  isPlaceholder: boolean;
}

export interface DialogueCompositePortraitVisual {
  type: 'composite';
  label: string;
  isPlaceholder: boolean;
  stage: NormalizedCharacterCompositeStage;
  selectedEmotion: string | null;
  layers: DialogueCompositeLayerVisual[];
}

export type DialogueAssetPortraitVisual = DialogueVisualAsset & {
  kind: 'portrait';
};

export type DialoguePortraitVisual = DialogueAssetPortraitVisual | DialogueCompositePortraitVisual;

export interface DialoguePortraitSlot {
  side: 'left' | 'right';
  speakerId: string | null;
  displayName: string | null;
  outfitId: string | null;
  placeholderPreset: 'default' | 'dress' | 'dress-torn' | 'dress-ripped';
  portrait: DialoguePortraitVisual;
  isActive: boolean;
}

export interface DialogueStagePortrait {
  speakerId: string;
  displayName: string;
  outfitId: string | null;
  placeholderPreset: 'default' | 'dress' | 'dress-torn' | 'dress-ripped';
  portrait: DialoguePortraitVisual;
  isActive: boolean;
}

export interface DialoguePresentationRuntime {
  currentBackgroundId: string | null;
  currentCgId: string | null;
  currentEmotion: CharacterEmotion | null;
  currentOverlayId: string | null;
  currentPortraitId: string | null;
  currentSceneTitle: string | null;
  currentSpeakerId: string | null;
  currentSpeakerSide: SpeakerSide | null;
  currentStage: StageState | null;
}

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

function resolveAssetUrl(
  rootStore: GameRootStore,
  assetId: string | null,
  dependencies: NarrativePortraitResolverDependencies = defaultNarrativePortraitResolverDependencies,
) {
  if (!assetId) {
    return null;
  }

  const assetDefinition = rootStore.getNarrativeAssetById(assetId);

  return dependencies.resolveImageUrl(assetId, assetDefinition?.sourcePath);
}

function resolveAssetLabel(rootStore: GameRootStore, assetId: string | null, fallbackLabel: string) {
  if (!assetId) {
    return fallbackLabel;
  }

  return rootStore.getNarrativeAssetById(assetId)?.label ?? humanizeContentAssetLabel(assetId) ?? fallbackLabel;
}

function buildVisualAsset(
  rootStore: GameRootStore,
  assetId: string | null,
  kind: 'background' | 'portrait',
  fallbackLabel: string,
  dependencies: NarrativePortraitResolverDependencies = defaultNarrativePortraitResolverDependencies,
) {
  const url = resolveAssetUrl(rootStore, assetId, dependencies);

  return {
    type: 'asset' as const,
    assetId,
    kind,
    label: resolveAssetLabel(rootStore, assetId, fallbackLabel),
    url,
    isPlaceholder: !url,
  };
}

interface ResolvedCanonicalPortrait {
  assetId: string | null;
  source: 'character' | 'outfit';
}

function resolveCanonicalPortraitId(
  rootStore: GameRootStore,
  speakerId: string,
  emotion: CharacterEmotion | null,
  outfitId: string | null,
): ResolvedCanonicalPortrait {
  const outfitPortraitId = resolveOutfitPortraitId(rootStore, speakerId, emotion, outfitId);

  if (outfitPortraitId) {
    return {
      assetId: outfitPortraitId,
      source: 'outfit',
    };
  }

  const character = rootStore.getNarrativeCharacterById(speakerId);

  if (!character) {
    return {
      assetId: null,
      source: 'character',
    };
  }

  if (emotion && character.portraitRefs[emotion]) {
    return {
      assetId: character.portraitRefs[emotion] ?? null,
      source: 'character',
    };
  }

  return {
    assetId: character.defaultPortraitId ?? null,
    source: 'character',
  };
}

interface ResolvedFlatPortraitCandidate {
  portrait: DialogueAssetPortraitVisual;
  canonicalPortraitId: string | null;
  canonicalSource: 'character' | 'outfit';
  explicitPortraitId: string | null;
}

function resolveFlatPortraitCandidate(
  rootStore: GameRootStore,
  speakerId: string,
  emotion: CharacterEmotion | null,
  portraitId: string | null,
  outfitId: string | null,
  fallbackLabel: string,
  dependencies: NarrativePortraitResolverDependencies = defaultNarrativePortraitResolverDependencies,
) {
  const canonicalPortrait = resolveCanonicalPortraitId(rootStore, speakerId, emotion, outfitId);
  const selectedPortraitId = portraitId ?? canonicalPortrait.assetId;

  return {
    portrait: buildVisualAsset(
      rootStore,
      selectedPortraitId,
      'portrait',
      fallbackLabel,
      dependencies,
    ) as DialogueAssetPortraitVisual,
    canonicalPortraitId: canonicalPortrait.assetId,
    canonicalSource: canonicalPortrait.source,
    explicitPortraitId: portraitId,
  } satisfies ResolvedFlatPortraitCandidate;
}

function resolveCompositePortrait(
  rootStore: GameRootStore,
  speakerId: string,
  emotion: CharacterEmotion | null,
  fallbackLabel: string,
  dependencies: NarrativePortraitResolverDependencies = defaultNarrativePortraitResolverDependencies,
) {
  const characterComposite = rootStore.getCharacterCompositeById(speakerId);

  if (!characterComposite) {
    return null;
  }

  const composition = buildCharacterCompositeLayers(characterComposite, emotion ? { emotion } : {});
  const layers = composition.layers.map((layer) => {
    const url = resolveAssetUrl(rootStore, layer.assetId, dependencies);

    return {
      ...layer,
      url,
      isPlaceholder: !url,
    };
  });

  return {
    type: 'composite' as const,
    label: fallbackLabel,
    isPlaceholder: layers.every((layer) => layer.isPlaceholder),
    stage: composition.stage,
    selectedEmotion: composition.selectedEmotion,
    layers,
  } satisfies DialogueCompositePortraitVisual;
}

function resolveOutfitPortraitId(
  rootStore: GameRootStore,
  speakerId: string,
  emotion: CharacterEmotion | null,
  outfitId: string | null,
) {
  if (!outfitId) {
    return null;
  }

  const outfit = rootStore.getNarrativeCharacterById(speakerId)?.outfits?.[outfitId];

  if (!outfit) {
    return null;
  }

  if (emotion && outfit.portraitRefs?.[emotion]) {
    return outfit.portraitRefs[emotion] ?? null;
  }

  return outfit.defaultPortraitId ?? null;
}

interface ResolveNarrativePortraitOptions {
  speakerId: string;
  emotion: CharacterEmotion | null;
  portraitId: string | null;
  outfitId: string | null;
  fallbackLabel: string;
}

export function resolveNarrativePortraitVisual(
  rootStore: GameRootStore,
  options: ResolveNarrativePortraitOptions,
  dependencies: NarrativePortraitResolverDependencies = defaultNarrativePortraitResolverDependencies,
): DialoguePortraitVisual {
  const flatPortrait = resolveFlatPortraitCandidate(
    rootStore,
    options.speakerId,
    options.emotion,
    options.portraitId,
    options.outfitId,
    options.fallbackLabel,
    dependencies,
  );
  const compositePortrait = resolveCompositePortrait(
    rootStore,
    options.speakerId,
    options.emotion,
    options.fallbackLabel,
    dependencies,
  );
  const hasExplicitPortraitOverride =
    Boolean(flatPortrait.explicitPortraitId) &&
    flatPortrait.explicitPortraitId !== flatPortrait.canonicalPortraitId;
  const shouldPreferFlatPortrait =
    Boolean(flatPortrait.portrait.url) &&
    (hasExplicitPortraitOverride || flatPortrait.canonicalSource === 'outfit');

  if (shouldPreferFlatPortrait) {
    return flatPortrait.portrait;
  }

  if (compositePortrait && !compositePortrait.isPlaceholder) {
    return compositePortrait;
  }

  return flatPortrait.portrait;
}

function resolveDisplayName(rootStore: GameRootStore, speakerId: string) {
  return rootStore.getNarrativeCharacterById(speakerId)?.displayName ?? formatSpeakerLabel(speakerId) ?? speakerId;
}

function toCandidateInput(
  entry: {
    speakerId: string;
    emotion?: CharacterEmotion;
    portraitId?: string;
    outfitId?: string | null;
    isVisible?: boolean;
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

  if (entry.outfitId !== undefined) {
    candidateInput.outfitId = entry.outfitId;
  }

  if (entry.isVisible !== undefined) {
    candidateInput.isVisible = entry.isVisible;
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
  const nextOutfitId =
    entry.outfitId ??
    existing?.outfitId ??
    rootStore.appearance.getCurrentOutfitId(entry.speakerId);
  const nextOutfit = nextOutfitId ? character?.outfits?.[nextOutfitId] ?? null : null;
  const explicitPortraitId = entry.portraitId ?? existing?.portraitId ?? null;
  const nextPortraitId =
    explicitPortraitId ??
    resolveCanonicalPortraitId(
      rootStore,
      entry.speakerId,
      nextEmotion,
      nextOutfitId ?? null,
    ).assetId ??
    null;
  const nextPreferredSide = entry.preferredSide ?? existing?.preferredSide ?? character?.defaultSide ?? null;
  const nextCandidate: CharacterCandidate = {
    speakerId: entry.speakerId,
    displayName: resolveDisplayName(rootStore, entry.speakerId),
    emotion: nextEmotion,
    portraitId: nextPortraitId,
    preferredSide: nextPreferredSide,
    outfitId: nextOutfitId ?? null,
    isVisible: entry.isVisible ?? existing?.isVisible ?? true,
    placeholderPreset: nextOutfit?.placeholderPreset ?? existing?.placeholderPreset ?? 'default',
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

function isHeroineCandidate(rootStore: GameRootStore, speakerId: string) {
  return rootStore.getNarrativeCharacterById(speakerId)?.role === 'heroine';
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
  return buildVisualAsset(rootStore, assetId, kind, fallbackLabel);
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
      speakerId: null,
      displayName: null,
      outfitId: null,
      placeholderPreset: 'default',
      portrait: {
        type: 'asset',
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
  const portrait = resolveNarrativePortraitVisual(rootStore, {
    speakerId,
    emotion: candidate?.emotion ?? null,
    portraitId: candidate?.portraitId ?? null,
    outfitId: candidate?.outfitId ?? null,
    fallbackLabel: displayName,
  });

  return {
    side,
    speakerId,
    displayName,
    outfitId: candidate?.outfitId ?? null,
    placeholderPreset: candidate?.placeholderPreset ?? 'default',
    portrait,
    isActive: speakerId === currentSpeakerId,
  };
}

function appendSpeakerId(order: string[], speakerId: string | undefined) {
  if (!speakerId || order.includes(speakerId)) {
    return;
  }

  order.push(speakerId);
}

function buildOrderedStageSpeakerIds(runtime: DialoguePresentationRuntime) {
  const orderedSpeakerIds: string[] = [];
  const stage = runtime.currentStage;

  stage?.characters?.forEach((character) => {
    if (character.isVisible !== false) {
      appendSpeakerId(orderedSpeakerIds, character.speakerId);
    }
  });

  appendSpeakerId(orderedSpeakerIds, stage?.left?.speakerId);
  appendSpeakerId(orderedSpeakerIds, stage?.center?.speakerId);
  appendSpeakerId(orderedSpeakerIds, stage?.right?.speakerId);
  stage?.extra?.forEach((character) => appendSpeakerId(orderedSpeakerIds, character.speakerId));
  appendSpeakerId(orderedSpeakerIds, runtime.currentSpeakerId ?? undefined);

  return orderedSpeakerIds;
}

function buildStagePortrait(
  rootStore: GameRootStore,
  candidate: CharacterCandidate,
  activeSpeakerId: string | null,
): DialogueStagePortrait {
  return {
    speakerId: candidate.speakerId,
    displayName: candidate.displayName,
    outfitId: candidate.outfitId,
    placeholderPreset: candidate.placeholderPreset,
    portrait: resolveNarrativePortraitVisual(rootStore, {
      speakerId: candidate.speakerId,
      emotion: candidate.emotion,
      portraitId: candidate.portraitId,
      outfitId: candidate.outfitId,
      fallbackLabel: candidate.displayName,
    }),
    isActive: candidate.speakerId === activeSpeakerId,
  };
}

function collectStageCandidates(
  rootStore: GameRootStore,
  runtime: DialoguePresentationRuntime,
  candidates: Map<string, CharacterCandidate>,
  candidateOrder: string[],
) {
  const stage = runtime.currentStage;

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

  if (runtime.currentSpeakerId) {
    upsertCandidate(
      rootStore,
      candidates,
      candidateOrder,
      toCandidateInput(
        {
          speakerId: runtime.currentSpeakerId,
          ...(runtime.currentEmotion ? { emotion: runtime.currentEmotion } : {}),
          ...(runtime.currentPortraitId ? { portraitId: runtime.currentPortraitId } : {}),
        },
        runtime.currentSpeakerSide,
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
  return resolvePresentationBackdrop(
    rootStore,
    dialogue,
    dialogue.activeDialogue?.title ?? 'Dialogue Scene',
  );
}

export function resolvePresentationBackdrop(
  rootStore: GameRootStore,
  runtime: DialoguePresentationRuntime,
  fallbackTitle = 'Dialogue Scene',
) {
  const backdropAssetId = runtime.currentBackgroundId ?? runtime.currentCgId ?? runtime.currentOverlayId ?? null;
  const fallbackLabel = runtime.currentSceneTitle ?? fallbackTitle;

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
  const heroineCandidate =
    candidateOrder
      .map((speakerId) => candidates.get(speakerId) ?? null)
      .filter((candidate): candidate is CharacterCandidate => candidate !== null)
      .find((candidate) => isHeroineCandidate(rootStore, candidate.speakerId)) ?? null;

  if (heroineCandidate) {
    slotAssignments.left = heroineCandidate.speakerId;

    if (slotAssignments.right === heroineCandidate.speakerId) {
      delete slotAssignments.right;
    }
  }

  if (currentSpeakerId && currentSpeaker) {
    const currentSpeakerTargetSide =
      heroineCandidate && currentSpeakerId !== heroineCandidate.speakerId
        ? 'right'
        : resolveCurrentSpeakerSide(
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

export function resolveDialogueStagePortraits(rootStore: GameRootStore, dialogue: DialogueStore) {
  return resolvePresentationStagePortraits(rootStore, dialogue);
}

export function resolvePresentationStagePortraits(
  rootStore: GameRootStore,
  runtime: DialoguePresentationRuntime,
) {
  const candidates = new Map<string, CharacterCandidate>();
  const candidateOrder: string[] = [];

  collectStageCandidates(rootStore, runtime, candidates, candidateOrder);

  const orderedSpeakerIds = buildOrderedStageSpeakerIds(runtime);

  candidateOrder.forEach((speakerId) => appendSpeakerId(orderedSpeakerIds, speakerId));

  const activeSpeakerId = runtime.currentStage?.focusCharacterId ?? runtime.currentSpeakerId ?? null;

  return orderedSpeakerIds
    .map((speakerId) => candidates.get(speakerId) ?? null)
    .filter((candidate): candidate is CharacterCandidate => Boolean(candidate))
    .filter((candidate) => candidate.isVisible !== false)
    .map((candidate) => buildStagePortrait(rootStore, candidate, activeSpeakerId));
}
