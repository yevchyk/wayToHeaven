import type { NarrativeAssetKind } from '@engine/types/narrative';
import type { SceneFlowData, SceneFlowEncounter, SceneFlowFallbackTarget, SceneFlowNode, SceneFlowTransition } from '@engine/types/sceneFlow';
import type { GameEffect } from '@engine/types/effects';

export type SceneFlowValidationIssueCode =
  | 'missingStartNode'
  | 'missingNodeReference'
  | 'missingSceneFlowReference'
  | 'invalidTransition'
  | 'conflictingTransitionTarget'
  | 'missingEncounterPayload'
  | 'missingRouteLayout'
  | 'unexpectedRouteLayout'
  | 'invalidRouteModeNode'
  | 'missingExitNode'
  | 'unreachableNode'
  | 'invalidConditionFallback'
  | 'invalidMusicPayload'
  | 'missingAssetReference'
  | 'invalidHubTransition'
  | 'invalidSequenceNode';

export interface SceneFlowValidationIssue {
  code: SceneFlowValidationIssueCode;
  message: string;
  path: string;
  targetId?: string;
}

interface SceneFlowValidatorOptions {
  hasSceneFlowId?: (sceneFlowId: string) => boolean;
  hasAssetOfKind?: (assetId: string, kind: NarrativeAssetKind) => boolean;
}

function requiresEncounterPayload(encounter: SceneFlowEncounter) {
  switch (encounter.kind) {
    case 'battle':
      return !encounter.battleTemplateId;
    case 'dialogue':
      return !encounter.dialogueId && !encounter.openSceneFlowId;
    case 'loot':
      return !encounter.itemId;
    case 'script':
      return !encounter.scriptId;
    default:
      return false;
  }
}

function collectJumpNodeTargets(effects: readonly GameEffect[] | undefined) {
  return (effects ?? [])
    .filter((effect): effect is Extract<GameEffect, { type: 'jumpToNode' }> => effect.type === 'jumpToNode')
    .map((effect) => effect.nodeId);
}

function collectReachableNodeIds(sceneFlow: SceneFlowData) {
  const visited = new Set<string>();
  const queue: string[] = [];

  if (sceneFlow.nodes[sceneFlow.startNodeId]) {
    queue.push(sceneFlow.startNodeId);
  }

  if (sceneFlow.onConditionFail?.nextNodeId && sceneFlow.nodes[sceneFlow.onConditionFail.nextNodeId]) {
    queue.push(sceneFlow.onConditionFail.nextNodeId);
  }

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (!nodeId || visited.has(nodeId) || !sceneFlow.nodes[nodeId]) {
      continue;
    }

    visited.add(nodeId);

    const node = sceneFlow.nodes[nodeId];
    const nextNodeIds = [
      node.onConditionFail?.nextNodeId,
      ...node.transitions.map((transition) => transition.nextNodeId),
      ...collectJumpNodeTargets(node.onEnterEffects),
      ...collectJumpNodeTargets(node.onExitEffects),
      ...node.transitions.flatMap((transition) => collectJumpNodeTargets(transition.effects)),
    ]
      .filter((targetId): targetId is string => Boolean(targetId))
      .filter((targetId) => targetId in sceneFlow.nodes);

    nextNodeIds.forEach((nextNodeId) => {
      if (!visited.has(nextNodeId)) {
        queue.push(nextNodeId);
      }
    });
  }

  return visited;
}

export class SceneFlowValidator {
  private readonly hasSceneFlowId: SceneFlowValidatorOptions['hasSceneFlowId'];
  private readonly hasAssetOfKind: SceneFlowValidatorOptions['hasAssetOfKind'];

  constructor(options: SceneFlowValidatorOptions = {}) {
    this.hasSceneFlowId = options.hasSceneFlowId;
    this.hasAssetOfKind = options.hasAssetOfKind;
  }

