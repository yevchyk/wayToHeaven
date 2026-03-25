import type { NarrativeCharacterData } from '@engine/types/narrative';

import { chapter1PortraitIds } from '../assets';

export const gateGuardNpc: NarrativeCharacterData = {
  id: 'gate-guard',
  chapterId: 'chapter-1',
  displayName: 'Gate Guard',
  defaultEmotion: 'stern',
  defaultPortraitId: chapter1PortraitIds.gateGuard.stern,
  defaultSide: 'right',
  portraitRefs: {
    stern: chapter1PortraitIds.gateGuard.stern,
    warm: chapter1PortraitIds.gateGuard.warm,
    angry: chapter1PortraitIds.gateGuard.angry,
    neutral: chapter1PortraitIds.gateGuard.neutral,
  },
  description: 'The checkpoint guard encountered when the player reaches the city gate.',
};
