import type { LocationData } from '@engine/types/world';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { LocationGraphValidator } from '@engine/validators/LocationGraphValidator';
import { createContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

describe('LocationGraphValidator', () => {
  it('detects broken graph references', () => {
    const existingLocation: LocationData = {
      id: 'existing-location',
      title: 'Existing Location',
      startNodeId: 'start',
      nodes: {
        start: {
          id: 'start',
          label: 'Start',
          x: 0,
          y: 0,
          type: 'start',
          connectedNodeIds: [],
        },
      },
    };
    const referenceLookup = createContentReferenceLookup({
      battles: {},
      cityScenes: {},
      travelBoards: {},
      dialogues: {},
      sceneFlows: {},
      items: {},
      locations: {
        [existingLocation.id]: existingLocation,
      },
      characterTemplates: {},
      characterInstances: {},
      enemyTemplates: {},
      statusDefinitions: {},
      defaultPartyInstanceIds: [],
    });
    const validator = new LocationGraphValidator(
      referenceLookup,
      new EffectReferenceValidator(referenceLookup),
    );
    const invalidLocation: LocationData = {
      id: 'broken-location',
      title: 'Broken Location',
      startNodeId: 'missing-start',
      nodes: {
        road: {
          id: 'wrong-road-id',
          label: 'Road',
          x: 0,
          y: 0,
          type: 'start',
          connectedNodeIds: ['missing-node'],
          onEnterEffects: [
            {
              type: 'changeLocation',
              locationId: 'existing-location',
              nodeId: 'missing-node',
            },
          ],
          interaction: {
            type: 'sceneFlow',
            sceneFlowId: 'missing-scene-flow',
          },
        },
      },
    };

    const issues = validator.validate(invalidLocation);

    expect(issues.some((issue) => issue.code === 'missingStartNode')).toBe(true);
    expect(issues.some((issue) => issue.code === 'invalidNodeId')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingConnectionReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingSceneFlowReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingLocationNodeReference')).toBe(true);
  });
});
