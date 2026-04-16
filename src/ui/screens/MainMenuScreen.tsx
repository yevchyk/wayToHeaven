import { observer } from 'mobx-react-lite';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { resolveContentImageUrl } from '@ui/components/character-composite/characterCompositeAssetResolver';

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

const heroineImageUrl = resolveContentImageUrl(
  null,
  'src/content/shared/placeholders/menu/menu-heroine.jpg',
);
const backgroundImageUrl = resolveContentImageUrl(
  null,
  'src/content/shared/placeholders/menu/menu-background.jpg',
);

function DemoEntry({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        minHeight: 42,
        borderRadius: 2,
        border: `1px solid ${alpha('#c2cde0', 0.18)}`,
        color: alpha('#f5efe2', 0.74),
        backgroundColor: alpha('#000000', 0.16),
        '&:hover': {
          backgroundColor: alpha('#000000', 0.24),
        },
      }}
      variant="text"
    >
      {label}
    </Button>
  );
}

export const MainMenuScreen = observer(function MainMenuScreen() {
  const rootStore = useGameRootStore();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0d12',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: '-5%',
          backgroundImage: backgroundImageUrl ? `url("${backgroundImageUrl}")` : 'none',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(18px) saturate(0.78) brightness(0.58)',
          transform: 'scale(1.08)',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(5, 7, 12, 0.42) 0%, rgba(5, 7, 12, 0.22) 28%, rgba(5, 7, 12, 0.58) 62%, rgba(5, 7, 12, 0.88) 100%),
            linear-gradient(180deg, rgba(10, 12, 18, 0.28) 0%, rgba(10, 12, 18, 0.54) 56%, rgba(10, 12, 18, 0.82) 100%)
          `,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(360px, 0.92fr) minmax(360px, 0.86fr)' },
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: { xs: 'none', lg: 'block' },
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              pl: { lg: 5, xl: 7 },
              pt: 6,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 'min(38vw, 560px)',
                height: 'min(86vh, 900px)',
                maxWidth: '100%',
                filter: 'drop-shadow(0 32px 54px rgba(0, 0, 0, 0.56))',
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  inset: '14% 12% 0',
                  borderRadius: '44% 44% 0 0 / 24% 24% 0 0',
                  background:
                    'radial-gradient(circle at 50% 22%, rgba(226, 206, 172, 0.28) 0%, rgba(226, 206, 172, 0.06) 24%, rgba(226, 206, 172, 0) 58%)',
                  filter: 'blur(24px)',
                }}
              />
              {heroineImageUrl ? (
                <Box
                  component="img"
                  alt="Menu heroine placeholder"
                  src={heroineImageUrl}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'left bottom',
                    WebkitMaskImage:
                      'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
                    maskImage:
                      'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 100%)',
                    opacity: 0.94,
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', lg: 'flex-end' },
            px: { xs: 2.2, sm: 3.2, md: 4.8, lg: 5.4, xl: 7.4 },
            py: { xs: 3.2, md: 4.4 },
          }}
        >
          <Stack
            spacing={{ xs: 2.2, md: 2.8 }}
            sx={{
              width: 'min(100%, 460px)',
              alignItems: { xs: 'stretch', lg: 'flex-start' },
            }}
          >
            <Stack spacing={1.1} sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
              <Typography
                component="p"
                sx={{
                  color: alpha('#f3e6c7', 0.74),
                  fontSize: '0.76rem',
                  letterSpacing: '0.34em',
                  textTransform: 'uppercase',
                }}
              >
                Way To Heaven
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: '#f7f1e5',
                  fontFamily: '"Spectral", Georgia, serif',
                  fontSize: { xs: '2.7rem', md: '4.5rem' },
                  fontWeight: 500,
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  textShadow: '0 18px 44px rgba(0, 0, 0, 0.42)',
                }}
              >
                Wey To Heaven
              </Typography>
              <Typography
                sx={{
                  color: alpha('#f3e6c7', 0.72),
                  fontSize: '0.74rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Головне меню
              </Typography>
              <Typography
                sx={{
                  maxWidth: 420,
                  color: alpha('#f6efe3', 0.78),
                  fontSize: { xs: '0.95rem', md: '1.02rem' },
                  lineHeight: 1.62,
                }}
              >
                Ліва частина сцени віддана героїні та атмосфері, а навігація зміщена праворуч.
                Унизу ми тримаємо короткі демо-входи, зокрема бойову лабораторію для перевірки
                портретів, аур і тактичних FX.
              </Typography>
            </Stack>

            <Stack spacing={1.05} sx={{ width: '100%' }}>
              {menuEntries.map((entry) => (
                <Button
                  key={entry.id}
                  aria-label={entry.label}
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
                    minHeight: 56,
                    justifyContent: 'flex-start',
                    px: 2.1,
                    borderRadius: 2.2,
                    fontSize: '0.96rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: `1px solid ${alpha('#dbc58b', entry.enabled ? 0.28 : 0.12)}`,
                    background: entry.enabled
                      ? `linear-gradient(90deg, ${alpha('#b68a44', 0.16)} 0%, ${alpha('#b68a44', 0.08)} 100%)`
                      : alpha('#000000', 0.14),
                    color: entry.enabled ? '#fbf6ea' : alpha('#f3efe7', 0.52),
                    boxShadow: entry.enabled ? '0 14px 28px rgba(0, 0, 0, 0.18)' : 'none',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: entry.enabled
                        ? `linear-gradient(90deg, ${alpha('#c59b57', 0.22)} 0%, ${alpha('#c59b57', 0.1)} 100%)`
                        : alpha('#000000', 0.14),
                      borderColor: alpha('#dbc58b', entry.enabled ? 0.38 : 0.12),
                    },
                  }}
                  variant="text"
                >
                  {entry.label}
                </Button>
              ))}
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              spacing={1}
              sx={{
                width: '100%',
                pt: 0.35,
              }}
            >
              <DemoEntry
                label="Демо: рибалка"
                onClick={() =>
                  rootStore.miniGameController.startMinigame('chapter-1/minigame/fishing/reed-bank')
                }
              />
              <DemoEntry
                label="Демо: танці"
                onClick={() =>
                  rootStore.miniGameController.startMinigame('chapter-1/minigame/dance/lantern-step')
                }
              />
              <Box sx={{ flexBasis: { sm: '100%' } }}>
                <DemoEntry
                  label="Демо: битва FX"
                  onClick={() => rootStore.startBattleVisualDemo()}
                />
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
});
