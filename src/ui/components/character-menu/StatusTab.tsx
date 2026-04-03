import { Box, Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';

interface StatusTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.92rem' }}>{value}</Typography>
    </Stack>
  );
}

export function StatusTab({ rootStore, unitId }: StatusTabProps) {
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

  if (!unit) {
    return null;
  }

  const effectiveTags = rootStore.statusProcessor.getEffectiveTags(unit);

  return (
    <Stack spacing={1}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
        <Box sx={{ flex: 1 }}>
          <PanelSection title="Base stats" tone="default">
            <Stack spacing={0.7}>
              <StatRow label="Strength" value={unit.baseStats.strength} />
              <StatRow label="Agility" value={unit.baseStats.agility} />
              <StatRow label="Sexuality" value={unit.baseStats.sexuality} />
              <StatRow label="Magic Affinity" value={unit.baseStats.magicAffinity} />
              <StatRow label="Initiative" value={unit.baseStats.initiative} />
            </Stack>
          </PanelSection>
        </Box>
        <Box sx={{ flex: 1 }}>
          <PanelSection title="Derived stats" tone="default">
            <Stack spacing={0.7}>
              <StatRow label="Physical attack" value={unit.derivedStats.physicalAttack} />
              <StatRow label="Magical attack" value={unit.derivedStats.magicalAttack} />
              <StatRow label="Armor" value={unit.derivedStats.armor} />
              <StatRow label="Resistance" value={unit.derivedStats.resistance} />
              <StatRow label="Accuracy" value={unit.derivedStats.accuracy} />
              <StatRow label="Evasion" value={unit.derivedStats.evasion} />
              <StatRow label="Crit" value={unit.derivedStats.critChance} />
              <StatRow label="Crit power" value={unit.derivedStats.critPower} />
            </Stack>
          </PanelSection>
        </Box>
      </Stack>

      <PanelSection title="Active statuses" tone="overlay">
        {unit.statuses.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {unit.statuses.map((status) => (
              <Chip
                key={status.id}
                label={`${status.type} • ${status.remainingDuration}`}
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
      </PanelSection>

      <PanelSection title="Effective tags" tone="sunken">
        {effectiveTags.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {effectiveTags.map((tag) => (
              <Chip key={`${unit.unitId}-${tag}`} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No active tags.
          </Typography>
        )}
      </PanelSection>
    </Stack>
  );
}
