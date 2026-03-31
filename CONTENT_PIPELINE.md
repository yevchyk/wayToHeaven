# WeyToHeaven Content Pipeline

This file is the working contract for adding new narrative content and assets to the current repo.

The rule is simple:
- runtime logic lives in `src/engine`
- static authored content lives in `src/content`
- visual and audio assets must follow the Chapter 1 naming and path conventions already used by the validators

## Core Rule

When adding content, do not improvise new storage shapes.

Use:
- TypeScript data for content
- chapter-scoped ids
- one registry touchpoint per content family
- validator-friendly references

If you add a new scene, character, background, portrait, music cue, travel board, battle, or item, it should be discoverable through the existing registries without rewriting the runtime.

## Chapter Folder Layout

Current Chapter 1 layout should be treated as the template:

```text
src/content/chapters/chapter-1/
  assets.ts
  chapterMeta.ts
  npcs/
  scenes/
  city/
  travel/
  images/
    backgrounds/
    portraits/
    cg/
    overlays/
    maps/
  music/
  sfx/
```

If Chapter 2 is added later, mirror this shape under `src/content/chapters/chapter-2/`.

## Id Contract

Prefer namespaced ids for all new content.

Good patterns:
- `chapter-1/scene/intro`
- `chapter-1/dialogues/prologue-001`
- `chapter-1/city/temple-exit`
- `chapter-1/travel/underground-route`
- `chapter-1/backgrounds/mansion-dining-hall`
- `chapter-1/portraits/mirella/neutral`
- `chapter-1/cg/awakening-flash`
- `chapter-1/overlays/dream-veil`
- `chapter-1/maps/pilgrim-road`
- `chapter-1/music/under-stone`
- `chapter-1/sfx/chain-rattle`

The current validators still allow legacy short ids like `theme_estate` and `alarm`, but new content should not continue that pattern unless there is a strong reason.

## File Naming

Use `lower-kebab-case` for filenames:
- `mansion-dining-hall.webp`
- `under-stone.ogg`
- `gate-guard.npc.ts`
- `underground-route.board.ts`
- `temple-exit.scene.ts`

Use descriptive ids instead of generic ids like `bg-01` or `track-a`.

## Registries You Must Touch

When adding content, wire it into the matching registry:

- chapter metadata: `src/content/registries/chapterRegistry.ts`
- scene metadata: `src/content/registries/sceneRegistry.ts`
- dialogues: `src/content/registries/dialogueRegistry.ts`
- city scenes: `src/content/registries/citySceneRegistry.ts`
- travel boards: `src/content/registries/travelBoardRegistry.ts`
- narrative characters: `src/content/registries/npcRegistry.ts`
- assets: `src/content/registries/assetRegistry.ts`
- items: `src/content/items/index.ts`
- battles: `src/content/battles/index.ts`
- units: `src/content/units/index.ts`
- locations: `src/content/locations/index.ts`
- scripts: `src/engine/scripts/registerNarrativeScripts.ts`

## Character Contract

Narrative character definitions live in:
- `src/content/chapters/chapter-1/npcs/*.npc.ts`

Each character should have:
- `id`
- `chapterId`
- `displayName`
- `defaultEmotion`
- `defaultPortraitId`
- `defaultSide`
- `portraitRefs`

Optional but recommended:
- `description`
- `role`
- `defaultOutfitId`
- `outfits`

Emotion keys must come from `CHARACTER_EMOTIONS` in `src/engine/types/dialogue.ts`.

Example:

```ts
export const gateGuardNpc: NarrativeCharacterData = {
  id: 'gate-guard',
  chapterId: 'chapter-1',
  displayName: 'Gate Guard',
  defaultEmotion: 'stern',
  defaultPortraitId: 'chapter-1/portraits/gate-guard/stern',
  defaultSide: 'right',
  portraitRefs: {
    stern: 'chapter-1/portraits/gate-guard/stern',
    warm: 'chapter-1/portraits/gate-guard/warm',
    angry: 'chapter-1/portraits/gate-guard/angry',
  },
};
```

## Outfit Contract

Outfits are narrative presentation states, not gameplay equipment.

They live inside `NarrativeCharacterData.outfits` and are switched by:
- `setCharacterOutfit`

Current implementation already supports:
- `dress-pristine`
- `dress-torn`
- `dress-ripped`

Outfit definitions should live near the owning character, for example:
- `src/content/chapters/chapter-1/npcs/mirellaOutfits.ts`

