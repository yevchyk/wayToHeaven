import { caravanAmbushBattle } from '@content/battles/caravanAmbushBattle';
import { caravanSaltPassBattle } from '@content/battles/caravanSaltPassBattle';
import { battleVisualLab } from '@content/battles/battleVisualLab';
import { guardBattle } from '@content/battles/guardBattle';
import { wolfPackBattle } from '@content/battles/wolfPackBattle';
import type { BattleTemplate } from '@engine/types/battle';

export const battleContentRegistry = {
  [battleVisualLab.id]: battleVisualLab,
  [caravanAmbushBattle.id]: caravanAmbushBattle,
  [caravanSaltPassBattle.id]: caravanSaltPassBattle,
  [guardBattle.id]: guardBattle,
  [wolfPackBattle.id]: wolfPackBattle,
} satisfies Record<string, BattleTemplate>;
