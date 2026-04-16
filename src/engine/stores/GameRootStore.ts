import { makeAutoObservable } from 'mobx';

import { battleContentRegistry } from '@content/battles';
import { chapter1CharacterCompositeRegistry } from '@content/characters';
import { dialogueContentRegistry } from '@content/dialogues';
import { miniGameContentRegistry } from '@content/minigames';
import { citySceneRegistry } from '@content/registries/citySceneRegistry';
import { chapterRegistry } from '@content/registries/chapterRegistry';
import { narrativeAssetRegistry, hasNarrativeAssetOfKind } from '@content/registries/assetRegistry';
import { lootTableContentRegistry } from '@content/lootTables';
import { locationContentRegistry } from '@content/registries/locationRegistry';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import { questRegistry } from '@content/registries/questRegistry';
import { sceneRegistry } from '@content/registries/sceneRegistry';
import { sceneGenerationRegistry } from '@content/registries/sceneGenerationRegistry';
import { sceneFlowRegistry } from '@content/registries/sceneFlowRegistry';
import { travelBoardRegistry } from '@content/registries/travelBoardRegistry';
import { itemContentRegistry } from '@content/items';
import { skillContentRegistry } from '@content/skills';
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
import { DebugStore } from '@engine/stores/DebugStore';
import { FlagsStore } from '@engine/stores/FlagsStore';
import { InventoryStore } from '@engine/stores/InventoryStore';
import { MetaStore } from '@engine/stores/MetaStore';
import { MiniGameStore } from '@engine/stores/MiniGameStore';
import { NarrativeProfileStore } from '@engine/stores/NarrativeProfileStore';
import { NarrativeAppearanceStore } from '@engine/stores/NarrativeAppearanceStore';
import { PartyStore } from '@engine/stores/PartyStore';
import { PreferencesStore } from '@engine/stores/PreferencesStore';
import { ProgressionStore } from '@engine/stores/ProgressionStore';
import { QuestStore } from '@engine/stores/QuestStore';
import { RelationshipStore } from '@engine/stores/RelationshipStore';
import { SaveStore } from '@engine/stores/SaveStore';
import { SceneFlowStore } from '@engine/stores/SceneFlowStore';
import { SeenContentStore } from '@engine/stores/SeenContentStore';
import { StatsStore } from '@engine/stores/StatsStore';
import { TravelBoardStore } from '@engine/stores/TravelBoardStore';
import { TimeStore } from '@engine/stores/TimeStore';
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
import { MiniGameController } from '@engine/systems/minigame/MiniGameController';
import { LootTableResolver } from '@engine/systems/rewards/LootTableResolver';
import { TravelBoardController } from '@engine/systems/travel/TravelBoardController';
import { TravelEncounterResolver } from '@engine/systems/travel/TravelEncounterResolver';
import { WorldController } from '@engine/systems/world/WorldController';
import type { BattleTemplate } from '@engine/types/battle';
import type { CitySceneData } from '@engine/types/city';
import type { CharacterCompositeDefinition } from '@engine/types/characterComposite';
import type { DialogueData } from '@engine/types/dialogue';
import type { GameEffect } from '@engine/types/effects';
import type { ItemData } from '@engine/types/item';
import type { LootTableData } from '@engine/types/loot';
import type { MiniGameData } from '@engine/types/minigame';
import type { ChapterMeta, NarrativeAssetDefinition, NarrativeCharacterData, SceneMeta } from '@engine/types/narrative';
import type { QuestDefinition } from '@engine/types/quest';
import type { SceneFlowData } from '@engine/types/sceneFlow';
import type { SkillData } from '@engine/types/skill';
import type { StatusDefinition } from '@engine/types/status';
import type { TagRuleSet } from '@engine/types/tags';
import type { TravelBoardData } from '@engine/types/travel';
import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';
import type { LocationData } from '@engine/types/world';
import {
  DEFAULT_NARRATIVE_PROFILE,
  DEFAULT_UNLOCKED_NARRATIVE_PROFILE,
} from '@engine/types/profile';
import {
  GAME_SAVE_SCHEMA_VERSION,
  type GameSaveRuntimeSnapshot,
  type GameSaveSlotKind,
  type GameSaveSnapshot,
} from '@engine/types/save';
import { BattleTemplateValidator } from '@engine/validators/BattleTemplateValidator';
import { CitySceneValidator } from '@engine/validators/CitySceneValidator';
import { ContentGraphValidator } from '@engine/validators/ContentGraphValidator';
import { DialogueValidator } from '@engine/validators/DialogueValidator';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { ItemContentValidator } from '@engine/validators/ItemContentValidator';
import { LocationGraphValidator } from '@engine/validators/LocationGraphValidator';
import { LootTableValidator } from '@engine/validators/LootTableValidator';
import { TravelBoardValidator } from '@engine/validators/TravelBoardValidator';
import { SceneFlowValidator } from '@engine/validators/SceneFlowValidator';
import { SceneAuthoringValidator } from '@engine/validators/SceneAuthoringValidator';
import { QuestContentValidator } from '@engine/validators/QuestContentValidator';
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
  readonly lootTableRegistry: Record<string, LootTableData>;
  readonly skillRegistry: Record<string, SkillData>;
  readonly questRegistry: Record<string, QuestDefinition>;
  readonly locationRegistry: Record<string, LocationData>;
  readonly minigameRegistry: Record<string, MiniGameData>;
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
  readonly lootTableValidator: LootTableValidator;
  readonly questContentValidator: QuestContentValidator;
  readonly unitContentValidator: UnitContentValidator;
  readonly contentGraphValidator: ContentGraphValidator;
  readonly sceneFlowContentValidator: SceneFlowValidator;
  readonly sceneAuthoringValidator: SceneAuthoringValidator;
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
  readonly miniGameController: MiniGameController;
  readonly lootTableResolver: LootTableResolver;
  readonly ui: UIStore;
  readonly preferences: PreferencesStore;
  readonly audio: AudioStore;
  readonly saves: SaveStore;
  readonly seenContent: SeenContentStore;
  readonly backlog: BacklogStore;
  readonly sceneFlow: SceneFlowStore;
  readonly city: CitySceneStore;
  readonly world: WorldStore;
  readonly dialogue: DialogueStore;
  readonly debug: DebugStore;
  readonly battle: BattleStore;
  readonly party: PartyStore;
  readonly inventory: InventoryStore;
  readonly meta: MetaStore;
  readonly time: TimeStore;
  readonly miniGame: MiniGameStore;
  readonly progression: ProgressionStore;
  readonly quests: QuestStore;
  readonly profile: NarrativeProfileStore;
  readonly stats: StatsStore;
  readonly relationships: RelationshipStore;
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
    this.lootTableRegistry = lootTableContentRegistry;
    this.skillRegistry = skillContentRegistry;
    this.questRegistry = questRegistry;
    this.locationRegistry = locationContentRegistry;
    this.minigameRegistry = miniGameContentRegistry;
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
      lootTables: this.lootTableRegistry,
      quests: this.questRegistry,
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
      hasSceneId: (sceneId) => sceneId in this.sceneRegistry,
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
    this.lootTableValidator = new LootTableValidator(contentReferenceLookup);
    this.questContentValidator = new QuestContentValidator(this.effectReferenceValidator);
    this.unitContentValidator = new UnitContentValidator(
      contentReferenceLookup,
      this.effectReferenceValidator,
    );
    this.sceneFlowContentValidator = new SceneFlowValidator({
      hasSceneFlowId: (sceneFlowId) => sceneFlowId in this.sceneFlowRegistry,
      hasAssetOfKind: (assetId, kind) => hasNarrativeAssetOfKind(assetId, kind),
    });
    this.sceneAuthoringValidator = new SceneAuthoringValidator(
      this.sceneRegistry,
      sceneGenerationRegistry,
    );
    this.contentGraphValidator = new ContentGraphValidator(
      contentSnapshot,
      this.dialogueValidator,
      this.citySceneValidator,
      this.locationGraphValidator,
      this.travelBoardValidator,
      this.sceneFlowContentValidator,
      this.battleTemplateValidator,
      this.itemContentValidator,
      this.lootTableValidator,
      this.questContentValidator,
      this.unitContentValidator,
    );

    this.ui = new UIStore(this);
    this.preferences = new PreferencesStore(this);
    this.audio = new AudioStore(this, {
      ...(options.createAudioElement ? { createAudioElement: options.createAudioElement } : {}),
      ...(options.resolveAudioUrl ? { resolveAudioUrl: options.resolveAudioUrl } : {}),
    });
    this.audio.applyPreferences(this.preferences.snapshot);
    this.saves = new SaveStore(this);
    this.seenContent = new SeenContentStore(this);
    this.backlog = new BacklogStore(this);
    this.sceneFlow = new SceneFlowStore(this);
    this.city = new CitySceneStore(this);
    this.world = new WorldStore(this);
    this.dialogue = new DialogueStore(this);
    this.debug = new DebugStore(this);
    this.battle = new BattleStore(this);
    this.party = new PartyStore(this);
    this.inventory = new InventoryStore(this);
    this.meta = new MetaStore(this);
    this.time = new TimeStore(this);
    this.miniGame = new MiniGameStore(this);
    this.progression = new ProgressionStore(this);
    this.quests = new QuestStore(this);
    this.profile = new NarrativeProfileStore(this);
    this.stats = this.profile;
    this.flags = new FlagsStore(this);
    this.relationships = new RelationshipStore(this);
    this.appearance = new NarrativeAppearanceStore(this);
    this.travelBoard = new TravelBoardStore(this);
    this.combatLogBuilder = new CombatLogBuilder();
    this.statusProcessor = new StatusProcessor(this);
    this.turnQueueBuilder = new TurnQueueBuilder((unit) =>
      this.statusProcessor.getAdjustedInitiative(unit),
    );
    this.battleAI = new BattleAI((skillId) => this.getSkillById(skillId) ?? null, options.battleRandom);
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
    this.miniGameController = new MiniGameController(this);
    this.lootTableResolver = new LootTableResolver(options.battleRandom);

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
        lootTableRegistry: false,
        skillRegistry: false,
        questRegistry: false,
        locationRegistry: false,
        minigameRegistry: false,
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
        lootTableValidator: false,
        questContentValidator: false,
        unitContentValidator: false,
        contentGraphValidator: false,
        sceneFlowContentValidator: false,
        sceneAuthoringValidator: false,
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
        miniGameController: false,
        lootTableResolver: false,
        ui: false,
        preferences: false,
        audio: false,
        saves: false,
        seenContent: false,
        backlog: false,
        sceneFlow: false,
        city: false,
        world: false,
        dialogue: false,
        debug: false,
        battle: false,
        party: false,
        inventory: false,
        meta: false,
        time: false,
        miniGame: false,
        progression: false,
        quests: false,
        profile: false,
        stats: false,
        relationships: false,
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

    if (this.miniGame.hasActiveSession) {
      return 'minigame';
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
    return this.battle.hasActiveBattle || this.dialogue.isActive || this.miniGame.hasActiveSession;
  }

  get saveRuntimeSnapshot(): GameSaveRuntimeSnapshot {
    return {
      ui: this.ui.snapshot,
      world: this.world.snapshot,
      meta: this.meta.snapshot,
      time: this.time.snapshot,
      quests: {
        states: this.quests.snapshot,
      },
      profile: this.profile.snapshot,
      profileUnlocks: this.profile.unlockedSnapshot,
      relationships: this.relationships.snapshot,
      flags: this.flags.snapshot,
      inventory: this.inventory.snapshot,
      party: this.party.snapshot,
      progression: this.progression.snapshot,
      appearance: this.appearance.snapshot,
      sceneFlow: this.sceneFlow.snapshot,
      dialogue: this.dialogue.snapshot,
      battle: this.battle.snapshot,
      miniGame: this.miniGame.snapshot,
      backlog: this.backlog.snapshot,
      seenContent: this.seenContent.snapshot,
    };
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

  getLootTableById(lootTableId: string) {
    return this.lootTableRegistry[lootTableId];
  }

  getQuestById(questId: string) {
    return this.questRegistry[questId];
  }

  getSkillById(skillId: string) {
    return this.skillRegistry[skillId];
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

  getMinigameById(minigameId: string) {
    return this.minigameRegistry[minigameId];
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

  openLibrary(tab: 'characters' | 'locations' | 'scenes' = 'characters', entryId?: string) {
    this.ui.openModal('library', entryId ? { tab, entryId } : { tab });
  }

  canPreviewScene(sceneId: string) {
    const scene = this.getSceneById(sceneId);
    const mainFlowId = scene?.mainSceneFlowId;

    if (!scene || !mainFlowId) {
      return false;
    }

    return this.getSceneFlowById(mainFlowId)?.replay?.enabled === true;
  }

  startScenePreview(sceneId: string) {
    if (!this.canPreviewScene(sceneId)) {
      throw new Error(`Scene "${sceneId}" is not configured for replay preview.`);
    }

    const runtimeSnapshot = this.saveRuntimeSnapshot;

    this.resetRuntime();
    this.restorePreviewBaseline(runtimeSnapshot);
    this.sceneFlow.beginPreview(runtimeSnapshot, sceneId);

    try {
      const session = this.dialogue.startScenePreview(sceneId);

      if (!session) {
        throw new Error(`Scene "${sceneId}" could not start in preview mode.`);
      }
    } catch (error) {
      this.sceneFlow.consumePreviewRuntimeSnapshot();
      this.restoreRuntimeSnapshot(runtimeSnapshot);
      throw error;
    }
  }

  finishScenePreview() {
    const runtimeSnapshot = this.sceneFlow.consumePreviewRuntimeSnapshot();

    if (!runtimeSnapshot) {
      return;
    }

    this.restoreRuntimeSnapshot(runtimeSnapshot);
  }

  validateContentGraph() {
    return [...this.contentGraphValidator.validate(), ...this.sceneAuthoringValidator.validate()];
  }

  assertContentGraphValid() {
    const issues = this.validateContentGraph();

    if (issues.length === 0) {
      return;
    }

    const summary = issues
      .map((issue) => `[${issue.sourceType}:${issue.sourceId}] ${issue.message}`)
      .join(' ');

    throw new Error(`Invalid content graph. ${summary}`);
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

  startBattleVisualDemo(templateId = 'battle-visual-lab') {
    this.assertContentGraphValid();
    this.resetRuntime();
    this.party.loadParty(['main-hero']);
    this.inventory.addItem('basic-potion', 2);
    this.inventory.addItem('holy-water', 3);
    this.inventory.addItem('pitch-bomb', 3);
    this.inventory.addItem('stimulant-tincture', 3);
    this.battle.startBattle(templateId);
  }

  createSaveSnapshot(input: { slotId: string; kind: GameSaveSlotKind; label: string }): GameSaveSnapshot {
    const savedAt = new Date().toISOString();

    return {
      schemaVersion: GAME_SAVE_SCHEMA_VERSION,
      summary: {
        slotId: input.slotId,
        kind: input.kind,
        label: input.label,
        savedAt,
        schemaVersion: GAME_SAVE_SCHEMA_VERSION,
        activeScreen: this.ui.activeScreen,
        activeRuntimeLayer: this.activeRuntimeLayer,
        sceneId: this.sceneFlow.activeSceneId ?? this.world.currentLocationId,
        flowId: this.sceneFlow.activeFlowId,
        nodeId: this.sceneFlow.currentNodeId ?? this.world.currentNodeId,
        battleId: this.battle.activeBattleId,
      },
      runtime: this.saveRuntimeSnapshot,
      rng: {
        mode: 'stateless',
      },
    };
  }

  restoreSaveSnapshot(snapshot: GameSaveSnapshot) {
    if (snapshot.schemaVersion > GAME_SAVE_SCHEMA_VERSION) {
      throw new Error(
        `Save schema v${snapshot.schemaVersion} is newer than runtime schema v${GAME_SAVE_SCHEMA_VERSION}.`,
      );
    }

    this.restoreRuntimeSnapshot(snapshot.runtime);
  }

  resetRuntime() {
    this.debug.reset();
    this.ui.reset();
    this.dialogue.reset();
    this.backlog.reset();
    this.audio.reset();
    this.audio.applyPreferences(this.preferences.snapshot);
    this.sceneFlow.reset();
    this.world.reset();
    this.battle.reset();
    this.miniGame.reset();
    this.party.reset();
    this.inventory.clear();
    this.meta.reset();
    this.quests.reset();
    this.profile.reset();
    this.progression.reset();
    this.relationships.reset();
    this.flags.clearAll();
    this.time.reset();
    this.appearance.reset();
  }

  private seedStarterRuntime() {
    this.party.loadParty(this.defaultPartyInstanceIds);
    this.inventory.addItem('basic-potion', 2);
    this.inventory.addItem('travel-ration', 3);
    this.inventory.addItem('iron-helm', 1);
    this.inventory.addItem('ember-aura', 1);
  }

  private restoreRuntimeSnapshot(snapshot: GameSaveRuntimeSnapshot) {
    this.resetRuntime();
    this.meta.restore(snapshot.meta);
    this.time.restore(snapshot.time);
    this.flags.restore(snapshot.flags);
    this.profile.restore(
      snapshot.profile ?? snapshot.stats ?? DEFAULT_NARRATIVE_PROFILE,
      snapshot.profileUnlocks ?? snapshot.statUnlocks ?? DEFAULT_UNLOCKED_NARRATIVE_PROFILE,
    );
    this.relationships.restore(snapshot.relationships, snapshot.flags.numericFlags);
    this.inventory.restore(snapshot.inventory);
    this.party.restore(snapshot.party);
    this.progression.restore(snapshot.progression);
    this.appearance.restore(snapshot.appearance);
    this.quests.restore(snapshot.quests?.states);
    this.world.restore(snapshot.world);
    this.seenContent.restore(snapshot.seenContent);
    this.backlog.restore(snapshot.backlog);
    this.sceneFlow.restore(snapshot.sceneFlow);
    this.battle.restore(snapshot.battle);
    this.miniGame.restore(snapshot.miniGame);
    this.ui.restore(snapshot.ui);
    this.dialogue.restore(snapshot.dialogue);
    this.audio.reset();
    this.audio.applyPreferences(this.preferences.snapshot);

    if (this.sceneFlow.isActive) {
      this.audio.syncSceneFlowPresentation();
    }
  }

  private restorePreviewBaseline(snapshot: GameSaveRuntimeSnapshot) {
    this.meta.restore(snapshot.meta);
    this.time.restore(snapshot.time);
    this.flags.restore(snapshot.flags);
    this.profile.restore(
      snapshot.profile ?? snapshot.stats ?? DEFAULT_NARRATIVE_PROFILE,
      snapshot.profileUnlocks ?? snapshot.statUnlocks ?? DEFAULT_UNLOCKED_NARRATIVE_PROFILE,
    );
    this.relationships.restore(snapshot.relationships, snapshot.flags.numericFlags);
    this.inventory.restore(snapshot.inventory);
    this.party.restore(snapshot.party);
    this.progression.restore(snapshot.progression);
    this.appearance.restore(snapshot.appearance);
    this.quests.restore(snapshot.quests?.states);
    this.world.restore(snapshot.world);
    this.seenContent.restore(snapshot.seenContent);
    this.ui.setScreen(snapshot.ui.activeScreen);
  }
}
