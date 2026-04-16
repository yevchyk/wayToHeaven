import type { LootTableData } from '@engine/types/loot';

export const wolfPackRoadsideLootTable: LootTableData = {
  id: 'wolf-pack-roadside',
  guaranteed: [
    {
      itemId: 'wolf-thyme',
      quantity: 1,
    },
  ],
  rollGroups: [
    {
      rolls: 1,
      entries: [
        { itemId: 'blood-moss', weight: 4 },
        { itemId: 'rough-bandage', weight: 3 },
        { itemId: 'pitch-bomb', weight: 2 },
        { itemId: 'field-ration', weight: 2 },
        { itemId: 'holy-water', weight: 1 },
      ],
    },
    {
      rolls: 1,
      entries: [
        { itemId: 'ash-reed', weight: 4 },
        { itemId: 'stimulant-tincture', weight: 2 },
        { itemId: 'salt-thorn', weight: 1 },
      ],
    },
  ],
};
