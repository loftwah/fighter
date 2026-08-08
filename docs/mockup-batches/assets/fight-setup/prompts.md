# Fight Setup ImageGen prompts

Generated with the built-in ImageGen tool on 2026-08-07. These are visual
north-star prompts, not production asset specifications.

> Copy correction: the generated `Ready to Fight?`, `Builds: Standard`, and
> `Progression: Practice only` labels were rejected after review. They must not
> be implemented. Use the match's real identity, current difficulty, and only
> deviations or consequences that change the player's decision. The images
> remain composition and material references.

## Prompt-only desktop direction

```text
Use case: ui-mockup
Asset type: high-fidelity shippable game interface concept, desktop Fight Setup screen, 16:9 landscape at 1920×1080 composition
Primary request: Design the shared LOFTWAH FIGHTER Fight Setup as a complete read-only match confirmation screen after character selection. It must feel like a real fighting game ready screen, never a website or dashboard, and everything must fit in one viewport with no scrolling.
Scene/backdrop: a straight-on imaginary arcade match cabinet built from battered indigo-painted plywood and pressed metal, clipped screen-printed fight bills, worn selector hardware, shallow cartridge bays, hard registration borders, edge wear, halftone ink and tactile shadows. A future that never happened: colourful, wonky, physical, handmade, fun.
Composition/framing: compact game chrome only, no global navigation header. Small MAIN MENU return badge at upper left. Top match marquee with exact eyebrow "QUICK FIGHT · STANDARD" and exact title "READY TO FIGHT?". Beneath it, a shallow labelled MATCH RULES strip, not pills, showing exact pairs: "MATCH 3 VS 2", "DIFFICULTY NORMAL", "BUILDS STANDARD", "PROGRESSION PRACTICE ONLY". The central 65% is a theatrical side-versus-side matchup cabinet. Left bay labelled "YOUR LINEUP" with one large Viking starter portrait plate and two subordinate bench portrait cartridges for Tux and Humpty Dumpty. Right bay labelled "OPPONENT LINEUP" with one large Grim Reaper starter plate and one subordinate Ned Kelly bench plate. Place a chunky battered yellow VS plate at centre. Under each team, use one shallow physical loadout rail: left "SECOND WIND" and "HISTORIC · +5 OPENING CHARGE"; right "DEAD AIR" and "MONSTER · 1.3% DAMAGE RESISTANCE". Bottom fixed control deck: rectangular chalk secondary button "CHANGE FIGHTERS" at left and one dominant yellow primary button "START FIGHT" at right.
Style/medium: polished game UI concept art, tactile screen-print and toy-box arcade construction, crisp practical interface hierarchy, readable rectangular controls, large expressive registered-style character portrait art.
Color palette: 75% deep battered indigo and near-black; chalk only for small replaceable labels; tomato red only for opponent/action trims; acid yellow only for starter emphasis, VS and primary action. Strong contrast.
Typography: condensed fight-poster display lettering for title, team names, VS and CTA; highly legible humanist sans-serif for facts. Three clear type levels only.
Text (verbatim): "MAIN MENU"; "QUICK FIGHT · STANDARD"; "READY TO FIGHT?"; "MATCH RULES"; "MATCH 3 VS 2"; "DIFFICULTY NORMAL"; "BUILDS STANDARD"; "PROGRESSION PRACTICE ONLY"; "YOUR LINEUP"; "VIKING"; "TUX"; "HUMPTY DUMPTY"; "OPPONENT LINEUP"; "GRIM REAPER"; "NED KELLY"; "VS"; "SECOND WIND"; "HISTORIC · +5 OPENING CHARGE"; "DEAD AIR"; "MONSTER · 1.3% DAMAGE RESISTANCE"; "CHANGE FIGHTERS"; "START FIGHT".
Constraints: the Fight Setup already knows all fighters; it is confirmation only. Both teams, rules, accessories, starter/bench hierarchy and START FIGHT must all be visible without scrolling. Use no dropdowns, select boxes, editable character slots, selection counters, explanatory paragraph, empty slots, persistent website navigation, profile controls or difficulty control.
Avoid: generic dashboard cards, glassmorphism, neon cyberpunk, polished military HUD, pill badges, dotted wallpaper, excessive cream panels, gradients, rounded cards, tiny text, illegible text, invented extra copy, duplicated labels, mobile framing, browser chrome, watermark.
```

## Current-screenshot desktop redesign

Input image: the real `1920 × 1080` Quick Fight capture in
`output/playwright/fight-setup-audit/current-quick-fight-desktop.png`.

