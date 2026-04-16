# Battle rewards and progression runtime

This document is the current source of truth for the combat slice added in the April 2026 progression pass.

It covers the implemented runtime, not the earlier proposal-only state.

## 1. Implemented reference encounter

The engine now supports the full reference loop:

1. `main-hero` opens a fight against `2 wolves`
2. initiative gives the heroine the first turn
3. the player can target a single wolf with a basic attack
4. wolves can choose `wolf-rend`, hit a random valid target and apply `bleed` by chance
5. `bleed` now ticks at `turnStart`
6. the heroine can use `holy-water` in battle to heal and cleanse a negative status
7. the heroine can throw `pitch-bomb` at one enemy for direct fire damage
8. the heroine can cast `cinder-storm`, which targets `all-enemies`
9. victory can open a reward summary with loot, XP and level-up choices

## 2. Skill contract

`SkillData` now authors battle-facing combat behavior through:

- `targetPattern`
- `damageKind`
- `scalingStat`
- `basePower`
- `manaCost`
- `statusApplications`

Implemented examples:

- `basic-attack` -> `single-enemy`
- `firebolt` -> `single-enemy`
- `wolf-rend` -> `single-enemy` + chance to apply `bleed`
- `cinder-storm` -> `all-enemies`

Skill ranks are now persistent on the runtime unit.

Each rank adds directly to the skill `basePower`.

## 3. Status and cleanse contract

`bleed` has been moved to `turnStart`.

This is intentional: the unit starts its turn already under wound pressure.

The engine now supports:

- `removeStatus`
- `cleanseStatuses`

These effects work through the shared effect runner and can hit either:

- party runtime
- active battle runtime

Current combat items built on top of this:

- `holy-water` -> heal + cleanse one negative status
- `rough-bandage` -> heal + remove `bleed`
- `pitch-bomb` -> enemy-targeted fire damage
- `stimulant-tincture` -> mana restore

Battle UI now exposes the full list of battle-usable consumables instead of only a single preferred item.

## 4. Loot tables

Loot is no longer only hardcoded through enemy `rewardItemIds`.

The repo now has authored loot tables in:

- `src/content/lootTables/`

Current live table:

- `wolf-pack-roadside`

This table currently feeds:

- `wolf-thyme`
- `blood-moss`
- `ash-reed`
- `salt-thorn`
- `rough-bandage`
- `pitch-bomb`
- `holy-water`
- `field-ration`
- `stimulant-tincture`

The guaranteed drop for the wolf encounter is `wolf-thyme`.

## 5. Post-battle progression

Post-battle progression now lives in `ProgressionStore`.

The current flow is:

1. battle resolves victory
2. battle rewards are collected from enemy rewards + loot tables
3. XP is granted to the allied units in that encounter
4. if a unit crosses the threshold, a pending level-up choice is created
5. UI opens the `battle-rewards` modal if the battle template opts into reward summary

Current threshold formula:

- level 1 -> 10 XP
- each next level adds +5 XP requirement

Current level-up options:

- train any known skill by `+2 ranks`
- `+5 Max HP`
- `+5 Max Mana`

## 6. Live content added in this pass

New content introduced by this pass:

- battle: `wolf-pack-battle`
- enemy: `wolf-enemy`
- skills: `wolf-rend`, `cinder-storm`
- consumables: `holy-water`, `rough-bandage`, `pitch-bomb`, `field-ration`, `stimulant-tincture`
- materials: `blood-moss`, `wolf-thyme`, `ash-reed`, `grave-bloom`, `salt-thorn`

## 7. Verification

Verified after implementation:

- `corepack pnpm exec tsc -b`
- `vitest` under `Node 22.12.0`
- `vite build` under `Node 22.12.0`

At the time of writing the full suite is green:

- `46/46` test files
- `219/219` tests
