import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { observer } from 'mobx-react-lite';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import BackpackOutlinedIcon from '@mui/icons-material/BackpackOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SportsKabaddiRoundedIcon from '@mui/icons-material/SportsKabaddiRounded';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { skillUsesTarget } from '@engine/formulas/damage';
import type { BattleUnitRuntime } from '@engine/types/unit';
import type { BattleAuraPreset } from '@engine/types/unit';
import { BattleStagePreview } from '@ui/components/battle/BattleStagePreview';
import type { StageImpactCue } from '@ui/components/battle/BattleStagePreview';
import {
  BattleAuraOverlay,
  inferBattleActionAura,
  inferBattleStatusAura,
  resolveBattlePortraitUrl,
} from '@ui/components/battle/battleVisuals';
import { ScreenFrame } from '@ui/components/primitives/ScreenFrame';
import { StatusStrip } from '@ui/components/primitives/StatusStrip';
import { SystemAction } from '@ui/components/primitives/SystemAction';
import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';
import { resolveCorruptionSkin } from '@ui/components/shell/corruptionSkins';

function getPreferredSkillId(skillIds: readonly string[]) {
  return skillIds.find((skillId) => skillId !== 'basic-attack') ?? skillIds[0] ?? null;
}

function ResourceMeter({
  current,
  max,
  label,
  tone,
  skin,
}: {
  current: number;
  max: number;
  label: string;
  tone: 'hp' | 'mana';
  skin: CorruptionSkin;
}) {
  const ratio = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const fill =
    tone === 'hp'
      ? `linear-gradient(90deg, ${alpha('#bfe1cb', 0.9)} 0%, ${alpha('#7dc198', 0.9)} 100%)`
      : `linear-gradient(90deg, ${alpha('#bfd7ef', 0.88)} 0%, ${alpha('#7aa4cb', 0.92)} 100%)`;

  return (
    <Stack spacing={0.28}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            color: alpha(skin.text.muted, 0.95),
            fontSize: '0.66rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ color: skin.text.secondary, fontSize: '0.74rem' }}>
          {current}/{max}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 7,
          overflow: 'hidden',
          borderRadius: 999,
          border: `1px solid ${alpha(skin.frame.border, 0.7)}`,
          backgroundColor: alpha('#000000', 0.24),
        }}
      >
        <Box
          sx={{
            width: `${ratio}%`,
            height: '100%',
            borderRadius: 999,
            background: fill,
            boxShadow: `0 0 18px ${alpha(tone === 'hp' ? '#7dc198' : '#7aa4cb', 0.18)}`,
          }}
        />
      </Box>
    </Stack>
  );
}

