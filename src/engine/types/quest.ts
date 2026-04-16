import type { Condition } from '@engine/types/conditions';
import type { GameEffect } from '@engine/types/effects';

export const QUEST_CATEGORIES = ['main', 'character', 'daily'] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const QUEST_KINDS = ['persistent', 'branching', 'episodic', 'daily'] as const;
export type QuestKind = (typeof QUEST_KINDS)[number];

export const QUEST_STATUSES = ['active', 'completed'] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export const QUEST_OBJECTIVE_KINDS = ['counter', 'condition'] as const;
export type QuestObjectiveKind = (typeof QUEST_OBJECTIVE_KINDS)[number];

export interface QuestObjectiveDefinition {
  id: string;
  label: string;
  description?: string;
  kind: QuestObjectiveKind;
  targetValue?: number;
  hidden?: boolean;
  conditions?: readonly Condition[];
}

export interface QuestStageDefinition {
  id: string;
  title: string;
  description?: string;
  objectives: readonly QuestObjectiveDefinition[];
  onEnterEffects?: readonly GameEffect[];
  onCompleteEffects?: readonly GameEffect[];
  nextStageId?: string;
}

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
  startStageId?: string;
  stages?: readonly QuestStageDefinition[];
  completionEffects?: readonly GameEffect[];
}

export interface QuestObjectiveRuntimeState {
  stateId: string;
  stageId: string;
  objectiveId: string;
  progress: number;
  completed: boolean;
}

export interface QuestRuntimeState {
  questId: string;
  status: QuestStatus;
  progress: number;
  activeStageId: string | null;
  completedStageIds: string[];
  objectiveStates: Record<string, QuestObjectiveRuntimeState>;
}

export type QuestSnapshot = Record<string, QuestRuntimeState>;

export function buildQuestObjectiveStateId(stageId: string, objectiveId: string) {
  return `${stageId}:${objectiveId}`;
}

export function getQuestStages(definition: QuestDefinition) {
  return definition.stages ?? [];
}

export function getQuestStageById(definition: QuestDefinition, stageId: string | null | undefined) {
  if (!stageId) {
    return null;
  }

  return getQuestStages(definition).find((stage) => stage.id === stageId) ?? null;
}

export function getQuestStartStageId(definition: QuestDefinition) {
  if (!definition.stages || definition.stages.length === 0) {
    return null;
  }

  return definition.startStageId ?? definition.stages[0]?.id ?? null;
}
