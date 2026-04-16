import type { ReactNode } from 'react';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

type ChoiceCardTone = 'default' | 'danger' | 'social' | 'travel' | 'info' | 'neutral';

interface ChoiceCardProps {
  skin: CorruptionSkin;
  html: string;
  disabled?: boolean;
  tone?: ChoiceCardTone;
  className?: string;
  eyebrow?: string;
  endAdornment?: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

function resolveToneAccent(skin: CorruptionSkin, tone: ChoiceCardTone) {
  switch (tone) {
    case 'danger':
      return '#d9a7a7';
    case 'social':
      return '#d7c6a8';
    case 'travel':
      return '#a9c7da';
    case 'info':
      return '#c9d7e7';
    case 'neutral':
    case 'default':
    default:
      return skin.frame.accent;
  }
}

export function ChoiceCard({
  skin,
  html,
  disabled = false,
  tone = 'default',
  className,
  eyebrow,
  endAdornment,
  onClick,
  sx,
}: ChoiceCardProps) {
  const toneAccent = resolveToneAccent(skin, tone);

  return (
    <ButtonBase
      className={className}
      disabled={disabled}
      onClick={onClick}
      sx={[
        {
          width: '100%',
          textAlign: 'left',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(toneAccent, 0.34)}`,
          background:
            `linear-gradient(180deg, ${alpha(toneAccent, 0.08)} 0%, ${alpha(
              '#000000',
              0.12,
            )} 18%, ${alpha('#000000', 0.42)} 100%)`,
          boxShadow: `0 16px 34px rgba(0, 0, 0, 0.2), inset 0 1px 0 ${alpha(
            skin.frame.accent,
            0.06,
          )}`,
          transition:
            'transform 160ms ease, border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: alpha(toneAccent, 0.5),
            boxShadow: `0 20px 38px rgba(0, 0, 0, 0.24), 0 0 0 1px ${alpha(
              toneAccent,
              0.18,
            )}`,
          },
          '&:disabled': {
            opacity: 0.48,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack spacing={0.7} sx={{ width: '100%', px: 1.35, py: 1.15 }}>
        {eyebrow ? (
          <Typography
            sx={{
              color: alpha(toneAccent, 0.8),
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
          <NarrativeRichText
            component="div"
            html={html}
            sx={{
              color: skin.text.primary,
              fontSize: '0.98rem',
              lineHeight: 1.56,
              textAlign: 'left',
              width: '100%',
            }}
          />
          {endAdornment ? <Box sx={{ color: alpha(toneAccent, 0.86) }}>{endAdornment}</Box> : null}
        </Stack>
      </Stack>
    </ButtonBase>
  );
}
