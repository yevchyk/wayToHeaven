import type { DialogueData } from '@engine/types/dialogue';

import { chapterRegistry } from '@content/registries/chapterRegistry';
import { sceneRegistry } from '@content/registries/sceneRegistry';
import { adaptSceneFlowToDialogueView } from '@engine/systems/scenes/sceneFlowViewAdapters';

import { sceneFlowRegistry } from './sceneFlowRegistry';

export const dialogueContentRegistry: Record<string, DialogueData> = Object.fromEntries(
  Object.values(sceneFlowRegistry)
    .filter((sceneFlow) => sceneFlow.mode === 'sequence')
    .map((sceneFlow): [string, DialogueData] => {
      const dialogue = adaptSceneFlowToDialogueView(sceneFlow);

      if (!dialogue) {
        throw new Error(`Expected sequence scene flow "${sceneFlow.id}" to adapt into dialogue view.`);
      }

      return [sceneFlow.id, dialogue];
    }),
);

export const sceneDialogueRegistry = Object.values(sceneRegistry).reduce<Record<string, string>>(
  (registry, sceneMeta) => {
    if (sceneMeta.mainSceneFlowId && dialogueContentRegistry[sceneMeta.mainSceneFlowId]) {
      registry[sceneMeta.id] = sceneMeta.mainSceneFlowId;
    }

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
