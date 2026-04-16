import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { FlagsSnapshot } from '@engine/types/save';
import type { FlagValue } from '@engine/types/flags';

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function getLegacyRelationshipId(flagId: string) {
  if (!flagId.startsWith('relationship.')) {
    return null;
  }

  return flagId.replace(/^relationship\./, '') || null;
}

export class FlagsStore {
  readonly rootStore: GameRootStore;

  booleanFlags = observable.map<string, boolean>();
  numericFlags = observable.map<string, number>();
  stringFlags = observable.map<string, string>();
  setFlags = observable.map<string, string[]>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get totalFlags() {
    return (
      this.booleanFlags.size +
      this.numericFlags.size +
      this.stringFlags.size +
      this.setFlags.size
    );
  }

  get snapshot(): FlagsSnapshot {
    return {
      booleanFlags: Object.fromEntries(this.booleanFlags.entries()),
      numericFlags: Object.fromEntries(this.numericFlags.entries()),
      stringFlags: Object.fromEntries(this.stringFlags.entries()),
      setFlags: Object.fromEntries(
        Array.from(this.setFlags.entries()).map(([flagId, values]) => [flagId, [...values]]),
      ),
    };
  }

  private clearPrimitiveFlag(flagId: string) {
    this.booleanFlags.delete(flagId);
    this.numericFlags.delete(flagId);
    this.stringFlags.delete(flagId);
  }

  setFlag(flagId: string, value: FlagValue) {
    const legacyRelationshipId = getLegacyRelationshipId(flagId);

    if (legacyRelationshipId && typeof value === 'number') {
      this.clearPrimitiveFlag(flagId);
      this.rootStore.relationships.setRelationshipValue(legacyRelationshipId, 'affinity', value);

      return;
    }

    this.clearPrimitiveFlag(flagId);

    if (typeof value === 'boolean') {
      this.booleanFlags.set(flagId, value);
      return;
    }

    if (typeof value === 'number') {
      this.numericFlags.set(flagId, value);
      return;
    }

    this.stringFlags.set(flagId, value);
  }

  getFlag(flagId: string) {
    const booleanValue = this.booleanFlags.get(flagId);

    if (booleanValue !== undefined) {
      return booleanValue;
    }

    const numericValue = this.numericFlags.get(flagId);

    if (numericValue !== undefined) {
      return numericValue;
    }

    const stringValue = this.stringFlags.get(flagId);

    if (stringValue !== undefined) {
      return stringValue;
    }

    const legacyRelationshipId = getLegacyRelationshipId(flagId);

    return legacyRelationshipId
      ? this.rootStore.relationships.getRelationshipValue(legacyRelationshipId, 'affinity')
      : undefined;
  }

  setBooleanFlag(flagId: string, value: boolean) {
    this.booleanFlags.set(flagId, value);
  }

  getBooleanFlag(flagId: string, fallback = false) {
    return this.booleanFlags.get(flagId) ?? fallback;
  }

  setNumericFlag(flagId: string, value: number) {
    const legacyRelationshipId = getLegacyRelationshipId(flagId);

    if (legacyRelationshipId) {
      this.numericFlags.delete(flagId);
      this.rootStore.relationships.setRelationshipValue(legacyRelationshipId, 'affinity', value);

      return;
    }

    this.numericFlags.set(flagId, value);

    if (flagId === 'story.day' && !this.rootStore.time.isStoryFlagSyncSuppressed) {
      this.rootStore.time.handleStoryDayFlagChanged(value);
    }
  }

  changeNumericFlag(flagId: string, delta: number) {
    const legacyRelationshipId = getLegacyRelationshipId(flagId);

    if (legacyRelationshipId) {
      this.rootStore.relationships.changeRelationshipValue(legacyRelationshipId, 'affinity', delta);

      return;
    }

    this.numericFlags.set(flagId, this.getNumericFlag(flagId) + delta);
  }

  getNumericFlag(flagId: string, fallback = 0) {
    const legacyRelationshipId = getLegacyRelationshipId(flagId);

    if (legacyRelationshipId) {
      return this.rootStore.relationships.getRelationshipValue(legacyRelationshipId, 'affinity');
    }

    return this.numericFlags.get(flagId) ?? fallback;
  }

  setStringFlag(flagId: string, value: string) {
    this.stringFlags.set(flagId, value);

    if (flagId === 'story.timeSegment' && !this.rootStore.time.isStoryFlagSyncSuppressed) {
      this.rootStore.time.handleStorySegmentFlagChanged(value);
    }
  }

  getStringFlag(flagId: string, fallback = '') {
    return this.stringFlags.get(flagId) ?? fallback;
  }

  addToSetFlag(flagId: string, value: string) {
    const nextValues = uniqueValues([...this.getSetFlag(flagId), value]);

    this.setFlags.set(flagId, nextValues);
  }

  removeFromSetFlag(flagId: string, value: string) {
    const nextValues = this.getSetFlag(flagId).filter((entry) => entry !== value);

    if (nextValues.length === 0) {
      this.setFlags.delete(flagId);
      return;
    }

    this.setFlags.set(flagId, nextValues);
  }

  hasInSetFlag(flagId: string, value: string) {
    return this.getSetFlag(flagId).includes(value);
  }

  getSetFlag(flagId: string) {
    return this.setFlags.get(flagId) ?? [];
  }

  clearAll() {
    this.booleanFlags.clear();
    this.numericFlags.clear();
    this.stringFlags.clear();
    this.setFlags.clear();
  }

  restore(snapshot: FlagsSnapshot) {
    this.clearAll();

    Object.entries(snapshot.booleanFlags).forEach(([flagId, value]) => {
      this.booleanFlags.set(flagId, value);
    });
    Object.entries(snapshot.numericFlags).forEach(([flagId, value]) => {
      this.setNumericFlag(flagId, value);
    });
    Object.entries(snapshot.stringFlags).forEach(([flagId, value]) => {
      this.stringFlags.set(flagId, value);
    });
    Object.entries(snapshot.setFlags).forEach(([flagId, values]) => {
      this.setFlags.set(flagId, uniqueValues([...values]));
    });
  }
}
