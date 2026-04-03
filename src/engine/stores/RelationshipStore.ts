import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  DEFAULT_RELATIONSHIP_STATE,
  RELATIONSHIP_AXES,
  type RelationshipAxis,
  type RelationshipId,
  type RelationshipSnapshot,
  type RelationshipState,
} from '@engine/types/relationships';

function cloneRelationshipState(partial?: Partial<RelationshipState>): RelationshipState {
  return {
    ...DEFAULT_RELATIONSHIP_STATE,
    ...partial,
  };
}

function sanitizeRelationshipState(state: Partial<RelationshipState>) {
  return RELATIONSHIP_AXES.reduce(
    (snapshot, axis) => {
      snapshot[axis] = typeof state[axis] === 'number' ? state[axis] : DEFAULT_RELATIONSHIP_STATE[axis];

      return snapshot;
    },
    { ...DEFAULT_RELATIONSHIP_STATE },
  );
}

export class RelationshipStore {
  readonly rootStore: GameRootStore;

  readonly values = observable.map<RelationshipId, RelationshipState>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): RelationshipSnapshot {
    return Object.fromEntries(
      Array.from(this.values.entries()).map(([relationshipId, state]) => [
        relationshipId,
        cloneRelationshipState(state),
      ]),
    );
  }

  getRelationshipState(relationshipId: RelationshipId) {
    return cloneRelationshipState(this.values.get(relationshipId));
  }

  getRelationshipValue(relationshipId: RelationshipId, axis: RelationshipAxis = 'affinity') {
    return this.values.get(relationshipId)?.[axis] ?? DEFAULT_RELATIONSHIP_STATE[axis];
  }

  setRelationshipValue(
    relationshipId: RelationshipId,
    axis: RelationshipAxis = 'affinity',
    value: number,
  ) {
    const nextState = this.getRelationshipState(relationshipId);

    nextState[axis] = value;
    this.values.set(relationshipId, nextState);
  }

  changeRelationshipValue(
    relationshipId: RelationshipId,
    axis: RelationshipAxis = 'affinity',
    delta: number,
  ) {
    this.setRelationshipValue(
      relationshipId,
      axis,
      this.getRelationshipValue(relationshipId, axis) + delta,
    );
  }

  clearAll() {
    this.values.clear();
  }

  restore(snapshot: RelationshipSnapshot = {}, legacyNumericFlags: Record<string, number> = {}) {
    this.clearAll();

    Object.entries(snapshot).forEach(([relationshipId, state]) => {
      this.values.set(relationshipId, sanitizeRelationshipState(state));
    });

    Object.entries(legacyNumericFlags).forEach(([flagId, value]) => {
      if (!flagId.startsWith('relationship.')) {
        return;
      }

      const relationshipId = flagId.replace(/^relationship\./, '');

      if (!relationshipId || this.values.has(relationshipId)) {
        return;
      }

      this.values.set(relationshipId, {
        ...DEFAULT_RELATIONSHIP_STATE,
        affinity: value,
      });
    });
  }

  reset() {
    this.clearAll();
  }
}
