import type { ItemData } from '@engine/types/item';

export const travelRation: ItemData = {
  id: 'travel-ration',
  name: 'Travel Ration',
  description: 'Dry food that keeps hunger down during long stretches on the road.',
  type: 'consumable',
  stackable: true,
  maxStack: 20,
  targetScope: 'none',
  effects: [
    {
      type: 'changeMeta',
      key: 'hunger',
      delta: -3,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
  ],
};

