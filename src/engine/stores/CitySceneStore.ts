import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { CitySceneData } from '@engine/types/city';

export class CitySceneStore {
  readonly rootStore: GameRootStore;

  activeSceneId: string | null = null;
  visitedSceneIds: string[] = [];
  triggeredActionKeys: string[] = [];

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get isActive() {
    return this.activeSceneId !== null;
  }

  get currentScene(): CitySceneData | null {
    if (!this.activeSceneId) {
      return null;
    }

    return this.rootStore.getCitySceneById(this.activeSceneId) ?? null;
  }

  setScene(sceneId: string) {
    this.activeSceneId = sceneId;

    if (!this.visitedSceneIds.includes(sceneId)) {
      this.visitedSceneIds.push(sceneId);
    }
  }

  markActionTriggered(sceneId: string, actionId: string) {
    const actionKey = `${sceneId}:${actionId}`;

    if (!this.triggeredActionKeys.includes(actionKey)) {
      this.triggeredActionKeys.push(actionKey);
    }
  }

  hasTriggeredAction(sceneId: string, actionId: string) {
    return this.triggeredActionKeys.includes(`${sceneId}:${actionId}`);
  }

  reset() {
    this.activeSceneId = null;
    this.visitedSceneIds = [];
    this.triggeredActionKeys = [];
  }
}
