import { basicPotion } from '@content/items/basicPotion';
import { edranFoldingKnife } from '@content/items/edranFoldingKnife';
import { emberAura } from '@content/items/emberAura';
import { heirloomComb } from '@content/items/heirloomComb';
import { ironHelm } from '@content/items/ironHelm';
import { oakStaff } from '@content/items/oakStaff';
import { pilgrimSeal } from '@content/items/pilgrimSeal';
import { pilgrimMantle } from '@content/items/pilgrimMantle';
import { travelHood } from '@content/items/travelHood';
import { travelRation } from '@content/items/travelRation';
import { thornSealFragment } from '@content/items/thornSealFragment';
import type { ItemData } from '@engine/types/item';

export const itemContentRegistry = {
  [basicPotion.id]: basicPotion,
  [edranFoldingKnife.id]: edranFoldingKnife,
  [pilgrimMantle.id]: pilgrimMantle,
  [travelHood.id]: travelHood,
  [heirloomComb.id]: heirloomComb,
  [ironHelm.id]: ironHelm,
  [oakStaff.id]: oakStaff,
  [emberAura.id]: emberAura,
  [thornSealFragment.id]: thornSealFragment,
  [travelRation.id]: travelRation,
  [pilgrimSeal.id]: pilgrimSeal,
} satisfies Record<string, ItemData>;
