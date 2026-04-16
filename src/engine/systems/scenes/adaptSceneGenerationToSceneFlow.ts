import type { StageCharacter, StageState } from '@engine/types/dialogue';
import type {
  SceneFlowBackgroundPatch,
  SceneFlowData,
  SceneFlowFallbackTarget,
  SceneFlowNode,
  SceneFlowNodeKind,
  SceneFlowPresentationPatch,
  SceneFlowTransition,
} from '@engine/types/sceneFlow';
import type {
  SceneGenerationDocument,
  SceneGenerationEncounter,
  SceneGenerationFallbackTarget,
  SceneGenerationNode,
  SceneGenerationReplayConfig,
  SceneGenerationRouteLayout,
  SceneGenerationRouteRules,
  SceneGenerationScene,
  SceneGenerationSceneChange,
  SceneGenerationStageCharacter,
  SceneGenerationStageState,
} from '@engine/types/sceneGeneration';
import {
  cloneSceneTransition,
  normalizeDialogueSfx,
  normalizeMusicAction,
} from '@engine/systems/scenes/sceneFlowNormalization';

function cloneArray<T>(value: readonly T[] | undefined) {
  return value ? [...value] : undefined;
}

function normalizeStageCharacter(character: SceneGenerationStageCharacter): StageCharacter {
  return {
    speakerId: character.speakerId,
    ...(character.emotion ? { emotion: character.emotion } : {}),
    ...(character.portraitId ? { portraitId: character.portraitId } : {}),
    ...(character.outfitId ? { outfitId: character.outfitId } : {}),
    ...(character.isVisible !== undefined ? { isVisible: character.isVisible } : {}),
    ...(character.placement ? { placement: { ...character.placement } } : {}),
  };
}

function normalizeStageState(stage: SceneGenerationStageState | null | undefined): StageState | null | undefined {
  if (stage === null) {
    return null;
  }

  if (!stage) {
    return undefined;
  }

  return {
    ...(stage.characters ? { characters: stage.characters.map(normalizeStageCharacter) } : {}),
    ...(stage.focusCharacterId ? { focusCharacterId: stage.focusCharacterId } : {}),
  };
}

function mapNodeKind(scene: SceneGenerationScene, node: SceneGenerationNode): SceneFlowNodeKind {
  if (scene.mode === 'route') {
    return 'route';
  }

  switch (node.type) {
    case 'choice':
      return 'choice';
    case 'event':
      return 'event';
    default:
      return 'line';
  }
}

function normalizeFallbackTarget(target: SceneGenerationFallbackTarget | undefined): SceneFlowFallbackTarget | undefined {
  if (!target) {
    return undefined;
  }

  return {
    ...(target.nextNodeId ? { nextNodeId: target.nextNodeId } : {}),
    ...(target.nextSceneId ? { nextSceneId: target.nextSceneId } : {}),
    ...(target.openSceneFlowId ? { openSceneFlowId: target.openSceneFlowId } : {}),
    ...(target.end ? { end: true } : {}),
  };
}

function normalizeRouteLayout(
  route: SceneGenerationRouteLayout | undefined,
) {
  if (!route) {
    return undefined;
  }

  return {
    x: route.x,
    y: route.y,
    ...(route.hidden !== undefined ? { hidden: route.hidden } : {}),
    ...(route.oneTime !== undefined ? { oneTime: route.oneTime } : {}),
    ...(route.tags ? { tags: [...route.tags] } : {}),
  };
}

function normalizeEncounter(
  encounter: SceneGenerationEncounter | undefined,
) {
  if (!encounter) {
    return undefined;
  }

  return {
    kind: encounter.kind,
    ...(encounter.battleTemplateId ? { battleTemplateId: encounter.battleTemplateId } : {}),
    ...(encounter.dialogueId ? { dialogueId: encounter.dialogueId } : {}),
    ...(encounter.openSceneFlowId ? { openSceneFlowId: encounter.openSceneFlowId } : {}),
    ...(encounter.scriptId ? { scriptId: encounter.scriptId } : {}),
    ...(encounter.itemId ? { itemId: encounter.itemId } : {}),
    ...(encounter.itemQuantity !== undefined ? { itemQuantity: encounter.itemQuantity } : {}),
    ...(encounter.effects ? { effects: [...encounter.effects] } : {}),
    ...(encounter.completesFlow !== undefined ? { completesFlow: encounter.completesFlow } : {}),
  };
}

