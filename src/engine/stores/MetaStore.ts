import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { MetaKey, MetaSnapshot } from '@engine/types/meta';

export class MetaStore {
  readonly rootStore: GameRootStore;

  hunger = 0;
  safety = 0;
  morale = 0;
  reputation = 0;
  badReputation = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): MetaSnapshot {
    return {
      hunger: this.hunger,
      safety: this.safety,
      morale: this.morale,
      reputation: this.reputation,
      badReputation: this.badReputation,
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

    if (patch.safety !== undefined) {
      this.safety = patch.safety;
    }

    if (patch.morale !== undefined) {
      this.morale = patch.morale;
    }

    if (patch.reputation !== undefined) {
      this.reputation = patch.reputation;
    }

    if (patch.badReputation !== undefined) {
      this.badReputation = patch.badReputation;
    }
  }

  restore(snapshot: MetaSnapshot) {
    this.hunger = snapshot.hunger ?? 0;
    this.safety = snapshot.safety ?? 0;
    this.morale = snapshot.morale ?? 0;
    this.reputation = snapshot.reputation ?? 0;
    this.badReputation = snapshot.badReputation ?? 0;
  }

  reset() {
    this.hunger = 0;
    this.safety = 0;
    this.morale = 0;
    this.reputation = 0;
    this.badReputation = 0;
  }
}