```text
Use case: ui-mockup
Asset type: high-fidelity redesign concept of the supplied LOFTWAH FIGHTER Quick Fight screenshot
Input image: Image 1 is the edit target and source of real game identity, palette, Viking art, Grim Reaper art, accessory imagery and current content.
Primary request: Redesign this exact screen into a complete read-only Fight Setup confirmation screen after character selection. Preserve the recognisable existing Viking and Grim Reaper portraits, Saturday-Night Toybox illustration language, deep indigo/tomato/yellow/chalk palette and fighting-game identity, but radically improve composition and hierarchy.
Change only the surrounding interface composition: remove the entire website-style global navigation header, all dropdowns/select boxes, empty editable slot cards, "1 / 3 selected" counters, difficulty control, explanatory paragraph and disconnected rules badges. Do not turn this into a generic dashboard.
New composition: one compact battered cabinet marquee at top with small MAIN MENU return, "QUICK FIGHT · STANDARD", and large "READY TO FIGHT?". Beneath it show one shallow labelled MATCH RULES table with "MATCH 1 VS 1", "DIFFICULTY NORMAL", "BUILDS STANDARD", "PROGRESSION PRACTICE ONLY". Main area uses two integrated theatrical team bays: left YOUR LINEUP with the existing Viking as one large starter plate; right OPPONENT LINEUP with the existing Grim Reaper as one large starter plate; a chunky worn acid-yellow VS bridge at centre. Empty bench positions are not shown because the completed draft is 1v1. Under the left bay place one shallow loadout rail for SECOND WIND and HISTORIC · +5 OPENING CHARGE. Under the right bay place one shallow rail for DEAD AIR, MONSTER · 1.3% DAMAGE RESISTANCE and MYTHIC · +2% CHARGE SPEED. Fixed bottom control deck contains rectangular CHANGE FIGHTERS at left and dominant yellow START FIGHT at right.
Visual world: Saturday-Night Match Cabinet—straight-on imaginary arcade interface made from battered indigo-painted plywood, pressed metal, bolted rims, clipped screen-print label stock, hard ink misregistration, edge wear and tactile cartridge hardware. Approximately 75% deep indigo; chalk only for replaceable labels; tomato for opponent trim; yellow only for starter, VS and primary action. Square corners and hard shadows.
Text (verbatim): "MAIN MENU"; "QUICK FIGHT · STANDARD"; "READY TO FIGHT?"; "MATCH RULES"; "MATCH 1 VS 1"; "DIFFICULTY NORMAL"; "BUILDS STANDARD"; "PROGRESSION PRACTICE ONLY"; "YOUR LINEUP"; "VIKING"; "OPPONENT LINEUP"; "GRIM REAPER"; "VS"; "SECOND WIND"; "HISTORIC · +5 OPENING CHARGE"; "DEAD AIR"; "MONSTER · 1.3% DAMAGE RESISTANCE"; "MYTHIC · +2% CHARGE SPEED"; "CHANGE FIGHTERS"; "START FIGHT".
Constraints: full 1920×1080-style viewport composition with every important element and both actions visible; no scrolling; preserve the two supplied character identities and core artwork rather than substituting different archetypes; semantic rectangular control affordances; readable labels; exact functional hierarchy.
Avoid: website header, navigation tabs, dropdown arrows, form controls, generic cards, glassmorphism, rounded SaaS UI, neon sci-fi HUD, glowing edges, gradients, dotted wallpaper, excessive cream, pill badges, tiny text, fake extra controls, extra fighters, mobile framing, browser chrome, watermark.
```

## Current-screenshot iPhone 14 redesign

Input image: the real `390 × 844` Quick Fight capture in
`output/playwright/fight-setup-audit/current-quick-fight-iphone14.png`.

```text
Use case: ui-mockup
Asset type: high-fidelity iPhone 14 portrait redesign concept for LOFTWAH FIGHTER Fight Setup
Input image: Image 1 is the edit target and supplies the existing Viking art, deep indigo/tomato/yellow/chalk palette and Kinetic Print identity.
Primary request: Transform the current long mobile web form into a complete non-scrolling 390×844 portrait fighting-game ready screen. This is the same read-only Fight Setup shown after character selection. It must fit all essential information and both actions inside one iPhone 14 viewport while remaining touch-readable.
Composition: respect mobile safe areas. No website navigation header. At top use a 48–56px compact cabinet rail with rectangular MAIN MENU return and small "QUICK FIGHT · STANDARD". Below, a bold but compact "READY TO FIGHT?" marquee. Use one small 2×2 MATCH RULES ledger, not pills: "MATCH 1 VS 1", "DIFFICULTY NORMAL", "BUILDS STANDARD", "PRACTICE ONLY". Main central stage is a tactile split matchup cartridge: Viking on the upper-left/left-facing yellow-trimmed half labelled YOUR LINEUP and VIKING; Grim Reaper on the lower-right/right-facing tomato-trimmed half labelled OPPONENT and GRIM REAPER; a chunky worn yellow VS bridge overlaps the seam. Keep both portraits large enough to recognise, with the existing art identities preserved. Under the duel, use two very shallow loadout strips: "SECOND WIND · +5 OPENING CHARGE" and "DEAD AIR · 1.3% RESISTANCE". Fixed bottom control deck has two 48–56px high rectangular buttons side by side: chalk "CHANGE" and dominant yellow "START FIGHT".
Visual world: Saturday-Night Match Cabinet—straight-on imaginary arcade interface made from battered indigo-painted plywood, pressed metal, bolted rims, clipped screen-print stock, hard ink misregistration and edge wear. Deep indigo dominates; chalk only for labels; tomato for opponent; yellow for VS, starter and primary action. Square corners, hard tactile shadows, large touch targets.
Text (verbatim): "MAIN MENU"; "QUICK FIGHT · STANDARD"; "READY TO FIGHT?"; "MATCH RULES"; "MATCH 1 VS 1"; "DIFFICULTY NORMAL"; "BUILDS STANDARD"; "PRACTICE ONLY"; "YOUR LINEUP"; "VIKING"; "OPPONENT"; "GRIM REAPER"; "VS"; "SECOND WIND · +5 OPENING CHARGE"; "DEAD AIR · 1.3% RESISTANCE"; "CHANGE"; "START FIGHT".
Constraints: full portrait screen visible at once; no scroll; no clipped button; no dropdown, select box, editable slot, selection counter, difficulty control, explanatory paragraph, global nav, profile control, Dev Lab control or empty bench card. Preserve high contrast and minimum 44px touch targets.
Avoid: website, dashboard, form, rounded SaaS cards, glassmorphism, neon sci-fi, gradients, dotted wallpaper, tiny type, unreadable dense rules, excessive decoration, browser chrome, watermark.
```
