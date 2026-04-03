import type {
  DialogueSfx,
  MusicAction,
  SceneTransition,
  SfxAction,
  SpeakerSide,
  StageCharacter,
  StageCharacterPlacement,
  StageSlotCharacter,
  StageState,
} from '@engine/types/dialogue';

function clonePlacement(placement: StageCharacterPlacement | undefined): StageCharacterPlacement | undefined {
  return placement ? { ...placement } : undefined;
}

function cloneStageCharacter(character: StageCharacter): StageCharacter {
  const clone: StageCharacter = {
    speakerId: character.speakerId,
  };

  if (character.id) {
    clone.id = character.id;
  }

  if (character.emotion) {
    clone.emotion = character.emotion;
  }

  if (character.portraitId) {
    clone.portraitId = character.portraitId;
  }

  if (character.outfitId) {
    clone.outfitId = character.outfitId;
  }

  if (character.isVisible !== undefined) {
    clone.isVisible = character.isVisible;
  }

  if (character.side) {
    clone.side = character.side;
  }

  const placement = clonePlacement(character.placement);

  if (placement) {
    clone.placement = placement;
  }

  return clone;
}

function toStageCharacter(
  character: StageSlotCharacter | StageCharacter | null | undefined,
  side?: SpeakerSide,
): StageCharacter | null {
  if (!character) {
    return null;
  }

  const normalized: StageCharacter = {
    speakerId: character.speakerId,
  };

  if ('id' in character && character.id) {
    normalized.id = character.id;
  }

  if (character.emotion) {
    normalized.emotion = character.emotion;
  }

  if (character.portraitId) {
    normalized.portraitId = character.portraitId;
  }

  if (character.outfitId) {
    normalized.outfitId = character.outfitId;
  }

  const placement = clonePlacement(character.placement);

  if (placement) {
    normalized.placement = placement;
  }

  if ('isVisible' in character && character.isVisible !== undefined) {
    normalized.isVisible = character.isVisible;
  }

  if (side) {
    normalized.side = side;
  }

  return normalized;
}

export function normalizeMusicAction(music: MusicAction | undefined): MusicAction | undefined {
  if (!music) {
    return undefined;
  }

  const action = music.action ?? music.mode;

  if (!action) {
    return {
      ...music,
    };
  }

  return {
    ...music,
    action,
  };
}

export function normalizeDialogueSfx(sfx: DialogueSfx | undefined): DialogueSfx | undefined {
  if (!sfx) {
    return undefined;
  }

  const normalizeEntry = (entry: SfxAction): SfxAction =>
    ({
      ...entry,
      ...(entry.sfxId ? {} : entry.id ? { sfxId: entry.id } : {}),
    });

  if (Array.isArray(sfx)) {
    return sfx.map((entry) => normalizeEntry(entry));
  }

  return normalizeEntry(sfx as SfxAction);
}

export function normalizeStageState(stage: StageState | null | undefined): StageState | undefined {
  if (!stage) {
    return undefined;
  }

  const characters: StageCharacter[] = [];
  const seenCharacterKeys = new Set<string>();

  const pushCharacter = (character: StageCharacter | StageSlotCharacter | null | undefined, side?: SpeakerSide) => {
    const normalized = toStageCharacter(character, side);

    if (!normalized) {
      return;
    }

    const dedupeKey = normalized.id ?? `${normalized.speakerId}:${side ?? normalized.side ?? characters.length}`;

    if (seenCharacterKeys.has(dedupeKey)) {
      return;
    }

    seenCharacterKeys.add(dedupeKey);
    characters.push(normalized);
  };

  stage.characters?.forEach((character) => {
    pushCharacter(cloneStageCharacter(character), character.side);
  });

  pushCharacter(stage.left, 'left');
  pushCharacter(stage.center, 'center');
  pushCharacter(stage.right, 'right');
  stage.extra?.forEach((character) => {
    pushCharacter(character);
  });

  return {
    ...(characters.length > 0 ? { characters } : {}),
    ...(stage.focusCharacterId ? { focusCharacterId: stage.focusCharacterId } : {}),
    ...(stage.backgroundId ? { backgroundId: stage.backgroundId } : {}),
    ...(stage.cgId ? { cgId: stage.cgId } : {}),
    ...(stage.overlayId ? { overlayId: stage.overlayId } : {}),
  };
}

export function cloneSceneTransition(transition: SceneTransition | undefined): SceneTransition | undefined {
  return transition
    ? {
        ...transition,
      }
    : undefined;
}
