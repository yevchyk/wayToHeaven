import type { ItemData } from '@engine/types/item';

export const pitchBomb: ItemData = {
  id: 'pitch-bomb',
  name: 'Pitch Bomb',
  description: 'A clay bomb packed with pitch and cinders. It bursts against one enemy for sharp fire damage.',
  type: 'consumable',
  stackable: true,
  maxStack: 10,
  targetScope: 'enemy',
  effects: [
    {
      type: 'dealDamage',
      amount: 16,
      damageKind: 'fire',
      targetScope: 'unit',
    },
  ],
};
