import type { CitySceneAction, CitySceneData } from '@engine/types/city';
import type { DialogueChoice, DialogueData, DialogueNode } from '@engine/types/dialogue';
import type { SceneFlowData, SceneFlowNode, SceneFlowTransition } from '@engine/types/sceneFlow';
import type { TravelBoardData, TravelNode, TravelNodeType } from '@engine/types/travel';

function inferTravelNodeType(node: SceneFlowNode): TravelNodeType {
  const sourceNodeType = node.sourceNodeType;

  if (
    sourceNodeType === 'battle' ||
    sourceNodeType === 'loot' ||
    sourceNodeType === 'empty' ||
    sourceNodeType === 'trap' ||
    sourceNodeType === 'question' ||
    sourceNodeType === 'heal' ||
    sourceNodeType === 'rest' ||
    sourceNodeType === 'story' ||
    sourceNodeType === 'exit' ||
    sourceNodeType === 'eliteBattle' ||
    sourceNodeType === 'shop' ||
    sourceNodeType === 'boss'
  ) {
    return sourceNodeType;
  }

  switch (node.encounter?.kind) {
    case 'battle':
      return 'battle';
    case 'dialogue':
      return 'story';
    case 'loot':
      return 'loot';
    case 'script':
      return 'question';
    case 'exit':
      return 'exit';
    case 'effects':
    case 'none':
    default:
      return 'empty';
  }
}

function mapTransitionToHubAction(
  transition: SceneFlowTransition,
  options: {
    resolveDialogueId?: (flowId: string) => string | null;
    resolveTravelBoardId?: (flowId: string) => string | null;
  } = {},
): CitySceneAction {
  const openSceneFlowId = transition.openSceneFlowId;
  const dialogueId =
    openSceneFlowId && options.resolveDialogueId ? options.resolveDialogueId(openSceneFlowId) : null;
  const travelBoardId =
    openSceneFlowId && options.resolveTravelBoardId
      ? options.resolveTravelBoardId(openSceneFlowId)
      : null;

  return {
    id: transition.id,
    text: transition.label ?? transition.description ?? transition.id,
    ...(transition.tone ? { tone: transition.tone } : {}),
    ...(transition.description ? { description: transition.description } : {}),
    ...(transition.timeCost ? { timeCost: { ...transition.timeCost } } : {}),
    ...(transition.conditions ? { conditions: [...transition.conditions] } : {}),
    ...(transition.effects ? { effects: [...transition.effects] } : {}),
    ...(transition.nextSceneId ? { nextSceneId: transition.nextSceneId } : {}),
    ...(dialogueId ? { dialogueId } : {}),
    ...(travelBoardId ? { travelBoardId } : {}),
    ...(!dialogueId && !travelBoardId && openSceneFlowId ? { nextSceneId: openSceneFlowId } : {}),
    ...(transition.once ? { once: true } : {}),
  };
}

function inferDialogueNodeType(node: SceneFlowNode): DialogueNode['type'] {
  if (node.sourceNodeType === 'choice') {
    return 'choice';
  }

  if (node.sourceNodeType === 'event') {
    return 'event';
  }

  if (node.sourceNodeType === 'dialogue' || node.speakerId) {
    return 'dialogue';
  }

  return 'narration';
}

function mapTransitionToDialogueChoice(transition: SceneFlowTransition): DialogueChoice {
  return {
    id: transition.id,
    text: transition.label ?? transition.description ?? transition.id,
    ...(transition.tone ? { tone: transition.tone } : {}),
    ...(transition.conditions ? { conditions: [...transition.conditions] } : {}),
    ...(transition.effects ? { effects: [...transition.effects] } : {}),
    ...(transition.nextNodeId ? { nextNodeId: transition.nextNodeId } : {}),
    ...(transition.nextSceneId ? { nextSceneId: transition.nextSceneId } : {}),
  };
}

