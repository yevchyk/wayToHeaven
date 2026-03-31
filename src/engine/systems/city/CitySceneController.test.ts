import { GameRootStore } from '@engine/stores/GameRootStore';

describe('CitySceneController', () => {
  it('starts a city scene and exposes visible actions', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');

    expect(rootStore.ui.activeScreen).toBe('city');
    expect(rootStore.city.currentScene?.locationName).toBe('Temple Exit Plaza');
    expect(rootStore.citySceneController.getVisibleActions().length).toBeGreaterThan(0);
  });

  it('transitions between city scenes and hides once-only actions after use', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    rootStore.citySceneController.chooseAction('to-market');

    expect(rootStore.city.activeSceneId).toBe('chapter-1/city/market-lane');

    rootStore.citySceneController.chooseAction('buy-rations');

    expect(rootStore.inventory.getItemCount('travel-ration')).toBe(1);
    expect(rootStore.citySceneController.getVisibleActions().some((action) => action.id === 'buy-rations')).toBe(
      false,
    );
  });

  it('can launch dialogue and travel mode from city actions', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    rootStore.citySceneController.chooseAction('talk-warden');

    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/city-gate');

    rootStore.dialogue.endDialogue();
    rootStore.citySceneController.chooseAction('descend-underpass');

    expect(rootStore.travelBoard.activeBoardId).toBe('chapter-1/travel/underground-route');
    expect(rootStore.ui.activeScreen).toBe('travelBoard');
  });

  it('keeps travel-oriented city exits separate from city mode runtime', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    rootStore.citySceneController.chooseAction('leave-city');

    expect(rootStore.ui.activeScreen).toBe('world');
    expect(rootStore.world.currentLocationId).toBe('pilgrim-road');
    expect(rootStore.world.currentNodeId).toBe('city-gate');
  });
});
