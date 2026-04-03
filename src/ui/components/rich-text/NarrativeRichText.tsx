import type { ElementType } from 'react';

import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { sanitizeNarrativeHtml } from '@engine/utils/narrativeHtml';

interface NarrativeRichTextProps {
  html: string;
  component?: ElementType;
  className?: string;
  sx?: SxProps<Theme>;
}

export function NarrativeRichText({
  html,
  component = 'div',
  className,
  sx,
}: NarrativeRichTextProps) {
  return (
    <Box
      className={className}
      component={component}
      dangerouslySetInnerHTML={{ __html: sanitizeNarrativeHtml(html) }}
      sx={[
        {
          '& p': {
            m: 0,
          },
          '& p + p': {
            mt: '0.8em',
          },
          '& ul, & ol': {
            m: 0,
            pl: '1.25em',
          },
          '& li + li': {
            mt: '0.35em',
          },
          '& code': {
            px: 0.45,
            py: 0.1,
            borderRadius: 0.75,
            backgroundColor: alpha('#ffffff', 0.08),
            fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
            fontSize: '0.92em',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
