import { afterEach, expect, it, vi } from 'vitest';

import { GameRootStore } from '@engine/stores/GameRootStore';
import {
  countNarrativeVisibleCharacters,
  getNarrativePlainText,
  prepareDialogueNarrativeHtml,
} from '@engine/utils/narrativeHtml';

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe('DialogueStore runtime', () => {
  it('starts the chapter intro scene at the configured start node', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/intro');
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/intro');
    expect(rootStore.dialogue.currentNodeId).toBe('s1_intro');
    expect(rootStore.dialogue.currentSpeakerId).toBeNull();
    expect(rootStore.dialogue.currentBackgroundId).toBe(
      'prologue/backgrounds/thorn_estate_mirella_room_morning',
    );
    expect(rootStore.dialogue.currentMusicId).toBe('prologue/music/house_of_form');
    expect(rootStore.dialogue.currentOverlayId).toBeNull();
    expect(rootStore.ui.activeScreen).toBe('dialogue');
  });

  it('moves to the start node and applies on-enter effects', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(rootStore.dialogue.currentText).toContain('Ранок у домі Торнів починався не зі світла.');
    expect(rootStore.flags.getBooleanFlag('chapter1.prologue.seen')).toBe(true);
    expect(rootStore.appearance.getCurrentOutfitId('mirella')).toBe('dress-pristine');
    expect(rootStore.dialogue.currentMusicId).toBe('prologue/music/house_of_form');
  });

  it('discovers authored scene and encountered characters only after their actual beat is entered', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(
      rootStore.seenContent.hasDiscoveredLocationEntry('scene:chapter-1/scene/intro'),
    ).toBe(true);
    expect(rootStore.seenContent.hasDiscoveredCharacter('mirella')).toBe(true);
    expect(rootStore.seenContent.hasDiscoveredCharacter('servant_girl')).toBe(false);

    rootStore.dialogue.revealCurrentLine();
    rootStore.dialogue.next();

    expect(rootStore.dialogue.currentNodeId).toBe('s1_servant_entry');
    expect(rootStore.seenContent.hasDiscoveredCharacter('servant_girl')).toBe(true);
  });

  it('starts chapter 2 at the arrival sorting flow and seeds the city-state flags', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-2/scene/arrival');

    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-2/scene/arrival');
    expect(rootStore.dialogue.currentNodeId).toBe('arrival-001');
    expect(rootStore.dialogue.currentBackgroundId).toBe('chapter-2/backgrounds/hugen-um/arrival-gate');
    expect(rootStore.flags.getBooleanFlag('chapter2.arrival.entered')).toBe(true);
    expect(rootStore.flags.getBooleanFlag('chapter2.city.firstDealClosed')).toBe(false);
  });

  it('returns the correct visible choices for the first authored choice node', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    const visibleChoices = rootStore.dialogue.getVisibleChoices();

    expect(rootStore.dialogue.currentNodeId).toBe('s1_reaction');
    expect(visibleChoices).toHaveLength(3);
    expect(rootStore.dialogue.visibleChoiceIds).toEqual(visibleChoices.map((choice) => choice.id));
  });

  it('hides choices when their conditions are not met', () => {
    const hiddenChoiceStore = new GameRootStore();

    hiddenChoiceStore.dialogue.startDialogue('chapter-1/scene/city-gate');
    hiddenChoiceStore.dialogue.next();

    expect(
      hiddenChoiceStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'show-pass'),
    ).toBe(false);

    const visibleChoiceStore = new GameRootStore();

    visibleChoiceStore.flags.setBooleanFlag('hasGatePass', true);
    visibleChoiceStore.dialogue.startDialogue('chapter-1/scene/city-gate');
    visibleChoiceStore.dialogue.next();

    expect(
      visibleChoiceStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'show-pass'),
    ).toBe(true);
  });

  it('surfaces Edran betrayal at the gate and removes the polite branch', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setNumericFlag('relationship.edran', -1);
    rootStore.dialogue.startDialogue('chapter-1/scene/city-gate');
    rootStore.dialogue.next();

    expect(rootStore.dialogue.currentNodeId).toBe('gate-rumor-check');
    expect(rootStore.flags.getBooleanFlag('chapter1.city.edranSoldOutAtGate')).toBe(true);

    rootStore.dialogue.next();

    expect(rootStore.dialogue.currentNodeId).toBe('gate-checkpoint');
    expect(rootStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'greet-politely')).toBe(
      false,
    );
  });

  it('unlocks the Thorn-name branch after the father-mask aftermath choice', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setBooleanFlag('chapter1.aftermath.fatherMask', true);
    rootStore.dialogue.startDialogue('chapter-1/scene/city-gate');
    rootStore.dialogue.next();

    expect(
      rootStore.dialogue.getVisibleChoices().some((choice) => choice.id === 'invoke-thorn-name'),
    ).toBe(true);
  });

  it('applies authored choice effects through the effect runner', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();
    rootStore.dialogue.next();

    rootStore.dialogue.chooseChoice('s1_reaction_cold');

    expect(rootStore.stats.getStat('superiority')).toBe(1);
    expect(rootStore.stats.isUnlocked('superiority')).toBe(true);
    expect(rootStore.flags.getNumericFlag('relationship.servants')).toBe(-1);
    expect(rootStore.dialogue.currentNodeId).toBe('s1_after_cold');
  });

  it('applies scene transitions and stage changes on authored scene-generation nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.moveToNode('s6_overlook_intro');

    expect(rootStore.dialogue.currentNodeId).toBe('s6_overlook_intro');
    expect(rootStore.dialogue.currentBackgroundId).toBe(
      'prologue/backgrounds/thorn_mines_third_ledge_overlook',
    );
    expect(rootStore.dialogue.currentStage?.focusCharacterId).toBe('father');
  });

  it('advances from microchapter I into the next authored scene', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.moveToNode('mc1_summary');

    expect(rootStore.dialogue.next()).toBe(true);
    expect(rootStore.dialogue.isOpen).toBe(true);
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/intro/two-of-three');
    expect(rootStore.dialogue.currentNodeId).toBe('mc2_intro_001');
    expect(rootStore.flags.getBooleanFlag('chapter1.prologue.microchapter1.completed')).toBe(true);
    expect(rootStore.dialogue.currentMusicId).toBe('prologue/music/after_the_ridge');
  });

  it('advances from microchapter II into the third authored scene', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.sceneFlowController.startSceneFlow('chapter-1/scene/intro/two-of-three');
    rootStore.dialogue.moveToNode('mc2_summary');

    expect(rootStore.dialogue.next()).toBe(true);
    expect(rootStore.dialogue.isOpen).toBe(true);
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/intro/ball-and-assault');
    expect(rootStore.dialogue.currentNodeId).toBe('mc3_001_intro');
    expect(rootStore.flags.getBooleanFlag('chapter1.prologue.microchapter2.completed')).toBe(true);
    expect(rootStore.dialogue.currentMusicId).toBe('prologue/music/veil_before_fire');
  });

  it('advances from the third microchapter into the prison-fall bridge', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.sceneFlowController.startSceneFlow('chapter-1/scene/intro/ball-and-assault');
    rootStore.dialogue.moveToNode('mc3_summary');

    expect(rootStore.dialogue.next()).toBe(true);
    expect(rootStore.dialogue.isOpen).toBe(true);
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/prison-fall');
    expect(rootStore.dialogue.currentNodeId).toBe('prison-fall-1');
    expect(rootStore.flags.getBooleanFlag('chapter1.prologue.microchapter3.completed')).toBe(true);
    expect(rootStore.ui.activeScreen).toBe('dialogue');
  });

  it('resolves the prison-fall bridge into awakening', () => {
    const rootStore = new GameRootStore();

    rootStore.ui.setScreen('world');
    rootStore.sceneFlowController.startSceneFlow('chapter-1/scene/prison-fall');
    rootStore.dialogue.moveToNode('prison-fall-4');

    expect(rootStore.dialogue.next()).toBe(true);
    expect(rootStore.dialogue.isOpen).toBe(true);
    expect(rootStore.dialogue.activeSceneId).toBe('chapter-1/scene/awakening');
    expect(rootStore.dialogue.currentNodeId).toBe('awakening-1');
  });

  it('reveals dialogue text over time and lets the player reveal the whole line immediately', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');

    expect(rootStore.dialogue.displayedText).toBe('');

    vi.advanceTimersByTime(200);
    expect(rootStore.dialogue.displayedText.length).toBeGreaterThan(0);
    expect(rootStore.dialogue.isTextFullyRevealed).toBe(false);

    rootStore.dialogue.revealCurrentLine();

    expect(rootStore.dialogue.displayedText).toBe(
      getNarrativePlainText(rootStore.dialogue.currentPreparedTextHtml),
    );
    expect(rootStore.dialogue.isTextFullyRevealed).toBe(true);
  });

  it('supports auto mode without skipping choices', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.setAutoMode(true);
    rootStore.dialogue.revealCurrentLine();

    for (let index = 0; index < 4; index += 1) {
      vi.advanceTimersByTime(rootStore.preferences.autoDelayMs + 20);
      rootStore.dialogue.revealCurrentLine();
    }

    expect(rootStore.dialogue.currentNodeId).toBe('s1_reaction');
    expect(rootStore.dialogue.hasChoices).toBe(true);
  });

  it('pauses reveal and auto-advance timers while a modal is open', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.setAutoMode(true);

    const initialNodeId = rootStore.dialogue.currentNodeId;

    rootStore.ui.openModal('preferences');
    vi.advanceTimersByTime(rootStore.preferences.autoDelayMs + 400);

    expect(rootStore.dialogue.displayedText).toBe('');
    expect(rootStore.dialogue.currentNodeId).toBe(initialNodeId);

    rootStore.ui.closeModal();
    vi.advanceTimersByTime(200);

    expect(rootStore.dialogue.displayedText.length).toBeGreaterThan(0);
  });

  it('reveals authored text on choice nodes instead of rendering only the choices', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();

    rootStore.dialogue.startScene('chapter-1/scene/intro');
    rootStore.dialogue.moveToNode('s1_reaction');

    expect(rootStore.dialogue.hasChoices).toBe(true);
    expect(rootStore.dialogue.displayedText).toBe('');

    vi.advanceTimersByTime(200);

    expect(rootStore.dialogue.displayedText.length).toBeGreaterThan(0);

    rootStore.dialogue.revealCurrentLine();

    expect(rootStore.dialogue.displayedText).toBe(rootStore.dialogue.currentText);
  });

  it('keeps a stable next label even on terminal sequence nodes', () => {
    const rootStore = new GameRootStore();

    rootStore.sceneFlowRegistry['tests/scene-flow/terminal-label'] = {
      id: 'tests/scene-flow/terminal-label',
      title: 'Terminal Label',
      mode: 'sequence',
      startNodeId: 'end',
      nodes: {
        end: {
          id: 'end',
          kind: 'line',
          sourceNodeType: 'dialogue',
          text: 'Р В Р’В¤Р РЋРІР‚вЂњР В Р вЂ¦Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂР В РІвЂћвЂ“ Р В Р вЂ Р РЋРЎвЂњР В Р’В·Р В РЎвЂўР В Р’В».',
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/terminal-label',
      },
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/terminal-label');
    rootStore.dialogue.revealCurrentLine();

    expect(rootStore.dialogue.advanceActionLabel).toBe('\u0414\u0430\u043b\u0456');
  });

  it('tracks seen nodes persistently and records backlog lines and selected choices', () => {
    const firstStore = new GameRootStore();

    firstStore.dialogue.startScene('chapter-1/scene/intro');
    firstStore.dialogue.revealCurrentLine();

    expect(firstStore.dialogue.isCurrentNodeSeen).toBe(false);
    expect(firstStore.backlog.entries.at(-1)?.text).toContain('Ранок у домі Торнів починався не зі світла.');

    firstStore.dialogue.next();
    firstStore.dialogue.revealCurrentLine();
    firstStore.dialogue.next();
    firstStore.dialogue.revealCurrentLine();
    firstStore.dialogue.next();
    firstStore.dialogue.revealCurrentLine();
    firstStore.dialogue.next();

    const selectedChoice = firstStore.dialogue.getVisibleChoices()[0];

    if (!selectedChoice) {
      throw new Error('Expected at least one visible choice.');
    }

    firstStore.dialogue.chooseChoice(selectedChoice.id);

    const selectedChoiceEntry = [...firstStore.backlog.entries]
      .reverse()
      .find((entry) => entry.kind === 'choice');

    expect(selectedChoiceEntry?.text).toBe(selectedChoice.text);

    const secondStore = new GameRootStore();

    secondStore.dialogue.startScene('chapter-1/scene/intro');

    expect(secondStore.dialogue.isCurrentNodeSeen).toBe(true);
  });

  it('reveals html-authored text in smooth grapheme beats instead of raw markup length', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();

    rootStore.sceneFlowRegistry['tests/scene-flow/html-reveal'] = {
      id: 'tests/scene-flow/html-reveal',
      title: 'HTML Reveal',
      mode: 'sequence',
      startNodeId: 'intro',
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          sourceNodeType: 'dialogue',
          speakerId: 'mirella',
          text: 'A<strong>BC</strong><br>D',
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/html-reveal',
      },
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/html-reveal');

    expect(rootStore.dialogue.displayedText).toBe('');

    vi.advanceTimersByTime(48);
    expect(rootStore.dialogue.displayedText).toBe('AB');
    expect(rootStore.dialogue.displayedTextHtml).toBe('A<strong>B</strong>');

    vi.advanceTimersByTime(120);
    expect(rootStore.dialogue.displayedText.startsWith('ABC\n')).toBe(true);
    expect(rootStore.dialogue.displayedTextHtml).toContain('A<strong>BC</strong><br>');

    rootStore.dialogue.revealCurrentLine();

    expect(rootStore.dialogue.displayedText).toBe('ABC\nD');
    expect(rootStore.dialogue.displayedTextHtml).toBe('A<strong>BC</strong><br>D');
    expect(rootStore.dialogue.isTextFullyRevealed).toBe(true);
  });

  it('reveals the next dialogue page in partial beats instead of waiting for a full word', () => {
    vi.useFakeTimers();

    const rootStore = new GameRootStore();
    const firstPageText = 'Р В РЎСџР В Р’ВµР РЋР вЂљР РЋРІвЂљВ¬Р В Р’В° Р РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР РЋРІР‚вЂњР В Р вЂ¦Р В РЎвЂќР В Р’В° Р В Р вЂ Р В Р’В¶Р В Р’Вµ Р В Р’В·Р В Р’В°Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІвЂљВ¬Р В РЎвЂР В Р’В»Р В Р’В°Р РЋР С“Р РЋР Р‰.';
    const secondPageText = 'Р В Р Р‹Р В Р’В»Р РЋРЎвЂњР В Р’В¶Р В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р РЋР РЏ Р В Р вЂ Р РЋРІР‚вЂњР В РўвЂР В РЎвЂќР РЋР вЂљР В РЎвЂР В Р’В»Р В Р’В° Р РЋРІвЂљВ¬Р В Р’В°Р РЋРІР‚С›Р РЋРЎвЂњ.';

    rootStore.sceneFlowRegistry['tests/scene-flow/word-safe-page-reveal'] = {
      id: 'tests/scene-flow/word-safe-page-reveal',
      title: 'Word Safe Page Reveal',
      mode: 'sequence',
      startNodeId: 'intro',
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          sourceNodeType: 'dialogue',
          speakerId: 'mirella',
          text: `${firstPageText}\n${secondPageText}`,
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/word-safe-page-reveal',
      },
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/word-safe-page-reveal');
    rootStore.dialogue.setTextPageBreakCharacterCounts([
      `${firstPageText}\n${secondPageText}`.indexOf(secondPageText),
    ]);
    rootStore.dialogue.revealCurrentPage();

    rootStore.dialogue.advanceOrReveal();

    expect(rootStore.dialogue.displayedPageText).toBe('');

    vi.advanceTimersByTime(200);

    expect(rootStore.dialogue.displayedPageText.length).toBeGreaterThan(0);
    expect(rootStore.dialogue.displayedPageText.length).toBeLessThan(secondPageText.length);
    expect(secondPageText.startsWith(rootStore.dialogue.displayedPageText)).toBe(true);
  });

  it('paginates long dialogue text before advancing to the next node', () => {
    const rootStore = new GameRootStore();
    const firstPageText = 'Р В РЎСџР В Р’ВµР РЋР вЂљР РЋРІвЂљВ¬Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.\nР В РІР‚СњР РЋР вЂљР РЋРЎвЂњР В РЎвЂ“Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.\nР В РЎС›Р РЋР вЂљР В Р’ВµР РЋРІР‚С™Р РЋР РЏ Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.';

    rootStore.sceneFlowRegistry['tests/scene-flow/paged-dialogue'] = {
      id: 'tests/scene-flow/paged-dialogue',
      title: 'Paged Dialogue',
      mode: 'sequence',
      startNodeId: 'intro',
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          sourceNodeType: 'dialogue',
          speakerId: 'mirella',
          text: `${firstPageText}\nР В Р’В§Р В Р’ВµР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚С™Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.\nР В РЎСџР Р†Р вЂљРІвЂћСћР РЋР РЏР РЋРІР‚С™Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.`,
          transitions: [
            {
              id: 'next',
              nextNodeId: 'end',
            },
          ],
        },
        end: {
          id: 'end',
          kind: 'line',
          sourceNodeType: 'dialogue',
          speakerId: 'mirella',
          text: 'Р В РЎв„ўР РЋРІР‚вЂњР В Р вЂ¦Р В Р’ВµР РЋРІР‚В Р РЋР Р‰.',
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/paged-dialogue',
      },
    };

    rootStore.sceneFlowController.startSceneFlow('tests/scene-flow/paged-dialogue');
    rootStore.dialogue.setTextPageBreakCharacterCounts([
      countNarrativeVisibleCharacters(prepareDialogueNarrativeHtml(firstPageText)),
    ]);
    rootStore.dialogue.revealCurrentPage();

    expect(rootStore.dialogue.displayedPageText).toContain('Р В РЎСџР В Р’ВµР РЋР вЂљР РЋРІвЂљВ¬Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');
    expect(rootStore.dialogue.displayedPageText).toContain('Р В РЎС›Р РЋР вЂљР В Р’ВµР РЋРІР‚С™Р РЋР РЏ Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');
    expect(rootStore.dialogue.displayedPageText).not.toContain('Р В Р’В§Р В Р’ВµР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚С™Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');

    rootStore.dialogue.advanceOrReveal();

    expect(rootStore.dialogue.currentNodeId).toBe('intro');
    expect(rootStore.dialogue.displayedPageText).toBe('');

    rootStore.dialogue.revealCurrentPage();

    expect(rootStore.dialogue.displayedPageText).toContain('Р В Р’В§Р В Р’ВµР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚С™Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');
    expect(rootStore.dialogue.displayedPageText).toContain('Р В РЎСџР Р†Р вЂљРІвЂћСћР РЋР РЏР РЋРІР‚С™Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');
    expect(rootStore.dialogue.displayedPageText).not.toContain('Р В РЎСџР В Р’ВµР РЋР вЂљР РЋРІвЂљВ¬Р В Р’В° Р В Р’В»Р РЋРІР‚вЂњР В Р вЂ¦Р РЋРІР‚вЂњР РЋР РЏ.');

    rootStore.dialogue.advanceOrReveal();

    expect(rootStore.dialogue.currentNodeId).toBe('end');
  });
});
