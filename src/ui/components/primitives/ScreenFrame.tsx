import type { MouseEventHandler, PropsWithChildren } from 'react';

import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

export type ScreenFrameMode = 'cinematic' | 'exploration' | 'tactical' | 'codex';

interface ScreenFrameProps extends PropsWithChildren {
  mode: ScreenFrameMode;
  skin: CorruptionSkin;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  sx?: SxProps<Theme> | undefined;
}

function getModeOverlay(mode: ScreenFrameMode, skin: CorruptionSkin) {
  switch (mode) {
    case 'codex':
      return `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.05)} 0%, rgba(0, 0, 0, 0) 24%)`;
    case 'tactical':
      return `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.08)} 0%, rgba(0, 0, 0, 0) 18%)`;
    case 'exploration':
      return `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.06)} 0%, rgba(0, 0, 0, 0) 22%)`;
    case 'cinematic':
    default:
      return `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.08)} 0%, rgba(0, 0, 0, 0) 18%)`;
  }
}

export function ScreenFrame({ mode, skin, className, onClick, sx, children }: ScreenFrameProps) {
  const sxLayers = sx === undefined ? [] : Array.isArray(sx) ? sx : [sx];

  return (
    <Box
      className={className}
      onClick={onClick}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          border: `1px solid ${skin.frame.border}`,
          background: skin.surface.panel,
          boxShadow: `0 22px 56px rgba(0, 0, 0, 0.28), inset 0 1px 0 ${alpha(
            skin.frame.accent,
            0.08,
          )}, 0 0 0 1px ${alpha(skin.frame.glow, 0.2)}`,
          backdropFilter: 'blur(18px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: getModeOverlay(mode, skin),
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 1,
            borderRadius: 'inherit',
            border: `1px solid ${alpha(skin.frame.borderStrong, 0.36)}`,
            pointerEvents: 'none',
          },
        },
        ...sxLayers,
      ]}
    >
      {children}
    </Box>
  );
}
