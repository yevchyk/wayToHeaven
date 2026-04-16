export type CorruptionSkinId =
  | 'argent-wake'
  | 'gilded-oath'
  | 'violet-veil'
  | 'black-bloom';

export interface CorruptionSkin {
  id: CorruptionSkinId;
  label: string;
  stage: number;
  frame: {
    border: string;
    borderStrong: string;
    accent: string;
    accentSoft: string;
    glow: string;
  };
  surface: {
    panel: string;
    panelStrong: string;
    panelSoft: string;
    utility: string;
    status: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

const ARGENT_WAKE: CorruptionSkin = {
  id: 'argent-wake',
  label: 'Argent Wake',
  stage: 0,
  frame: {
    border: 'rgba(214, 226, 238, 0.2)',
    borderStrong: 'rgba(230, 239, 247, 0.34)',
    accent: '#dbe8f6',
    accentSoft: 'rgba(219, 232, 246, 0.18)',
    glow: 'rgba(219, 232, 246, 0.16)',
  },
  surface: {
    panel:
      'linear-gradient(180deg, rgba(12, 17, 24, 0.32) 0%, rgba(8, 12, 18, 0.54) 26%, rgba(6, 9, 14, 0.82) 100%)',
    panelStrong:
      'linear-gradient(180deg, rgba(13, 18, 25, 0.54) 0%, rgba(9, 13, 18, 0.72) 28%, rgba(6, 9, 14, 0.92) 100%)',
    panelSoft: 'rgba(237, 243, 248, 0.06)',
    utility: 'rgba(10, 15, 22, 0.46)',
    status: 'rgba(219, 232, 246, 0.08)',
  },
  text: {
    primary: '#f3f7fb',
    secondary: 'rgba(232, 239, 245, 0.74)',
    muted: 'rgba(232, 239, 245, 0.5)',
  },
};

const GILDED_OATH: CorruptionSkin = {
  id: 'gilded-oath',
  label: 'Gilded Oath',
  stage: 1,
  frame: {
    border: 'rgba(212, 181, 120, 0.22)',
    borderStrong: 'rgba(232, 205, 150, 0.38)',
    accent: '#f0d39c',
    accentSoft: 'rgba(240, 211, 156, 0.2)',
    glow: 'rgba(240, 211, 156, 0.16)',
  },
  surface: {
    panel:
      'linear-gradient(180deg, rgba(19, 15, 12, 0.3) 0%, rgba(15, 11, 8, 0.54) 26%, rgba(11, 8, 6, 0.84) 100%)',
    panelStrong:
      'linear-gradient(180deg, rgba(23, 17, 12, 0.54) 0%, rgba(16, 12, 8, 0.76) 28%, rgba(11, 8, 6, 0.94) 100%)',
    panelSoft: 'rgba(240, 211, 156, 0.07)',
    utility: 'rgba(20, 14, 9, 0.48)',
    status: 'rgba(240, 211, 156, 0.1)',
  },
  text: {
    primary: '#fbf3e4',
    secondary: 'rgba(247, 234, 208, 0.76)',
    muted: 'rgba(247, 234, 208, 0.52)',
  },
};

const VIOLET_VEIL: CorruptionSkin = {
  id: 'violet-veil',
  label: 'Violet Veil',
  stage: 2,
  frame: {
    border: 'rgba(155, 130, 190, 0.22)',
    borderStrong: 'rgba(190, 160, 230, 0.38)',
    accent: '#d8c3ff',
    accentSoft: 'rgba(216, 195, 255, 0.18)',
    glow: 'rgba(168, 127, 230, 0.18)',
  },
  surface: {
    panel:
      'linear-gradient(180deg, rgba(16, 11, 24, 0.34) 0%, rgba(12, 8, 19, 0.58) 26%, rgba(8, 6, 14, 0.84) 100%)',
    panelStrong:
      'linear-gradient(180deg, rgba(18, 11, 28, 0.58) 0%, rgba(12, 8, 21, 0.78) 28%, rgba(8, 6, 14, 0.94) 100%)',
    panelSoft: 'rgba(216, 195, 255, 0.07)',
    utility: 'rgba(15, 11, 23, 0.5)',
    status: 'rgba(216, 195, 255, 0.1)',
  },
  text: {
    primary: '#f5f1fb',
    secondary: 'rgba(233, 224, 245, 0.74)',
    muted: 'rgba(233, 224, 245, 0.5)',
  },
};

const BLACK_BLOOM: CorruptionSkin = {
  id: 'black-bloom',
  label: 'Black Bloom',
  stage: 3,
  frame: {
    border: 'rgba(170, 121, 168, 0.2)',
    borderStrong: 'rgba(212, 149, 199, 0.36)',
    accent: '#f0bfe5',
    accentSoft: 'rgba(240, 191, 229, 0.18)',
    glow: 'rgba(201, 109, 180, 0.2)',
  },
  surface: {
    panel:
      'linear-gradient(180deg, rgba(11, 8, 15, 0.44) 0%, rgba(8, 6, 11, 0.68) 24%, rgba(4, 3, 7, 0.94) 100%)',
    panelStrong:
      'linear-gradient(180deg, rgba(13, 8, 19, 0.64) 0%, rgba(8, 6, 12, 0.82) 26%, rgba(4, 3, 7, 0.98) 100%)',
    panelSoft: 'rgba(240, 191, 229, 0.08)',
    utility: 'rgba(10, 8, 15, 0.56)',
    status: 'rgba(240, 191, 229, 0.1)',
  },
  text: {
    primary: '#faf2f6',
    secondary: 'rgba(241, 226, 235, 0.76)',
    muted: 'rgba(241, 226, 235, 0.5)',
  },
};

const CORRUPTION_SKIN_SEQUENCE = [
  ARGENT_WAKE,
  GILDED_OATH,
  VIOLET_VEIL,
  BLACK_BLOOM,
] as const;

export function resolveCorruptionSkin(corruptionValue: number) {
  if (corruptionValue >= 7) {
    return BLACK_BLOOM;
  }

  if (corruptionValue >= 4) {
    return VIOLET_VEIL;
  }

  if (corruptionValue >= 2) {
    return GILDED_OATH;
  }

  return ARGENT_WAKE;
}

export function getCorruptionSkinById(id: CorruptionSkinId) {
  return CORRUPTION_SKIN_SEQUENCE.find((skin) => skin.id === id) ?? ARGENT_WAKE;
}

export function listCorruptionSkins() {
  return [...CORRUPTION_SKIN_SEQUENCE];
}
