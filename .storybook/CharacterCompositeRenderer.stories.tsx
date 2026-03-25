import { Box, Divider, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
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

  return paths.find((path) => path.endsWith('.webp')) ?? paths[0] ?? assetId ?? 'missing-asset-id';
}

function WorkflowGuide() {
  const npcSample = chapter1NpcCompositeDefinitions[0];
  const npcEmotion = npcSample ? getCharacterCompositeEmotions(npcSample)[0] : 'neutral';
  const heroineEmotion = chapter1HeroineCompositeDefinition.defaultEmotion;

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
        <Typography variant="h4">Fast Workflow</Typography>
        <Typography color="text.secondary" variant="body2">
          Drop image, refresh Storybook, tweak transform, repeat. The debug frame shows the stage grid, and every
          card below tells you the exact <CodeInline>{'head/<emotion>.webp'}</CodeInline> file to generate next.
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
            1. Куди кидати картинки
          </Typography>
          <Typography variant="body2">
            NPC body: <CodeInline>{`src/content/chapters/chapter-1/images/characters/<npc-id>/body/base.webp`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC clothes:{' '}
            <CodeInline>{`src/content/chapters/chapter-1/images/characters/<npc-id>/clothes/base.webp`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC head/emotion:{' '}
            <CodeInline>{`src/content/chapters/chapter-1/images/characters/<npc-id>/head/<emotion>.webp`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine extras:{' '}
            <CodeInline>{`hair/base.webp | hands/left.webp | hands/right.webp | weapon/base.webp`}</CodeInline>
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
            2. Де правити позиції
          </Typography>
          <Typography variant="body2">
            Усі правки сидять у <CodeInline>{COMPOSITE_SOURCE_FILE}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC base head slot: <CodeInline>{`chapter1NpcCompositeTweaks['npc-id'].transforms.head`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            NPC one emotion nudge:{' '}
            <CodeInline>{`chapter1NpcCompositeTweaks['npc-id'].headEmotionTransforms['emotion']`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine base layout: <CodeInline>{`chapter1HeroineBaseTransforms`}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Heroine weapon families: <CodeInline>{`chapter1HeroineWeaponPosePresets['pose-1' | 'pose-2' | 'pose-3']`}</CodeInline>
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
            3. Що саме крутити
          </Typography>
          <Typography variant="body2">
            <CodeInline>x</CodeInline> і <CodeInline>y</CodeInline> це відсотки всередині сцени.
          </Typography>
          <Typography variant="body2">
            <CodeInline>width</CodeInline> робить шар більшим або меншим.
          </Typography>
          <Typography variant="body2">
            <CodeInline>rotate</CodeInline> це поворот у градусах.
          </Typography>
          <Typography variant="body2">
            Якщо тільки одна емоція криво сидить, рухай не весь head slot, а саме її `headEmotionTransforms`.
          </Typography>
          <Typography variant="body2">
            Якщо крива вся група зброї, чіпай не `weapon`, а потрібний `pose-*`.
          </Typography>
        </Stack>
      </Box>

      {npcSample ? (
        <Typography color="text.secondary" variant="body2">
          NPC sample path: <CodeInline>{getPreferredSuggestedPath(npcSample.assets.headByEmotion[npcEmotion]?.assetId)}</CodeInline>
        </Typography>
      ) : null}
      <Typography color="text.secondary" variant="body2">
        Heroine sample path:{' '}
        <CodeInline>
          {getPreferredSuggestedPath(chapter1HeroineCompositeDefinition.assets.headByEmotion[heroineEmotion]?.assetId)}
        </CodeInline>
      </Typography>
    </Stack>
  );
}

function LayerInspector({
  definition,
  emotion,
  weaponPosePreset,
}: {
  definition: CharacterCompositeDefinition;
  emotion?: string;
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
        Read these values and patch the matching block in <CodeInline>{COMPOSITE_SOURCE_FILE}</CodeInline>.
      </Typography>
      {composition.layers.map((layer) => (
        <Stack
          key={`${definition.id}-${layer.id}-${layer.assetId}`}
          spacing={0.4}
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
            x {layer.transform.x} | y {layer.transform.y} | width {layer.transform.width} | rotate {layer.transform.rotate}
            {' | '}z {layer.transform.z}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function EmotionSheet({ definition }: { definition: CharacterCompositeDefinition }) {
  const emotions = getCharacterCompositeEmotions(definition);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{definition.displayName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {definition.kind === 'heroine'
            ? 'Full composite bench with body, clothes, emotion head, hair, hands, and weapon.'
            : 'NPC bench with shared body/clothes and emotion-swapped heads.'}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 2,
        }}
      >
        {emotions.map((emotion) => (
          <Stack
            key={`${definition.id}-${emotion}`}
            spacing={1.25}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }} variant="body2">
              {emotion}
            </Typography>
            <CharacterCompositeRenderer debug definition={definition} emotion={emotion} />
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              head file:{' '}
              <CodeInline>
                {getPreferredSuggestedPath(definition.assets.headByEmotion[emotion]?.assetId)}
              </CodeInline>
            </Typography>
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
          Each NPC keeps a fixed body and clothes base while the head asset changes per emotion.
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
        <EmotionSheet definition={chapter1HeroineCompositeDefinition} />
        <LayerInspector
          definition={chapter1HeroineCompositeDefinition}
          emotion={chapter1HeroineCompositeDefinition.defaultEmotion}
        />
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
          `pose-1`, `pose-2`, and `pose-3` are the hardcoded anchor groups for future weapon families.
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
              emotion={chapter1HeroineCompositeDefinition.defaultEmotion}
              weaponPosePreset={preset}
            />
            <Typography color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.45 }}>
              edit preset block:{' '}
              <CodeInline>{`chapter1HeroineWeaponPosePresets['${preset}']`}</CodeInline>
            </Typography>
          </Stack>
        ))}
      </Box>
      <LayerInspector
        definition={chapter1HeroineCompositeDefinition}
        emotion={chapter1HeroineCompositeDefinition.defaultEmotion}
        weaponPosePreset="pose-2"
      />
    </Stack>
  ),
};
