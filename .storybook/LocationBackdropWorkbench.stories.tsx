import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  chapter1CityLocationBackdropEntries,
  chapter1SceneMetaBackdropEntries,
  chapter1TravelBackdropEntries,
} from '../src/content/locations';
import { chapter1BackgroundPromptWorkbenchData } from '../src/content/storybook/backgroundProfiles/chapter1BackgroundPromptWorkbench';
import {
  sceneGenerationBackgroundWorkbenchEntries,
  storybookBackgroundSections,
} from '../src/content/storybook/narrativeAuthoringWorkbench';
import type { BackgroundWorkbenchEntry } from '../src/engine/types/authoring';
import { BackgroundPromptWorkbench } from '../src/ui/components/location-backdrop/BackgroundPromptWorkbench';
import { LocationBackdropWorkbenchCard } from '../src/ui/components/location-backdrop/LocationBackdropWorkbenchCard';

const meta = {
  title: 'Location Backdrop/Workbench',
  component: BackgroundPromptWorkbench,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BackgroundPromptWorkbench>;

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
          Storybook is the fast visual QA pass for backgrounds. The scene itself should be shaped in
          `Documentation`, then implemented in authored `sceneGeneration`, and only then checked here.
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
            1. Prompt authoring flow
          </Typography>
          <Typography variant="body2">
            Починай з `master location` і `room / zone`, а не з порожнього prompt-полотна.
          </Typography>
          <Typography variant="body2">
            Якщо є канонічний beat, стартуй із `Scene Preset`, а далі докручуй саме `scene effects`.
          </Typography>
          <Typography variant="body2">
            `General vibe`, `situation`, `style pack`, `variant` тепер це advanced overrides, а не головний authoring flow.
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
            2. Куди кидати background
          </Typography>
          <Typography variant="body2">
            Для `chapter-1/*`: <CodeInline>{'src/content/chapters/chapter-1/images/backgrounds/<name>.png'}</CodeInline>{' '}
            або <CodeInline>{'src/content/chapters/chapter-1/images/backgrounds/<name>.webp'}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Для legacy `prologue/*`: <CodeInline>{'src/content/prologue/images/backgrounds/<name>.png'}</CodeInline>{' '}
            або <CodeInline>{'src/content/prologue/images/backgrounds/<name>.webp'}</CodeInline>
          </Typography>
          <Typography variant="body2">
            Якщо `backgroundId` уже правильний, достатньо просто підкласти файл у відповідний path.
          </Typography>
          <Typography variant="body2">
            Якщо хочеш інше імʼя файлу, міняй asset id у content-файлі, а не сам Storybook.
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
            3. Де правити локацію
          </Typography>
          <Typography variant="body2">
            City scene: прав `backgroundId`, `description`, `actions[*].text`, `actions[*].description`.
          </Typography>
          <Typography variant="body2">
            Travel board: прав `backgroundId`, `description`, `nodes[*].title`, `nodes[*].description`.
          </Typography>
          <Typography variant="body2">
            Scene meta: прав `defaultBackgroundId`, `title`, `description`. Якщо сцена вже authored через `scene-generation`,
            не дублюй цей сенс у legacy dialogue layer.
          </Typography>
          <Typography variant="body2">
            Scene generation: прав `meta.defaultBackgroundId`, `meta.defaultBackgroundStyle`, `scene.backgroundId`,
            `scene.backgroundStyle`, `node.backgroundId` або `node.sceneChange.background.image/style` залежно від рівня,
            на якому міняється кадр.
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
            4. Як читати новий prompt composer
          </Typography>
          <Typography variant="body2">
            `Scene effects` це швидкий authoring layer для станів типу `Thorn Estate / Dining Hall / blood border + shadow`.
          </Typography>
          <Typography variant="body2">
            `Scene Preset` дає канонічний старт із runtime-сцени, але не блокує новий стан кімнати.
          </Typography>
          <Typography variant="body2">
            `Location block` тримає канонічний простір: маєток, кімната, шахтний уступ, храмовий берег, міський вузол.
          </Typography>
          <Typography variant="body2">
            `General vibe`, `situation`, `style pack`, `variant` потрібні, коли scene effects вже не вистачає.
          </Typography>
          <Typography variant="body2">
            `Runtime Style Token` можна прямо переносити в `backgroundStyle`, якщо ефект має жити в runtime, а не лише в prompt.
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
            5. Як швидко зрозуміти, що саме слабке
          </Typography>
          <Typography variant="body2">
            Якщо сам кадр слабкий, міняй сам файл картинки: `.png` або `.webp`.
          </Typography>
          <Typography variant="body2">
            Якщо кадр добрий, але не підходить місцю, міняй `backgroundId`.
          </Typography>
          <Typography variant="body2">
            Якщо картинка ок, але локація все одно “порожня”, майже завжди треба посилювати `description` і варіанти дій.
          </Typography>
          <Typography variant="body2">
            Для authored VN-сцен спершу дивись на beat-level background swap, а вже потім на `defaultBackgroundId`.
          </Typography>
          <Typography variant="body2">
            Якщо note в `Documentation` описує лише маленький beat усередині великої сцени, зазвичай треба правити
            `node.backgroundId`, а не `scene.backgroundId`.
          </Typography>
        </Stack>
      </Box>

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
          6. Чим перевіряти зараз
        </Typography>
        <Typography variant="body2">
          Інтерактивний режим: <CodeInline>{'pnpm storybook'}</CodeInline>
        </Typography>
        <Typography variant="body2">
          Надійна перевірка збірки: <CodeInline>{'pnpm build-storybook'}</CodeInline>
        </Typography>
        <Typography variant="body2">
          Поточний Storybook 10 тут не дає стабільного `--smoke-test`, тому для fast verification орієнтуйся на static
          build, а не на CLI smoke mode.
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
          7. Як читати scene note
        </Typography>
        <Typography variant="body2">
          `Де` у note підказує location name і базовий background.
        </Typography>
        <Typography variant="body2">
          `Що відбувається` зазвичай розкладається на `scene.description` плюс окремі `node.text`.
        </Typography>
        <Typography variant="body2">
          `Навіщо сцена` не вставляй у runtime дослівно; воно має стати переходами, умовами, наслідками і виборами.
        </Typography>
      </Stack>
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
  entries: BackgroundWorkbenchEntry[];
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        {entries.map((entry) => (
          <LocationBackdropWorkbenchCard entry={entry} key={entry.id} />
        ))}
      </Box>
    </Stack>
  );
}

export const PrologueLocationStateComposer: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkbenchGuide />
      <BackgroundPromptWorkbench data={chapter1BackgroundPromptWorkbenchData} />
    </Stack>
  ),
};

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

export const AuthoredSceneGenerationBackgrounds: Story = {
  render: () => (
    <Stack spacing={3}>
      <WorkbenchGuide />
      {storybookBackgroundSections.map((section) => {
        const entries = sceneGenerationBackgroundWorkbenchEntries.filter((entry) => entry.sectionId === section.id);

        if (entries.length === 0) {
          return null;
        }

        return (
          <BackdropGrid
            description={section.description}
            entries={entries}
            key={section.id}
            title={section.title}
          />
        );
      })}
    </Stack>
  ),
};
