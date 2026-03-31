import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { CitySceneAction } from '@engine/types/city';

export class CitySceneController {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  startScene(sceneId: string) {
    return this.rootStore.sceneFlowController.startCityScene(sceneId);
  }

  getVisibleActions() {
    const scene = this.rootStore.city.currentScene;
    const visibleTransitionIds = new Set(this.rootStore.sceneFlow.visibleTransitionIds);

    if (!scene) {
      return [];
    }

    return scene.actions.filter((action) => visibleTransitionIds.has(action.id));
  }

  chooseAction(actionId: string) {
    return this.rootStore.sceneFlowController.chooseTransition(actionId);
  }

  isActionAvailable(action: CitySceneAction) {
    return this.getVisibleActions().some((visibleAction) => visibleAction.id === action.id);
  }
}
