import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  TravelBoardPhase,
  TravelBoardRuntime,
  TravelLogEntry,
  TravelLogEntryType,
  TravelNode,
} from '@engine/types/travel';

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

export class TravelBoardStore {
  readonly rootStore: GameRootStore;

  boardRuntime: TravelBoardRuntime | null = null;

  private logSequence = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get hasActiveBoard() {
    return this.boardRuntime !== null;
  }

  get activeBoardId() {
    return this.boardRuntime?.boardId ?? null;
  }

  get phase(): TravelBoardPhase {
    return this.boardRuntime?.phase ?? 'idle';
  }

  get remainingSteps() {
    return this.boardRuntime?.remainingSteps ?? 0;
  }

  get lastRoll() {
    return this.boardRuntime?.lastRoll ?? null;
  }

  get scoutCharges() {
    return this.boardRuntime?.scoutCharges ?? 0;
  }

  get scoutDepth() {
    return this.boardRuntime?.scoutDepth ?? 0;
  }

  get eventLog(): TravelLogEntry[] {
    return this.boardRuntime?.eventLog ?? [];
  }

  get currentBoard() {
    return this.activeBoardId ? this.rootStore.getTravelBoardById(this.activeBoardId) ?? null : null;
  }

  get currentNodeId() {
    return this.boardRuntime?.currentNodeId ?? null;
  }

  get currentNode(): TravelNode | null {
    if (!this.currentBoard || !this.currentNodeId) {
      return null;
    }

    return this.currentBoard.nodes[this.currentNodeId] ?? null;
  }

  get revealedNodeIds() {
    return this.boardRuntime?.revealedNodeIds ?? [];
  }

  get visitedNodeIds() {
    return this.boardRuntime?.visitedNodeIds ?? [];
  }

  get resolvedNodeIds() {
    return this.boardRuntime?.resolvedNodeIds ?? [];
  }

  get isAwaitingRoll() {
    return this.phase === 'awaitingRoll';
  }

  get isAwaitingDirection() {
    return this.phase === 'awaitingDirection';
  }

  get availableDirectionNodeIds() {
    const currentNode = this.currentNode;

    if (!currentNode) {
      return [];
    }

    return currentNode.nextNodeIds.filter((nodeId) => !this.visitedNodeIds.includes(nodeId));
  }

  initialize(runtime: TravelBoardRuntime) {
    this.boardRuntime = {
      ...runtime,
      revealedNodeIds: [...runtime.revealedNodeIds],
      visitedNodeIds: [...runtime.visitedNodeIds],
      resolvedNodeIds: [...runtime.resolvedNodeIds],
      eventLog: [...runtime.eventLog],
    };
    this.logSequence = runtime.eventLog.length;
  }

  setPhase(phase: TravelBoardPhase) {
    if (!this.boardRuntime) {
      return;
    }

    this.boardRuntime.phase = phase;
  }

  setRemainingSteps(steps: number) {
    if (!this.boardRuntime) {
      return;
    }

    this.boardRuntime.remainingSteps = Math.max(steps, 0);
  }

  consumeStep() {
    if (!this.boardRuntime) {
      return;
    }

    this.boardRuntime.remainingSteps = Math.max(0, this.boardRuntime.remainingSteps - 1);
  }

  setLastRoll(roll: number | null) {
    if (!this.boardRuntime) {
      return;
    }

    this.boardRuntime.lastRoll = roll;
  }

  moveToNode(nodeId: string) {
    if (!this.boardRuntime) {
      return;
    }

    this.boardRuntime.currentNodeId = nodeId;
    this.revealNodes([nodeId]);

    if (!this.boardRuntime.visitedNodeIds.includes(nodeId)) {
      this.boardRuntime.visitedNodeIds.push(nodeId);
    }
  }

  revealNodes(nodeIds: readonly string[]) {
    if (!this.boardRuntime || nodeIds.length === 0) {
      return;
    }

    this.boardRuntime.revealedNodeIds = uniqueValues([
      ...this.boardRuntime.revealedNodeIds,
      ...nodeIds,
    ]);
  }

  markResolved(nodeId: string) {
    if (!this.boardRuntime) {
      return;
    }

    if (!this.boardRuntime.resolvedNodeIds.includes(nodeId)) {
      this.boardRuntime.resolvedNodeIds.push(nodeId);
    }
  }

  consumeScoutCharge() {
    if (!this.boardRuntime || this.boardRuntime.scoutCharges <= 0) {
      return false;
    }

    this.boardRuntime.scoutCharges -= 1;

    return true;
  }

  pushLog(type: TravelLogEntryType, message: string, nodeId?: string) {
    if (!this.boardRuntime) {
      return null;
    }

    this.logSequence += 1;

    const entry: TravelLogEntry = {
      id: `travel-log-${this.logSequence}`,
      type,
      message,
      ...(nodeId ? { nodeId } : {}),
    };

    this.boardRuntime.eventLog = [...this.boardRuntime.eventLog, entry];

    return entry;
  }

  endBoard() {
    const shouldRestoreScreen = this.rootStore.ui.activeScreen === 'travelBoard';
    const returnScreenId = this.boardRuntime?.returnScreenId ?? null;

    this.boardRuntime = null;
    this.logSequence = 0;

    if (shouldRestoreScreen) {
      this.rootStore.ui.setScreen(returnScreenId ?? (this.rootStore.world.hasActiveLocation ? 'world' : 'home'));
    }
  }

  reset() {
    this.boardRuntime = null;
    this.logSequence = 0;
  }
}
