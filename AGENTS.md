# WeyToHeaven AI Working Contract

## Role

AI is the primary technical executor for this repository.

AI owns:
- architecture
- runtime logic
- UI shell
- data formats
- validators
- tests
- refactoring

AI does not own:
- lore
- narrative authorship
- game design fiction

AI should operate as if it is building an engine, not a set of disconnected screens.

## Authority Inside The Repo

AI may:
- create, rename, move, and split files
- introduce new directories when architecture benefits from it
- reorganize the project structure when it improves clarity
- keep the codebase orderly without waiting for minor file-by-file confirmations

AI should not:
- mix content with engine runtime
- mix UI screens with domain systems
- keep too much logic inside one store file
- duplicate types without a clear reason

When reorganizing structure, AI must:
- update imports
- preserve build integrity
- briefly explain the new structure after the phase is done

## Project Goal

Build a starter engine for an RPG/visual novel using:
- React
- TypeScript
- MobX
- Material UI
- Vite

The engine must support:
- data-driven dialogues
- node-based world navigation
- queue-based party battles
- unit and player tags
- status effects
- morale, hunger, and reputation
- inventory as a modal window
- scalable content expansion
- adding new scenes without rewriting the core

The first stage explicitly excludes:
- save system
- advanced animation system
- full content editor
- advanced enemy AI
- drag-and-drop inventory
- tile engine
- multiplayer
- backend

## Core Engineering Principles

1. UI must not contain game business logic.
2. Content must be TypeScript data, not imperative scripts.
3. Rules must be centralized through formulas, registries, and systems.
4. All effects must go through an effect interpreter.
5. Screen transitions must go through stores/controllers, never directly from components.
6. Tag logic must not be scattered through ad hoc `if` chains.
7. New dialogue, enemy, or location should be added through content files, not engine rewrites.
8. Build one full vertical slice first, then expand.

## Target Structure

```text
src/
  app/
    bootstrap/
    providers/
    theme/

  engine/
    stores/
    systems/
    formulas/
    registries/
    validators/
    scripts/
    types/
    utils/

  content/
    dialogues/
    locations/
    npcs/
    battles/
    units/
    items/
    skills/

  ui/
    screens/
    components/
    modals/
    layouts/
    hooks/
```

## Layer Responsibilities

### `app/`

- app bootstrap
- providers
- theme
- initialization

### `engine/stores/`

- MobX runtime state
- no JSX

Required stores:
- `GameRootStore`
- `UIStore`
- `WorldStore`
- `DialogueStore`
- `BattleStore`
- `PartyStore`
- `InventoryStore`
- `MetaStore`
- `FlagsStore`

Stores must not contain:
- damage formulas
- tag rules
- status definitions
- skill definitions
- large content objects
- render logic

### `engine/systems/`

- rule execution
- controllers
- interpreters
- battle resolver
- world controller

### `engine/formulas/`

- pure calculations
- derived stats
- damage
- hit chance
- crit chance
- initiative order

### `engine/registries/`

- status definitions
- tag rules
- skills
- effect handlers
- script handlers

### `engine/validators/`

- dialogue validation
- location graph validation
- battle/item/script sanity checks

### `content/`

- pure TS content data only

### `ui/`

- React components
- MUI shell
- screens
- panels
- dialogs

## Fixed Technology Decisions

- state management: `mobx`, `mobx-react-lite`
- UI: `@mui/material`, `@mui/icons-material`
- language mode: strict TypeScript
- build tool: Vite
- tests: Vitest + React Testing Library
- styling: MUI theme + `sx`

The UI should not look like an admin panel.

## Baseline Domain Systems

### World Navigation

- node-based
- not tile-based in phase 1

### Battle

- queue-based turn system
- not real-time
- not ATB in phase 1

### Inventory

- modal/dialog presentation
- item list
- `use` / `inspect`
- no grid inventory in phase 1

### Content

- TypeScript objects
- no JSON in phase 1

### Events

- `GameEffect` + `EffectRunner`

### Advanced Scenario Logic

- script registry

## Dialogue Contract

Required entities:
- `DialogueData`
- `DialogueNode`
- `DialogueChoice`
- `Condition`
- `GameEffect`

Dialogue rules:
- dialogue has `startNodeId`
- node has either `choices` or `nextNodeId`
- node may have `onEnterEffects`
- choice may have `conditions`
- choice may have `effects`
- choice may have `nextNodeId`

Required node fields:
- `id`
- `speakerId`
- `text`

Optional node fields:
- `emotion`
- `portraitId`
- `backgroundId`
- `onEnterEffects`
- `choices`
- `nextNodeId`

Dialogue engine responsibilities:
- start dialogue
- move through nodes
- expose visible choices
- filter choices by conditions
- apply effects
- close dialogue without manual screen logic

Dialogue presentation target:
- dialogue text should be paged, not scrolled
- target density is up to `6` rendered lines per page in the main dialogue panel
- paragraph break is the preferred page break
- speaker line changes should render on a new visual line
- if authored text is longer than one page, runtime should split it automatically instead of requiring content rewrites

## Effect Contract