Use them for:
- damaged clothing states
- prison states
- formal vs travel states
- corruption-stage presentation changes

If you have real portrait art per outfit, put portrait refs inside the outfit definition.
If you do not have final art yet, the current dialogue portrait placeholders can still react to `placeholderPreset`.

## Background Contract

Store files in:
- `src/content/chapters/chapter-1/images/backgrounds/<slug>.webp`

Use ids like:
- `chapter-1/backgrounds/mansion-dining-hall`

Backgrounds are referenced by:
- `DialogueMeta.defaultBackgroundId`
- `DialogueNode.backgroundId`
- `StageState.backgroundId`
- `CitySceneData.backgroundId`

Approximate current prologue background checklist:
- `mansion-dining-hall`
- `mirella-room-morning`
- `flying-limo`
- `mining-arrival`
- `punishment-platform`
- `private-gallery`
- `sera-room-evening`
- `armory-evening`
- `mirella-room-night`
- `balcony-night-city`
- `hangar-dawn`
- `mansion-corridor-empty`
- `mansion-attack-corridor`
- `cage-descent`
- `holding-point-before-bridge`
- `chain-bridge-black-river`
- `abyss-fall`
- `ancient-temple-black-river`

Each background should answer:
- where are we
- what time is it
- what is the emotional temperature
- is this safe, social, sacred, industrial, or horror space

## Portrait Contract

Store files in:
- `src/content/chapters/chapter-1/images/portraits/<character-id>/<emotion>.webp`

Use ids like:
- `chapter-1/portraits/mirella/neutral`
- `chapter-1/portraits/sir-raust/grim`

Portrait naming should be by emotional read, not by line number.

Good portrait filenames:
- `neutral.webp`
- `soft.webp`
- `cruel.webp`
- `hollow.webp`
- `humiliated.webp`

Bad portrait filenames:
- `portrait-01.webp`
- `final_v3.webp`
- `mirella-new.webp`

For Chapter 1, the current supporting cast already implies these portrait sets:
- Mirella: `neutral`, `thinking`, `serious`, `polite`, `curious`, `shocked`, `defiant`, `soft`, `smug`, `embarrassed`, `trembling`, `broken`, `hollow`, `falling`, `afraid`, `cold`, `hurt`, `humiliated`
- Lady Sera: `soft`, `tired`, `resigned`, `fragile`, `sad`, `afraid`
- Lord Guy: `composed`, `cold`, `commanding`, `cruel`, `amused`
- Kael: `playful`, `cocky`, `nervous`
- Sir Raust: `stern`, `grim`, `soft`, `disappointed`, `calm`, `protective`, `battle_ready`
- Servant Lyna: `soft`, `nervous`, `embarrassed`, `serious`
- Marna Voss: `professional`, `cold`, `sharp`, `mocking`, `superior`
- Ner-Azet: `whisper`, `hunger`, `invasion`

## Character Composite Contract

Use composite character assets when a scene should be built from layers instead of one flat portrait.

Store files in:
- `src/content/chapters/chapter-1/images/characters/<character-id>/body/base.webp`
- `src/content/chapters/chapter-1/images/characters/<character-id>/clothes/base.webp`
- `src/content/chapters/chapter-1/images/characters/<character-id>/head/<emotion>.webp`

Optional layers for characters that need them:
- `hair/base.webp`
- `hands/left.webp`
- `hands/right.webp`
- `weapon/base.webp`

Important runtime rule:
- `head/<emotion>.webp` is only the head/expression layer
- changing `head/soft.webp` to `head/tired.webp` should not require redrawing `body/base.webp`
- `body` and `clothes` are expected to stay stable while the emotional read changes through `head/<emotion>`

Current Chapter 1 composite stage contract:
- stage size: `1000x1400`
- NPC baseline stack: `body + clothes + head`
- heroine baseline stack: `body + clothes + head + hair + hands + weapon`

Migration rule:
- if composite layers exist, the runtime can prefer them over the legacy flat portrait for the same default emotion
- bespoke event portraits and outfit-specific portrait art can still override the composite when needed

## CG Contract

Store files in:
- `src/content/chapters/chapter-1/images/cg/<slug>.webp`

Use ids like:
- `chapter-1/cg/awakening-flash`
- `chapter-1/cg/black-river-contact`

Use CG for:
- one-shot major reveals
- transformation beats
- fall or invasion moments
- chapter-end splash moments

