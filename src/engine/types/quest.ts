export const QUEST_CATEGORIES = ['main', 'character', 'daily'] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const QUEST_KINDS = ['persistent', 'branching', 'episodic', 'daily'] as const;
export type QuestKind = (typeof QUEST_KINDS)[number];

export const QUEST_STATUSES = ['active', 'completed'] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export interface QuestDefinition {
  id: string;
  title: string;
  category: QuestCategory;
  description?: string;
  ownerId?: string;
  kind?: QuestKind;
  pinned?: boolean;
  hasProgressBar?: boolean;
  maxProgress?: number;
}

export interface QuestRuntimeState {
  questId: string;
  status: QuestStatus;
  progress: number;
}

export type QuestSnapshot = Record<string, QuestRuntimeState>;
