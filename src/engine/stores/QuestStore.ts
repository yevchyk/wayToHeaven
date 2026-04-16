import { makeAutoObservable, observable } from 'mobx';

import { QuestRuntimeEngine } from '@engine/systems/quests/QuestRuntimeEngine';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { GameEffect } from '@engine/types/effects';
import {
  getQuestStageById,
  type QuestDefinition,
  type QuestSnapshot,
  type QuestRuntimeState,
} from '@engine/types/quest';

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
        {
          stateId: objectiveState.stateId,
          stageId: objectiveState.stageId,
          objectiveId: objectiveState.objectiveId,
          progress: objectiveState.progress,
          completed: objectiveState.completed,
        },
      ]),
    ),
  };
}

function createQuestState(questId: string): QuestRuntimeState {
  return {
    questId,
    status: 'active',
    progress: 0,
    activeStageId: null,
    completedStageIds: [],
    objectiveStates: {},
  };
}

export class QuestStore {
  readonly rootStore: GameRootStore;
  readonly runtimeEngine: QuestRuntimeEngine;

  readonly states = observable.map<string, QuestRuntimeState>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
    this.runtimeEngine = new QuestRuntimeEngine(rootStore);

    makeAutoObservable(this, { rootStore: false, runtimeEngine: false }, { autoBind: true });
  }

  get snapshot(): QuestSnapshot {
    return Object.fromEntries(
      Array.from(this.states.entries()).map(([questId, state]) => [questId, cloneQuestState(state)]),
    );
  }

  get activeQuests() {
    return Array.from(this.states.values())
      .filter((state) => state.status === 'active')
      .sort((left, right) => left.questId.localeCompare(right.questId));
  }

  get completedQuests() {
    return Array.from(this.states.values())
      .filter((state) => state.status === 'completed')
      .sort((left, right) => left.questId.localeCompare(right.questId));
  }

  get activeMainQuests() {
    return this.activeQuests.filter((state) => this.getQuestDefinition(state.questId)?.category === 'main');
  }

  get activeCharacterQuests() {
    return this.activeQuests.filter((state) => this.getQuestDefinition(state.questId)?.category === 'character');
  }

  get activeDailyQuests() {
    return this.activeQuests.filter((state) => this.getQuestDefinition(state.questId)?.category === 'daily');
  }

  get activeReactiveQuestIds() {
    return this.activeQuests.flatMap((state) => {
      const definition = this.getQuestDefinition(state.questId);
      const activeStage = definition ? getQuestStageById(definition, state.activeStageId) : null;

      return activeStage?.objectives.some((objective) => objective.kind === 'condition') ? [state.questId] : [];
    });
  }

  getQuestDefinition(questId: string): QuestDefinition | null {
    return this.rootStore.questRegistry[questId] ?? null;
  }

  getQuestState(questId: string) {
    const state = this.states.get(questId);

    return state ? cloneQuestState(state) : null;
  }

  getActiveStage(questId: string) {
    const definition = this.getQuestDefinition(questId);
    const state = this.states.get(questId);

    if (!definition || !state?.activeStageId) {
      return null;
    }

    return getQuestStageById(definition, state.activeStageId);
  }

  getActiveObjectiveStates(questId: string) {
    const definition = this.getQuestDefinition(questId);
    const state = this.states.get(questId);

    if (!definition || !state) {
      return [];
    }

    return this.runtimeEngine.getStageObjectiveStates(definition, state);
  }

  hasQuest(questId: string) {
    return this.states.has(questId);
  }

  addQuest(questId: string) {
    const existing = this.states.get(questId);
    const definition = this.getQuestDefinition(questId);

    if (!definition) {
      this.states.set(questId, createQuestState(questId));
      this.reportQuestEvent('New quest', questId);

      return;
    }

    if (existing?.status === 'active') {
      return;
    }

    if (existing?.status === 'completed' && definition.kind !== 'daily') {
      return;
    }

    const transition = this.runtimeEngine.startQuest(definition, definition.kind === 'daily' ? null : existing);

    this.states.set(questId, transition.state);

    if (!existing) {
      this.reportQuestEvent('New quest', questId);
    }

    this.applyQuestTransitionEffects(transition);
  }

  advanceQuest(questId: string, delta = 1, objectiveId?: string) {
    const existing = this.states.get(questId) ?? createQuestState(questId);
    const definition = this.getQuestDefinition(questId);

    if (!definition) {
      const nextProgress = existing.progress + delta;

      this.states.set(questId, {
        ...existing,
        status: 'active',
        progress: nextProgress,
      });
      this.reportQuestEvent(`Quest progress +${delta}`, questId);

      return;
    }

    const transition = this.runtimeEngine.advanceQuest(definition, existing, delta, objectiveId);

    this.states.set(questId, transition.state);

    this.reportQuestEvent(`Quest progress +${delta}`, questId);
    this.reportStageTransitions(questId, transition);
    this.applyQuestTransitionEffects(transition);
  }

  completeQuest(questId: string) {
    const existing = this.states.get(questId) ?? createQuestState(questId);
    const definition = this.getQuestDefinition(questId);

    if (!definition) {
      this.states.set(questId, {
        ...existing,
        status: 'completed',
        progress: existing.progress,
      });
      this.reportQuestEvent('Quest completed', questId);

      return;
    }

    const transition = this.runtimeEngine.completeQuest(definition, existing);

    this.states.set(questId, transition.state);

    this.reportQuestEvent('Quest completed', questId);
    this.applyQuestTransitionEffects(transition);
  }

  syncQuest(questId: string) {
    const definition = this.getQuestDefinition(questId);
    const state = this.states.get(questId);

    if (!definition || !state || state.status === 'completed') {
      return;
    }

    const transition = this.runtimeEngine.syncQuest(definition, state);
    const previousStageId = state.activeStageId;
    this.states.set(questId, transition.state);

    if (previousStageId !== transition.state.activeStageId) {
      this.reportStageTransitions(questId, transition);
    }

    if (transition.questCompleted) {
      this.reportQuestEvent('Quest completed', questId);
    }

    this.applyQuestTransitionEffects(transition);
  }

  syncActiveQuests() {
    for (const questId of Array.from(this.states.keys())) {
      this.syncQuest(questId);
    }
  }

  syncReactiveQuests() {
    for (const questId of this.activeReactiveQuestIds) {
      this.syncQuest(questId);
    }
  }

  restore(snapshot: QuestSnapshot = {}) {
    this.states.clear();

    Object.entries(snapshot).forEach(([questId, state]) => {
      const definition = this.getQuestDefinition(questId);

      if (!definition) {
        this.states.set(questId, {
          questId,
          status: state.status === 'completed' ? 'completed' : 'active',
          progress: typeof state.progress === 'number' ? state.progress : 0,
          activeStageId: null,
          completedStageIds: [],
          objectiveStates: {},
        });

        return;
      }

      const hydrated = this.runtimeEngine.hydrateState(definition, {
        questId,
        status: state.status === 'completed' ? 'completed' : 'active',
        progress: typeof state.progress === 'number' ? state.progress : 0,
        activeStageId: state.activeStageId ?? null,
        completedStageIds: Array.isArray(state.completedStageIds) ? [...state.completedStageIds] : [],
        objectiveStates:
          state.objectiveStates && typeof state.objectiveStates === 'object'
            ? { ...state.objectiveStates }
            : {},
      });

      this.states.set(questId, {
        ...hydrated,
      });
    });
  }

  reset() {
    this.states.clear();
  }

  private reportQuestEvent(prefix: string, questId: string) {
    const title = this.getQuestDefinition(questId)?.title ?? questId;

    this.rootStore.backlog.appendEntry({
      kind: 'system',
      flowId: this.rootStore.sceneFlow.activeFlowId,
      nodeId: this.rootStore.sceneFlow.currentNodeId,
      speakerId: null,
      speakerName: null,
      text: `${prefix}: ${title}`,
    });
    this.rootStore.ui.notify(`${prefix}: ${title}`, prefix === 'Quest completed' ? 'success' : 'info');
  }

  private reportStageTransitions(
    questId: string,
    transition: {
      enteredStageIds: string[];
      completedStageIds: string[];
    },
  ) {
    const definition = this.getQuestDefinition(questId);

    if (!definition) {
      return;
    }

    transition.completedStageIds.forEach((stageId) => {
      const stage = getQuestStageById(definition, stageId);

      if (!stage) {
        return;
      }

      this.rootStore.backlog.appendEntry({
        kind: 'system',
        flowId: this.rootStore.sceneFlow.activeFlowId,
        nodeId: this.rootStore.sceneFlow.currentNodeId,
        speakerId: null,
        speakerName: null,
        text: `Quest stage completed: ${stage.title}`,
      });
    });

    transition.enteredStageIds.forEach((stageId) => {
      const stage = getQuestStageById(definition, stageId);

      if (!stage) {
        return;
      }

      this.rootStore.ui.notify(`Quest updated: ${stage.title}`, 'info');
    });
  }

  private applyQuestTransitionEffects(transition: {
    effectsToApply: readonly GameEffect[];
    questCompleted: boolean;
  }) {
    if (transition.effectsToApply.length === 0) {
      return;
    }

    this.rootStore.executeEffects(transition.effectsToApply);
  }
}
