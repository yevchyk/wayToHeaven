# Scene and replay production workflow

## Purpose

This document fixes the practical production path for:
- live authored scenes
- replay-enabled scenes
- replay-only archive scenes

It is about engine-facing authoring, not about lore or prose quality.

## Current source of truth

Canonical engine pieces:
- [SceneGenerationValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneGenerationValidator.ts)
- [SceneAuthoringValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneAuthoringValidator.ts)
- [importSceneGenerationDocument.ts](/D:/projects/wayToHeaven/src/engine/systems/scenes/importSceneGenerationDocument.ts)
- [GameRootStore.ts](/D:/projects/wayToHeaven/src/engine/stores/GameRootStore.ts)

Canonical authoring surfaces:
- [SceneAuthoringWorkbench.stories.tsx](/D:/projects/wayToHeaven/.storybook/SceneAuthoringWorkbench.stories.tsx)
- [AuthoringStartHere.stories.tsx](/D:/projects/wayToHeaven/.storybook/AuthoringStartHere.stories.tsx)

## Production path

Recommended order:
1. Update or create the scene note in `Documentation/WTH`.
2. Author or extend the real `*.scene-generation.ts` document.
3. Ensure the scene has matching `SceneMeta`.
4. If replay is needed, add `replay.enabled` and the unlock path.
5. Check the scene in `Scene Authoring/Workbench`.
6. Run runtime QA in the game or via library preview.

## Live scenes

A normal scene should have:
- `scene.id`
- `scene.mode`
- `scene.startNodeId`
- authored nodes
- matching `SceneMeta.mainSceneFlowId`

For a normal live scene, replay is optional.

## Replay-enabled scenes

A live scene can also be replay-enabled.

Use this when:
- the scene belongs in archive/history
- the same authored scene should be previewable later

Minimal contract:

```ts
replay: {
  enabled: true,
}
```

## Replay-only scenes

Replay-only scenes are scenes that exist mainly for the archive.

They still use the same runtime, but they must be reachable.

Safe rule:
- if replay scene id looks like `.../replay/...`, it should also be `replay.enabled: true`
- it should have either:
  - `unlockOnStart: true`
  - or at least one `unlockSceneReplay` source from a live scene

## What the validator now protects

`SceneAuthoringValidator` currently checks:
- every `SceneMeta` points to a real authored scene
- every authored scene has a matching `SceneMeta`
- replay-looking scene ids are actually replay-enabled
- `unlockSceneReplay` does not point to missing scenes
- `unlockSceneReplay` does not point to non-replay scenes
- replay-only scenes are not left orphaned without an unlock path

This validator is now part of `GameRootStore.validateContentGraph()`.

## What the Storybook workbench is for

`Scene Authoring/Workbench` is not the runtime.

It is the fast QA surface for:
- scene mode
- node count
- choice count
- replay flag
- replay unlock source
- source file mapping
- scene meta mapping

Use it to catch structural mistakes before opening the game.

## Practical rule for intimate scenes

There is still no separate sex-scene engine.

If a scene is intimate:
- author it as a normal `sequence`
- use stage, CG, overlay, music, and pacing
- mark it replayable only if archive replay is actually desired

Replay should stay a library/archive concern, not a second content pipeline.