  validate(sceneFlow: SceneFlowData) {
    const issues: SceneFlowValidationIssue[] = [];

    if (!sceneFlow.nodes[sceneFlow.startNodeId]) {
      issues.push({
        code: 'missingStartNode',
        message: `Scene flow "${sceneFlow.id}" references missing start node "${sceneFlow.startNodeId}".`,
        path: 'startNodeId',
        targetId: sceneFlow.startNodeId,
      });
    }

    this.validateFallback(sceneFlow.onConditionFail, sceneFlow, 'onConditionFail', issues);
    this.validateDefaultAssets(sceneFlow, issues);

    Object.values(sceneFlow.nodes).forEach((node) => {
      this.validateNode(sceneFlow, node, issues);
    });

    if (sceneFlow.mode === 'route' && !Object.values(sceneFlow.nodes).some((node) => node.encounter?.kind === 'exit')) {
      issues.push({
        code: 'missingExitNode',
        message: `Route scene flow "${sceneFlow.id}" must contain at least one exit encounter.`,
        path: 'nodes',
      });
    }

    if (sceneFlow.nodes[sceneFlow.startNodeId]) {
      const reachableNodeIds = collectReachableNodeIds(sceneFlow);

      Object.keys(sceneFlow.nodes).forEach((nodeId) => {
        if (reachableNodeIds.has(nodeId)) {
          return;
        }

        issues.push({
          code: 'unreachableNode',
          message: `Node "${nodeId}" in scene flow "${sceneFlow.id}" is unreachable from the start graph.`,
          path: `nodes.${nodeId}`,
          targetId: nodeId,
        });
      });
    }

    return issues;
  }

  assertValid(sceneFlow: SceneFlowData) {
    const issues = this.validate(sceneFlow);

    if (issues.length > 0) {
      const summary = issues.map((issue) => issue.message).join(' ');

      throw new Error(`Invalid scene flow "${sceneFlow.id}". ${summary}`);
    }
  }

  private validateNode(
    sceneFlow: SceneFlowData,
    node: SceneFlowNode,
    issues: SceneFlowValidationIssue[],
  ) {
    this.validateNodeAssets(sceneFlow, node, issues);
    this.validateMusic(sceneFlow.id, node.music, `nodes.${node.id}.music`, issues);
    this.validateFallback(node.onConditionFail, sceneFlow, `nodes.${node.id}.onConditionFail`, issues);

    if (sceneFlow.mode === 'route') {
      if (node.kind !== 'route') {
        issues.push({
          code: 'invalidRouteModeNode',
          message: `Route scene flow "${sceneFlow.id}" contains non-route node "${node.id}".`,
          path: `nodes.${node.id}.kind`,
          targetId: node.kind,
        });
      }

      if (!node.route) {
        issues.push({
          code: 'missingRouteLayout',
          message: `Route node "${node.id}" is missing route layout coordinates.`,
          path: `nodes.${node.id}.route`,
        });
      }
    }

    if (sceneFlow.mode === 'sequence' && node.route) {
      issues.push({
        code: 'unexpectedRouteLayout',
        message: `Sequence scene flow "${sceneFlow.id}" should not define route layout on node "${node.id}".`,
        path: `nodes.${node.id}.route`,
      });
    }

    if (sceneFlow.mode === 'hub' && node.transitions.some((transition) => !transition.label)) {
      issues.push({
        code: 'invalidHubTransition',
        message: `Hub scene flow "${sceneFlow.id}" requires labels on transitions in node "${node.id}".`,
        path: `nodes.${node.id}.transitions`,
      });
    }

    if (sceneFlow.mode === 'sequence' && node.kind !== 'choice' && node.transitions.length > 1) {
      issues.push({
        code: 'invalidSequenceNode',
        message: `Sequence node "${node.id}" in scene flow "${sceneFlow.id}" cannot define multiple automatic transitions.`,
        path: `nodes.${node.id}.transitions`,
      });
    }

    node.transitions.forEach((transition, index) => {
      const path = `nodes.${node.id}.transitions[${index}]`;

      this.validateTransition(sceneFlow, node, transition, path, issues);
    });

    if (node.encounter && requiresEncounterPayload(node.encounter)) {
      issues.push({
        code: 'missingEncounterPayload',
        message: `Node "${node.id}" is missing payload for encounter kind "${node.encounter.kind}".`,
        path: `nodes.${node.id}.encounter`,
        targetId: node.encounter.kind,
      });
    }

    if (
      node.encounter?.openSceneFlowId &&
      this.hasSceneFlowId &&
      !this.hasSceneFlowId(node.encounter.openSceneFlowId)
    ) {
      issues.push({
        code: 'missingSceneFlowReference',
        message: `Encounter on node "${node.id}" references missing scene flow "${node.encounter.openSceneFlowId}".`,
        path: `nodes.${node.id}.encounter.openSceneFlowId`,
        targetId: node.encounter.openSceneFlowId,
      });
    }
  }

