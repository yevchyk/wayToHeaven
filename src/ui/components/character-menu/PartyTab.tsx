import { Button, Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';

interface PartyTabProps {
  rootStore: GameRootStore;
}

export function PartyTab({ rootStore }: PartyTabProps) {
  return (
    <Stack spacing={1.25}>
      {rootStore.party.members.map((member) => {
        const isSelected = rootStore.party.selectedCharacterId === member.unitId;
        const isActive = rootStore.party.activePartyIds.includes(member.unitId);

        return (
          <Button
            key={member.unitId}
            onClick={() => rootStore.party.setSelectedCharacter(member.unitId)}
            sx={{
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderRadius: 2.5,
            }}
            variant={isSelected ? 'contained' : 'outlined'}
          >
            <Stack alignItems="flex-start" spacing={0.35}>
              <Typography variant="subtitle1">{member.name}</Typography>
              <Typography color="text.secondary" variant="caption">
                HP {member.currentHp}/{member.derivedStats.maxHp} | Mana {member.currentMana}/{member.derivedStats.maxMana}
              </Typography>
            </Stack>
            <Chip
              label={isActive ? 'Active' : 'Reserve'}
              size="small"
              variant="outlined"
            />
          </Button>
        );
      })}
    </Stack>
  );
}
