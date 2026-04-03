import { caravanAmbushBattle } from '@content/battles/caravanAmbushBattle';
import { caravanSaltPassBattle } from '@content/battles/caravanSaltPassBattle';
import { guardBattle } from '@content/battles/guardBattle';
import type { BattleTemplate } from '@engine/types/battle';

export const battleContentRegistry = {
  [caravanAmbushBattle.id]: caravanAmbushBattle,
  [caravanSaltPassBattle.id]: caravanSaltPassBattle,
  [guardBattle.id]: guardBattle,
} satisfies Record<string, BattleTemplate>;
