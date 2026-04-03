import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import BackpackOutlinedIcon from '@mui/icons-material/BackpackOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SportsKabaddiRoundedIcon from '@mui/icons-material/SportsKabaddiRounded';
import { Alert, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { BattleUnitRuntime } from '@engine/types/unit';
import { SectionCard } from '@ui/components/SectionCard';
import { shellTokens } from '@ui/components/shell/shellTokens';

function getPreferredSkillId(skillIds: readonly string[]) {
  return skillIds.find((skillId) => skillId !== 'basic-attack') ?? skillIds[0] ?? null;
}

function ResourceMeter({
  current,
  max,
  label,
  tone,
}: {
  current: number;
  max: number;
  label: string;
  tone: 'hp' | 'mana';
}) {
  const ratio = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const fill =
    tone === 'hp'
      ? 'linear-gradient(90deg, rgba(188, 224, 203, 0.72) 0%, rgba(128, 186, 154, 0.82) 100%)'
      : 'linear-gradient(90deg, rgba(188, 214, 236, 0.68) 0%, rgba(126, 166, 196, 0.82) 100%)';

  return (
    <Stack spacing={0.35}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.76rem' }}>
          {current}/{max}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 7,
          overflow: 'hidden',
          borderRadius: 999,
          backgroundColor: alpha('#eef5fb', 0.08),
          border: `1px solid ${alpha('#eef5fb', 0.06)}`,
        }}
      >
        <Box
          sx={{
            width: `${ratio}%`,
            height: '100%',
            borderRadius: 999,
            background: fill,
          }}
        />
      </Box>
    </Stack>
  );
}

