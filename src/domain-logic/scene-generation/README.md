# Scene Generation Contract

`sceneGeneration` is the canonical authored scene package format for new content.

Runtime path:
- authored TS document
- `SceneGenerationValidator`
- `importSceneGenerationDocument`
- `adaptSceneGenerationToSceneFlow`
- `sceneFlowRegistry`
- `SceneFlowController`

Production source:
- `src/content/scene-generation`
- `src/content/registries/sceneGenerationRegistry.ts`

Reference fixtures:
- `chapter1-prologue.scenes.json`
- `scene-generation-all-features.example.json`

## Required Contract

Document shape:
- `id`
- `schemaVersion`
- `title`
- `meta.chapterId`
- `scenes`

Scene shape:
- `id`
- `startNodeId`
- `nodes`
- optional `mode: sequence | hub | route`

Node shape:
- `id`
- `type`
- optional `text`
- optional `choices`
- optional `nextNodeId`
- optional `nextSceneId`
- optional `openSceneFlowId`

Authored text fields:
- `text`, `description`, choice labels, and transition labels may contain a safe inline HTML subset
- supported tags: `br`, `strong`, `b`, `em`, `i`, `u`, `p`, `ul`, `ol`, `li`, `span`, `code`
- runtime strips unsupported tags and never preserves raw attributes

## Stage Contract

Canonical stage model:
- `stage.characters[]`
- `stage.focusCharacterId`
- optional `stage.characters[].placement`

`placement` fields:
- `x`: horizontal stage anchor in percent from `0` to `100`
- `y`: optional lift from the stage floor in percent
- `scale`: optional base portrait scale before active-speaker emphasis
- `zIndex`: optional explicit layer order
- `opacity`: optional per-character fade for background presence

Practical authoring meaning:
- characters may be placed anywhere across the screen, not only in legacy left/right slots
- authors may make a character visually larger or smaller per beat through `placement.scale`
- a scene beat may move, enlarge, shrink, fade, or restack characters by replacing `stage.characters[]` in `sceneChange`

Legacy `left / center / right / extra` stage layout is rejected for `sceneGeneration`.

Minimal JSON example:

```json
{
  "stage": {
    "characters": [
      {
        "speakerId": "mirella",
        "placement": {
          "x": 22,
          "y": 2,
          "scale": 1.16,
          "zIndex": 5
        }
      },
      {
        "speakerId": "guard",
        "placement": {
          "x": 84,
          "scale": 0.92,
          "opacity": 0.7
        }
      }
    ],
    "focusCharacterId": "mirella"
  }
}
```

Authored HTML example:

```json
{
  "text": "<p>Safe authored <strong>HTML</strong> works in scene-generation text fields.</p><p><em>Unsupported tags and attributes are stripped by runtime.</em></p>"
}
```

## Precedence Rules

Presentation precedence at runtime:
1. document defaults
2. scene defaults
3. `sceneChange` presentation patch
4. explicit node presentation fields
5. explicit effects

Condition precedence:
- flow conditions are resolved before entering the flow
- node conditions are resolved before entering the node
- blocked conditions require `onConditionFail`
- flow conditions can redirect to another scene to implement scene replacement / scene skipping

## Background Variables

For authored story state, use `flags` as background variables.

Supported patterns:
- boolean flags via `setFlag`
- numeric counters via `setFlag` or `changeNumericFlag` through scripts/effects
- string state via `setFlag`

Read them back with:
- `flagEquals`
- `flag`

Use inventory-gated conditions when the authored state should depend on an item instead of a flag.

## Authoring Loop

For stage presentation work, use this order:
1. author the executable `scene-generation` JSON/TS contract first
2. validate and preview the runtime transition/placement behavior
3. update `Documentation` in the same task so the accepted stage effect pattern stays canonical

## Patch Rules

`sceneChange` is a runtime presentation patch, not metadata.

Supported fields:
- `stage`
- `background`
- `music`
- `cgId`
- `overlayId`
- `sfx`
- `transition`

Patch semantics:
- `cgId: null` clears CG
- `overlayId: null` clears overlay
- `stage: null` clears stage
- `background.style: null` clears the active background style
- stage patch is replace-first in v1

Scene-level background style:
- `meta.defaultBackgroundStyle` sets the default treatment for every scene in the document unless overridden
- `scene.backgroundStyle` sets the opening treatment for one scene
- use this for presentation layers like `blood-border`, `shadow-veil`, `smoke-haze`, not for changing the underlying asset

## Supported Runtime Features

Supported now:
- `sequence`, `hub`, `route`
- `nextNodeId`
- `nextSceneId`
- `openSceneFlowId`
- `jumpToNode`
- scene defaults
- `sceneChange`
- flow-level scene skipping / replacement through `conditions + onConditionFail`
- `node.conditions`
- `choice.conditions`
- `scene.conditions`
- `inventory` conditions for authored item checks
- `onConditionFail`
- `routeRules.rollRange`
- tags on scenes, nodes, choices

Degraded for now:
- advanced animation nuance
- rich audio playback shell
- dedicated CG / overlay UI shell beyond runtime state

## Validation Path

Fast smoke path:
- `pnpm validate:content`

Full suite:
- `pnpm test:run`
- `pnpm build`
