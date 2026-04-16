import type { PropsWithChildren, ReactNode } from 'react';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

type SystemActionTone = 'default' | 'accent' | 'quiet';

interface SystemActionProps extends PropsWithChildren {
  skin: CorruptionSkin;
  tone?: SystemActionTone;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  startAdornment?: ReactNode;
  sx?: SxProps<Theme>;
}

function resolveSystemBackground(
  skin: CorruptionSkin,
  tone: SystemActionTone,
  active: boolean,
) {
  if (tone === 'quiet') {
    return active ? alpha(skin.frame.accent, 0.1) : alpha('#000000', 0.14);
  }

  if (tone === 'accent') {
    return active
      ? `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.18)} 0%, ${alpha(
          skin.frame.accent,
          0.12,
        )} 100%)`
      : `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.12)} 0%, ${alpha(
          skin.frame.accent,
          0.07,
        )} 100%)`;
  }

  return active
    ? alpha(skin.frame.accent, 0.12)
    : alpha(skin.surface.utility, 0.94);
}

export function SystemAction({
  skin,
  tone = 'default',
  disabled = false,
  active = false,
  className,
  onClick,
  startAdornment,
  sx,
  children,
}: SystemActionProps) {
  return (
    <ButtonBase
      className={className}
      data-dialogue-ignore-advance="true"
      disabled={disabled}
      onClick={onClick}
      sx={[
        {
          minHeight: 30,
          px: 0.95,
          py: 0.55,
          borderRadius: 1.5,
          border: `1px solid ${active ? skin.frame.borderStrong : skin.frame.border}`,
          background: resolveSystemBackground(skin, tone, active),
          color: skin.text.secondary,
          '&:hover': {
            background: resolveSystemBackground(skin, tone, true),
            color: skin.text.primary,
          },
          '&:disabled': {
            opacity: 0.4,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack alignItems="center" direction="row" spacing={0.55}>
        {startAdornment ? <Box sx={{ display: 'grid', placeItems: 'center' }}>{startAdornment}</Box> : null}
        <Typography
          sx={{
            color: 'inherit',
            fontSize: '0.74rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {children}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
