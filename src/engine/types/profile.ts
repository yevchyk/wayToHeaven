export const NARRATIVE_PROFILE_KEYS = [
  'pragmatism',
  'humanity',
  'submission',
  'domination',
  'altruism',
  'egoism',
  'restraint',
  'lust',
  'corruption',
  'paranoia',
  'superiority',
  'machiavellianism',
  'simplicity',
  'honor',
  'will',
  'innocence',
] as const;

export type NarrativeProfileKey = (typeof NARRATIVE_PROFILE_KEYS)[number];

export type NarrativeProfileSnapshot = Record<NarrativeProfileKey, number>;

export type NarrativeProfileUnlockSnapshot = Record<NarrativeProfileKey, boolean>;

export const DEFAULT_NARRATIVE_PROFILE: NarrativeProfileSnapshot = {
  pragmatism: 0,
  humanity: 0,
  submission: 0,
  domination: 0,
  altruism: 0,
  egoism: 0,
  restraint: 0,
  lust: 0,
  corruption: 0,
  paranoia: 0,
  superiority: 0,
  machiavellianism: 0,
  simplicity: 0,
  honor: 0,
  will: 0,
  innocence: 0,
};

export const DEFAULT_UNLOCKED_NARRATIVE_PROFILE: NarrativeProfileUnlockSnapshot = {
  pragmatism: false,
  humanity: false,
  submission: false,
  domination: false,
  altruism: false,
  egoism: false,
  restraint: false,
  lust: false,
  corruption: false,
  paranoia: false,
  superiority: false,
  machiavellianism: false,
  simplicity: false,
  honor: false,
  will: false,
  innocence: false,
};
