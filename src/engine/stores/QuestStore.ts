import { makeAutoObservable, observable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { QuestDefinition, QuestSnapshot, QuestRuntimeState } from '@engine/types/quest';

function cloneQuestState(state: QuestRuntimeState): QuestRuntimeState {
  return {
    questId: state.questId,
    status: state.status,
    progress: state.progress,
  };
}

function createQuestState(questId: string): QuestRuntimeState {
  return {
    questId,
    status: 'active',
    progress: 0,
  };
}

export class QuestStore {
  readonly rootStore: GameRootStore;

  readonly states = observable.map<string, QuestRuntimeState>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
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

  getQuestDefinition(questId: string): QuestDefinition | null {
    return this.rootStore.questRegistry[questId] ?? null;
  }

  getQuestState(questId: string) {
    const state = this.states.get(questId);

    return state ? cloneQuestState(state) : null;
  }

  hasQuest(questId: string) {
    return this.states.has(questId);
  }

  addQuest(questId: string) {
    const existing = this.states.get(questId);
    const nextState = existing
      ? {
          ...existing,
          status: 'active' as const,
        }
      : createQuestState(questId);

    this.states.set(questId, nextState);

    if (!existing) {
      this.reportQuestEvent('New quest', questId);
    }
  }

  advanceQuest(questId: string, delta = 1) {
    const existing = this.states.get(questId) ?? createQuestState(questId);
    const definition = this.getQuestDefinition(questId);
    const nextProgress = definition?.maxProgress
      ? Math.min(existing.progress + delta, definition.maxProgress)
      : existing.progress + delta;

    this.states.set(questId, {
      ...existing,
      status: 'active',
      progress: nextProgress,
    });

    this.reportQuestEvent(`Quest progress +${delta}`, questId);
  }

  completeQuest(questId: string) {
    const existing = this.states.get(questId) ?? createQuestState(questId);
    const definition = this.getQuestDefinition(questId);

    this.states.set(questId, {
      ...existing,
      status: 'completed',
      progress: definition?.maxProgress ?? existing.progress,
    });

    this.reportQuestEvent('Quest completed', questId);
  }

  restore(snapshot: QuestSnapshot = {}) {
    this.states.clear();

    Object.entries(snapshot).forEach(([questId, state]) => {
      this.states.set(questId, {
        questId,
        status: state.status === 'completed' ? 'completed' : 'active',
        progress: typeof state.progress === 'number' ? state.progress : 0,
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
}
