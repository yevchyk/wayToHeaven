import type {
  DialogueSfx,
  MusicAction,
  SceneTransition,
  SfxAction,
  SpeakerSide,
  StageCharacter,
  StageSlotCharacter,
  StageState,
} from '@engine/types/dialogue';

function cloneStageCharacter(character: StageCharacter): StageCharacter {
  return {
    ...character,
  };
}

function toStageCharacter(
  character: StageSlotCharacter | StageCharacter | null | undefined,
  side?: SpeakerSide,
): StageCharacter | null {
  if (!character) {
    return null;
  }

  return {
    speakerId: character.speakerId,
    ...('id' in character && character.id ? { id: character.id } : {}),
    ...(character.emotion ? { emotion: character.emotion } : {}),
    ...(character.portraitId ? { portraitId: character.portraitId } : {}),
    ...(character.outfitId ? { outfitId: character.outfitId } : {}),
    ...('isVisible' in character && character.isVisible !== undefined
      ? { isVisible: character.isVisible }
      : {}),
    ...(side ? { side } : {}),
  };
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
