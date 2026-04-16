import type { PropsWithChildren, ReactNode } from 'react';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

type NarrativeActionEmphasis = 'primary' | 'secondary' | 'ghost';

interface NarrativeActionProps extends PropsWithChildren {
  skin: CorruptionSkin;
  emphasis?: NarrativeActionEmphasis;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  sx?: SxProps<Theme>;
}

function resolveBackground(
  skin: CorruptionSkin,
  emphasis: NarrativeActionEmphasis,
  active: boolean,
) {
  if (emphasis === 'ghost') {
    return active ? alpha(skin.frame.accent, 0.12) : alpha(skin.surface.panelSoft, 0.44);
  }

  if (emphasis === 'secondary') {
    return active
      ? `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.12)} 0%, ${alpha(
          skin.frame.accent,
          0.08,
        )} 100%)`
      : `linear-gradient(180deg, ${alpha('#000000', 0.12)} 0%, ${alpha('#000000', 0.22)} 100%)`;
  }

  return active
    ? `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.2)} 0%, ${alpha(
        skin.frame.accent,
        0.12,
      )} 100%)`
    : `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.14)} 0%, ${alpha(
        skin.frame.accent,
        0.08,
      )} 100%)`;
}

export function NarrativeAction({
  skin,
  emphasis = 'secondary',
  disabled = false,
  active = false,
  className,
  onClick,
  startAdornment,
  endAdornment,
  sx,
  children,
}: NarrativeActionProps) {
  return (
    <ButtonBase
      className={className}
      data-dialogue-ignore-advance="true"
      disabled={disabled}
      onClick={onClick}
      sx={[
        {
          minHeight: 34,
          px: 1.1,
          py: 0.65,
          borderRadius: '999px',
          border: `1px solid ${active ? skin.frame.borderStrong : skin.frame.border}`,
          background: resolveBackground(skin, emphasis, active),
          color: skin.text.primary,
          transition:
            'background-color 140ms ease, border-color 140ms ease, transform 140ms ease, opacity 140ms ease',
          '&:hover': {
            background: resolveBackground(skin, emphasis, true),
          },
          '&:disabled': {
            opacity: 0.42,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack alignItems="center" direction="row" spacing={0.7}>
        {startAdornment ? <Box sx={{ display: 'grid', placeItems: 'center' }}>{startAdornment}</Box> : null}
        <Typography
          sx={{
            color: 'inherit',
            fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
            fontSize: '0.78rem',
            fontWeight: emphasis === 'primary' ? 600 : 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {children}
        </Typography>
        {endAdornment ? <Box sx={{ display: 'grid', placeItems: 'center' }}>{endAdornment}</Box> : null}
      </Stack>
    </ButtonBase>
  );
}
