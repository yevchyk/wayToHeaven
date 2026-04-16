import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Authoring/Start Here',
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

function GuideCard({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.75,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Typography sx={{ fontWeight: 700 }} variant="body2">
        {title}
      </Typography>
      {lines.map((line) => (
        <Typography key={line} variant="body2">
          {line}
        </Typography>
      ))}
    </Stack>
  );
}

export const StartHere: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h3">Storybook Authoring Flow</Typography>
        <Typography color="text.secondary" variant="body1">
          Storybook is the visual workbench, not the first place where a scene is invented. The authoring flow now
          starts in Documentation, then moves into authored <CodeInline>sceneGeneration</CodeInline> files, and only
          then comes back here for visual QA.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
        }}
      >
        <GuideCard
          lines={[
            'Create or update the scene note in `Documentation` first.',
            'Use the scene note together with linked character, location, and system notes.',
            'Do not treat the old general lore overview as the main source of truth; use the current WTH note tree instead.',
          ]}
          title="1. Start In Documentation"
        />
        <GuideCard
          lines={[
            'Use "Scene Authoring/Workbench" for scene-generation structure, replay flags, and unlock-source QA.',
            'Use "Narrative Portrait/Character Prompt Composer" first when you need production-ready portrait prompts tied to a real runtime target.',
            'Use "Location Backdrop/Workbench" for backgrounds.',
            'Use "Narrative Portrait/Workbench" for raw dialogue portraits and explicit scene overrides.',
            'Use "Character Composite/Workbench" only for layered composite actor art, not raw VN portraits.',
          ]}
          title="2. What Storybook Covers"
        />
        <GuideCard
          lines={[
            'Reusable portraits belong in character `portraitRefs`.',
            'One-off art belongs in explicit `portraitId` on a node or stage patch.',
            'Scene-level or node-level background swaps belong in authored scene-generation files, not in Storybook itself.',
          ]}
          title="3. Where To Edit"
        />
        <GuideCard
          lines={[
            'Add `chapter-1/*` images under `src/content/chapters/chapter-1/images/...`.',
            'Current legacy `prologue/*` ids resolve under `src/content/prologue/images/...`.',
            'Do not silently move a `prologue/*` asset into `chapter-1/*`; either keep the legacy root or rename the asset id in content on purpose.',
            'If the file path is already right, Storybook updates as soon as the image exists.',
          ]}
          title="4. Asset Roots"
        />
        <GuideCard
          lines={[
            'Scene note title usually maps to `scene.title` if it is a full runtime scene, or `node.title` if it is only one beat inside a larger scene.',
            'The "Where" section usually affects `scene.locationName` and the chosen `backgroundId` level.',
            'The "Who Is In The Scene" section maps to `scene.stage.characters`, `node.speakerId`, and reusable portrait work in the NPC registry.',
            'The "What Happens" section becomes `scene.description`, `node.text`, and `choices[*].text`.',
            'The "Why This Scene Exists" section is not pasted verbatim; it should drive effects, conditions, and `nextSceneId` / `nextNodeId` transitions.',
          ]}
          title="5. Note To Runtime Mapping"
        />
        <GuideCard
          lines={[
            'Interactive workbench: `pnpm storybook`.',
            'Reliable validation: `pnpm build-storybook`.',
            'Current Storybook 10 CLI smoke mode is flaky here, so do not treat `--smoke-test` as the source of truth.',
          ]}
          title="6. How To Verify"
        />
      </Box>

      <Stack
        spacing={1}
        sx={{
          p: 2,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      >
        <Typography variant="h4">Current Gaps</Typography>
        <Typography variant="body2">
          Storybook covers visual authoring surfaces: backgrounds, portraits, and stage overrides. It still does not
          replace runtime QA for branching logic, effects, inventory or state changes, route logic, and audio timing.
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Portrait generation now has a single prompt entrypoint: start in `Narrative Portrait/Character Prompt Composer`,
          then validate the result in the portrait or composite workbench instead of inventing prompts ad hoc.
        </Typography>
      </Stack>
    </Stack>
  ),
};
