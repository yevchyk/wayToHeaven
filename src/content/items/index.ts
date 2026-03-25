import { basicPotion } from '@content/items/basicPotion';
import { emberAura } from '@content/items/emberAura';
import { ironHelm } from '@content/items/ironHelm';
import { oakStaff } from '@content/items/oakStaff';
import { pilgrimSeal } from '@content/items/pilgrimSeal';
import { pilgrimMantle } from '@content/items/pilgrimMantle';
import { travelHood } from '@content/items/travelHood';
import { travelRation } from '@content/items/travelRation';
import type { ItemData } from '@engine/types/item';

export const itemContentRegistry = {
  [basicPotion.id]: basicPotion,
  [pilgrimMantle.id]: pilgrimMantle,
  [travelHood.id]: travelHood,
  [ironHelm.id]: ironHelm,
  [oakStaff.id]: oakStaff,
  [emberAura.id]: emberAura,
  [travelRation.id]: travelRation,
  [pilgrimSeal.id]: pilgrimSeal,
} satisfies Record<string, ItemData>;
