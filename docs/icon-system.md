# Icon system

This document defines sourcing and implementation rules for the interface icon
set. `DESIGN.md` remains the visual authority.

Interface icons are centralised in `src/ui/icons.ts` and sourced from the
installed `lucide` package. Screens do not keep private copies of arrows,
search, reorder, remove, clock, Charge, or settings symbols. The registry
imports only the named Lucide definitions it uses, serialises them for the
string-rendered UI, and applies one 24-pixel viewbox, two-pixel stroke, round
cap, round join, and `currentColor` contract.

Use `ICONS.<name>` for the standard 24-pixel decorative rendering. Use
`renderIcon()` only when a shared component needs a deliberate size, stroke, or
class override. Icons are hidden from assistive technology by default; the
visible control label or an `aria-label` on an icon-only control owns the
accessible name.

Use the following sources by role:

- ordinary interface actions come from Lucide's ISC-licensed SVG set;
- combat nouns may come from Game-icons.net when a purpose-built silhouette is
  clearer, with CC BY 3.0 attribution retained here and in shipped credits;
- Character Types, Traits, the LOFTWAH FIGHTER mark, favicon, trophies, and
  other identity-bearing symbols remain custom vectors;
- image generation is for raster Character, arena, prop, promotional, and
  texture art. It is not the source of small precision icons.

Do not copy SVG path data into a screen and do not generate precision interface
icons with an image model. Do not mix another general-purpose outline library
into the same surface. Do not use Unicode symbols or emoji as interface icons.
Every icon-only control requires an accessible name.

## Attribution

- Lucide package 1.x: <https://lucide.dev/>, ISC License. The installed package
  retains its licence in `node_modules/lucide/LICENSE`; the distributable
  notice is preserved in `THIRD_PARTY_NOTICES.md`.
- Game-icons.net: <https://game-icons.net/>, CC BY 3.0; individual authors are
  recorded when an icon is imported.
