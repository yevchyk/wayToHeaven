import { Button, Chip, Stack, Typography } from '@mui/material';

import type { EquipmentSlot } from '@engine/types/appearance';
import type { GameRootStore } from '@engine/stores/GameRootStore';

const EQUIPMENT_SLOTS: EquipmentSlot[] = ['costume', 'headwear', 'weapon', 'aura'];

function formatSlotLabel(slot: EquipmentSlot) {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

interface EquipmentTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
  readOnly: boolean;
  onFeedback: (message: string) => void;
}

export function EquipmentTab({ rootStore, unitId, readOnly, onFeedback }: EquipmentTabProps) {
  if (!unitId) {
    return (
      <Typography color="text.secondary" variant="body2">
        No party member is selected.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {EQUIPMENT_SLOTS.map((slot) => {
        const item = rootStore.party.getEquippedItem(unitId, slot);
        const visual = item?.equipment?.visual;
        const replaceHair = item?.equipment?.replaceHair ?? false;

        return (
          <Stack
            key={slot}
            spacing={1}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">
                {formatSlotLabel(slot)}
              </Typography>
              <Chip
                label={item ? item.name : 'Empty'}
                size="small"
                color={item ? 'primary' : 'default'}
                variant="outlined"
              />
            </Stack>

            <Typography color="text.secondary" variant="body2">
              {item?.description ?? 'No item is equipped in this slot.'}
            </Typography>

            <Typography color="text.secondary" variant="caption">
              Preview layer: {visual?.layer ?? item?.equipment?.slot ?? slot}
              {visual?.assetId ? ` | Asset ${visual.assetId}` : ' | No asset'}
              {slot === 'headwear' ? ` | replaceHair ${replaceHair ? 'true' : 'false'}` : ''}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                disabled={!item || readOnly}
                onClick={() => {
                  const result = rootStore.party.unequipItem(unitId, slot);

                  onFeedback(
                    result.unequipped
                      ? `${item?.name ?? 'Item'} moved back to inventory.`
                      : result.message ?? `Could not unequip ${slot}.`,
                  );
                }}
                variant="outlined"
              >
                Unequip
              </Button>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
