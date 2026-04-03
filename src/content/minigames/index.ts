import { danceLanternStep } from '@content/minigames/danceLanternStep';
import { fishingReedBank } from '@content/minigames/fishingReedBank';
import type { MiniGameData } from '@engine/types/minigame';

export const miniGameContentRegistry = {
  [fishingReedBank.id]: fishingReedBank,
  [danceLanternStep.id]: danceLanternStep,
} satisfies Record<string, MiniGameData>;
