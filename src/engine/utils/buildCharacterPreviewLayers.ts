import type {
  CharacterPreviewLayer,
  CharacterPreviewLayerId,
  CharacterPreviewModel,
  ResolvedEquippedItemVisual,
} from '@engine/types/appearance';

const LAYER_ORDER: CharacterPreviewLayerId[] = [
  'background',
  'body',
  'costume',
  'hair',
  'headwear',
  'weapon',
  'aura',
];

function buildBaseLayer(
  layerId: Extract<CharacterPreviewLayerId, 'background' | 'body' | 'costume' | 'hair' | 'aura'>,
  model: CharacterPreviewModel,
): CharacterPreviewLayer | null {
  const assetId = model.visuals[layerId];

  if (!assetId) {
    return null;
  }

  return {
    id: layerId,
    assetId,
    label: `${model.name} ${layerId}`,
    source: 'base',
  };
}

function buildEquipmentLayer(
  layerId: Extract<CharacterPreviewLayerId, 'costume' | 'headwear' | 'weapon' | 'aura'>,
  equipment: ResolvedEquippedItemVisual | null | undefined,
): CharacterPreviewLayer | null {
  if (!equipment?.assetId) {
    return null;
  }

  return {
    id: layerId,
    assetId: equipment.assetId,
    label: equipment.itemName,
    source: 'equipment',
    itemId: equipment.itemId,
  };
}

export function buildCharacterPreviewLayers(model: CharacterPreviewModel): CharacterPreviewLayer[] {
  const headwear = model.equippedItems.headwear;
  const hideHair = Boolean(headwear?.replaceHair);

  return LAYER_ORDER.flatMap((layerId) => {
    switch (layerId) {
      case 'background':
      case 'body':
        return buildBaseLayer(layerId, model) ? [buildBaseLayer(layerId, model)!] : [];
      case 'costume': {
        const equipmentLayer = buildEquipmentLayer('costume', model.equippedItems.costume);

        if (equipmentLayer) {
          return [equipmentLayer];
        }

        const baseLayer = buildBaseLayer('costume', model);

        return baseLayer ? [baseLayer] : [];
      }
      case 'hair': {
        if (hideHair) {
          return [];
        }

        const baseLayer = buildBaseLayer('hair', model);

        return baseLayer ? [baseLayer] : [];
      }
      case 'headwear': {
        const equipmentLayer = buildEquipmentLayer('headwear', headwear);

        return equipmentLayer ? [equipmentLayer] : [];
      }
      case 'weapon': {
        const equipmentLayer = buildEquipmentLayer('weapon', model.equippedItems.weapon);

        return equipmentLayer ? [equipmentLayer] : [];
      }
      case 'aura': {
        const equipmentLayer = buildEquipmentLayer('aura', model.equippedItems.aura);

        if (equipmentLayer) {
          return [equipmentLayer];
        }

        const baseLayer = buildBaseLayer('aura', model);

        return baseLayer ? [baseLayer] : [];
      }
      default:
        return [];
    }
  });
}
