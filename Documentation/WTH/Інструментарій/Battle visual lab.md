# Battle visual lab

This document is the source of truth for the menu-driven battle FX sandbox introduced in April 2026.

## Purpose

The `battle-visual-lab` encounter exists to check battle presentation without depending on story pacing.

Use it to verify:

- ally and enemy battle portraits
- aura overlays
- command readability
- target selection visibility
- item and spell FX preview

## Entry point

The lab is launched from the main menu through:

- `Демо: битва FX`

Runtime entry:

- `GameRootStore.startBattleVisualDemo()`

## Sandbox loadout

The visual lab starts with:

- one ally: `main-hero`
- two enemies: `wolf-enemy`, `wolf-enemy`
- inventory:
  - `basic-potion x2`
  - `holy-water x3`
  - `pitch-bomb x3`
  - `stimulant-tincture x3`

This loadout deliberately covers:

- healing
- holy cleanse
- fire damage
- mana restoration

## Aura rules

Current preview aura kinds:

- `fire`
- `holy`
- `violet`

Aura sources right now:

- selected fire skills and fire items preview `fire`
- selected healing / cleanse tools preview `holy`
- selected mana-restoring tools preview `violet`
- some active statuses also map to aura tones:
  - `burn -> fire`
  - `shield` / `regen -> holy`
  - `fear` / `charm -> violet`

## UI behavior

Inside the battle lab, the command center exposes an `FX Lab` panel.

It can:

- force an aura on the active combatant
- force an aura on the current target
- clear manual previews

This panel is debug-oriented and should stay scoped to the visual lab encounter.

The command center also includes a compact `Battle Stage` preview.

Its current responsibilities:

- keep one ally lead portrait and one enemy lead portrait visible
- preview projectile intent for the selected action
- flash impact / heal / status beats based on the latest combat log entry

This is intentionally not a full cinematic battle renderer yet.

## Asset policy

Current battle visuals use placeholder assets:

- shared portrait placeholders for human combatants
- generated wolf sigil placeholder for wolf enemies
- generated transparent PNG aura loops for `fire`, `holy`, and `violet`

These are approved only as staging assets.

## Next improvements

- replace placeholder battle portraits with authored combat busts
- add scene-wide impact flashes / strike overlays
- add more battle-specific stance variants such as `guarding`, `wounded`, and `down`
- move from portrait-only aura preview toward full action FX layering
