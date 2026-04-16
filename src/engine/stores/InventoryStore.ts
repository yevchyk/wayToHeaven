import { observable, makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { GameEffect } from '@engine/types/effects';
import type { InventorySnapshot } from '@engine/types/save';
import type {
  InventoryEntryDetails,
  InventoryItem,
  ItemTargetScope,
  ItemUseOptions,
  ItemUseResult,
} from '@engine/types/item';

function isBattleRelevantItemEffect(effect: GameEffect) {
  return (
    effect.type === 'dealDamage' ||
    effect.type === 'restoreResource' ||
    effect.type === 'addTag' ||
    effect.type === 'removeTag' ||
    effect.type === 'removeStatus' ||
    effect.type === 'cleanseStatuses'
  );
}

function overrideEffectContext(
  effect: GameEffect,
  options: {
    sourceUnitId?: string | null;
    targetUnitId?: string | null;
  },
) {
  switch (effect.type) {
    case 'addTag':
    case 'cleanseStatuses':
    case 'removeTag':
    case 'removeStatus':
    case 'restoreResource':
      return {
        ...effect,
        ...(options.targetUnitId
          ? {
              targetScope: 'unit' as const,
              targetId: options.targetUnitId,
            }
          : {}),
      };
    case 'dealDamage':
      return {
        ...effect,
        ...(options.sourceUnitId ? { sourceUnitId: options.sourceUnitId } : {}),
        ...(options.targetUnitId
          ? {
              targetScope: 'unit' as const,
              targetId: options.targetUnitId,
            }
          : {}),
      };
    default:
      return effect;
  }
}

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

  get usableConsumableEntries() {
    return this.detailedEntries.filter(
      (entry) => entry.data.type === 'consumable' && (entry.data.effects?.length ?? 0) > 0,
    );
  }

  get battleUsableEntries() {
    return this.usableConsumableEntries.filter((entry) =>
      (entry.data.effects ?? []).some((effect) => isBattleRelevantItemEffect(effect)),
    );
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

  useItem(itemId: string, options: ItemUseOptions = {}): ItemUseResult {
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

    const resolvedTargetUnitId = this.resolveItemTargetUnitId(item.targetScope ?? 'none', options);

    if (item.targetScope && item.targetScope !== 'none' && !resolvedTargetUnitId) {
      return {
        itemId,
        consumed: false,
        message: `Item "${item.name}" requires a valid target.`,
      };
    }

    const resolvedEffects =
      resolvedTargetUnitId
        ? item.effects.map((effect) =>
            overrideEffectContext(effect, {
              ...(options.sourceUnitId !== undefined ? { sourceUnitId: options.sourceUnitId } : {}),
              targetUnitId: resolvedTargetUnitId,
            }),
          )
        : item.effects.map((effect) =>
            overrideEffectContext(effect, {
              ...(options.sourceUnitId !== undefined ? { sourceUnitId: options.sourceUnitId } : {}),
            }),
          );
    const batchResult = this.rootStore.executeEffects(resolvedEffects);

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
      ...(resolvedTargetUnitId ? { targetUnitId: resolvedTargetUnitId } : {}),
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

  private resolveItemTargetUnitId(scope: ItemTargetScope, options: ItemUseOptions) {
    switch (scope) {
      case 'none':
        return null;
      case 'enemy':
      case 'ally':
        return options.targetUnitId ?? null;
      case 'self':
      default:
        return (
          options.targetUnitId ??
          options.sourceUnitId ??
          this.rootStore.party.selectedCharacterId ??
          this.rootStore.party.playerUnitId ??
          null
        );
    }
  }
}
