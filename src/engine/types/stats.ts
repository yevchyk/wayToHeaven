export const GAME_STATS = [
  'pragmatism',
  'humanity',
  'submission',
  'domination',
  'altruism',
  'egoism',
  'restraint',
  'lust',
  'corruption',
] as const;

export type GameStatKey = (typeof GAME_STATS)[number];

export type GameStatSnapshot = Record<GameStatKey, number>;

export type GameStatUnlockSnapshot = Record<GameStatKey, boolean>;

export const DEFAULT_GAME_STATS: GameStatSnapshot = {
  pragmatism: 0,
  humanity: 0,
  submission: 0,
  domination: 0,
  altruism: 0,
  egoism: 0,
  restraint: 0,
  lust: 0,
  corruption: 0,
};

export const DEFAULT_UNLOCKED_STATS: GameStatUnlockSnapshot = {
  pragmatism: false,
  humanity: false,
  submission: false,
  domination: false,
  altruism: false,
  egoism: false,
  restraint: false,
  lust: false,
  corruption: false,
};
