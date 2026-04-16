import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { GameEffect } from '@engine/types/effects';
import {
  buildQuestObjectiveStateId,
  getQuestStageById,
  getQuestStages,
  getQuestStartStageId,
  type QuestDefinition,
  type QuestObjectiveDefinition,
  type QuestObjectiveRuntimeState,
  type QuestRuntimeState,
  type QuestStageDefinition,
} from '@engine/types/quest';

export interface QuestRuntimeTransition {
  state: QuestRuntimeState;
  effectsToApply: GameEffect[];
  enteredStageIds: string[];
  completedStageIds: string[];
  questCompleted: boolean;
}

function cloneObjectiveState(
  state: QuestObjectiveRuntimeState,
): QuestObjectiveRuntimeState {
  return {
    stateId: state.stateId,
    stageId: state.stageId,
    objectiveId: state.objectiveId,
    progress: state.progress,
    completed: state.completed,
  };
}

function cloneQuestState(state: QuestRuntimeState): QuestRuntimeState {
  return {
    questId: state.questId,
    status: state.status,
    progress: state.progress,
    activeStageId: state.activeStageId,
    completedStageIds: [...state.completedStageIds],
    objectiveStates: Object.fromEntries(
      Object.entries(state.objectiveStates).map(([stateId, objectiveState]) => [
        stateId,
        cloneObjectiveState(objectiveState),
      ]),
    ),
  };
}

function createObjectiveState(
  stageId: string,
  objectiveId: string,
): QuestObjectiveRuntimeState {
  return {
    stateId: buildQuestObjectiveStateId(stageId, objectiveId),
    stageId,
    objectiveId,
    progress: 0,
    completed: false,
  };
}

function createLegacyQuestState(questId: string): QuestRuntimeState {
  return {
    questId,
    status: 'active',
    progress: 0,
    activeStageId: null,
    completedStageIds: [],
    objectiveStates: {},
  };
}

function getObjectiveWeight(objective: QuestObjectiveDefinition) {
  if (objective.kind === 'counter') {
    return Math.max(1, objective.targetValue ?? 1);
  }

  return 1;
}

function clampObjectiveProgress(objective: QuestObjectiveDefinition, progress: number) {
  const nextProgress = Math.max(0, progress);

  if (objective.kind !== 'counter') {
    return nextProgress > 0 ? 1 : 0;
  }

  return Math.min(nextProgress, Math.max(1, objective.targetValue ?? 1));
}

export class QuestRuntimeEngine {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  createInitialState(definition: QuestDefinition) {
    const state = createLegacyQuestState(definition.id);

    if (definition.stages && definition.stages.length > 0) {
      state.activeStageId = getQuestStartStageId(definition);
      this.ensureStageObjectiveStates(definition, state);
      state.progress = this.calculateSummaryProgress(definition, state);
    }

    return state;
  }

  hydrateState(definition: QuestDefinition, partial?: QuestRuntimeState | null) {
    const baseState = partial ? cloneQuestState(partial) : this.createInitialState(definition);
    const knownStageIds = new Set(getQuestStages(definition).map((stage) => stage.id));

    baseState.completedStageIds = baseState.completedStageIds.filter((stageId) => knownStageIds.has(stageId));

    if (!definition.stages || definition.stages.length === 0) {
      baseState.activeStageId = null;
      baseState.objectiveStates = {};
      baseState.progress = Math.max(0, partial?.progress ?? 0);

      return baseState;
    }

    const startStageId = getQuestStartStageId(definition);

    if (!baseState.activeStageId || !knownStageIds.has(baseState.activeStageId)) {
      baseState.activeStageId = baseState.status === 'completed' ? null : startStageId;
    }

    const validObjectiveStateIds = new Set<string>();

    for (const stage of definition.stages) {
      for (const objective of stage.objectives) {
        validObjectiveStateIds.add(buildQuestObjectiveStateId(stage.id, objective.id));
      }
    }

    baseState.objectiveStates = Object.fromEntries(
      Object.entries(baseState.objectiveStates).filter(([stateId]) => validObjectiveStateIds.has(stateId)),
    );
    this.ensureStageObjectiveStates(definition, baseState);
    baseState.progress = this.calculateSummaryProgress(definition, baseState);

    return baseState;
  }

