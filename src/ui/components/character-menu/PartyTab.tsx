import { Button, Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { PanelSection } from '@ui/components/shell/PanelSection';

interface PartyTabProps {
  rootStore: GameRootStore;
}

export function PartyTab({ rootStore }: PartyTabProps) {
  return (
    <Stack spacing={1}>
      {rootStore.party.members.map((member) => {
        const isSelected = rootStore.party.selectedCharacterId === member.unitId;
        const isActive = rootStore.party.activePartyIds.includes(member.unitId);

        return (
          <PanelSection
            key={member.unitId}
            description={`HP ${member.currentHp}/${member.derivedStats.maxHp} • Mana ${member.currentMana}/${member.derivedStats.maxMana}`}
            title={member.name}
            tone={isSelected ? 'accent' : 'overlay'}
            action={<Chip label={isActive ? 'Active' : 'Reserve'} size="small" variant="outlined" />}
          >
            <Button
              aria-label={member.name}
              fullWidth
              onClick={() => rootStore.party.setSelectedCharacter(member.unitId)}
              sx={{ justifyContent: 'space-between' }}
              variant={isSelected ? 'contained' : 'outlined'}
            >
              <span>{isSelected ? 'Selected' : 'Focus character'}</span>
              <Typography color="text.secondary" variant="caption">
                Level {member.level}
              </Typography>
            </Button>
          </PanelSection>
        );
      })}
    </Stack>
  );
}
