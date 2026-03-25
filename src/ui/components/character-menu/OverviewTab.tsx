import { Chip, Divider, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';

interface OverviewTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
}

export function OverviewTab({ rootStore, unitId }: OverviewTabProps) {
  if (!unitId) {
    return (
      <Typography color="text.secondary" variant="body2">
        No party member is selected.
      </Typography>
    );
  }

  const unit = rootStore.party.getUnit(unitId);
  const template = rootStore.party.getCharacterTemplate(unitId);
  const resolvedEquipment = rootStore.party.getResolvedEquippedItems(unitId);

  if (!unit || !template) {
    return null;
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h5">{unit.name}</Typography>
        <Typography color="text.secondary" variant="body2">
          {template.description ?? 'No biography yet.'}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Chip label={`Level ${unit.level}`} variant="outlined" />
        <Chip label={`HP ${unit.currentHp}/${unit.derivedStats.maxHp}`} color="success" variant="outlined" />
        <Chip label={`Mana ${unit.currentMana}/${unit.derivedStats.maxMana}`} color="info" variant="outlined" />
      </Stack>

      <Divider sx={{ opacity: 0.08 }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Base Stats</Typography>
          <Typography color="text.secondary" variant="body2">
            Strength {unit.baseStats.strength} | Agility {unit.baseStats.agility} | Sexuality {unit.baseStats.sexuality}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Magic Affinity {unit.baseStats.magicAffinity} | Initiative {unit.baseStats.initiative}
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Global State</Typography>
          <Typography color="text.secondary" variant="body2">
            Hunger {rootStore.meta.hunger} | Morale {rootStore.meta.morale} | Reputation {rootStore.meta.reputation}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ opacity: 0.08 }} />

      <Stack spacing={1}>
        <Typography variant="subtitle1">Equipped</Typography>
        <Typography color="text.secondary" variant="body2">
          Costume: {resolvedEquipment.costume?.itemName ?? 'None'}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Headwear: {resolvedEquipment.headwear?.itemName ?? 'None'}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Weapon: {resolvedEquipment.weapon?.itemName ?? 'None'}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Aura: {resolvedEquipment.aura?.itemName ?? 'None'}
        </Typography>
      </Stack>
    </Stack>
  );
}
