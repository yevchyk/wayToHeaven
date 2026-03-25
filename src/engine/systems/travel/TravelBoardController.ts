import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { TravelBoardData, TravelNode } from '@engine/types/travel';

type RandomSource = () => number;

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

export class TravelBoardController {
  readonly rootStore: GameRootStore;

  private readonly random: RandomSource;

  constructor(rootStore: GameRootStore, random: RandomSource = Math.random) {
    this.rootStore = rootStore;
    this.random = random;
  }

  startBoard(boardId: string, startNodeId?: string) {
    const board = this.requireBoard(boardId);

    this.rootStore.travelBoardValidator.assertValid(board);

    const resolvedStartNodeId = startNodeId ?? board.startNodeId;
    const startNode = board.nodes[resolvedStartNodeId];

    if (!startNode) {
      throw new Error(`Travel board "${boardId}" does not contain start node "${resolvedStartNodeId}".`);
    }

    const revealedNodeIds = uniqueValues([
      resolvedStartNodeId,
      ...Object.values(board.nodes)
        .filter((node) => node.hidden !== true)
        .map((node) => node.id),
    ]);

    this.rootStore.travelBoard.initialize({
      boardId,
      phase: 'awaitingRoll',
      currentNodeId: resolvedStartNodeId,
      revealedNodeIds,
      visitedNodeIds: [resolvedStartNodeId],
      resolvedNodeIds: [],
      remainingSteps: 0,
      lastRoll: null,
      scoutCharges: board.scoutCharges ?? 1,
      scoutDepth: board.scoutDepth ?? 2,
      eventLog: [],
      returnScreenId:
        this.rootStore.ui.activeScreen === 'travelBoard' ? null : this.rootStore.ui.activeScreen,
    });
    this.rootStore.ui.setScreen('travelBoard');
    this.rootStore.travelBoard.pushLog('system', `Entered ${board.title}.`, resolvedStartNodeId);

    return this.rootStore.travelBoard.boardRuntime;
  }

  rollDice() {
    if (!this.rootStore.travelBoard.hasActiveBoard || !this.rootStore.travelBoard.isAwaitingRoll) {
      return null;
    }

    const roll = 1 + Math.floor(this.random() * 6);

    this.rootStore.travelBoard.setLastRoll(roll);
    this.rootStore.travelBoard.setRemainingSteps(roll);
    this.rootStore.travelBoard.setPhase('moving');
    this.rootStore.travelBoard.pushLog('roll', `Rolled ${roll}.`);
    this.advanceMovement();

    return roll;
  }

  chooseDirection(nodeId: string) {
    if (!this.rootStore.travelBoard.isAwaitingDirection) {
      return false;
    }

    if (!this.rootStore.travelBoard.availableDirectionNodeIds.includes(nodeId)) {
      return false;
    }

    this.moveAlongPath(nodeId);
    this.advanceMovement();

    return true;
  }

  useScout(depth = this.rootStore.travelBoard.scoutDepth) {
    if (!this.rootStore.travelBoard.hasActiveBoard || depth <= 0) {
      return [];
    }

    if (!this.rootStore.travelBoard.consumeScoutCharge()) {
      return [];
    }

    const nodeIdsToReveal = this.collectNodesAhead(depth);

    this.rootStore.travelBoard.revealNodes(nodeIdsToReveal);
    this.rootStore.travelBoard.pushLog(
      'scout',
      nodeIdsToReveal.length > 0
        ? `Scout reveals ${nodeIdsToReveal.length} route markers ahead.`
        : 'Scout finds nothing beyond the next turn.',
      this.rootStore.travelBoard.currentNodeId ?? undefined,
    );

    return nodeIdsToReveal;
  }

  getAvailableDirections() {
    const board = this.requireActiveBoard();

    return this.rootStore.travelBoard.availableDirectionNodeIds
      .map((nodeId) => board.nodes[nodeId])
      .filter((node): node is TravelNode => node !== undefined);
  }

