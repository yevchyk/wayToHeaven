import { Box, Stack, Typography } from '@mui/material';

import type {
  CharacterCompositeDefinition,
  WeaponPosePresetId,
} from '@engine/types/characterComposite';
import {
  buildCharacterCompositeLayers,
  getCharacterCompositeEmotions,
} from '@engine/utils/buildCharacterCompositeLayers';
import {
  CharacterCompositeFigure,
} from '@ui/components/character-composite/CharacterCompositeFigure';
import {
  buildCharacterCompositeRectSx,
} from '@ui/components/character-composite/characterCompositeStageLayout';
import { resolveContentImageUrl } from '@ui/components/character-composite/characterCompositeAssetResolver';

export interface CharacterCompositeRendererProps {
  definition: CharacterCompositeDefinition;
  emotion?: string | null;
  weaponPosePreset?: WeaponPosePresetId | null;
  maxWidth?: number | string;
  debug?: boolean;
}

export function CharacterCompositeRenderer({
  definition,
  emotion,
  weaponPosePreset,
  maxWidth,
  debug = false,
}: CharacterCompositeRendererProps) {
  const composition = buildCharacterCompositeLayers(definition, {
    ...(emotion !== undefined ? { emotion } : {}),
    ...(weaponPosePreset !== undefined ? { weaponPosePreset } : {}),
  });
  const availableEmotions = getCharacterCompositeEmotions(definition);
  const resolvedLayers = composition.layers.map((layer) => {
    const url = resolveContentImageUrl(layer.assetId, layer.sourcePath);

    return {
      ...layer,
      url,
      isPlaceholder: !url,
    };
  });

  return (
    <Stack spacing={1.25} sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          ...(maxWidth !== undefined ? { maxWidth } : {}),
        }}
      >
        <Box
          data-testid={`character-composite-${definition.id}`}
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: `${composition.stage.width} / ${composition.stage.height}`,
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
          {debug ? (
            <>
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
              <Box
                sx={{
                  position: 'absolute',
                  ...buildCharacterCompositeRectSx(composition.stage, composition.stage.safeArea),
                  borderRadius: 3,
                  border: '1px solid rgba(201, 164, 92, 0.56)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(255,255,255,0.015)',
                  pointerEvents: 'none',
                }}
              />
            </>
          ) : null}

          <CharacterCompositeFigure
            debug={debug}
            layers={resolvedLayers}
            stage={composition.stage}
          />
        </Box>
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          px: 0.25,
          rowGap: 0.5,
          color: 'text.secondary',
        }}
      >
        <Typography sx={{ fontSize: 12 }}>
          Head overlay:{' '}
          <Box component="span" sx={{ color: 'text.primary' }}>
            {composition.selectedEmotion ?? 'none'}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          Stage:{' '}
          <Box component="span" sx={{ color: 'text.primary' }}>
            {composition.stage.width}x{composition.stage.height}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          Available head overlays:{' '}
          <Box component="span" sx={{ color: 'text.primary' }}>
            {availableEmotions.length > 0 ? availableEmotions.join(', ') : 'none'}
          </Box>
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
