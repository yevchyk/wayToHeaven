import type { BattleRuntime, BattleTemplate, CombatLogEntry } from '@engine/types/battle';
import type { Condition } from '@engine/types/conditions';
import type { DialogueData } from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';
import { calculateDerivedStats } from '@engine/formulas/derivedStats';
import type { ItemData } from '@engine/types/item';
import type { StatusDefinition, StatusEffectInstance } from '@engine/types/status';
import type { TagRuleSet } from '@engine/types/tags';
import type {
  BaseStats,
  BattleUnitRuntime,
  CharacterInstance,
  CharacterTemplate,
  DerivedStats,
  EnemyTemplate,
} from '@engine/types/unit';
import type { LocationData } from '@engine/types/world';

describe('core domain types', () => {
  it('allow creating coherent mock data for all main systems', () => {
    const condition: Condition = {
      type: 'meta',
      key: 'morale',
      operator: 'gte',
      value: 0,
    };

    const rewardEffect: GameEffect = {
      type: 'giveItem',
      itemId: 'basic-potion',
      quantity: 1,
    };

    const dialogue: DialogueData = {
      id: 'intro-dialogue',
      startNodeId: 'intro',
      speakerIds: ['guard'],
      nodes: {
        intro: {
          id: 'intro',
          type: 'choice',
          speakerId: 'guard',
          text: 'Halt. State your business.',
          choices: [
            {
              id: 'reply',
              text: 'I am here to enter the city.',
              conditions: [condition],
              effects: [rewardEffect],
              nextNodeId: 'allow-entry',
            },
          ],
        },
        'allow-entry': {
          id: 'allow-entry',
          type: 'dialogue',
          speakerId: 'guard',
          text: 'Then move along.',
          isEnd: true,
        },
      },
    };

    const location: LocationData = {
      id: 'gate-road',
      title: 'Gate Road',
      startNodeId: 'road',
      nodes: {
        road: {
          id: 'road',
          label: 'Road',
          x: 0,
          y: 0,
          type: 'start',
          connectedNodeIds: ['gate'],
        },
        gate: {
          id: 'gate',
          label: 'City Gate',
          x: 10,
          y: 4,
          type: 'landmark',
          connectedNodeIds: ['road'],
          interaction: {
            type: 'sceneFlow',
            sceneFlowId: 'intro-flow',
          },
        },
      },
    };

    const baseStats: BaseStats = {
      strength: 7,
      agility: 6,
      sexuality: 3,
      magicAffinity: 2,
      initiative: 5,
      mana: 4,
      health: 8,
    };

    const derivedStats: DerivedStats = calculateDerivedStats(baseStats);

    const poisonStatus: StatusEffectInstance = {
      id: 'poison-1',
      type: 'poison',
      remainingDuration: 3,
      stacks: 1,
      tickTiming: 'turnEnd',
      potency: 2,
    };

    const heroTemplate: CharacterTemplate = {
      id: 'main-hero-template',
      kind: 'character',
      name: 'Pilgrim',
      faction: 'player',
      baseStats,
      startingTags: ['human', 'pilgrim'],
      startingStatuses: [],
      skillIds: ['basic-attack'],
      itemIds: ['basic-potion'],
    };

    const heroInstance: CharacterInstance = {
      id: 'main-hero',
      templateId: heroTemplate.id,
      level: 1,
      currentHp: derivedStats.maxHp,
      currentMana: derivedStats.maxMana,
      tags: ['human', 'pilgrim'],
      statusEffects: [poisonStatus],
    };

    const guardEnemy: EnemyTemplate = {
      id: 'guard-enemy',
      kind: 'enemy',
      name: 'Gate Guard',
      faction: 'enemy',
      aiProfile: 'random',
      baseStats,
      startingTags: ['human', 'guard'],
      skillIds: ['basic-attack'],
      rewardEffects: [rewardEffect],
    };

    const battleUnit: BattleUnitRuntime = {
      unitId: heroInstance.id,
      templateId: heroTemplate.id,
      name: heroTemplate.name,
      level: heroInstance.level,
      experience: 0,
      currentHp: derivedStats.maxHp,
      currentMana: derivedStats.maxMana,
      baseStats,
      derivedStats,
      tags: heroInstance.tags ?? [],
      statuses: heroInstance.statusEffects ?? [],
      skillIds: heroTemplate.skillIds,
      skillRanks: {},
      bonusMaxHp: 0,
      bonusMaxMana: 0,
      isDefending: false,
      side: 'ally',
    };

    const battleTemplate: BattleTemplate = {
      id: 'gate-skirmish',
      enemyUnitIds: [guardEnemy.id],
      allyUnitIds: [heroInstance.id],
      victoryEffects: [rewardEffect],
      enemyAiProfile: 'random',
    };

    const logEntry: CombatLogEntry = {
      id: 'log-1',
      round: 1,
      type: 'action',
      message: 'Pilgrim attacks Gate Guard.',
      sourceUnitId: battleUnit.unitId,
      targetUnitId: guardEnemy.id,
      value: 6,
    };

    const battleRuntime: BattleRuntime = {
      battleId: 'runtime-1',
      templateId: battleTemplate.id,
      phase: 'playerInput',
      round: 1,
      turnQueue: [battleUnit.unitId, guardEnemy.id],
      currentUnitId: battleUnit.unitId,
      allies: [battleUnit],
      enemies: [
        {
          ...battleUnit,
          unitId: guardEnemy.id,
          templateId: guardEnemy.id,
          name: guardEnemy.name,
          level: 1,
          side: 'enemy',
          tags: guardEnemy.startingTags,
          skillIds: guardEnemy.skillIds,
        },
      ],
      combatLog: [logEntry],
      selectedAction: {
        type: 'attack',
        sourceUnitId: battleUnit.unitId,
        targetId: guardEnemy.id,
      },
      selectedTargetId: guardEnemy.id,
    };

    const item: ItemData = {
      id: 'basic-potion',
      name: 'Basic Potion',
      type: 'consumable',
      stackable: true,
      maxStack: 10,
      targetScope: 'ally',
      effects: [
        {
          type: 'changeMeta',
          key: 'morale',
          delta: 1,
        },
      ],
    };

    const statusDefinition: StatusDefinition = {
      type: 'poison',
      name: 'Poison',
      defaultDuration: 3,
      tickTiming: 'turnEnd',
      stackPolicy: 'stack',
      isNegative: true,
      defaultPotency: 2,
      blockedByTags: ['poison-immune'],
    };

    const tagRuleSet: TagRuleSet = {
      tag: 'pilgrim',
      description: 'Steady progress through hardship.',
      modifiers: [
        {
          kind: 'numeric',
          target: 'initiative',
          mode: 'flat',
          value: 1,
        },
      ],
      grantsStatusImmunities: ['fear'],
    };

    const introNode = dialogue.nodes.intro;
    const gateNode = location.nodes.gate;

    expect(introNode?.choices?.[0]?.conditions?.[0]).toEqual(condition);
    expect(gateNode?.interaction?.type).toBe('sceneFlow');
    expect(battleRuntime.combatLog[0]).toEqual(logEntry);
    expect(item.effects?.[0]).toEqual({
      type: 'changeMeta',
      key: 'morale',
      delta: 1,
    });
    expect(statusDefinition.type).toBe('poison');
    expect(tagRuleSet.tag).toBe('pilgrim');
  });
});
