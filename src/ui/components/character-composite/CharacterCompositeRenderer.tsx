import { Box, Stack, Typography } from '@mui/material';

import type {
  CharacterCompositeDefinition,
  CharacterCompositeLayer,
  WeaponPosePresetId,
} from '@engine/types/characterComposite';
import {
  buildCharacterCompositeLayers,
  getCharacterCompositeEmotions,
} from '@engine/utils/buildCharacterCompositeLayers';
import {
  humanizeContentAssetLabel,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';

function hashString(value: string) {
  return value.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
}

function createPlaceholderColors(layer: CharacterCompositeLayer) {
  const seed = hashString(`${layer.id}-${layer.assetId}`);
  const hue = seed % 360;

  return {
    fill: `hsla(${hue} 60% 30% / 0.78)`,
    accent: `hsla(${(hue + 36) % 360} 76% 70% / 0.9)`,
    border: `hsla(${(hue + 12) % 360} 72% 58% / 0.62)`,
  };
}

function buildLayerBoxSx(layer: CharacterCompositeLayer) {
  return {
    position: 'absolute',
    left: `${layer.transform.x}%`,
    top: `${layer.transform.y}%`,
    width: `${layer.transform.width}%`,
    ...(layer.transform.height !== undefined ? { height: `${layer.transform.height}%` } : {}),
    transform: `translate(-50%, -50%) scale(${layer.transform.scale}) rotate(${layer.transform.rotate}deg)`,
    transformOrigin: layer.transform.transformOrigin,
    opacity: layer.transform.opacity,
    zIndex: layer.transform.z,
    pointerEvents: 'none',
  } as const;
}

function LayerPlaceholder({ layer, debug = false }: { layer: CharacterCompositeLayer; debug?: boolean }) {
  const colors = createPlaceholderColors(layer);

  return (
    <Box
      sx={{
        ...buildLayerBoxSx(layer),
        aspectRatio: '3 / 4',
        borderRadius: 2,
        border: `1px dashed ${colors.border}`,
        ...(debug
          ? {
              outline: '1px dashed rgba(201, 164, 92, 0.72)',
              outlineOffset: '2px',
            }
          : {}),
        background: `linear-gradient(180deg, ${colors.accent}, ${colors.fill})`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.32)',
        overflow: 'hidden',
      }}
    >
      <Stack
        justifyContent="space-between"
        sx={{
          height: '100%',
          p: 1,
          color: 'rgba(255,255,255,0.94)',
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
          {layer.id.toUpperCase()}
        </Typography>
        <Stack spacing={0.35}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
            {layer.label}
          </Typography>
          <Typography sx={{ fontSize: 9, lineHeight: 1.25, opacity: 0.86 }}>
            {humanizeContentAssetLabel(layer.assetId)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function LayerImage({
  layer,
  url,
  debug = false,
}: {
  layer: CharacterCompositeLayer;
  url: string;
  debug?: boolean;
}) {
  return (
    <Box
      alt={layer.label}
      component="img"
      src={url}
      sx={{
        ...buildLayerBoxSx(layer),
        height: layer.transform.height !== undefined ? `${layer.transform.height}%` : 'auto',
        objectFit: 'contain',
        ...(debug
          ? {
              outline: '1px dashed rgba(201, 164, 92, 0.72)',
              outlineOffset: '2px',
            }
          : {}),
      }}
    />
  );
}

export interface CharacterCompositeRendererProps {
  definition: CharacterCompositeDefinition;
  emotion?: string | null;
  weaponPosePreset?: WeaponPosePresetId | null;
  height?: number | string;
  debug?: boolean;
}

export function CharacterCompositeRenderer({
  definition,
  emotion,
  weaponPosePreset,
  height = 520,
  debug = false,
}: CharacterCompositeRendererProps) {
  const composition = buildCharacterCompositeLayers(definition, {
    ...(emotion !== undefined ? { emotion } : {}),
    ...(weaponPosePreset !== undefined ? { weaponPosePreset } : {}),
  });
  const availableEmotions = getCharacterCompositeEmotions(definition);

  return (
    <Stack spacing={1.25}>
      <Box
        data-testid={`character-composite-${definition.id}`}
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: height,
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          background: `
            radial-gradient(circle at top, rgba(201, 164, 92, 0.18), transparent 46%),
            linear-gradient(180deg, rgba(17, 20, 29, 0.98), rgba(13, 11, 17, 0.98))
          `,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '7% 9%',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.05)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          }}
        />
        {debug ? (
          <Box
            sx={{
              position: 'absolute',
              inset: '7% 9%',
              borderRadius: 4,
              backgroundImage: `
                linear-gradient(to right, transparent 24.8%, rgba(255,255,255,0.08) 25%, transparent 25.2%, transparent 49.8%, rgba(201,164,92,0.18) 50%, transparent 50.2%, transparent 74.8%, rgba(255,255,255,0.08) 75%, transparent 75.2%),
                linear-gradient(to bottom, transparent 24.8%, rgba(255,255,255,0.06) 25%, transparent 25.2%, transparent 49.8%, rgba(255,255,255,0.08) 50%, transparent 50.2%, transparent 74.8%, rgba(255,255,255,0.06) 75%, transparent 75.2%)
              `,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        {composition.layers.map((layer) => {
          const layerUrl = resolveContentImageUrl(layer.assetId, layer.sourcePath);

          return layerUrl ? (
            <LayerImage
              key={`${definition.id}-${layer.id}-${layer.assetId}`}
              debug={debug}
              layer={layer}
              url={layerUrl}
            />
          ) : (
            <LayerPlaceholder
              key={`${definition.id}-${layer.id}-${layer.assetId}`}
              debug={debug}
              layer={layer}
            />
          );
        })}
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          px: 0.25,
          color: 'text.secondary',
        }}
      >
        <Typography sx={{ fontSize: 12 }}>
          Emotion: <Box component="span" sx={{ color: 'text.primary' }}>{composition.selectedEmotion}</Box>
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          Available: <Box component="span" sx={{ color: 'text.primary' }}>{availableEmotions.join(', ')}</Box>
        </Typography>
      </Stack>
      {definition.kind === 'heroine' ? (
        <Typography sx={{ px: 0.25, fontSize: 12, color: 'text.secondary' }}>
          Weapon preset:{' '}
          <Box component="span" sx={{ color: 'text.primary' }}>
            {composition.selectedWeaponPosePreset ?? 'none'}
          </Box>
        </Typography>
      ) : null}
    </Stack>
  );
}
