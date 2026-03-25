import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  chapter1CityLocationBackdropEntries,
  chapter1SceneMetaBackdropEntries,
  chapter1TravelBackdropEntries,
  type LocationBackdropWorkbenchEntry,
} from '../src/content/locations';
import { LocationBackdropWorkbenchCard } from '../src/ui/components/location-backdrop/LocationBackdropWorkbenchCard';

const meta = {
  title: 'Location Backdrop/Workbench',
  component: LocationBackdropWorkbenchCard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LocationBackdropWorkbenchCard>;

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

function WorkbenchGuide() {
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
        <Typography variant="h4">Fast Background Workflow</Typography>
        <Typography color="text.secondary" variant="body2">
          Drop the `.webp`, refresh Storybook, then decide whether the problem is the image, the chosen `backgroundId`,
          or the scene content around it.
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
            1. Куди кидати background
          </Typography>
          <Typography variant="body2">
            Шлях завжди такий: <CodeInline>{'src/content/chapters/chapter-1/images/backgrounds/<name>.webp'}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Якщо `backgroundId` уже правильний, достатньо просто підкласти файл у цей path.
          </Typography>
          <Typography variant="body2">
            Якщо хочеш інше імʼя файлу, міняй не Storybook, а `backgroundId` або `defaultBackgroundId` у content-файлі.
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
            2. Де правити локацію
          </Typography>
          <Typography variant="body2">
            City scene: прав `backgroundId`, `description`, `actions[*].text`, `actions[*].description`.
          </Typography>
          <Typography variant="body2">
            Travel board: прав `backgroundId`, `description`, `nodes[*].title`, `nodes[*].description`.
          </Typography>
          <Typography variant="body2">
            Scene meta: прав `defaultBackgroundId`, `title`, `description`. Для окремих кадрів усередині сцени йди в dialogue file.
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
            3. Як швидко зрозуміти, що саме слабке
          </Typography>
          <Typography variant="body2">
            Якщо сам кадр слабкий, міняй `.webp`.
          </Typography>
          <Typography variant="body2">
            Якщо кадр добрий, але не підходить місцю, міняй `backgroundId`.
          </Typography>
          <Typography variant="body2">
            Якщо картинка ок, але локація все одно “порожня”, майже завжди треба посилювати `description` і варіанти дій.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function BackdropGrid({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: LocationBackdropWorkbenchEntry[];
}) {
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
          <LocationBackdropWorkbenchCard entry={entry} key={entry.id} />
        ))}
      </Box>
    </Stack>
  );
}

export const CitySceneBackgrounds: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkbenchGuide />
      <BackdropGrid
        description="These are the interactive city hubs. If a location still feels flat after the image lands, improve the descriptions and action copy in the same scene file."
        entries={chapter1CityLocationBackdropEntries}
        title="City Scene Backgrounds"
      />
    </Stack>
  ),
};

export const TravelRouteBackgrounds: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkbenchGuide />
      <BackdropGrid
        description="Travel backgrounds need to carry the mood of the whole route, not one single node."
        entries={chapter1TravelBackdropEntries}
        title="Travel Route Backgrounds"
      />
    </Stack>
  ),
};

export const SceneDefaultBackgrounds: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkbenchGuide />
      <BackdropGrid
        description="These defaults establish the opening mood of each story scene before any per-node background swaps happen inside dialogue."
        entries={chapter1SceneMetaBackdropEntries}
        title="Scene Default Backgrounds"
      />
    </Stack>
  ),
};
