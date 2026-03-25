import { GameRootStore } from '@engine/stores/GameRootStore';

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index] ?? values.at(-1) ?? 0;

    index += 1;

    return value;
  };
}

describe('StatusProcessor and tag rules', () => {
  it('applies poison damage on turn end', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;

    if (!runtime) {
      throw new Error('Expected an active battle runtime.');
    }

    const poisoned = rootStore.statusProcessor.applyStatusToRuntime(runtime, 'main-hero', 'poison');

    rootStore.battle.battleRuntime = poisoned.runtime;
    rootStore.battle.performPlayerAction('defend');

    expect(rootStore.battle.allies[0]?.currentHp).toBe(113);
    expect(
      rootStore.battle.combatLog.some((entry) => entry.message.includes('poison damage')),
    ).toBe(true);
  });

  it('skips a stunned unit turn', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0, 0, 0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;

    if (!runtime) {
      throw new Error('Expected an active battle runtime.');
    }

    const stunned = rootStore.statusProcessor.applyStatusToRuntime(runtime, 'main-hero', 'stun');

    rootStore.battle.battleRuntime = stunned.runtime;
    rootStore.battle.performPlayerAction('defend');
    rootStore.battle.runEnemyTurn();

    expect(rootStore.battle.phase).toBe('enemyThinking');
    expect(rootStore.battle.currentUnit?.unitId).toBe('guard-enemy');
    expect(
      rootStore.battle.combatLog.some((entry) => entry.message.includes('unable to act')),
    ).toBe(true);
  });

  it('prevents robot units from receiving bleed', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);

    const robotUnit = {
      ...rootStore.party.activeUnits[0]!,
      tags: [...rootStore.party.activeUnits[0]!.tags, 'robot'],
    };
    const result = rootStore.statusProcessor.applyStatusToUnit(robotUnit, 'bleed');

    expect(result.applied).toBe(false);
    expect(result.reason).toContain('immunity');
  });

  it('amplifies fire damage against tree targets', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;
    const enemy = rootStore.battle.enemies[0];

    if (!runtime || !enemy) {
      throw new Error('Expected a battle runtime with one enemy.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      enemies: [{ ...enemy, tags: [...enemy.tags, 'tree'] }],
    };

    const result = rootStore.battle.performPlayerAction('skill', {
      skillId: 'firebolt',
      targetId: 'guard-enemy',
    });

    expect(result.damageDealt).toBe(15);
    expect(rootStore.battle.enemies[0]?.currentHp).toBe(87);
  });

  it('heals regen targets at turn end', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;
    const ally = rootStore.battle.allies[0];

    if (!runtime || !ally) {
      throw new Error('Expected an ally in battle.');
    }

    const regenApplied = rootStore.statusProcessor.applyStatusToRuntime(
      {
        ...runtime,
        allies: [{ ...ally, currentHp: 90 }],
      },
      'main-hero',
      'regen',
    );

    rootStore.battle.battleRuntime = regenApplied.runtime;
    rootStore.battle.performPlayerAction('defend');

    expect(rootStore.battle.allies[0]?.currentHp).toBe(95);
    expect(
      rootStore.battle.combatLog.some((entry) => entry.message.includes('recovers 5 health')),
    ).toBe(true);
  });
});

