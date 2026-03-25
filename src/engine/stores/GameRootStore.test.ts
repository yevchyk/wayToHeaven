import { GameRootStore } from '@engine/stores/GameRootStore';

describe('GameRootStore runtime backbone', () => {
  it('supports screen switching', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.ui.activeScreen).toBe('home');

    rootStore.ui.setScreen('world');

    expect(rootStore.ui.activeScreen).toBe('world');
    expect(rootStore.activeRuntimeLayer).toBe('world');
  });

  it('supports modal opening and closing', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.openModal('character-menu', { source: 'hud' });

    expect(rootStore.ui.isModalOpen).toBe(true);
    expect(rootStore.ui.activeModal).toEqual({
      id: 'character-menu',
      payload: { source: 'hud' },
    });

    rootStore.ui.closeModal();

    expect(rootStore.ui.isModalOpen).toBe(false);
    expect(rootStore.ui.activeModal).toBeNull();
  });

  it('supports meta mutation', () => {
    const rootStore = new GameRootStore();

    rootStore.meta.changeMeta('hunger', 2);
    rootStore.meta.changeMeta('morale', -1);
    rootStore.meta.setMetaValue('reputation', 5);

    expect(rootStore.meta.snapshot).toEqual({
      hunger: 2,
      morale: -1,
      reputation: 5,
    });
  });

  it('supports narrative stat mutation and unlocks', () => {
    const rootStore = new GameRootStore();

    rootStore.stats.unlockStat('pragmatism');
    rootStore.stats.changeStat('pragmatism', 2);
    rootStore.stats.setStat('humanity', 1);

    expect(rootStore.stats.isUnlocked('pragmatism')).toBe(true);
    expect(rootStore.stats.getStat('pragmatism')).toBe(2);
    expect(rootStore.stats.getStat('humanity')).toBe(1);
  });

  it('supports flag set and get', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setFlag('activeQuest', 'pilgrimage');
    rootStore.flags.setBooleanFlag('metHermit', true);
    rootStore.flags.setNumericFlag('campVisits', 2);
    rootStore.flags.changeNumericFlag('campVisits', 3);
    rootStore.flags.addToSetFlag('knownShrines', 'old-gate');

    expect(rootStore.flags.getFlag('activeQuest')).toBe('pilgrimage');
    expect(rootStore.flags.getBooleanFlag('metHermit')).toBe(true);
    expect(rootStore.flags.getNumericFlag('campVisits')).toBe(5);
    expect(rootStore.flags.getStringFlag('activeQuest')).toBe('pilgrimage');
    expect(rootStore.flags.hasInSetFlag('knownShrines', 'old-gate')).toBe(true);
  });

  it('supports inventory add and remove', () => {
    const rootStore = new GameRootStore();

    rootStore.inventory.addItem('healing-herb', 3);
    rootStore.inventory.addItem('torch', 1);

    expect(rootStore.inventory.totalItemKinds).toBe(2);
    expect(rootStore.inventory.getItemCount('healing-herb')).toBe(3);

    expect(rootStore.inventory.removeItem('healing-herb', 2)).toBe(true);
    expect(rootStore.inventory.getItemCount('healing-herb')).toBe(1);
    expect(rootStore.inventory.removeItem('healing-herb', 2)).toBe(false);

    expect(rootStore.inventory.totalItemCount).toBe(2);
  });

  it('wires every store back to the root store', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.ui.rootStore).toBe(rootStore);
    expect(rootStore.city.rootStore).toBe(rootStore);
    expect(rootStore.world.rootStore).toBe(rootStore);
    expect(rootStore.dialogue.rootStore).toBe(rootStore);
    expect(rootStore.battle.rootStore).toBe(rootStore);
    expect(rootStore.party.rootStore).toBe(rootStore);
    expect(rootStore.inventory.rootStore).toBe(rootStore);
    expect(rootStore.meta.rootStore).toBe(rootStore);
    expect(rootStore.stats.rootStore).toBe(rootStore);
    expect(rootStore.flags.rootStore).toBe(rootStore);
    expect(rootStore.travelBoard.rootStore).toBe(rootStore);
  });

  it('validates the bundled content graph', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.validateContentGraph()).toEqual([]);
    expect(() => rootStore.assertContentGraphValid()).not.toThrow();
  });
});
