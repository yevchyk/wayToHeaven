import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { Box, Stack } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { shellTokens } from '@ui/components/shell/shellTokens';
import { AppShell } from '@ui/layouts/AppShell';
import { BacklogModal } from '@ui/modals/BacklogModal';
import { CharacterMenuModal } from '@ui/modals/CharacterMenuModal';
import { LibraryModal } from '@ui/modals/LibraryModal';
import { PreferencesModal } from '@ui/modals/PreferencesModal';
import { QuestJournalModal } from '@ui/modals/QuestJournalModal';
import { SavesModal } from '@ui/modals/SavesModal';
import { StatsDebugModal } from '@ui/modals/StatsDebugModal';
import { MetaHud } from '@ui/components/MetaHud';
import { BrowserRuntimeConsoleBridge } from '@ui/components/debug/BrowserRuntimeConsoleBridge';
import { RuntimeDebugPanel } from '@ui/components/debug/RuntimeDebugPanel';
import { ScreenRenderer } from '@ui/components/ScreenRenderer';

const App = observer(function App() {
  const rootStore = useGameRootStore();
  const activeRuntimeLayer = rootStore.activeRuntimeLayer;
  const isImmersiveLayer =
    activeRuntimeLayer === 'dialogue' ||
    activeRuntimeLayer === 'city' ||
    activeRuntimeLayer === 'travelBoard' ||
    activeRuntimeLayer === 'minigame';
  const shouldOverlayHud = activeRuntimeLayer === 'city';
  const shouldRenderDebugPanel = import.meta.env.DEV && import.meta.env.MODE !== 'test';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'F6') {
        event.preventDefault();
        void rootStore.saves.quickSave();

        return;
      }

      if (event.key === 'F9') {
        event.preventDefault();

        if (rootStore.saves.hasQuickSave) {
          void rootStore.saves.quickLoad();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rootStore]);

  return (
    <>
      <AppShell mode={isImmersiveLayer ? 'immersive' : 'framed'}>
        {isImmersiveLayer ? (
          <Box sx={{ position: 'relative', height: '100%' }}>
            <ScreenRenderer />
            {shouldOverlayHud ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: '0 0 auto 0',
                  zIndex: 4,
                  px: shellTokens.spacing.shellX,
                  py: shellTokens.spacing.shellY,
                }}
              >
                <MetaHud />
              </Box>
            ) : null}
          </Box>
        ) : (
          <Stack spacing={0} sx={{ height: '100%', minHeight: 0 }}>
            <Box sx={{ px: shellTokens.spacing.shellX, pt: shellTokens.spacing.shellY }}>
              <MetaHud />
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: shellTokens.spacing.shellX,
                pt: { xs: 1, md: 1.2 },
                pb: shellTokens.spacing.shellY,
              }}
            >
              <ScreenRenderer />
            </Box>
          </Stack>
        )}
      </AppShell>
      <CharacterMenuModal />
      <LibraryModal />
      <QuestJournalModal />
      <BacklogModal />
      <PreferencesModal />
      <SavesModal />
      <StatsDebugModal />
      {shouldRenderDebugPanel ? <BrowserRuntimeConsoleBridge /> : null}
      {shouldRenderDebugPanel ? <RuntimeDebugPanel /> : null}
    </>
  );
});

export default App;
