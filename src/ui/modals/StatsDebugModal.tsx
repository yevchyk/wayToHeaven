import { observer } from 'mobx-react-lite';
import { alpha } from '@mui/material/styles';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { PROFILE_LABELS } from '@ui/components/character-menu/narrativeProfileLabels';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';

function formatStatChangeDelta(previousValue: number, nextValue: number) {
  const delta = nextValue - previousValue;

  if (delta === 0) {
    return 'No value change';
  }

  return delta > 0 ? `+${delta}` : `${delta}`;
}

function formatStatChangeSource(source: string) {
  switch (source) {
    case 'changeStat':
    case 'changeProfile':
      return 'Delta effect';
    case 'setStat':
    case 'setProfile':
      return 'Set effect';
    case 'unlockStat':
    case 'unlockProfile':
      return 'Unlock effect';
    default:
      return source;
  }
}

export const StatsDebugModal = observer(function StatsDebugModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'stats-debug';
  const visibleProfileKeys = rootStore.profile.unlockedProfileIds;
  const statChangeLog = rootStore.debug.statChangeLog;

  return (
    <ModalShell
      contentSx={{ minHeight: { xs: 0, md: 420 } }}
      maxWidth="lg"
      onClose={() => rootStore.ui.closeModal()}
      open={isOpen}
      subtitle="Поточні narrative stats і останні effect-driven зміни цієї сесії."
      title="Stats Debug"
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
        <Box sx={{ width: { xs: '100%', lg: '42%' }, minWidth: 0 }}>
          <PanelSection
            description="Поточні відкриті marker-статі героїні."
            title="Current Stats"
            tone="overlay"
          >
            {visibleProfileKeys.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Поки що жоден стат не відкритий у цій сесії.
              </Typography>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {visibleProfileKeys.map((key) => (
                  <Chip
                    key={key}
                    label={`${PROFILE_LABELS[key]} ${rootStore.profile.getProfileValue(key)}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </PanelSection>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: '58%' }, minWidth: 0 }}>
          <PanelSection
            description="Новіші зміни завжди зверху. Лог чиститься при reset runtime."
            title="Recent Changes"
            tone="accent"
          >
            {statChangeLog.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                У цій сесії ще не було effect-driven змін статів.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {statChangeLog.map((entry) => (
                  <Box
                    key={entry.id}
                    sx={{
                      px: 0.95,
                      py: 0.85,
                      borderRadius: 1.25,
                      border: `1px solid ${alpha('#eef4fb', 0.1)}`,
                      backgroundColor: alpha('#09111a', 0.34),
                    }}
                  >
                    <Stack
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={0.7}
                    >
                      <Stack spacing={0.2}>
                        <Typography sx={{ color: '#f3f7fb', fontSize: '0.96rem' }}>
                          {PROFILE_LABELS[entry.key]}
                        </Typography>
                        <Typography sx={{ color: alpha('#eef4fb', 0.54), fontSize: '0.74rem' }}>
                          {formatStatChangeSource(entry.source)}
                          {!entry.previousUnlocked && entry.nextUnlocked ? ' · unlocked' : ''}
                        </Typography>
                      </Stack>

                      <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.12}>
                        <Typography sx={{ color: '#f8fbff', fontSize: '0.9rem' }}>
                          {formatStatChangeDelta(entry.previousValue, entry.nextValue)}
                        </Typography>
                        <Typography sx={{ color: alpha('#eef4fb', 0.58), fontSize: '0.74rem' }}>
                          {entry.previousValue} {'->'} {entry.nextValue}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </PanelSection>
        </Box>
      </Stack>
    </ModalShell>
  );
});
