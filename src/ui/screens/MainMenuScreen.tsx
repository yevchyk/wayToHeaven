import { observer } from 'mobx-react-lite';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { SectionCard } from '@ui/components/SectionCard';

const menuEntries = [
  {
    id: 'login',
    label: 'Вхід у гру',
    icon: <LoginRoundedIcon />,
    enabled: false,
    description: 'Окремий flow авторизації або продовження буде підключено пізніше.',
  },
  {
    id: 'play',
    label: 'Грати',
    icon: <PlayArrowRoundedIcon />,
    enabled: true,
    description: 'Запускає поточний стартовий loop: пролог, подорож, діалоги й бій.',
  },
  {
    id: 'settings',
    label: 'Налаштування',
    icon: <SettingsRoundedIcon />,
    enabled: false,
    description: 'Меню конфігурації звуку, інтерфейсу та гри буде додане окремою фазою.',
  },
  {
    id: 'saves',
    label: 'Збереження',
    icon: <SaveRoundedIcon />,
    enabled: false,
    description: 'Save/load pipeline ще не реалізований, але пункт уже зарезервовано.',
  },
  {
    id: 'exit',
    label: 'Вийти',
    icon: <PowerSettingsNewRoundedIcon />,
    enabled: false,
    description: 'Нормальний вихід з гри буде окремо, коли зʼявиться platform-specific shell.',
  },
] as const;

export const MainMenuScreen = observer(function MainMenuScreen() {
  const rootStore = useGameRootStore();

  return (
    <Stack spacing={3.5}>
      <SectionCard
        eyebrow="Main Menu"
        subtitle="Стартовий shell для гри. Поки активний тільки пункт «Грати»."
        title="Wey To Heaven"
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Box
            sx={{
              flex: 1.05,
              minHeight: { xs: 220, md: 320 },
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 3,
              border: '1px solid rgba(201, 164, 92, 0.18)',
              background:
                'radial-gradient(circle at 18% 22%, rgba(201, 164, 92, 0.16), transparent 26%), radial-gradient(circle at 72% 16%, rgba(111, 179, 210, 0.14), transparent 24%), linear-gradient(135deg, rgba(13, 16, 25, 0.9), rgba(31, 21, 18, 0.92))',
            }}
          >
            <Stack justifyContent="space-between" spacing={3} sx={{ height: '100%' }}>
              <Stack spacing={1.5}>
                <Chip
                  label="Chapter 1 Build"
                  sx={{ alignSelf: 'flex-start' }}
                  variant="outlined"
                />
                <Typography variant="h3">Темний шлях уже відкрито.</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 560 }} variant="body1">
                  Натискання на «Грати» запускає поточний стартовий сценарій: пролог, міський
                  hub, зовнішню навігацію, dialogue scenes, перший бій і character menu поверх
                  runtime engine.
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                Інші пункти меню вже закладені в shell, але їхня функціональність буде
                підключена наступними фазами.
              </Typography>
            </Stack>
          </Box>

          <Stack spacing={1.25} sx={{ flex: 0.95 }}>
            {menuEntries.map((entry) => (
              <Button
                aria-label={entry.label}
                key={entry.id}
                disabled={!entry.enabled}
                fullWidth
                onClick={entry.id === 'play' ? () => rootStore.startNewGame() : undefined}
                size="large"
                startIcon={entry.icon}
                sx={{
                  justifyContent: 'space-between',
                  px: 2.25,
                  py: 1.5,
                  borderRadius: 2.5,
                  textAlign: 'left',
                }}
                variant={entry.enabled ? 'contained' : 'outlined'}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <Stack spacing={0.35} sx={{ alignItems: 'flex-start' }}>
                    <Typography component="span" sx={{ fontWeight: 700 }} variant="button">
                      {entry.label}
                    </Typography>
                    <Typography
                      color={entry.enabled ? 'inherit' : 'text.secondary'}
                      component="span"
                      sx={{ opacity: entry.enabled ? 0.86 : 1 }}
                      variant="caption"
                    >
                      {entry.description}
                    </Typography>
                  </Stack>
                  {!entry.enabled ? <Chip label="Скоро" size="small" variant="outlined" /> : null}
                </Stack>
              </Button>
            ))}
          </Stack>
        </Stack>
      </SectionCard>
      <SectionCard
        eyebrow="Runtime Status"
        title="Поточний фундамент"
      >
        <Stack spacing={1}>
          <Typography color="text.secondary" variant="body2">
            Працюють dialogue engine, world navigation, travel board traversal, queue-based battle,
            inventory, status/tag systems і character-centric menu.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            UI shell, як і раніше, тільки читає store state і викликає runtime methods. Ніяка
            бойова чи effect-логіка не переноситься в компоненти.
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  );
});
