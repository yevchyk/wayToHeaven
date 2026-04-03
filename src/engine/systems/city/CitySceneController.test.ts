import { GameRootStore } from '@engine/stores/GameRootStore';

describe('CitySceneController', () => {
  it('starts a city scene and exposes visible actions', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');

    expect(rootStore.ui.activeScreen).toBe('city');
    expect(rootStore.city.currentScene?.locationName).toBe('Temple Exit Plaza');
    expect(rootStore.seenContent.hasDiscoveredLocationEntry('city:chapter-1/city/temple-exit')).toBe(
      true,
    );
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

  it('opens the mother-linked shelter and grants gate access resources', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setBooleanFlag('chapter1.aftermath.motherThreadRemembered', true);
    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');

    expect(
      rootStore.citySceneController.getVisibleActions().some((action) => action.id === 'to-wayfarer-shelter'),
    ).toBe(true);

    rootStore.citySceneController.chooseAction('to-wayfarer-shelter');

    expect(rootStore.city.activeSceneId).toBe('chapter-1/city/wayfarer-shelter');

    rootStore.citySceneController.chooseAction('claim-pilgrim-seal');

    expect(rootStore.flags.getBooleanFlag('hasGatePass')).toBe(true);
    expect(rootStore.inventory.getItemCount('pilgrim-seal')).toBe(1);
  });

  it('keeps travel-oriented city exits separate from city mode runtime', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    rootStore.citySceneController.chooseAction('leave-city');

    expect(rootStore.ui.activeScreen).toBe('world');
    expect(rootStore.world.currentLocationId).toBe('pilgrim-road');
    expect(rootStore.world.currentNodeId).toBe('city-gate');
  });

  it('unlocks the chapter 2 first deal only after meeting Nena and hides it once resolved', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setBooleanFlag('chapter2.city.firstDealClosed', false);
    rootStore.citySceneController.startScene('chapter-2/city/sorting-yard');

    expect(rootStore.citySceneController.getVisibleActions().some((action) => action.id === 'first-deal')).toBe(
      false,
    );

    rootStore.citySceneController.chooseAction('to-market');
    rootStore.citySceneController.chooseAction('meet-nena');
    rootStore.citySceneController.chooseAction('return-yard');

    expect(rootStore.citySceneController.getVisibleActions().some((action) => action.id === 'first-deal')).toBe(
      true,
    );

    rootStore.citySceneController.chooseAction('first-deal');

    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-2/scene/first-deal');

    rootStore.dialogue.moveToNode('deal-003');
    rootStore.dialogue.chooseChoice('deal-with-nena');

    expect(rootStore.flags.getBooleanFlag('chapter2.city.firstDealClosed')).toBe(true);

    rootStore.dialogue.endDialogue();
    rootStore.citySceneController.startScene('chapter-2/city/sorting-yard');

    expect(rootStore.citySceneController.getVisibleActions().some((action) => action.id === 'first-deal')).toBe(
      false,
    );
  });
});