function normalizeRouteRules(routeRules: SceneGenerationRouteRules | undefined) {
  if (!routeRules) {
    return undefined;
  }

  return {
    ...(routeRules.rollRange
      ? {
          rollRange: {
            min: routeRules.rollRange.min,
            max: routeRules.rollRange.max,
          },
        }
      : {}),
    ...(routeRules.scoutCharges !== undefined ? { scoutCharges: routeRules.scoutCharges } : {}),
    ...(routeRules.scoutDepth !== undefined ? { scoutDepth: routeRules.scoutDepth } : {}),
    ...(routeRules.revealNonHiddenAtStart !== undefined
      ? { revealNonHiddenAtStart: routeRules.revealNonHiddenAtStart }
      : {}),
    ...(routeRules.stepTimeCost ? { stepTimeCost: { ...routeRules.stepTimeCost } } : {}),
  };
}

function normalizeReplayConfig(replay: SceneGenerationReplayConfig | undefined) {
  if (!replay) {
    return undefined;
  }

  return {
    enabled: replay.enabled,
    ...(replay.unlockOnStart !== undefined ? { unlockOnStart: replay.unlockOnStart } : {}),
  };
}

function normalizeBackgroundPatch(
  patch: NonNullable<SceneGenerationSceneChange['background']> | undefined,
): SceneFlowBackgroundPatch | undefined {
  if (!patch) {
    return undefined;
  }

  return {
    image: patch.image,
    ...(patch.transition ? { transition: { type: patch.transition } } : {}),
    ...(patch.style !== undefined ? { style: patch.style } : {}),
  };
}

function normalizePresentationPatch(
  patch: SceneGenerationSceneChange | undefined,
): SceneFlowPresentationPatch | undefined {
  if (!patch) {
    return undefined;
  }

  const stage = normalizeStageState(patch.stage);
  const background = normalizeBackgroundPatch(patch.background);
  const music = normalizeMusicAction(patch.music);
  const sfx = normalizeDialogueSfx(patch.sfx);
  const transition = cloneSceneTransition(patch.transition);

  return {
    ...(stage !== undefined ? { stage } : {}),
    ...(background ? { background } : {}),
    ...(music ? { music } : {}),
    ...(patch.cgId !== undefined ? { cgId: patch.cgId } : {}),
    ...(patch.overlayId !== undefined ? { overlayId: patch.overlayId } : {}),
    ...(sfx ? { sfx } : {}),
    ...(transition ? { transition } : {}),
  };
}

function buildNodeTransitions(node: SceneGenerationNode): SceneFlowTransition[] {
  if (node.type === 'choice') {
    return (node.choices ?? []).map((choice) => ({
      id: choice.id,
      label: choice.text,
      ...(choice.description ? { description: choice.description } : {}),
      ...(choice.tone ? { tone: choice.tone } : {}),
      ...(choice.timeCost ? { timeCost: { ...choice.timeCost } } : {}),
      ...(choice.conditions ? { conditions: [...choice.conditions] } : {}),
      ...(choice.effects ? { effects: [...choice.effects] } : {}),
      ...(choice.nextNodeId ? { nextNodeId: choice.nextNodeId } : {}),
      ...(choice.nextSceneId ? { nextSceneId: choice.nextSceneId } : {}),
      ...(choice.openSceneFlowId ? { openSceneFlowId: choice.openSceneFlowId } : {}),
      ...(choice.once ? { once: true } : {}),
      ...(choice.tags ? { tags: [...choice.tags] } : {}),
    }));
  }

  if (node.nextNodeId || node.nextSceneId || node.openSceneFlowId) {
    return [
      {
        id: `${node.id}__next`,
        ...(node.nextNodeId ? { nextNodeId: node.nextNodeId } : {}),
        ...(node.nextSceneId ? { nextSceneId: node.nextSceneId } : {}),
        ...(node.openSceneFlowId ? { openSceneFlowId: node.openSceneFlowId } : {}),
      },
    ];
  }

  return [];
}

function buildDefaultMusic(scene: SceneGenerationScene, document: SceneGenerationDocument) {
  if (scene.music) {
    return normalizeMusicAction(scene.music);
  }

  if (!document.meta.defaultMusicId) {
    return undefined;
  }

  return {
    action: 'play' as const,
    musicId: document.meta.defaultMusicId,
    loop: true,
  };
}