  startQuest(definition: QuestDefinition, existingState?: QuestRuntimeState | null): QuestRuntimeTransition {
    const state = this.hydrateState(definition, existingState);

    state.status = 'active';

    return this.resolve(definition, state, {
      enterCurrentStage: true,
    });
  }

  advanceQuest(
    definition: QuestDefinition,
    currentState: QuestRuntimeState | null | undefined,
    delta = 1,
    objectiveId?: string,
  ): QuestRuntimeTransition {
    const state = this.hydrateState(definition, currentState);

    state.status = 'active';

    if (!definition.stages || definition.stages.length === 0) {
      state.progress = definition.maxProgress
        ? Math.min(state.progress + delta, definition.maxProgress)
        : state.progress + delta;

      return {
        state,
        effectsToApply: [],
        enteredStageIds: [],
        completedStageIds: [],
        questCompleted: false,
      };
    }

    const activeStage = getQuestStageById(definition, state.activeStageId);

    if (activeStage) {
      this.ensureStageObjectiveStates(definition, state);

      const counterObjectives = activeStage.objectives.filter((objective) => objective.kind === 'counter');
      const targetObjectives = objectiveId
        ? counterObjectives.filter((objective) => objective.id === objectiveId)
        : counterObjectives.length === 1
          ? counterObjectives
          : [];

      for (const objective of targetObjectives) {
        const stateId = buildQuestObjectiveStateId(activeStage.id, objective.id);
        const objectiveState = state.objectiveStates[stateId] ?? createObjectiveState(activeStage.id, objective.id);
        const nextProgress = clampObjectiveProgress(objective, objectiveState.progress + delta);

        state.objectiveStates[stateId] = {
          ...objectiveState,
          progress: nextProgress,
          completed: nextProgress >= getObjectiveWeight(objective),
        };
      }
    }

    return this.resolve(definition, state);
  }

  syncQuest(definition: QuestDefinition, currentState: QuestRuntimeState): QuestRuntimeTransition {
    const state = this.hydrateState(definition, currentState);

    return this.resolve(definition, state);
  }

  completeQuest(definition: QuestDefinition, currentState?: QuestRuntimeState | null): QuestRuntimeTransition {
    const state = this.hydrateState(definition, currentState);

    state.status = 'completed';
    state.activeStageId = null;
    state.progress = definition.maxProgress ?? this.calculateSummaryProgress(definition, state);

    return {
      state,
      effectsToApply: [...(definition.completionEffects ?? [])],
      enteredStageIds: [],
      completedStageIds: [],
      questCompleted: true,
    };
  }

  getStageObjectiveStates(definition: QuestDefinition, state: QuestRuntimeState) {
    const activeStage = getQuestStageById(definition, state.activeStageId);

    if (!activeStage) {
      return [];
    }

    return activeStage.objectives.map((objective) => {
      const stateId = buildQuestObjectiveStateId(activeStage.id, objective.id);

      return {
        definition: objective,
        state: state.objectiveStates[stateId] ?? createObjectiveState(activeStage.id, objective.id),
      };
    });
  }

