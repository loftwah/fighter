# MVP artwork plan

## Historical implemented composition

North-star comp: `.impeccable/mocks/battle-collector-drawer.png`

The composition is an archival collector drawer rendered as an underground
risograph fight bill. It documents the currently implemented asset batch, but
the identity has been rejected as the release direction.

The comp is directional. Generated raster text, exact measurements, and tiny decorative controls must not be copied literally.

## Visual ingredients and implementation medium

| Ingredient                                           | Medium                                | Status   |
| ---------------------------------------------------- | ------------------------------------- | -------- |
| Arena scene                                          | Generated raster                      | complete |
| Mara Vex canonical and two-frame idle                | Generated raster                      | complete |
| Knuckle Tax canonical and two-frame idle             | Generated raster                      | complete |
| Zipwire canonical and two-frame idle                 | Generated raster                      | complete |
| Velvet Hex canonical and two-frame idle              | Generated raster                      | complete |
| Gutter Grin canonical and two-frame idle             | Generated raster                      | complete |
| Scrapjack canonical and two-frame idle               | Generated raster                      | complete |
| Three opponent-free Mara Move cut-ins                | Generated raster                      | complete |
| Mara reaction sheet                                  | Generated raster                      | complete |
| Story, store, and tournament scenes                  | Generated raster                      | complete |
| Indigo/tomato/yellow/chalk frame                     | Semantic HTML/CSS/SVG                 | complete |
| Halftone/paper surface                               | Raster art plus bounded CSS texture   | complete |
| Health, Charge, timer, costs, focus, labels          | Semantic HTML/CSS                     | complete |
| Type wheel and status symbols                        | Code-native SVG/text                  | complete |
| Hit flash, shake, recoil, two-frame swap, number pop | Phaser/CSS motion                     | complete |
| Missing art                                          | Code-native Kinetic Print placeholder | complete |

The production prompt record, output dimensions, and asset contact sheet live
in `.impeccable/notes/asset-production.md` and
`.impeccable/review/asset-production-contact-sheet.png`.

## Template requirements

- Backgrounds and cut-ins: 16:9, 1536×864 runtime source.
- Character portraits/idles: 4:5, 1024×1280 source, crop-safe.
- Store art: 1:1, 1024×1024.
- Reaction sheet: 3×2, 1536×1024.
- No generated UI text.
- No opponent included in reusable character Move cut-ins.
- Every generated source is an opaque rectangle or square. Transparency is not
  part of the renderer contract.
- Approved assets are not overwritten silently.

## Placeholder chain

```text
specific generated asset → canonical character portrait
→ class-colour block art → generic torn-paper placeholder
```
