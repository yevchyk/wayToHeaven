import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  DEFAULT_GAME_STATS,
  DEFAULT_UNLOCKED_STATS,
  GAME_STATS,
  type GameStatKey,
  type GameStatSnapshot,
  type GameStatUnlockSnapshot,
} from '@engine/types/stats';

function createStatSnapshot<TValue>(defaults: Record<GameStatKey, TValue>, values: Map<GameStatKey, TValue>) {
  return GAME_STATS.reduce(
    (snapshot, statKey) => {
      snapshot[statKey] = values.get(statKey) ?? defaults[statKey];

      return snapshot;
    },
    { ...defaults },
  );
}

export class StatsStore {
  readonly rootStore: GameRootStore;

  readonly values = observable.map<GameStatKey, number>();
  readonly unlocked = observable.map<GameStatKey, boolean>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    GAME_STATS.forEach((statKey) => {
      this.values.set(statKey, DEFAULT_GAME_STATS[statKey]);
      this.unlocked.set(statKey, DEFAULT_UNLOCKED_STATS[statKey]);
    });

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): GameStatSnapshot {
    return createStatSnapshot(DEFAULT_GAME_STATS, this.values);
  }

  get unlockedSnapshot(): GameStatUnlockSnapshot {
    return createStatSnapshot(DEFAULT_UNLOCKED_STATS, this.unlocked);
  }

  get unlockedStatIds() {
    return GAME_STATS.filter((statKey) => this.isUnlocked(statKey));
  }

  getStat(key: GameStatKey) {
    return this.values.get(key) ?? DEFAULT_GAME_STATS[key];
  }

  setStat(key: GameStatKey, value: number) {
    this.unlocked.set(key, true);
    this.values.set(key, value);
  }

  changeStat(key: GameStatKey, delta: number) {
    this.unlocked.set(key, true);
    this.values.set(key, this.getStat(key) + delta);
  }

  isUnlocked(key: GameStatKey) {
    return this.unlocked.get(key) ?? false;
  }

  unlockStat(key: GameStatKey) {
    this.unlocked.set(key, true);
  }

  applyPatch(patch: Partial<GameStatSnapshot>) {
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      this.setStat(key as GameStatKey, value);
    });
  }

  reset() {
    GAME_STATS.forEach((statKey) => {
      this.values.set(statKey, DEFAULT_GAME_STATS[statKey]);
      this.unlocked.set(statKey, DEFAULT_UNLOCKED_STATS[statKey]);
    });
  }
}
