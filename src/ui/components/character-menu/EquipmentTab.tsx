import { Button, Chip, Stack, Typography } from '@mui/material';

import type { EquipmentSlot } from '@engine/types/appearance';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import { PanelSection } from '@ui/components/shell/PanelSection';

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
      <PanelSection tone="sunken">
        <Typography color="text.secondary" variant="body2">
          No party member is selected.
        </Typography>
      </PanelSection>
    );
  }

  return (
    <Stack spacing={1}>
      {EQUIPMENT_SLOTS.map((slot) => {
        const item = rootStore.party.getEquippedItem(unitId, slot);
        const visual = item?.equipment?.visual;
        const replaceHair = item?.equipment?.replaceHair ?? false;

        return (
          <PanelSection
            key={slot}
            description={item?.description ?? 'No item is equipped in this slot.'}
            title={formatSlotLabel(slot)}
            tone="overlay"
            action={<Chip label={item ? item.name : 'Empty'} size="small" variant="outlined" />}
          >
            <Stack spacing={0.85}>
              <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }} variant="caption">
                Preview layer: {visual?.layer ?? item?.equipment?.slot ?? slot}
                {visual?.assetId ? ` • Asset ${visual.assetId}` : ' • No asset'}
                {slot === 'headwear' ? ` • replaceHair ${replaceHair ? 'true' : 'false'}` : ''}
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
          </PanelSection>
        );
      })}
    </Stack>
  );
}
