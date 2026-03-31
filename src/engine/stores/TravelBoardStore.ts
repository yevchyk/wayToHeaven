import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { adaptSceneFlowToTravelBoardView } from '@engine/systems/scenes/sceneFlowViewAdapters';
import type {
  TravelBoardRuntime,
  TravelLogEntry,
  TravelNode,
} from '@engine/types/travel';

export class TravelBoardStore {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get hasActiveBoard() {
    return this.rootStore.sceneFlow.activeMode === 'route';
  }

  get activeBoardId() {
    return this.hasActiveBoard ? this.rootStore.sceneFlow.activeFlowId : null;
  }

  get boardRuntime(): TravelBoardRuntime | null {
    const session = this.rootStore.sceneFlow.activeSession;
    const routeRuntime = this.rootStore.sceneFlow.routeRuntime;

    if (!session || session.mode !== 'route' || !routeRuntime) {
      return null;
    }

    return {
      boardId: session.flowId,
      phase: routeRuntime.phase,
      currentNodeId: session.currentNodeId,
      revealedNodeIds: [...routeRuntime.revealedNodeIds],
      visitedNodeIds: [...routeRuntime.visitedNodeIds],
      resolvedNodeIds: [...routeRuntime.resolvedNodeIds],
      remainingSteps: routeRuntime.remainingSteps,
      lastRoll: routeRuntime.lastRoll,
      scoutCharges: routeRuntime.scoutCharges,
      scoutDepth: routeRuntime.scoutDepth,
      eventLog: [...routeRuntime.eventLog],
      returnScreenId: session.returnScreenId,
    };
  }

  get phase() {
    return this.rootStore.sceneFlow.routePhase;
  }

  get remainingSteps() {
    return this.rootStore.sceneFlow.remainingSteps;
  }

  get lastRoll() {
    return this.rootStore.sceneFlow.lastRoll;
  }

  get scoutCharges() {
    return this.rootStore.sceneFlow.scoutCharges;
  }

  get scoutDepth() {
    return this.rootStore.sceneFlow.scoutDepth;
  }

  get eventLog(): TravelLogEntry[] {
    return this.rootStore.sceneFlow.routeEventLog;
  }

  get currentBoard() {
    if (!this.activeBoardId) {
      return null;
    }

    if (this.rootStore.sceneFlow.activeSourceType === 'travelBoard') {
      return this.rootStore.getTravelBoardById(this.activeBoardId) ?? null;
    }

    if (this.rootStore.sceneFlow.activeSourceType !== 'sceneGeneration') {
      return null;
    }

    const currentFlow = this.rootStore.sceneFlow.currentFlow;

    return currentFlow ? adaptSceneFlowToTravelBoardView(currentFlow) : null;
  }

  get currentNodeId() {
    return this.hasActiveBoard ? this.rootStore.sceneFlow.currentNodeId : null;
  }

  get currentNode(): TravelNode | null {
    const board = this.currentBoard;
    const nodeId = this.currentNodeId;

    if (!board || !nodeId) {
      return null;
    }

    return board.nodes[nodeId] ?? null;
  }

  get revealedNodeIds() {
    return this.rootStore.sceneFlow.revealedNodeIds;
  }

  get visitedNodeIds() {
    return this.rootStore.sceneFlow.routeVisitedNodeIds;
  }

  get resolvedNodeIds() {
    return this.rootStore.sceneFlow.resolvedNodeIds;
  }

  get isAwaitingRoll() {
    return this.rootStore.sceneFlow.isAwaitingRoll;
  }

  get isAwaitingDirection() {
    return this.rootStore.sceneFlow.isAwaitingDirection;
  }

  get availableDirectionNodeIds() {
    return this.rootStore.sceneFlowController
      .getAvailableRouteNodes()
      .map((node) => node.id);
  }

  reset() {
    if (this.hasActiveBoard) {
      this.rootStore.sceneFlow.reset();
    }
  }
}
