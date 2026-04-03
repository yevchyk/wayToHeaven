import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { WorldSnapshot } from '@engine/types/save';
import type { WorldVisit } from '@engine/types/world';

export class WorldStore {
  readonly rootStore: GameRootStore;

  currentLocationId: string | null = null;
  currentNodeId: string | null = null;
  availableTransitionNodeIds: string[] = [];
  visitHistory: WorldVisit[] = [];
  triggeredInteractionNodeIds: string[] = [];

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get hasActiveLocation() {
    return this.currentLocationId !== null && this.currentNodeId !== null;
  }

  get canMove() {
    return this.availableTransitionNodeIds.length > 0;
  }

  get snapshot(): WorldSnapshot {
    return {
      currentLocationId: this.currentLocationId,
      currentNodeId: this.currentNodeId,
      availableTransitionNodeIds: [...this.availableTransitionNodeIds],
      visitHistory: this.visitHistory.map((visit) => ({ ...visit })),
      triggeredInteractionNodeIds: [...this.triggeredInteractionNodeIds],
    };
  }

  loadLocation(
    locationId: string,
    startNodeId: string | null = null,
    availableTransitionNodeIds: string[] = [],
  ) {
    this.currentLocationId = locationId;
    this.currentNodeId = startNodeId;
    this.availableTransitionNodeIds = [...availableTransitionNodeIds];
    this.visitHistory = startNodeId ? [{ locationId, nodeId: startNodeId }] : [];
    this.triggeredInteractionNodeIds = [];
  }

  setLocation(
    locationId: string,
    startNodeId: string | null = null,
    availableTransitionNodeIds: string[] = [],
  ) {
    this.loadLocation(locationId, startNodeId, availableTransitionNodeIds);
  }

  setCurrentNode(nodeId: string, nextTransitionNodeIds: string[] = []) {
    if (!this.currentLocationId) {
      throw new Error('Cannot set the current node without an active location.');
    }

    this.currentNodeId = nodeId;
    this.availableTransitionNodeIds = [...nextTransitionNodeIds];

    const latestVisit = this.visitHistory.at(-1);

    if (latestVisit?.nodeId !== nodeId) {
      this.visitHistory.push({ locationId: this.currentLocationId, nodeId });
    }
  }

  moveToNode(nodeId: string, nextTransitionNodeIds: string[] = []) {
    if (!this.currentLocationId) {
      throw new Error('Cannot move without an active location.');
    }

    if (!this.availableTransitionNodeIds.includes(nodeId)) {
      return false;
    }

    this.currentNodeId = nodeId;
    this.availableTransitionNodeIds = [...nextTransitionNodeIds];
    this.visitHistory.push({ locationId: this.currentLocationId, nodeId });

    return true;
  }

  setAvailableTransitions(nodeIds: string[]) {
    this.availableTransitionNodeIds = [...nodeIds];
  }

  markInteractionTriggered(nodeId: string) {
    if (!this.triggeredInteractionNodeIds.includes(nodeId)) {
      this.triggeredInteractionNodeIds.push(nodeId);
    }
  }

  hasTriggeredInteraction(nodeId: string) {
    return this.triggeredInteractionNodeIds.includes(nodeId);
  }

  restore(snapshot: WorldSnapshot) {
    this.currentLocationId = snapshot.currentLocationId;
    this.currentNodeId = snapshot.currentNodeId;
    this.availableTransitionNodeIds = [...snapshot.availableTransitionNodeIds];
    this.visitHistory = snapshot.visitHistory.map((visit) => ({ ...visit }));
    this.triggeredInteractionNodeIds = [...snapshot.triggeredInteractionNodeIds];
  }

  reset() {
    this.currentLocationId = null;
    this.currentNodeId = null;
    this.availableTransitionNodeIds = [];
    this.visitHistory = [];
    this.triggeredInteractionNodeIds = [];
  }
}
