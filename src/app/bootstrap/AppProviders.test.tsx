import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import App from '../../App';
import { useGameRootStore } from '@app/providers/StoreProvider';
import { theme } from '@app/theme/theme';
import { GameRootStore } from '@engine/stores/GameRootStore';

import { AppProviders } from './AppProviders';

function ThemeProbe() {
  const activeTheme = useTheme();

  return <Typography>{activeTheme.palette.primary.main}</Typography>;
}

function StoreProbe() {
  const store = useGameRootStore();

  return <Typography>{store instanceof GameRootStore ? 'store-ready' : 'store-missing'}</Typography>;
}

describe('App bootstrap', () => {
  it('renders the app shell', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(screen.getByRole('heading', { name: /wey to heaven/i })).toBeInTheDocument();
    expect(screen.getByText(/main menu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Грати' })).toBeInTheDocument();
  });

  it('wraps children with the theme provider', () => {
    render(
      <AppProviders>
        <ThemeProbe />
      </AppProviders>,
    );

    expect(screen.getByText(theme.palette.primary.main)).toBeInTheDocument();
  });

  it('can instantiate the root store', () => {
    expect(new GameRootStore()).toBeInstanceOf(GameRootStore);

    render(
      <AppProviders>
        <StoreProbe />
      </AppProviders>,
    );

    expect(screen.getByText('store-ready')).toBeInTheDocument();
  });
});
