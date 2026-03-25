import { observer } from 'mobx-react-lite';
import { Box, Stack } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { AppShell } from '@ui/layouts/AppShell';
import { CharacterMenuModal } from '@ui/modals/CharacterMenuModal';
import { MetaHud } from '@ui/components/MetaHud';
import { ScreenRenderer } from '@ui/components/ScreenRenderer';

const App = observer(function App() {
  const rootStore = useGameRootStore();
  const activeRuntimeLayer = rootStore.activeRuntimeLayer;
  const isImmersiveLayer = activeRuntimeLayer === 'dialogue' || activeRuntimeLayer === 'city';
  const shouldOverlayHud = activeRuntimeLayer === 'city';

  return (
    <>
      <AppShell mode={isImmersiveLayer ? 'immersive' : 'framed'}>
        {isImmersiveLayer ? (
          <Box sx={{ position: 'relative', minHeight: '100svh' }}>
            <ScreenRenderer />
            {shouldOverlayHud ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: '0 0 auto 0',
                  zIndex: 4,
                  px: { xs: 2, sm: 3, md: 4, xl: 6 },
                  py: { xs: 2, md: 2.5 },
                }}
              >
                <MetaHud />
              </Box>
            ) : null}
          </Box>
        ) : (
          <Stack spacing={3}>
            <MetaHud />
            <ScreenRenderer />
          </Stack>
        )}
      </AppShell>
      <CharacterMenuModal />
    </>
  );
});

export default App;
