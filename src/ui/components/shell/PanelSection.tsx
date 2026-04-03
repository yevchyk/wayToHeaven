import type { PropsWithChildren, ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { getShellSurface, type ShellTone, shellTokens } from '@ui/components/shell/shellTokens';

interface PanelSectionProps extends PropsWithChildren {
  title?: string;
  eyebrow?: string;
  description?: string | null;
  action?: ReactNode;
  tone?: ShellTone;
}

export function PanelSection({
  title,
  eyebrow,
  description,
  action,
  tone = 'default',
  children,
}: PanelSectionProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.25, md: 1.5 },
        borderRadius: shellTokens.radius.md,
        border: `1px solid ${shellTokens.border.subtle}`,
        background: getShellSurface(tone),
        boxShadow: shellTokens.shadow.inset,
      }}
    >
      <Stack spacing={1.1}>
        {title || eyebrow || description || action ? (
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
                    color: shellTokens.text.muted,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {eyebrow}
                </Typography>
              ) : null}
              {title ? (
                <Typography
                  sx={{
                    color: shellTokens.text.primary,
                    fontFamily: '"Spectral", Georgia, serif',
                    fontSize: { xs: '1.02rem', md: '1.12rem' },
                    lineHeight: 1.08,
                  }}
                >
                  {title}
                </Typography>
              ) : null}
              {description ? (
                <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.3 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </Stack>
    </Box>
  );
}
