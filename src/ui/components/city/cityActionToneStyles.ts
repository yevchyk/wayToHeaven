import type { ActionTone } from '@engine/types/actions';

interface CityActionToneStyle {
  accent: string;
  muted: string;
  glow: string;
}

export const CITY_ACTION_TONE_STYLES: Record<ActionTone, CityActionToneStyle> = {
  neutral: {
    accent: 'rgba(148, 159, 176, 0.9)',
    muted: 'rgba(148, 159, 176, 0.18)',
    glow: 'rgba(148, 159, 176, 0.12)',
  },
  info: {
    accent: 'rgba(111, 153, 196, 0.92)',
    muted: 'rgba(111, 153, 196, 0.18)',
    glow: 'rgba(111, 153, 196, 0.14)',
  },
  recovery: {
    accent: 'rgba(102, 163, 129, 0.92)',
    muted: 'rgba(102, 163, 129, 0.18)',
    glow: 'rgba(102, 163, 129, 0.14)',
  },
  danger: {
    accent: 'rgba(174, 93, 84, 0.95)',
    muted: 'rgba(174, 93, 84, 0.18)',
    glow: 'rgba(174, 93, 84, 0.14)',
  },
  travel: {
    accent: 'rgba(201, 164, 92, 0.95)',
    muted: 'rgba(201, 164, 92, 0.18)',
    glow: 'rgba(201, 164, 92, 0.15)',
  },
  reward: {
    accent: 'rgba(214, 184, 101, 0.95)',
    muted: 'rgba(214, 184, 101, 0.18)',
    glow: 'rgba(214, 184, 101, 0.14)',
  },
  social: {
    accent: 'rgba(149, 119, 168, 0.92)',
    muted: 'rgba(149, 119, 168, 0.18)',
    glow: 'rgba(149, 119, 168, 0.14)',
  },
  cult: {
    accent: 'rgba(103, 79, 133, 0.94)',
    muted: 'rgba(103, 79, 133, 0.2)',
    glow: 'rgba(103, 79, 133, 0.16)',
  },
};

export function getCityActionToneStyle(tone: ActionTone = 'neutral') {
  return CITY_ACTION_TONE_STYLES[tone];
}
