import type { ItemData } from '@engine/types/item';

export const travelHood: ItemData = {
  id: 'travel-hood',
  name: 'Travel Hood',
  description: 'A practical hood that frames the hair instead of hiding it.',
  type: 'equipment',
  stackable: false,
  targetScope: 'self',
  equipment: {
    slot: 'headwear',
    visual: {
      assetId: 'headwear/travel-hood',
      layer: 'headwear',
    },
    replaceHair: false,
  },
};
