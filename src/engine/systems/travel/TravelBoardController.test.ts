import { GameRootStore } from '@engine/stores/GameRootStore';

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index] ?? values.at(-1) ?? 0;

    index += 1;

    return value;
  };
}

describe('TravelBoardController', () => {
  it('sets a roll, auto-advances along a single path, and stops for a branch choice', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.4,
    });

    rootStore.startTravelBoardDemo();

    expect(rootStore.travelBoardController.rollDice()).toBe(3);
    expect(rootStore.travelBoard.lastRoll).toBe(3);
    expect(rootStore.travelBoard.currentNodeId).toBe('forked-passage');
    expect(rootStore.travelBoard.remainingSteps).toBe(1);
    expect(rootStore.travelBoard.phase).toBe('awaitingDirection');
  });

  it('auto-advances on a single path without requiring a choice', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0,
    });

    rootStore.startTravelBoardDemo();
    rootStore.travelBoardController.rollDice();

    expect(rootStore.travelBoard.currentNodeId).toBe('black-river-ledger');
    expect(rootStore.travelBoard.phase).toBe('awaitingRoll');
    expect(rootStore.travelBoard.remainingSteps).toBe(0);
  });

  it('requires an explicit branch choice and blocks backward movement', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.4,
    });

    rootStore.startTravelBoardDemo();
    rootStore.travelBoardController.rollDice();

    expect(rootStore.travelBoard.availableDirectionNodeIds).toEqual(['shackled-guard', 'buried-cache']);
    expect(rootStore.travelBoardController.chooseDirection('black-river-ledger')).toBe(false);
    expect(rootStore.travelBoard.currentNodeId).toBe('forked-passage');
    expect(rootStore.travelBoard.phase).toBe('awaitingDirection');
  });

  it('consumes the final step and resolves battle nodes through the battle runtime', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.4,
    });

    rootStore.startTravelBoardDemo();
    rootStore.travelBoardController.rollDice();

    expect(rootStore.travelBoardController.chooseDirection('shackled-guard')).toBe(true);
    expect(rootStore.travelBoard.currentNodeId).toBe('shackled-guard');
    expect(rootStore.travelBoard.remainingSteps).toBe(0);
    expect(rootStore.battle.activeBattleRef).toBe('guard-battle');
    expect(rootStore.ui.activeScreen).toBe('battle');
  });

  it('resolves question nodes through scripts when the roll ends on them', () => {
    const rootStore = new GameRootStore({
      travelRandom: () => 0.2,
    });

    rootStore.startTravelBoardDemo();
    rootStore.travelBoardController.rollDice();

    expect(rootStore.travelBoard.currentNodeId).toBe('forked-passage');
    expect(rootStore.travelBoard.phase).toBe('awaitingRoll');
    expect(rootStore.flags.getBooleanFlag('chapter1.travel.forkedWhisperHeard')).toBe(true);
    expect(rootStore.stats.getStat('pragmatism')).toBe(1);
  });

  it('reveals nodes ahead with scout without moving the party', () => {
    const rootStore = new GameRootStore();

    rootStore.startTravelBoardDemo();

    const revealedNodeIds = rootStore.travelBoardController.useScout();

    expect(revealedNodeIds).toEqual([
      'black-river-ledger',
      'forked-passage',
      'shackled-guard',
      'buried-cache',
    ]);
    expect(rootStore.travelBoard.currentNodeId).toBe('temple-threshold');
    expect(rootStore.travelBoard.revealedNodeIds).toEqual(
      expect.arrayContaining(['shackled-guard', 'buried-cache']),
    );
    expect(rootStore.travelBoard.scoutCharges).toBe(0);
  });

  it('resolves loot, trap, story, and exit nodes across the lower branch and returns to world', () => {
    const rootStore = new GameRootStore({
      travelRandom: createSequenceRandom([0.4, 0, 0, 0, 0]),
    });

    rootStore.startTravelBoardDemo();
    rootStore.travelBoardController.rollDice();
    rootStore.travelBoardController.chooseDirection('buried-cache');

    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(3);
    expect(rootStore.flags.getBooleanFlag('chapter1.travel.foundCache')).toBe(true);
    expect(rootStore.ui.activeScreen).toBe('travelBoard');

    rootStore.travelBoardController.rollDice();
    expect(rootStore.travelBoard.currentNodeId).toBe('needle-arch');
    expect(rootStore.flags.getBooleanFlag('chapter1.travel.needleTrapTriggered')).toBe(true);
    expect(rootStore.meta.morale).toBe(-1);

    rootStore.travelBoardController.rollDice();
    expect(rootStore.travelBoard.currentNodeId).toBe('collapsed-camp');
    expect(rootStore.meta.morale).toBe(0);

    rootStore.travelBoardController.rollDice();
    expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/awakening');
    expect(rootStore.ui.activeScreen).toBe('dialogue');

    rootStore.dialogue.endDialogue();
    expect(rootStore.ui.activeScreen).toBe('travelBoard');

    rootStore.travelBoardController.rollDice();
    expect(rootStore.travelBoard.hasActiveBoard).toBe(false);
    expect(rootStore.ui.activeScreen).toBe('world');
    expect(rootStore.world.currentLocationId).toBe('pilgrim-road');
    expect(rootStore.world.currentNodeId).toBe('city-gate');
    expect(rootStore.flags.getBooleanFlag('chapter1.travel.undergroundRouteCleared')).toBe(true);
  });
});
