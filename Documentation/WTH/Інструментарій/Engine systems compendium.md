# Engine systems compendium

## Purpose

This document is the **entry point for the non-story side of the project**.

It maps:
- runtime architecture
- system responsibilities
- where the source-of-truth docs live
- which files are the real engine anchors

This is about the engine, UI shell, content contracts, validators, persistence, and tooling.

It is **not** a lore or narrative canon document.

## Core principle

`WayToHeaven` is built as a **scene-first RPG/VN engine**.

The game is not split into isolated products.
It is one runtime with different modes:
- `sequence`
- `hub`
- `route`
- `battle`
- `minigame`
- `codex / shell / save / replay`

## Runtime map

### Root runtime

Canonical root:
- [GameRootStore.ts](/D:/projects/wayToHeaven/src/engine/stores/GameRootStore.ts)

`GameRootStore` owns:
- registries
- stores
- validators
- controllers
- effect execution
- save snapshot assembly

This is the composition root for the whole engine.

### Core stores

Primary runtime stores:
- [UIStore.ts](/D:/projects/wayToHeaven/src/engine/stores/UIStore.ts)
- [SceneFlowStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SceneFlowStore.ts)
- [DialogueStore.ts](/D:/projects/wayToHeaven/src/engine/stores/DialogueStore.ts)
- [CitySceneStore.ts](/D:/projects/wayToHeaven/src/engine/stores/CitySceneStore.ts)
- [TravelBoardStore.ts](/D:/projects/wayToHeaven/src/engine/stores/TravelBoardStore.ts)
- [WorldStore.ts](/D:/projects/wayToHeaven/src/engine/stores/WorldStore.ts)
- [BattleStore.ts](/D:/projects/wayToHeaven/src/engine/stores/BattleStore.ts)
- [PartyStore.ts](/D:/projects/wayToHeaven/src/engine/stores/PartyStore.ts)
- [InventoryStore.ts](/D:/projects/wayToHeaven/src/engine/stores/InventoryStore.ts)
- [QuestStore.ts](/D:/projects/wayToHeaven/src/engine/stores/QuestStore.ts)
- [ProgressionStore.ts](/D:/projects/wayToHeaven/src/engine/stores/ProgressionStore.ts)
- [MetaStore.ts](/D:/projects/wayToHeaven/src/engine/stores/MetaStore.ts)
- [RelationshipStore.ts](/D:/projects/wayToHeaven/src/engine/stores/RelationshipStore.ts)
- [FlagsStore.ts](/D:/projects/wayToHeaven/src/engine/stores/FlagsStore.ts)
- [TimeStore.ts](/D:/projects/wayToHeaven/src/engine/stores/TimeStore.ts)
- [AudioStore.ts](/D:/projects/wayToHeaven/src/engine/stores/AudioStore.ts)
- [SaveStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SaveStore.ts)
- [SeenContentStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SeenContentStore.ts)
- [BacklogStore.ts](/D:/projects/wayToHeaven/src/engine/stores/BacklogStore.ts)
- [MiniGameStore.ts](/D:/projects/wayToHeaven/src/engine/stores/MiniGameStore.ts)
- [PreferencesStore.ts](/D:/projects/wayToHeaven/src/engine/stores/PreferencesStore.ts)

### Core controllers and systems

Primary execution systems:
- [EffectRunner.ts](/D:/projects/wayToHeaven/src/engine/systems/effects/EffectRunner.ts)
- [SceneFlowController.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/SceneFlowController.ts)
- [CitySceneController.ts](/D:/projects/wayToHeaven/src/engine/systems/city/CitySceneController.ts)
- [TravelBoardController.ts](/D:/projects/wayToHeaven/src/engine/systems/travel/TravelBoardController.ts)
- [WorldController.ts](/D:/projects/wayToHeaven/src/engine/systems/world/WorldController.ts)
- [BattleResolver.ts](/D:/projects/wayToHeaven/src/engine/systems/battle/BattleResolver.ts)
- [BattleAI.ts](/D:/projects/wayToHeaven/src/engine/systems/battle/BattleAI.ts)
- [TurnQueueBuilder.ts](/D:/projects/wayToHeaven/src/engine/systems/battle/TurnQueueBuilder.ts)
- [StatusProcessor.ts](/D:/projects/wayToHeaven/src/engine/systems/battle/StatusProcessor.ts)
- [QuestRuntimeEngine.ts](/D:/projects/wayToHeaven/src/engine/systems/quests/QuestRuntimeEngine.ts)
- [LootTableResolver.ts](/D:/projects/wayToHeaven/src/engine/systems/rewards/LootTableResolver.ts)
- [MiniGameController.ts](/D:/projects/wayToHeaven/src/engine/systems/minigame/MiniGameController.ts)

