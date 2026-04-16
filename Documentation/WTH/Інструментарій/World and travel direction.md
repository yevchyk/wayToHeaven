# World and travel direction

## Core conclusion

`World / Travel` should not become a separate map game that fights the narrative.

For this project, the best direction is:
- most movement feels like scene-level choice
- open zones are entered through authored transitions
- local navigation happens through hub-style actions
- route mode is used only when the trip itself matters

In short:
- `go there`
- `go there`
- `stay here`
- `speak first`
- `leave now`

This is closer to the real fantasy of the game than a permanently visible strategy map.

## What should the player feel

The player should feel:
- that space is real
- that movement has consequence
- that each place has pressure and tone
- that travel is sometimes routine, sometimes dangerous, sometimes intimate

The player should not feel:
- that they opened an admin graph
- that every movement is a technical node click
- that route mode interrupts the story for no reason

## Recommended layer model

Use three different layers instead of one universal world screen.

### 1. Scene transition layer

This is the default layer.

Use it when the player is inside a dramatic sequence or local moment and simply chooses where the next beat goes.

Examples:
- go to the market
- return to the room
- follow Yarva
- leave the shrine
- check the riverbank

Presentation:
- dialogue-like choice cards
- location labels
- short mood-rich subtitles
- maybe one travel-flavored icon or tag

This should feel like authored movement, not tactical routing.

### 2. Hub layer

This is the “open zone” layer.

Use it for:
- city districts
- mansion sectors
- caravan camp routines
- prison block or temple compound

The player is not choosing abstract coordinates.
The player is choosing meaningful local destinations.

Good hub actions:
- market lane
- shrine court
- kitchen stairs
- guard post
- caravan fires
- river edge

Presentation:
- strong location panel
- 3-7 visible actions at once
- each action has tone and consequence flavor
- optional preview portrait/background on hover

This should be the main form of “open area” navigation.

### 3. Route / travel layer

This should be rarer and more intentional.

Use it only when the path itself is content.

Good use cases:
- road between settlements
- escort route
- smuggling corridor
- flooded underpass
- dangerous night passage
- wilderness search

Route mode is right when:
- supplies matter
- risk matters
- encounters matter
- secrecy matters
- the player should feel distance

Route mode is wrong when the player just wants to go from room A to room B.

## The real rule

Not every movement should open `world`.
Not every movement should open `route`.

Default rule:
- inside a scene: use dialogue/scene transitions
- inside a local zone: use hub
- between meaningful zones: use route
- only for special macro movement: use world

## What world screen should become

The current `WorldScreen` should not be the default navigation mode for ordinary play.

It is better as one of these:
- a rare macro-view
- an overview of discovered regions
- a chapter-level route atlas
- a planning layer for later progression

It should not be the primary way the player clicks through daily content.

So the practical recommendation is:
- demote `world` from “main movement interface”
- promote `scene transitions + hub scenes + route moments`

## Target flow

The intended rhythm should look like this:

1. Narrative scene
2. Choice to move or stay
3. Local hub
4. Dialogue / event / battle / codex / quest consequence
5. If leaving the zone matters, enter route mode
6. Arrive in next hub or next scene

That means the game breathes like:
- scene
- zone
- scene
- route
- scene
- zone

Not:
- graph
- graph
- graph
- graph

## Open-zone design recommendation

Your idea of “open zones through dialogue-like transitions” is the right default.

For this project, an open zone should behave like:
- a framed local situation
- a list of meaningful places or actions
- each option already loaded with tone

Example:

`Temple Exit Plaza`
- go to market lane
- speak to the gate guard
- inspect shrine court
- leave the city through the north gate

That already gives openness without making the player manage an abstract map.

## When to show a map at all

Show a visible map only when one of these is true:
- orientation itself matters
- route branching matters
- scouting matters
- hidden nodes matter
- supply loss or encounter chance matters

If none of those are true, use the scene/hub layer instead.

## Visual direction

### Scene transition layer

Should look close to dialogue choices:
- rich cards
- location title
- one-line danger or mood descriptor
- maybe a small icon

### Hub layer

Should look like a living place:
- location art or strong backdrop
- action rows
- one focused “where am I” block
- one quieter “where can I go” strip

### Route layer

Should feel like travel:
- fewer abstract chips
- stronger path mood
- risk / scout / route events
- log and state secondary, not dominant

## What to avoid

Do not make:
- every city district a separate graph screen
- every door a world node
- every movement a route board
- every location choice a tiny technical pill

Do not let the player feel that movement is UI plumbing.

## Recommended content authoring rule

When authoring movement, ask:

1. Is the destination just the next dramatic beat?
Use `scene transition`.

2. Is the player choosing among several local activities in one area?
Use `hub`.

3. Is the trip itself dangerous, uncertain, or resource-bearing?
Use `route`.

4. Is this only broad chapter geography?
Use `world`.

## Practical verdict

Yes, we should pivot toward:
- open zones through dialogue-like transitions
- city and local spaces through hub scenes
- route mode only for meaningful journeys

That is the strongest match for:
- the current scene engine
- the current UI direction
- the narrative-first identity of the project

## Next phase

Before changing code broadly, define 3 concrete examples:
- one `hub` zone
- one `route` journey
- one scene-to-scene movement pattern

Then align `WorldScreen`, `CitySceneScreen`, and `TravelBoardScreen` around those examples instead of evolving all three blindly.

Companion direction:
- [Time, hubs and travel economy](./Time,%20hubs%20and%20travel%20economy.md)

That document defines:
- how local hub actions should spend time
- how inter-city travel should consume segments or days
- how travel events should connect to hunger, safety, and morale
