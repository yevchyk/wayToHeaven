import type { QuestDefinition } from '@engine/types/quest';

import { chapter1CaravanToHugenUmQuestRegistry } from '@content/chapters/chapter-1/quests/caravan-to-hugen-um.quests';
import { chapter2HugenUmQuestRegistry } from '@content/chapters/chapter-2/quests/hugen-um.quests';

export const questRegistry: Record<string, QuestDefinition> = {
  ...chapter1CaravanToHugenUmQuestRegistry,
  ...chapter2HugenUmQuestRegistry,
};
