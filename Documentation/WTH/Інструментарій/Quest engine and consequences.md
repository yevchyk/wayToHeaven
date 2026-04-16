# Quest engine and consequences

## Status

Quest, relationship, and meta-consequence runtime is now a real engine layer, not just a flat checklist.

Current state:
- quests can stay legacy-simple if needed
- new quests can be staged
- stages can react to counters or live conditions
- relationship and meta values can unlock or complete quest objectives
- journal UI can render active stage and objective progress
- quest content is validated at content-graph level

## Core architecture

Main runtime files:
- `src/engine/stores/QuestStore.ts`
- `src/engine/systems/quests/QuestRuntimeEngine.ts`
- `src/engine/stores/RelationshipStore.ts`
- `src/engine/systems/effects/EffectRunner.ts`
- `src/engine/validators/QuestContentValidator.ts`
- `src/ui/modals/QuestJournalModal.tsx`

Content entrypoints:
- `src/content/registries/questRegistry.ts`
- `src/content/chapters/chapter-1/quests/caravan-to-hugen-um.quests.ts`
- `src/content/chapters/chapter-2/quests/hugen-um.quests.ts`

Architecture choice:
- `QuestStore` owns runtime state and journal-facing queries
- `QuestRuntimeEngine` owns stage transitions, objective sync, and quest completion rules
- `RelationshipStore` stays independent and exposes numeric axes
- `EffectRunner` is the bridge that re-syncs reactive quests after relevant state changes

This keeps quests authored as data while consequences still feel alive.

## Quest model

The engine now supports two quest shapes.

### 1. Legacy progress quest

Use this only for very simple lines that are still authored as a single numeric track.

Relevant fields:
- `id`
- `title`
- `category`
- optional `maxProgress`

This is still supported so old content does not break.

### 2. Staged quest

This is now the preferred contract for new quests.

Relevant fields:
- `id`
- `title`
- `category`
- `startStageId`
- `stages`
- optional `completionEffects`

Each stage has:
- `id`
- `title`
- `objectives`
- optional `description`
- optional `onEnterEffects`
- optional `onCompleteEffects`
- optional `nextStageId`

Each objective has:
- `id`
- `label`
- `kind`
- optional `description`
- optional `hidden`

Supported objective kinds:
- `counter`
- `condition`

## Counter objectives

Use `counter` when the story explicitly decides when progress happens.

Typical example:
- survive one night with Yarva
- close the first deal with Nena
- bring one item to a contact

Progress is advanced through:
- `advanceQuest`
- `advanceQuest` with `objectiveId`

This is the right choice when progression is tied to a concrete authored beat.

## Condition objectives

Use `condition` when the quest should react to the live state of the run.

This is the core of relationship and meta consequences.

Condition objectives can now read:
- flags
- meta values
- inventory counts
- tags
- stats / profile values
- relationships

Relationship condition example:
- Yarva trust is at least `1`

Meta condition example:
- caravan morale is at least `1`

When a relevant effect changes the state, the quest engine re-syncs active reactive quests automatically.

## Relationship layer

Relationship values live in `RelationshipStore`.

Current axes:
- `affinity`
- `trust`
- `respect`
- `fear`
- `intimacy`
- `dependency`

This means a quest no longer needs to fake relationship gating through loose flags.

Preferred use:
- use relationship conditions for emotional gates
- keep raw flags for one-off plot states
- keep quests as the visible arc the player can track

Good pattern:
- relationship changes happen through effects in scenes
- quests observe those values and change stage when thresholds are met

## Meta consequences

Meta values like hunger, morale, reputation, and similar system pressure can now drive quests directly.

Good use cases:
- caravan morale decides whether Mirella is treated as a burden or an asset
- hunger gates how long a fragile deal can be sustained
- reputation opens or closes city opportunities

This is the right layer for systemic pressure.

Do not push this logic into UI copy or hand-written React conditions.

## Journal contract

`QuestJournalModal` now expects staged quests and can show:
- quest title
- owner label
- quest kind
- progress bar when defined
- active stage title
- active stage description
- objective list
- per-objective progress or done state

This means the journal can already support real quest writing, not just placeholder progress bars.

## Validation

`QuestContentValidator` now checks:
- duplicate stage ids
- duplicate objective ids inside a stage
- missing `startStageId`
- broken `nextStageId`
- invalid effect references in quest completion or stage hooks

This is important because staged quests are easy to break silently if references are not validated.

## What is already safe to author

You can now safely write:
- main quest lines with visible stage changes
- character quests that react to trust, fear, intimacy, or respect
- daily or repeatable tracks with explicit counter progress
- city deals that react to morale or reputation
- escort / caravan lines that react to hunger and morale

## What is still weak

The engine is good now, but a few areas are still lighter than they could be:
- there is no dedicated quest script DSL beyond existing effects and conditions
- completed quests do not yet branch into a richer codex-style archive view
- relationship feedback in UI is still stronger in runtime than in presentation
- meta consequences exist mechanically, but their player-facing surfacing can still be richer

None of this blocks writing content.

## Recommended authoring pattern

For new quest lines, use this rhythm:

1. Define the visible quest fantasy.
2. Break it into 2-4 stages.
3. Decide which stages are counter-driven and which are condition-driven.
4. Put emotional gates into relationships.
5. Put systemic pressure into meta values.
6. Use `onEnterEffects` and `onCompleteEffects` for consequences.
7. Give every visible objective a clean journal label.

That gives us a quest line the player can understand and the engine can actually sustain.

## Current verdict

Yes, there is now a normal quest engine in the project.

Not “finished forever,” but good enough and clean enough to support:
- authored quest arcs
- relationship-dependent progression
- meta-driven consequences
- visible journal feedback
- validator-backed content expansion

The next logical phase is not more engine work by default.

The next best phase is authoring:
- write 2-3 fully staged quest lines
- push relationship thresholds into real scenes
- make morale / hunger / reputation matter in authored branches
