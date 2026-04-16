import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  chapter1CharacterCompositeStage,
  chapter1HeroineBasePlacements,
  chapter1HeroineCompositeDefinition,
  chapter1HeroineWeaponPosePresets,
} from '../src/content/characters';
import type { CharacterCompositeDefinition } from '../src/engine/types/characterComposite';
import {
  buildCharacterCompositeLayers,
  getCharacterCompositeEmotions,
} from '../src/engine/utils/buildCharacterCompositeLayers';
import { CharacterCompositeRenderer } from '../src/ui/components/character-composite/CharacterCompositeRenderer';
import { getSuggestedContentImagePaths } from '../src/ui/components/character-composite/characterCompositeAssetResolver';

const meta = {
  title: 'Character Composite/Workbench',
  component: CharacterCompositeRenderer,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CharacterCompositeRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

const COMPOSITE_SOURCE_FILE = 'src/content/characters/chapter1CharacterComposites.ts';

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

function getPreferredSuggestedPath(assetId?: string | null, sourcePath?: string) {
  const paths = getSuggestedContentImagePaths(assetId ?? null, sourcePath);

  return paths[0] ?? assetId ?? 'missing-asset-id';
}

function getLayerFileTargets(definition: CharacterCompositeDefinition) {
  return [
    {
      layer: 'body',
      meaning: 'Full heroine silhouette. Keep this stable and let emotion changes happen through the head layer.',
      path: getPreferredSuggestedPath(definition.assets.body.assetId, definition.assets.body.sourcePath),
    },
    ...(definition.assets.clothes
      ? [
          {
            layer: 'clothes',
            meaning: 'Baseline outfit shell for the current corruption or outfit state.',
            path: getPreferredSuggestedPath(
              definition.assets.clothes.assetId,
              definition.assets.clothes.sourcePath,
            ),
          },
        ]
      : []),
    ...Object.entries(definition.assets.headByEmotion ?? {}).map(([emotion, asset]) => ({
      layer: `head/${emotion}`,
      meaning: 'Emotion swap for the heroine. This is the main place to iterate facial read.',
      path: getPreferredSuggestedPath(asset?.assetId, asset?.sourcePath),
    })),
    ...(definition.assets.hair
      ? [
          {
            layer: 'hair',
            meaning: 'Hair mass that should stay reusable across most heroine states.',
            path: getPreferredSuggestedPath(definition.assets.hair.assetId, definition.assets.hair.sourcePath),
          },
        ]
      : []),
    ...(definition.assets.hands
      ? [
          {
            layer: 'hands/left',
            meaning: 'Heroine left hand for pose presets and staging.',
            path: getPreferredSuggestedPath(
              definition.assets.hands.left.assetId,
              definition.assets.hands.left.sourcePath,
            ),
          },
          {
            layer: 'hands/right',
            meaning: 'Heroine right hand for pose presets and staging.',
            path: getPreferredSuggestedPath(
              definition.assets.hands.right.assetId,
              definition.assets.hands.right.sourcePath,
            ),
          },
        ]
      : []),
    ...(definition.assets.weapon
      ? [
          {
            layer: 'weapon',
            meaning: 'Optional prop layer driven by heroine pose presets.',
            path: getPreferredSuggestedPath(definition.assets.weapon.assetId, definition.assets.weapon.sourcePath),
          },
        ]
      : []),
  ];
}

function WorkflowGuide() {
  const heroineEmotion = getCharacterCompositeEmotions(chapter1HeroineCompositeDefinition)[0] ?? null;
  const heroineFileTargets = getLayerFileTargets(chapter1HeroineCompositeDefinition);

  return (
    <Stack
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">Heroine Composite Workflow</Typography>
        <Typography color="text.secondary" variant="body2">
          Composite authoring is now reserved for the main heroine rig. NPCs and supporting cast should use full flat
          emotion portraits from the Narrative Portrait workbench instead of layered body-plus-head assemblies.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 2,
        }}
      >
        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            1. Current policy
          </Typography>
          <Typography variant="body2">
            Runtime composite is active only for <CodeInline>{chapter1HeroineCompositeDefinition.id}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            NPCs stay on flat emotion sheets even when they have many emotions.
          </Typography>
          <Typography variant="body2">
            If we ever reopen VIP composites later, that should be an explicit contract change, not a silent asset
            drift.
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            2. Stage contract
          </Typography>
          <Typography variant="body2">
            Shared stage: <CodeInline>{`chapter1CharacterCompositeStage`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Logical size:{' '}
            <CodeInline>
              {`${chapter1CharacterCompositeStage.width} x ${chapter1CharacterCompositeStage.height}`}
            </CodeInline>
          </Typography>
          <Typography variant="body2">
            Safe area: <CodeInline>{`stage.safeArea`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Resize the renderer freely. All semantic anchors stay tied to this stage grid.
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            3. What to edit
          </Typography>
          <Typography variant="body2">
            Canonical authoring file: <CodeInline>{COMPOSITE_SOURCE_FILE}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Base anchors: <CodeInline>{`chapter1HeroineBasePlacements`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Pose overrides: <CodeInline>{`chapter1HeroineWeaponPosePresets['pose-1' | 'pose-2' | 'pose-3']`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Emotion swaps come from <CodeInline>{`head/<emotion>`}</CodeInline>, not from redrawing the entire body every time.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 2,
        }}
      >
        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            4. File targets
          </Typography>
          <Typography variant="body2">
            Base emotion head:{' '}
            <CodeInline>
              {heroineEmotion
                ? getPreferredSuggestedPath(
                    chapter1HeroineCompositeDefinition.assets.headByEmotion?.[heroineEmotion]?.assetId,
                  )
                : 'no head overlay'}
            </CodeInline>
          </Typography>
          {heroineFileTargets.map((target) => (
            <Typography key={target.layer} variant="body2">
              <CodeInline>{target.layer}</CodeInline>
              {' -> '}
              <CodeInline>{target.path}</CodeInline>
            </Typography>
          ))}
        </Stack>

        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            5. Edit the image when
          </Typography>
          <Typography variant="body2">
            The heroine silhouette is wrong: replace <CodeInline>{`body/base.*`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Only an expression is wrong: replace <CodeInline>{`head/<emotion>.*`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Hair, hands, or props are wrong: replace the matching layer file and keep anchors stable if possible.
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            6. Edit placement when
          </Typography>
          <Typography variant="body2">
            Every head emotion drifts the same way: patch <CodeInline>{`placements.head`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            The base weapon silhouette sits wrong: patch the relevant weapon preset block.
          </Typography>
          <Typography variant="body2">
            Only one expression crop feels off: fix that asset before opening new per-emotion placement debt.
          </Typography>
          <Typography variant="body2">
            Use the `Narrative Portrait/Character Prompt Composer` story when you need a prompt for a Mirella head
            overlay or any other isolated rig layer.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function LayerInspector({
  definition,
  emotion,
  weaponPosePreset,
}: {
  definition: CharacterCompositeDefinition;
  emotion?: string | null;
  weaponPosePreset?: 'pose-1' | 'pose-2' | 'pose-3';
}) {
  const composition = buildCharacterCompositeLayers(definition, {
    ...(emotion ? { emotion } : {}),
    ...(weaponPosePreset ? { weaponPosePreset } : {}),
  });

  return (
    <Stack
      spacing={1.25}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Typography sx={{ fontWeight: 700 }} variant="body2">
        Layer Inspector
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Read these numbers and patch the matching placement block in <CodeInline>{COMPOSITE_SOURCE_FILE}</CodeInline>.
      </Typography>
      {composition.layers.map((layer) => (
        <Stack
          key={`${definition.id}-${layer.id}-${layer.assetId}`}
          spacing={0.45}
          sx={{
            p: 1,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            {layer.id}
          </Typography>
          <Typography variant="body2">
            asset: <CodeInline>{layer.assetId}</CodeInline>
          </Typography>
          <Typography variant="body2">
            file: <CodeInline>{getPreferredSuggestedPath(layer.assetId, layer.sourcePath)}</CodeInline>
          </Typography>
          <Typography color="text.secondary" variant="body2">
            anchor {layer.placement.anchor.x}, {layer.placement.anchor.y}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            assetAnchor {layer.placement.assetAnchor.x}, {layer.placement.assetAnchor.y}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            width {layer.placement.size.width}
            {layer.placement.size.height !== undefined ? ` | height ${layer.placement.size.height}` : ''}
            {` | rotate ${layer.placement.rotate} | z ${layer.placement.z}`}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function ResponsiveAudit({
  definition,
  emotion,
  weaponPosePreset,
}: {
  definition: CharacterCompositeDefinition;
  emotion?: string | null;
  weaponPosePreset?: 'pose-1' | 'pose-2' | 'pose-3';
}) {
  const widths = [220, 320, 460];

  return (
    <Stack
      spacing={1.25}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Typography sx={{ fontWeight: 700 }} variant="body2">
        Responsive Audit
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 2,
        }}
      >
        {widths.map((width) => (
          <Stack
            key={width}
            spacing={1}
            sx={{
              p: 1,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography color="text.secondary" variant="body2">
              Width cap: <CodeInline>{`${width}px`}</CodeInline>
            </Typography>
            <CharacterCompositeRenderer
              debug
              definition={definition}
              emotion={emotion}
              maxWidth={width}
              weaponPosePreset={weaponPosePreset}
            />
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

function EmotionSheet({ definition }: { definition: CharacterCompositeDefinition }) {
  const emotions = getCharacterCompositeEmotions(definition);
  const variants = emotions.length > 0 ? emotions : [null];

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{definition.displayName}</Typography>
        <Typography color="text.secondary" variant="body2">
          Main heroine composite bench: stable body shell, reusable head emotions, and optional hair, hand, and weapon
          layers for dramatic staging.
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 2,
        }}
      >
        {variants.map((emotion) => (
          <Stack
            key={`${definition.id}-${emotion ?? 'base-only'}`}
            spacing={1.25}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }} variant="body2">
              {emotion ?? 'base only'}
            </Typography>
            <CharacterCompositeRenderer debug definition={definition} {...(emotion ? { emotion } : {})} />
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              head file:{' '}
              <CodeInline>
                {emotion
                  ? getPreferredSuggestedPath(definition.assets.headByEmotion?.[emotion]?.assetId)
                  : 'no head overlay'}
              </CodeInline>
            </Typography>
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

export const HeroineCompositeSheet: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkflowGuide />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' },
          gap: 2,
        }}
      >
        <Stack spacing={2}>
          <EmotionSheet definition={chapter1HeroineCompositeDefinition} />
          <ResponsiveAudit
            definition={chapter1HeroineCompositeDefinition}
            emotion={chapter1HeroineCompositeDefinition.defaultEmotion ?? null}
          />
        </Stack>
        <Stack spacing={2}>
          <LayerInspector
            definition={chapter1HeroineCompositeDefinition}
            emotion={chapter1HeroineCompositeDefinition.defaultEmotion ?? undefined}
          />
          <Stack
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ fontWeight: 700 }} variant="body2">
              Base Placement Block
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Canonical heroine anchors live in <CodeInline>{`chapter1HeroineBasePlacements`}</CodeInline>.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Current layers: <CodeInline>{Object.keys(chapter1HeroineBasePlacements).join(', ')}</CodeInline>
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  ),
};

export const HeroineWeaponPoseBench: Story = {
  render: () => (
    <Stack spacing={2}>
      <WorkflowGuide />
      <Stack spacing={0.5}>
        <Typography variant="h3">Heroine Weapon Presets</Typography>
        <Typography color="text.secondary" variant="body1">
          Pose presets override semantic anchors on the fixed heroine stage. They should stay readable and theatrical,
          not become a second freeform layout system.
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 2,
        }}
      >
        {Object.keys(chapter1HeroineWeaponPosePresets).map((presetKey) => {
          const preset = presetKey as keyof typeof chapter1HeroineWeaponPosePresets;

          return (
            <Stack
              key={preset}
              spacing={1.25}
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                {preset}
              </Typography>
              <CharacterCompositeRenderer
                debug
                definition={chapter1HeroineCompositeDefinition}
                emotion={chapter1HeroineCompositeDefinition.defaultEmotion ?? null}
                weaponPosePreset={preset}
              />
              <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
                edit preset block: <CodeInline>{`chapter1HeroineWeaponPosePresets['${preset}']`}</CodeInline>
              </Typography>
            </Stack>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' },
          gap: 2,
        }}
      >
        <ResponsiveAudit
          definition={chapter1HeroineCompositeDefinition}
          emotion={chapter1HeroineCompositeDefinition.defaultEmotion ?? null}
          weaponPosePreset="pose-2"
        />
        <LayerInspector
          definition={chapter1HeroineCompositeDefinition}
          emotion={chapter1HeroineCompositeDefinition.defaultEmotion ?? undefined}
          weaponPosePreset="pose-2"
        />
      </Box>
    </Stack>
  ),
};