  private advanceMovement() {
    while (this.rootStore.travelBoard.hasActiveBoard && this.rootStore.travelBoard.phase === 'moving') {
      if (this.rootStore.travelBoard.remainingSteps <= 0) {
        this.resolveCurrentNode();

        return;
      }

      const availableDirectionNodeIds = this.rootStore.travelBoard.availableDirectionNodeIds;

      if (availableDirectionNodeIds.length === 0) {
        this.rootStore.travelBoard.pushLog(
          'system',
          'The route ends before the remaining steps can be spent.',
          this.rootStore.travelBoard.currentNodeId ?? undefined,
        );
        this.rootStore.travelBoard.setRemainingSteps(0);
        this.resolveCurrentNode();

        return;
      }

      if (availableDirectionNodeIds.length > 1) {
        this.rootStore.travelBoard.setPhase('awaitingDirection');

        return;
      }

      const [nextNodeId] = availableDirectionNodeIds;

      if (!nextNodeId) {
        return;
      }

      this.moveAlongPath(nextNodeId);
    }
  }

  private moveAlongPath(nodeId: string) {
    const board = this.requireActiveBoard();
    const node = board.nodes[nodeId];

    if (!node) {
      throw new Error(`Travel board "${board.id}" does not contain node "${nodeId}".`);
    }

    this.rootStore.travelBoard.consumeStep();
    this.rootStore.travelBoard.moveToNode(nodeId);
    this.rootStore.travelBoard.pushLog('movement', `Moved to ${node.title ?? node.id}.`, nodeId);
    this.rootStore.travelBoard.setPhase('moving');
  }

  private resolveCurrentNode() {
    const node = this.rootStore.travelBoard.currentNode;

    if (!node) {
      return;
    }

    this.rootStore.travelBoard.setPhase('resolvingNode');

    const alreadyResolved = this.rootStore.travelBoard.resolvedNodeIds.includes(node.id);

    if (!(alreadyResolved && node.oneTime)) {
      const resolution = this.rootStore.travelEncounterResolver.resolve(node);

      this.rootStore.travelBoard.markResolved(node.id);
      this.rootStore.travelBoard.pushLog('encounter', resolution.message, node.id);

      if (resolution.completed) {
        this.rootStore.travelBoard.setPhase('completed');
        this.rootStore.travelBoard.endBoard();

        return;
      }
    } else {
      this.rootStore.travelBoard.pushLog(
        'system',
        `${node.title ?? node.id} has already been resolved.`,
        node.id,
      );
    }

    if (this.rootStore.travelBoard.hasActiveBoard) {
      this.rootStore.travelBoard.setRemainingSteps(0);
      this.rootStore.travelBoard.setPhase('awaitingRoll');
    }
  }

  private collectNodesAhead(depth: number) {
    const board = this.requireActiveBoard();
    const startNodeId = this.rootStore.travelBoard.currentNodeId;

    if (!startNodeId) {
      return [];
    }

    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];
    const visited = new Set<string>([startNodeId]);
    const revealed: string[] = [];

    while (queue.length > 0) {
      const next = queue.shift();

      if (!next) {
        continue;
      }

      if (next.depth >= depth) {
        continue;
      }

      const node = board.nodes[next.nodeId];

      if (!node) {
        continue;
      }

      node.nextNodeIds.forEach((neighborNodeId) => {
        if (visited.has(neighborNodeId)) {
          return;
        }

        visited.add(neighborNodeId);
        revealed.push(neighborNodeId);
        queue.push({
          nodeId: neighborNodeId,
          depth: next.depth + 1,
        });
      });
    }

    return uniqueValues(revealed);
  }

  private requireBoard(boardId: string) {
    const board = this.rootStore.getTravelBoardById(boardId);

    if (!board) {
      throw new Error(`Travel board "${boardId}" was not found.`);
    }

    return board;
  }

  private requireActiveBoard(): TravelBoardData {
    if (!this.rootStore.travelBoard.activeBoardId) {
      throw new Error('No travel board is currently active.');
    }

    return this.requireBoard(this.rootStore.travelBoard.activeBoardId);
  }
}
