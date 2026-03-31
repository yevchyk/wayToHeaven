import { sceneFlowRegistry } from '@content/registries/sceneFlowRegistry';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import { SceneFlowValidator } from '@engine/validators/SceneFlowValidator';

describe('SceneFlowValidator', () => {
  it('accepts authored sequence and route scene flows', () => {
    const validator = new SceneFlowValidator();
    const dialogueFlow = sceneFlowRegistry['chapter-1/scene/intro'];
    const routeFlow = sceneFlowRegistry['chapter-1/travel/underground-route'];

    if (!dialogueFlow || !routeFlow) {
      throw new Error('Expected authored scene flows to be registered.');
    }

    expect(validator.validate(dialogueFlow)).toEqual([]);
    expect(validator.validate(routeFlow)).toEqual([]);
  });

  it('detects missing references and route payload gaps', () => {
    const validator = new SceneFlowValidator();
    const invalidFlow: SceneFlowData = {
      id: 'broken-flow',
      title: 'Broken Flow',
      mode: 'route',
      startNodeId: 'missing-start',
      source: {
        type: 'travelBoard',
        id: 'broken-flow',
      },
      nodes: {
        intro: {
          id: 'intro',
          kind: 'route',
          transitions: [
            {
              id: 'to-missing',
              nextNodeId: 'missing-node',
            },
            {
              id: 'dead-transition',
            },
          ],
          encounter: {
            kind: 'battle',
          },
        },
      },
    };

    const codes = new Set(validator.validate(invalidFlow).map((issue) => issue.code));

    expect(codes.has('missingStartNode')).toBe(true);
    expect(codes.has('missingNodeReference')).toBe(true);
    expect(codes.has('invalidTransition')).toBe(true);
    expect(codes.has('missingEncounterPayload')).toBe(true);
    expect(codes.has('missingRouteLayout')).toBe(true);
    expect(codes.has('missingExitNode')).toBe(true);
  });

  it('detects unreachable nodes when the start graph is otherwise valid', () => {
    const validator = new SceneFlowValidator();
    const invalidFlow: SceneFlowData = {
      id: 'flow-with-orphan',
      title: 'Flow With Orphan',
      mode: 'sequence',
      startNodeId: 'intro',
      source: {
        type: 'sceneGeneration',
        id: 'flow-with-orphan',
      },
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          transitions: [
            {
              id: 'to-end',
              nextNodeId: 'end',
            },
          ],
        },
        end: {
          id: 'end',
          kind: 'line',
          transitions: [],
        },
        orphan: {
          id: 'orphan',
          kind: 'line',
          transitions: [],
        },
      },
    };

    const codes = new Set(validator.validate(invalidFlow).map((issue) => issue.code));

    expect(codes.has('unreachableNode')).toBe(true);
  });
});
