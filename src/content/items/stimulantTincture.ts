import type { ItemData } from '@engine/types/item';

export const stimulantTincture: ItemData = {
  id: 'stimulant-tincture',
  name: 'Stimulant Tincture',
  description: 'A sharp herbal tincture that restores mana and leaves the nerves humming.',
  type: 'consumable',
  stackable: true,
  maxStack: 10,
  targetScope: 'ally',
  effects: [
    {
      type: 'restoreResource',
      resource: 'mana',
      amount: 12,
      targetScope: 'unit',
    },
  ],
};
