import { GameRootStore } from '@engine/stores/GameRootStore';

describe('DialogueConditionEvaluator tag conditions', () => {
  it('supports stat threshold conditions for narrative choices', () => {
    const rootStore = new GameRootStore();

    rootStore.stats.setStat('pragmatism', 2);

    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'statGte',
        key: 'pragmatism',
        value: 1,
      }),
    ).toBe(true);
    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'statLte',
        key: 'pragmatism',
        value: 1,
      }),
    ).toBe(false);
  });

  it('uses effective tags from runtime statuses', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);

    const activeUnit = rootStore.party.activeUnits[0];

    if (!activeUnit) {
      throw new Error('Expected a loaded party unit.');
    }

    const shieldedUnit = rootStore.statusProcessor.applyStatusToUnit(activeUnit, 'shield').unit;

    rootStore.party.upsertUnitState(shieldedUnit);

    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'tag',
        tag: 'shielded',
        operator: 'has',
        targetScope: 'player',
      }),
    ).toBe(true);
  });
});
