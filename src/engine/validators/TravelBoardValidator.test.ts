import { battleContentRegistry } from '@content/battles';
import { dialogueContentRegistry } from '@content/dialogues';
import { itemContentRegistry } from '@content/items';
import { locationContentRegistry } from '@content/locations';
import { citySceneRegistry } from '@content/registries/citySceneRegistry';
import { travelBoardRegistry } from '@content/registries/travelBoardRegistry';
import {
  characterInstanceRegistry,
  characterTemplateRegistry,
  defaultPartyInstanceIds,
  enemyTemplateRegistry,
} from '@content/units';
import { statusDefinitionsRegistry } from '@engine/registries/statusDefinitionsRegistry';
import type { TravelBoardData } from '@engine/types/travel';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { TravelBoardValidator } from '@engine/validators/TravelBoardValidator';
import { createContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

describe('TravelBoardValidator', () => {
  it('catches broken graph refs and encounter refs', () => {
    const brokenBoard: TravelBoardData = {
      id: 'broken-board',
      title: 'Broken Board',
      startNodeId: 'missing-start',
      nodes: {
        fork: {
          id: 'fork',
          x: 20,
          y: 20,
          type: 'question',
          nextNodeIds: ['missing-next'],
          eventRefId: 'missing-script',
        },
        ambush: {
          id: 'ambush',
          x: 40,
          y: 40,
          type: 'battle',
          nextNodeIds: [],
          battleTemplateId: 'missing-battle',
        },
      },
    };

    const lookup = createContentReferenceLookup({
      battles: battleContentRegistry,
      cityScenes: citySceneRegistry,
      travelBoards: travelBoardRegistry,
      dialogues: dialogueContentRegistry,
      items: itemContentRegistry,
      locations: locationContentRegistry,
      characterTemplates: characterTemplateRegistry,
      characterInstances: characterInstanceRegistry,
      enemyTemplates: enemyTemplateRegistry,
      statusDefinitions: statusDefinitionsRegistry,
      defaultPartyInstanceIds,
    });
    const validator = new TravelBoardValidator(
      lookup,
      new EffectReferenceValidator(lookup),
    );

    const issues = validator.validate(brokenBoard);
    const issueCodes = new Set(issues.map((issue) => issue.code));

    expect(issueCodes.has('missingStartNode')).toBe(true);
    expect(issueCodes.has('missingNextNodeReference')).toBe(true);
    expect(issueCodes.has('missingBattleReference')).toBe(true);
    expect(issueCodes.has('missingScriptReference')).toBe(true);
    expect(issueCodes.has('deadEndNode')).toBe(true);
    expect(issueCodes.has('missingExitNode')).toBe(true);
  });
});
