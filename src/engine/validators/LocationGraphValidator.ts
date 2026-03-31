import type { LocationData } from '@engine/types/world';
import {
  EffectReferenceValidator,
  type EffectReferenceValidationIssueCode,
} from '@engine/validators/EffectReferenceValidator';
import type { ContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

export type LocationGraphValidationIssueCode =
  | 'missingStartNode'
  | 'invalidNodeId'
  | 'missingConnectionReference'
  | 'isolatedNode'
  | 'missingDialogueReference'
  | 'missingSceneFlowReference'
  | EffectReferenceValidationIssueCode;

export interface LocationGraphValidationIssue {
  code: LocationGraphValidationIssueCode;
  message: string;
  nodeId?: string;
  targetId?: string;
  path?: string;
}

function collectReachableNodeIds(location: LocationData) {
  const visited = new Set<string>();
  const queue = [location.startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (!nodeId || visited.has(nodeId) || !location.nodes[nodeId]) {
      continue;
    }

    visited.add(nodeId);

    location.nodes[nodeId]?.connectedNodeIds.forEach((connectedNodeId) => {
      if (!visited.has(connectedNodeId)) {
        queue.push(connectedNodeId);
      }
    });
  }

  return visited;
}

export class LocationGraphValidator {
  private readonly referenceLookup: ContentReferenceLookup | undefined;
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(
    referenceLookup?: ContentReferenceLookup,
    effectReferenceValidator: EffectReferenceValidator = new EffectReferenceValidator(referenceLookup),
  ) {
    this.referenceLookup = referenceLookup;
    this.effectReferenceValidator = effectReferenceValidator;
  }

  validate(location: LocationData) {
    const issues: LocationGraphValidationIssue[] = [];
    const nodeEntries = Object.entries(location.nodes);

    if (!location.nodes[location.startNodeId]) {
      issues.push({
        code: 'missingStartNode',
        message: `Start node "${location.startNodeId}" does not exist.`,
        targetId: location.startNodeId,
        path: 'startNodeId',
      });
    }

    nodeEntries.forEach(([nodeId, node]) => {
      if (node.id !== nodeId) {
        issues.push({
          code: 'invalidNodeId',
          message: `Location node key "${nodeId}" does not match node.id "${node.id}".`,
          nodeId,
          targetId: node.id,
          path: `nodes.${nodeId}.id`,
        });
      }

      node.connectedNodeIds.forEach((connectedNodeId) => {
        if (!location.nodes[connectedNodeId]) {
          issues.push({
            code: 'missingConnectionReference',
            message: `Node "${nodeId}" references missing connected node "${connectedNodeId}".`,
            nodeId,
            targetId: connectedNodeId,
            path: `nodes.${nodeId}.connectedNodeIds`,
          });
        }
      });

      if (node.interaction?.type === 'dialogue' && this.referenceLookup) {
        if (!this.referenceLookup.hasDialogue(node.interaction.dialogueId)) {
          issues.push({
            code: 'missingDialogueReference',
            message: `Node "${nodeId}" references missing dialogue "${node.interaction.dialogueId}".`,
            nodeId,
            targetId: node.interaction.dialogueId,
            path: `nodes.${nodeId}.interaction.dialogueId`,
          });
        }
      }

      if (node.interaction?.type === 'sceneFlow' && this.referenceLookup) {
        if (!this.referenceLookup.hasSceneFlow(node.interaction.sceneFlowId)) {
          issues.push({
            code: 'missingSceneFlowReference',
            message: `Node "${nodeId}" references missing scene flow "${node.interaction.sceneFlowId}".`,
            nodeId,
            targetId: node.interaction.sceneFlowId,
            path: `nodes.${nodeId}.interaction.sceneFlowId`,
          });
        }
      }

      if (node.interaction?.type === 'battle' && this.referenceLookup) {
        if (!this.referenceLookup.hasBattle(node.interaction.battleTemplateId)) {
          issues.push({
            code: 'missingBattleReference',
            message: `Node "${nodeId}" references missing battle template "${node.interaction.battleTemplateId}".`,
            nodeId,
            targetId: node.interaction.battleTemplateId,
            path: `nodes.${nodeId}.interaction.battleTemplateId`,
          });
        }
      }

      issues.push(
        ...this.effectReferenceValidator.validateEffects(
          node.onEnterEffects,
          `nodes.${nodeId}.onEnterEffects`,
        ).map((issue) => ({
          code: issue.code,
          message: issue.message,
          nodeId,
          path: issue.path,
          ...(issue.targetId ? { targetId: issue.targetId } : {}),
        })),
      );
    });

    issues.push(
      ...this.effectReferenceValidator.validateEffects(location.onEnterEffects, 'onEnterEffects').map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path,
        ...(issue.targetId ? { targetId: issue.targetId } : {}),
      })),
    );

    if (issues.some((issue) => issue.code === 'missingStartNode')) {
      return issues;
    }

    const reachableNodeIds = collectReachableNodeIds(location);

    nodeEntries.forEach(([nodeId]) => {
      if (!reachableNodeIds.has(nodeId)) {
        issues.push({
          code: 'isolatedNode',
          message: `Node "${nodeId}" is unreachable from the start node.`,
          nodeId,
          path: `nodes.${nodeId}`,
        });
      }
    });

    return issues;
  }

  assertValid(location: LocationData) {
    const issues = this.validate(location);

    if (issues.length > 0) {
      throw new Error(
        `Invalid location "${location.id}". ${issues.map((issue) => issue.message).join(' ')}`,
      );
    }
  }
}
