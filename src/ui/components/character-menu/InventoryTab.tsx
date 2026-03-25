import { Button, Divider, List, ListItem, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';

interface InventoryTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
  readOnly: boolean;
  onFeedback: (message: string) => void;
}

export function InventoryTab({ rootStore, unitId, readOnly, onFeedback }: InventoryTabProps) {
  const { inventory } = rootStore;

  if (inventory.isEmpty) {
    return (
      <Typography color="text.secondary" variant="body2">
        The party inventory is empty.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {inventory.detailedEntries.map((entry, index, entries) => {
        const isEquipment = entry.data.type === 'equipment' && Boolean(entry.data.equipment);
        const isUsable =
          !readOnly &&
          entry.data.type === 'consumable' &&
          (entry.data.effects?.length ?? 0) > 0;
        const canEquip = Boolean(unitId) && isEquipment && !readOnly;
        const equippedSlot = entry.data.equipment?.slot;
        const isAlreadyEquipped =
          Boolean(unitId && equippedSlot) &&
          rootStore.party.getEquippedItemId(unitId!, equippedSlot!) === entry.itemId;

        return (
          <Stack key={entry.itemId} spacing={1.25}>
            <ListItem disableGutters sx={{ display: 'block' }}>
              <Stack spacing={1.25}>
                <Stack alignItems="center" direction="row" justifyContent="space-between">
                  <Typography variant="h6">{entry.data.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    x{entry.quantity}
                  </Typography>
                </Stack>

                {entry.data.description ? (
                  <Typography color="text.secondary" variant="body2">
                    {entry.data.description}
                  </Typography>
                ) : null}

                <Typography color="text.secondary" variant="caption">
                  Type {entry.data.type}
                  {entry.data.equipment?.slot ? ` | Slot ${entry.data.equipment.slot}` : ''}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Button
                    disabled={!isUsable}
                    onClick={() => {
                      const result = inventory.useItem(entry.itemId);

                      onFeedback(
                        result.consumed
                          ? `${entry.data.name} used successfully.`
                          : result.message ?? `${entry.data.name} could not be used.`,
                      );
                    }}
                    variant="contained"
                  >
                    Use
                  </Button>

                  <Button
                    disabled={!canEquip || isAlreadyEquipped}
                    onClick={() => {
                      if (!unitId) {
                        return;
                      }

                      const result = rootStore.party.equipItem(unitId, entry.itemId);

                      onFeedback(
                        result.equipped
                          ? `${entry.data.name} equipped successfully.`
                          : result.message ?? `${entry.data.name} could not be equipped.`,
                      );
                    }}
                    variant="outlined"
                  >
                    {isAlreadyEquipped ? 'Equipped' : 'Equip'}
                  </Button>

                  <Button
                    onClick={() =>
                      onFeedback(
                        entry.data.description ?? `${entry.data.name} has no extra notes.`,
                      )
                    }
                    variant="text"
                  >
                    Inspect
                  </Button>
                </Stack>
              </Stack>
            </ListItem>
            {index < entries.length - 1 ? <Divider sx={{ opacity: 0.08 }} /> : null}
          </Stack>
        );
      })}
    </List>
  );
}
