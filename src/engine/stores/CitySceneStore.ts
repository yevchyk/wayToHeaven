import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import { adaptSceneFlowToCitySceneView } from '@engine/systems/scenes/sceneFlowViewAdapters';
import type { CitySceneData } from '@engine/types/city';

function buildActionKey(sceneId: string, actionId: string) {
  return `${sceneId}:${actionId}`;
}

export class CitySceneStore {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get activeSceneId() {
    return this.rootStore.sceneFlow.activeMode === 'hub'
      ? this.rootStore.sceneFlow.activeFlowId
      : null;
  }

  get visitedSceneIds() {
    return this.rootStore.sceneFlow.visitedHubFlowIds;
  }

  get triggeredActionKeys() {
    return this.rootStore.sceneFlow.triggeredHubTransitionKeys;
  }

  get isActive() {
    return this.activeSceneId !== null;
  }

  get currentScene(): CitySceneData | null {
    if (!this.activeSceneId) {
      return null;
    }

    const activeSourceType = this.rootStore.sceneFlow.activeSourceType;

    if (activeSourceType === 'cityScene') {
      return this.rootStore.getCitySceneById(this.activeSceneId) ?? null;
    }

    if (activeSourceType !== 'sceneGeneration') {
      return null;
    }

    const currentFlow = this.rootStore.sceneFlow.currentFlow;
    const currentNodeId = this.rootStore.sceneFlow.currentNodeId;

    if (!currentFlow || !currentNodeId) {
      return null;
    }

    return adaptSceneFlowToCitySceneView(currentFlow, currentNodeId, {
      resolveDialogueId: (flowId) =>
        this.rootStore.getDialogueById(flowId)?.id ?? null,
      resolveTravelBoardId: (flowId) =>
        this.rootStore.getTravelBoardById(flowId)?.id ?? null,
    });
  }

  setScene(sceneId: string) {
    this.rootStore.sceneFlowController.startCityScene(sceneId);
  }

  markActionTriggered(sceneId: string, actionId: string) {
    this.rootStore.sceneFlow.markHubTransitionTriggered(sceneId, actionId);
  }

  hasTriggeredAction(sceneId: string, actionId: string) {
    return this.triggeredActionKeys.includes(buildActionKey(sceneId, actionId));
  }

  reset() {
    if (this.isActive) {
      this.rootStore.sceneFlow.reset();
    }
  }
}
