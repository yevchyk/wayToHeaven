export type DialogueSkipMode = 'off' | 'skip';

export type BacklogEntryKind = 'line' | 'choice' | 'system';

export interface BacklogEntry {
  id: string;
  kind: BacklogEntryKind;
  flowId: string | null;
  nodeId: string | null;
  speakerId: string | null;
  speakerName: string | null;
  text: string;
}

export interface PlayerPreferencesSnapshot {
  musicVolume: number;
  sfxVolume: number;
  textSpeed: number;
  autoDelayMs: number;
  skipUnread: boolean;
  fontScale: number;
  hideUi: boolean;
}
