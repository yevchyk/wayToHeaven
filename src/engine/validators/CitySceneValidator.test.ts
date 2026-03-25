import type { CitySceneData } from '@engine/types/city';
import { CitySceneValidator } from '@engine/validators/CitySceneValidator';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { createContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

describe('CitySceneValidator', () => {
  it('detects broken scene, travel, and asset references', () => {
    const referenceLookup = createContentReferenceLookup({
      battles: {},
      cityScenes: {},
      travelBoards: {},
      dialogues: {},
      items: {},
      locations: {},
      characterTemplates: {},
      characterInstances: {},
      enemyTemplates: {},
      statusDefinitions: {},
      defaultPartyInstanceIds: [],
    });
    const validator = new CitySceneValidator(new EffectReferenceValidator(referenceLookup), {
      hasSceneId: () => false,
      hasDialogueId: () => false,
      hasBattleId: () => false,
      hasTravelBoardId: () => false,
      hasAssetOfKind: () => false,
    });
    const invalidScene: CitySceneData = {
      id: 'broken-city-scene',
      cityId: 'test-city',
      cityName: 'Test City',
      locationName: 'Broken Plaza',
      backgroundId: 'missing-background',
      actions: [
        {
          id: 'broken-route',
          text: 'Leave the city',
          nextSceneId: 'missing-scene',
          travelBoardId: 'missing-board',
        },
        {
          id: 'broken-route',
          text: 'Talk to the guard',
          dialogueId: 'missing-dialogue',
        },
      ],
    };

    const issues = validator.validate(invalidScene);
    const codes = new Set(issues.map((issue) => issue.code));

    expect(codes.has('missingBackgroundReference')).toBe(true);
    expect(codes.has('ambiguousActionTarget')).toBe(true);
    expect(codes.has('missingSceneReference')).toBe(true);
    expect(codes.has('missingTravelBoardReference')).toBe(true);
    expect(codes.has('duplicateActionId')).toBe(true);
    expect(codes.has('missingDialogueReference')).toBe(true);
  });
});
