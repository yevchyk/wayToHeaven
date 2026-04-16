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
  it('starts the battle visual demo with a focused solo loadout', () => {
    const rootStore = new GameRootStore();

    rootStore.startBattleVisualDemo();

    expect(rootStore.battle.activeBattleRef).toBe('battle-visual-lab');
    expect(rootStore.battle.allies.map((unit) => unit.unitId)).toEqual(['main-hero']);
    expect(rootStore.battle.enemies.map((unit) => unit.templateId)).toEqual([
      'wolf-enemy',
      'wolf-enemy',
    ]);
    expect(rootStore.inventory.getItemCount('holy-water')).toBe(3);
    expect(rootStore.inventory.getItemCount('pitch-bomb')).toBe(3);
    expect(rootStore.inventory.getItemCount('stimulant-tincture')).toBe(3);
    expect(rootStore.ui.activeScreen).toBe('battle');
  });

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

  it('uses a consumable item in battle and advances the turn order', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);
    rootStore.inventory.addItem('basic-potion', 1);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;
    const ally = rootStore.battle.allies[0];

    if (!runtime || !ally) {
      throw new Error('Expected a battle runtime with one ally.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      allies: [{ ...ally, currentHp: 80 }],
    };

    const result = rootStore.battle.performPlayerAction('item', {
      itemId: 'basic-potion',
    });

    expect(result.selection.type).toBe('item');
    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(0);
    expect(rootStore.battle.allies[0]?.currentHp).toBe(100);
    expect(rootStore.party.activeUnits[0]?.currentHp).toBe(100);
    expect(rootStore.battle.phase).toBe('enemyThinking');
    expect(rootStore.battle.combatLog.some((entry) => entry.type === 'heal')).toBe(true);
  });

  it('uses a hostile battle item to damage an enemy target', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);
    rootStore.inventory.addItem('pitch-bomb', 1);
    rootStore.battle.startBattle('guard-battle');

    rootStore.battle.performPlayerAction('item', {
      itemId: 'pitch-bomb',
      targetId: 'guard-enemy',
    });

    expect(rootStore.inventory.getItemCount('pitch-bomb')).toBe(0);
    expect(rootStore.battle.enemies[0]?.currentHp).toBe(86);
    expect(rootStore.battle.combatLog.some((entry) => entry.type === 'damage')).toBe(true);
    expect(rootStore.battle.phase).toBe('enemyThinking');
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

  it('runs intro scene flow before starting a battle template that declares introSceneFlowId', () => {
    const rootStore = new GameRootStore();
    const templateId = 'guard-battle-with-intro';
    const baseTemplate = rootStore.battleRegistry['guard-battle'];

    if (!baseTemplate) {
      throw new Error('Expected guard-battle template to exist.');
    }

    rootStore.battleRegistry[templateId] = {
      ...baseTemplate,
      id: templateId,
      introSceneFlowId: 'chapter-1/scene/city-gate',
    };

    try {
      rootStore.battle.startBattle(templateId);

      expect(rootStore.battle.hasActiveBattle).toBe(false);
      expect(rootStore.battle.hasPendingBattle).toBe(true);
      expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/city-gate');
      expect(rootStore.ui.activeScreen).toBe('dialogue');

      rootStore.dialogue.endDialogue();

      expect(rootStore.battle.activeBattleRef).toBe(templateId);
      expect(rootStore.battle.hasPendingBattle).toBe(false);
      expect(rootStore.ui.activeScreen).toBe('battle');
    } finally {
      delete rootStore.battleRegistry[templateId];
    }
  });

  it('falls back to introDialogueId when introSceneFlowId is absent', () => {
    const rootStore = new GameRootStore();
    const templateId = 'guard-battle-with-legacy-intro';
    const baseTemplate = rootStore.battleRegistry['guard-battle'];

    if (!baseTemplate) {
      throw new Error('Expected guard-battle template to exist.');
    }

    rootStore.battleRegistry[templateId] = {
      ...baseTemplate,
      id: templateId,
      introDialogueId: 'chapter-1/scene/city-gate',
    };

    try {
      rootStore.battle.startBattle(templateId);

      expect(rootStore.battle.hasActiveBattle).toBe(false);
      expect(rootStore.battle.hasPendingBattle).toBe(true);
      expect(rootStore.dialogue.activeDialogueId).toBe('chapter-1/scene/city-gate');
      expect(rootStore.ui.activeScreen).toBe('dialogue');
    } finally {
      delete rootStore.battleRegistry[templateId];
    }
  });

  it('lets wolf rend apply bleed that ticks at the start of the next hero turn', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.95, 0, 0, 0.1, 0.9, 0.1]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('wolf-pack-battle');

    const runtime = rootStore.battle.battleRuntime;
    const firstEnemy = rootStore.battle.enemies[0];

    if (!runtime || !firstEnemy) {
      throw new Error('Expected a wolf battle runtime with at least one enemy.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      enemies: [{ ...firstEnemy }],
      turnQueue: ['main-hero', firstEnemy.unitId],
      currentUnitId: 'main-hero',
      phase: 'playerInput',
    };

    rootStore.battle.performPlayerAction('defend');
    rootStore.battle.runEnemyTurn();

    expect(rootStore.battle.currentUnit?.unitId).toBe('main-hero');
    expect(rootStore.battle.phase).toBe('playerInput');
    expect(rootStore.battle.allies[0]?.statuses.some((status) => status.type === 'bleed')).toBe(true);
    expect(
      rootStore.battle.combatLog.some((entry) => entry.message.includes('afflicted with bleed')),
    ).toBe(true);
    expect(
      rootStore.battle.combatLog.some((entry) => entry.message.includes('bleed damage')),
    ).toBe(true);
  });

  it('uses holy water in battle to heal and cleanse bleed', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);
    rootStore.inventory.addItem('holy-water', 1);
    rootStore.battle.startBattle('guard-battle');

    const runtime = rootStore.battle.battleRuntime;
    const ally = rootStore.battle.allies[0];

    if (!runtime || !ally) {
      throw new Error('Expected a battle runtime with one ally.');
    }

    const bledRuntime = rootStore.statusProcessor.applyStatusToRuntime(
      {
        ...runtime,
        allies: [{ ...ally, currentHp: 80 }],
      },
      'main-hero',
      'bleed',
    );

    rootStore.battle.battleRuntime = {
      ...bledRuntime.runtime,
      phase: 'playerInput',
      currentUnitId: 'main-hero',
      turnQueue: ['main-hero', 'guard-enemy'],
    };

    rootStore.battle.performPlayerAction('item', {
      itemId: 'holy-water',
      targetId: 'main-hero',
    });

    expect(rootStore.inventory.getItemCount('holy-water')).toBe(0);
    expect(rootStore.battle.allies[0]?.currentHp).toBe(98);
    expect(rootStore.battle.allies[0]?.statuses.some((status) => status.type === 'bleed')).toBe(false);
    expect(rootStore.party.activeUnits[0]?.statuses.some((status) => status.type === 'bleed')).toBe(
      false,
    );
  });

  it('resolves an aoe spell, grants wolf loot and opens the battle reward summary', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9, 0.1, 0.9, 0.2, 0.8]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('wolf-pack-battle');

    const runtime = rootStore.battle.battleRuntime;

    if (!runtime || rootStore.battle.enemies.length < 2) {
      throw new Error('Expected a wolf battle runtime with two enemies.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      enemies: rootStore.battle.enemies.map((enemy) => ({ ...enemy, currentHp: 6 })),
      turnQueue: ['main-hero', ...rootStore.battle.enemies.map((enemy) => enemy.unitId)],
      currentUnitId: 'main-hero',
      phase: 'playerInput',
    };

    rootStore.battle.performPlayerAction('skill', {
      skillId: 'cinder-storm',
    });

    expect(rootStore.battle.phase).toBe('victory');
    expect(rootStore.ui.activeModal?.id).toBe('battle-rewards');
    expect(rootStore.inventory.hasItem('wolf-thyme')).toBe(true);
    expect(rootStore.progression.pendingBattleSummary?.loot.some((entry) => entry.itemId === 'wolf-thyme')).toBe(
      true,
    );
    expect(rootStore.progression.pendingBattleSummary?.experience[0]).toMatchObject({
      unitId: 'main-hero',
      amount: 10,
      levelBefore: 1,
      levelAfter: 2,
    });
    expect(rootStore.progression.pendingBattleSummary?.levelUps).toHaveLength(1);
  });

  it('applies a post-battle level-up choice to the party runtime', () => {
    const rootStore = new GameRootStore({
      battleRandom: createSequenceRandom([0.1, 0.9, 0.1, 0.9, 0.2, 0.8]),
    });

    rootStore.party.loadParty(['main-hero']);
    rootStore.battle.startBattle('wolf-pack-battle');

    const runtime = rootStore.battle.battleRuntime;

    if (!runtime || rootStore.battle.enemies.length < 2) {
      throw new Error('Expected a wolf battle runtime with two enemies.');
    }

    rootStore.battle.battleRuntime = {
      ...runtime,
      enemies: rootStore.battle.enemies.map((enemy) => ({ ...enemy, currentHp: 6 })),
      turnQueue: ['main-hero', ...rootStore.battle.enemies.map((enemy) => enemy.unitId)],
      currentUnitId: 'main-hero',
      phase: 'playerInput',
    };

    rootStore.battle.performPlayerAction('skill', {
      skillId: 'cinder-storm',
    });

    const levelUp = rootStore.progression.pendingBattleSummary?.levelUps[0];

    if (!levelUp) {
      throw new Error('Expected a pending level-up reward.');
    }

    rootStore.progression.applyLevelUpChoice(levelUp.id, 'hp');

    expect(rootStore.party.activeUnits[0]?.derivedStats.maxHp).toBe(122);
    expect(rootStore.progression.hasUnresolvedLevelUps).toBe(false);
  });
});