## Documentation map

### 1. UI direction and visual shell

Main docs:
- [UI арт-дирекшн і rollout.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/UI%20арт-дирекшн%20і%20rollout.md)
- [Dialogue engine audit and main menu pass.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Dialogue%20engine%20audit%20and%20main%20menu%20pass.md)
- [Battle UI redesign pass.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20UI%20redesign%20pass.md)
- [Battle visual lab.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20visual%20lab.md)

Key UI files:
- [AppShell.tsx](/D:/projects/wayToHeaven/src/ui/layouts/AppShell.tsx)
- [DialogueScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/DialogueScreen.tsx)
- [CitySceneScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/CitySceneScreen.tsx)
- [BattleScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/BattleScreen.tsx)
- [MainMenuScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/MainMenuScreen.tsx)
- [SceneFlowPresentationShell.tsx](/D:/projects/wayToHeaven/src/ui/components/scene-flow/SceneFlowPresentationShell.tsx)

### 2. Dialogue and scene runtime

Main docs:
- [Dialogue shell and placeholder fallback.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Dialogue%20shell%20and%20placeholder%20fallback.md)
- [Scene flow, scene generation and intimate runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Scene%20flow,%20scene%20generation%20and%20intimate%20runtime.md)
- [Scene and replay production workflow.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Scene%20and%20replay%20production%20workflow.md)
- [Будівельник сцен максимальний приклад.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Будівельник%20сцен%20максимальний%20приклад.md)
- [Replay scenes.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Replay%20scenes.md)

Key files:
- [DialogueStore.ts](/D:/projects/wayToHeaven/src/engine/stores/DialogueStore.ts)
- [dialogueReveal.ts](/D:/projects/wayToHeaven/src/engine/systems/dialogue/dialogueReveal.ts)
- [SceneFlowController.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/SceneFlowController.ts)
- [importSceneGenerationDocument.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/importSceneGenerationDocument.ts)
- [adaptSceneGenerationToSceneFlow.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/adaptSceneGenerationToSceneFlow.ts)

### 3. Hubs, world, routes, time

Main docs:
- [World and travel direction.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/World%20and%20travel%20direction.md)
- [Time, hubs and travel economy.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Time,%20hubs%20and%20travel%20economy.md)

Key files:
- [WorldStore.ts](/D:/projects/wayToHeaven/src/engine/stores/WorldStore.ts)
- [CitySceneStore.ts](/D:/projects/wayToHeaven/src/engine/stores/CitySceneStore.ts)
- [TravelBoardStore.ts](/D:/projects/wayToHeaven/src/engine/stores/TravelBoardStore.ts)
- [TimeStore.ts](/D:/projects/wayToHeaven/src/engine/stores/TimeStore.ts)
- [WorldController.ts](/D:/projects/wayToHeaven/src/engine/systems/world/WorldController.ts)
- [TravelBoardController.ts](/D:/projects/wayToHeaven/src/engine/systems/travel/TravelBoardController.ts)
- [TravelBoardScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/TravelBoardScreen.tsx)

### 4. Battle, rewards, progression

Main docs:
- [Battle і inventory runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20і%20inventory%20runtime.md)
- [Battle rewards and progression runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20rewards%20and%20progression%20runtime.md)
- [Battle progression proposal.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20progression%20proposal.md)

Key files:
- [BattleStore.ts](/D:/projects/wayToHeaven/src/engine/stores/BattleStore.ts)
- [BattleResolver.ts](/D:/projects/wayToHeaven/src/engine/systems/battle/BattleResolver.ts)
- [ProgressionStore.ts](/D:/projects/wayToHeaven/src/engine/stores/ProgressionStore.ts)
- [BattleRewardsModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/BattleRewardsModal.tsx)

### 5. Quests, relationships, meta consequences

Main docs:
- [Quest engine and consequences.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Quest%20engine%20and%20consequences.md)

Key files:
- [QuestStore.ts](/D:/projects/wayToHeaven/src/engine/stores/QuestStore.ts)
- [QuestRuntimeEngine.ts](/D:/projects/wayToHeaven/src/engine/systems/quests/QuestRuntimeEngine.ts)
- [RelationshipStore.ts](/D:/projects/wayToHeaven/src/engine/stores/RelationshipStore.ts)
- [MetaStore.ts](/D:/projects/wayToHeaven/src/engine/stores/MetaStore.ts)
- [QuestJournalModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/QuestJournalModal.tsx)

### 6. Player shell, save/load, codex, replay

Main docs:
- [Player shell, saves, codex and replay runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Player%20shell,%20saves,%20codex%20and%20replay%20runtime.md)

