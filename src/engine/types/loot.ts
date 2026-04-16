export interface LootTableEntry {
  itemId: string;
  quantity?: number;
  weight?: number;
}

export interface LootTableRollGroup {
  rolls: number;
  entries: LootTableEntry[];
}

export interface LootTableData {
  id: string;
  guaranteed?: LootTableEntry[];
  rollGroups?: LootTableRollGroup[];
}

export interface ResolvedLootEntry {
  itemId: string;
  quantity: number;
}
