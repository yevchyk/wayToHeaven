# Battle UI redesign pass

This document is the current source of truth for the tactical shell after the April 2026 battle UI redesign pass.

## Goal

Move battle presentation away from a dashboard layout and toward a readable tactical scene.

The battle screen should feel like:

- pressure
- target focus
- command timing
- hostile presence

It should not feel like:

- an admin panel
- a debug table
- three equal columns of utility cards

## Composition

The tactical screen now follows this structure:

1. `status header`
   - battle title
   - current pressure summary
   - round / phase / active unit
2. `turn ribbon`
   - short forward-looking queue
   - visible but secondary
3. `left ally rail`
   - compact ally cards
   - blood / will bars
   - a few critical measures only
4. `center command dais`
   - primary battle commands
   - battle item strip
   - current action focus
   - recent combat echoes
5. `right enemy rail`
   - enemy presence
   - stronger hostile accent than ally rail

## Rules

- The center of the screen belongs to command intent, not to explanation text.
- Turn queue is important, but it should read like a ribbon, not a panel.
- Combat log is useful, but it should whisper, not dominate.
- Stats should be reduced to a few meaningful measures.
- `Chip` should not be the primary visual language of battle.
- Allies and enemies should not look identical in mood.
- The tactical shell must use the same corruption-driven skin system as the rest of the game.

## What changed in code

The battle screen now:

- uses `ScreenFrame` in `tactical` mode
- uses `StatusStrip` for high-level pressure summary
- uses corruption skins via `resolveCorruptionSkin`
- uses custom battle cards and command surfaces instead of generic `SectionCard + Chip` composition
- keeps targeting on the side rails while moving command focus into the center
- keeps `Open Character Menu` and `Leave Battlefield` as explicit system exits
- renders dedicated battle portraits inside ally and enemy rails instead of text-only tactical cards
- supports animated `fire`, `holy`, and `violet` aura overlays through 3-frame transparent PNG loops
- exposes a `battle-visual-lab` demo encounter that can be launched from the main menu
- includes an `FX Lab` panel inside the demo encounter for forcing aura previews on the active unit or target
- includes a compact `Battle Stage` preview in the command center with:
  - ally / enemy lead portraits
  - projectile preview beats for the selected action
  - impact flashes driven by the latest combat log entry

## Remaining gaps

- battle still has no dedicated art or framed character stage, only tactical shells
- skill selection is still shallow and prefers one prepared skill
- status presentation is cleaner than before, but can still evolve into iconography later
- reward summary is still a separate follow-up surface rather than part of a full battle-to-loot cinematic flow
- battle portraits are still placeholder-grade assets for now and should be replaced with authored combat busts
- aura overlays currently preview around portraits; they do not yet have matching full-scene impact flashes or projectile FX
- stage preview currently reacts to combat log messages and selected actions, but it is still presentation-only and not yet synchronized with a deeper cinematic camera or hit-stop system

## Verification

After this pass, verify:

- the battle screen remains readable on desktop and mobile
- the command center stays the dominant focus
- ally and enemy rails still allow clear target selection
- `Open Character Menu` remains discoverable
- `Leave Battlefield` still appears on victory / defeat
