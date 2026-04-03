import type { PropsWithChildren, ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import { shellTokens } from '@ui/components/shell/shellTokens';

interface SectionCardProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}

export function SectionCard({ eyebrow, title, subtitle, action, children }: SectionCardProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.25, md: 1.5 },
        borderRadius: shellTokens.radius.md,
        border: `1px solid ${shellTokens.border.subtle}`,
        background:
          'linear-gradient(180deg, rgba(17, 23, 31, 0.64) 0%, rgba(12, 17, 24, 0.78) 100%)',
        boxShadow: shellTokens.shadow.inset,
      }}
    >
      <Stack spacing={1.4}>
        <Stack
          alignItems={{ md: 'center' }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            {eyebrow ? (
              <Typography
                sx={{
                  color: shellTokens.text.muted,
                  fontSize: '0.72rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
                variant="caption"
              >
                {eyebrow}
              </Typography>
            ) : null}
            <Typography component="h2" sx={{ fontSize: { xs: '1.16rem', md: '1.3rem' } }} variant="h4">
              {title}
            </Typography>
            {subtitle ? (
              <NarrativeRichText
                component="div"
                html={subtitle}
                sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.35 }}
              />
            ) : null}
          </Box>
          {action}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}
