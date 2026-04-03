import { GameRootStore } from '@engine/stores/GameRootStore';

describe('WorldController', () => {
  it('blocks invalid movement to unconnected nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');

    expect(rootStore.world.currentNodeId).toBe('road-entry');
    expect(rootStore.seenContent.hasDiscoveredLocationEntry('world:pilgrim-road')).toBe(true);
    expect(rootStore.worldController.moveToNode('ambush-site')).toBe(false);
    expect(rootStore.world.currentNodeId).toBe('road-entry');
  });

  it('allows valid movement to connected nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');

    expect(rootStore.worldController.moveToNode('city-gate')).toBe(true);
    expect(rootStore.world.currentNodeId).toBe('city-gate');
  });

  it('changes the current node and exposes connected nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');
    rootStore.worldController.moveToNode('city-gate');

    expect(rootStore.world.currentNodeId).toBe('city-gate');
    expect(rootStore.world.availableTransitionNodeIds).toEqual(['road-entry', 'clearing']);
    expect(rootStore.worldController.getAvailableConnectedNodes().map((node) => node.id)).toEqual([
      'road-entry',
      'clearing',
    ]);
  });

  it('applies on-enter effects on movement', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');
    rootStore.worldController.moveToNode('shrine');

    expect(rootStore.meta.morale).toBe(2);
  });

  it('launches scene flow interactions from world nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');
    rootStore.worldController.moveToNode('city-gate');

    expect(rootStore.worldController.triggerNodeInteraction()).toBe(true);
    expect(rootStore.sceneFlow.activeFlowId).toBe('chapter-1/scene/city-gate');
    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/city-gate');
    expect(rootStore.ui.activeScreen).toBe('dialogue');
  });

  it('launches battle interactions', () => {
    const rootStore = new GameRootStore();

    rootStore.worldController.loadLocation('pilgrim-road');
    rootStore.worldController.moveToNode('city-gate');
    rootStore.worldController.moveToNode('clearing');
    rootStore.worldController.moveToNode('ambush-site');

    expect(rootStore.worldController.triggerNodeInteraction()).toBe(true);
    expect(rootStore.battle.activeBattleRef).toBe('guard-battle');
    expect(rootStore.ui.activeScreen).toBe('battle');
  });
});
