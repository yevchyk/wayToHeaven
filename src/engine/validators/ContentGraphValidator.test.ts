import { battleContentRegistry } from '@content/battles';
import { dialogueContentRegistry } from '@content/dialogues';
import { itemContentRegistry } from '@content/items';
import { locationContentRegistry } from '@content/registries/locationRegistry';
import { citySceneRegistry } from '@content/registries/citySceneRegistry';
import { lootTableContentRegistry } from '@content/lootTables';
import { questRegistry } from '@content/registries/questRegistry';
import { travelBoardRegistry } from '@content/registries/travelBoardRegistry';
import {
  characterInstanceRegistry,
  characterTemplateRegistry,
  defaultPartyInstanceIds,
  enemyTemplateRegistry,
} from '@content/units';
import type { BattleTemplate } from '@engine/types/battle';
import type { ItemData } from '@engine/types/item';
import type { EnemyTemplate, CharacterTemplate, CharacterInstance } from '@engine/types/unit';
import { BattleTemplateValidator } from '@engine/validators/BattleTemplateValidator';
import { CitySceneValidator } from '@engine/validators/CitySceneValidator';
import { ContentGraphValidator } from '@engine/validators/ContentGraphValidator';
import { DialogueValidator } from '@engine/validators/DialogueValidator';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { ItemContentValidator } from '@engine/validators/ItemContentValidator';
import { LocationGraphValidator } from '@engine/validators/LocationGraphValidator';
import { LootTableValidator } from '@engine/validators/LootTableValidator';
import { QuestContentValidator } from '@engine/validators/QuestContentValidator';
import { SceneFlowValidator } from '@engine/validators/SceneFlowValidator';
import { TravelBoardValidator } from '@engine/validators/TravelBoardValidator';
import {
  createContentReferenceLookup,
  type ContentRegistrySnapshot,
} from '@engine/validators/contentReferenceLookup';
import { UnitContentValidator } from '@engine/validators/UnitContentValidator';
import { statusDefinitionsRegistry } from '@engine/registries/statusDefinitionsRegistry';

describe('ContentGraphValidator', () => {
  it('detects broken battle, item, unit, and script references across registries', () => {
    const brokenBattle: BattleTemplate = {
      id: 'broken-battle',
      enemyUnitIds: ['missing-enemy-template'],
      allyUnitIds: ['missing-character-instance'],
      introSceneFlowId: 'missing-scene-flow',
      victoryEffects: [
        {
          type: 'startBattle',
          battleTemplateId: 'missing-battle-template',
        },
      ],
    };
    const brokenItem: ItemData = {
      id: 'broken-item',
      name: 'Broken Item',
      type: 'consumable',
      stackable: false,
      maxStack: 2,
      effects: [
        {
          type: 'runScript',
          scriptId: 'missing-script',
        },
      ],
    };
    const brokenCharacterTemplate: CharacterTemplate = {
      id: 'broken-character-template',
      kind: 'character',
      name: 'Broken Character',
      faction: 'ally',
      baseStats: {
        strength: 1,
        agility: 1,
        sexuality: 1,
        magicAffinity: 1,
        initiative: 1,
        mana: 1,
        health: 1,
      },
      startingTags: ['human'],
      skillIds: ['basic-attack'],
      itemIds: ['missing-item'],
    };
    const brokenCharacterInstance: CharacterInstance = {
      id: 'broken-character-instance',
      templateId: 'missing-character-template',
      level: 1,
    };
    const brokenEnemyTemplate: EnemyTemplate = {
      id: 'broken-enemy-template',
      kind: 'enemy',
      name: 'Broken Enemy',
      faction: 'enemy',
      aiProfile: 'random',
      baseStats: {
        strength: 1,
        agility: 1,
        sexuality: 1,
        magicAffinity: 1,
        initiative: 1,
        mana: 1,
        health: 1,
      },
      startingTags: ['human'],
      skillIds: ['basic-attack'],
      rewardItemIds: ['missing-item'],
      rewardEffects: [
        {
          type: 'runScript',
          scriptId: 'missing-script',
        },
      ],
    };

    const snapshot: ContentRegistrySnapshot = {
      battles: {
        ...battleContentRegistry,
        [brokenBattle.id]: brokenBattle,
      },
      cityScenes: citySceneRegistry,
      travelBoards: travelBoardRegistry,
      dialogues: dialogueContentRegistry,
      sceneFlows: {},
      items: {
        ...itemContentRegistry,
        [brokenItem.id]: brokenItem,
      },
      lootTables: lootTableContentRegistry,
      quests: questRegistry,
      locations: locationContentRegistry,
      characterTemplates: {
        ...characterTemplateRegistry,
        [brokenCharacterTemplate.id]: brokenCharacterTemplate,
      },
      characterInstances: {
        ...characterInstanceRegistry,
        [brokenCharacterInstance.id]: brokenCharacterInstance,
      },
      enemyTemplates: {
        ...enemyTemplateRegistry,
        [brokenEnemyTemplate.id]: brokenEnemyTemplate,
      },
      statusDefinitions: statusDefinitionsRegistry,
      defaultPartyInstanceIds: [...defaultPartyInstanceIds, 'missing-character-instance'],
    };
    const referenceLookup = createContentReferenceLookup(snapshot);
    const effectReferenceValidator = new EffectReferenceValidator(referenceLookup);
    const validator = new ContentGraphValidator(
      snapshot,
      new DialogueValidator(effectReferenceValidator),
      new CitySceneValidator(effectReferenceValidator),
      new LocationGraphValidator(referenceLookup, effectReferenceValidator),
      new TravelBoardValidator(referenceLookup, effectReferenceValidator),
      new SceneFlowValidator(),
      new BattleTemplateValidator(referenceLookup, effectReferenceValidator),
      new ItemContentValidator(effectReferenceValidator),
      new LootTableValidator(referenceLookup),
      new QuestContentValidator(effectReferenceValidator),
      new UnitContentValidator(referenceLookup, effectReferenceValidator),
    );

    const issues = validator.validate();
    const issueCodes = new Set(issues.map((issue) => issue.code));

    expect(issueCodes.has('missingEnemyTemplateReference')).toBe(true);
    expect(issueCodes.has('missingCharacterInstanceReference')).toBe(true);
    expect(issueCodes.has('missingSceneFlowReference')).toBe(true);
    expect(issueCodes.has('missingBattleReference')).toBe(true);
    expect(issueCodes.has('missingItemReference')).toBe(true);
    expect(issueCodes.has('missingScriptReference')).toBe(true);
    expect(issueCodes.has('invalidItemStackConfig')).toBe(true);
    expect(issueCodes.has('missingCharacterTemplateReference')).toBe(true);
  });
});
