import type { CharacterPreviewModel } from '@engine/types/appearance';
import { buildCharacterPreviewLayers } from '@engine/utils/buildCharacterPreviewLayers';

function createPreviewModel(
  overrides: Partial<CharacterPreviewModel> = {},
): CharacterPreviewModel {
  return {
    unitId: 'main-hero',
    name: 'Pilgrim',
    visuals: {
      background: 'background/pilgrim-road',
      body: 'body/pilgrim',
      costume: 'costume/base-tunic',
      hair: 'hair/umber-long',
    },
    equippedItems: {},
    ...overrides,
  };
}

describe('buildCharacterPreviewLayers', () => {
  it('returns layers in the strict preview order', () => {
    const layers = buildCharacterPreviewLayers(
      createPreviewModel({
        equippedItems: {
          costume: {
            itemId: 'pilgrim-mantle',
            itemName: 'Pilgrim Mantle',
            slot: 'costume',
            layerId: 'costume',
            assetId: 'costume/pilgrim-mantle',
          },
          headwear: {
            itemId: 'travel-hood',
            itemName: 'Travel Hood',
            slot: 'headwear',
            layerId: 'headwear',
            assetId: 'headwear/travel-hood',
            replaceHair: false,
          },
          weapon: {
            itemId: 'oak-staff',
            itemName: 'Oak Staff',
            slot: 'weapon',
            layerId: 'weapon',
            assetId: 'weapon/oak-staff',
          },
          aura: {
            itemId: 'ember-aura',
            itemName: 'Ember Aura',
            slot: 'aura',
            layerId: 'aura',
            assetId: 'aura/ember-aura',
          },
        },
      }),
    );

    expect(layers.map((layer) => layer.id)).toEqual([
      'background',
      'body',
      'costume',
      'hair',
      'headwear',
      'weapon',
      'aura',
    ]);
  });

  it('keeps hair when headwear does not replace it', () => {
    const layers = buildCharacterPreviewLayers(
      createPreviewModel({
        equippedItems: {
          headwear: {
            itemId: 'travel-hood',
            itemName: 'Travel Hood',
            slot: 'headwear',
            layerId: 'headwear',
            assetId: 'headwear/travel-hood',
            replaceHair: false,
          },
        },
      }),
    );

    expect(layers.some((layer) => layer.id === 'hair')).toBe(true);
    expect(layers.some((layer) => layer.id === 'headwear')).toBe(true);
  });

  it('hides hair when headwear replaces it', () => {
    const layers = buildCharacterPreviewLayers(
      createPreviewModel({
        equippedItems: {
          headwear: {
            itemId: 'iron-helm',
            itemName: 'Iron Helm',
            slot: 'headwear',
            layerId: 'headwear',
            assetId: 'headwear/iron-helm',
            replaceHair: true,
          },
        },
      }),
    );

    expect(layers.some((layer) => layer.id === 'hair')).toBe(false);
    expect(layers.some((layer) => layer.id === 'headwear')).toBe(true);
  });

  it('skips layers with missing assets without breaking the preview', () => {
    const layers = buildCharacterPreviewLayers(
      createPreviewModel({
        visuals: {
          body: 'body/pilgrim',
        },
        equippedItems: {
          weapon: {
            itemId: 'broken-weapon',
            itemName: 'Broken Weapon',
            slot: 'weapon',
            layerId: 'weapon',
          },
        },
      }),
    );

    expect(layers.map((layer) => layer.id)).toEqual(['body']);
  });
});
