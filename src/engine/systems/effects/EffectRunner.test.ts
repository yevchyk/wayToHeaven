import { afterEach, describe, expect, it, vi } from 'vitest';

import { BattleStore } from '@engine/stores/BattleStore';
import { FlagsStore } from '@engine/stores/FlagsStore';
import { GameRootStore } from '@engine/stores/GameRootStore';
import { InventoryStore } from '@engine/stores/InventoryStore';
import { UIStore } from '@engine/stores/UIStore';
import { calculateDerivedStats } from '@engine/formulas/derivedStats';
import { buildSceneReplayLibraryEntryId } from '@engine/systems/library/libraryDiscovery';
import { WorldController } from '@engine/systems/world/WorldController';
import type { GameEffect } from '@engine/types/effects';
import type { BaseStats } from '@engine/types/unit';
import type { PartyUnitRuntime } from '@engine/types/unit';

const fallbackBaseStats: BaseStats = {
  strength: 5,
  agility: 5,
  sexuality: 3,
  magicAffinity: 2,
  initiative: 4,
  mana: 3,
  health: 6,
};

function createPartyUnit(
  overrides: Partial<PartyUnitRuntime> & Pick<PartyUnitRuntime, 'unitId'>,
): PartyUnitRuntime {
  const baseStats = overrides.baseStats ?? fallbackBaseStats;
  const derivedStats = overrides.derivedStats ?? calculateDerivedStats(baseStats);

  return {
    unitId: overrides.unitId,
    templateId: overrides.templateId ?? `${overrides.unitId}-template`,
    name: overrides.name ?? overrides.unitId,
    level: overrides.level ?? 1,
    experience: overrides.experience ?? 0,
    currentHp: overrides.currentHp ?? derivedStats.maxHp,
    currentMana: overrides.currentMana ?? derivedStats.maxMana,
    baseStats,
    derivedStats,
    tags: overrides.tags ?? [],
    statuses: overrides.statuses ?? [],
    skillIds: overrides.skillIds ?? ['basic-attack'],
    skillRanks: overrides.skillRanks ?? {},
    bonusMaxHp: overrides.bonusMaxHp ?? 0,
    bonusMaxMana: overrides.bonusMaxMana ?? 0,
    isDefending: overrides.isDefending ?? false,
  };
}