function BattleMark({
  label,
  skin,
  tone = 'default',
}: {
  label: string;
  skin: CorruptionSkin;
  tone?: 'default' | 'danger' | 'focus';
}) {
  const borderColor =
    tone === 'danger'
      ? alpha('#d89393', 0.55)
      : tone === 'focus'
        ? alpha(skin.frame.accent, 0.52)
        : alpha(skin.frame.border, 0.9);
  const background =
    tone === 'danger'
      ? alpha('#5a1e1e', 0.34)
      : tone === 'focus'
        ? alpha(skin.frame.accent, 0.14)
        : alpha('#000000', 0.18);

  return (
    <Box
      sx={{
        px: 0.72,
        py: 0.34,
        borderRadius: 1.3,
        border: `1px solid ${borderColor}`,
        background,
      }}
    >
      <Typography
        sx={{
          color: skin.text.secondary,
          fontSize: '0.66rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function BattleCommand({
  label,
  detail,
  skin,
  active = false,
  disabled = false,
  onClick,
  icon,
}: {
  label: string;
  detail: string;
  skin: CorruptionSkin;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <ButtonBase
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      sx={{
        minHeight: 72,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        borderRadius: 2,
        textAlign: 'left',
        border: `1px solid ${active ? skin.frame.borderStrong : skin.frame.border}`,
        background: active
          ? `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.18)} 0%, ${alpha(
              skin.frame.accent,
              0.08,
            )} 100%)`
          : `linear-gradient(180deg, ${alpha('#000000', 0.24)} 0%, ${alpha('#000000', 0.34)} 100%)`,
        boxShadow: active ? `0 0 0 1px ${alpha(skin.frame.accent, 0.12)}` : 'none',
        '&:hover': {
          background: `linear-gradient(180deg, ${alpha(skin.frame.accent, 0.18)} 0%, ${alpha(
            skin.frame.accent,
            0.08,
          )} 100%)`,
        },
        '&:disabled': {
          opacity: 0.42,
        },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ width: '100%', px: 1.05, py: 0.95 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1.5,
            border: `1px solid ${alpha(skin.frame.borderStrong, 0.72)}`,
            backgroundColor: alpha('#000000', 0.22),
            color: skin.text.primary,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.2} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: skin.text.primary,
              fontSize: '0.86rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          <Typography
            aria-hidden="true"
            sx={{ color: skin.text.muted, fontSize: '0.74rem', lineHeight: 1.35 }}
          >
            {detail}
          </Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

function CombatantCard({
  unit,
  skin,
  roleLabel,
  isCurrent,
  isSelectable,
  isSelectedTarget,
  onSelect,
  selectionLabel,
  showDangerAccent = false,
  portraitUrl,
  auraKind,
}: {
  unit: BattleUnitRuntime;
  skin: CorruptionSkin;
  roleLabel: string;
  isCurrent: boolean;
  isSelectable: boolean;
  isSelectedTarget: boolean;
  onSelect?: (() => void) | undefined;
  selectionLabel?: string | undefined;
  showDangerAccent?: boolean;
  portraitUrl: string | null;
  auraKind?: BattleAuraPreset | null;
}) {
  const stateLabel = unit.currentHp > 0 ? (unit.isDefending ? 'Guarding' : 'Ready') : 'Down';
  const statusLabels = unit.statuses.map((status) => `${status.type} ${status.remainingDuration}`);

  return (
    <ScreenFrame
      mode="tactical"
      skin={skin}
      sx={{
        p: 0.95,
        background: showDangerAccent
          ? `linear-gradient(180deg, ${alpha('#2a1010', 0.34)} 0%, ${skin.surface.panelStrong} 100%)`
          : skin.surface.panelStrong,
        borderColor: isSelectedTarget
          ? skin.frame.borderStrong
          : isCurrent
            ? alpha(skin.frame.accent, 0.8)
            : skin.frame.border,
      }}
    >
      <Stack spacing={0.8}>
        <Stack direction="row" spacing={0.9} sx={{ alignItems: 'stretch' }}>
          <Box
            sx={{
              position: 'relative',
              width: 84,
              minWidth: 84,
              borderRadius: 1.75,
              overflow: 'hidden',
              border: `1px solid ${alpha(
                isSelectedTarget ? skin.frame.borderStrong : skin.frame.border,
                0.92,
              )}`,
              background: `linear-gradient(180deg, ${alpha('#140f0f', 0.42)} 0%, ${alpha(
                '#060708',
                0.76,
              )} 100%)`,
            }}
          >
            {portraitUrl ? (
              <Box
                component="img"
                alt=""
                src={portraitUrl}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  minHeight: 110,
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  filter: showDangerAccent ? 'saturate(0.84) contrast(1.04)' : 'saturate(0.88)',
                }}
              />
            ) : (
              <Box
                sx={{
                  minHeight: 110,
                  display: 'grid',
                  placeItems: 'center',
                  color: alpha(skin.text.primary, 0.68),
                  fontSize: '0.82rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {unit.name}
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 28%, rgba(0,0,0,0.4) 100%)',
              }}
            />
            {auraKind ? (
              <BattleAuraOverlay
                intensity={isCurrent || isSelectedTarget ? 'focus' : 'normal'}
                kind={auraKind}
              />
            ) : null}
          </Box>

          <Stack spacing={0.72} sx={{ flex: 1, minWidth: 0 }}>
            <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1}>
              <Stack spacing={0.15} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: alpha(skin.text.muted, 0.95),
                    fontSize: '0.66rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {roleLabel}
                </Typography>
                <Typography sx={{ color: skin.text.primary, fontSize: '1rem' }}>{unit.name}</Typography>
                <Typography sx={{ color: skin.text.secondary, fontSize: '0.76rem' }}>
                  Level {unit.level} | Initiative {unit.derivedStats.initiative}
                </Typography>
              </Stack>
              <BattleMark
                label={stateLabel}
                skin={skin}
                tone={isSelectedTarget ? 'focus' : unit.currentHp > 0 ? 'default' : 'danger'}
              />
            </Stack>

            <ResourceMeter current={unit.currentHp} label="Blood" max={unit.derivedStats.maxHp} skin={skin} tone="hp" />
            <ResourceMeter
              current={unit.currentMana}
              label="Will"
              max={unit.derivedStats.maxMana}
              skin={skin}
              tone="mana"
            />

            <Stack direction="row" flexWrap="wrap" gap={0.55}>
              <BattleMark label={`Power ${unit.derivedStats.physicalAttack}`} skin={skin} />
              <BattleMark label={`Guard ${unit.derivedStats.armor}`} skin={skin} />
              <BattleMark label={`Ward ${unit.derivedStats.resistance}`} skin={skin} />
            </Stack>
          </Stack>
        </Stack>

        {statusLabels.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={0.55}>
            {statusLabels.map((label) => (
              <BattleMark key={`${unit.unitId}-${label}`} label={label} skin={skin} tone="danger" />
            ))}
          </Stack>
        ) : null}

        {onSelect ? (
          <ButtonBase
            data-testid={`battle-target-${unit.unitId}`}
            disabled={!isSelectable || unit.currentHp <= 0}
            onClick={onSelect}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 0.95,
              py: 0.72,
              borderRadius: 1.6,
              border: `1px solid ${isSelectedTarget ? skin.frame.borderStrong : skin.frame.border}`,
              background: isSelectedTarget
                ? alpha(skin.frame.accent, 0.16)
                : alpha('#000000', 0.18),
              '&:hover': {
                background: alpha(skin.frame.accent, 0.14),
              },
              '&:disabled': {
                opacity: 0.42,
              },
            }}
          >
            <Typography
              sx={{
                color: skin.text.primary,
                fontSize: '0.76rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {isSelectedTarget ? 'Target Locked' : selectionLabel ?? 'Select target'}
            </Typography>
            <Typography sx={{ color: skin.text.muted, fontSize: '0.72rem' }}>
              {unit.currentHp > 0 ? 'Commit' : 'Unavailable'}
            </Typography>
          </ButtonBase>
        ) : null}
      </Stack>
    </ScreenFrame>
  );
}

function TurnRibbon({
  units,
  currentUnitId,
  skin,
}: {
  units: BattleUnitRuntime[];
  currentUnitId: string | null;
  skin: CorruptionSkin;
}) {
  if (units.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.7}>
      {units.map((unit, index) => (
        <Box
          key={`${unit.unitId}-${index}`}
          sx={{
            minWidth: 104,
            px: 0.9,
            py: 0.68,
            borderRadius: 1.6,
            border: `1px solid ${
              unit.unitId === currentUnitId ? alpha(skin.frame.borderStrong, 0.96) : alpha(skin.frame.border, 0.92)
            }`,
            background:
              unit.unitId === currentUnitId
                ? alpha(skin.frame.accent, 0.16)
                : alpha('#000000', 0.18),
          }}
        >
          <Typography
            sx={{
              color: skin.text.primary,
              fontSize: '0.76rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {index === 0 ? 'Now' : `Then +${index}`}
          </Typography>
          <Typography sx={{ color: skin.text.secondary, fontSize: '0.78rem', mt: 0.2 }}>
            {unit.name}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function getActionLabel(
  rootStore: ReturnType<typeof useGameRootStore>,
  action: ReturnType<typeof useGameRootStore>['battle']['selectedAction'],
) {
  if (!action) {
    return 'Choose a command';
  }

  if (action.type === 'skill' && action.skillId) {
    return rootStore.getSkillById(action.skillId)?.name ?? action.skillId;
  }

  if (action.type === 'item' && action.itemId) {
    return rootStore.inventory.inspectItem(action.itemId)?.name ?? action.itemId;
  }

  return action.type === 'attack' ? 'Basic attack' : action.type;
}

export const BattleScreen = observer(function BattleScreen() {
  const rootStore = useGameRootStore();
  const { battle } = rootStore;
  const corruptionSkin = resolveCorruptionSkin(rootStore.profile.getProfileValue('corruption'));
  const [sandboxAuraPreview, setSandboxAuraPreview] = useState<Record<string, BattleAuraPreset>>({});

  useEffect(() => {
    if (battle.isEnemyTurn) {
      battle.runEnemyTurn();
    }
  }, [battle, battle.isEnemyTurn, battle.currentUnit?.unitId]);

  useEffect(() => {
    setSandboxAuraPreview({});
  }, [battle.activeBattleId]);

  if (!battle.hasActiveBattle) {
    return (
      <ScreenFrame
        mode="tactical"
        skin={corruptionSkin}
        sx={{ p: { xs: 1.2, md: 1.4 }, m: { xs: 1, md: 1.4 } }}
      >
        <Stack spacing={0.55}>
          <Typography
            sx={{
              color: alpha(corruptionSkin.text.muted, 0.95),
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Tactical Mode
          </Typography>
          <Typography sx={{ color: corruptionSkin.text.primary, fontSize: '1.18rem' }}>
            No Active Battle
          </Typography>
          <Typography sx={{ color: corruptionSkin.text.secondary, fontSize: '0.9rem' }}>
            The battlefield is quiet. Start an encounter to wake the tactical shell.
          </Typography>
        </Stack>
      </ScreenFrame>
    );
  }

  const currentUnit = battle.currentUnit;
  const selectedAction = battle.selectedAction;
  const preferredSkillId = currentUnit ? getPreferredSkillId(currentUnit.skillIds) : null;
  const preferredItemEntry = battle.preferredItemEntry;
  const battleItemEntries = rootStore.inventory.battleUsableEntries;
  const requiresTarget = battle.selectedActionRequiresTarget;
  const targetSide = battle.selectedActionTargetSide;
  const actionPreviewTargetSide =
    targetSide ??
    (selectedAction?.type === 'skill'
      ? battle.selectedSkill?.targetPattern === 'all-enemies'
        ? 'enemy'
        : battle.selectedSkill?.targetPattern === 'self'
          ? currentUnit?.side ?? null
          : null
      : selectedAction?.type === 'item' && battle.selectedItem?.targetScope === 'self'
        ? currentUnit?.side ?? null
        : null);
  const queueUnits = battle.turnQueue
    .map((unitId) => battle.allUnits.find((unit) => unit.unitId === unitId) ?? null)
    .filter((unit): unit is BattleUnitRuntime => unit !== null)
    .slice(0, 6);
  const summaryItems = [
    { label: 'Round', value: String(battle.round) },
    { label: 'Phase', value: battle.phase },
    { label: 'Current', value: currentUnit?.name ?? 'Awaiting resolver' },
  ];
  const isVisualLab = battle.activeBattleRef === 'battle-visual-lab';
  const actionAuraKind = inferBattleActionAura(rootStore, selectedAction);
  const previewTargetUnitIds =
    actionAuraKind && selectedAction
      ? selectedAction.type === 'skill' && battle.selectedSkill?.targetPattern === 'all-enemies'
        ? battle.livingEnemies.map((unit) => unit.unitId)
        : selectedAction.type === 'skill' && battle.selectedSkill?.targetPattern === 'self'
          ? currentUnit
            ? [currentUnit.unitId]
            : []
          : battle.selectedTargetId
            ? [battle.selectedTargetId]
            : []
      : [];
  const previewSourceUnitId = actionAuraKind && currentUnit ? currentUnit.unitId : null;
  const sandboxTargetUnitId = battle.selectedTargetId ?? battle.livingEnemies[0]?.unitId ?? null;

  const applySandboxAura = (unitId: string | null, auraKind: BattleAuraPreset) => {
    if (!unitId) {
      return;
    }

    setSandboxAuraPreview((currentPreview) => ({
      ...currentPreview,
      [unitId]: auraKind,
    }));
  };

  const clearSandboxAuras = () => {
    setSandboxAuraPreview({});
  };

  const getCombatantAura = (unit: BattleUnitRuntime) => {
    const sandboxAura = sandboxAuraPreview[unit.unitId];

    if (sandboxAura) {
      return sandboxAura;
    }

    if (actionAuraKind && (unit.unitId === previewSourceUnitId || previewTargetUnitIds.includes(unit.unitId))) {
      return actionAuraKind;
    }

    return inferBattleStatusAura(unit);
  };
  const leadAlly =
    (currentUnit?.side === 'ally' ? currentUnit : null) ??
    battle.livingAllies[0] ??
    battle.allies[0] ??
    null;
  const leadEnemy =
    (currentUnit?.side === 'enemy' ? currentUnit : null) ??
    battle.livingEnemies[0] ??
    battle.enemies[0] ??
    null;
  const latestStageEntry =
    battle.combatLog
      .slice()
      .reverse()
      .find((entry) => entry.type !== 'system' && entry.type !== 'outcome') ?? null;
  const sourceUnitForEntry = latestStageEntry?.sourceUnitId
    ? battle.allUnits.find((unit) => unit.unitId === latestStageEntry.sourceUnitId) ?? null
    : null;
  const targetUnitForEntry = latestStageEntry?.targetUnitId
    ? battle.allUnits.find((unit) => unit.unitId === latestStageEntry.targetUnitId) ?? null
    : null;
  const recentStageImpactTone: StageImpactCue['tone'] =
    latestStageEntry?.type === 'damage'
      ? 'damage'
      : latestStageEntry?.type === 'heal'
        ? 'heal'
        : latestStageEntry?.type === 'status'
          ? 'status'
          : latestStageEntry?.type === 'miss'
            ? 'miss'
            : 'action';
  const recentStageImpact: StageImpactCue | null = latestStageEntry
    ? {
        id: latestStageEntry.id,
        tone: recentStageImpactTone,
        sourceSide: sourceUnitForEntry?.side ?? null,
        targetSide: targetUnitForEntry?.side ?? null,
        label: latestStageEntry.message,
      }
    : null;

  const commitSelectedTarget = (targetId: string) => {
    if (!selectedAction) {
      return;
    }

    battle.performPlayerAction(selectedAction.type, {
      targetId,
      ...(selectedAction.type === 'skill' && selectedAction.skillId
        ? { skillId: selectedAction.skillId }
        : {}),
      ...(selectedAction.type === 'item' && selectedAction.itemId
        ? { itemId: selectedAction.itemId }
        : {}),
    });
  };

  const activateItem = (itemId: string) => {
    const item = rootStore.inventory.inspectItem(itemId);

    if (!item) {
      return;
    }

    if (item.targetScope === 'ally' || item.targetScope === 'enemy') {
      battle.selectAction('item', { itemId });

      return;
    }

    battle.performPlayerAction('item', { itemId });
  };

  const targetPrompt = battle.isAwaitingPlayerInput && requiresTarget
    ? targetSide === 'ally'
      ? 'Choose who receives the rite from the ally rail.'
      : 'Mark a foe on the enemy rail to let the action fall.'
    : currentUnit
      ? `${currentUnit.name} holds the initiative.`
      : 'The field waits for the next turn owner.';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100%',
        overflowY: 'auto',
        px: { xs: 1, md: 1.4 },
        py: { xs: 1, md: 1.25 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 22%, ${alpha(corruptionSkin.frame.accent, 0.12)} 0%, rgba(0,0,0,0) 28%),
            radial-gradient(circle at 82% 18%, ${alpha(corruptionSkin.frame.accent, 0.08)} 0%, rgba(0,0,0,0) 24%),
            linear-gradient(180deg, rgba(8, 11, 17, 0.24) 0%, rgba(5, 7, 12, 0.44) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={1.05} sx={{ position: 'relative' }}>
        <ScreenFrame
          mode="tactical"
          skin={corruptionSkin}
          sx={{
            p: { xs: 1, md: 1.15 },
            background: corruptionSkin.surface.panelStrong,
          }}
        >
          <Stack spacing={0.8}>
            <Stack
              alignItems={{ xs: 'flex-start', md: 'center' }}
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={0.9}
            >
              <Stack spacing={0.18}>
                <Typography
                  sx={{
                    color: alpha(corruptionSkin.text.muted, 0.94),
                    fontSize: '0.72rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tactical Mode
                </Typography>
                <Typography
                  component="h1"
                  sx={{ color: corruptionSkin.text.primary, fontSize: { xs: '1.2rem', md: '1.34rem' } }}
                >
                  {battle.activeBattleRef ?? 'Battle'}
                </Typography>
                <Typography sx={{ color: corruptionSkin.text.secondary, fontSize: '0.84rem' }}>
                  {targetPrompt}
                </Typography>
              </Stack>
              <StatusStrip items={summaryItems} skin={corruptionSkin} />
            </Stack>

            <TurnRibbon currentUnitId={battle.currentUnit?.unitId ?? null} skin={corruptionSkin} units={queueUnits} />
          </Stack>
        </ScreenFrame>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.05} alignItems="stretch">
          <Stack spacing={0.85} sx={{ width: { xs: '100%', xl: 280 }, flexShrink: 0 }}>
            <Typography
              sx={{
                color: alpha(corruptionSkin.text.muted, 0.92),
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                px: 0.2,
              }}
            >
              Party Front
            </Typography>
            {battle.allies.map((unit) => (
              <CombatantCard
                key={unit.unitId}
                auraKind={getCombatantAura(unit)}
                isCurrent={battle.currentUnit?.unitId === unit.unitId}
                isSelectable={battle.isAwaitingPlayerInput && targetSide === 'ally'}
                isSelectedTarget={battle.selectedTargetId === unit.unitId}
                onSelect={
                  battle.isAwaitingPlayerInput && targetSide === 'ally'
                    ? () => commitSelectedTarget(unit.unitId)
                    : undefined
                }
                roleLabel="Ally"
                selectionLabel="Target ally"
                skin={corruptionSkin}
                portraitUrl={resolveBattlePortraitUrl(rootStore, unit)}
                unit={unit}
              />
            ))}
          </Stack>

          <ScreenFrame
            mode="tactical"
            skin={corruptionSkin}
            sx={{
              flex: 1,
              minWidth: 0,
              p: { xs: 1, md: 1.15 },
              background: `
                radial-gradient(circle at 50% 10%, ${alpha(corruptionSkin.frame.accent, 0.08)} 0%, rgba(0,0,0,0) 28%),
                ${corruptionSkin.surface.panelStrong}
              `,
            }}
          >
            <Stack spacing={1.05}>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={0.8}
              >
                <Stack spacing={0.15}>
                  <Typography
                    sx={{
                      color: alpha(corruptionSkin.text.muted, 0.94),
                      fontSize: '0.68rem',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Command Dais
                  </Typography>
                  <Typography sx={{ color: corruptionSkin.text.primary, fontSize: '1.08rem' }}>
                    {getActionLabel(rootStore, selectedAction)}
                  </Typography>
                </Stack>
                <SystemAction
                  onClick={() => rootStore.openCharacterMenu()}
                  skin={corruptionSkin}
                  startAdornment={<BackpackOutlinedIcon sx={{ fontSize: 16 }} />}
                  tone="quiet"
                >
                  Open Character Menu
                </SystemAction>
              </Stack>

              <BattleStagePreview
                ally={
                  leadAlly
                    ? {
                        name: leadAlly.name,
                        roleLabel: 'Ally Front',
                        portraitUrl: resolveBattlePortraitUrl(rootStore, leadAlly),
                        auraKind: getCombatantAura(leadAlly),
                        side: 'ally',
                      }
                    : null
                }
                enemy={
                  leadEnemy
                    ? {
                        name: leadEnemy.name,
                        roleLabel: 'Enemy Pressure',
                        portraitUrl: resolveBattlePortraitUrl(rootStore, leadEnemy),
                        auraKind: getCombatantAura(leadEnemy),
                        side: 'enemy',
                      }
                    : null
                }
                previewAuraKind={actionAuraKind}
                previewSourceSide={currentUnit?.side ?? null}
                previewTargetSide={actionPreviewTargetSide}
                recentImpact={recentStageImpact}
                skin={corruptionSkin}
              />

              {battle.phase === 'victory' || battle.phase === 'defeat' ? (
                <ScreenFrame
                  mode="tactical"
                  skin={corruptionSkin}
                  sx={{
                    p: 1,
                    background:
                      battle.phase === 'victory'
                        ? `linear-gradient(180deg, ${alpha('#27402c', 0.34)} 0%, ${corruptionSkin.surface.panelStrong} 100%)`
                        : `linear-gradient(180deg, ${alpha('#442322', 0.34)} 0%, ${corruptionSkin.surface.panelStrong} 100%)`,
                  }}
                >
                  <Stack spacing={0.75}>
                    <Typography sx={{ color: corruptionSkin.text.primary, fontSize: '1rem' }}>
                      {battle.phase === 'victory'
                        ? 'The encounter is over. Claim the road and continue.'
                        : 'The line has broken. Withdraw before the scene swallows the party.'}
                    </Typography>
                    <SystemAction onClick={() => battle.endBattle()} skin={corruptionSkin} tone="accent">
                      Leave Battlefield
                    </SystemAction>
                  </Stack>
                </ScreenFrame>
              ) : (
                <Stack spacing={0.95}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    flexWrap="wrap"
                    gap={0.85}
                  >
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <BattleCommand
                        active={selectedAction?.type === 'attack'}
                        detail="Single target pressure. Commit against one marked enemy."
                        disabled={!battle.isAwaitingPlayerInput}
                        icon={<SportsKabaddiRoundedIcon sx={{ fontSize: 18 }} />}
                        label="Attack"
                        onClick={() => battle.selectAction('attack')}
                        skin={corruptionSkin}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <BattleCommand
                        active={selectedAction?.type === 'skill'}
                        detail={
                          preferredSkillId
                            ? 'Invoke your prepared technique or spell.'
                            : 'No trained battle skill is prepared yet.'
                        }
                        disabled={!battle.isAwaitingPlayerInput || !preferredSkillId}
                        icon={<AutoFixHighRoundedIcon sx={{ fontSize: 18 }} />}
                        label="Skill"
                        onClick={() => {
                          if (!preferredSkillId) {
                            return;
                          }

                          const skill = rootStore.getSkillById(preferredSkillId) ?? null;

                          if (!skillUsesTarget(skill)) {
                            battle.performPlayerAction('skill', { skillId: preferredSkillId });

                            return;
                          }

                          battle.selectAction('skill', { skillId: preferredSkillId });
                        }}
                        skin={corruptionSkin}
                      />
                    </Box>
                  </Stack>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    flexWrap="wrap"
                    gap={0.85}
                  >
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <BattleCommand
                        active={selectedAction?.type === 'item'}
                        detail={
                          battleItemEntries.length > 0
                            ? 'Use a carried remedy or weaponized tool.'
                            : 'No battle-ready items remain in the satchel.'
                        }
                        disabled={!battle.isAwaitingPlayerInput || battleItemEntries.length === 0}
                        icon={<BackpackOutlinedIcon sx={{ fontSize: 18 }} />}
                        label={battleItemEntries.length > 1 ? `Items ${battleItemEntries.length}` : preferredItemEntry?.data.name ?? 'Items'}
                        onClick={() => {
                          if (!preferredItemEntry) {
                            return;
                          }

                          activateItem(preferredItemEntry.itemId);
                        }}
                        skin={corruptionSkin}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <BattleCommand
                        active={selectedAction?.type === 'defend'}
                        detail="Brace for impact and halve the next clean strike."
                        disabled={!battle.isAwaitingPlayerInput}
                        icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                        label="Defend"
                        onClick={() => battle.performPlayerAction('defend')}
                        skin={corruptionSkin}
                      />
                    </Box>
                  </Stack>

                  {battleItemEntries.length > 0 ? (
                    <Stack spacing={0.55}>
                      <Typography
                        sx={{
                          color: alpha(corruptionSkin.text.muted, 0.92),
                          fontSize: '0.68rem',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Satchel
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.65}>
                        {battleItemEntries.map((entry) => (
                          <SystemAction
                            key={entry.itemId}
                            active={selectedAction?.type === 'item' && selectedAction.itemId === entry.itemId}
                            disabled={!battle.isAwaitingPlayerInput}
                            onClick={() => activateItem(entry.itemId)}
                            skin={corruptionSkin}
                            tone={selectedAction?.type === 'item' && selectedAction.itemId === entry.itemId ? 'accent' : 'quiet'}
                          >
                            {entry.data.name} x{entry.quantity}
                          </SystemAction>
                        ))}
                      </Stack>
                    </Stack>
                  ) : null}

                  {isVisualLab ? (
                    <ScreenFrame
                      mode="tactical"
                      skin={corruptionSkin}
                      sx={{
                        p: 0.9,
                        background: `linear-gradient(180deg, ${alpha(corruptionSkin.frame.accent, 0.08)} 0%, ${alpha(
                          '#000000',
                          0.2,
                        )} 100%)`,
                      }}
                    >
                      <Stack spacing={0.7}>
                        <Stack spacing={0.15}>
                          <Typography
                            sx={{
                              color: alpha(corruptionSkin.text.muted, 0.92),
                              fontSize: '0.68rem',
                              letterSpacing: '0.14em',
                              textTransform: 'uppercase',
                            }}
                          >
                            FX Lab
                          </Typography>
                          <Typography sx={{ color: corruptionSkin.text.secondary, fontSize: '0.78rem' }}>
                            Preview fire, holy and violet aura cycles on the active combatant or the marked target.
                          </Typography>
                        </Stack>

                        <Stack spacing={0.45}>
                          <Typography
                            sx={{
                              color: alpha(corruptionSkin.text.muted, 0.92),
                              fontSize: '0.64rem',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Active Unit
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.6}>
                            <SystemAction
                              disabled={!currentUnit}
                              onClick={() => applySandboxAura(currentUnit?.unitId ?? null, 'fire')}
                              skin={corruptionSkin}
                              tone="accent"
                            >
                              Ember Veil
                            </SystemAction>
                            <SystemAction
                              disabled={!currentUnit}
                              onClick={() => applySandboxAura(currentUnit?.unitId ?? null, 'holy')}
                              skin={corruptionSkin}
                              tone="quiet"
                            >
                              Holy Halo
                            </SystemAction>
                            <SystemAction
                              disabled={!currentUnit}
                              onClick={() => applySandboxAura(currentUnit?.unitId ?? null, 'violet')}
                              skin={corruptionSkin}
                              tone="quiet"
                            >
                              Violet Haze
                            </SystemAction>
                          </Stack>
                        </Stack>

                        <Stack spacing={0.45}>
                          <Typography
                            sx={{
                              color: alpha(corruptionSkin.text.muted, 0.92),
                              fontSize: '0.64rem',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Target Unit
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.6}>
                            <SystemAction
                              disabled={!sandboxTargetUnitId}
                              onClick={() => applySandboxAura(sandboxTargetUnitId, 'fire')}
                              skin={corruptionSkin}
                              tone="accent"
                            >
                              Mark Ember
                            </SystemAction>
                            <SystemAction
                              disabled={!sandboxTargetUnitId}
                              onClick={() => applySandboxAura(sandboxTargetUnitId, 'holy')}
                              skin={corruptionSkin}
                              tone="quiet"
                            >
                              Mark Holy
                            </SystemAction>
                            <SystemAction
                              disabled={!sandboxTargetUnitId}
                              onClick={() => applySandboxAura(sandboxTargetUnitId, 'violet')}
                              skin={corruptionSkin}
                              tone="quiet"
                            >
                              Mark Violet
                            </SystemAction>
                            <SystemAction onClick={clearSandboxAuras} skin={corruptionSkin} tone="quiet">
                              Clear FX
                            </SystemAction>
                          </Stack>
                        </Stack>
                      </Stack>
                    </ScreenFrame>
                  ) : null}
                </Stack>
              )}

              <ScreenFrame
                mode="tactical"
                skin={corruptionSkin}
                sx={{
                  p: 0.95,
                  background: alpha('#000000', 0.14),
                }}
              >
                <Stack spacing={0.55}>
                  <Typography
                    sx={{
                      color: alpha(corruptionSkin.text.muted, 0.92),
                      fontSize: '0.68rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recent Echoes
                  </Typography>
                  <Stack spacing={0.5}>
                    {battle.combatLog.slice(-5).map((entry) => (
                      <Box key={entry.id}>
                        <Typography sx={{ color: corruptionSkin.text.secondary, fontSize: '0.82rem' }}>
                          {entry.message}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </ScreenFrame>
            </Stack>
          </ScreenFrame>

          <Stack spacing={0.85} sx={{ width: { xs: '100%', xl: 280 }, flexShrink: 0 }}>
            <Typography
              sx={{
                color: alpha(corruptionSkin.text.muted, 0.92),
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                px: 0.2,
              }}
            >
              Opposition
            </Typography>
            {battle.enemies.map((unit) => (
              <CombatantCard
                key={unit.unitId}
                auraKind={getCombatantAura(unit)}
                isCurrent={battle.currentUnit?.unitId === unit.unitId}
                isSelectable={battle.isAwaitingPlayerInput && targetSide === 'enemy' && requiresTarget}
                isSelectedTarget={battle.selectedTargetId === unit.unitId}
                onSelect={
                  battle.isAwaitingPlayerInput && targetSide === 'enemy'
                    ? () => commitSelectedTarget(unit.unitId)
                    : undefined
                }
                roleLabel="Enemy"
                selectionLabel="Target enemy"
                showDangerAccent
                skin={corruptionSkin}
                portraitUrl={resolveBattlePortraitUrl(rootStore, unit)}
                unit={unit}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
});
