import { useMemo } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppProviders } from '../src/app/bootstrap/AppProviders';
import { GameRootStore } from '../src/engine/stores/GameRootStore';
import { LibraryModal } from '../src/ui/modals/LibraryModal';

const meta = {
  title: 'Library/Workbench',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LibraryWorkbenchShell() {
  const rootStore = useMemo(() => {
    const store = new GameRootStore();
    store.ui.openModal('library', { tab: 'characters', showAll: true });

    return store;
  }, []);

  return (
    <AppProviders rootStore={rootStore}>
      <Box
        sx={{
          minHeight: '100vh',
          p: { xs: 2, md: 3 },
          background:
            'radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, rgba(26,34,44,0.18) 22%, rgba(6,9,14,0.94) 100%)',
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Stack spacing={0.6}>
            <Typography variant="h3">Library Workbench</Typography>
            <Typography color="text.secondary" variant="body1">
              Use this story as the fast visual QA surface for the in-game library. The selector uses the same modal
              and the same content registries as runtime, so highlighted entries and deep-link opening behavior stay in
              sync with the game UI.
            </Typography>
          </Stack>
        </Stack>
        <LibraryModal />
      </Box>
    </AppProviders>
  );
}

export const Browser: Story = {
  render: () => <LibraryWorkbenchShell />,
};
