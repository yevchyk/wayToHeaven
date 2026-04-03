import { Box, Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';

interface OverviewTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: shellTokens.radius.sm,
        border: `1px solid ${shellTokens.border.subtle}`,
        background: shellTokens.surface.sunken,
      }}
    >
      <Typography sx={{ color: shellTokens.text.muted, fontSize: '0.72rem', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ color: shellTokens.text.primary, fontSize: '1rem', mt: 0.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.92rem' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function OverviewTab({ rootStore, unitId }: OverviewTabProps) {
  if (!unitId) {
    return (
      <PanelSection tone="sunken">
        <Typography color="text.secondary" variant="body2">
          No party member is selected.
        </Typography>
      </PanelSection>
    );
  }

  const unit = rootStore.party.getUnit(unitId);
  const template = rootStore.party.getCharacterTemplate(unitId);
  const resolvedEquipment = rootStore.party.getResolvedEquippedItems(unitId);

  if (!unit || !template) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <PanelSection
        description={template.description ?? 'No biography yet.'}
        title={unit.name}
        tone="overlay"
        action={
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            <Chip label={`Level ${unit.level}`} size="small" variant="outlined" />
            <Chip label={template.faction} size="small" variant="outlined" />
          </Stack>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <MetricTile label="HP" value={`${unit.currentHp} / ${unit.derivedStats.maxHp}`} />
          <MetricTile label="Mana" value={`${unit.currentMana} / ${unit.derivedStats.maxMana}`} />
          <MetricTile label="Attack" value={`${unit.derivedStats.physicalAttack}`} />
          <MetricTile label="Initiative" value={`${unit.baseStats.initiative}`} />
        </Box>
      </PanelSection>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
        <Box sx={{ flex: 1 }}>
          <PanelSection title="Core stats" tone="default">
            <Stack spacing={0.7}>
              <DataRow label="Strength" value={unit.baseStats.strength} />
              <DataRow label="Agility" value={unit.baseStats.agility} />
              <DataRow label="Sexuality" value={unit.baseStats.sexuality} />
              <DataRow label="Magic Affinity" value={unit.baseStats.magicAffinity} />
              <DataRow label="Initiative" value={unit.baseStats.initiative} />
            </Stack>
          </PanelSection>
        </Box>
        <Box sx={{ flex: 1 }}>
          <PanelSection title="Camp state" tone="default">
            <Stack spacing={0.7}>
              <DataRow label="Hunger" value={rootStore.meta.hunger} />
              <DataRow label="Morale" value={rootStore.meta.morale} />
              <DataRow label="Reputation" value={rootStore.meta.reputation} />
              <DataRow label="Safety" value={rootStore.meta.safety} />
              <DataRow label="Bad reputation" value={rootStore.meta.badReputation} />
            </Stack>
          </PanelSection>
        </Box>
      </Stack>

      <PanelSection title="Equipped loadout" tone="sunken">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <MetricTile label="Costume" value={resolvedEquipment.costume?.itemName ?? 'None'} />
          <MetricTile label="Headwear" value={resolvedEquipment.headwear?.itemName ?? 'None'} />
          <MetricTile label="Weapon" value={resolvedEquipment.weapon?.itemName ?? 'None'} />
          <MetricTile label="Aura" value={resolvedEquipment.aura?.itemName ?? 'None'} />
        </Box>
      </PanelSection>
    </Stack>
  );
}
