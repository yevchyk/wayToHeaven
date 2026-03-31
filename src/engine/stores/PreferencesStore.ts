import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { loadJsonFromStorage, saveJsonToStorage } from '@engine/systems/storage/browserStorage';
import type { PlayerPreferencesSnapshot } from '@engine/types/playerShell';

const PREFERENCES_STORAGE_KEY = 'wey-to-heaven/preferences/v1';

const DEFAULT_PREFERENCES: PlayerPreferencesSnapshot = {
  musicVolume: 0.8,
  sfxVolume: 0.9,
  textSpeed: 56,
  autoDelayMs: 1200,
  skipUnread: false,
  fontScale: 1,
  hideUi: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export class PreferencesStore {
  readonly rootStore: GameRootStore;

  musicVolume = DEFAULT_PREFERENCES.musicVolume;
  sfxVolume = DEFAULT_PREFERENCES.sfxVolume;
  textSpeed = DEFAULT_PREFERENCES.textSpeed;
  autoDelayMs = DEFAULT_PREFERENCES.autoDelayMs;
  skipUnread = DEFAULT_PREFERENCES.skipUnread;
  fontScale = DEFAULT_PREFERENCES.fontScale;
  hideUi = DEFAULT_PREFERENCES.hideUi;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    const persistedPreferences = loadJsonFromStorage(
      PREFERENCES_STORAGE_KEY,
      DEFAULT_PREFERENCES,
    );

    this.musicVolume = clamp(persistedPreferences.musicVolume, 0, 1);
    this.sfxVolume = clamp(persistedPreferences.sfxVolume, 0, 1);
    this.textSpeed = clamp(Math.round(persistedPreferences.textSpeed), 10, 120);
    this.autoDelayMs = clamp(Math.round(persistedPreferences.autoDelayMs), 250, 4000);
    this.skipUnread = persistedPreferences.skipUnread;
    this.fontScale = clamp(persistedPreferences.fontScale, 0.85, 1.3);
    this.hideUi = persistedPreferences.hideUi;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): PlayerPreferencesSnapshot {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      textSpeed: this.textSpeed,
      autoDelayMs: this.autoDelayMs,
      skipUnread: this.skipUnread,
      fontScale: this.fontScale,
      hideUi: this.hideUi,
    };
  }

  setMusicVolume(value: number) {
    this.musicVolume = clamp(value, 0, 1);
    this.persist();
    this.rootStore.audio.applyPreferences(this.snapshot);
  }

  setSfxVolume(value: number) {
    this.sfxVolume = clamp(value, 0, 1);
    this.persist();
    this.rootStore.audio.applyPreferences(this.snapshot);
  }

  setTextSpeed(value: number) {
    this.textSpeed = clamp(Math.round(value), 10, 120);
    this.persist();
    this.rootStore.dialogue.handlePlaybackPreferenceChanged();
  }

  setAutoDelayMs(value: number) {
    this.autoDelayMs = clamp(Math.round(value), 250, 4000);
    this.persist();
    this.rootStore.dialogue.handlePlaybackPreferenceChanged();
  }

  setSkipUnread(value: boolean) {
    this.skipUnread = value;
    this.persist();
    this.rootStore.dialogue.handlePlaybackPreferenceChanged();
  }

  setFontScale(value: number) {
    this.fontScale = clamp(value, 0.85, 1.3);
    this.persist();
  }

  setHideUi(value: boolean) {
    this.hideUi = value;
    this.persist();
  }

  private persist() {
    saveJsonToStorage(PREFERENCES_STORAGE_KEY, this.snapshot);
  }
}
