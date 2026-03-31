import { Box, Divider, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  chapter1CharacterCompositeStage,
  chapter1HeroineBasePlacements,
  chapter1HeroineCompositeDefinition,
  chapter1NpcCompositeDefinitions,
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
  const targets = [
    {
      layer: 'body',
      meaning: 'full base layer. It may already include the whole head and face.',
      path: getPreferredSuggestedPath(definition.assets.body.assetId, definition.assets.body.sourcePath),
    },
    ...(definition.assets.clothes
      ? [
          {
            layer: 'clothes',
            meaning: 'static clothing overlay. Usually one base file.',
            path: getPreferredSuggestedPath(
              definition.assets.clothes.assetId,
              definition.assets.clothes.sourcePath,
            ),
          },
        ]
      : []),
    ...Object.entries(definition.assets.headByEmotion ?? {}).flatMap(([emotion, asset]) =>
      asset
        ? [
            {
              layer: `head/${emotion}`,
              meaning: 'optional head or face overlay. Use it only if you want a swap above the body layer.',
              path: getPreferredSuggestedPath(asset.assetId, asset.sourcePath),
            },
          ]
        : [],
    ),
    ...(definition.assets.hair
      ? [
          {
            layer: 'hair',
            meaning: 'separate hair layer. Keep it emotion-agnostic unless truly necessary.',
            path: getPreferredSuggestedPath(definition.assets.hair.assetId, definition.assets.hair.sourcePath),
          },
        ]
      : []),
    ...(definition.assets.hands
      ? [
          {
            layer: 'hands/left',
            meaning: 'heroine left hand.',
            path: getPreferredSuggestedPath(
              definition.assets.hands.left.assetId,
              definition.assets.hands.left.sourcePath,
            ),
          },
          {
            layer: 'hands/right',
            meaning: 'heroine right hand.',
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
            meaning: 'weapon sprite used by pose presets.',
            path: getPreferredSuggestedPath(definition.assets.weapon.assetId, definition.assets.weapon.sourcePath),
          },
        ]
      : []),
  ];

  return targets;
}

function getBaseLayerPathSummary(definition: CharacterCompositeDefinition) {
  return [
    `body: ${getPreferredSuggestedPath(definition.assets.body.assetId, definition.assets.body.sourcePath)}`,
    ...(definition.assets.clothes
      ? [`clothes: ${getPreferredSuggestedPath(definition.assets.clothes.assetId, definition.assets.clothes.sourcePath)}`]
      : []),
    ...(definition.assets.hair
      ? [`hair: ${getPreferredSuggestedPath(definition.assets.hair.assetId, definition.assets.hair.sourcePath)}`]
      : []),
    ...(definition.assets.weapon
      ? [`weapon: ${getPreferredSuggestedPath(definition.assets.weapon.assetId, definition.assets.weapon.sourcePath)}`]
      : []),
  ];
}