Initial effect types:
- `setFlag`
- `changeMeta`
- `addTag`
- `removeTag`
- `giveItem`
- `removeItem`
- `startBattle`
- `changeLocation`
- `openScreen`
- `openModal`
- `runScript`

Must exist:
- `GameEffect` type
- `EffectRunner`
- handler map / registry
- easy extension path for new effect types

Forbidden:
- effect logic directly in dialogue UI
- UI reactions mixed with domain logic

## Location Contract

Required entities:
- `LocationData`
- `LocationNode`
- `NodeInteraction`

Each node must include:
- `id`
- `label`
- `x`
- `y`
- `type`
- `connectedNodeIds`

Optional node features:
- `onEnterEffects`
- `interaction`

Initial interaction types:
- `dialogue`
- `battle`
- `none`

World controller responsibilities:
- load location
- track current node
- only allow movement through `connectedNodeIds`
- run `onEnterEffects`
- trigger node interaction

## Battle Contract

Required parts:
- `BattleTemplate`
- `BattleRuntime`
- `BattleResolver`
- `TurnQueueBuilder`
- `BattleAI`
- `CombatLogBuilder`

Initial flow:
- start battle
- build ally and enemy runtime units
- compute turn queue
- player turn
- enemy turn
- resolve action
- update HP and statuses
- death cleanup
- victory/defeat resolution

Initial actions:
- basic attack
- one skill use
- defend
- item use placeholder

Initial enemy AI:
- random valid skill
- random valid target

## Tags And Statuses

Tags are rule-bearing data, not simple labels.

Must exist:
- `tagRulesRegistry`
- helpers for tag modifier checks

Statuses are runtime objects, not string arrays.

Must exist:
- `statusDefinitionsRegistry`
- runtime status instances
- `StatusProcessor`

Initial statuses:
- `poison`
- `burn`
- `bleed`
- `stun`
- `charm`
- `fear`
- `shield`
- `regen`

Status system must support:
- immunities
- duration
- tick timing
- stack policy

## Validators

### `DialogueValidator`

Checks:
- all `nextNodeId` references exist
- all speaker IDs exist
- no broken references
- no unintended dead ends

### `LocationGraphValidator`

Checks:
- referenced nodes exist
- no broken connections
- a valid start point exists
- no unjustified isolated nodes

Also preferred:
- battle template ref checks
- item ref checks
- script ref checks

## Reporting Contract After Each Phase

After each phase, report:
- what was created
- the architectural choice made
- which files are key
- what risks remain
- what is ready to test

If a weak architectural point appears during implementation:
- fix it
- keep the overall principles intact
- briefly describe the change

## Priority File Order

Create foundational files first. Minimum preferred early set:

```text
src/
  app/
    bootstrap/AppProviders.tsx
    theme/theme.ts

  engine/
    stores/GameRootStore.ts
    stores/UIStore.ts
    stores/WorldStore.ts
    stores/DialogueStore.ts
    stores/BattleStore.ts
    stores/PartyStore.ts
    stores/InventoryStore.ts
    stores/MetaStore.ts
    stores/FlagsStore.ts

    systems/effects/EffectRunner.ts
    systems/dialogue/DialogueConditionEvaluator.ts
    systems/dialogue/DialogueValidator.ts
    systems/world/WorldController.ts
    systems/world/LocationGraphValidator.ts
    systems/battle/BattleResolver.ts
    systems/battle/BattleAI.ts
    systems/battle/TurnQueueBuilder.ts
    systems/battle/StatusProcessor.ts

    registries/tagRulesRegistry.ts
    registries/statusDefinitionsRegistry.ts

    types/dialogue.ts
    types/effects.ts
    types/conditions.ts
    types/world.ts
    types/battle.ts
    types/unit.ts
    types/item.ts
    types/status.ts
    types/tags.ts

  content/
    dialogues/introDialogue.ts
    locations/firstLocation.ts
    npcs/guardNpc.ts
    battles/guardBattle.ts
    units/mainHero.ts
    units/guardEnemy.ts
    items/basicPotion.ts

  ui/
    screens/MainMenuScreen.tsx
    screens/DialogueScreen.tsx
    screens/WorldScreen.tsx
    screens/BattleScreen.tsx
    modals/InventoryModal.tsx
    components/ScreenRenderer.tsx
    components/MetaHud.tsx
```

## Required Phase Report Format

After each phase, always include:
- what was done
- which files were created or changed
- which architectural choice was made
- what is already testable
- which risks or gaps remain
- what the next phase is

If architecture looks weak, explicitly state:
- what is weak
- how it should be corrected
- whether that correction breaks previous contracts

## Hard Bans

Never:
- write battle logic inside React components
- place content templates inside stores
- place execution code inside content files
- scatter tag rules across random helpers
- prioritize cosmetics over the runtime core
- collapse everything into one giant file
- mix runtime state with static templates

Коли щось стосується змін персонажів чи сюжету заходь в Папку Documentation і
перероблюй там все згідно логіки обсідіан, створюй файли під нових персонажів
нові механіки і так далі.

Documentation - це джерело істини проекту. Коли як даю завдання і ти його виконав змінив щось що не так в документації.
то документацію також міняєш. 1000%
