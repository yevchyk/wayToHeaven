import { Box, Chip, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  liveSceneAuthoringWorkbenchEntries,
  replaySceneAuthoringWorkbenchEntries,
  sceneAuthoringWorkbenchSections,
} from '../src/content/storybook/sceneAuthoringWorkbench';
import type { SceneAuthoringWorkbenchEntry } from '../src/engine/types/authoring';

const meta = {
  title: 'Scene Authoring/Workbench',
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

function GuidePanel() {
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
      <Stack spacing={0.75}>
        <Typography variant="h3">Scene And Replay Authoring Flow</Typography>
        <Typography color="text.secondary" variant="body1">
          This workbench is the fast QA surface for scene-generation documents. It shows the real authored scenes,
          their replay flags, unlock sources, and source files before we even open the runtime.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
            1. Live scene workflow
          </Typography>
          <Typography variant="body2">
            Починай із <CodeInline>Documentation/WTH</CodeInline>, потім прав scene-generation документ, і лише після
            цього дивись сюди, чи сцена має правильний mode, replay flag і source paths.
          </Typography>
          <Typography variant="body2">
            Для великих сцен головний орієнтир тут це <CodeInline>nodeCount</CodeInline>,{' '}
            <CodeInline>choiceCount</CodeInline> і стартовий вузол, а не краса картки.
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
            2. Replay workflow
          </Typography>
          <Typography variant="body2">
            Replay-only сцена повинна бути replay-enabled і мати unlock джерело через{' '}
            <CodeInline>unlockSceneReplay</CodeInline> або свідомий <CodeInline>unlockOnStart</CodeInline>.
          </Typography>
          <Typography variant="body2">
            Якщо unlock source порожній, це майже завжди сирота в архіві, навіть якщо сама сцена написана добре.
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
            3. Що перевіряти
          </Typography>
          <Typography variant="body2">
            Source файли мають вести на реальний scene-generation документ і на scene meta. Якщо тут "not mapped yet",
            значить authoring surface відстає від контенту.
          </Typography>
          <Typography variant="body2">
            Для runtime-логіки далі вже перевіряй гру або library preview, але цей workbench має ловити структурний
            хаос раніше.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function SceneCard({ entry }: { entry: SceneAuthoringWorkbenchEntry }) {
  return (
    <Stack
      spacing={1.1}
      sx={{
        p: 1.6,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        minHeight: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="h5">{entry.title}</Typography>
          <Typography color="text.secondary" variant="body2">
            {entry.subtitle}
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent="flex-end">
          <Chip label={entry.mode} size="small" variant="outlined" />
          <Chip label={`${entry.nodeCount} nodes`} size="small" variant="outlined" />
          <Chip label={`${entry.choiceCount} choice beats`} size="small" variant="outlined" />
          {entry.replayEnabled ? <Chip color="secondary" label="Replay on" size="small" /> : null}
          {entry.isReplayScene ? <Chip color="warning" label="Replay-only" size="small" /> : null}
        </Stack>
      </Stack>

      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }} variant="body2">
        {entry.description}
      </Typography>

      <Stack spacing={0.5}>
        <Typography variant="body2">
          <strong>Start node:</strong> <CodeInline>{entry.startNodeId}</CodeInline>
        </Typography>
        <Typography variant="body2">
          <strong>Scene field:</strong> <CodeInline>{entry.sceneFieldPath}</CodeInline>
        </Typography>
        <Typography variant="body2">
          <strong>Scene source:</strong> <CodeInline>{entry.contentFilePath}</CodeInline>
        </Typography>
        {entry.metaFilePath ? (
          <Typography variant="body2">
            <strong>Meta source:</strong> <CodeInline>{entry.metaFilePath}</CodeInline>
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={0.6}>
        {entry.unlockSourceLabels.length > 0 ? (
          entry.unlockSourceLabels.map((label) => (
            <Chip key={label} label={label} size="small" variant="outlined" />
          ))
        ) : entry.replayEnabled ? (
          <Chip color="error" label="No replay unlock source" size="small" variant="outlined" />
        ) : null}
      </Stack>

      <Stack spacing={0.45}>
        {entry.improvementHints.map((hint) => (
          <Typography color="text.secondary" key={hint} variant="body2">
            {hint}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

function EntryGrid({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: SceneAuthoringWorkbenchEntry[];
}) {
  return (
    <Stack spacing={2}>
      <Stack spacing={0.4}>
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
          <SceneCard entry={entry} key={entry.id} />
        ))}
      </Box>
    </Stack>
  );
}

export const Browser: Story = {
  render: () => (
    <Stack spacing={3}>
      <GuidePanel />
      <EntryGrid
        description={sceneAuthoringWorkbenchSections[0]?.description ?? ''}
        entries={liveSceneAuthoringWorkbenchEntries}
        title={sceneAuthoringWorkbenchSections[0]?.title ?? 'Scene Production'}
      />
      <EntryGrid
        description={sceneAuthoringWorkbenchSections[1]?.description ?? ''}
        entries={replaySceneAuthoringWorkbenchEntries}
        title={sceneAuthoringWorkbenchSections[1]?.title ?? 'Replay Production'}
      />
    </Stack>
  ),
};
