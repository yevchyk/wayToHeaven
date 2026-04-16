import type { LootTableData, ResolvedLootEntry } from '@engine/types/loot';

type RandomSource = () => number;

function normalizeQuantity(quantity: number | undefined) {
  return Math.max(1, quantity ?? 1);
}

export class LootTableResolver {
  private readonly random: RandomSource;

  constructor(random: RandomSource = Math.random) {
    this.random = random;
  }

  resolve(table: LootTableData | null | undefined): ResolvedLootEntry[] {
    if (!table) {
      return [];
    }

    const resolved = new Map<string, number>();
    const pushEntry = (itemId: string, quantity: number | undefined) => {
      resolved.set(itemId, (resolved.get(itemId) ?? 0) + normalizeQuantity(quantity));
    };

    (table.guaranteed ?? []).forEach((entry) => {
      pushEntry(entry.itemId, entry.quantity);
    });

    (table.rollGroups ?? []).forEach((group) => {
      for (let rollIndex = 0; rollIndex < group.rolls; rollIndex += 1) {
        const totalWeight = group.entries.reduce((sum, entry) => sum + Math.max(1, entry.weight ?? 1), 0);

        if (totalWeight <= 0) {
          continue;
        }

        let cursor = this.random() * totalWeight;

        for (const entry of group.entries) {
          cursor -= Math.max(1, entry.weight ?? 1);

          if (cursor <= 0) {
            pushEntry(entry.itemId, entry.quantity);
            break;
          }
        }
      }
    });

    return Array.from(resolved.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }));
  }
}