  private validateTransition(
    sceneFlow: SceneFlowData,
    node: SceneFlowNode,
    transition: SceneFlowTransition,
    path: string,
    issues: SceneFlowValidationIssue[],
  ) {
    const transitionTargets = [
      transition.nextNodeId,
      transition.nextSceneId,
      transition.openSceneFlowId,
    ].filter((value): value is string => Boolean(value));

    if (transitionTargets.length > 1) {
      issues.push({
        code: 'conflictingTransitionTarget',
        message: `Transition "${transition.id}" in node "${node.id}" cannot target multiple destinations.`,
        path,
        targetId: transition.id,
      });
    }

    if (
      transitionTargets.length === 0 &&
      (transition.effects?.length ?? 0) === 0
    ) {
      issues.push({
        code: 'invalidTransition',
        message: `Transition "${transition.id}" in node "${node.id}" must point somewhere or apply effects.`,
        path,
        targetId: transition.id,
      });
    }

    if (transition.nextNodeId && !sceneFlow.nodes[transition.nextNodeId]) {
      issues.push({
        code: 'missingNodeReference',
        message: `Transition "${transition.id}" in node "${node.id}" references missing node "${transition.nextNodeId}".`,
        path: `${path}.nextNodeId`,
        targetId: transition.nextNodeId,
      });
    }

    if (transition.nextSceneId && this.hasSceneFlowId && !this.hasSceneFlowId(transition.nextSceneId)) {
      issues.push({
        code: 'missingSceneFlowReference',
        message: `Transition "${transition.id}" in node "${node.id}" references missing scene flow "${transition.nextSceneId}".`,
        path: `${path}.nextSceneId`,
        targetId: transition.nextSceneId,
      });
    }

    if (transition.openSceneFlowId && this.hasSceneFlowId && !this.hasSceneFlowId(transition.openSceneFlowId)) {
      issues.push({
        code: 'missingSceneFlowReference',
        message: `Transition "${transition.id}" in node "${node.id}" references missing scene flow "${transition.openSceneFlowId}".`,
        path: `${path}.openSceneFlowId`,
        targetId: transition.openSceneFlowId,
      });
    }

    if (transition.once && sceneFlow.mode !== 'hub') {
      issues.push({
        code: 'invalidTransition',
        message: `Transition "${transition.id}" in node "${node.id}" uses once outside of hub mode.`,
        path: `${path}.once`,
        targetId: transition.id,
      });
    }
  }

  private validateFallback(
    fallback: SceneFlowFallbackTarget | undefined,
    sceneFlow: SceneFlowData,
    path: string,
    issues: SceneFlowValidationIssue[],
  ) {
    if (!fallback) {
      return;
    }

    const targets = [fallback.nextNodeId, fallback.nextSceneId, fallback.openSceneFlowId]
      .filter((value): value is string => Boolean(value));
    const hasEnd = fallback.end === true;

    if ((targets.length === 0 && !hasEnd) || targets.length > 1 || (targets.length > 0 && hasEnd)) {
      issues.push({
        code: 'invalidConditionFallback',
        message: `Condition fallback at "${path}" in scene flow "${sceneFlow.id}" must choose exactly one target or end.`,
        path,
      });
    }

    if (fallback.nextNodeId && !sceneFlow.nodes[fallback.nextNodeId]) {
      issues.push({
        code: 'missingNodeReference',
        message: `Condition fallback at "${path}" references missing node "${fallback.nextNodeId}".`,
        path: `${path}.nextNodeId`,
        targetId: fallback.nextNodeId,
      });
    }

    if (fallback.nextSceneId && this.hasSceneFlowId && !this.hasSceneFlowId(fallback.nextSceneId)) {
      issues.push({
        code: 'missingSceneFlowReference',
        message: `Condition fallback at "${path}" references missing scene flow "${fallback.nextSceneId}".`,
        path: `${path}.nextSceneId`,
        targetId: fallback.nextSceneId,
      });
    }

    if (fallback.openSceneFlowId && this.hasSceneFlowId && !this.hasSceneFlowId(fallback.openSceneFlowId)) {
      issues.push({
        code: 'missingSceneFlowReference',
        message: `Condition fallback at "${path}" references missing scene flow "${fallback.openSceneFlowId}".`,
        path: `${path}.openSceneFlowId`,
        targetId: fallback.openSceneFlowId,
      });
    }
  }

