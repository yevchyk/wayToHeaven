import type { PropsWithChildren } from 'react';

import { Box, Paper } from '@mui/material';

import { shellTokens } from '@ui/components/shell/shellTokens';

type AppShellMode = 'framed' | 'immersive';

interface AppShellProps extends PropsWithChildren {
  mode?: AppShellMode;
}

const viewportShellSx = {
  width: '100%',
  height: '100dvh',
  minHeight: '100dvh',
  overflow: 'hidden',
} as const;

export function AppShell({ children, mode = 'framed' }: AppShellProps) {
  if (mode === 'immersive') {
    return (
      <Box
        sx={{
          ...viewportShellSx,
          background:
            'linear-gradient(180deg, rgba(228, 235, 244, 0.12) 0%, rgba(25, 32, 42, 0.08) 18%, rgba(5, 7, 10, 0.74) 100%)',
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...viewportShellSx,
        p: { xs: 0.75, md: 1 },
        background:
          'radial-gradient(circle at top, rgba(255,255,255,0.68) 0%, rgba(223, 230, 238, 0.78) 18%, rgba(190, 199, 211, 0.96) 100%)',
      }}
    >
      <Paper
        elevation={0}
        square
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: shellTokens.radius.lg,
          border: `1px solid ${shellTokens.border.strong}`,
          background:
            'linear-gradient(180deg, rgba(20, 26, 35, 0.72) 0%, rgba(11, 16, 22, 0.78) 100%)',
          backdropFilter: shellTokens.blur.medium,
          boxShadow: shellTokens.shadow.panel,
          overflow: 'hidden',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
