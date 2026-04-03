import { afterEach, beforeEach } from 'vitest';

import { GameRootStore } from '@engine/stores/GameRootStore';

describe('GameRootStore runtime backbone', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

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
    rootStore.meta.changeMeta('safety', 1);
    rootStore.meta.changeMeta('morale', -1);
    rootStore.meta.setMetaValue('reputation', 5);
    rootStore.meta.setMetaValue('badReputation', 3);

    expect(rootStore.meta.snapshot).toEqual({
      hunger: 2,
      safety: 1,
      morale: -1,
      reputation: 5,
      badReputation: 3,
    });
  });

  it('supports narrative profile mutation and legacy stat aliases', () => {
    const rootStore = new GameRootStore();

    rootStore.profile.unlockProfile('pragmatism');
    rootStore.profile.changeProfileValue('pragmatism', 2);
    rootStore.profile.setProfileValue('humanity', 1);

    expect(rootStore.profile.isUnlocked('pragmatism')).toBe(true);
    expect(rootStore.profile.getProfileValue('pragmatism')).toBe(2);
    expect(rootStore.stats.getStat('humanity')).toBe(1);
  });

  it('supports typed relationship axes while preserving legacy relationship flag reads', () => {
    const rootStore = new GameRootStore();

    rootStore.relationships.changeRelationshipValue('father', 'trust', 2);
    rootStore.relationships.changeRelationshipValue('father', 'trust', -1);
    rootStore.relationships.changeRelationshipValue('father', 'affinity', 3);

    expect(rootStore.relationships.getRelationshipValue('father', 'trust')).toBe(1);
    expect(rootStore.relationships.getRelationshipValue('father', 'affinity')).toBe(3);
    expect(rootStore.flags.getNumericFlag('relationship.father')).toBe(3);
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

  it('persists discovered library entries through seen-content storage', () => {
    const rootStore = new GameRootStore();

    rootStore.seenContent.markCharacterDiscovered('mirella');
    rootStore.seenContent.markLocationEntryDiscovered('scene:chapter-1/scene/intro');

    const rehydratedStore = new GameRootStore();

    expect(rehydratedStore.seenContent.hasDiscoveredCharacter('mirella')).toBe(true);
    expect(
      rehydratedStore.seenContent.hasDiscoveredLocationEntry('scene:chapter-1/scene/intro'),
    ).toBe(true);
  });

  it('wires every store back to the root store', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.ui.rootStore).toBe(rootStore);
    expect(rootStore.preferences.rootStore).toBe(rootStore);
    expect(rootStore.saves.rootStore).toBe(rootStore);
    expect(rootStore.seenContent.rootStore).toBe(rootStore);
    expect(rootStore.backlog.rootStore).toBe(rootStore);
    expect(rootStore.city.rootStore).toBe(rootStore);
    expect(rootStore.world.rootStore).toBe(rootStore);
    expect(rootStore.dialogue.rootStore).toBe(rootStore);
    expect(rootStore.battle.rootStore).toBe(rootStore);
    expect(rootStore.party.rootStore).toBe(rootStore);
    expect(rootStore.inventory.rootStore).toBe(rootStore);
    expect(rootStore.meta.rootStore).toBe(rootStore);
    expect(rootStore.quests.rootStore).toBe(rootStore);
    expect(rootStore.miniGame.rootStore).toBe(rootStore);
    expect(rootStore.profile.rootStore).toBe(rootStore);
    expect(rootStore.stats.rootStore).toBe(rootStore);
    expect(rootStore.relationships.rootStore).toBe(rootStore);
    expect(rootStore.flags.rootStore).toBe(rootStore);
    expect(rootStore.appearance.rootStore).toBe(rootStore);
    expect(rootStore.travelBoard.rootStore).toBe(rootStore);
  });

  it('elevates the minigame runtime layer above the passive ui screen', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.miniGameController.startMinigame('chapter-1/minigame/fishing/reed-bank');

    expect(rootStore.ui.activeScreen).toBe('minigame');
    expect(rootStore.activeRuntimeLayer).toBe('minigame');
    expect(rootStore.isInteractionLocked).toBe(true);
  });

  it('validates the bundled content graph', () => {
    const rootStore = new GameRootStore();

    expect(rootStore.validateContentGraph()).toEqual([]);
    expect(() => rootStore.assertContentGraphValid()).not.toThrow();
  });

  it('starts a new game in the prologue without preloading the city fallback', () => {
    const rootStore = new GameRootStore();

    rootStore.startNewGame();

    expect(rootStore.ui.activeScreen).toBe('dialogue');
    expect(rootStore.dialogue.isActive).toBe(true);
    expect(rootStore.city.currentScene).toBeNull();

    rootStore.dialogue.endDialogue();

    expect(rootStore.ui.activeScreen).toBe('home');
    expect(rootStore.city.currentScene).toBeNull();
  });

  it('restores a full runtime snapshot without desyncing the active scene state', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.revealCurrentLine();
    rootStore.dialogue.next();
    rootStore.dialogue.revealCurrentLine();
    rootStore.flags.setBooleanFlag('save-test-flag', true);
    rootStore.quests.addQuest('mq_survive');
    rootStore.quests.advanceQuest('mq_road_to_hugen_um', 10);
    rootStore.ui.openModal('backlog');

    const expectedNodeId = rootStore.dialogue.currentNodeId;
    const expectedDisplayedText = rootStore.dialogue.displayedText;
    const expectedBacklogLength = rootStore.backlog.entries.length;
    const expectedMusicId = rootStore.sceneFlow.currentMusicId;
    const snapshot = rootStore.createSaveSnapshot({
      slotId: 'manual-1',
      kind: 'manual',
      label: 'Snapshot Test',
    });

    rootStore.flags.setBooleanFlag('save-test-flag', false);
    rootStore.dialogue.next();
    rootStore.ui.closeModal();

    rootStore.restoreSaveSnapshot(snapshot);

    expect(rootStore.flags.getBooleanFlag('save-test-flag')).toBe(true);
    expect(rootStore.quests.getQuestState('mq_survive')?.status).toBe('active');
    expect(rootStore.quests.getQuestState('mq_road_to_hugen_um')?.progress).toBe(10);
    expect(rootStore.dialogue.currentNodeId).toBe(expectedNodeId);
    expect(rootStore.dialogue.displayedText).toBe(expectedDisplayedText);
    expect(rootStore.backlog.entries).toHaveLength(expectedBacklogLength);
    expect(rootStore.ui.activeModal?.id).toBe('backlog');
    expect(rootStore.audio.musicAssetId).toBe(expectedMusicId);
  });

  it('restores legacy stat and relationship data from pre-profile saves', () => {
    const rootStore = new GameRootStore();

    rootStore.profile.changeProfileValue('pragmatism', 2);
    rootStore.profile.unlockProfile('pragmatism');
    rootStore.relationships.changeRelationshipValue('father', 'affinity', 1);

    const legacySnapshot = rootStore.createSaveSnapshot({
      slotId: 'manual-legacy',
      kind: 'manual',
      label: 'Legacy Snapshot',
    }) as any;

    legacySnapshot.schemaVersion = 2;
    legacySnapshot.summary.schemaVersion = 2;
    legacySnapshot.runtime.stats = legacySnapshot.runtime.profile;
    legacySnapshot.runtime.statUnlocks = legacySnapshot.runtime.profileUnlocks;
    legacySnapshot.runtime.flags.numericFlags['relationship.father'] = 4;
    delete legacySnapshot.runtime.profile;
    delete legacySnapshot.runtime.profileUnlocks;
    delete legacySnapshot.runtime.relationships;

    const restoredStore = new GameRootStore();

    restoredStore.restoreSaveSnapshot(legacySnapshot);

    expect(restoredStore.profile.getProfileValue('pragmatism')).toBe(2);
    expect(restoredStore.profile.isUnlocked('pragmatism')).toBe(true);
    expect(restoredStore.relationships.getRelationshipValue('father', 'affinity')).toBe(4);
  });

  it('persists save slots and restores them through SaveStore', async () => {
    const firstStore = new GameRootStore();

    firstStore.dialogue.startScene('chapter-1/scene/intro');
    firstStore.dialogue.revealCurrentLine();
    firstStore.dialogue.next();
    firstStore.dialogue.revealCurrentLine();
    firstStore.flags.setStringFlag('quest-state', 'pilgrimage');

    const expectedNodeId = firstStore.dialogue.currentNodeId;
    const expectedText = firstStore.dialogue.displayedText;

    await firstStore.saves.saveToSlot('manual-1');

    const secondStore = new GameRootStore();

    await secondStore.saves.loadFromSlot('manual-1');

    expect(secondStore.dialogue.currentNodeId).toBe(expectedNodeId);
    expect(secondStore.dialogue.displayedText).toBe(expectedText);
    expect(secondStore.flags.getStringFlag('quest-state')).toBe('pilgrimage');
    expect(secondStore.ui.activeScreen).toBe('dialogue');
  });
});
