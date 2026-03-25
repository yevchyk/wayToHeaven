import type { ItemData } from '@engine/types/item';

export const pilgrimMantle: ItemData = {
  id: 'pilgrim-mantle',
  name: 'Pilgrim Mantle',
  description: 'A travel-worn mantle that marks a protected wanderer.',
  type: 'equipment',
  stackable: false,
  targetScope: 'self',
  equipment: {
    slot: 'costume',
    visual: {
      assetId: 'costume/pilgrim-mantle',
      layer: 'costume',
    },
  },
};
