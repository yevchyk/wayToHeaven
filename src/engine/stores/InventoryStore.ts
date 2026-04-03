import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { InventorySnapshot } from '@engine/types/save';
import type { InventoryEntryDetails, InventoryItem, ItemUseResult } from '@engine/types/item';

export class InventoryStore {
  readonly rootStore: GameRootStore;

  itemCounts = observable.map<string, number>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get entries(): InventoryItem[] {
    return Array.from(this.itemCounts.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }));
  }

  get detailedEntries(): InventoryEntryDetails[] {
    return this.entries.flatMap((entry) => {
      const data = this.inspectItem(entry.itemId);

      return data
        ? [
            {
              ...entry,
              data,
            },
          ]
        : [];
    });
  }

  get isEmpty() {
    return this.itemCounts.size === 0;
  }

  get totalItemKinds() {
    return this.itemCounts.size;
  }

  get totalItemCount() {
    return this.entries.reduce((total, entry) => total + entry.quantity, 0);
  }

  get snapshot(): InventorySnapshot {
    return {
      itemCounts: Object.fromEntries(this.itemCounts.entries()),
    };
  }

  getItemCount(itemId: string) {
    return this.itemCounts.get(itemId) ?? 0;
  }

  hasItem(itemId: string, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }

  inspectItem(itemId: string) {
    return this.rootStore.getItemById(itemId) ?? null;
  }

  addItem(itemId: string, quantity = 1) {
    if (quantity <= 0) {
      return;
    }

    this.itemCounts.set(itemId, this.getItemCount(itemId) + quantity);
  }

  removeItem(itemId: string, quantity = 1) {
    if (quantity <= 0) {
      return false;
    }

    const currentQuantity = this.getItemCount(itemId);

    if (currentQuantity < quantity) {
      return false;
    }

    const nextQuantity = currentQuantity - quantity;

    if (nextQuantity === 0) {
      this.itemCounts.delete(itemId);
    } else {
      this.itemCounts.set(itemId, nextQuantity);
    }

    return true;
  }

  useItem(itemId: string): ItemUseResult {
    const item = this.inspectItem(itemId);

    if (!item) {
      return {
        itemId,
        consumed: false,
        message: `Unknown item: ${itemId}`,
      };
    }

    if (!this.hasItem(itemId)) {
      return {
        itemId,
        consumed: false,
        message: `Item "${itemId}" is not available.`,
      };
    }

    if (!item.effects || item.effects.length === 0) {
      return {
        itemId,
        consumed: false,
        message: `Item "${item.name}" has no usable effects.`,
      };
    }

    const batchResult = this.rootStore.executeEffects(item.effects);

    if (batchResult.appliedCount === 0) {
      return {
        itemId,
        consumed: false,
        message: `Item "${item.name}" could not be used in the current state.`,
      };
    }

    this.removeItem(itemId, 1);

    return {
      itemId,
      consumed: true,
    };
  }

  clear() {
    this.itemCounts.clear();
  }

  restore(snapshot: InventorySnapshot) {
    this.clear();

    Object.entries(snapshot.itemCounts).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        this.itemCounts.set(itemId, quantity);
      }
    });
  }
}
