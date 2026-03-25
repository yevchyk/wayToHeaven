import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { FlagValue } from '@engine/types/flags';

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
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

  private clearPrimitiveFlag(flagId: string) {
    this.booleanFlags.delete(flagId);
    this.numericFlags.delete(flagId);
    this.stringFlags.delete(flagId);
  }

  setFlag(flagId: string, value: FlagValue) {
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

    return this.stringFlags.get(flagId);
  }

  setBooleanFlag(flagId: string, value: boolean) {
    this.booleanFlags.set(flagId, value);
  }

  getBooleanFlag(flagId: string, fallback = false) {
    return this.booleanFlags.get(flagId) ?? fallback;
  }

  setNumericFlag(flagId: string, value: number) {
    this.numericFlags.set(flagId, value);
  }

  changeNumericFlag(flagId: string, delta: number) {
    this.numericFlags.set(flagId, this.getNumericFlag(flagId) + delta);
  }

  getNumericFlag(flagId: string, fallback = 0) {
    return this.numericFlags.get(flagId) ?? fallback;
  }

  setStringFlag(flagId: string, value: string) {
    this.stringFlags.set(flagId, value);
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
}
