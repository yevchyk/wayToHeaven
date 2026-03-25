import type { ItemData } from '@engine/types/item';

export const ironHelm: ItemData = {
  id: 'iron-helm',
  name: 'Iron Helm',
  description: 'A closed helm that fully covers the upper head and hides the hair.',
  type: 'equipment',
  stackable: false,
  targetScope: 'self',
  equipment: {
    slot: 'headwear',
    visual: {
      assetId: 'headwear/iron-helm',
      layer: 'headwear',
    },
    replaceHair: true,
  },
};
