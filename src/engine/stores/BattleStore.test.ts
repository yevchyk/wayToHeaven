import { GameRootStore } from '@engine/stores/GameRootStore';

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index] ?? values.at(-1) ?? 0;

    index += 1;

    return value;
  };
}

describe('BattleStore runtime', () => {
  it('initializes a battle runtime from party and enemy templates', () => {
    const rootStore = new GameRootStore();

    rootStore.battle.startBattle('guard-battle');

    expect(rootStore.battle.activeBattleRef).toBe('guard-battle');
    expect(rootStore.battle.phase).toBe('playerInput');
    expect(rootStore.battle.allies.map((unit) => unit.unitId)).toEqual([
      'main-hero',
      'road-companion',
    ]);
    expect(rootStore.battle.enemies.map((unit) => unit.unitId)).toEqual(['guard-enemy']);
    expect(rootStore.battle.currentUnit?.unitId).toBe('road-companion');
    expect(rootStore.ui.activeScreen).toBe('battle');
  });

  it('builds turn order by initiative', () => {
    const rootStore = new GameRootStore();

    rootStore.battle.startBattle('guard-battle');

    expect(rootStore.battle.turnQueue).toEqual(['road-companion', 'main-hero', 'guard-enemy']);
  });

  it('applies basic attack damage and advances to the enemy turn', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const result = rootStore.battle.performPlayerAction('attack', {
      targetId: 'guard-enemy',
    });

    expect(result.damageDealt).toBe(17);
    expect(result.didHit).toBe(true);
    expect(rootStore.battle.enemies[0]?.currentHp).toBe(85);
    expect(rootStore.battle.phase).toBe('enemyThinking');
    expect(rootStore.battle.combatLog.at(-1)?.type).toBe('damage');
  });

  it('resolves an enemy turn and rotates the battle back to the player', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9, 0, 0, 0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');
    rootStore.battle.performPlayerAction('attack', {
      targetId: 'guard-enemy',
    });

    const result = rootStore.battle.runEnemyTurn();

    expect(result.selection.type).toBe('attack');
    expect(result.selection.targetId).toBe('main-hero');
    expect(rootStore.battle.allies[0]?.currentHp).toBe(103);
    expect(rootStore.party.activeUnits[0]?.currentHp).toBe(103);
    expect(rootStore.battle.phase).toBe('playerInput');
    expect(rootStore.battle.round).toBe(2);
    expect(rootStore.battle.currentUnit?.unitId).toBe('main-hero');
  });

  it('cleans up dead units when an attack drops them to zero hp', () => {
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
      enemies: [{ ...enemy, currentHp: 5 }],
    };

    rootStore.battle.performPlayerAction('attack', {
      targetId: 'guard-enemy',
    });

    expect(rootStore.battle.enemies[0]?.currentHp).toBe(0);
    expect(rootStore.battle.turnQueue).toEqual([]);
    expect(rootStore.battle.combatLog.some((entry) => entry.message.includes('falls in battle'))).toBe(
      true,
    );
  });

  it('marks victory and applies battle victory effects', () => {
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
      enemies: [{ ...enemy, currentHp: 5 }],
    };

    rootStore.battle.performPlayerAction('attack', {
      targetId: 'guard-enemy',
    });

    expect(rootStore.battle.phase).toBe('victory');
    expect(rootStore.flags.getBooleanFlag('guardBattleWon')).toBe(true);
    expect(rootStore.battle.currentUnit).toBeNull();
  });

  it('marks defeat and applies battle defeat effects', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0, 0, 0.1, 0.9]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;
    const ally = rootStore.battle.allies[0];

    if (!runtime || !ally) {
      throw new Error('Expected a battle runtime with one ally.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      allies: [{ ...ally, currentHp: 5 }],
      turnQueue: ['guard-enemy'],
      currentUnitId: 'guard-enemy',
      phase: 'enemyThinking',
    };

    rootStore.battle.runEnemyTurn();

    expect(rootStore.battle.phase).toBe('defeat');
    expect(rootStore.flags.getBooleanFlag('guardBattleLost')).toBe(true);
    expect(rootStore.party.activeUnits[0]?.currentHp).toBe(0);
  });
});