export function adaptSceneFlowToDialogueView(flow: SceneFlowData): DialogueData | null {
  if (flow.mode !== 'sequence') {
    return null;
  }

  return {
    id: flow.id,
    title: flow.title,
    startNodeId: flow.startNodeId,
    meta: {
      ...(flow.chapterId ? { chapterId: flow.chapterId } : {}),
      sceneId: flow.id,
      sceneTitle: flow.title,
      ...(flow.defaultBackgroundId ? { defaultBackgroundId: flow.defaultBackgroundId } : {}),
      ...(flow.defaultMusicId ? { defaultMusicId: flow.defaultMusicId } : {}),
      ...(flow.defaultCgId ? { defaultCgId: flow.defaultCgId } : {}),
      ...(flow.defaultOverlayId ? { defaultOverlayId: flow.defaultOverlayId } : {}),
    },
    speakerIds: Array.from(
      new Set(
        Object.values(flow.nodes)
          .map((node) => node.speakerId)
          .filter((speakerId): speakerId is string => Boolean(speakerId)),
      ),
    ),
    nodes: Object.fromEntries(
      Object.values(flow.nodes).map((node): [string, DialogueNode] => {
        const dialogueNodeType = inferDialogueNodeType(node);
        const nextTransition = node.transitions[0] ?? null;

        const baseNode = {
          id: node.id,
          ...(node.speakerId ? { speakerId: node.speakerId } : {}),
          ...(node.speakerSide ? { speakerSide: node.speakerSide } : {}),
          ...(node.emotion ? { emotion: node.emotion } : {}),
          ...(node.portraitId ? { portraitId: node.portraitId } : {}),
          ...(node.backgroundId ? { backgroundId: node.backgroundId } : {}),
          ...(node.cgId ? { cgId: node.cgId } : {}),
          ...(node.overlayId ? { overlayId: node.overlayId } : {}),
          ...(node.stage ? { stage: node.stage } : {}),
          ...(node.music ? { music: node.music } : {}),
          ...(node.sfx ? { sfx: node.sfx } : {}),
          ...(node.transition ? { transition: node.transition } : {}),
          ...(node.conditions ? { conditions: [...node.conditions] } : {}),
          ...(node.onEnterEffects ? { onEnterEffects: [...node.onEnterEffects] } : {}),
          ...(node.onExitEffects ? { onExitEffects: [...node.onExitEffects] } : {}),
        };

        if (dialogueNodeType === 'choice') {
          return [
            node.id,
            {
            ...baseNode,
            type: 'choice',
            text: node.text ?? '',
            choices: node.transitions.map(mapTransitionToDialogueChoice),
          },
          ];
        }

        if (dialogueNodeType === 'event') {
          return [
            node.id,
            {
              ...baseNode,
              type: 'event',
              ...(node.text ? { text: node.text } : {}),
              ...(nextTransition?.nextNodeId ? { nextNodeId: nextTransition.nextNodeId } : {}),
              ...(nextTransition?.nextSceneId ? { nextSceneId: nextTransition.nextSceneId } : {}),
              ...(!nextTransition ? { isEnd: true } : {}),
            },
          ];
        }

        return [
          node.id,
          {
            ...baseNode,
            type: dialogueNodeType,
            text: node.text ?? '',
            ...(nextTransition?.nextNodeId ? { nextNodeId: nextTransition.nextNodeId } : {}),
            ...(nextTransition?.nextSceneId ? { nextSceneId: nextTransition.nextSceneId } : {}),
            ...(!nextTransition ? { isEnd: true } : {}),
          },
        ];
      }),
    ),
  };
}