  private resolve(
    definition: QuestDefinition,
    initialState: QuestRuntimeState,
    options: { enterCurrentStage?: boolean } = {},
  ): QuestRuntimeTransition {
    const state = this.hydrateState(definition, initialState);
    const effectsToApply: GameEffect[] = [];
    const enteredStageIds: string[] = [];
    const completedStageIds: string[] = [];
    let questCompleted = false;

    if (!definition.stages || definition.stages.length === 0 || state.status === 'completed') {
      state.progress =
        state.status === 'completed'
          ? definition.maxProgress ?? Math.max(0, state.progress)
          : this.calculateSummaryProgress(definition, state);

      return {
        state,
        effectsToApply,
        enteredStageIds,
        completedStageIds,
        questCompleted: state.status === 'completed',
      };
    }

    if (options.enterCurrentStage && state.activeStageId) {
      const currentStage = getQuestStageById(definition, state.activeStageId);

      if (currentStage) {
        enteredStageIds.push(currentStage.id);
        effectsToApply.push(...(currentStage.onEnterEffects ?? []));
      }
    }

    let safety = definition.stages.length + 1;

    while (safety > 0 && state.status !== 'completed' && state.activeStageId) {
      safety -= 1;

      const activeStage = getQuestStageById(definition, state.activeStageId);

      if (!activeStage) {
        break;
      }

      this.ensureStageObjectiveStates(definition, state);
      this.syncConditionObjectives(activeStage, state);

      if (!this.isStageComplete(activeStage, state)) {
        break;
      }

      completedStageIds.push(activeStage.id);

      if (!state.completedStageIds.includes(activeStage.id)) {
        state.completedStageIds.push(activeStage.id);
      }

      effectsToApply.push(...(activeStage.onCompleteEffects ?? []));

      if (activeStage.nextStageId) {
        state.activeStageId = activeStage.nextStageId;
        this.ensureStageObjectiveStates(definition, state);
        enteredStageIds.push(activeStage.nextStageId);

        const nextStage = getQuestStageById(definition, activeStage.nextStageId);

        if (nextStage) {
          effectsToApply.push(...(nextStage.onEnterEffects ?? []));
        }

        continue;
      }

      state.status = 'completed';
      state.activeStageId = null;
      effectsToApply.push(...(definition.completionEffects ?? []));
      questCompleted = true;
    }

    state.progress =
      state.status === 'completed'
        ? definition.maxProgress ?? this.calculateSummaryProgress(definition, state)
        : this.calculateSummaryProgress(definition, state);

    return {
      state,
      effectsToApply,
      enteredStageIds,
      completedStageIds,
      questCompleted,
    };
  }

  private ensureStageObjectiveStates(definition: QuestDefinition, state: QuestRuntimeState) {
    const activeStage = getQuestStageById(definition, state.activeStageId);

    if (!activeStage) {
      return;
    }

    for (const objective of activeStage.objectives) {
      const stateId = buildQuestObjectiveStateId(activeStage.id, objective.id);

      if (!(stateId in state.objectiveStates)) {
        state.objectiveStates[stateId] = createObjectiveState(activeStage.id, objective.id);
      }
    }
  }

  private syncConditionObjectives(stage: QuestStageDefinition, state: QuestRuntimeState) {
    for (const objective of stage.objectives) {
      if (objective.kind !== 'condition') {
        continue;
      }

      const stateId = buildQuestObjectiveStateId(stage.id, objective.id);
      const currentState = state.objectiveStates[stateId] ?? createObjectiveState(stage.id, objective.id);
      const completed =
        objective.conditions?.length && this.rootStore.dialogueConditionEvaluator.evaluateAll(objective.conditions)
          ? true
          : false;

      state.objectiveStates[stateId] = {
        ...currentState,
        progress: completed ? 1 : 0,
        completed,
      };
    }
  }

  private isStageComplete(stage: QuestStageDefinition, state: QuestRuntimeState) {
    return stage.objectives.every((objective) => {
      const stateId = buildQuestObjectiveStateId(stage.id, objective.id);
      const objectiveState = state.objectiveStates[stateId];

      return objectiveState?.completed === true;
    });
  }

  private calculateSummaryProgress(definition: QuestDefinition, state: QuestRuntimeState) {
    if (!definition.stages || definition.stages.length === 0) {
      return Math.max(0, state.progress);
    }

    let completedUnits = 0;
    let totalUnits = 0;

    for (const stage of definition.stages) {
      const stageCompleted = state.completedStageIds.includes(stage.id);

      for (const objective of stage.objectives) {
        const weight = getObjectiveWeight(objective);
        const stateId = buildQuestObjectiveStateId(stage.id, objective.id);
        const objectiveState = state.objectiveStates[stateId];

        totalUnits += weight;

        if (stageCompleted) {
          completedUnits += weight;
          continue;
        }

        if (objective.kind === 'condition') {
          completedUnits += objectiveState?.completed ? 1 : 0;
          continue;
        }

        completedUnits += Math.min(weight, objectiveState?.progress ?? 0);
      }
    }

    if (definition.maxProgress && totalUnits > 0) {
      return Math.min(
        definition.maxProgress,
        Math.round((completedUnits / totalUnits) * definition.maxProgress),
      );
    }

    return Math.round(completedUnits);
  }
}
