import type { DialogueData } from '@engine/types/dialogue';
import type { TravelBoardData } from '@engine/types/travel';
import {
  adaptDialogueToSceneFlow,
  adaptTravelBoardToSceneFlow,
} from '@engine/systems/scenes/sceneFlowAdapters';

const legacyDialogueFixture: DialogueData = {
  id: 'legacy-intro-dialogue',
  startNodeId: 'n1',
  nodes: {
    n1: {
      id: 'n1',
      type: 'narration',
      text: 'Intro line.',
      nextNodeId: 'n4',
    },
    n4: {
      id: 'n4',
      type: 'choice',
      text: 'Choose a stance.',
      choices: [
        { id: 'n4_c1', text: 'First', nextNodeId: 'n5' },
        { id: 'n4_c2', text: 'Second', nextNodeId: 'n6' },
        { id: 'n4_c3', text: 'Third', nextNodeId: 'n7' },
      ],
    },
    n5: {
      id: 'n5',
      type: 'dialogue',
      speakerId: 'guard',
      text: 'First branch.',
      isEnd: true,
    },
    n6: {
      id: 'n6',
      type: 'dialogue',
      speakerId: 'guard',
      text: 'Second branch.',
      isEnd: true,
    },
    n7: {
      id: 'n7',
      type: 'dialogue',
      speakerId: 'guard',
      text: 'Third branch.',
      isEnd: true,
    },
  },
};

const legacyTravelFixture: TravelBoardData = {
  id: 'legacy-route',
  title: 'Legacy Route',
  startNodeId: 'forked-passage',
  stepTimeCost: {
    hours: 6,
  },
  nodes: {
    'forked-passage': {
      id: 'forked-passage',
      x: 39,
      y: 52,
      type: 'question',
      nextNodeIds: ['shackled-guard', 'buried-cache'],
      eventRefId: 'chapter1.travel.forkedWhisper',
    },
    'shackled-guard': {
      id: 'shackled-guard',
      x: 57,
      y: 31,
      type: 'battle',
      nextNodeIds: ['iron-gate'],
      battleTemplateId: 'guard-battle',
    },
    'buried-cache': {
      id: 'buried-cache',
      x: 57,
      y: 72,
      type: 'loot',
      nextNodeIds: ['iron-gate'],
      itemId: 'basic-potion',
    },
    'iron-gate': {
      id: 'iron-gate',
      x: 99,
      y: 52,
      type: 'exit',
      nextNodeIds: [],
    },
  },
};

describe('sceneFlowAdapters', () => {
  it('adapts dialogue content into a sequence scene flow', () => {
    const sceneFlow = adaptDialogueToSceneFlow(legacyDialogueFixture);
    const choiceNode = sceneFlow.nodes.n4;

    expect(sceneFlow.id).toBe(legacyDialogueFixture.id);
    expect(sceneFlow.mode).toBe('sequence');
    expect(sceneFlow.startNodeId).toBe(legacyDialogueFixture.startNodeId);
    expect(choiceNode?.kind).toBe('choice');
    expect(choiceNode?.transitions.map((transition) => transition.id)).toEqual(['n4_c1', 'n4_c2', 'n4_c3']);
    expect(choiceNode?.transitions.map((transition) => transition.nextNodeId)).toEqual(['n5', 'n6', 'n7']);
  });

  it('adapts travel boards into a route scene flow', () => {
    const sceneFlow = adaptTravelBoardToSceneFlow(legacyTravelFixture);
    const branchNode = sceneFlow.nodes['forked-passage'];
    const exitNode = sceneFlow.nodes['iron-gate'];

    expect(sceneFlow.id).toBe(legacyTravelFixture.id);
    expect(sceneFlow.mode).toBe('route');
    expect(sceneFlow.routeRules?.rollRange).toEqual({ min: 1, max: 6 });
    expect(sceneFlow.routeRules?.stepTimeCost).toEqual({ hours: 6 });
    expect(branchNode?.route).toMatchObject({ x: 39, y: 52 });
    expect(branchNode?.encounter?.kind).toBe('script');
    expect(branchNode?.transitions.map((transition) => transition.nextNodeId)).toEqual([
      'shackled-guard',
      'buried-cache',
    ]);
    expect(exitNode?.encounter).toMatchObject({ kind: 'exit', completesFlow: true });
  });
});
