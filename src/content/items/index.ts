import { ashReed } from '@content/items/ashReed';
import { basicPotion } from '@content/items/basicPotion';
import { bloodMoss } from '@content/items/bloodMoss';
import { edranFoldingKnife } from '@content/items/edranFoldingKnife';
import { emberAura } from '@content/items/emberAura';
import { fieldRation } from '@content/items/fieldRation';
import { graveBloom } from '@content/items/graveBloom';
import { heirloomComb } from '@content/items/heirloomComb';
import { holyWater } from '@content/items/holyWater';
import { ironHelm } from '@content/items/ironHelm';
import { oakStaff } from '@content/items/oakStaff';
import { pilgrimSeal } from '@content/items/pilgrimSeal';
import { pilgrimMantle } from '@content/items/pilgrimMantle';
import { roughBandage } from '@content/items/roughBandage';
import { pitchBomb } from '@content/items/pitchBomb';
import { saltThorn } from '@content/items/saltThorn';
import { stimulantTincture } from '@content/items/stimulantTincture';
import { travelHood } from '@content/items/travelHood';
import { travelRation } from '@content/items/travelRation';
import { thornSealFragment } from '@content/items/thornSealFragment';
import { wolfThyme } from '@content/items/wolfThyme';
import type { ItemData } from '@engine/types/item';

export const itemContentRegistry = {
  [basicPotion.id]: basicPotion,
  [bloodMoss.id]: bloodMoss,
  [wolfThyme.id]: wolfThyme,
  [ashReed.id]: ashReed,
  [graveBloom.id]: graveBloom,
  [saltThorn.id]: saltThorn,
  [holyWater.id]: holyWater,
  [roughBandage.id]: roughBandage,
  [pitchBomb.id]: pitchBomb,
  [fieldRation.id]: fieldRation,
  [stimulantTincture.id]: stimulantTincture,
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
