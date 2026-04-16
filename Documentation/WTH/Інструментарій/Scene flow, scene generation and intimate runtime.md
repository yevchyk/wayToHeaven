# Scene flow, scene generation and intimate runtime

## Core idea

`WayToHeaven` uses one shared scene runtime instead of several separate engines.

That runtime is:
- `SceneFlowStore`
- `SceneFlowController`
- `DialogueStore`

Key files:
- [SceneFlowStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SceneFlowStore.ts)
- [SceneFlowController.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/SceneFlowController.ts)
- [DialogueStore.ts](/D:/projects/wayToHeaven/src/engine/stores/DialogueStore.ts)

## Supported modes

`SceneFlow` supports 3 authored modes:
- `sequence`
- `hub`
- `route`

### `sequence`

Used for:
- classic dialogue scenes
- narration
- branching choices
- intimate scenes
- replay scenes

Presentation target:
- paged text
- speaker focus
- stage composition
- CG and overlay support

### `hub`

Used for:
- city zones
- local open areas
- meaningful local actions

Presentation target:
- location-first panel
- action cards
- local navigation without abstract coordinates

### `route`

Used for:
- roads
- dangerous transitions
- travel events
- distance, risk, scarcity

Presentation target:
- route board
- event cadence
- route state
- step-based movement pressure

## Source types

Scene flow can come from multiple authoring sources:
- legacy dialogue
- legacy city scene
- legacy travel board
- scene generation document

Key files:
- [sceneFlowAdapters.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/sceneFlowAdapters.ts)
- [sceneFlowViewAdapters.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/sceneFlowViewAdapters.ts)
- [adaptSceneGenerationToSceneFlow.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/adaptSceneGenerationToSceneFlow.ts)
- [importSceneGenerationDocument.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/importSceneGenerationDocument.ts)

This means the engine can preserve old content contracts while standardizing runtime behavior.

## Scene generation contract

Canonical type:
- [sceneGeneration.ts](/D:/projects/wayToHeaven/src/engine/types/sceneGeneration.ts)

What scene generation can define:
- scene mode
- default background
- default background style
- music
- CG
- overlay
- stage characters
- transitions
- conditions
- on-enter and on-exit effects
- route rules
- replay config

At import time:
- the document is validated
- scenes are transformed into `SceneFlowData`
- runtime no longer cares whether the source was legacy or generated

## Dialogue runtime responsibilities

`DialogueStore` is not a content registry.
It is runtime playback.

Responsibilities:
- active text
- grapheme-based reveal
- auto mode
- skip mode
- page breaks
- current stage / CG / overlay view
- backlog appending
- choice visibility handoff from scene flow

Key files:
- [DialogueStore.ts](/D:/projects/wayToHeaven/src/engine/stores/DialogueStore.ts)
- [dialogueReveal.ts](/D:/projects/wayToHeaven/src/engine/systems/dialogue/dialogueReveal.ts)
- [canShowChoice.ts](/D:/projects/wayToHeaven/src/engine/systems/dialogue/canShowChoice.ts)
- [DialogueConditionEvaluator.ts](/D:/projects/wayToHeaven/src/engine/systems/dialogue/DialogueConditionEvaluator.ts)

## Presentation state

The scene runtime tracks presentation separately from authored text:
- background
- background style
- current music
- current stage
- CG
- overlay
- active transition
- last SFX

This lives in:
- [sceneFlow.ts](/D:/projects/wayToHeaven/src/engine/types/sceneFlow.ts)
- [SceneFlowStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SceneFlowStore.ts)
- [applyScenePresentationPatch.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/applyScenePresentationPatch.ts)

This is important because intimate and dramatic scenes often rely more on presentation state than on new mechanics.

## Intimate and adult scenes

There is **no separate sex-scene engine**.

Intimate content uses the same runtime as normal scenes.

Current engine-level support:
- `sequence` mode scenes
- stage composition
- character emotion and portrait switching
- `cgId`
- `overlayId`
- background and music control
- `adultMarker`
- replay unlocking through `unlockSceneReplay`

Key files:
- [dialogue.ts](/D:/projects/wayToHeaven/src/engine/types/dialogue.ts)
- [effects.ts](/D:/projects/wayToHeaven/src/engine/types/effects.ts)
- [EffectRunner.ts](/D:/projects/wayToHeaven/src/engine/systems/effects/EffectRunner.ts)
- [GameRootStore.ts](/D:/projects/wayToHeaven/src/engine/stores/GameRootStore.ts)
- [buildLibraryEntries.ts](/D:/projects/wayToHeaven/src/engine/systems/library/buildLibraryEntries.ts)

### What `adultMarker` means

`adultMarker` is metadata, not a separate renderer.

It is currently useful for:
- content labeling
- future content filtering or warning UI
- internal authoring clarity

It does **not** create a new gameplay mode.

### Recommended production rule

Intimate scenes should be authored with the same scene grammar:
- regular sequence flow
- stronger use of stage/CG/overlay/music
- optional replay unlock
- optional codex visibility through seen-content and replay entries

That keeps adult content:
- validated
- save-safe
- replay-safe
- consistent with the rest of the game

## Replay scenes

Replay is a property of scene flow, not a separate runtime family.

Supported runtime pieces:
- `replay.enabled`
- `replay.unlockOnStart`
- `unlockSceneReplay` effect
- scene preview bootstrapping
- replay entries inside library/codex

Key files:
- [SceneFlowController.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/SceneFlowController.ts)
- [GameRootStore.ts](/D:/projects/wayToHeaven/src/engine/stores/GameRootStore.ts)
- [LibraryModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/LibraryModal.tsx)
- [SceneAuthoringValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneAuthoringValidator.ts)
- [Replay scenes.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Replay%20scenes.md)
- [Scene and replay production workflow.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Scene%20and%20replay%20production%20workflow.md)

## Conditions and effects

Scene flow is the place where authored conditions and effects are interpreted.

Conditions can read:
- flags
- meta
- profile
- inventory
- relationships
- tags

Effects can do things like:
- change meta
- start battle
- open route
- unlock replay
- change time
- run scripts
- set CG / overlay / music

This makes scenes the main orchestration layer for the whole game.

## Why this architecture matters

Because of this architecture, we do not need:
- one engine for dialogue
- one engine for travel scenes
- one engine for replay
- one engine for sex scenes

We only need:
- one validated scene runtime
- clear authoring contracts
- strong presentation tools

That is already the direction of the current project.

## What remains weaker

Weak points that still need future work:
- richer adult/intimate authoring examples
- stronger luxury presentation around replay archive
- more explicit content labeling or filtering if needed later
- more authored hub/route examples using the new time contract
- richer Storybook/runtime preview coupling for scene QA beyond the structural authoring workbench

The core runtime itself is already there.
