export const shellTokens = {
  radius: {
    sm: '4px',
    md: '4px',
    lg: '6px',
    pill: '999px',
  },
  blur: {
    soft: 'blur(10px)',
    medium: 'blur(16px)',
    strong: 'blur(24px)',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.14)',
    accent: 'rgba(218, 231, 243, 0.22)',
    active: 'rgba(223, 236, 248, 0.32)',
  },
  text: {
    primary: '#f4f7fb',
    secondary: 'rgba(228, 236, 244, 0.7)',
    muted: 'rgba(228, 236, 244, 0.52)',
    accent: '#dbe8f5',
  },
  surface: {
    canvasTop: '#e5ebf2',
    canvasBottom: '#cfd6df',
    base: 'rgba(14, 18, 24, 0.78)',
    overlay: 'rgba(10, 14, 20, 0.56)',
    menu: 'rgba(11, 15, 21, 0.74)',
    panel: 'rgba(18, 23, 31, 0.58)',
    panelStrong: 'rgba(18, 23, 31, 0.7)',
    sunken: 'rgba(8, 11, 17, 0.42)',
    soft: 'rgba(255, 255, 255, 0.03)',
    accent: 'rgba(221, 232, 243, 0.08)',
    backdrop: 'rgba(210, 220, 232, 0.08)',
  },
  shadow: {
    panel: '0 18px 42px rgba(2, 6, 12, 0.18)',
    floating: '0 24px 70px rgba(2, 6, 12, 0.34)',
    inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
  },
  spacing: {
    shellX: { xs: 1, sm: 1.5, md: 2, xl: 2.5 },
    shellY: { xs: 1, sm: 1.25, md: 1.5, xl: 2 },
    panel: { xs: 1.25, sm: 1.5, md: 1.75 },
    inner: { xs: 1, md: 1.25 },
  },
} as const;

export type ShellTone = 'default' | 'overlay' | 'sunken' | 'accent';

export function getShellSurface(tone: ShellTone) {
  switch (tone) {
    case 'overlay':
      return shellTokens.surface.overlay;
    case 'sunken':
      return shellTokens.surface.sunken;
    case 'accent':
      return shellTokens.surface.accent;
    case 'default':
    default:
      return shellTokens.surface.panel;
  }
}
