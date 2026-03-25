import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import BackpackOutlinedIcon from '@mui/icons-material/BackpackOutlined';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SportsKabaddiRoundedIcon from '@mui/icons-material/SportsKabaddiRounded';
import { Alert, Box, Button, Chip, Divider, List, ListItem, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { SectionCard } from '@ui/components/SectionCard';

function getPreferredSkillId(skillIds: readonly string[]) {
  return skillIds.find((skillId) => skillId !== 'basic-attack') ?? skillIds[0] ?? null;
}

export const BattleScreen = observer(function BattleScreen() {
  const rootStore = useGameRootStore();
  const { battle } = rootStore;

  useEffect(() => {
    if (battle.isEnemyTurn) {
      battle.runEnemyTurn();
    }
  }, [battle, battle.isEnemyTurn, battle.currentUnit?.unitId]);

  if (!battle.hasActiveBattle) {
    return (
      <SectionCard eyebrow="Battle" title="No Active Battle">
        <Typography color="text.secondary" variant="body2">
          Battle runtime is idle.
        </Typography>
      </SectionCard>
    );
  }

  const currentUnit = battle.currentUnit;
  const selectedAction = battle.selectedAction;
  const preferredSkillId = currentUnit ? getPreferredSkillId(currentUnit.skillIds) : null;
  const requiresTarget = selectedAction?.type === 'attack' || selectedAction?.type === 'skill';

  return (
    <Stack spacing={3}>
      <SectionCard
        eyebrow="Battle"
        subtitle={currentUnit ? `Current turn: ${currentUnit.name}` : null}
        title={battle.activeBattleRef ?? 'Battle'}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <Chip label={`Round ${battle.round}`} variant="outlined" />
          <Chip label={`Phase ${battle.phase}`} variant="outlined" />
          {selectedAction ? (
            <Chip label={`Selected ${selectedAction.type}`} color="primary" variant="outlined" />
          ) : null}
        </Stack>
      </SectionCard>

      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3}>
        <SectionCard eyebrow="Allies" title="Party Front">
          <Stack spacing={1.25}>
            {battle.allies.map((unit) => (
              <Box
                key={unit.unitId}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor:
                    battle.currentUnit?.unitId === unit.unitId
                      ? 'rgba(201, 164, 92, 0.12)'
                      : 'rgba(255,255,255,0.02)',
                }}
              >
                <Stack spacing={1}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between">
                    <Typography variant="h6">{unit.name}</Typography>
                    <Chip
                      color={unit.currentHp > 0 ? 'success' : 'default'}
                      label={unit.currentHp > 0 ? 'Ready' : 'Down'}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography color="text.secondary" variant="body2">
                    HP {unit.currentHp}/{unit.derivedStats.maxHp} | Mana {unit.currentMana}/
                    {unit.derivedStats.maxMana}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {rootStore.statusProcessor.getEffectiveTags(unit).map((tag) => (
                      <Chip key={`${unit.unitId}-${tag}`} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard eyebrow="Enemies" title="Opposition">
          <Stack spacing={1.25}>
            {battle.enemies.map((unit) => (
              <Button
                key={unit.unitId}
                data-testid={`battle-enemy-${unit.unitId}`}
                disabled={!battle.isAwaitingPlayerInput || !requiresTarget || unit.currentHp <= 0}
                onClick={() => {
                  if (!selectedAction) {
                    return;
                  }

                  battle.performPlayerAction(selectedAction.type, {
                    targetId: unit.unitId,
                    ...(selectedAction.type === 'skill' && selectedAction.skillId
                      ? { skillId: selectedAction.skillId }
                      : {}),
                  });
                }}
                sx={{
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                }}
                variant="outlined"
              >
                <span>{unit.name}</span>
                <Typography color="text.secondary" variant="caption">
                  HP {unit.currentHp}/{unit.derivedStats.maxHp}
                </Typography>
              </Button>
            ))}
          </Stack>
        </SectionCard>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <SectionCard eyebrow="Command" title="Battle Actions">
          {battle.phase === 'victory' || battle.phase === 'defeat' ? (
            <Alert
              action={
                <Button color="inherit" onClick={() => battle.endBattle()} size="small">
                  Leave Battlefield
                </Button>
              }
              severity={battle.phase === 'victory' ? 'success' : 'warning'}
            >
              {battle.phase === 'victory'
                ? 'The encounter is over. Claim the road and continue.'
                : 'The party is down. Leave the battlefield to recover the flow.'}
            </Alert>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1.25}>
              <Button
                disabled={!battle.isAwaitingPlayerInput}
                onClick={() => battle.selectAction('attack')}
                startIcon={<SportsKabaddiRoundedIcon />}
                variant="contained"
              >
                Attack
              </Button>
              <Button
                disabled={!battle.isAwaitingPlayerInput || !preferredSkillId}
                onClick={() =>
                  preferredSkillId ? battle.selectAction('skill', { skillId: preferredSkillId }) : null
                }
                startIcon={<AutoFixHighRoundedIcon />}
                variant="outlined"
              >
                Skill
              </Button>
              <Button
                disabled={!battle.isAwaitingPlayerInput}
                onClick={() => battle.performPlayerAction('defend')}
                startIcon={<ShieldOutlinedIcon />}
                variant="outlined"
              >
                Defend
              </Button>
              <Button
                onClick={() => rootStore.openCharacterMenu()}
                startIcon={<BackpackOutlinedIcon />}
                variant="text"
              >
                Character Menu
              </Button>
            </Stack>
          )}
          {battle.isAwaitingPlayerInput && requiresTarget ? (
            <Typography color="text.secondary" variant="body2">
              Select a target from the enemy list to confirm the action.
            </Typography>
          ) : null}
        </SectionCard>

        <SectionCard eyebrow="Combat Log" title="Recent Actions">
          <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
            {battle.combatLog.slice(-10).map((entry, index, entries) => (
              <Box key={entry.id}>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">{entry.message}</Typography>
                    <Typography color="text.secondary" variant="caption">
                      Round {entry.round} | {entry.type}
                    </Typography>
                  </Stack>
                </ListItem>
                {index < entries.length - 1 ? <Divider sx={{ opacity: 0.08 }} /> : null}
              </Box>
            ))}
          </List>
        </SectionCard>
      </Stack>
    </Stack>
  );
});
