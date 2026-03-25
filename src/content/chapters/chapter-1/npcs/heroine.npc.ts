import type { NarrativeCharacterData } from '@engine/types/narrative';

import { chapter1PortraitIds } from '../assets';

export const heroineNpc: NarrativeCharacterData = {
  id: 'heroine',
  chapterId: 'chapter-1',
  displayName: 'Heroine',
  defaultEmotion: 'neutral',
  defaultPortraitId: chapter1PortraitIds.heroine.neutral,
  defaultSide: 'left',
  portraitRefs: {
    neutral: chapter1PortraitIds.heroine.neutral,
    afraid: chapter1PortraitIds.heroine.afraid,
    determined: chapter1PortraitIds.heroine.determined,
  },
  description: 'The player-facing protagonist at the start of Chapter 1.',
};
