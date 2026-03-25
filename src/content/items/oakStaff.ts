import type { ItemData } from '@engine/types/item';

export const oakStaff: ItemData = {
  id: 'oak-staff',
  name: 'Oak Staff',
  description: 'A carved staff used as both walking support and weapon focus.',
  type: 'equipment',
  stackable: false,
  targetScope: 'self',
  equipment: {
    slot: 'weapon',
    visual: {
      assetId: 'weapon/oak-staff',
      layer: 'weapon',
    },
  },
};
