import { Box, Stack, Typography } from '@mui/material';

import type { LocationBackdropWorkbenchEntry } from '@content/locations';
import { buildNarrativeBackdropBackground, renderNarrativeBackdropArchitectureLayer } from '@ui/components/narrative/narrativeBackdrop';
import {
  getSuggestedContentImagePaths,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';

function buildBackdropVisual(entry: LocationBackdropWorkbenchEntry) {
  const url = resolveContentImageUrl(entry.backgroundId);

  return {
    assetId: entry.backgroundId,
    kind: 'background' as const,
    label: entry.title,
    url,
    isPlaceholder: !url,
  };
}

function getPreferredBackgroundPath(entry: LocationBackdropWorkbenchEntry) {
  const suggestedPaths = getSuggestedContentImagePaths(entry.backgroundId);

  return (
    suggestedPaths.find((path) => path.endsWith('.webp')) ??
    suggestedPaths[0] ??
    entry.backgroundId ??
    'missing-background-id'
  );
}

function CodeInline({ children }: { children: string }) {
  return (
    <Box
      component="code"
      sx={{
        px: 0.6,
        py: 0.18,
        borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
        fontSize: '0.92em',
      }}
    >
      {children}
    </Box>
  );
}

export function LocationBackdropWorkbenchCard({ entry }: { entry: LocationBackdropWorkbenchEntry }) {
  const backdrop = buildBackdropVisual(entry);
  const suggestedPath = getPreferredBackgroundPath(entry);

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: 260,
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
          background: buildNarrativeBackdropBackground(backdrop),
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {renderNarrativeBackdropArchitectureLayer(backdrop)}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(6, 8, 12, 0.08) 0%, rgba(6, 8, 12, 0.18) 28%, rgba(6, 8, 12, 0.62) 72%, rgba(6, 8, 12, 0.9) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, transparent 24.8%, rgba(255,255,255,0.08) 25%, transparent 25.2%, transparent 49.8%, rgba(201,164,92,0.18) 50%, transparent 50.2%, transparent 74.8%, rgba(255,255,255,0.08) 75%, transparent 75.2%),
              linear-gradient(to bottom, transparent 24.8%, rgba(255,255,255,0.06) 25%, transparent 25.2%, transparent 49.8%, rgba(255,255,255,0.08) 50%, transparent 50.2%, transparent 74.8%, rgba(255,255,255,0.06) 75%, transparent 75.2%)
            `,
            pointerEvents: 'none',
          }}
        />
        <Stack
          spacing={0.8}
          sx={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
          }}
        >
          <Typography variant="h5">{entry.title}</Typography>
          <Typography color="text.secondary" variant="body2">
            {entry.subtitle}
          </Typography>
          <Typography sx={{ maxWidth: 680 }} variant="body2">
            {entry.description}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={0.7}>
        <Typography variant="body2">
          image file: <CodeInline>{suggestedPath}</CodeInline>
        </Typography>
        <Typography variant="body2">
          content file: <CodeInline>{entry.contentFilePath}</CodeInline>
        </Typography>
        <Typography variant="body2">
          asset field: <CodeInline>{entry.assetFieldPath}</CodeInline>
        </Typography>
      </Stack>

      <Stack spacing={0.7}>
        {entry.improvementHints.map((hint) => (
          <Typography color="text.secondary" key={`${entry.id}-${hint}`} variant="body2">
            {hint}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}
