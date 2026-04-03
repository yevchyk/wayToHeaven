import type { ChapterMeta } from '@engine/types/narrative';

import { chapter2BackgroundIds } from './assets';

export const chapter2Meta: ChapterMeta = {
  id: 'chapter-2',
  title: 'Chapter 2: Hugen-Um',
  order: 2,
  startSceneId: 'chapter-2/scene/arrival',
  description:
    'The first city chapter. Hugen-Um sorts bodies, names, and debts before it offers any illusion of shelter.',
  startingBackgroundId: chapter2BackgroundIds.arrivalGate,
};
