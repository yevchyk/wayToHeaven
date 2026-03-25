import type { ChapterMeta } from '@engine/types/narrative';

import { chapter1Meta } from '@content/chapters/chapter-1/chapterMeta';

export const chapterRegistry: Record<string, ChapterMeta> = {
  [chapter1Meta.id]: chapter1Meta,
};
