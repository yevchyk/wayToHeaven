# Dialogue shell and placeholder fallback

## What changed

- Dialogue paging no longer assumes a fixed `6 lines no matter what`.
- The runtime now measures the real available text-body height inside the dialogue panel.
- If the footer grows, paging shrinks with it instead of letting the body fall into a scrollbar.
- Dialogue reveal is now `grapheme-beat based`, not `whole-word based`.
- Missing portraits now fall back in this order:
  1. authored emotion portrait
  2. character default portrait
  3. local temporary placeholder bundle
- Missing authored backgrounds now fall back to a local placeholder bundle when the asset id matches a known scene archetype.

## Dialogue shell contract

- Main body must page instead of scrolling.
- Footer controls may wrap on small widths, but wrapped controls must not force the text body into a scroll area.
- Dialogue text should reveal in small readable beats with short punctuation pauses.
- Leading punctuation such as dashes or quotes should stay attached to the next visible character.
- `Library` remains a first-class dialogue action and stays directly reachable from the shell.

## Placeholder contract

- Internet placeholders are temporary production scaffolding, not final art.
- Placeholders live under `src/content/shared/placeholders/`.
- Runtime should prefer real authored art whenever it exists.
- Placeholder assets are for visibility and staging only. They should be replaced once final portraits or backgrounds are approved.

## Installed placeholder bundle

Portrait placeholders:

- `src/content/shared/placeholders/portraits/young-woman.jpg`
- `src/content/shared/placeholders/portraits/old-woman.jpg`
- `src/content/shared/placeholders/portraits/noble-man.jpg`
- `src/content/shared/placeholders/portraits/rough-man.jpg`

Background placeholders:

- `src/content/shared/placeholders/backgrounds/interior-room.jpg`
- `src/content/shared/placeholders/backgrounds/prison-cell.jpg`
- `src/content/shared/placeholders/backgrounds/city-gates.jpg`

## Placeholder sources

These were pulled as temporary public-domain placeholders from Wikimedia Commons pages:

- `Courbet, Gustave, Portrait of a Young Woman.jpg`
- `Christian Seybold - Portrait of an Old Woman - 1981.19 - Fogg Museum.jpg`
- `18th Century Portrait of a Man.jpg`
- `Rembrandt - Portrait of a Bearded Old Man in a Beret - 42.151-S1.jpg`
- `Adolph von Menzel - Interior of a Room with Balcon - WGA15044.jpg`
- `Jack sheppard.jpg`
- `City Gates.jpg`

## Runtime mapping notes

- Noble and family figures default toward `old-woman` or `noble-man` placeholders.
- Servants and younger women default toward `young-woman`.
- Rough prisoners, raiders, and hard-edged hostile figures default toward `rough-man`.
- Gate, wall, and road-adjacent backgrounds default toward `city-gates`.
- Cell and prison scenes default toward `prison-cell`.
- Room, hall, and chamber scenes default toward `interior-room`.

## Known gaps

- These placeholders are not transparent PNG cutouts.
- They are deliberately temporary and may not match the final corruption-driven visual language.
- CG, map, and overlay fallback are still lighter than portrait/background fallback and may need a dedicated pass later.
