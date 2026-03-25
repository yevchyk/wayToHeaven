import type { ItemData } from '@engine/types/item';

export const basicPotion: ItemData = {
  id: 'basic-potion',
  name: 'Basic Potion',
  description: 'A common restorative that closes bruises and steadies the breath.',
  type: 'consumable',
  stackable: true,
  maxStack: 10,
  targetScope: 'self',
  effects: [
    {
      type: 'restoreResource',
      resource: 'hp',
      amount: 20,
      targetScope: 'player',
    },
  ],
};

