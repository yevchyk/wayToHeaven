import type { PropsWithChildren } from 'react';

import { Box, Container, Paper } from '@mui/material';

type AppShellMode = 'framed' | 'immersive';

interface AppShellProps extends PropsWithChildren {
  mode?: AppShellMode;
}

export function AppShell({ children, mode = 'framed' }: AppShellProps) {
  if (mode === 'immersive') {
    return (
      <Box
        sx={{
          minHeight: '100svh',
          background: '#040508',
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        py: { xs: 4, md: 6 },
        background:
          'radial-gradient(circle at top, rgba(201, 164, 92, 0.16), transparent 36%), linear-gradient(180deg, #16111c 0%, #0f0d13 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            minHeight: '70vh',
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 5 },
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(27, 24, 34, 0.86)',
            backdropFilter: 'blur(14px)',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
