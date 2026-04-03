import { observer } from 'mobx-react-lite';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';

const menuEntries = [
  {
    id: 'login',
    label: 'Вхід у гру',
    enabled: false,
  },
  {
    id: 'play',
    label: 'Грати',
    enabled: true,
  },
  {
    id: 'settings',
    label: 'Налаштування',
    enabled: true,
  },
  {
    id: 'saves',
    label: 'Збереження',
    enabled: true,
  },
  {
    id: 'library',
    label: 'Бібліотека',
    enabled: true,
  },
  {
    id: 'exit',
    label: 'Вийти',
    enabled: false,
  },
] as const;

export const MainMenuScreen = observer(function MainMenuScreen() {
  const rootStore = useGameRootStore();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: 'min(100%, 440px)',
          alignItems: 'center',
        }}
      >
        <Stack spacing={0.8} sx={{ textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{
              color: '#fbf6ea',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: '2.4rem', md: '3.2rem' },
              lineHeight: 0.94,
              textShadow: '0 12px 34px rgba(0, 0, 0, 0.38)',
            }}
          >
            Wey To Heaven
          </Typography>
          <Typography sx={{ color: alpha('#f3efe7', 0.76), fontSize: '0.98rem' }}>
            Головне меню
          </Typography>
        </Stack>

        <Stack spacing={1.15} sx={{ width: '100%' }}>
          {menuEntries.map((entry) => (
            <Button
              aria-label={entry.label}
              key={entry.id}
              disabled={!entry.enabled}
              fullWidth
              onClick={
                entry.id === 'play'
                  ? () => rootStore.startNewGame()
                  : entry.id === 'settings'
                    ? () => rootStore.ui.openModal('preferences')
                    : entry.id === 'saves'
                      ? () => rootStore.ui.openModal('saves')
                      : entry.id === 'library'
                        ? () => rootStore.openLibrary('characters')
                    : undefined
              }
              size="large"
              sx={{
                minHeight: 58,
                justifyContent: 'center',
                borderRadius: 3,
                fontSize: '1rem',
                letterSpacing: '0.02em',
                backgroundColor: entry.enabled ? alpha('#c9a45c', 0.18) : 'transparent',
                borderColor: alpha('#c9a45c', entry.enabled ? 0.36 : 0.18),
                color: entry.enabled ? '#fbf6ea' : alpha('#f3efe7', 0.58),
                '&:hover': {
                  backgroundColor: entry.enabled ? alpha('#c9a45c', 0.24) : 'transparent',
                  borderColor: alpha('#c9a45c', entry.enabled ? 0.48 : 0.18),
                },
              }}
              variant={entry.enabled ? 'contained' : 'outlined'}
            >
              {entry.label}
            </Button>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ width: '100%' }}>
          <Button
            fullWidth
            onClick={() => rootStore.miniGameController.startMinigame('chapter-1/minigame/fishing/reed-bank')}
            variant="outlined"
          >
            Демо: рибалка
          </Button>
          <Button
            fullWidth
            onClick={() => rootStore.miniGameController.startMinigame('chapter-1/minigame/dance/lantern-step')}
            variant="outlined"
          >
            Демо: танці
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
});