Current runtime note:
- `cgId` is already tracked in dialogue state
- the current dialogue backdrop resolver can use it as fallback
- there is not yet a dedicated foreground CG renderer layer

So CG can already be authored now, but full bespoke presentation is still a follow-up runtime step.

## Overlay Contract

Store files in:
- `src/content/chapters/chapter-1/images/overlays/<slug>.webp`

Use ids like:
- `chapter-1/overlays/dream-veil`
- `chapter-1/overlays/blood-haze`
- `chapter-1/overlays/parasite-pulse`

Use overlay for:
- dream haze
- corruption tint
- emergency red wash
- ritual glare
- memory fracture grain

Current runtime note:
- `overlayId` already exists in dialogue state
- there is not yet a dedicated independent overlay renderer

## Map Contract

Store files in:
- `src/content/chapters/chapter-1/images/maps/<slug>.webp`

Use ids like:
- `chapter-1/maps/pilgrim-road`
- `chapter-1/maps/underground-route`

Current runtime note:
- `map` is a valid asset kind
- current world and travel screens do not yet render map assets directly

## Music Contract

Store files in:
- `src/content/chapters/chapter-1/music/<slug>.ogg`

Use ids like:
- `chapter-1/music/under-stone`
- `chapter-1/music/family-crack`

Recommended format:
- `.ogg`

Prefer one cue per strong scene state, not one cue per line.

The current prologue effectively needs these musical moods:
- `theme_estate`: aristocratic morning, clean surface, hidden rot
- `theme_city_view`: altitude, city scale, controlled wonder
- `theme_mining`: industrial oppression, dust, moral heaviness
- `theme_tension`: shame, unease, morally contaminated intimacy
- `theme_raust`: stern protection, trust, severe warmth
- `theme_family_crack`: domestic fracture, silence, rot behind manners
- `theme_attack`: siren, rupture, panic
- `theme_captivity`: exhaustion, hunger, humiliation, cold
- `theme_rebels`: sudden kinetic attack, instability
- `theme_fall`: dissociation, abyss, loss of frame
- `theme_parasite`: black river horror, invasive life, ancient wrongness

If these are replaced with chapter-scoped ids later, keep the mood meaning stable.

Current runtime note:
- music ids are validated
- music state is tracked
- there is not yet a dedicated audio playback service in the UI shell

## SFX Contract

Store files in:
- `src/content/chapters/chapter-1/sfx/<slug>.ogg`

Use ids like:
- `chapter-1/sfx/alarm`
- `chapter-1/sfx/metal-clang`
- `chapter-1/sfx/river-deep`
- `chapter-1/sfx/parasite-whisper`

Current prologue sfx expectations:
- `alarm`: harsh emergency siren
- `metal_clang`: heavy chain or steel strike
- `river_deep`: deep sub-heavy river rumble
- `parasite_whisper`: intimate alien whisper inside the body, not in the room

Naming rule:
- for new assets prefer kebab-case in file names
- for new ids prefer chapter-scoped ids

Current runtime note:
- sfx ids are validated
- the last triggered sfx is tracked in dialogue state
- there is not yet a dedicated playback layer

## Dialogue Contract

Dialogue files live in:
- `src/content/chapters/chapter-1/scenes/<scene-folder>/<scene-name>.dialogue.ts`

Scene metadata lives in:
- `src/content/chapters/chapter-1/scenes/<scene-folder>/<scene-name>.meta.ts`

Keep:
- one scene folder per narrative sequence
- one `SceneMeta`
- one main `DialogueData`

Ids should align:
- scene meta id: `chapter-1/scene/<slug>`
- dialogue id: `chapter-1/dialogues/<slug>`

Author nodes with:
- `speakerId`
- `speakerSide`
- `text`
- `emotion`
- `backgroundId`
- `stage`
- `music`
- `sfx`
- `choices`
- `onEnterEffects`

Example snippet:

```ts
{
  id: 'n21',
  type: 'narration',
  backgroundId: 'chapter-1/backgrounds/mining-arrival',
  music: { action: 'switch', musicId: 'chapter-1/music/mining-weight', fadeMs: 700 },
  text: 'Шахта зустріла їх важким повітрям...',
  nextNodeId: 'n22',
}
```

## City Scene Contract

City scenes live in:
- `src/content/chapters/chapter-1/city/<slug>.scene.ts`

