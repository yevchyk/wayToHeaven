import { observer } from 'mobx-react-lite';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { CharacterPreviewLayer, CharacterPreviewModel } from '@engine/types/appearance';
import { buildCharacterPreviewLayers } from '@engine/utils/buildCharacterPreviewLayers';
import { shellTokens } from '@ui/components/shell/shellTokens';

function hashString(value: string) {
  return value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function escapeSvgText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildSvgMarkup(layer: CharacterPreviewLayer) {
  const seed = hashString(`${layer.id}-${layer.assetId}`);
  const hue = seed % 360;
  const accentHue = (hue + 38) % 360;
  const fill = `hsl(${hue} 58% 44%)`;
  const accent = `hsl(${accentHue} 70% 68%)`;
  const label = escapeSvgText(layer.label);

  switch (layer.id) {
    case 'background':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <defs>
            <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="${accent}" stop-opacity="0.42" />
              <stop offset="100%" stop-color="${fill}" stop-opacity="0.16" />
            </linearGradient>
          </defs>
          <rect width="320" height="480" rx="30" fill="url(#bg)" />
          <circle cx="250" cy="90" r="58" fill="${accent}" fill-opacity="0.22" />
          <path d="M0 390 C80 330 160 360 320 290 L320 480 L0 480 Z" fill="${fill}" fill-opacity="0.22" />
          <text x="20" y="446" fill="rgba(255,255,255,0.62)" font-size="14" font-family="Georgia, serif">${label}</text>
        </svg>
      `;
    case 'body':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <ellipse cx="160" cy="102" rx="56" ry="62" fill="${accent}" fill-opacity="0.24" />
          <path d="M103 145 C118 114 203 114 218 145 L238 398 C214 425 106 425 82 398 Z" fill="${fill}" fill-opacity="0.9" />
          <path d="M136 164 Q160 150 184 164" stroke="rgba(255,255,255,0.22)" stroke-width="5" fill="none" />
        </svg>
      `;
    case 'costume':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <path d="M108 176 C126 160 194 160 212 176 L236 394 C214 414 106 414 84 394 Z" fill="${fill}" fill-opacity="0.86" />
          <path d="M126 186 L160 214 L194 186" stroke="${accent}" stroke-width="7" fill="none" stroke-linecap="round" />
          <path d="M122 242 H198" stroke="rgba(255,255,255,0.25)" stroke-width="4" />
        </svg>
      `;
    case 'hair':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <path d="M106 98 C106 54 214 52 214 116 L204 224 C188 246 132 246 116 224 Z" fill="${fill}" fill-opacity="0.88" />
          <path d="M126 126 C154 104 176 102 196 114" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round" />
        </svg>
      `;
    case 'headwear':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <path d="M98 86 C118 54 202 54 222 86 L212 152 C198 162 122 162 108 152 Z" fill="${fill}" fill-opacity="0.94" />
          <rect x="116" y="124" width="88" height="20" rx="8" fill="${accent}" fill-opacity="0.7" />
        </svg>
      `;
    case 'weapon':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <path d="M248 94 L274 340" stroke="${fill}" stroke-width="11" stroke-linecap="round" />
          <path d="M242 108 L286 80 L274 136 Z" fill="${accent}" fill-opacity="0.86" />
          <path d="M234 324 L286 324" stroke="${accent}" stroke-width="6" stroke-linecap="round" />
        </svg>
      `;
    case 'aura':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">
          <defs>
            <radialGradient id="aura" cx="50%" cy="38%" r="46%">
              <stop offset="0%" stop-color="${accent}" stop-opacity="0.34" />
              <stop offset="100%" stop-color="${fill}" stop-opacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="160" cy="228" rx="132" ry="176" fill="url(#aura)" />
        </svg>
      `;
  }
}

function toLayerDataUri(layer: CharacterPreviewLayer) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildSvgMarkup(layer))}`;
}

interface CharacterPreviewProps {
  character: CharacterPreviewModel | null;
  height?: number | string;
}

export const CharacterPreview = observer(function CharacterPreview({
  character,
  height = 460,
}: CharacterPreviewProps) {
  const layers = character ? buildCharacterPreviewLayers(character) : [];
  const equippedItems = character
    ? Object.values(character.equippedItems).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];

  if (!character) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{
          minHeight: height,
          borderRadius: shellTokens.radius.md,
          border: `1px solid ${shellTokens.border.subtle}`,
          background: 'linear-gradient(180deg, rgba(19, 25, 35, 0.54) 0%, rgba(11, 15, 22, 0.72) 100%)',
        }}
      >
        <Typography variant="h6">No Character Selected</Typography>
        <Typography color="text.secondary" variant="body2">
          Load a party member to build the layered preview.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box
      data-testid="character-preview"
      sx={{
        position: 'relative',
        height,
        width: '100%',
        overflow: 'hidden',
        borderRadius: shellTokens.radius.md,
        border: `1px solid ${shellTokens.border.strong}`,
        background:
          'linear-gradient(180deg, rgba(26, 33, 43, 0.92) 0%, rgba(16, 21, 28, 0.96) 44%, rgba(9, 13, 18, 0.98) 100%)',
        boxShadow: shellTokens.shadow.inset,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 20%, rgba(236, 242, 248, 0.18) 0%, rgba(236, 242, 248, 0) 34%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 12,
          borderRadius: shellTokens.radius.md,
          border: `1px solid ${alpha('#eef5fb', 0.08)}`,
          background:
            'linear-gradient(180deg, rgba(12, 16, 22, 0.18) 0%, rgba(12, 16, 22, 0) 24%, rgba(12, 16, 22, 0.22) 100%)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1}
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 3,
        }}
      >
        <Stack spacing={0.25}>
          <Typography
            sx={{
              color: alpha('#eef5fb', 0.54),
              fontSize: '0.66rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Portrait Composite
          </Typography>
          <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.9rem' }}>
            Runtime shell preview
          </Typography>
        </Stack>
        <Chip label={`${layers.length} layers`} size="small" variant="outlined" />
      </Stack>

      {layers.map((layer) => (
        <Box
          key={`${character.unitId}-${layer.id}-${layer.assetId}`}
          alt={`${character.name} ${layer.id}`}
          component="img"
          data-testid={`character-preview-layer-${layer.id}`}
          src={toLayerDataUri(layer)}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: layer.id === 'aura' ? 0.9 : 1,
            pointerEvents: 'none',
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          zIndex: 2,
          px: 1.1,
          py: 0.95,
          background: `linear-gradient(180deg, ${alpha('#070a0f', 0)} 0%, ${alpha('#070a0f', 0.82)} 34%, ${alpha('#070a0f', 0.94)} 100%)`,
        }}
      >
        <Stack spacing={0.7}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
            <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.96rem' }}>
              {character.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              {equippedItems.length > 0 ? `${equippedItems.length} equipped` : 'Base rig'}
            </Typography>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.55}>
            {equippedItems.length > 0 ? (
              equippedItems.map((item) => (
                <Chip key={`${character.unitId}-${item.itemId}`} label={item.itemName} size="small" variant="outlined" />
              ))
            ) : (
              <Chip label="No equipment layers" size="small" variant="outlined" />
            )}
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={0.55}>
            {layers.map((layer) => (
              <Chip key={`${character.unitId}-${layer.id}`} label={layer.id} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
});
