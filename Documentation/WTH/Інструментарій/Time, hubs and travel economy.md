# Time, hubs and travel economy

## Core synthesis

`World / Travel` for this project should be built around **meaningful movement with time cost**.

The player should usually move through:
- scene choices
- local hub actions
- deliberate route journeys

Not through a permanently open map.

The missing glue between these layers is **time**.

The practical rule is:
- local hub actions spend hours
- dangerous or meaningful local repositioning spends a larger chunk
- travel between cities spends one or more days
- time pressure feeds survival and consequence systems

This gives movement weight without turning the game into a logistics simulator.

## Desired player feeling

The player should feel:
- that the day is finite
- that lingering has a price
- that roads create tension
- that choosing where to spend time matters as much as choosing where to go

The player should not feel:
- that they are micromanaging a spreadsheet calendar
- that every room transition drains resources
- that route mode appears for no reason

## Recommended time model

Use a **segment-based day**, not minute simulation.

Recommended default:
- `dawn`
- `day`
- `evening`
- `night`

This gives 4 clear narrative chunks per day.

Internally we can still store hours later, but authored gameplay should think in chunks first.

Why this model fits:
- easy to communicate in UI
- easy to author in scene conditions
- easy to connect to hunger, safety, and event cadence
- easy to tune without rewriting content

## Movement layers and time cost

### 1. Scene transition

Use when the player is just choosing the next dramatic beat inside an active scene or tightly authored sequence.

Examples:
- follow her upstairs
- step into the shrine
- go to the gate

Default time cost:
- `0`
- or at most a tiny implicit transition cost that is not shown

Rule:
Scene transitions are for drama, not for economy.

### 2. Hub actions

Use for local open zones:
- city district
- manor grounds
- caravan camp
- prison block
- temple compound

Every meaningful hub action should carry a visible time cost.

Recommended local costs:
- quick local movement: `0-1 hour`
- short talk / inspect / buy / ask around: `1 hour`
- deeper visit / social scene / side activity: `2 hours`
- risky or extended local action: `3-4 hours`
- full local rest / recovery block: `evening` or `night`

In practice, most authored hub actions should round into:
- `brief`
- `half watch`
- `full watch`

This is more atmospheric than raw clock math.

## Recommended hub presentation

Each hub option should show:
- destination or action
- one-line mood or purpose
- time cost
- optional risk or availability tag

Example:

`Temple Exit Plaza`
- go to market lane — `1h`
- speak to the gate guard — `1h`
- inspect shrine court — `2h`
- leave through the north gate — `begin journey`

The player should understand:
- what they are doing
- how much day they spend
- whether they are committing to a route

## 3. Route travel

Use route mode only when the path itself matters.

Examples:
- road between settlements
- escort run
- smuggling corridor
- forest pass
- floodplain crossing

Route travel should consume **segments or days**, not tiny local costs.

Recommended route costs:
- short route: `1 segment`
- medium route: `2 segments`
- long route: `1 day`
- major inter-city route: `1-3 days`

The route itself should be split into legs if content needs room to breathe.

Example:

`Caravan road to Hugen-Um`
- total duration: `2 days`
- route legs: `departure -> roadside camp -> stone ford -> outer fields -> city gate`

Each leg may trigger:
- no event
- authored scene
- battle
- resource tax
- NPC interaction
- intimacy beat
- quest consequence

## Event cadence recommendation

Do not fire an event on every step.

Use this rhythm:
- some travel legs are quiet
- some have light color
- some have pressure
- some branch

Recommended defaults:
- local hub move: usually `0` route events
- short route: `0-1` event
- medium route: `1-2` events
- long route: `2-4` events depending on danger

This keeps travel from feeling empty or exhausting.

## Survival and consequence integration

Time should not exist alone.
It should feed already established meta systems.

Current natural hooks:
- `hunger`
- `safety`
- `morale`
- `reputation`
- quest stages
- relationship conditions

Recommended first-pass rules:
- spending time increases `hunger`
- dangerous or exposed travel can lower `safety`
- poor camp, bad outcomes, or humiliation can lower `morale`
- visible public actions or scandal events can change `reputation`

This means:
- the player does not just move
- the player pays in state pressure

## The real gameplay loop

The intended rhythm should become:

1. Narrative scene
2. Local hub opens
3. Player spends time on chosen action
4. Meta state updates
5. New local opportunities appear or close
6. If leaving matters, route mode begins
7. Route consumes segments/days and may trigger events
8. Arrival opens the next hub or next scene

This creates a strong loop:
- scene
- decision
- time spend
- pressure
- consequence
- travel when justified

## What to avoid

Do not make:
- every doorway cost visible time
- every movement a route board
- every city interaction equal in duration
- every travel leg trigger an event
- time so granular that it becomes accounting

Also do not let time become decorative only.
If we show it, it must matter.

## Recommended engine direction

Do not start with a full simulation calendar.

Build a lean runtime:
- current day number
- current segment
- helper to advance time by hours or by segment
- authored costs on hub and route actions
- event hooks on segment/day advance

Recommended future runtime pieces:
- `TimeStore`
- `advanceTime(effect or controller action)`
- optional `time conditions` for content

But this should remain a support system, not the main game.

## Current runtime status

Implemented in engine:
- `TimeStore` as the canonical runtime clock
- save/load support for day and hour
- automatic mirroring into legacy flags:
  - `story.day`
  - `story.timeSegment`
- `advanceTime` as a real `GameEffect`
- `timeCost` on hub actions
- `stepTimeCost` on route rules
- visible time labels in hub and route UI

Current default consequence:
- advancing visible time increases `hunger`

This is intentionally conservative.
It gives weight to movement now without forcing full survival balancing before content is ready.

## Recommended authoring rule

When adding movement content, ask:

1. Is this just the next dramatic beat?
Use `scene transition`, usually no explicit time cost.

2. Is this a meaningful local activity?
Use `hub action` with visible time cost.

3. Is the journey itself content?
Use `route` with segment/day cost and event slots.

4. Is this only broad regional orientation?
Use `world` as overview, not as default play surface.

## Practical verdict

The best synthesis for this project is:
- hubs are the main local navigation layer
- hub options spend time
- route travel between important places spends segments or days
- route travel may spawn several events
- world remains a rare overview layer

That gives us:
- narrative-first movement
- real pressure
- meaningful geography
- room for survival, quest, and adult/intimate content to breathe during travel

## Next phase

Before engine implementation, define:
- one local hub with time-costed actions
- one inter-city route with 2-3 legs
- one small set of time consequences tied to `hunger`, `safety`, and `morale`

Then build the runtime around those examples instead of around an abstract map.
