import type { ItemData } from '@engine/types/item';

export type CharacterPreviewLayerId =
  | 'background'
  | 'body'
  | 'costume'
  | 'hair'
  | 'headwear'
  | 'weapon'
  | 'aura';

export type BaseCharacterVisualLayerId = 'background' | 'body' | 'costume' | 'hair' | 'aura';

export type EquipmentSlot = 'costume' | 'headwear' | 'weapon' | 'aura';

export type CharacterVisualConfig = Partial<Record<BaseCharacterVisualLayerId, string>>;

export type EquippedItemIds = Partial<Record<EquipmentSlot, string>>;

export interface ResolvedEquippedItemVisual {
  itemId: string;
  itemName: string;
  slot: EquipmentSlot;
  assetId?: string;
  layerId: Extract<CharacterPreviewLayerId, EquipmentSlot>;
  replaceHair?: boolean;
}

export type ResolvedCharacterEquipment = Partial<Record<EquipmentSlot, ResolvedEquippedItemVisual | null>>;

export interface CharacterPreviewModel {
  unitId: string;
  name: string;
  visuals: CharacterVisualConfig;
  equippedItems: ResolvedCharacterEquipment;
}

export interface CharacterPreviewLayer {
  id: CharacterPreviewLayerId;
  assetId: string;
  label: string;
  source: 'base' | 'equipment';
  itemId?: string;
}

export function isEquipmentItem(item: ItemData): boolean {
  return item.type === 'equipment' && Boolean(item.equipment);
}
