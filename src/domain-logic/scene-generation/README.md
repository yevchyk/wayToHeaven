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

## Stage Contract

Canonical stage model:
- `stage.characters[]`
- `stage.focusCharacterId`

Legacy `left / center / right / extra` stage layout is rejected for `sceneGeneration`.

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
- stage patch is replace-first in v1

## Supported Runtime Features

Supported now:
- `sequence`, `hub`, `route`
- `nextNodeId`
- `nextSceneId`
- `openSceneFlowId`
- `jumpToNode`
- scene defaults
- `sceneChange`
- `node.conditions`
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
