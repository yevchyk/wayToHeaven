import type { PropsWithChildren } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { StoreProvider } from '@app/providers/StoreProvider';
import { theme } from '@app/theme/theme';
import type { GameRootStore } from '@engine/stores/GameRootStore';

interface AppProvidersProps extends PropsWithChildren {
  rootStore?: GameRootStore;
}

export function AppProviders({ children, rootStore }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider {...(rootStore ? { rootStore } : {})}>{children}</StoreProvider>
    </ThemeProvider>
  );
}
