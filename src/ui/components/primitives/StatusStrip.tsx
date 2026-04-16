import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';

export interface StatusStripItem {
  label: string;
  value?: string;
}

interface StatusStripProps {
  skin: CorruptionSkin;
  items: readonly StatusStripItem[];
}

export function StatusStrip({ skin, items }: StatusStripProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.65}>
      {items.map((item) => (
        <Stack
          key={`${item.label}-${item.value ?? ''}`}
          direction="row"
          spacing={0.45}
          sx={{
            px: 0.8,
            py: 0.38,
            borderRadius: '999px',
            border: `1px solid ${skin.frame.border}`,
            background: skin.surface.status,
          }}
        >
          <Typography
            sx={{
              color: alpha(skin.text.secondary, 0.9),
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {item.label}
          </Typography>
          {item.value ? (
            <Typography
              sx={{
                color: skin.text.primary,
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {item.value}
            </Typography>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}
