import type { ItemData } from '@engine/types/item';

export const fieldRation: ItemData = {
  id: 'field-ration',
  name: 'Field Ration',
  description: 'Dense travel food that knocks down hunger and steadies morale after a hard road.',
  type: 'consumable',
  stackable: true,
  maxStack: 20,
  targetScope: 'none',
  effects: [
    {
      type: 'changeMeta',
      key: 'hunger',
      delta: -2,
    },
    {
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    },
  ],
};
