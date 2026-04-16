import type { CitySceneData } from '@engine/types/city';
import type { DialogueData, DialogueNode } from '@engine/types/dialogue';
import type { SceneFlowData, SceneFlowEncounter, SceneFlowNode, SceneFlowNodeKind, SceneFlowTransition } from '@engine/types/sceneFlow';
import type { TravelBoardData, TravelNode } from '@engine/types/travel';
import {
  cloneSceneTransition,
  normalizeDialogueSfx,
  normalizeMusicAction,
  normalizeStageState,
} from '@engine/systems/scenes/sceneFlowNormalization';

function cloneArray<T>(value: readonly T[] | undefined) {
  return value ? [...value] : undefined;
}

function mapDialogueNodeKind(node: DialogueNode): SceneFlowNodeKind {
  switch (node.type) {
    case 'choice':
      return 'choice';
    case 'event':
      return 'event';
    default:
      return 'line';
  }
}

function buildDialogueTransitions(node: DialogueNode): SceneFlowTransition[] {
  if (node.type === 'choice') {
    return node.choices.map((choice) => ({
      id: choice.id,
      label: choice.text,
      ...(choice.tone ? { tone: choice.tone } : {}),
      ...(choice.timeCost ? { timeCost: { ...choice.timeCost } } : {}),
      ...(choice.conditions ? { conditions: [...choice.conditions] } : {}),
      ...(choice.effects ? { effects: [...choice.effects] } : {}),
      ...(choice.nextNodeId ? { nextNodeId: choice.nextNodeId } : {}),
      ...(choice.nextSceneId ? { nextSceneId: choice.nextSceneId } : {}),
    }));
  }

  return node.nextNodeId || node.nextSceneId
    ? [
        {
          id: `${node.id}__next`,
          ...(node.nextNodeId ? { nextNodeId: node.nextNodeId } : {}),
          ...(node.nextSceneId ? { nextSceneId: node.nextSceneId } : {}),
        },
      ]
    : [];
}

function buildTravelTransitions(node: TravelNode): SceneFlowTransition[] {
  return node.nextNodeIds.map((nextNodeId) => ({
    id: `${node.id}__${nextNodeId}`,
    nextNodeId,
  }));
}

export function adaptCitySceneToSceneFlow(scene: CitySceneData): SceneFlowData {
  const nodeId = `${scene.id}__hub`;
  const onEnterEffects = cloneArray(scene.onEnterEffects);

  return {
    id: scene.id,
    title: scene.locationName,
    mode: 'hub',
    startNodeId: nodeId,
    nodes: {
      [nodeId]: {
        id: nodeId,
        kind: 'choice',
        title: scene.locationName,
        ...(scene.description ? { text: scene.description } : {}),
        ...(scene.backgroundId ? { backgroundId: scene.backgroundId } : {}),
        ...(onEnterEffects ? { onEnterEffects } : {}),
        transitions: scene.actions.map((action) => ({
          id: action.id,
          label: action.text,
          ...(action.tone ? { tone: action.tone } : {}),
          ...(action.description ? { description: action.description } : {}),
          ...(action.timeCost ? { timeCost: { ...action.timeCost } } : {}),
          ...(action.conditions ? { conditions: [...action.conditions] } : {}),
          ...(action.effects ? { effects: [...action.effects] } : {}),
          ...(action.nextSceneId ? { nextSceneId: action.nextSceneId } : {}),
          ...(action.dialogueId ? { openSceneFlowId: action.dialogueId } : {}),
          ...(action.travelBoardId ? { openSceneFlowId: action.travelBoardId } : {}),
          ...(action.battleTemplateId
            ? {
                effects: [
                  ...(action.effects ?? []),
                  {
                    type: 'startBattle' as const,
                    battleTemplateId: action.battleTemplateId,
                  },
                ],
              }
            : {}),
          ...(action.once ? { once: true } : {}),
        })),
      },
    },
    source: {
      type: 'cityScene',
      id: scene.id,
    },
    ...(scene.chapterId ? { chapterId: scene.chapterId } : {}),
    ...(scene.description ? { description: scene.description } : {}),
    ...(scene.backgroundId ? { defaultBackgroundId: scene.backgroundId } : {}),
  };
}