Key files:
- [SaveStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SaveStore.ts)
- [savePersistence.ts](/D:/projects/wayToHeaven/src/engine/systems/save/savePersistence.ts)
- [SeenContentStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SeenContentStore.ts)
- [BacklogStore.ts](/D:/projects/wayToHeaven/src/engine/stores/BacklogStore.ts)
- [PreferencesStore.ts](/D:/projects/wayToHeaven/src/engine/stores/PreferencesStore.ts)
- [LibraryModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/LibraryModal.tsx)
- [SavesModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/SavesModal.tsx)
- [BacklogModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/BacklogModal.tsx)

### 7. Portraits, composites, prompts, placeholder art

Main docs:
- [Портретний пайплайн.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Портретний%20пайплайн.md)
- [Character prompt workflow.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Character%20prompt%20workflow.md)
- [Portrait readiness audit.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Portrait%20readiness%20audit.md)
- [Portrait batch 01.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Portrait%20batch%2001.md)
- [Portrait batch 01 execution.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Portrait%20batch%2001%20execution.md)
- [Local Stable Diffusion Forge.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Local%20Stable%20Diffusion%20Forge.md)

### 8. Audio, minigames, presentation support

Main docs:
- [Audio, minigames and presentation runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Audio,%20minigames%20and%20presentation%20runtime.md)

Key files:
- [AudioStore.ts](/D:/projects/wayToHeaven/src/engine/stores/AudioStore.ts)
- [MiniGameStore.ts](/D:/projects/wayToHeaven/src/engine/stores/MiniGameStore.ts)
- [MiniGameController.ts](/D:/projects/wayToHeaven/src/engine/systems/minigame/MiniGameController.ts)
- [MiniGameScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/MiniGameScreen.tsx)

## Engine contracts by subsystem

### Dialogue and scenes

There is **no separate engine** for:
- normal dialogue
- hub navigation
- route scenes
- replay scenes
- intimate scenes

All of them are variations of the same `SceneFlow` runtime.

### Intimate / adult content

There is **no separate porn engine**.

Intimate content is authored through:
- `sequence` scenes
- stage composition
- portraits
- CGs
- overlays
- `adultMarker`
- replay unlocking when needed

This is intentional.
It keeps intimate content inside the same validated runtime as the rest of the game.

### Travel and time

`World` is not the default gameplay layer.

Main movement identity:
- scene choice
- hub action
- route only when the road matters

Time is now a first-class runtime concern through `TimeStore`.

### Codex and replay

The codex is not decorative.
It is connected to runtime discovery:
- seen nodes
- discovered characters
- discovered locations
- replay-enabled scene entries

### Validators

Content validation is part of the engine contract, not an optional tool.

Important validators:
- [DialogueValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/DialogueValidator.ts)
- [SceneFlowValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneFlowValidator.ts)
- [SceneGenerationValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneGenerationValidator.ts)
- [SceneAuthoringValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneAuthoringValidator.ts)
- [LocationGraphValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/LocationGraphValidator.ts)
- [TravelBoardValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/TravelBoardValidator.ts)
- [BattleTemplateValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/BattleTemplateValidator.ts)
- [QuestContentValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/QuestContentValidator.ts)
- [ContentGraphValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/ContentGraphValidator.ts)

## What already exists as engine reality

The project already has real implementations for:
- scene-first dialogue runtime
- scene generation import pipeline
- hub and route scene-flow modes
- queue-based battles
- battle items, status timing, rewards, XP, level-up
- staged quests and consequence syncing
- route time economy and hub time costs
- codex, replay, seen-content discovery
- portrait/composite pipeline
- audio store and minigame runtime
- save/load snapshots and persistence

## What is still a weaker layer

The weakest engine-adjacent areas now are not the core contracts, but presentation depth:
- world/travel final UX polish
- codex/archive luxury pass
- audio direction depth
- richer intimate production authoring guidelines
- placeholder art replacement

## Practical reading order

If you want to understand the engine fast, read in this order:

1. [Engine systems compendium.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Engine%20systems%20compendium.md)
2. [Scene flow, scene generation and intimate runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Scene%20flow,%20scene%20generation%20and%20intimate%20runtime.md)
3. [Battle і inventory runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Battle%20і%20inventory%20runtime.md)
4. [Quest engine and consequences.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Quest%20engine%20and%20consequences.md)
5. [Time, hubs and travel economy.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Time,%20hubs%20and%20travel%20economy.md)
6. [Player shell, saves, codex and replay runtime.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Player%20shell,%20saves,%20codex%20and%20replay%20runtime.md)

## Rule for future updates

If engine behavior changes:
- update the subsystem doc
- update this compendium if the system map changed
- update `CONTENT_PIPELINE.md` if the contract changed

This file is not a design diary.
It is the documentation map for the engine side of the project.
