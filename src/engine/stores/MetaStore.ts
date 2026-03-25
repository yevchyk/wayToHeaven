import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { MetaKey, MetaSnapshot } from '@engine/types/meta';

export class MetaStore {
  readonly rootStore: GameRootStore;

  hunger = 0;
  morale = 0;
  reputation = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): MetaSnapshot {
    return {
      hunger: this.hunger,
      morale: this.morale,
      reputation: this.reputation,
    };
  }

  setMetaValue(key: MetaKey, value: number) {
    this[key] = value;
  }

  changeMeta(key: MetaKey, delta: number) {
    this[key] += delta;
  }

  applyPatch(patch: Partial<MetaSnapshot>) {
    if (patch.hunger !== undefined) {
      this.hunger = patch.hunger;
    }

    if (patch.morale !== undefined) {
      this.morale = patch.morale;
    }

    if (patch.reputation !== undefined) {
      this.reputation = patch.reputation;
    }
  }

  reset() {
    this.hunger = 0;
    this.morale = 0;
    this.reputation = 0;
  }
}