Ids:
- `chapter-1/city/<slug>`

Each city scene should define:
- place identity
- background
- available local actions
- available navigation actions

Use city scenes for:
- hubs
- districts
- safe social nodes
- pre-route preparation spaces

## Travel Board Contract

Travel boards live in:
- `src/content/chapters/chapter-1/travel/<slug>.board.ts`

Ids:
- `chapter-1/travel/<slug>`

Use travel boards for:
- abstract route traversal
- survival routing
- resource pressure
- route choices before a world location or city return

Nodes should have meaningful types:
- `empty`
- `question`
- `battle`
- `loot`
- `heal`
- `trap`
- `rest`
- `story`
- `exit`

## World Location Contract

World locations currently live in:
- `src/content/locations/*.ts`

Ids:
- world-level ids like `pilgrim-road`

This area is less chapter-scoped right now than the narrative layer. If new world locations are added, keep ids descriptive and consistent, and do not mix world graph data into city or dialogue files.

## Battle Contract

Battle templates live in:
- `src/content/battles/*.ts`

Ids:
- descriptive combat ids like `guard-battle`

Use battle templates for:
- enemy lineup
- rewards
- post-battle effects

Do not put combat formula logic into the template file.

## Item Contract

Items live in:
- `src/content/items/*.ts`

Ids:
- `basic-potion`
- `travel-ration`
- `iron-helm`

For new items:
- use kebab-case ids
- keep item data static
- put gameplay effects into the item definition, not into UI

## Unit Contract

Units live in:
- `src/content/units/*.ts`

Use:
- character templates for playable or allied runtime units
- character instances for seeded party members
- enemy templates for battle opponents

Do not mix narrative NPC portrait definitions with battle unit templates.

## Script Contract

Narrative scripts are registered in:
- `src/engine/scripts/registerNarrativeScripts.ts`

Use scripts for:
- reusable narrative effect bundles
- scene-to-scene transitions
- route start handoff
- special authored sequence jumps

Do not put long imperative scene logic directly into UI components.

## What Already Works

Already working in the current runtime:
- dialogue backgrounds
- dialogue portraits
- portrait placeholder states driven by outfit presets
- city scene backgrounds
- travel board node traversal
- effect-driven scene and route transitions
- outfit switching through `setCharacterOutfit`

## What Is Only Partially Wired

Present in types and state, but not yet fully surfaced as dedicated presentation systems:
- real music playback
- real sfx playback
- dedicated CG renderer layer
- dedicated overlay renderer layer
- direct map asset rendering on travel/world screens

This means content authors can already reference these assets now, but final user-facing presentation for them is still an engine follow-up.

## Current "Do Not Be Dumb" Rules

- Do not preload a city scene just to create a dialogue return target.
- Do not use bare short ids for new assets if a chapter-scoped id would work.
- Do not create `final_final_v2` filenames.
- Do not hardcode portrait files on every line if the emotion belongs in `portraitRefs`.
- Do not put lore text into validators or stores.
- Do not put gameplay logic into `*.scene.ts` descriptions.
- Do not use one generic background for five distinct emotional beats if those beats need different spatial reads.

## Minimal Authoring Checklist For A New Narrative Scene

1. Add scene meta under `src/content/chapters/<chapter>/scenes/<slug>/<slug>.meta.ts`
2. Add dialogue under `src/content/chapters/<chapter>/scenes/<slug>/<slug>.dialogue.ts`
3. Register the scene in `sceneRegistry.ts`
4. Register the dialogue in `dialogueRegistry.ts`
5. Add any new speakers to the NPC registry
6. Add backgrounds, portraits, music, sfx, cg, or overlays to the chapter asset registry
7. Put the actual files into the matching chapter asset folders
8. Validate references by running tests or content graph validation

## Minimal Authoring Checklist For A New Character

1. Add `<character-id>.npc.ts`
2. Define `displayName`, `defaultSide`, `defaultEmotion`, `defaultPortraitId`, `portraitRefs`
3. Add optional outfits if presentation state changes over time
4. Register in `npcRegistry.ts`
5. Add portrait files under `images/portraits/<character-id>/`

## Minimal Authoring Checklist For New Music Or SFX

1. Put the file under the chapter `music/` or `sfx/` folder
2. Add a constant and registry entry in `assets.ts`
3. Use the id in dialogue `music`, `sfx`, or effects
4. Keep the semantic meaning of the cue stable even if the file is later replaced
