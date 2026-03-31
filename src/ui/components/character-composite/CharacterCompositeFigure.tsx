import { Box, Stack, Typography } from '@mui/material';

import type {
  CharacterCompositeLayer,
  NormalizedCharacterCompositeStage,
} from '@engine/types/characterComposite';
import { humanizeContentAssetLabel } from '@ui/components/character-composite/characterCompositeAssetResolver';
import { buildCharacterCompositeLayerSx } from '@ui/components/character-composite/characterCompositeStageLayout';

export interface ResolvedCharacterCompositeLayer extends CharacterCompositeLayer {
  url: string | null;
  isPlaceholder: boolean;
}

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

function LayerAnchorDebug({
  layer,
  stage,
}: {
  layer: CharacterCompositeLayer;
  stage: NormalizedCharacterCompositeStage;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${(layer.placement.anchor.x / stage.width) * 100}%`,
        top: `${(layer.placement.anchor.y / stage.height) * 100}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: layer.placement.z + 100,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.82)',
          backgroundColor: 'rgba(201,164,92,0.92)',
          boxShadow: '0 0 0 3px rgba(201,164,92,0.16)',
        }}
      />
      <Typography
        sx={{
          mt: 0.4,
          px: 0.45,
          py: 0.15,
          borderRadius: 1,
          backgroundColor: 'rgba(7, 8, 13, 0.82)',
          color: 'rgba(255,255,255,0.78)',
          fontSize: 9,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {layer.id}
      </Typography>
    </Box>
  );
}

function LayerPlaceholder({
  layer,
  stage,
  debug = false,
}: {
  layer: CharacterCompositeLayer;
  stage: NormalizedCharacterCompositeStage;
  debug?: boolean;
}) {
  const colors = createPlaceholderColors(layer);

  return (
    <Box
      sx={{
        ...buildCharacterCompositeLayerSx(stage, layer.placement),
        ...(layer.placement.size.height === undefined ? { aspectRatio: '3 / 4' } : {}),
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
  stage,
  url,
  debug = false,
}: {
  layer: CharacterCompositeLayer;
  stage: NormalizedCharacterCompositeStage;
  url: string;
  debug?: boolean;
}) {
  return (
    <Box
      alt={layer.label}
      component="img"
      src={url}
      sx={{
        ...buildCharacterCompositeLayerSx(stage, layer.placement),
        ...(layer.placement.size.height === undefined ? { height: 'auto' } : {}),
        display: 'block',
        maxWidth: 'none',
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

interface CharacterCompositeFigureProps {
  stage: NormalizedCharacterCompositeStage;
  layers: readonly ResolvedCharacterCompositeLayer[];
  debug?: boolean;
  sx?: Record<string, unknown>;
}

export function CharacterCompositeFigure({
  stage,
  layers,
  debug = false,
  sx,
}: CharacterCompositeFigureProps) {
  const rootSx = sx
    ? {
        position: 'relative',
        width: '100%',
        height: '100%',
        ...sx,
      }
    : {
        position: 'relative',
        width: '100%',
        height: '100%',
      };

  return (
    <Box sx={rootSx}>
      {layers.map((layer) =>
        layer.url ? (
          <LayerImage
            key={`${layer.id}-${layer.assetId}`}
            debug={debug}
            layer={layer}
            stage={stage}
            url={layer.url}
          />
        ) : (
          <LayerPlaceholder
            key={`${layer.id}-${layer.assetId}`}
            debug={debug}
            layer={layer}
            stage={stage}
          />
        ),
      )}

      {debug
        ? layers.map((layer) => (
            <LayerAnchorDebug
              key={`${layer.id}-${layer.assetId}-anchor`}
              layer={layer}
              stage={stage}
            />
          ))
        : null}
    </Box>
  );
}
