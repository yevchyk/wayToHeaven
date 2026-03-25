import { guardBattle } from '@content/battles/guardBattle';
import type { BattleTemplate } from '@engine/types/battle';

export const battleContentRegistry = {
  [guardBattle.id]: guardBattle,
} satisfies Record<string, BattleTemplate>;

