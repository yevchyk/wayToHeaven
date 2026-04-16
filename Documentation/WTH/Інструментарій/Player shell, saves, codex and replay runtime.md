# Player shell, saves, codex and replay runtime

## Purpose

This document covers the systems around the core gameplay loop that make the runtime feel like a usable game session:
- preferences
- save / load
- backlog
- codex / library
- seen-content discovery
- replay launching

These are not optional accessories.
They are the player shell around the engine.

## Preferences

Canonical store:
- [PreferencesStore.ts](/D:/projects/wayToHeaven/src/engine/stores/PreferencesStore.ts)

Stored preferences:
- music volume
- SFX volume
- text speed
- auto delay
- skip unread
- font scale
- hide UI

These are persisted locally through browser storage and immediately affect runtime systems like:
- audio playback
- dialogue reveal timing
- auto mode
- UI visibility

## Save / load runtime

Canonical store:
- [SaveStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SaveStore.ts)

Persistence layer:
- [savePersistence.ts](/D:/projects/wayToHeaven/src/engine/systems/save/savePersistence.ts)
- [save.ts](/D:/projects/wayToHeaven/src/engine/types/save.ts)

Current slot model:
- quick save
- rotating autosaves
- manual slots

Saved runtime includes:
- UI state
- world state
- meta state
- time
- profile
- relationships
- flags
- inventory
- party
- appearance
- scene flow
- dialogue playback state
- battle runtime
- minigame runtime
- backlog
- seen-content discovery
- progression
- quest states

### Important rule

The save system serializes runtime stores.
It does **not** serialize static content registries.

That is the correct architecture:
- content stays in TypeScript content files
- save files only capture current runtime state

## Save UI

Main modal:
- [SavesModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/SavesModal.tsx)

Current UX supports:
- manual save
- load
- delete
- quick save / quick load guidance
- slot summaries with active layer and current flow context

Current weakness:
- functional but still utilitarian presentation
- no strong thumbnail / emotional preview card layer yet

## Seen-content discovery

Canonical store:
- [SeenContentStore.ts](/D:/projects/wayToHeaven/src/engine/stores/SeenContentStore.ts)

Tracks:
- seen flow IDs
- seen node keys
- discovered character entries
- discovered location entries
- discovered replay scene entries

This is what lets the codex and replay system behave like a real archive instead of a static menu.

## Backlog

Canonical store:
- [BacklogStore.ts](/D:/projects/wayToHeaven/src/engine/stores/BacklogStore.ts)

UI:
- [BacklogModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/BacklogModal.tsx)

Backlog captures:
- spoken lines
- narrative lines
- selected choices

It is built from runtime flow events and dialogue playback, not from a separate authored script.

This is important because backlog stays aligned with:
- paging
- choice flow
- replay / preview context
- actual runtime visited nodes

## Codex / library

Primary UI:
- [LibraryModal.tsx](/D:/projects/wayToHeaven/src/ui/modals/LibraryModal.tsx)

Entry builders:
- [buildLibraryEntries.ts](/D:/projects/wayToHeaven/src/engine/systems/library/buildLibraryEntries.ts)
- [libraryDiscovery.ts](/D:/projects/wayToHeaven/src/engine/systems/library/libraryDiscovery.ts)

Current library tabs:
- characters
- locations
- replay scenes

The codex is fed from runtime discovery, not from a static “all entries unlocked” table.

That means:
- characters appear after discovery
- locations appear after actual arrival or scene entry
- replay scenes appear only when unlocked

## Replay launch flow

Replay is entered through:
- library action entries
- `GameRootStore.startScenePreview()`

Preview runtime path:
1. snapshot current runtime
2. reset runtime
3. restore safe preview baseline
4. start preview scene flow
5. exit preview
6. restore original runtime

Key file:
- [GameRootStore.ts](/D:/projects/wayToHeaven/src/engine/stores/GameRootStore.ts)

This is a strong architectural choice because replay does not contaminate the live run.

## Relationship to intimate scenes

The player shell is what makes intimate content manageable as a real system.

Why:
- replay scenes can archive intimate scenes safely
- seen-content can gate erotic/intimate entries
- preferences and save/load keep those scenes inside normal runtime rules

There is still no separate adult shell.
It all lives inside the same archive and replay infrastructure.

## Current state

What is already strong:
- real persistence
- real discovered-content archive
- replay preview runtime
- backlog support
- preferences tied into runtime behavior

What is still weaker:
- codex luxury pass
- better save slot previews
- richer archive theming and browsing comfort

The engine contract, however, is already solid.
