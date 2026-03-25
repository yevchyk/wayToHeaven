import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { CitySceneAction } from '@engine/types/city';

export class CitySceneController {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  startScene(sceneId: string) {
    const scene = this.requireScene(sceneId);

    this.rootStore.citySceneValidator.assertValid(scene);
    this.rootStore.city.setScene(sceneId);
    this.rootStore.ui.setScreen('city');

    if (scene.onEnterEffects?.length) {
      this.rootStore.executeEffects(scene.onEnterEffects);
    }

    return scene;
  }

  getVisibleActions() {
    const scene = this.requireCurrentScene();

    return scene.actions.filter((action) => this.isActionAvailable(action));
  }

  chooseAction(actionId: string) {
    const scene = this.requireCurrentScene();
    const action = this.getVisibleActions().find((entry) => entry.id === actionId);

    if (!action) {
      return false;
    }

    if (action.effects?.length) {
      this.rootStore.executeEffects(action.effects);
    }

    if (action.once) {
      this.rootStore.city.markActionTriggered(scene.id, action.id);
    }

    if (action.nextSceneId) {
      this.startScene(action.nextSceneId);

      return true;
    }

    if (action.dialogueId) {
      this.rootStore.dialogue.startDialogue(action.dialogueId);

      return true;
    }

    if (action.battleTemplateId) {
      this.rootStore.executeEffect({
        type: 'startBattle',
        battleTemplateId: action.battleTemplateId,
      });

      return true;
    }

    if (action.travelBoardId) {
      this.rootStore.executeEffect({
        type: 'startTravelBoard',
        boardId: action.travelBoardId,
      });

      return true;
    }

    return true;
  }

  isActionAvailable(action: CitySceneAction) {
    const scene = this.requireCurrentScene();

    if (action.once && this.rootStore.city.hasTriggeredAction(scene.id, action.id)) {
      return false;
    }

    return this.rootStore.dialogueConditionEvaluator.evaluateAll(action.conditions);
  }

  private requireCurrentScene() {
    const scene = this.rootStore.city.currentScene;

    if (!scene) {
      throw new Error('No active city scene is selected.');
    }

    return scene;
  }

  private requireScene(sceneId: string) {
    const scene = this.rootStore.getCitySceneById(sceneId);

    if (!scene) {
      throw new Error(`City scene "${sceneId}" was not found.`);
    }

    return scene;
  }
}