function createRootStoreWithParty() {
  const rootStore = new GameRootStore();

  rootStore.party.setRoster([
    createPartyUnit({ unitId: 'hero' }),
    createPartyUnit({ unitId: 'ally', tags: ['scout'] }),
  ]);

  return rootStore;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EffectRunner', () => {
  it('executes setFlag effects', () => {
    const rootStore = new GameRootStore();

    const result = rootStore.executeEffect({
      type: 'setFlag',
      flagId: 'gate-open',
      value: true,
    });

    expect(result.status).toBe('applied');
    expect(rootStore.flags.getFlag('gate-open')).toBe(true);
  });

  it('executes setCharacterOutfit effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'setCharacterOutfit',
      characterId: 'mirella',
      outfitId: 'dress-torn',
    });

    expect(rootStore.appearance.getCurrentOutfitId('mirella')).toBe('dress-torn');
  });

  it('executes explicit replay unlock effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'unlockSceneReplay',
      sceneId: 'chapter-1/scene/thorn-estate/replay/corset-tie',
    });

    expect(
      rootStore.seenContent.hasDiscoveredSceneEntry(
        buildSceneReplayLibraryEntryId('chapter-1/scene/thorn-estate/replay/corset-tie'),
      ),
    ).toBe(true);
  });

  it('executes changeMeta effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'changeMeta',
      key: 'hunger',
      delta: 2,
    });

    expect(rootStore.meta.hunger).toBe(2);
  });

  it('executes advanceTime effects through the time store', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'advanceTime',
      hours: 7,
    });

    expect(rootStore.time.day).toBe(1);
    expect(rootStore.time.hour).toBe(15);
    expect(rootStore.flags.getNumericFlag('story.day')).toBe(1);
    expect(rootStore.flags.getStringFlag('story.timeSegment')).toBe('day');
  });

  it('executes quest lifecycle effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'addQuest',
      questId: 'mq_survive',
    });
    rootStore.executeEffect({
      type: 'advanceQuest',
      questId: 'mq_road_to_hugen_um',
      delta: 25,
    });
    rootStore.executeEffect({
      type: 'completeQuest',
      questId: 'mq_survive',
    });

    expect(rootStore.quests.getQuestState('mq_survive')).toEqual(
      expect.objectContaining({
        questId: 'mq_survive',
        status: 'completed',
        progress: 0,
      }),
    );
    expect(rootStore.quests.getQuestState('mq_road_to_hugen_um')).toEqual(
      expect.objectContaining({
        questId: 'mq_road_to_hugen_um',
        status: 'active',
        progress: 25,
      }),
    );
  });

  it('executes profile effects through canonical and legacy aliases', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'unlockProfile',
      key: 'pragmatism',
    });
    rootStore.executeEffect({
      type: 'changeProfile',
      key: 'pragmatism',
      delta: 2,
    });
    rootStore.executeEffect({
      type: 'setStat',
      key: 'humanity',
      value: 1,
    });

    expect(rootStore.profile.isUnlocked('pragmatism')).toBe(true);
    expect(rootStore.profile.getProfileValue('pragmatism')).toBe(2);
    expect(rootStore.profile.getProfileValue('humanity')).toBe(1);
    expect(rootStore.debug.statChangeLog).toEqual([
      expect.objectContaining({
        key: 'humanity',
        source: 'setStat',
        previousValue: 0,
        nextValue: 1,
      }),
      expect.objectContaining({
        key: 'pragmatism',
        source: 'changeProfile',
        previousValue: 0,
        nextValue: 2,
      }),
      expect.objectContaining({
        key: 'pragmatism',
        source: 'unlockProfile',
        previousValue: 0,
        nextValue: 0,
        previousUnlocked: false,
        nextUnlocked: true,
      }),
    ]);
  });

  it('executes changeRelationship effects through the relationship store', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'changeRelationship',
      relationshipId: 'father',
      axis: 'trust',
      delta: -1,
    });
    rootStore.executeEffect({
      type: 'changeRelationship',
      key: 'father',
      delta: 2,
    });

    expect(rootStore.relationships.getRelationshipValue('father', 'trust')).toBe(-1);
    expect(rootStore.relationships.getRelationshipValue('father', 'affinity')).toBe(2);
  });

  it('executes addTag effects', () => {
    const rootStore = createRootStoreWithParty();

    rootStore.executeEffect({
      type: 'addTag',
      tag: 'blessed',
      targetScope: 'player',
    });

    expect(rootStore.party.unitStates.get('hero')?.tags).toContain('blessed');
  });

  it('executes removeTag effects', () => {
    const rootStore = createRootStoreWithParty();

    rootStore.party.addTag('hero', 'cursed');

    rootStore.executeEffect({
      type: 'removeTag',
      tag: 'cursed',
      targetScope: 'unit',
      targetId: 'hero',
    });

    expect(rootStore.party.unitStates.get('hero')?.tags).not.toContain('cursed');
  });

  it('executes giveItem effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'giveItem',
      itemId: 'basic-potion',
      quantity: 2,
    });

    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(2);
  });

  it('executes removeItem effects', () => {
    const rootStore = new GameRootStore();

    rootStore.inventory.addItem('basic-potion', 3);

    rootStore.executeEffect({
      type: 'removeItem',
      itemId: 'basic-potion',
      quantity: 2,
    });

    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(1);
  });

  it('executes restoreResource effects', () => {
    const rootStore = createRootStoreWithParty();
    const hero = rootStore.party.unitStates.get('hero');

    if (!hero) {
      throw new Error('Expected a hero unit in the party.');
    }

    rootStore.party.upsertUnitState({
      ...hero,
      currentHp: 40,
    });

    rootStore.executeEffect({
      type: 'restoreResource',
      resource: 'hp',
      amount: 10,
      targetScope: 'player',
    });

    expect(rootStore.party.unitStates.get('hero')?.currentHp).toBe(50);
  });

  it('executes dealDamage effects', () => {
    const rootStore = createRootStoreWithParty();

    rootStore.executeEffect({
      type: 'dealDamage',
      amount: 7,
      targetScope: 'player',
      damageKind: 'fire',
    });

    expect(rootStore.party.unitStates.get('hero')?.currentHp).toBe(
      (rootStore.party.unitStates.get('hero')?.derivedStats.maxHp ?? 0) - 7,
    );
  });

  it('executes startBattle effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'startBattle',
      battleTemplateId: 'guard-battle',
    });

    expect(rootStore.battle.activeBattleRef).toBe('guard-battle');
    expect(rootStore.ui.activeScreen).toBe('battle');
  });

  it('executes startTravelBoard effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'startTravelBoard',
      boardId: 'chapter-1/travel/underground-route',
    });

    expect(rootStore.travelBoard.activeBoardId).toBe('chapter-1/travel/underground-route');
    expect(rootStore.ui.activeScreen).toBe('travelBoard');
  });

  it('executes startMinigame effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'startMinigame',
      minigameId: 'chapter-1/minigame/fishing/reed-bank',
    });

    expect(rootStore.miniGame.activeMinigameId).toBe('chapter-1/minigame/fishing/reed-bank');
    expect(rootStore.ui.activeScreen).toBe('minigame');
  });

  it('executes changeLocation effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'changeLocation',
      locationId: 'pilgrim-road',
      nodeId: 'city-gate',
    });

    expect(rootStore.world.currentLocationId).toBe('pilgrim-road');
    expect(rootStore.world.currentNodeId).toBe('city-gate');
    expect(rootStore.ui.activeScreen).toBe('world');
  });

  it('executes dialogue presentation effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'setBackground',
      backgroundId: 'chapter-1/backgrounds/prison-cell',
    });
    rootStore.executeEffect({
      type: 'playMusic',
      musicId: 'chapter-1/music/under-stone',
    });
    rootStore.executeEffect({
      type: 'showCG',
      cgId: 'chapter-1/cg/awakening-flash',
    });
    rootStore.executeEffect({
      type: 'setOverlay',
      overlayId: 'chapter-1/overlays/dream-veil',
    });
    rootStore.executeEffect({
      type: 'playSfx',
      sfxId: 'chapter-1/sfx/heartbeat',
    });

    expect(rootStore.dialogue.currentBackgroundId).toBe('chapter-1/backgrounds/prison-cell');
    expect(rootStore.dialogue.currentMusicId).toBe('chapter-1/music/under-stone');
    expect(rootStore.dialogue.currentCgId).toBe('chapter-1/cg/awakening-flash');
    expect(rootStore.dialogue.currentOverlayId).toBe('chapter-1/overlays/dream-veil');
    expect(rootStore.dialogue.lastSfxId).toBe('chapter-1/sfx/heartbeat');

    rootStore.executeEffect({
      type: 'hideCG',
    });
    rootStore.executeEffect({
      type: 'clearOverlay',
    });
    rootStore.executeEffect({
      type: 'stopMusic',
    });

    expect(rootStore.dialogue.currentCgId).toBeNull();
    expect(rootStore.dialogue.currentOverlayId).toBeNull();
    expect(rootStore.dialogue.currentMusicId).toBeNull();
  });

  it('executes openScreen effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'openScreen',
      screenId: 'dialogue',
    });

    expect(rootStore.ui.activeScreen).toBe('dialogue');
  });

  it('executes openModal effects', () => {
    const rootStore = new GameRootStore();

    rootStore.executeEffect({
      type: 'openModal',
      modalId: 'inventory',
      payload: { source: 'effects' },
    });

    expect(rootStore.ui.activeModal).toEqual({
      id: 'inventory',
      payload: { source: 'effects' },
    });
  });

  it('executes runScript effects through the script registry', () => {
    const rootStore = new GameRootStore();

    rootStore.scriptRegistry.register('unlock-gate', () => [
      {
        type: 'setFlag',
        flagId: 'gateUnlocked',
        value: true,
      },
      {
        type: 'openModal',
        modalId: 'inventory',
      },
    ]);

    const result = rootStore.executeEffect({
      type: 'runScript',
      scriptId: 'unlock-gate',
    });

    expect(result.status).toBe('applied');
    expect(result.childResults).toHaveLength(2);
    expect(rootStore.flags.getBooleanFlag('gateUnlocked')).toBe(true);
    expect(rootStore.ui.activeModal?.id).toBe('inventory');
  });

  it('executes arrays of effects sequentially', () => {
    const rootStore = createRootStoreWithParty();

    const batch = rootStore.executeEffects([
      {
        type: 'setFlag',
        flagId: 'introComplete',
        value: true,
      },
      {
        type: 'changeMeta',
        key: 'morale',
        delta: 1,
      },
      {
        type: 'giveItem',
        itemId: 'torch',
        quantity: 1,
      },
      {
        type: 'addTag',
        tag: 'ready',
        targetScope: 'party',
      },
    ]);

    expect(batch.appliedCount).toBe(4);
    expect(rootStore.flags.getBooleanFlag('introComplete')).toBe(true);
    expect(rootStore.meta.morale).toBe(1);
    expect(rootStore.inventory.getItemCount('torch')).toBe(1);
    expect(rootStore.party.unitStates.get('hero')?.tags).toContain('ready');
    expect(rootStore.party.unitStates.get('ally')?.tags).toContain('ready');
  });

  it('routes effects into store actions', () => {
    const effects: GameEffect[] = [
      {
        type: 'setFlag',
        flagId: 'routed',
        value: true,
      },
      {
        type: 'giveItem',
        itemId: 'coin',
        quantity: 3,
      },
      {
        type: 'changeLocation',
        locationId: 'pilgrim-road',
      },
      {
        type: 'startBattle',
        battleTemplateId: 'guard-battle',
      },
      {
        type: 'openModal',
        modalId: 'inventory',
      },
    ];

    const setFlagSpy = vi.spyOn(FlagsStore.prototype, 'setFlag');
    const addItemSpy = vi.spyOn(InventoryStore.prototype, 'addItem');
    const loadLocationSpy = vi.spyOn(WorldController.prototype, 'loadLocation');
    const startBattleSpy = vi.spyOn(BattleStore.prototype, 'startBattle');
    const openModalSpy = vi.spyOn(UIStore.prototype, 'openModal');
    const rootStore = new GameRootStore();

    rootStore.executeEffects(effects);

    expect(setFlagSpy).toHaveBeenCalledWith('routed', true);
    expect(addItemSpy).toHaveBeenCalledWith('coin', 3);
    expect(loadLocationSpy).toHaveBeenCalledWith('pilgrim-road', undefined);
    expect(startBattleSpy).toHaveBeenCalledWith('guard-battle');
    expect(openModalSpy).toHaveBeenCalledWith('inventory', undefined);
  });

  it('handles unknown script refs safely', () => {
    const rootStore = new GameRootStore();

    const result = rootStore.executeEffect({
      type: 'runScript',
      scriptId: 'missing-script',
    });

    expect(result.status).toBe('missingScript');
    expect(result.details).toContain('missing-script');
    expect(rootStore.flags.totalFlags).toBe(0);
  });

  it('queues jumpToNode effects while a dialogue is active', () => {
    const rootStore = new GameRootStore();

    rootStore.dialogue.startDialogue('chapter-1/scene/city-gate');

    const result = rootStore.executeEffect({
      type: 'jumpToNode',
      nodeId: 'farewell',
    });

    expect(result.status).toBe('applied');
    expect(rootStore.dialogue.pendingJumpNodeId).toBe('farewell');
  });
});
