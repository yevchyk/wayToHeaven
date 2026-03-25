import type { ItemData } from '@engine/types/item';

export const emberAura: ItemData = {
  id: 'ember-aura',
  name: 'Ember Aura',
  description: 'A faint ritual aura that wraps the wearer in warm cinders.',
  type: 'equipment',
  stackable: false,
  targetScope: 'self',
  equipment: {
    slot: 'aura',
    visual: {
      assetId: 'aura/ember-aura',
      layer: 'aura',
    },
  },
};
