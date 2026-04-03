import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  DEFAULT_NARRATIVE_PROFILE,
  DEFAULT_UNLOCKED_NARRATIVE_PROFILE,
  NARRATIVE_PROFILE_KEYS,
  type NarrativeProfileKey,
  type NarrativeProfileSnapshot,
  type NarrativeProfileUnlockSnapshot,
} from '@engine/types/profile';

function createProfileSnapshot<TValue>(
  defaults: Record<NarrativeProfileKey, TValue>,
  values: Map<NarrativeProfileKey, TValue>,
) {
  return NARRATIVE_PROFILE_KEYS.reduce(
    (snapshot, profileKey) => {
      snapshot[profileKey] = values.get(profileKey) ?? defaults[profileKey];

      return snapshot;
    },
    { ...defaults },
  );
}

export class NarrativeProfileStore {
  readonly rootStore: GameRootStore;

  readonly values = observable.map<NarrativeProfileKey, number>();
  readonly unlocked = observable.map<NarrativeProfileKey, boolean>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    NARRATIVE_PROFILE_KEYS.forEach((profileKey) => {
      this.values.set(profileKey, DEFAULT_NARRATIVE_PROFILE[profileKey]);
      this.unlocked.set(profileKey, DEFAULT_UNLOCKED_NARRATIVE_PROFILE[profileKey]);
    });

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): NarrativeProfileSnapshot {
    return createProfileSnapshot(DEFAULT_NARRATIVE_PROFILE, this.values);
  }

  get unlockedSnapshot(): NarrativeProfileUnlockSnapshot {
    return createProfileSnapshot(DEFAULT_UNLOCKED_NARRATIVE_PROFILE, this.unlocked);
  }

  get unlockedProfileIds() {
    return NARRATIVE_PROFILE_KEYS.filter((profileKey) => this.isUnlocked(profileKey));
  }

  getProfileValue(key: NarrativeProfileKey) {
    return this.values.get(key) ?? DEFAULT_NARRATIVE_PROFILE[key];
  }

  setProfileValue(key: NarrativeProfileKey, value: number) {
    this.unlocked.set(key, true);
    this.values.set(key, value);
  }

  changeProfileValue(key: NarrativeProfileKey, delta: number) {
    this.unlocked.set(key, true);
    this.values.set(key, this.getProfileValue(key) + delta);
  }

  isUnlocked(key: NarrativeProfileKey) {
    return this.unlocked.get(key) ?? false;
  }

  unlockProfile(key: NarrativeProfileKey) {
    this.unlocked.set(key, true);
  }

  applyPatch(patch: Partial<NarrativeProfileSnapshot>) {
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      this.setProfileValue(key as NarrativeProfileKey, value);
    });
  }

  restore(snapshot: NarrativeProfileSnapshot, unlockedSnapshot: NarrativeProfileUnlockSnapshot) {
    NARRATIVE_PROFILE_KEYS.forEach((profileKey) => {
      this.values.set(profileKey, snapshot[profileKey] ?? DEFAULT_NARRATIVE_PROFILE[profileKey]);
      this.unlocked.set(
        profileKey,
        unlockedSnapshot[profileKey] ?? DEFAULT_UNLOCKED_NARRATIVE_PROFILE[profileKey],
      );
    });
  }

  reset() {
    NARRATIVE_PROFILE_KEYS.forEach((profileKey) => {
      this.values.set(profileKey, DEFAULT_NARRATIVE_PROFILE[profileKey]);
      this.unlocked.set(profileKey, DEFAULT_UNLOCKED_NARRATIVE_PROFILE[profileKey]);
    });
  }

  getStat(key: NarrativeProfileKey) {
    return this.getProfileValue(key);
  }

  setStat(key: NarrativeProfileKey, value: number) {
    this.setProfileValue(key, value);
  }

  changeStat(key: NarrativeProfileKey, delta: number) {
    this.changeProfileValue(key, delta);
  }

  unlockStat(key: NarrativeProfileKey) {
    this.unlockProfile(key);
  }
}