  private validateMusic(
    sceneFlowId: string,
    music: SceneFlowNode['music'] | SceneFlowData['defaultMusic'],
    path: string,
    issues: SceneFlowValidationIssue[],
  ) {
    if (!music) {
      return;
    }

    const musicMode = music.action ?? music.mode;

    if ((musicMode === 'play' || musicMode === 'switch') && !music.musicId) {
      issues.push({
        code: 'invalidMusicPayload',
        message: `Music payload at "${path}" in scene flow "${sceneFlowId}" requires musicId.`,
        path: `${path}.musicId`,
      });
    }

    if (music.musicId && this.hasAssetOfKind && !this.hasAssetOfKind(music.musicId, 'music')) {
      issues.push({
        code: 'missingAssetReference',
        message: `Music asset "${music.musicId}" referenced at "${path}" is missing.`,
        path: `${path}.musicId`,
        targetId: music.musicId,
      });
    }
  }

  private validateDefaultAssets(sceneFlow: SceneFlowData, issues: SceneFlowValidationIssue[]) {
    this.validateAsset(sceneFlow.defaultBackgroundId, 'background', 'defaultBackgroundId', sceneFlow.id, issues);
    this.validateAsset(sceneFlow.defaultMusicId, 'music', 'defaultMusicId', sceneFlow.id, issues);
    this.validateMusic(sceneFlow.id, sceneFlow.defaultMusic, 'defaultMusic', issues);
    this.validateAsset(sceneFlow.defaultCgId, 'cg', 'defaultCgId', sceneFlow.id, issues);
    this.validateAsset(sceneFlow.defaultOverlayId, 'overlay', 'defaultOverlayId', sceneFlow.id, issues);
    sceneFlow.defaultStage?.characters?.forEach((character, index) => {
      this.validateAsset(
        character.portraitId,
        'portrait',
        `defaultStage.characters[${index}].portraitId`,
        sceneFlow.id,
        issues,
      );
    });
  }

  private validateNodeAssets(
    sceneFlow: SceneFlowData,
    node: SceneFlowNode,
    issues: SceneFlowValidationIssue[],
  ) {
    this.validateAsset(node.backgroundId, 'background', `nodes.${node.id}.backgroundId`, sceneFlow.id, issues);
    this.validateAsset(node.cgId, 'cg', `nodes.${node.id}.cgId`, sceneFlow.id, issues);
    this.validateAsset(node.overlayId, 'overlay', `nodes.${node.id}.overlayId`, sceneFlow.id, issues);
    this.validateAsset(node.portraitId, 'portrait', `nodes.${node.id}.portraitId`, sceneFlow.id, issues);

    node.stage?.characters?.forEach((character, index) => {
      this.validateAsset(
        character.portraitId,
        'portrait',
        `nodes.${node.id}.stage.characters[${index}].portraitId`,
        sceneFlow.id,
        issues,
      );
    });

    if (node.stage?.backgroundId) {
      this.validateAsset(
        node.stage.backgroundId,
        'background',
        `nodes.${node.id}.stage.backgroundId`,
        sceneFlow.id,
        issues,
      );
    }

    if (node.stage?.cgId) {
      this.validateAsset(
        node.stage.cgId,
        'cg',
        `nodes.${node.id}.stage.cgId`,
        sceneFlow.id,
        issues,
      );
    }

    if (node.stage?.overlayId) {
      this.validateAsset(
        node.stage.overlayId,
        'overlay',
        `nodes.${node.id}.stage.overlayId`,
        sceneFlow.id,
        issues,
      );
    }
  }

  private validateAsset(
    assetId: string | undefined,
    kind: NarrativeAssetKind,
    path: string,
    sceneFlowId: string,
    issues: SceneFlowValidationIssue[],
  ) {
    if (!assetId || !this.hasAssetOfKind) {
      return;
    }

    if (this.hasAssetOfKind(assetId, kind)) {
      return;
    }

    issues.push({
      code: 'missingAssetReference',
      message: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} asset "${assetId}" referenced by scene flow "${sceneFlowId}" is missing.`,
      path,
      targetId: assetId,
    });
  }
}
