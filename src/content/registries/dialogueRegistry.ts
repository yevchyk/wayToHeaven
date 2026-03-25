import type { DialogueData } from '@engine/types/dialogue';

import { chapter1AwakeningDialogue } from '@content/chapters/chapter-1/scenes/awakening/awakening.dialogue';
import { chapter1CityGateDialogue } from '@content/chapters/chapter-1/scenes/city-gate/city-gate.dialogue';
import { chapter1IntroDialogue } from '@content/chapters/chapter-1/scenes/intro/intro.dialogue';
import { chapterRegistry } from '@content/registries/chapterRegistry';
import { sceneRegistry } from '@content/registries/sceneRegistry';

export const dialogueContentRegistry: Record<string, DialogueData> = {
  [chapter1IntroDialogue.id]: chapter1IntroDialogue,
  [chapter1AwakeningDialogue.id]: chapter1AwakeningDialogue,
  [chapter1CityGateDialogue.id]: chapter1CityGateDialogue,
};

export const sceneDialogueRegistry = Object.values(sceneRegistry).reduce<Record<string, string>>(
  (registry, sceneMeta) => {
    registry[sceneMeta.id] = sceneMeta.mainDialogueId;

    return registry;
  },
  {},
);

export function getDialogueBySceneId(sceneId: string) {
  const dialogueId = sceneDialogueRegistry[sceneId];

  return dialogueId ? dialogueContentRegistry[dialogueId] ?? null : null;
}

export function getStartDialogueForChapter(chapterId: string) {
  const chapter = chapterRegistry[chapterId];

  if (!chapter) {
    return null;
  }

  return getDialogueBySceneId(chapter.startSceneId);
}
