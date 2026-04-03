import type { NarrativeCharacterData } from '@engine/types/narrative';

import { gateGuardNpc } from '@content/chapters/chapter-1/npcs/gate-guard.npc';
import { heroineNpc } from '@content/chapters/chapter-1/npcs/heroine.npc';
import { oldVoiceNpc } from '@content/chapters/chapter-1/npcs/old-voice.npc';
import { chapter1SupportingCastRegistry } from '@content/chapters/chapter-1/npcs/supporting-cast.npc';
import { chapter2CityCastRegistry } from '@content/chapters/chapter-2/npcs/city-cast.npc';

export const narrativeCharacterRegistry: Record<string, NarrativeCharacterData> = {
  [heroineNpc.id]: heroineNpc,
  [oldVoiceNpc.id]: oldVoiceNpc,
  [gateGuardNpc.id]: gateGuardNpc,
  ...chapter1SupportingCastRegistry,
  ...chapter2CityCastRegistry,
};
