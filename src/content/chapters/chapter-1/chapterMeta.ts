import type { ChapterMeta } from '@engine/types/narrative';

import { chapter1BackgroundIds } from './assets';

export const chapter1Meta: ChapterMeta = {
  id: 'chapter-1',
  title: 'Chapter 1: Over The City, Under The Earth',
  order: 1,
  startSceneId: 'chapter-1/scene/intro',
  description: 'A long visual-novel prologue that introduces Mirella, the Thorne household, collapse, captivity, and the first contact with the parasitic force below.',
  startingBackgroundId: 'chapter-1/backgrounds/mansion-dining-hall.webp',
};
