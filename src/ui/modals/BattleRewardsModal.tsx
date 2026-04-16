import { observer } from 'mobx-react-lite';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { ModalShell } from '@ui/components/shell/ModalShell';

export const BattleRewardsModal = observer(function BattleRewardsModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'battle-rewards';
  const summary = rootStore.progression.pendingBattleSummary;

  const handleClose = () => {
    if (rootStore.progression.hasUnresolvedLevelUps) {
      return;
    }

    rootStore.progression.clearBattleSummary();
    rootStore.ui.closeModal();
  };

  return (
    <ModalShell
      open={isOpen && summary !== null}
      onClose={handleClose}
      title={summary?.battleTitle ?? 'Battle Rewards'}
      subtitle={
        rootStore.progression.hasUnresolvedLevelUps
          ? 'Resolve every level-up choice before closing this summary.'
          : 'Loot, experience and level gains from the finished encounter.'
      }
      maxWidth="md"
      footer={
        <Button
          disabled={rootStore.progression.hasUnresolvedLevelUps}
          onClick={handleClose}
          variant="outlined"
        >
          Close
        </Button>
      }
    >
      {summary ? (
        <Stack spacing={1.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <PanelSection title="Loot">
              <Stack spacing={0.7}>
                {summary.loot.length > 0 ? (
                  summary.loot.map((entry) => (
                    <Stack
                      key={`${entry.itemId}-${entry.quantity}`}
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography>{entry.itemName}</Typography>
                      <Chip label={`x${entry.quantity}`} size="small" variant="outlined" />
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No item rewards were claimed from this fight.
                  </Typography>
                )}
              </Stack>
            </PanelSection>

            <PanelSection title="Experience">
              <Stack spacing={0.7}>
                {summary.experience.length > 0 ? (
                  summary.experience.map((entry) => (
                    <Box key={entry.unitId}>
                      <Typography>{entry.unitName}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        +{entry.amount} XP | Level {entry.levelBefore} {'->'} {entry.levelAfter}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No experience was awarded for this encounter.
                  </Typography>
                )}
              </Stack>
            </PanelSection>
          </Stack>

          <PanelSection title="Level-Up Choices">
            <Stack spacing={1}>
              {summary.levelUps.length > 0 ? (
                summary.levelUps.map((entry) => (
                  <Stack
                    key={entry.id}
                    spacing={0.8}
                    sx={{
                      border: '1px solid rgba(238, 245, 251, 0.08)',
                      borderRadius: 1.5,
                      px: 1,
                      py: 0.9,
                    }}
                  >
                    <Stack
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography>{entry.unitName}</Typography>
                      <Chip
                        color={entry.resolvedChoiceId ? 'success' : 'warning'}
                        label={
                          entry.resolvedChoiceId
                            ? `Level ${entry.nextLevel} ready`
                            : `Choose for level ${entry.nextLevel}`
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {entry.choices.map((choice) => (
                        <Button
                          key={choice.id}
                          disabled={entry.resolvedChoiceId !== null}
                          onClick={() => rootStore.progression.applyLevelUpChoice(entry.id, choice.id)}
                          size="small"
                          variant={entry.resolvedChoiceId === choice.id ? 'contained' : 'outlined'}
                        >
                          {choice.label}
                        </Button>
                      ))}
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {entry.resolvedChoiceId
                        ? entry.choices.find((choice) => choice.id === entry.resolvedChoiceId)
                            ?.description
                        : 'Pick one permanent reward for this level before leaving the summary.'}
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No one gained a level from this battle.
                </Typography>
              )}
            </Stack>
          </PanelSection>
        </Stack>
      ) : null}
    </ModalShell>
  );
});