function buildSceneFlowNode(scene: SceneGenerationScene, node: SceneGenerationNode): SceneFlowNode {
  const stage = normalizeStageState(node.stage);
  const presentationPatch = normalizePresentationPatch(node.sceneChange);
  const music = normalizeMusicAction(node.music);
  const sfx = normalizeDialogueSfx(node.sfx);
  const transition = cloneSceneTransition(node.transition);
  const onConditionFail = normalizeFallbackTarget(node.onConditionFail);
  const encounter = normalizeEncounter(node.encounter);
  const route = normalizeRouteLayout(node.route);
  const onEnterEffects = cloneArray(node.onEnterEffects);
  const onExitEffects = cloneArray(node.onExitEffects);

  return {
    id: node.id,
    kind: mapNodeKind(scene, node),
    sourceNodeType: node.type,
    ...(node.title ? { title: node.title } : {}),
    ...(node.text ? { text: node.text } : {}),
    ...(node.speakerId ? { speakerId: node.speakerId } : {}),
    ...(node.speakerSide ? { speakerSide: node.speakerSide } : {}),
    ...(node.emotion ? { emotion: node.emotion } : {}),
    ...(node.portraitId ? { portraitId: node.portraitId } : {}),
    ...(node.backgroundId ? { backgroundId: node.backgroundId } : {}),
    ...(node.cgId ? { cgId: node.cgId } : {}),
    ...(node.overlayId ? { overlayId: node.overlayId } : {}),
    ...(music ? { music } : {}),
    ...(sfx ? { sfx } : {}),
    ...(stage ? { stage } : {}),
    ...(transition ? { transition } : {}),
    ...(node.tags ? { tags: [...node.tags] } : {}),
    ...(node.conditions ? { conditions: [...node.conditions] } : {}),
    ...(onConditionFail ? { onConditionFail } : {}),
    ...(presentationPatch ? { presentationPatch } : {}),
    ...(onEnterEffects ? { onEnterEffects } : {}),
    ...(onExitEffects ? { onExitEffects } : {}),
    ...(encounter ? { encounter } : {}),
    ...(route ? { route } : {}),
    transitions: buildNodeTransitions(node),
  };
}

export function adaptSceneGenerationToSceneFlow(
  document: SceneGenerationDocument,
): Record<string, SceneFlowData> {
  return Object.fromEntries(
    Object.values(document.scenes).map((scene): [string, SceneFlowData] => {
      const defaultMusic = buildDefaultMusic(scene, document);
      const defaultStage = normalizeStageState(scene.stage) ?? normalizeStageState(document.meta.defaultStage);
      const onConditionFail = normalizeFallbackTarget(scene.onConditionFail);
      const defaultTransition = cloneSceneTransition(scene.transition);
      const routeRules = normalizeRouteRules(scene.routeRules);
      const replay = normalizeReplayConfig(scene.replay);

      return [
        scene.id,
        {
          id: scene.id,
          title: scene.title ?? document.title,
          mode: scene.mode ?? 'sequence',
          startNodeId: scene.startNodeId,
          nodes: Object.fromEntries(
            Object.values(scene.nodes).map((node): [string, SceneFlowNode] => [
              node.id,
              buildSceneFlowNode(scene, node),
            ]),
          ),
          source: {
            type: 'sceneGeneration',
            id: document.id,
          },
          chapterId: document.meta.chapterId,
          ...(scene.description ? { description: scene.description } : {}),
          ...(scene.tags ? { tags: [...scene.tags] } : {}),
          ...(scene.conditions ? { conditions: [...scene.conditions] } : {}),
          ...(onConditionFail ? { onConditionFail } : {}),
          ...(scene.backgroundId ?? document.meta.defaultBackgroundId
            ? { defaultBackgroundId: scene.backgroundId ?? document.meta.defaultBackgroundId }
            : {}),
          ...(scene.backgroundStyle !== undefined || document.meta.defaultBackgroundStyle !== undefined
            ? { defaultBackgroundStyle: scene.backgroundStyle ?? document.meta.defaultBackgroundStyle ?? null }
            : {}),
          ...(defaultMusic?.musicId ? { defaultMusicId: defaultMusic.musicId } : {}),
          ...(defaultMusic ? { defaultMusic } : {}),
          ...(scene.cgId ?? document.meta.defaultCgId ? { defaultCgId: scene.cgId ?? document.meta.defaultCgId } : {}),
          ...(scene.overlayId ?? document.meta.defaultOverlayId
            ? { defaultOverlayId: scene.overlayId ?? document.meta.defaultOverlayId }
            : {}),
          ...(defaultStage ? { defaultStage } : {}),
          ...(defaultTransition ? { defaultTransition } : {}),
          ...(scene.cityId || scene.cityName || scene.locationName || scene.districtLabel || scene.statusLabel
            ? {
                hubMeta: {
                  ...(scene.cityId ? { cityId: scene.cityId } : {}),
                  ...(scene.cityName ? { cityName: scene.cityName } : {}),
                  ...(scene.locationName ? { locationName: scene.locationName } : {}),
                  ...(scene.districtLabel ? { districtLabel: scene.districtLabel } : {}),
                  ...(scene.statusLabel ? { statusLabel: scene.statusLabel } : {}),
                },
              }
            : {}),
          ...(routeRules ? { routeRules } : {}),
          ...(replay ? { replay } : {}),
        },
      ];
    }),
  );
}
