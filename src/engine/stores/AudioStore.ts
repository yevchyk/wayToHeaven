import { makeAutoObservable } from 'mobx';

import { resolveContentAudioUrl } from '@engine/systems/audio/audioAssetResolver';
import type { MusicAction } from '@engine/types/dialogue';
import type { PlayerPreferencesSnapshot } from '@engine/types/playerShell';
import type { GameRootStore } from '@engine/stores/GameRootStore';

export interface AudioElementLike {
  currentTime: number;
  loop: boolean;
  paused: boolean;
  src: string;
  volume: number;
  pause: () => void;
  play: () => Promise<unknown> | unknown;
}

export interface AudioStoreOptions {
  createAudioElement?: () => AudioElementLike | null;
  resolveAudioUrl?: (assetId: string | null, sourcePath?: string) => string | null;
}

type MusicPlaybackStatus = 'idle' | 'playing' | 'missing';
type SfxPlaybackStatus = 'idle' | 'played' | 'missing';

interface PlayMusicOptions {
  action?: 'play' | 'switch';
  fadeMs?: number;
  loop?: boolean;
}

interface PlaySfxOptions {
  delayMs?: number;
  volume?: number;
}

function clampVolume(volume: number) {
  return Math.max(0, Math.min(1, volume));
}

function isAudioConstructorAvailable() {
  return typeof Audio !== 'undefined';
}

export class AudioStore {
  readonly rootStore: GameRootStore;

  readonly createAudioElement: () => AudioElementLike | null;
  readonly resolveAudioUrl: (assetId: string | null, sourcePath?: string) => string | null;

  musicAssetId: string | null = null;
  musicStatus: MusicPlaybackStatus = 'idle';
  musicLoop = true;
  musicVolume = 1;
  sfxVolume = 1;
  musicUrl: string | null = null;

  lastSfxId: string | null = null;
  sfxStatus: SfxPlaybackStatus = 'idle';
  sfxPlayCount = 0;
  sfxUrl: string | null = null;

  private currentMusicElement: AudioElementLike | null = null;
  private fadeIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(rootStore: GameRootStore, options: AudioStoreOptions = {}) {
    this.rootStore = rootStore;
    this.createAudioElement =
      options.createAudioElement ??
      (() => {
        if (!isAudioConstructorAvailable()) {
          return null;
        }

        return new Audio();
      });
    this.resolveAudioUrl = options.resolveAudioUrl ?? resolveContentAudioUrl;

    makeAutoObservable(this, {
      rootStore: false,
      createAudioElement: false,
      resolveAudioUrl: false,
    }, { autoBind: true });
  }

  syncSceneFlowPresentation() {
    const musicId = this.rootStore.sceneFlow.currentMusicId;

    if (!musicId) {
      this.stopMusic();

      return;
    }

    if (musicId === this.musicAssetId && this.musicStatus === 'playing') {
      return;
    }

    this.playMusic(musicId, {
      action: this.musicAssetId ? 'switch' : 'play',
      loop: true,
    });
  }

  applyPreferences(preferences: Pick<PlayerPreferencesSnapshot, 'musicVolume' | 'sfxVolume'>) {
    this.musicVolume = clampVolume(preferences.musicVolume);
    this.sfxVolume = clampVolume(preferences.sfxVolume);

    if (this.currentMusicElement) {
      this.currentMusicElement.volume = this.musicVolume;
    }
  }

  applyMusicAction(music: MusicAction | undefined, fallbackMusicId?: string | null) {
    if (!music) {
      this.syncSceneFlowPresentation();

      return;
    }

    const action = music.action ?? music.mode ?? 'play';

    if (action === 'stop') {
      this.stopMusic(music.fadeMs);

      return;
    }

    const musicId = music.musicId ?? fallbackMusicId ?? null;

    if (!musicId) {
      return;
    }

    this.playMusic(musicId, {
      action: action === 'switch' ? 'switch' : 'play',
      loop: music.loop ?? true,
      ...(music.fadeMs !== undefined ? { fadeMs: music.fadeMs } : {}),
    });
  }

