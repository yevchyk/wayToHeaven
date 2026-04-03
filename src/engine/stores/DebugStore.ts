import { makeAutoObservable } from 'mobx';

import type { EffectExecutionResult } from '@engine/types/effects';
import type { NarrativeProfileKey } from '@engine/types/profile';
import type { ContentGraphValidationIssue } from '@engine/validators/ContentGraphValidator';
import type { SceneFlowPresentationState } from '@engine/types/sceneFlow';
import type { GameRootStore } from '@engine/stores/GameRootStore';

interface DebugEffectLogEntry {
  id: string;
  type: string;
  status: string;
  details: string | null;
}

interface DebugPresentationLogEntry {
  id: string;
  flowId: string | null;
  nodeId: string | null;
  source: string;
  snapshot: SceneFlowPresentationState;
}

export interface DebugStatChangeLogEntry {
  id: string;
  key: NarrativeProfileKey;
  source: string;
  previousValue: number;
  nextValue: number;
  previousUnlocked: boolean;
  nextUnlocked: boolean;
}

const MAX_EFFECT_LOG_ENTRIES = 40;
const MAX_PRESENTATION_LOG_ENTRIES = 24;
const MAX_STAT_CHANGE_LOG_ENTRIES = 32;

function clonePresentationSnapshot(snapshot: SceneFlowPresentationState): SceneFlowPresentationState {
  return {
    ...snapshot,
    currentStage: snapshot.currentStage
      ? {
          ...snapshot.currentStage,
          ...(snapshot.currentStage.characters
            ? {
                characters: snapshot.currentStage.characters.map((character) => ({ ...character })),
              }
            : {}),
          ...(snapshot.currentStage.extra
            ? {
                extra: snapshot.currentStage.extra.map((character) => ({ ...character })),
              }
            : {}),
          ...(snapshot.currentStage.left !== undefined
            ? { left: snapshot.currentStage.left ? { ...snapshot.currentStage.left } : null }
            : {}),
          ...(snapshot.currentStage.center !== undefined
            ? { center: snapshot.currentStage.center ? { ...snapshot.currentStage.center } : null }
            : {}),
          ...(snapshot.currentStage.right !== undefined
            ? { right: snapshot.currentStage.right ? { ...snapshot.currentStage.right } : null }
            : {}),
        }
      : null,
    activeTransition: snapshot.activeTransition ? { ...snapshot.activeTransition } : null,
  };
}

export class DebugStore {
  readonly rootStore: GameRootStore;

  enabled = false;
  effectLog: DebugEffectLogEntry[] = [];
  presentationLog: DebugPresentationLogEntry[] = [];
  statChangeLog: DebugStatChangeLogEntry[] = [];
  validationIssues: ContentGraphValidationIssue[] = [];

  private sequence = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, {
      rootStore: false,
    }, { autoBind: true });
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
  }

  recordEffect(result: EffectExecutionResult) {
    this.sequence += 1;

    this.effectLog = [
      {
        id: `debug-effect-${this.sequence}`,
        type: result.effect.type,
        status: result.status,
        details: result.details ?? null,
      },
      ...this.effectLog,
    ].slice(0, MAX_EFFECT_LOG_ENTRIES);
  }

  recordPresentation(input: {
    flowId: string | null;
    nodeId: string | null;
    source: string;
    snapshot: SceneFlowPresentationState;
  }) {
    this.sequence += 1;

    this.presentationLog = [
      {
        id: `debug-presentation-${this.sequence}`,
        flowId: input.flowId,
        nodeId: input.nodeId,
        source: input.source,
        snapshot: clonePresentationSnapshot(input.snapshot),
      },
      ...this.presentationLog,
    ].slice(0, MAX_PRESENTATION_LOG_ENTRIES);
  }

  recordStatChange(input: Omit<DebugStatChangeLogEntry, 'id'>) {
    if (
      input.previousValue === input.nextValue &&
      input.previousUnlocked === input.nextUnlocked
    ) {
      return;
    }

    this.sequence += 1;

    this.statChangeLog = [
      {
        id: `debug-stat-${this.sequence}`,
        ...input,
      },
      ...this.statChangeLog,
    ].slice(0, MAX_STAT_CHANGE_LOG_ENTRIES);
  }

  runValidation() {
    this.validationIssues = this.rootStore.validateContentGraph();

    return this.validationIssues;
  }

  reset() {
    this.effectLog = [];
    this.presentationLog = [];
    this.statChangeLog = [];
    this.validationIssues = [];
    this.sequence = 0;
  }
}
