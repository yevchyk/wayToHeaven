import type { NarrativeCharacterData } from '@engine/types/narrative';

import { chapter1PortraitIds } from '../assets';

export const oldVoiceNpc: NarrativeCharacterData = {
  id: 'old-voice',
  chapterId: 'chapter-1',
  displayName: 'Old Voice',
  defaultEmotion: 'calm',
  defaultPortraitId: chapter1PortraitIds.oldVoice.calm,
  defaultSide: 'right',
  portraitRefs: {
    calm: chapter1PortraitIds.oldVoice.calm,
    warm: chapter1PortraitIds.oldVoice.warm,
    stern: chapter1PortraitIds.oldVoice.stern,
  },
  description: 'A disembodied guide who addresses the heroine during the opening dream-prison sequence.',
};
