import type { DialogueSfx, MusicAction, SceneTransition, StageState } from '@engine/types/dialogue';
import type {
  SceneFlowBackgroundPatch,
  SceneFlowPresentationPatch,
  SceneFlowPresentationState,
} from '@engine/types/sceneFlow';

function normalizeMusicId(
  currentMusicId: string | null,
  music: MusicAction | undefined,
) {
  if (!music) {
    return currentMusicId;
  }

  const musicAction = music.action ?? music.mode;

  if (musicAction === 'stop') {
    return null;
  }

  if ((musicAction === 'play' || musicAction === 'switch') && music.musicId) {
    return music.musicId;
  }

  return currentMusicId;
}

function normalizeLastSfxId(currentSfxId: string | null, sfx: DialogueSfx | undefined) {
  if (!sfx) {
    return currentSfxId;
  }

  const entries = Array.isArray(sfx) ? sfx : [sfx];
  const lastEntry = [...entries].reverse().find((entry) => entry.sfxId || entry.id);

  return lastEntry?.sfxId ?? lastEntry?.id ?? currentSfxId;
}

function resolveBackgroundId(
  currentBackgroundId: string | null,
  background: SceneFlowBackgroundPatch | undefined,
) {
  return background?.image ?? currentBackgroundId;
}

function resolveBackgroundStyle(
  currentBackgroundStyle: string | null,
  background: SceneFlowBackgroundPatch | undefined,
) {
  if (!background || background.style === undefined) {
    return currentBackgroundStyle;
  }

  return background.style ?? null;
}

function resolveTransition(
  currentTransition: SceneTransition | null,
  background: SceneFlowBackgroundPatch | undefined,
  transition: SceneTransition | undefined,
) {
  if (transition) {
    return transition;
  }

  if (background?.transition) {
    return background.transition;
  }

  return currentTransition;
}

function resolveStage(currentStage: StageState | null, stage: SceneFlowPresentationPatch['stage']) {
  if (stage === undefined) {
    return currentStage;
  }

  return stage;
}

export function applyScenePresentationPatch(
  state: SceneFlowPresentationState,
  patch: SceneFlowPresentationPatch,
): SceneFlowPresentationState {
  return {
    ...state,
    backgroundId: resolveBackgroundId(state.backgroundId, patch.background),
    musicId: normalizeMusicId(state.musicId, patch.music),
    cgId: patch.cgId !== undefined ? patch.cgId : state.cgId,
    overlayId: patch.overlayId !== undefined ? patch.overlayId : state.overlayId,
    lastSfxId: normalizeLastSfxId(state.lastSfxId, patch.sfx),
    currentStage: resolveStage(state.currentStage, patch.stage),
    backgroundStyle: resolveBackgroundStyle(state.backgroundStyle, patch.background),
    activeTransition: resolveTransition(state.activeTransition, patch.background, patch.transition),
  };
}
