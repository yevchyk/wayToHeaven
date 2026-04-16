import type { ItemData } from '@engine/types/item';

export const roughBandage: ItemData = {
  id: 'rough-bandage',
  name: 'Rough Bandage',
  description: 'A coarse wrap that closes an open wound and stops fresh bleeding.',
  type: 'consumable',
  stackable: true,
  maxStack: 10,
  targetScope: 'ally',
  effects: [
    {
      type: 'restoreResource',
      resource: 'hp',
      amount: 10,
      targetScope: 'unit',
    },
    {
      type: 'removeStatus',
      statusType: 'bleed',
      targetScope: 'unit',
    },
  ],
};