function WorkflowGuide() {
  const npcSample = chapter1NpcCompositeDefinitions[0];
  const npcEmotion = npcSample ? (getCharacterCompositeEmotions(npcSample)[0] ?? null) : null;
  const heroineEmotion = getCharacterCompositeEmotions(chapter1HeroineCompositeDefinition)[0] ?? null;
  const npcFileTargets = npcSample ? getLayerFileTargets(npcSample) : [];
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
        <Typography variant="h4">Stage Workflow</Typography>
        <Typography color="text.secondary" variant="body2">
          Storybook now edits a fixed logical stage, not arbitrary DOM pixels. The grid, safe area, and every layer
          share the same coordinate system.
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
            1. Stage contract
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
            The renderer can grow or shrink, but layer geometry stays tied to this stage.
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
            2. What to edit
          </Typography>
          <Typography variant="body2">
            All authoring still lives in <CodeInline>{COMPOSITE_SOURCE_FILE}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC base head placement: <CodeInline>{`chapter1NpcCompositeTweaks['npc-id'].placements.head`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC one emotion fix:{' '}
            <CodeInline>{`chapter1NpcCompositeTweaks['npc-id'].headEmotionPlacements['emotion']`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine base anchors: <CodeInline>{`chapter1HeroineBasePlacements`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine pose overrides:{' '}
            <CodeInline>{`chapter1HeroineWeaponPosePresets['pose-1' | 'pose-2' | 'pose-3']`}</CodeInline>
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
            3. Placement semantics
          </Typography>
          <Typography variant="body2">
            <CodeInline>anchor.x / anchor.y</CodeInline> is the point on the stage.
          </Typography>
          <Typography variant="body2">
            <CodeInline>assetAnchor.x / assetAnchor.y</CodeInline> is the matching point inside the asset box.
          </Typography>
          <Typography variant="body2">
            <CodeInline>size.width</CodeInline> controls rendered width in stage units.
          </Typography>
          <Typography variant="body2">
            If only one overlay emotion drifts, fix that overlay crop or its per-emotion placement, not the whole base.
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
            4. Asset contract
          </Typography>
          <Typography variant="body2">
            Body is the full base layer. It can already contain the whole character, including the head and face.
          </Typography>
          <Typography variant="body2">
            Head is only an optional overlay above body. It may be a full head, only a face patch, or missing entirely.
          </Typography>
          <Typography variant="body2">
            If you use overlays, keep them on a consistent canvas when possible. If the crop must change, move the
            semantic point with <CodeInline>assetAnchor</CodeInline>, not by guessing DOM offsets.
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
            5. File targets
          </Typography>
          <Typography variant="body2">
            NPC sample body:{' '}
            <CodeInline>{getPreferredSuggestedPath(npcSample?.assets.body.assetId, npcSample?.assets.body.sourcePath)}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC sample head overlay:{' '}
            <CodeInline>
              {npcEmotion
                ? getPreferredSuggestedPath(npcSample?.assets.headByEmotion?.[npcEmotion]?.assetId)
                : 'no head overlay'}
            </CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine body: <CodeInline>{getPreferredSuggestedPath(chapter1HeroineCompositeDefinition.assets.body.assetId)}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine head overlay:{' '}
            <CodeInline>
              {heroineEmotion
                ? getPreferredSuggestedPath(
                    chapter1HeroineCompositeDefinition.assets.headByEmotion?.[heroineEmotion]?.assetId,
                  )
                : 'no head overlay'}
            </CodeInline>
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
            6. Responsive audit
          </Typography>
          <Typography variant="body2">
            Resize the cards below. The character should scale, preserve aspect ratio, and keep anchor relationships.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
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
            7. NPC layer map
          </Typography>
          {npcFileTargets.map((target) => (
            <Stack key={`npc-${target.layer}`} spacing={0.35}>
              <Typography variant="body2">
                <CodeInline>{target.layer}</CodeInline>
                {' -> '}
                <CodeInline>{target.path}</CodeInline>
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {target.meaning}
              </Typography>
            </Stack>
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
            8. Heroine layer map
          </Typography>
          {heroineFileTargets.map((target) => (
            <Stack key={`heroine-${target.layer}`} spacing={0.35}>
              <Typography variant="body2">
                <CodeInline>{target.layer}</CodeInline>
                {' -> '}
                <CodeInline>{target.path}</CodeInline>
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {target.meaning}
              </Typography>
            </Stack>
          ))}
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
            9. When to edit the image
          </Typography>
          <Typography variant="body2">
            The full base art is wrong, or you want the whole character in one file: replace <CodeInline>{`body/base.*`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Only one optional head overlay is wrong: replace that one{' '}
            <CodeInline>{`head/<emotion>.png`}</CodeInline> or <CodeInline>{`head/<emotion>.webp`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Clothes, hair, hands, or weapon art is wrong: replace the matching layer file.
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
            10. When to edit placement
          </Typography>
          <Typography variant="body2">
            The whole full-height body sits wrong: patch <CodeInline>{`placements.body`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Every head overlay is shifted the same way: patch <CodeInline>{`placements.head`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            One overlay emotion drifts: patch <CodeInline>{`headEmotionPlacements['emotion']`}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Heroine hand or weapon pose is wrong: patch <CodeInline>{`chapter1HeroineBasePlacements`}</CodeInline> or the
            matching <CodeInline>{`chapter1HeroineWeaponPosePresets[...]`}</CodeInline>.
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
  const baseLayerSummary = getBaseLayerPathSummary(definition);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{definition.displayName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {definition.kind === 'heroine'
            ? 'Full composite bench with a full body base, optional head overlay, hair, hands, and weapon.'
            : 'NPC bench with a full body base and optional head overlays.'}
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
              head overlay file:{' '}
              <CodeInline>
                {emotion
                  ? getPreferredSuggestedPath(definition.assets.headByEmotion?.[emotion]?.assetId)
                  : 'no head overlay'}
              </CodeInline>
            </Typography>
            {baseLayerSummary.map((entry) => (
              <Typography color="text.secondary" key={`${definition.id}-${emotion ?? 'base-only'}-${entry}`} sx={{ fontSize: 11, lineHeight: 1.45 }}>
                {entry.split(': ')[0]} file: <CodeInline>{entry.split(': ').slice(1).join(': ')}</CodeInline>
              </Typography>
            ))}
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

export const NpcEmotionSheets: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkflowGuide />
      <Stack spacing={0.75}>
        <Typography variant="h3">NPC Emotion Sheets</Typography>
        <Typography color="text.secondary" variant="body1">
          NPC overlays sit on explicit stage anchors above a full base layer. If you skip head overlays entirely, the
          body layer still remains valid.
        </Typography>
      </Stack>
      {chapter1NpcCompositeDefinitions.map((definition, index) => (
        <Stack key={definition.id} spacing={3}>
          {index > 0 ? <Divider /> : null}
          <EmotionSheet definition={definition} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const HeroineEmotionSheet: Story = {
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
          Weapon presets now override semantic anchor placements on a fixed stage instead of retuning arbitrary CSS
          transforms.
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 2,
        }}
      >
        {(['pose-1', 'pose-2', 'pose-3'] as const).map((preset) => (
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
              edit preset block:{' '}
              <CodeInline>{`chapter1HeroineWeaponPosePresets['${preset}']`}</CodeInline>
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              weapon file: <CodeInline>{getPreferredSuggestedPath(chapter1HeroineCompositeDefinition.assets.weapon?.assetId)}</CodeInline>
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              left hand file:{' '}
              <CodeInline>{getPreferredSuggestedPath(chapter1HeroineCompositeDefinition.assets.hands?.left.assetId)}</CodeInline>
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              right hand file:{' '}
              <CodeInline>{getPreferredSuggestedPath(chapter1HeroineCompositeDefinition.assets.hands?.right.assetId)}</CodeInline>
            </Typography>
          </Stack>
        ))}
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