function CombatantCard({
  unit,
  isCurrent,
  isSelectable,
  isSelectedTarget,
  onSelect,
  tagLabels,
}: {
  unit: BattleUnitRuntime;
  isCurrent: boolean;
  isSelectable: boolean;
  isSelectedTarget: boolean;
  onSelect?: () => void;
  tagLabels: string[];
}) {
  const statusLabels = unit.statuses.map((status) => `${status.type} ${status.remainingDuration}`);
  const stateLabel = unit.currentHp > 0 ? (unit.isDefending ? 'Guarding' : 'Ready') : 'Down';

  return (
    <Box
      sx={{
        p: 1.05,
        borderRadius: shellTokens.radius.sm,
        border: isSelectedTarget
          ? `1px solid ${alpha('#eef5fb', 0.34)}`
          : isCurrent
            ? `1px solid ${alpha('#eef5fb', 0.22)}`
            : `1px solid ${alpha('#eef5fb', 0.1)}`,
        background: isSelectedTarget
          ? 'linear-gradient(180deg, rgba(234, 241, 248, 0.12) 0%, rgba(88, 116, 140, 0.16) 100%)'
          : isCurrent
            ? 'linear-gradient(180deg, rgba(23, 31, 42, 0.82) 0%, rgba(13, 18, 25, 0.88) 100%)'
            : 'linear-gradient(180deg, rgba(11, 16, 23, 0.62) 0%, rgba(9, 13, 19, 0.76) 100%)',
        boxShadow: shellTokens.shadow.inset,
      }}
    >
      <Stack spacing={0.8}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.15} sx={{ minWidth: 0 }}>
            <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.92rem' }}>
              {unit.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Level {unit.level} • Init {unit.derivedStats.initiative}
            </Typography>
          </Stack>
          <Chip label={stateLabel} size="small" variant="outlined" />
        </Stack>

        <ResourceMeter current={unit.currentHp} label="HP" max={unit.derivedStats.maxHp} tone="hp" />
        <ResourceMeter current={unit.currentMana} label="Mana" max={unit.derivedStats.maxMana} tone="mana" />

        <Stack direction="row" flexWrap="wrap" gap={0.55}>
          <Chip label={`Atk ${unit.derivedStats.physicalAttack}`} size="small" variant="outlined" />
          <Chip label={`Armor ${unit.derivedStats.armor}`} size="small" variant="outlined" />
          <Chip label={`Res ${unit.derivedStats.resistance}`} size="small" variant="outlined" />
        </Stack>

        {statusLabels.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={0.55}>
            {statusLabels.map((label) => (
              <Chip key={`${unit.unitId}-${label}`} label={label} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : null}

        {tagLabels.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={0.55}>
            {tagLabels.slice(0, 4).map((label) => (
              <Chip key={`${unit.unitId}-${label}`} label={label} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : null}

        {onSelect ? (
          <Button
            data-testid={`battle-enemy-${unit.unitId}`}
            disabled={!isSelectable || unit.currentHp <= 0}
            onClick={onSelect}
            sx={{ justifyContent: 'space-between' }}
            variant={isSelectedTarget ? 'contained' : 'outlined'}
          >
            <span>{isSelectedTarget ? 'Selected target' : 'Target enemy'}</span>
            <Typography color="text.secondary" variant="caption">
              {unit.currentHp > 0 ? 'Confirm' : 'Unavailable'}
            </Typography>
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

function getActionLabel(action: ReturnType<typeof useGameRootStore>['battle']['selectedAction']) {
  if (!action) {
    return 'No action selected';
  }

  if (action.type === 'skill' && action.skillId) {
    return `Skill • ${action.skillId}`;
  }

  return action.type;
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
  const queueUnits = battle.turnQueue
    .map((unitId) => battle.allUnits.find((unit) => unit.unitId === unitId) ?? battle.enemies.find((unit) => unit.unitId === unitId) ?? null)
    .filter((unit): unit is BattleUnitRuntime => unit !== null)
    .slice(0, 6);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top, rgba(243, 247, 251, 0.08) 0%, rgba(243, 247, 251, 0) 20%), linear-gradient(180deg, rgba(10, 14, 20, 0.12) 0%, rgba(10, 14, 20, 0.18) 34%, rgba(10, 14, 20, 0.38) 100%)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        spacing={1.2}
        sx={{
          position: 'relative',
          px: { xs: 1, md: 1.4 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        <SectionCard
          action={
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              <Chip label={`Round ${battle.round}`} size="small" variant="outlined" />
              <Chip label={`Phase ${battle.phase}`} size="small" variant="outlined" />
              <Chip label={getActionLabel(selectedAction)} size="small" variant="outlined" />
            </Stack>
          }
          eyebrow="Battlefield"
          subtitle={currentUnit ? `Current turn: ${currentUnit.name}` : 'The encounter is waiting for the next resolver step.'}
          title={battle.activeBattleRef ?? 'Battle'}
        >
          <Typography color="text.secondary" variant="body2">
            The combat shell stays dense and readable: unit state, command intent and turn pressure all remain visible without collapsing into a debug table.
          </Typography>
        </SectionCard>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.2}>
          <SectionCard eyebrow="Allies" title="Party Front">
            <Stack spacing={0.9}>
              {battle.allies.map((unit) => (
                <CombatantCard
                  key={unit.unitId}
                  isCurrent={battle.currentUnit?.unitId === unit.unitId}
                  isSelectable={false}
                  isSelectedTarget={false}
                  tagLabels={rootStore.statusProcessor.getEffectiveTags(unit)}
                  unit={unit}
                />
              ))}
            </Stack>
          </SectionCard>

          <Stack spacing={1.2} sx={{ width: { xs: '100%', xl: '34%' }, minWidth: 0 }}>
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
                <Stack spacing={1}>
                  <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} flexWrap="wrap" gap={0.9}>
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

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: shellTokens.radius.sm,
                      border: `1px solid ${alpha('#eef5fb', 0.1)}`,
                      backgroundColor: alpha('#0d131a', 0.22),
                    }}
                  >
                    <Stack spacing={0.35}>
                      <Typography
                        sx={{
                          color: alpha('#eef5fb', 0.56),
                          fontSize: '0.68rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Action Intent
                      </Typography>
                      <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.88rem' }}>
                        {getActionLabel(selectedAction)}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {battle.isAwaitingPlayerInput && requiresTarget
                          ? 'Select a target from the enemy rail to commit the current action.'
                          : currentUnit
                            ? `${currentUnit.name} controls the current resolver step.`
                            : 'Waiting for the next turn owner.'}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </SectionCard>

            <SectionCard eyebrow="Pressure" title="Turn Queue">
              <Stack spacing={0.7}>
                {queueUnits.length > 0 ? (
                  queueUnits.map((unit, index) => (
                    <Box
                      key={`${unit.unitId}-${index}`}
                      sx={{
                        px: 1,
                        py: 0.8,
                        borderRadius: shellTokens.radius.sm,
                        border: `1px solid ${alpha('#eef5fb', index === 0 ? 0.18 : 0.08)}`,
                        backgroundColor: index === 0 ? alpha('#eef5fb', 0.08) : alpha('#0d131a', 0.18),
                      }}
                    >
                      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.82rem' }}>
                          {unit.name}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                          {index === 0 ? 'Now' : `+${index}`}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No queued units remain. The resolver is about to rebuild order or close the encounter.
                  </Typography>
                )}
              </Stack>
            </SectionCard>
          </Stack>

          <SectionCard eyebrow="Enemies" title="Opposition">
            <Stack spacing={0.9}>
              {battle.enemies.map((unit) => (
                <CombatantCard
                  key={unit.unitId}
                  isCurrent={battle.currentUnit?.unitId === unit.unitId}
                  isSelectable={battle.isAwaitingPlayerInput && Boolean(requiresTarget)}
                  isSelectedTarget={battle.selectedTargetId === unit.unitId}
                  onSelect={() => {
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
                  tagLabels={rootStore.statusProcessor.getEffectiveTags(unit)}
                  unit={unit}
                />
              ))}
            </Stack>
          </SectionCard>
        </Stack>

        <SectionCard eyebrow="Combat Log" title="Recent Actions">
          <Stack divider={<Divider sx={{ opacity: 0.08 }} flexItem />} spacing={0}>
            {battle.combatLog.slice(-10).map((entry) => (
              <Box key={entry.id} sx={{ py: 0.85 }}>
                <Stack spacing={0.2}>
                  <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.88rem' }}>
                    {entry.message}
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    Round {entry.round} • {entry.type}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </Stack>
    </Box>
  );
});
