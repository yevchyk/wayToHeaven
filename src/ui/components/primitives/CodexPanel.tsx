import type { PropsWithChildren, ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { ScreenFrame } from '@ui/components/primitives/ScreenFrame';
import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

interface CodexPanelProps extends PropsWithChildren {
  skin: CorruptionSkin;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  sx?: SxProps<Theme> | undefined;
}

export function CodexPanel({
  skin,
  title,
  eyebrow,
  action,
  sx,
  children,
}: CodexPanelProps) {
  return (
    <ScreenFrame mode="codex" skin={skin} sx={sx}>
      <Stack spacing={1.1} sx={{ position: 'relative', zIndex: 1, p: { xs: 1.2, md: 1.4 } }}>
        {title || eyebrow || action ? (
          <Stack
            alignItems={{ md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              {eyebrow ? (
                <Typography
                  sx={{
                    color: alpha(skin.frame.accent, 0.76),
                    fontSize: '0.72rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {eyebrow}
                </Typography>
              ) : null}
              {title ? (
                <Typography
                  sx={{
                    color: skin.text.primary,
                    fontFamily: '"Spectral", Georgia, serif',
                    fontSize: { xs: '1.08rem', md: '1.24rem' },
                  }}
                >
                  {title}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </Stack>
    </ScreenFrame>
  );
}
