import type { TravelBoardData, TravelNodeType } from '@engine/types/travel';
import type { ContentReferenceLookup } from '@engine/validators/contentReferenceLookup';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';

export type TravelBoardValidationIssueCode =
  | 'missingStartNode'
  | 'missingNextNodeReference'
  | 'missingBattleReference'
  | 'missingTravelBoardReference'
  | 'missingDialogueReference'
  | 'missingItemReference'
  | 'missingScriptReference'
  | 'unreachableNode'
  | 'deadEndNode'
  | 'missingExitNode';

export interface TravelBoardValidationIssue {
  code: TravelBoardValidationIssueCode;
  message: string;
  path: string;
  targetId?: string;
}

export class TravelBoardValidator {
  private readonly lookup: ContentReferenceLookup | undefined;
  private readonly effectReferenceValidator: EffectReferenceValidator;

  constructor(lookup?: ContentReferenceLookup, effectReferenceValidator?: EffectReferenceValidator) {
    this.lookup = lookup;
    this.effectReferenceValidator = effectReferenceValidator ?? new EffectReferenceValidator(lookup);
  }

  validate(board: TravelBoardData) {
    const issues: TravelBoardValidationIssue[] = [];
    const nodeIds = Object.keys(board.nodes);
    const startNode = board.nodes[board.startNodeId];

    if (!startNode) {
      issues.push({
        code: 'missingStartNode',
        message: `Travel board "${board.id}" references missing start node "${board.startNodeId}".`,
        path: 'startNodeId',
        targetId: board.startNodeId,
      });
    }

    Object.values(board.nodes).forEach((node) => {
      node.nextNodeIds.forEach((nextNodeId, index) => {
        if (!(nextNodeId in board.nodes)) {
          issues.push({
            code: 'missingNextNodeReference',
            message: `Travel node "${node.id}" references missing next node "${nextNodeId}".`,
            path: `nodes.${node.id}.nextNodeIds[${index}]`,
            targetId: nextNodeId,
          });
        }
      });

      issues.push(...this.validateNodeReference(node.type, node, board.id));

      this.effectReferenceValidator
        .validateEffects(node.onResolveEffects, `nodes.${node.id}.onResolveEffects`)
        .forEach((issue) => {
          const mappedCode =
            issue.code === 'missingBattleReference'
              ? 'missingBattleReference'
              : issue.code === 'missingTravelBoardReference'
                ? 'missingTravelBoardReference'
              : issue.code === 'missingItemReference'
                ? 'missingItemReference'
                : issue.code === 'missingScriptReference'
                  ? 'missingScriptReference'
                  : null;

          if (!mappedCode) {
            return;
          }

          issues.push({
            code: mappedCode,
            message: issue.message,
            path: issue.path,
            ...(issue.targetId ? { targetId: issue.targetId } : {}),
          });
        });

      if (node.type !== 'exit' && node.nextNodeIds.length === 0) {
        issues.push({
          code: 'deadEndNode',
          message: `Travel node "${node.id}" is a dead end without being marked as an exit.`,
          path: `nodes.${node.id}.nextNodeIds`,
        });
      }
    });

    if (!nodeIds.some((nodeId) => board.nodes[nodeId]?.type === 'exit')) {
      issues.push({
        code: 'missingExitNode',
        message: `Travel board "${board.id}" does not contain an exit node.`,
        path: 'nodes',
      });
    }

    if (startNode) {
      const reachableNodeIds = this.collectReachableNodeIds(board, board.startNodeId);

      nodeIds.forEach((nodeId) => {
        if (!reachableNodeIds.has(nodeId)) {
          issues.push({
            code: 'unreachableNode',
            message: `Travel node "${nodeId}" is unreachable from the start node.`,
            path: `nodes.${nodeId}`,
            targetId: nodeId,
          });
        }
      });
    }

    return issues;
  }

  assertValid(board: TravelBoardData) {
    const issues = this.validate(board);

    if (issues.length > 0) {
      const summary = issues.map((issue) => issue.message).join(' ');

      throw new Error(`Invalid travel board "${board.id}". ${summary}`);
    }
  }

  private validateNodeReference(type: TravelNodeType, node: TravelBoardData['nodes'][string], boardId: string) {
    if (!this.lookup) {
      return [];
    }

    switch (type) {
      case 'battle':
      case 'eliteBattle':
      case 'boss': {
        const battleTemplateId = node.battleTemplateId ?? node.encounterRefId;

        if (!battleTemplateId || !this.lookup.hasBattle(battleTemplateId)) {
          return [
            {
              code: 'missingBattleReference' as const,
              message: `Travel node "${node.id}" references missing battle template "${battleTemplateId ?? 'unknown'}".`,
              path: `nodes.${node.id}.battleTemplateId`,
              ...(battleTemplateId ? { targetId: battleTemplateId } : {}),
            },
          ];
        }

        return [];
      }
      case 'story': {
        const dialogueId = node.dialogueId ?? node.eventRefId;

        if (!dialogueId || !this.lookup.hasDialogue(dialogueId)) {
          return [
            {
              code: 'missingDialogueReference' as const,
              message: `Travel node "${node.id}" references missing dialogue "${dialogueId ?? 'unknown'}".`,
              path: `nodes.${node.id}.dialogueId`,
              ...(dialogueId ? { targetId: dialogueId } : {}),
            },
          ];
        }

        return [];
      }
      case 'loot':
        return node.itemId && !this.lookup.hasItem(node.itemId)
          ? [
              {
                code: 'missingItemReference' as const,
                message: `Travel node "${node.id}" references missing item "${node.itemId}".`,
                path: `nodes.${node.id}.itemId`,
                targetId: node.itemId,
              },
            ]
          : [];
      case 'question':
        return node.eventRefId && !this.lookup.hasScript(node.eventRefId)
          ? [
              {
                code: 'missingScriptReference' as const,
                message: `Travel node "${node.id}" references missing script "${node.eventRefId}".`,
                path: `nodes.${node.id}.eventRefId`,
                targetId: node.eventRefId,
              },
            ]
          : [];
      default:
        return [];
    }
  }

  private collectReachableNodeIds(board: TravelBoardData, startNodeId: string) {
    const reachableNodeIds = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift();

      if (!nodeId || reachableNodeIds.has(nodeId)) {
        continue;
      }

      reachableNodeIds.add(nodeId);

      const node = board.nodes[nodeId];

      if (!node) {
        continue;
      }

      node.nextNodeIds.forEach((nextNodeId) => {
        if (!reachableNodeIds.has(nextNodeId)) {
          queue.push(nextNodeId);
        }
      });
    }

    return reachableNodeIds;
  }
}
