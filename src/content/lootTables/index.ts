import type { LootTableData } from '@engine/types/loot';

import { wolfPackRoadsideLootTable } from './wolfPackRoadside';

export const lootTableContentRegistry = {
  [wolfPackRoadsideLootTable.id]: wolfPackRoadsideLootTable,
} satisfies Record<string, LootTableData>;
