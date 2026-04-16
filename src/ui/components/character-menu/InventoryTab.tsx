import { Button, Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { PanelSection } from '@ui/components/shell/PanelSection';

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
      <PanelSection tone="sunken">
        <Typography color="text.secondary" variant="body2">
          The party inventory is empty.
        </Typography>
      </PanelSection>
    );
  }

  return (
    <Stack spacing={1}>
      {inventory.detailedEntries.map((entry) => {
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
          <PanelSection
            key={entry.itemId}
            description={entry.data.description ?? 'No additional notes for this item.'}
            title={entry.data.name}
            tone="overlay"
            action={
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                <Chip label={`x${entry.quantity}`} size="small" variant="outlined" />
                <Chip label={entry.data.type} size="small" variant="outlined" />
                {entry.data.equipment?.slot ? (
                  <Chip label={`slot ${entry.data.equipment.slot}`} size="small" variant="outlined" />
                ) : null}
              </Stack>
            }
          >
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Button
                disabled={!isUsable}
                onClick={() => {
                  const result = inventory.useItem(entry.itemId, {
                    ...(unitId ? { targetUnitId: unitId } : {}),
                  });

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
                  onFeedback(entry.data.description ?? `${entry.data.name} has no extra notes.`)
                }
                variant="text"
              >
                Inspect
              </Button>
            </Stack>
          </PanelSection>
        );
      })}
    </Stack>
  );
}
