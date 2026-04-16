import type { ItemData } from '@engine/types/item';

export const holyWater: ItemData = {
  id: 'holy-water',
  name: 'Holy Water',
  description: 'Consecrated water that steadies the body and strips one hostile status.',
  type: 'consumable',
  stackable: true,
  maxStack: 10,
  targetScope: 'ally',
  effects: [
    {
      type: 'restoreResource',
      resource: 'hp',
      amount: 18,
      targetScope: 'unit',
    },
    {
      type: 'cleanseStatuses',
      targetScope: 'unit',
      onlyNegative: true,
      limit: 1,
    },
  ],
};
