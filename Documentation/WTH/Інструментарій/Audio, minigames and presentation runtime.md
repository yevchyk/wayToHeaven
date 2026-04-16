# Audio, minigames and presentation runtime

## Purpose

This document covers the lighter but still important runtime support systems:
- audio
- minigames
- presentation support around scene and battle layers

These are not the central story engine, but they strongly shape session feel.

## Audio runtime

Canonical store:
- [AudioStore.ts](/D:/projects/wayToHeaven/src/engine/stores/AudioStore.ts)

Resolver:
- [audioAssetResolver.ts](/D:/projects/wayToHeaven/src/engine/systems/audio/audioAssetResolver.ts)

Current audio responsibilities:
- music playback
- music switching
- fade-out on stop or switch
- SFX playback
- scene-flow music sync
- preference-controlled volumes

### Audio flow

Scene runtime drives presentation state.
AudioStore reads that state and applies:
- play
- switch
- stop
- fade

This means music is not supposed to be controlled directly from random UI widgets.
It is part of scene orchestration.

### Current strengths

- good enough for VN and scene-driven runtime
- integrated with preferences
- supports music and SFX as authored assets

### Current weaknesses

- no deep ambience layering
- no advanced ducking
- no richer adaptive score state machine yet

## Minigame runtime

Canonical store:
- [MiniGameStore.ts](/D:/projects/wayToHeaven/src/engine/stores/MiniGameStore.ts)

Canonical controller:
- [MiniGameController.ts](/D:/projects/wayToHeaven/src/engine/systems/minigame/MiniGameController.ts)

Current minigame screen:
- [MiniGameScreen.tsx](/D:/projects/wayToHeaven/src/ui/screens/MiniGameScreen.tsx)

Current supported kinds:
- `fishing`
- `dance`

### Runtime responsibilities

The minigame system supports:
- session start
- ticking over time
- per-kind runtime state
- skill progression
- success / failure effects
- return-to-previous-screen behavior

This is a real runtime slice, not just a stub.

### Integration path

Minigames are entered through:
- `startMinigame` effect
- main runtime screen switch to `minigame`
- resolution effects back into the main state

That means minigames are still inside the shared engine lifecycle.

## Presentation support layers

There are several presentation helpers that are not new gameplay systems but are still part of the engine toolkit.

Important files:
- [SceneFlowPresentationShell.tsx](/D:/projects/wayToHeaven/src/ui/components/scene-flow/SceneFlowPresentationShell.tsx)
- [narrativeBackdrop.tsx](/D:/projects/wayToHeaven/src/ui/components/narrative/narrativeBackdrop.tsx)
- [narrativeBackdropEffects.tsx](/D:/projects/wayToHeaven/src/ui/components/narrative/narrativeBackdropEffects.tsx)
- [battleVisuals.tsx](/D:/projects/wayToHeaven/src/ui/components/battle/battleVisuals.tsx)
- [BattleStagePreview.tsx](/D:/projects/wayToHeaven/src/ui/components/battle/BattleStagePreview.tsx)

These support:
- scene backgrounds
- visual atmosphere
- aura overlays
- battle FX previews
- screen layering

## Why this matters

The project does not rely on a complex animation engine yet.

So the current presentation strategy is:
- strong authored assets
- strong stage composition
- layered shell rendering
- selective animated overlays

This is a reasonable phase-1 architecture.

## Current state

Audio:
- functionally solid
- still shallow artistically

Minigames:
- real runtime slices
- still not one of the biggest content pillars yet

Presentation helpers:
- already strong enough to support dialogue, route, and battle mood
- still need richer content assets and final polish

## Recommended interpretation

These systems are best seen as:
- `audio` = atmosphere runtime
- `minigames` = modular side-system runtime
- `presentation helpers` = support layer for the main scene engine

They should stay integrated with the shared root runtime, not drift into isolated mini-apps.