  playMusic(musicId: string, options: PlayMusicOptions = {}) {
    const asset = this.rootStore.getNarrativeAssetById(musicId);
    const resolvedUrl = this.resolveAudioUrl(musicId, asset?.sourcePath);
    const nextLoop = options.loop ?? true;

    this.musicAssetId = musicId;
    this.musicLoop = nextLoop;
    this.musicUrl = resolvedUrl;

    if (!resolvedUrl) {
      this.clearFade();
      this.stopCurrentMusicElement();
      this.musicStatus = 'missing';

      return false;
    }

    const startPlayback = () => {
      this.stopCurrentMusicElement();

      const element = this.createAudioElement();

      if (!element) {
        this.musicStatus = 'missing';

        return false;
      }

      element.src = resolvedUrl;
      element.loop = nextLoop;
      element.currentTime = 0;
      element.volume = this.musicVolume;
      this.currentMusicElement = element;
      this.musicStatus = 'playing';

      try {
        void element.play();
      } catch {
        this.musicStatus = 'missing';

        return false;
      }

      return true;
    };

    if (options.action === 'switch' && options.fadeMs && this.currentMusicElement) {
      this.fadeOutCurrentMusic(options.fadeMs, startPlayback);

      return true;
    }

    this.clearFade();

    return startPlayback();
  }

  stopMusic(fadeMs?: number) {
    this.musicAssetId = null;
    this.musicUrl = null;

    if (fadeMs && this.currentMusicElement) {
      this.fadeOutCurrentMusic(fadeMs, () => {
        this.stopCurrentMusicElement();
        this.musicStatus = 'idle';
      });

      return;
    }

    this.clearFade();
    this.stopCurrentMusicElement();
    this.musicStatus = 'idle';
  }

  playSfx(sfxId: string, options: PlaySfxOptions = {}) {
    const asset = this.rootStore.getNarrativeAssetById(sfxId);
    const resolvedUrl = this.resolveAudioUrl(sfxId, asset?.sourcePath);

    this.lastSfxId = sfxId;
    this.sfxUrl = resolvedUrl;
    this.sfxPlayCount += 1;

    if (!resolvedUrl) {
      this.sfxStatus = 'missing';

      return false;
    }

    const runPlayback = () => {
      const element = this.createAudioElement();

      if (!element) {
        this.sfxStatus = 'missing';

        return;
      }

      element.src = resolvedUrl;
      element.loop = false;
      element.currentTime = 0;
      element.volume = clampVolume((options.volume ?? 1) * this.sfxVolume);

      try {
        void element.play();
        this.sfxStatus = 'played';
      } catch {
        this.sfxStatus = 'missing';
      }
    };

    if (options.delayMs && options.delayMs > 0) {
      globalThis.setTimeout(runPlayback, options.delayMs);
    } else {
      runPlayback();
    }

    return true;
  }

  reset() {
    this.clearFade();
    this.stopCurrentMusicElement();

    this.musicAssetId = null;
    this.musicStatus = 'idle';
    this.musicLoop = true;
    this.musicVolume = 1;
    this.sfxVolume = 1;
    this.musicUrl = null;

    this.lastSfxId = null;
    this.sfxStatus = 'idle';
    this.sfxPlayCount = 0;
    this.sfxUrl = null;
  }

  private stopCurrentMusicElement() {
    if (!this.currentMusicElement) {
      return;
    }

    this.currentMusicElement.pause();
    this.currentMusicElement.currentTime = 0;
    this.currentMusicElement = null;
  }

  private clearFade() {
    if (!this.fadeIntervalId) {
      return;
    }

    clearInterval(this.fadeIntervalId);
    this.fadeIntervalId = null;
  }

  private fadeOutCurrentMusic(fadeMs: number, onComplete: () => boolean | void) {
    const musicElement = this.currentMusicElement;

    if (!musicElement || fadeMs <= 0) {
      onComplete();

      return;
    }

    this.clearFade();

    const startVolume = musicElement.volume;
    const steps = Math.max(1, Math.floor(fadeMs / 50));
    let stepIndex = 0;

    this.fadeIntervalId = setInterval(() => {
      stepIndex += 1;
      musicElement.volume = clampVolume(startVolume * (1 - stepIndex / steps));

      if (stepIndex < steps) {
        return;
      }

      this.clearFade();
      onComplete();
    }, Math.max(16, Math.floor(fadeMs / steps)));
  }
}