function buildTravelEncounter(node: TravelNode): SceneFlowEncounter {
  switch (node.type) {
    case 'battle':
    case 'eliteBattle':
    case 'boss':
      return {
        kind: 'battle',
        ...(node.battleTemplateId ?? node.encounterRefId
          ? { battleTemplateId: node.battleTemplateId ?? node.encounterRefId }
          : {}),
      };
    case 'story':
      return {
        kind: 'dialogue',
        ...(node.dialogueId ?? node.eventRefId ? { dialogueId: node.dialogueId ?? node.eventRefId } : {}),
        ...(node.onResolveEffects ? { effects: [...node.onResolveEffects] } : {}),
      };
    case 'loot':
      return {
        kind: 'loot',
        ...(node.itemId ? { itemId: node.itemId } : {}),
        ...(node.itemQuantity !== undefined ? { itemQuantity: node.itemQuantity } : {}),
        ...(node.onResolveEffects ? { effects: [...node.onResolveEffects] } : {}),
      };
    case 'question':
      return {
        kind: 'script',
        ...(node.eventRefId ? { scriptId: node.eventRefId } : {}),
        ...(node.onResolveEffects ? { effects: [...node.onResolveEffects] } : {}),
      };
    case 'exit':
      return {
        kind: 'exit',
        completesFlow: true,
        ...(node.onResolveEffects ? { effects: [...node.onResolveEffects] } : {}),
      };
    case 'empty':
    case 'trap':
    case 'heal':
    case 'rest':
    case 'shop':
      return {
        kind: node.onResolveEffects?.length ? 'effects' : 'none',
        ...(node.onResolveEffects ? { effects: [...node.onResolveEffects] } : {}),
      };
    default:
      return {
        kind: 'none',
      };
  }
}

export function adaptDialogueToSceneFlow(dialogue: DialogueData): SceneFlowData {
  const nodes = Object.fromEntries(
    Object.values(dialogue.nodes).map((node): [string, SceneFlowNode] => {
      const onEnterEffects = cloneArray(node.onEnterEffects);
      const onExitEffects = cloneArray(node.onExitEffects);
      const stage = normalizeStageState(node.stage);
      const music = normalizeMusicAction(node.music);
      const sfx = normalizeDialogueSfx(node.sfx);
      const transition = cloneSceneTransition(node.transition);

      return [
        node.id,
        {
          id: node.id,
          kind: mapDialogueNodeKind(node),
          sourceNodeType: node.type,
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
          ...(node.conditions ? { conditions: [...node.conditions] } : {}),
          ...(onEnterEffects ? { onEnterEffects } : {}),
          ...(onExitEffects ? { onExitEffects } : {}),
          transitions: buildDialogueTransitions(node),
        },
      ];
    }),
  );

  return {
    id: dialogue.id,
    title: dialogue.title ?? dialogue.meta?.sceneTitle ?? dialogue.id,
    mode: 'sequence',
    startNodeId: dialogue.startNodeId,
    nodes,
    source: {
      type: 'dialogue',
      id: dialogue.id,
    },
    ...(dialogue.meta?.chapterId ? { chapterId: dialogue.meta.chapterId } : {}),
    ...(dialogue.meta?.defaultBackgroundId ? { defaultBackgroundId: dialogue.meta.defaultBackgroundId } : {}),
    ...(dialogue.meta?.defaultMusicId ? { defaultMusicId: dialogue.meta.defaultMusicId } : {}),
    ...(dialogue.meta?.defaultMusicId
      ? {
          defaultMusic: {
            action: 'play' as const,
            musicId: dialogue.meta.defaultMusicId,
            loop: true,
          },
        }
      : {}),
    ...(dialogue.meta?.defaultCgId ? { defaultCgId: dialogue.meta.defaultCgId } : {}),
    ...(dialogue.meta?.defaultOverlayId ? { defaultOverlayId: dialogue.meta.defaultOverlayId } : {}),
  };
}

export function adaptTravelBoardToSceneFlow(board: TravelBoardData): SceneFlowData {
  const nodes = Object.fromEntries(
    Object.values(board.nodes).map((node): [string, SceneFlowNode] => [
      node.id,
      {
        id: node.id,
        kind: 'route',
        sourceNodeType: node.type,
        ...(node.title ? { title: node.title } : {}),
        ...(node.description ? { text: node.description } : {}),
        transitions: buildTravelTransitions(node),
        encounter: buildTravelEncounter(node),
        route: {
          x: node.x,
          y: node.y,
          ...(node.hidden !== undefined ? { hidden: node.hidden } : {}),
          ...(node.oneTime !== undefined ? { oneTime: node.oneTime } : {}),
          ...(node.tags ? { tags: [...node.tags] } : {}),
        },
      },
    ]),
  );

  return {
    id: board.id,
    title: board.title,
    mode: 'route',
    startNodeId: board.startNodeId,
    nodes,
    source: {
      type: 'travelBoard',
      id: board.id,
    },
    ...(board.chapterId ? { chapterId: board.chapterId } : {}),
    ...(board.description ? { description: board.description } : {}),
    ...(board.backgroundId ? { defaultBackgroundId: board.backgroundId } : {}),
    routeRules: {
      rollRange: {
        min: 1,
        max: 6,
      },
      scoutCharges: board.scoutCharges ?? 1,
      scoutDepth: board.scoutDepth ?? 2,
      revealNonHiddenAtStart: true,
      ...(board.stepTimeCost ? { stepTimeCost: { ...board.stepTimeCost } } : {}),
    },
  };
}
