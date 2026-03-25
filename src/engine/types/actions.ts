export const ACTION_TONES = [
  'neutral',
  'info',
  'recovery',
  'danger',
  'travel',
  'reward',
  'social',
  'cult',
] as const;

export type ActionTone = (typeof ACTION_TONES)[number];
