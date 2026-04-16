# Character Prompt Workflow

## Purpose

This document defines how portrait-generation prompts should be built for the current project.

The goal is simple:

- NPCs and supporting cast use full flat portrait prompts
- Mirella uses composite-facing prompts first
- Storybook must point to real runtime targets instead of loose art ideas

## Approved Prompt Modes

There are only three approved render targets:

1. `flat-portrait`
Use this for normal dialogue portraits on a transparent background.

2. `composite-head`
Use this for Mirella head overlays that swap expression on top of the existing heroine rig.

3. `rig-layer`
Use this for Mirella rig assets like `body/base`, `clothes/base`, `hair/base`, `hands/*`, or `weapon/base`.

Do not invent extra prompt categories unless the runtime contract changes first.

## Main Rule

Prompting follows the same runtime policy as the portrait pipeline:

- common cast: full emotion sheets
- heroine: head overlays and rig layers first
- fallback flat portraits for Mirella are allowed, but they are not the main production path

## Storybook Surface

The current prompt workflow lives in:

- `Narrative Portrait/Character Prompt Composer`

This is the main entrypoint for new portrait generation work. Use it before touching the lower-level portrait benches,
because it already knows the runtime target, content file, and asset field that the prompt must update.

Supporting stories remain:

- `Narrative Portrait/Workbench`
- `Character Composite/Workbench`

Use them together:

- inspect current targets in the portrait/composite workbenches
- generate the actual prompt in the prompt composer

## Runtime Targets

Every prompt must point to a real runtime target:

- asset id
- source content file
- exact asset field path

If a prompt cannot name the target file and field, it is not production-ready yet.

## Source Files

The current prompt-authoring layer is:

- `src/engine/types/characterAuthoring.ts`
- `src/engine/utils/buildCharacterPromptRecipe.ts`
- `src/content/storybook/characterProfiles/chapter1CharacterPromptWorkbench.ts`
- `src/ui/components/character-authoring/CharacterPromptWorkbench.tsx`

## What Is Forbidden

- writing NPC prompts as if they were composite rigs
- repainting Mirella as a full new body for every emotion by default
- generating art without a runtime target
- inventing new silhouette or costume logic between adjacent emotions unless the content actually changes

## Related Documents

- `Портретний пайплайн.md`
- `UI арт-дирекшн і rollout.md`
- `CONTENT_PIPELINE.md`
