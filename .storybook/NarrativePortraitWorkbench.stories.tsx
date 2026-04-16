import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  narrativePortraitWorkbenchEntries,
  storybookPortraitSections,
} from '../src/content/storybook/narrativeAuthoringWorkbench';
import {
  getSuggestedContentImagePaths,
  resolveContentImageUrl,
} from '../src/ui/components/character-composite/characterCompositeAssetResolver';

const meta = {
  title: 'Narrative Portrait/Workbench',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

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

function PortraitWorkbenchGuide() {
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
        <Typography variant="h4">Portrait Workflow</Typography>
        <Typography color="text.secondary" variant="body2">
          This workbench is for flat VN portraits used by dialogue and scene-generation staging. It is the primary
          portrait workflow for NPCs and supporting cast. The story heroine still appears here for fallback and
          one-off beat art, but her main layered rig now lives in the Character Composite workbench.
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
            1. Reusable portraits
          </Typography>
          <Typography variant="body2">
            For NPCs and common cast, reusable emotion portraits belong in{' '}
            <CodeInline>{'portraitRefs.<emotion>'}</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Scene nodes can then request the emotion without hardcoding a file every time.
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
            2. One-off overrides
          </Typography>
          <Typography variant="body2">
            Use explicit <CodeInline>{'portraitId'}</CodeInline> inside scene-generation only when the scene needs a
            unique portrait that should not become the canonical emotion mapping.
          </Typography>
          <Typography variant="body2">
            The explicit override sections below show exactly where those overrides already exist.
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
            3. Asset files
          </Typography>
          <Typography variant="body2">
            `chapter-1/*` portraits live under{' '}
            <CodeInline>{'src/content/chapters/chapter-1/images/portraits/...'} </CodeInline>
          </Typography>
          <Typography variant="body2">
            Legacy `prologue/*` portraits live under <CodeInline>{'src/content/prologue/images/portraits/...'}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Do not rename a portrait file root in Storybook terms only; change the content asset id if the root is
            being migrated intentionally.
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
            4. Heroine exception
          </Typography>
          <Typography variant="body2">
            Mirella keeps flat portrait entries here for fallback states, scene-specific overrides, and archive
            continuity.
          </Typography>
          <Typography variant="body2">
            Her default moment-to-moment dialogue presentation now comes from the layered heroine rig, not from turning
            every emotion into a new full-body composite for the whole cast.
          </Typography>
          <Typography variant="body2">
            Use the `Narrative Portrait/Character Prompt Composer` story when you need a production-ready prompt for a
            specific flat portrait target.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function PortraitCard({
  title,
  subtitle,
  description,
  portraitId,
  contentFilePath,
  assetFieldPath,
  improvementHints,
}: {
  title: string;
  subtitle: string;
  description: string;
  portraitId: string | null;
  contentFilePath: string;
  assetFieldPath: string;
  improvementHints: string[];
}) {
  const imageUrl = resolveContentImageUrl(portraitId);
  const suggestedPath =
    getSuggestedContentImagePaths(portraitId).find((path) => path.endsWith('.webp')) ??
    getSuggestedContentImagePaths(portraitId)[0] ??
    portraitId ??
    'missing-portrait-id';

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
          minHeight: 300,
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
          background:
            'radial-gradient(circle at top, rgba(201,164,92,0.12), transparent 26%), linear-gradient(180deg, rgba(17,15,20,0.9), rgba(10,10,14,0.96))',
        }}
      >
        {imageUrl ? (
          <Box
            alt=""
            component="img"
            src={imageUrl}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              userSelect: 'none',
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ position: 'absolute', inset: 0, px: 2 }}
          >
            <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
              Missing portrait asset
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack spacing={0.6}>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary" variant="body2">
          {subtitle}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </Stack>

      <Stack spacing={0.7}>
        <Typography variant="body2">
          image file: <CodeInline>{suggestedPath}</CodeInline>
        </Typography>
        <Typography variant="body2">
          content file: <CodeInline>{contentFilePath}</CodeInline>
        </Typography>
        <Typography variant="body2">
          asset field: <CodeInline>{assetFieldPath}</CodeInline>
        </Typography>
      </Stack>

      <Stack spacing={0.7}>
        {improvementHints.map((hint) => (
          <Typography color="text.secondary" key={`${title}-${hint}`} variant="body2">
            {hint}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

function PortraitSection({
  title,
  description,
  sectionId,
}: {
  title: string;
  description: string;
  sectionId: string;
}) {
  const entries = narrativePortraitWorkbenchEntries.filter((entry) => entry.sectionId === sectionId);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary" variant="body1">
          {description}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 2,
        }}
      >
        {entries.map((entry) => (
          <PortraitCard key={entry.id} {...entry} />
        ))}
      </Box>
    </Stack>
  );
}

export const RegistryAndOverrides: Story = {
  render: () => (
    <Stack spacing={3}>
      <PortraitWorkbenchGuide />
      {storybookPortraitSections.map((section) => (
        <PortraitSection
          description={section.description}
          key={section.id}
          sectionId={section.id}
          title={section.title}
        />
      ))}
    </Stack>
  ),
};
