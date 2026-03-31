import { makeAutoObservable } from 'mobx';

import { battleContentRegistry } from '@content/battles';
import { chapter1CharacterCompositeRegistry } from '@content/characters';
import { dialogueContentRegistry } from '@content/dialogues';
import { citySceneRegistry } from '@content/registries/citySceneRegistry';
import { chapterRegistry } from '@content/registries/chapterRegistry';
import { narrativeAssetRegistry, hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { locationContentRegistry } from '@content/registries/locationRegistry';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import { sceneRegistry } from '@content/registries/sceneRegistry';
import { sceneFlowRegistry } from '@content/registries/sceneFlowRegistry';
import { travelBoardRegistry } from '@content/registries/travelBoardRegistry';
import { itemContentRegistry } from '@content/items';
import {
  characterInstanceRegistry,
  characterTemplateRegistry,
  defaultPartyInstanceIds,
  enemyTemplateRegistry,
} from '@content/units';
import { statusDefinitionsRegistry } from '@engine/registries/statusDefinitionsRegistry';
import { ScriptRegistry } from '@engine/registries/scriptRegistry';
import { tagRulesRegistry } from '@engine/registries/tagRulesRegistry';
import { registerNarrativeScripts } from '@engine/scripts/registerNarrativeScripts';
import { BattleStore } from '@engine/stores/BattleStore';
import { AudioStore, type AudioElementLike } from '@engine/stores/AudioStore';
import { BacklogStore } from '@engine/stores/BacklogStore';
import { CitySceneStore } from '@engine/stores/CitySceneStore';
import { DialogueStore } from '@engine/stores/DialogueStore';
import { FlagsStore } from '@engine/stores/FlagsStore';
import { InventoryStore } from '@engine/stores/InventoryStore';
import { MetaStore } from '@engine/stores/MetaStore';
import { NarrativeAppearanceStore } from '@engine/stores/NarrativeAppearanceStore';
import { PartyStore } from '@engine/stores/PartyStore';
import { PreferencesStore } from '@engine/stores/PreferencesStore';
import { SceneFlowStore } from '@engine/stores/SceneFlowStore';
import { SeenContentStore } from '@engine/stores/SeenContentStore';
import { StatsStore } from '@engine/stores/StatsStore';
import { TravelBoardStore } from '@engine/stores/TravelBoardStore';
import { UIStore } from '@engine/stores/UIStore';
import { WorldStore } from '@engine/stores/WorldStore';
import { BattleAI } from '@engine/systems/battle/BattleAI';
import { BattleResolver } from '@engine/systems/battle/BattleResolver';
import { CombatLogBuilder } from '@engine/systems/battle/CombatLogBuilder';
import { StatusProcessor } from '@engine/systems/battle/StatusProcessor';
import { CitySceneController } from '@engine/systems/city/CitySceneController';
import { SceneFlowController } from '@engine/systems/scenes/SceneFlowController';
import { TurnQueueBuilder } from '@engine/systems/battle/TurnQueueBuilder';
import { DialogueConditionEvaluator } from '@engine/systems/dialogue/DialogueConditionEvaluator';
import { EffectRunner } from '@engine/systems/effects/EffectRunner';
import { TravelBoardController } from '@engine/systems/travel/TravelBoardController';
import { TravelEncounterResolver } from '@engine/systems/travel/TravelEncounterResolver';
import { WorldController } from '@engine/systems/world/WorldController';
import type { BattleTemplate } from '@engine/types/battle';
import type { CitySceneData } from '@engine/types/city';
import type { CharacterCompositeDefinition } from '@engine/types/characterComposite';
import type { DialogueData } from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';
import type { ItemData } from '@engine/types/item';
import type { ChapterMeta, NarrativeAssetDefinition, NarrativeCharacterData, SceneMeta } from '@engine/types/narrative';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import type { StatusDefinition } from '@engine/types/status';
import type { TagRuleSet } from '@engine/types/tags';
import type { TravelBoardData } from '@engine/types/travel';
import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';
import type { LocationData } from '@engine/types/world';
import { BattleTemplateValidator } from '@engine/validators/BattleTemplateValidator';
import { CitySceneValidator } from '@engine/validators/CitySceneValidator';
import { ContentGraphValidator } from '@engine/validators/ContentGraphValidator';
import { DialogueValidator } from '@engine/validators/DialogueValidator';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { ItemContentValidator } from '@engine/validators/ItemContentValidator';
import { LocationGraphValidator } from '@engine/validators/LocationGraphValidator';
import { TravelBoardValidator } from '@engine/validators/TravelBoardValidator';
import { SceneFlowValidator } from '@engine/validators/SceneFlowValidator';
import {
  createContentReferenceLookup,
  type ContentRegistrySnapshot,
} from '@engine/validators/contentReferenceLookup';
import { UnitContentValidator } from '@engine/validators/UnitContentValidator';

interface GameRootStoreOptions {
  battleRandom?: () => number;
  travelRandom?: () => number;
  createAudioElement?: () => AudioElementLike | null;
  resolveAudioUrl?: (assetId: string | null, sourcePath?: string) => string | null;
}

export class GameRootStore {
  readonly battleRegistry: Record<string, BattleTemplate>;
  readonly citySceneRegistry: Record<string, CitySceneData>;
  readonly travelBoardRegistry: Record<string, TravelBoardData>;
  readonly dialogueRegistry: Record<string, DialogueData>;
  readonly chapterRegistry: Record<string, ChapterMeta>;
  readonly sceneRegistry: Record<string, SceneMeta>;
  readonly sceneFlowRegistry: Record<string, SceneFlowData>;
  readonly narrativeCharacterRegistry: Record<string, NarrativeCharacterData>;
  readonly characterCompositeRegistry: Record<string, CharacterCompositeDefinition>;
  readonly narrativeAssetRegistry: Record<string, NarrativeAssetDefinition>;
  readonly itemRegistry: Record<string, ItemData>;
  readonly locationRegistry: Record<string, LocationData>;
  readonly characterTemplateRegistry: Record<string, CharacterTemplate>;
  readonly characterInstanceRegistry: Record<string, CharacterInstance>;
  readonly enemyTemplateRegistry: Record<string, EnemyTemplate>;
  readonly statusDefinitionsRegistry: Record<string, StatusDefinition>;
  readonly tagRulesRegistry: Record<string, TagRuleSet>;
  readonly defaultPartyInstanceIds: string[];
  readonly dialogueConditionEvaluator: DialogueConditionEvaluator;
  readonly effectReferenceValidator: EffectReferenceValidator;
  readonly dialogueValidator: DialogueValidator;
  readonly citySceneValidator: CitySceneValidator;
  readonly locationGraphValidator: LocationGraphValidator;
  readonly travelBoardValidator: TravelBoardValidator;
  readonly battleTemplateValidator: BattleTemplateValidator;
  readonly itemContentValidator: ItemContentValidator;
  readonly unitContentValidator: UnitContentValidator;
  readonly contentGraphValidator: ContentGraphValidator;
  readonly sceneFlowContentValidator: SceneFlowValidator;
  readonly scriptRegistry: ScriptRegistry;
  readonly turnQueueBuilder: TurnQueueBuilder;
  readonly combatLogBuilder: CombatLogBuilder;
  readonly statusProcessor: StatusProcessor;
  readonly battleAI: BattleAI;
  readonly battleResolver: BattleResolver;
  readonly citySceneController: CitySceneController;
  readonly sceneFlowController: SceneFlowController;
  readonly travelEncounterResolver: TravelEncounterResolver;
  readonly travelBoardController: TravelBoardController;
  readonly worldController: WorldController;
  readonly effectRunner: EffectRunner;
  readonly ui: UIStore;
  readonly preferences: PreferencesStore;
  readonly audio: AudioStore;
  readonly seenContent: SeenContentStore;
  readonly backlog: BacklogStore;
  readonly sceneFlow: SceneFlowStore;
  readonly city: CitySceneStore;
  readonly world: WorldStore;
  readonly dialogue: DialogueStore;
  readonly battle: BattleStore;
  readonly party: PartyStore;
  readonly inventory: InventoryStore;
  readonly meta: MetaStore;
  readonly stats: StatsStore;
  readonly flags: FlagsStore;
  readonly appearance: NarrativeAppearanceStore;
  readonly travelBoard: TravelBoardStore;

  constructor(options: GameRootStoreOptions = {}) {
    this.battleRegistry = battleContentRegistry;
    this.citySceneRegistry = citySceneRegistry;
    this.travelBoardRegistry = travelBoardRegistry;
    this.dialogueRegistry = dialogueContentRegistry;
    this.chapterRegistry = chapterRegistry;
    this.sceneRegistry = sceneRegistry;
    this.sceneFlowRegistry = sceneFlowRegistry;
    this.narrativeCharacterRegistry = narrativeCharacterRegistry;
    this.characterCompositeRegistry = chapter1CharacterCompositeRegistry;
    this.narrativeAssetRegistry = narrativeAssetRegistry;
    this.itemRegistry = itemContentRegistry;
    this.locationRegistry = locationContentRegistry;
    this.characterTemplateRegistry = characterTemplateRegistry;
    this.characterInstanceRegistry = characterInstanceRegistry;
    this.enemyTemplateRegistry = enemyTemplateRegistry;
    this.statusDefinitionsRegistry = statusDefinitionsRegistry;
    this.tagRulesRegistry = tagRulesRegistry;
    this.defaultPartyInstanceIds = [...defaultPartyInstanceIds];
    this.scriptRegistry = new ScriptRegistry();
    registerNarrativeScripts(this.scriptRegistry);

    const contentSnapshot: ContentRegistrySnapshot = {
      battles: this.battleRegistry,
      cityScenes: this.citySceneRegistry,
      travelBoards: this.travelBoardRegistry,
      dialogues: this.dialogueRegistry,
      sceneFlows: this.sceneFlowRegistry,
      items: this.itemRegistry,
      locations: this.locationRegistry,
      characterTemplates: this.characterTemplateRegistry,
      characterInstances: this.characterInstanceRegistry,
      enemyTemplates: this.enemyTemplateRegistry,
      statusDefinitions: this.statusDefinitionsRegistry,
      defaultPartyInstanceIds: this.defaultPartyInstanceIds,
    };
    const contentReferenceLookup = createContentReferenceLookup(contentSnapshot, {
      hasScript: (scriptId) => this.scriptRegistry.has(scriptId),
    });

    this.dialogueConditionEvaluator = new DialogueConditionEvaluator(this);
    this.effectReferenceValidator = new EffectReferenceValidator(contentReferenceLookup, {
      hasAssetOfKind: (assetId, kind) => hasNarrativeAssetOfKind(assetId, kind),
    });
    this.dialogueValidator = new DialogueValidator(this.effectReferenceValidator, {
      hasSpeakerId: (speakerId) => speakerId in this.narrativeCharacterRegistry,
      hasAssetOfKind: (assetId, kind) => hasNarrativeAssetOfKind(assetId, kind),
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in this.sceneFlowRegistry,
    });
    this.citySceneValidator = new CitySceneValidator(this.effectReferenceValidator, {
      hasSceneId: (sceneId) => sceneId in this.citySceneRegistry,
      hasDialogueId: (dialogueId) => dialogueId in this.dialogueRegistry,
      hasBattleId: (battleTemplateId) => battleTemplateId in this.battleRegistry,
      hasTravelBoardId: (boardId) => boardId in this.travelBoardRegistry,
      hasAssetOfKind: (assetId, kind) => hasNarrativeAssetOfKind(assetId, kind),
    });
    this.locationGraphValidator = new LocationGraphValidator(
      contentReferenceLookup,
      this.effectReferenceValidator,
    );
    this.travelBoardValidator = new TravelBoardValidator(
      contentReferenceLookup,
      this.effectReferenceValidator,
    );
    this.battleTemplateValidator = new BattleTemplateValidator(
      contentReferenceLookup,
      this.effectReferenceValidator,
    );
    this.itemContentValidator = new ItemContentValidator(this.effectReferenceValidator);
    this.unitContentValidator = new UnitContentValidator(
      contentReferenceLookup,
      this.effectReferenceValidator,
    );
    this.sceneFlowContentValidator = new SceneFlowValidator({
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in this.sceneFlowRegistry,
      hasAssetOfKind: (assetId, kind) => hasNarrativeAssetOfKind(assetId, kind),
    });
    this.contentGraphValidator = new ContentGraphValidator(
      contentSnapshot,
      this.dialogueValidator,
      this.citySceneValidator,
      this.locationGraphValidator,
      this.travelBoardValidator,
      this.sceneFlowContentValidator,
      this.battleTemplateValidator,
      this.itemContentValidator,
      this.unitContentValidator,
    );

    this.ui = new UIStore(this);
    this.preferences = new PreferencesStore(this);
    this.audio = new AudioStore(this, {
      ...(options.createAudioElement ? { createAudioElement: options.createAudioElement } : {}),
      ...(options.resolveAudioUrl ? { resolveAudioUrl: options.resolveAudioUrl } : {}),
    });
    this.audio.applyPreferences(this.preferences.snapshot);
    this.seenContent = new SeenContentStore(this);
    this.backlog = new BacklogStore(this);
    this.sceneFlow = new SceneFlowStore(this);
    this.city = new CitySceneStore(this);
    this.world = new WorldStore(this);
    this.dialogue = new DialogueStore(this);
    this.battle = new BattleStore(this);
    this.party = new PartyStore(this);
    this.inventory = new InventoryStore(this);
    this.meta = new MetaStore(this);
    this.stats = new StatsStore(this);
    this.flags = new FlagsStore(this);
    this.appearance = new NarrativeAppearanceStore(this);
    this.travelBoard = new TravelBoardStore(this);
    this.combatLogBuilder = new CombatLogBuilder();
    this.statusProcessor = new StatusProcessor(this);
    this.turnQueueBuilder = new TurnQueueBuilder((unit) =>
      this.statusProcessor.getAdjustedInitiative(unit),
    );
    this.battleAI = new BattleAI(options.battleRandom);
    this.battleResolver = new BattleResolver(
      this,
      this.turnQueueBuilder,
      this.combatLogBuilder,
      options.battleRandom,
    );
    this.citySceneController = new CitySceneController(this);
    this.sceneFlowController = new SceneFlowController(this, options.travelRandom);
    this.travelEncounterResolver = new TravelEncounterResolver(this);
    this.travelBoardController = new TravelBoardController(this, options.travelRandom);
    this.worldController = new WorldController(this);
    this.effectRunner = new EffectRunner(this, this.scriptRegistry);

    makeAutoObservable(
      this,
      {
        battleRegistry: false,
        citySceneRegistry: false,
        travelBoardRegistry: false,
        dialogueRegistry: false,
        chapterRegistry: false,
        sceneRegistry: false,
        sceneFlowRegistry: false,
        narrativeCharacterRegistry: false,
        characterCompositeRegistry: false,
        narrativeAssetRegistry: false,
        itemRegistry: false,
        locationRegistry: false,
        characterTemplateRegistry: false,
        characterInstanceRegistry: false,
        enemyTemplateRegistry: false,
        statusDefinitionsRegistry: false,
        tagRulesRegistry: false,
        defaultPartyInstanceIds: false,
        dialogueConditionEvaluator: false,
        effectReferenceValidator: false,
        dialogueValidator: false,
        citySceneValidator: false,
        locationGraphValidator: false,
        travelBoardValidator: false,
        battleTemplateValidator: false,
        itemContentValidator: false,
        unitContentValidator: false,
        contentGraphValidator: false,
        sceneFlowContentValidator: false,
        scriptRegistry: false,
        turnQueueBuilder: false,
        combatLogBuilder: false,
        statusProcessor: false,
        battleAI: false,
        battleResolver: false,
        citySceneController: false,
        sceneFlowController: false,
        travelEncounterResolver: false,
        travelBoardController: false,
        worldController: false,
        effectRunner: false,
        ui: false,
        preferences: false,
        audio: false,
        seenContent: false,
        backlog: false,
        sceneFlow: false,
        city: false,
        world: false,
        dialogue: false,
        battle: false,
        party: false,
        inventory: false,
        meta: false,
        stats: false,
        flags: false,
        appearance: false,
        travelBoard: false,
      },
      { autoBind: true },
    );
  }

  get activeRuntimeLayer() {
    if (this.battle.hasActiveBattle) {
      return 'battle';
    }

    if (this.sceneFlow.isActive) {
      switch (this.sceneFlow.activeMode) {
        case 'route':
          return 'travelBoard';
        case 'hub':
          return 'city';
        case 'sequence':
        default:
          return 'dialogue';
      }
    }

    return this.ui.activeScreen;
  }

  get isInteractionLocked() {
    return this.battle.hasActiveBattle || this.dialogue.isActive;
  }

  getDialogueById(dialogueId: string) {
    return this.dialogueRegistry[dialogueId];
  }

  getCitySceneById(sceneId: string) {
    return this.citySceneRegistry[sceneId];
  }

  getChapterById(chapterId: string) {
    return this.chapterRegistry[chapterId];
  }

  getSceneById(sceneId: string) {
    return this.sceneRegistry[sceneId];
  }

  getSceneFlowById(sceneFlowId: string) {
    return this.sceneFlowRegistry[sceneFlowId];
  }

  getNarrativeCharacterById(characterId: string) {
    return this.narrativeCharacterRegistry[characterId];
  }

  getCharacterCompositeById(characterId: string) {
    return this.characterCompositeRegistry[characterId];
  }

  getNarrativeAssetById(assetId: string) {
    return this.narrativeAssetRegistry[assetId];
  }

  getItemById(itemId: string) {
    return this.itemRegistry[itemId];
  }

  getBattleTemplateById(templateId: string) {
    return this.battleRegistry[templateId];
  }

  getTravelBoardById(boardId: string) {
    return this.travelBoardRegistry[boardId];
  }

  getLocationById(locationId: string) {
    return this.locationRegistry[locationId];
  }

  getCharacterTemplateById(templateId: string) {
    return this.characterTemplateRegistry[templateId];
  }

  getCharacterInstanceById(instanceId: string) {
    return this.characterInstanceRegistry[instanceId];
  }

  getEnemyTemplateById(templateId: string) {
    return this.enemyTemplateRegistry[templateId];
  }

  executeEffect(effect: GameEffect) {
    return this.effectRunner.run(effect);
  }

  executeEffects(effects: readonly GameEffect[]) {
    return this.effectRunner.runMany(effects);
  }

  openCharacterMenu(unitId?: string) {
    const targetUnitId =
      unitId ?? this.party.selectedCharacterId ?? this.party.playerUnitId ?? this.party.rosterIds[0] ?? null;

    if (targetUnitId) {
      this.party.setSelectedCharacter(targetUnitId);
    }

    this.ui.openModal('character-menu');
  }

  validateContentGraph() {
    return this.contentGraphValidator.validate();
  }

  assertContentGraphValid() {
    this.contentGraphValidator.assertValid();
  }

  assertBattleTemplateValid(templateId: string) {
    const template = this.getBattleTemplateById(templateId);

    if (!template) {
      throw new Error(`Battle template "${templateId}" was not found.`);
    }

    this.battleTemplateValidator.assertValid(template);
  }

  assertCitySceneValid(sceneId: string) {
    const scene = this.getCitySceneById(sceneId);

    if (!scene) {
      throw new Error(`City scene "${sceneId}" was not found.`);
    }

    this.citySceneValidator.assertValid(scene);
  }

  assertTravelBoardValid(boardId: string) {
    const board = this.getTravelBoardById(boardId);

    if (!board) {
      throw new Error(`Travel board "${boardId}" was not found.`);
    }

    this.travelBoardValidator.assertValid(board);
  }

  startNewGame() {
    this.assertContentGraphValid();
    this.resetRuntime();
    this.seedStarterRuntime();
    const chapter = this.getChapterById('chapter-1');

    if (!chapter) {
      throw new Error('Unable to start a new game because Chapter 1 metadata is missing.');
    }

    this.dialogue.startScene(chapter.startSceneId);
  }

  startTravelBoardDemo(boardId = 'chapter-1/travel/underground-route') {
    this.assertContentGraphValid();
    this.resetRuntime();
    this.seedStarterRuntime();
    this.travelBoardController.startBoard(boardId);
  }

  resetRuntime() {
    this.ui.reset();
    this.dialogue.reset();
    this.backlog.reset();
    this.audio.reset();
    this.audio.applyPreferences(this.preferences.snapshot);
    this.sceneFlow.reset();
    this.world.reset();
    this.battle.reset();
    this.party.reset();
    this.inventory.clear();
    this.meta.reset();
    this.stats.reset();
    this.flags.clearAll();
    this.appearance.reset();
  }

  private seedStarterRuntime() {
    this.party.loadParty(this.defaultPartyInstanceIds);
    this.inventory.addItem('basic-potion', 2);
    this.inventory.addItem('travel-ration', 3);
    this.inventory.addItem('iron-helm', 1);
    this.inventory.addItem('ember-aura', 1);
  }
}
