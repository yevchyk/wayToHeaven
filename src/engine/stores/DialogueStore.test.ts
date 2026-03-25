import { GameRootStore } from '@engine/stores/GameRootStore';

describe('DialogueStore runtime', () => {
  it('starts the chapter intro scene at the configured start node', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/dialogues/prologue-001');
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/intro');
    expect(rootStore.dialogue.currentNodeId).toBe('n1');
    expect(rootStore.dialogue.currentSpeakerId).toBeNull();
    expect(rootStore.dialogue.currentBackgroundId).toBe('chapter-1/backgrounds/mansion-dining-hall.webp');
    expect(rootStore.dialogue.currentMusicId).toBe('theme_estate');
    expect(rootStore.dialogue.currentOverlayId).toBeNull();
    expect(rootStore.ui.activeScreen).toBe('dialogue');
  });

  it('moves to the start node and applies on-enter effects', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(rootStore.dialogue.currentText).toContain('Ранок у домі Торнів завжди починався красиво.');
    expect(rootStore.flags.getBooleanFlag('chapter1.prologue.seen')).toBe(true);
    expect(rootStore.dialogue.currentMusicId).toBe('theme_estate');
  });

  it('returns the correct visible choices for the chapter intro choice node', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    const visibleChoices = rootStore.dialogue.getVisibleChoices();

    expect(rootStore.dialogue.currentNodeId).toBe('n4');
    expect(visibleChoices).toHaveLength(3);
    expect(rootStore.dialogue.visibleChoiceIds).toEqual(visibleChoices.map((choice) => choice.id));
  });

  it('hides choices when their conditions are not met', () => {
    const hiddenChoiceStore = new GameRootStore();

    hiddenChoiceStore.dialogue.startDialogue('intro-dialogue');

    expect(
      hiddenChoiceStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'show-pass'),
    ).toBe(false);

    const visibleChoiceStore = new GameRootStore();

    visibleChoiceStore.flags.setBooleanFlag('hasGatePass', true);
    visibleChoiceStore.dialogue.startDialogue('intro-dialogue');

    expect(
      visibleChoiceStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'show-pass'),
    ).toBe(true);
  });

  it('applies chapter intro choice effects through the effect runner', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    const pragmaticChoice = rootStore.dialogue
      .getVisibleChoices()
      .find((choice) =>
        choice.effects?.some((effect) => effect.type === 'changeStat' && effect.key === 'pragmatism'),
      );

    expect(pragmaticChoice).toBeDefined();
    rootStore.dialogue.chooseChoice(pragmaticChoice!.id);

    expect(rootStore.stats.getStat('pragmatism')).toBe(1);
    expect(rootStore.stats.isUnlocked('pragmatism')).toBe(true);
    expect(rootStore.dialogue.currentNodeId).toBe('n6');
  });

  it('applies on-enter effects after moving to the next node', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.moveToNode('n94');

    expect(rootStore.dialogue.currentNodeId).toBe('n94');
    expect(rootStore.dialogue.currentSpeakerId).toBe('old-prisoner');
    expect(rootStore.flags.getBooleanFlag('oldManNotPureMonster')).toBe(true);
  });

  it('ends the dialogue cleanly when it reaches a terminal node', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.moveToNode('n120');

    expect(rootStore.dialogue.next()).toBe(false);
    expect(rootStore.dialogue.isOpen).toBe(false);
    expect(rootStore.dialogue.activeDialogueId).toBeNull();
    expect(rootStore.dialogue.currentNodeId).toBeNull();
    expect(rootStore.flags.getBooleanFlag('prologueFinished')).toBe(true);
    expect(rootStore.flags.getBooleanFlag('chapter1.undergroundAwakeningQueued')).toBe(true);
    expect(rootStore.ui.activeScreen).toBe('travelBoard');
  });
});
