# Replay Scenes

## Purpose

Replay scenes let the project expose authored story scenes outside the live playthrough.

The same scene can now exist in two runtime modes:

- `live`: normal story execution with persistent consequences
- `preview`: isolated replay execution for review from the library

Preview mode is intended for scenes that the player should be able to rewatch after unlocking them in the story.

## Runtime Contract

Replay uses the existing scene-flow runtime instead of a second narrative engine.

Key rules:

- preview runs in a sandbox
- the previous runtime snapshot is restored after preview ends
- preview does not auto-save
- replay scene unlocks come only from live story execution
- replay scenes are listed in the library under the dedicated replay tab

This keeps authored branching, background swaps, CG changes, text paging, and local scene rhythm inside one engine, while preventing replay from overwriting the active run.

## Scene Generation Contract

`SceneGenerationScene` now supports:

```ts
replay?: {
  enabled: boolean;
  unlockOnStart?: boolean;
}
```

Meaning:

- `enabled: true` marks the scene as replay-capable
- `unlockOnStart` defaults to runtime start-unlock behavior; set it explicitly only when the unlock timing must change later

Replay-only scenes that should unlock from some other live node can now use an explicit effect:

```ts
{
  type: 'unlockSceneReplay',
  sceneId: 'chapter-1/scene/thorn-estate/replay/corset-tie',
}
```

Use that when the replay scene is authored separately from the live scene that reveals it.

Example:

```ts
{
  id: 'chapter-1/scene/intro',
  mode: 'sequence',
  startNodeId: 's1_intro',
  replay: {
    enabled: true,
  },
  nodes: {
    // ...
  },
}
```

Current authored replay-enabled scenes:

- `chapter-1/scene/intro`
- `chapter-1/scene/awakening`
- `chapter-1/scene/thorn-estate/replay/corset-tie`
- `chapter-1/scene/thorn-estate/replay/father-betrayal`

## Production guardrails

Replay production is now protected by:
- [SceneAuthoringValidator.ts](/D:/projects/wayToHeaven/src/engine/validators/SceneAuthoringValidator.ts)
- [Scene and replay production workflow.md](/D:/projects/wayToHeaven/Documentation/WTH/Інструментарій/Scene%20and%20replay%20production%20workflow.md)
- [SceneAuthoringWorkbench.stories.tsx](/D:/projects/wayToHeaven/.storybook/SceneAuthoringWorkbench.stories.tsx)

What this layer now guards against:
- replay scene meta without a real authored scene
- replay-looking scene ids without `replay.enabled`
- unlocks pointing to missing scenes
- unlocks pointing to scenes that are not replay-enabled
- replay-only scenes with no unlock path

## Authoring Guidance

Replay scenes work best when the important visual and branching logic is authored directly in the scene graph:

- background changes through scene fields or `sceneChange`
- image swaps through `cgId`, `overlayId`, and stage changes
- branching through `choices`, `nextNodeId`, and `nextSceneId`
- pacing through narration/dialogue nodes, transitions, SFX, and music

Use replay scenes for things like:

- dressing sequences
- ritual sequences
- memory scenes
- intimate chamber scenes
- cinematic transitions that the player may want to revisit

## Intimate Scene Contract

Intimate or erotic scenes do not use a separate runtime.

They should be authored through the same scene-flow stack:

- stage and character changes
- background swaps
- `cgId` and `overlayId`
- music and SFX cues
- replay unlocks when the scene belongs in the archive

Important rule:

- `adultMarker` is a content-classification field, not a second presentation engine
- do not build a dedicated erotic scene player unless the project later proves that the shared scene-flow runtime is no longer enough
- if the scene should be replayable from the library, use the normal replay contract instead of inventing a special archive path

## Current Engine Limitation

Preview mode restores the previous runtime snapshot after exit.

That means replay is safe for review, but authors should still prefer scene-local branching over broad game-state mutation when designing scenes primarily for archive playback.
