import { GameRootStore } from '@engine/stores/GameRootStore';

describe('DialogueConditionEvaluator tag conditions', () => {
  it('supports profile threshold conditions for narrative choices', () => {
    const rootStore = new GameRootStore();

    rootStore.profile.setProfileValue('pragmatism', 2);

    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'profileGte',
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

  it('supports inventory count conditions for authored scene gating', () => {
    const rootStore = new GameRootStore();

    rootStore.inventory.addItem('basic-potion', 2);

    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'inventory',
        itemId: 'basic-potion',
        operator: 'gte',
        value: 1,
      }),
    ).toBe(true);
    expect(
      rootStore.dialogueConditionEvaluator.evaluate({
        type: 'inventory',
        itemId: 'basic-potion',
        operator: 'lt',
        value: 2,
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
