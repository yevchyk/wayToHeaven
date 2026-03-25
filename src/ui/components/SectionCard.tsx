import type { PropsWithChildren, ReactNode } from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';

interface SectionCardProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}

export function SectionCard({ eyebrow, title, subtitle, action, children }: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        border: '1px solid rgba(255,255,255,0.08)',
        background:
          'linear-gradient(180deg, rgba(39, 34, 49, 0.92) 0%, rgba(24, 21, 31, 0.98) 100%)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          alignItems={{ md: 'center' }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box>
            {eyebrow ? (
              <Typography
                color="primary.main"
                sx={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
                variant="caption"
              >
                {eyebrow}
              </Typography>
            ) : null}
            <Typography component="h2" variant="h4">
              {title}
            </Typography>
            {subtitle ? (
              <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

