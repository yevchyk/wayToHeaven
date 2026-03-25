import { Chip, Divider, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';

interface StatusTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
}

export function StatusTab({ rootStore, unitId }: StatusTabProps) {
  if (!unitId) {
    return (
      <Typography color="text.secondary" variant="body2">
        No party member is selected.
      </Typography>
    );
  }

  const unit = rootStore.party.getUnit(unitId);

  if (!unit) {
    return null;
  }

  const effectiveTags = rootStore.statusProcessor.getEffectiveTags(unit);

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Base Stats</Typography>
          <Typography color="text.secondary" variant="body2">
            Strength {unit.baseStats.strength}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Agility {unit.baseStats.agility}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Sexuality {unit.baseStats.sexuality}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Magic Affinity {unit.baseStats.magicAffinity}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Initiative {unit.baseStats.initiative}
          </Typography>
        </Stack>

        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Derived Stats</Typography>
          <Typography color="text.secondary" variant="body2">
            Physical Attack {unit.derivedStats.physicalAttack}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Magical Attack {unit.derivedStats.magicalAttack}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Armor {unit.derivedStats.armor} | Resistance {unit.derivedStats.resistance}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Accuracy {unit.derivedStats.accuracy} | Evasion {unit.derivedStats.evasion}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Crit {unit.derivedStats.critChance} | Crit Power {unit.derivedStats.critPower}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ opacity: 0.08 }} />

      <Stack spacing={1.25}>
        <Typography variant="subtitle1">Active Statuses</Typography>
        {unit.statuses.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {unit.statuses.map((status) => (
              <Chip
                key={status.id}
                label={`${status.type} (${status.remainingDuration})`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No active statuses.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.25}>
        <Typography variant="subtitle1">Tags</Typography>
        {effectiveTags.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {effectiveTags.map((tag) => (
              <Chip key={`${unit.unitId}-${tag}`} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No active tags.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
