import { Box } from '@mui/material';

import type { DialogueVisualAsset } from '@ui/components/dialogue/dialoguePresentation';

const CITY_GATE_BACKDROP_ID = 'chapter-1/backgrounds/city-gate';

export function buildNarrativeBackdropBackground(backdrop: DialogueVisualAsset) {
  if (backdrop.url) {
    return `linear-gradient(180deg, rgba(7, 10, 15, 0.08) 0%, rgba(7, 10, 15, 0.18) 28%, rgba(7, 10, 15, 0.58) 72%, rgba(7, 10, 15, 0.88) 100%), url(${backdrop.url}) center 34%/cover no-repeat`;
  }

  if (backdrop.assetId === CITY_GATE_BACKDROP_ID) {
    return [
      'radial-gradient(circle at 50% 18%, rgba(244, 224, 176, 0.18) 0%, rgba(244, 224, 176, 0) 24%)',
      'radial-gradient(circle at 18% 49%, rgba(245, 164, 58, 0.24) 0%, rgba(245, 164, 58, 0) 16%)',
      'radial-gradient(circle at 82% 49%, rgba(245, 164, 58, 0.24) 0%, rgba(245, 164, 58, 0) 16%)',
      'linear-gradient(180deg, #7c8893 0%, #4c5661 24%, #1a2129 58%, #090b10 100%)',
    ].join(', ');
  }

  return [
    'radial-gradient(circle at 16% 18%, rgba(232, 189, 102, 0.18), transparent 24%)',
    'radial-gradient(circle at 78% 15%, rgba(111, 179, 210, 0.16), transparent 26%)',
    'linear-gradient(180deg, #2b3039 0%, #151922 52%, #05070c 100%)',
  ].join(', ');
}

export function renderNarrativeBackdropArchitectureLayer(backdrop: DialogueVisualAsset) {
  if (backdrop.url || backdrop.assetId !== CITY_GATE_BACKDROP_ID) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '28% 0 14%',
          background: 'linear-gradient(180deg, rgba(70, 76, 86, 0.94) 0%, rgba(21, 25, 31, 1) 100%)',
          clipPath:
            'polygon(0 100%, 0 42%, 11% 42%, 11% 31%, 15% 31%, 15% 42%, 28% 42%, 28% 26%, 33% 26%, 33% 42%, 42% 42%, 42% 0, 58% 0, 58% 42%, 67% 42%, 67% 26%, 72% 26%, 72% 42%, 85% 42%, 85% 31%, 89% 31%, 89% 42%, 100% 42%, 100% 100%)',
          boxShadow: '0 -36px 48px rgba(0, 0, 0, 0.16)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '0 38% 14%',
          background: 'linear-gradient(180deg, rgba(15, 18, 23, 0) 0%, rgba(10, 13, 18, 0.96) 35%, rgba(6, 8, 12, 1) 100%)',
          clipPath: 'polygon(10% 100%, 10% 28%, 23% 18%, 23% 0, 77% 0, 77% 18%, 90% 28%, 90% 100%)',
          boxShadow: '0 0 44px rgba(0, 0, 0, 0.3)',
        },
      }}
    />
  );
}
