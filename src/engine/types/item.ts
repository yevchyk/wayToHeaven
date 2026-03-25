import type { GameEffect } from '@engine/types/effects';
import type { CharacterPreviewLayerId, EquipmentSlot } from '@engine/types/appearance';

export type ItemType = 'consumable' | 'quest' | 'equipment' | 'material';

export type ItemTargetScope = 'none' | 'self' | 'ally' | 'enemy';

export interface EquipmentVisualConfig {
  assetId?: string;
  layer?: Extract<CharacterPreviewLayerId, EquipmentSlot>;
}

export interface EquipmentItemConfig {
  slot: EquipmentSlot;
  visual?: EquipmentVisualConfig;
  replaceHair?: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  stackable: boolean;
  maxStack?: number;
  targetScope?: ItemTargetScope;
  effects?: GameEffect[];
  equipment?: EquipmentItemConfig;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface InventoryEntryDetails extends InventoryItem {
  data: ItemData;
}

export interface ItemUseResult {
  itemId: string;
  consumed: boolean;
  message?: string;
}