export function adaptSceneFlowToCitySceneView(
  flow: SceneFlowData,
  currentNodeId: string,
  options: {
    resolveDialogueId?: (flowId: string) => string | null;
    resolveTravelBoardId?: (flowId: string) => string | null;
  } = {},
): CitySceneData | null {
  if (flow.mode !== 'hub') {
    return null;
  }

  const currentNode = flow.nodes[currentNodeId];

  if (!currentNode) {
    return null;
  }

  return {
    id: flow.id,
    cityId: flow.hubMeta?.cityId ?? flow.chapterId ?? 'hub',
    cityName: flow.hubMeta?.cityName ?? flow.chapterId ?? 'Hub',
    locationName: flow.hubMeta?.locationName ?? currentNode.title ?? flow.title,
    ...(flow.chapterId ? { chapterId: flow.chapterId } : {}),
    ...(flow.hubMeta?.districtLabel ? { districtLabel: flow.hubMeta.districtLabel } : {}),
    ...(flow.hubMeta?.statusLabel ? { statusLabel: flow.hubMeta.statusLabel } : {}),
    ...(flow.description ?? currentNode.text ? { description: flow.description ?? currentNode.text } : {}),
    ...(flow.defaultBackgroundId ? { backgroundId: flow.defaultBackgroundId } : {}),
    actions: currentNode.transitions.map((transition) =>
      mapTransitionToHubAction(transition, options),
    ),
  };
}

function mapSceneFlowNodeToTravelNode(node: SceneFlowNode): TravelNode {
  return {
    id: node.id,
    x: node.route?.x ?? 0,
    y: node.route?.y ?? 0,
    type: inferTravelNodeType(node),
    nextNodeIds: node.transitions
      .map((transition) => transition.nextNodeId)
      .filter((nextNodeId): nextNodeId is string => Boolean(nextNodeId)),
    ...(node.title ? { title: node.title } : {}),
    ...(node.text ? { description: node.text } : {}),
    ...(node.route?.hidden !== undefined ? { hidden: node.route.hidden } : {}),
    ...(node.route?.oneTime !== undefined ? { oneTime: node.route.oneTime } : {}),
    ...(node.route?.tags ? { tags: [...node.route.tags] } : {}),
    ...(node.encounter?.kind === 'battle' && node.encounter.battleTemplateId
      ? {
          battleTemplateId: node.encounter.battleTemplateId,
        }
      : {}),
    ...(node.encounter?.kind === 'dialogue' && node.encounter.dialogueId
      ? {
          dialogueId: node.encounter.dialogueId,
        }
      : {}),
    ...(node.encounter?.kind === 'loot' && node.encounter.itemId
      ? {
          itemId: node.encounter.itemId,
          ...(node.encounter.itemQuantity !== undefined
            ? { itemQuantity: node.encounter.itemQuantity }
            : {}),
        }
      : {}),
    ...(node.encounter?.kind === 'script' && node.encounter.scriptId
      ? {
          eventRefId: node.encounter.scriptId,
        }
      : {}),
    ...(node.encounter?.effects?.length
      ? {
          onResolveEffects: [...node.encounter.effects],
        }
      : {}),
  };
}

export function adaptSceneFlowToTravelBoardView(flow: SceneFlowData): TravelBoardData | null {
  if (flow.mode !== 'route') {
    return null;
  }

  return {
    id: flow.id,
    title: flow.title,
    startNodeId: flow.startNodeId,
    ...(flow.chapterId ? { chapterId: flow.chapterId } : {}),
    ...(flow.description ? { description: flow.description } : {}),
    ...(flow.defaultBackgroundId ? { backgroundId: flow.defaultBackgroundId } : {}),
    ...(flow.routeRules?.scoutCharges !== undefined
      ? { scoutCharges: flow.routeRules.scoutCharges }
      : {}),
    ...(flow.routeRules?.scoutDepth !== undefined
      ? { scoutDepth: flow.routeRules.scoutDepth }
      : {}),
    ...(flow.routeRules?.stepTimeCost ? { stepTimeCost: { ...flow.routeRules.stepTimeCost } } : {}),
    nodes: Object.fromEntries(
      Object.values(flow.nodes).map((node): [string, TravelNode] => [
        node.id,
        mapSceneFlowNodeToTravelNode(node),
      ]),
    ),
  };
}
