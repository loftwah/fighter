---
name: Riot Relics
description: A kinetic collectible squad battler staged as an underground print archive.
colors:
  indigo-board: "#111f46"
  indigo-vault: "#091128"
  indigo-ink-soft: "#1a326a"
  tomato-print: "#ef4d39"
  tomato-shadow: "#b92f25"
  acid-yellow: "#f2d742"
  chalk-paper: "#f7f0dd"
  registration-ink: "#14151a"
  aged-paper: "#d8d1bf"
  focus-cyan: "#8de1ff"
typography:
  display:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(4rem, 7vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  title:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "normal"
  body:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  square: "0"
  stamp: "50%"
spacing:
  micro: "0.35rem"
  compact: "0.65rem"
  base: "1rem"
  grouped: "1.5rem"
  section: "clamp(2rem, 5vw, 5rem)"
components:
  button-primary:
    backgroundColor: "{colors.acid-yellow}"
    textColor: "{colors.registration-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0.72rem 1.2rem"
    height: "3.6rem"
  button-secondary:
    backgroundColor: "{colors.indigo-board}"
    textColor: "{colors.chalk-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.65rem 1rem"
    height: "3.4rem"
  navigation-tab:
    backgroundColor: "{colors.chalk-paper}"
    textColor: "{colors.indigo-board}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.8rem 0.65rem"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.registration-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.45rem 0.65rem"
    height: "2.8rem"
  print-ticket:
    backgroundColor: "{colors.chalk-paper}"
    textColor: "{colors.registration-ink}"
    rounded: "{rounded.square}"
    padding: "0.7rem 0.9rem"
  meter-track:
    backgroundColor: "{colors.indigo-vault}"
    textColor: "{colors.tomato-print}"
    rounded: "{rounded.square}"
    height: "0.7rem"
  status-stamp:
    backgroundColor: "{colors.chalk-paper}"
    textColor: "{colors.registration-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.06rem 0.35rem"
  result-stamp:
    backgroundColor: "{colors.acid-yellow}"
    textColor: "{colors.registration-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.square}"
    padding: "clamp(1.5rem, 4vw, 3rem)"
---

# Design System: Riot Relics

## Overview

**Creative North Star: "The Collector Drawer"**

Riot Relics feels like a pulled-open collector drawer full of underground fight bills, specimen labels, scuffed toys, and hand-stamped results. It is tactile, dense, irreverent, and immediately playable: the interface behaves like a physical archive being sorted under pressure, never like a floating sci-fi HUD.

The visual world uses a constrained risograph palette, blunt display type, torn seams, clipped paper corners, halftone texture, and square pull-tabs. Static rectangular character art becomes kinetic through two-frame swaps, panel translation, cut-ins, hit-stop, shake, flashes, and stamped feedback. The durable interaction story is story node → Lineup → Charge Strip → Stamps → next print.

**Key Characteristics:**

- Pulled-open drawer composition with compact rails and strict trays.
- Indigo board, tomato and acid-yellow spot inks, chalk stock, and near-black registration ink.
- Rectangular Kinetic Print art with halftone wear and purposeful misregistration.
- Square, bordered controls with torn or clipped paper edges; circles are reserved for holes and stamps.
- Large condensed uppercase display type paired with highly legible body copy.
- Short, forceful motion that always has a reduced-motion equivalent.

## Colors

The palette behaves like a two-ink risograph job printed over indigo board and warm paper stock.

### Primary

- **Indigo Board:** The application ground, drawer body, and stabilising field around bright printed objects.
- **Tomato Print:** The loud action ink for wordmarks, hostile or urgent surfaces, active moments, and loss states.

### Secondary

- **Acid Yellow:** The reward, selection, charge, matchup, and primary-action ink. Its brightness carries gameplay importance rather than decoration.
- **Chalk Paper:** The principal label stock for controls, cards, readouts, and light-on-dark text.

### Tertiary

- **Focus Cyan:** An accessibility-only focus signal that remains visually distinct from the print palette.

### Neutral

- **Indigo Vault:** The deepest arena, image-well, and modal ground.
- **Indigo Ink Soft:** A subdued locked or secondary indigo surface.
- **Registration Ink:** Borders, typography on paper, dividers, and the hard silhouette tying the system together.
- **Aged Paper:** Secondary label stock and low-emphasis ticket fill.
- **Tomato Shadow:** A darker continuation of the action ink when tonal separation is required.

### Named Rules

**The Spot-Ink Rule.** Tomato and acid yellow signal action or state; do not spend them as ambient decoration.

**The Registration Rule.** Light paper objects are held together by visible near-black borders, seams, or dividers.

**The Cyan Exception Rule.** Focus cyan belongs to keyboard focus only and must not become a general accent.

## Typography

**Display Font:** League Gothic (with Arial Narrow and sans-serif fallback)  
**Body Font:** Atkinson Hyperlegible (with ui-sans-serif and sans-serif fallback)

**Character:** Condensed, shouted display type makes headings and values feel screen-printed; open, highly legible body type keeps rules and battle decisions fast to parse. The contrast is intentional and should remain obvious.

### Hierarchy

- **Display** (regular, fluid 4–7rem, 0.85 line-height): Hero story, Lineup, store, and tournament titles; uppercase and tightly set.
- **Headline** (regular, fluid 3–6rem, 0.88 line-height): Section headings and result statements; uppercase with compact measure.
- **Title** (regular, 2.4rem, 0.95 line-height): Relic names, offer names, values, and substantial ticket headings.
- **Body** (regular, 1rem, 1.55 line-height): Descriptions and instructions, capped at roughly 70 characters.
- **Label** (bold, 0.72rem, 0.08em tracking): Class marks, node types, meter captions, status labels, and provenance; uppercase.

### Named Rules

**The Shout-and-Explain Rule.** League Gothic names the thing; Atkinson Hyperlegible explains what it does.

**The Short Display Rule.** Display copy stays brief and balanced—headlines are labels, not paragraphs.

## Layout

The desktop shell uses a compact top rail above full-width authored surfaces. General screens alternate between image-plus-copy splits and strict card grids; primary content receives fluid section padding. Battle is the signature spatial model: a three-column collector drawer with opposing Lineup rails around a dominant central specimen arena, then three equal Move labels in a strict lower tray. Fighter readouts share the arena's top edge while a reserved central band keeps the matchup stamp collision-free.

Spacing follows a tight print-production rhythm: micro gaps for meter and status internals, compact gaps inside tickets, base gaps between related controls, grouped gaps between modules, and fluid section insets for large surfaces. Thick solid borders establish objects; dashed rules imply perforation, receipts, or separable sections.

At 1180px, navigation and battle labels compress before the structure changes. At 860px, desktop navigation becomes a fixed six-item bottom rail, split story and tournament surfaces stack, and the battle drawer becomes two Lineup rows above the arena with the Move tray below. At 620px, surfaces use compact insets, cards become single-column, battle Move labels stack vertically, secondary battle metadata hides, and the primary story action moves ahead of supporting dialogue.

**The Arena-First Rule.** Compress labels and secondary metadata before reducing the central art stage below a usable decision surface.

**The Three-Move Rule.** All three Moves remain equally prominent; no action receives a privileged hero-card slot.

## Elevation & Depth

Depth is structural rather than atmospheric. Paper tickets lift from indigo board with hard offset shadows; drawer rails use inset side shadows; image wells deepen through dark tonal fields. Rotated cards and stamps create physical imperfection, but the interface never becomes soft, translucent, or glassy.

### Shadow Vocabulary

- **Ticket Lift** (`0.55rem 0.7rem 1.25rem rgb(4 8 22 / 35%)`): Standard lift for paper cards, tickets, rails, and offers.
- **Rail Lift** (`0 0.45rem 1.1rem rgb(4 8 22 / 26%)`): Shallow separation beneath sticky navigation.
- **Drawer Channel** (`inset ±0.8rem 0 0 rgb(9 17 40 / 45%)`): Paired inset edges that make the battle field read as an open storage drawer.
- **Result Lift** (`0.8rem 1rem 2rem rgb(0 0 0 / 50%)`): Highest emphasis, reserved for the blocking result stamp.

### Named Rules

**The Printed-Object Rule.** A shadow represents a physical label or drawer layer, never a generic floating panel.

**The No-Glass Rule.** Tonal opacity may support legibility over art, but blur, glow, and glassmorphism do not belong in this world.

## Shapes

The base form is square and hard-edged. Cards use thick registration borders, occasional clipped lower corners, torn vertical seams, punched circular holes, ticket notches, pull-tabs, and barcode-like marks. Slight rotations create press-room variation without disturbing layout.

Circles are exceptional and semantic: completion stamps, mission checks, punched hardware, and ticket notches. They are not a general-purpose container shape. Icons use square line caps and mitred joins to preserve the mechanical print character.

**The Square-First Rule.** Start every surface at zero radius; earn a circle only when it represents a physical punch, stamp, or control.

**The Controlled-Crooked Rule.** Rotation stays subtle on cards and forceful only on explicit stamps; content alignment remains readable.

## Components

### Buttons

Buttons feel like labels torn from a print tray: bordered, high-contrast, and decisive.

- **Shape:** Square with a heavy registration border (3px).
- **Primary:** Acid-yellow label with registration-ink text, condensed uppercase title type, and an offset shadow; hover flips to tomato print with chalk text and a one-pixel lift.
- **Secondary:** Indigo label with chalk text and a chalk border.
- **Text:** Unboxed, bold, and underlined with a visible offset; use for backward or low-priority navigation.
- **Focus / Disabled:** All interactive controls receive a four-pixel cyan outline with three-pixel offset. Disabled controls desaturate and reduce opacity while retaining their visible label.

### Chips

Status and provenance chips are tiny stamped labels: uppercase, bold, and outlined. They use text in addition to colour and remain compact enough to share a row. Selected chips may use acid yellow or tomato, but the label carries the meaning.

### Cards / Containers

- **Corner Style:** Square by default, with an optional clipped lower corner or circular notch.
- **Background:** Chalk or aged paper for neutral information; tomato or acid yellow for alternating, active, or completed states; indigo for locked and deep surfaces.
- **Shadow Strategy:** Use Ticket Lift only when the object should read as removable paper stock.
- **Border:** Three to six pixels in registration ink; dashed dividers imply perforation.
- **Internal Padding:** Compact for battle labels, base for tickets, and grouped for settings or result sheets.

### Inputs / Fields

- **Style:** White field, square corners, three-pixel registration border, dark text, and touch-safe height.
- **Focus:** The global cyan focus outline sits outside the existing border.
- **Checkbox / Range:** Native controls retain visible labels and use tomato as their accent.
- **Disabled:** Desaturated and translucent, never hidden.

### Navigation

Desktop navigation is a chalk top rail with equal-width tabs, dashed dividers, and indigo labels. Hover and active states fill with acid yellow; the active tab also receives a thick tomato underline. On compact layouts, the same destinations move to a fixed six-column bottom rail with icon and visible text.

### Lineup Tickets

Each Relic is a horizontal specimen ticket with a square portrait well, class label, health or state copy, a registration border, and a cut or notched edge. Active player tickets shift right; active enemy tickets shift left. The text “ACTIVE”, “READY”, or “OUT” remains the authoritative state indicator.

### Move Labels

The battle's three Moves use equal-width paper labels in chalk, tomato, or acid yellow. Each exposes position, name, predicted power, cost, and charge timing in semantic text. A hovered available Move lifts and twists slightly; the selected action becomes a full-width Kinetic Print cut-in before returning to the drawer.

### Meters

Health and Charge Strips are short, bordered tracks paired directly with numeric labels. Health uses tomato; charge uses acid yellow. Fill updates use transform scaling over 80ms and stop effectively instantly when reduced motion is enabled.

### Result Stamp

The blocking result sheet is the highest paper layer: thick border, slight rotation, condensed verdict, a perforated three-column reward ledger, and explicit replay/leave actions. Wins use acid yellow; losses use tomato with chalk text. The underlying battle surface is inert while the stamp is open.

## Do's and Don'ts

### Do:

- **Do** stage play as labelled physical matter: drawers, tickets, specimen wells, pull-tabs, perforations, and stamps.
- **Do** keep the first battle viewport readable as compact rail, Lineups, central arena, paired meters, and three Moves.
- **Do** use rectangular and square art as an intentional Kinetic Print language.
- **Do** pair colour with text, shape, position, or value for every gameplay state.
- **Do** preserve visible keyboard focus, touch-sized controls, and the reduced-motion override.
- **Do** use stable logical asset IDs and the approved fallback chain when adding new art.

### Don't:

- **Don't** introduce rounded dashboard cards, pills as default controls, glassmorphism, neon glow, or a sci-fi HUD.
- **Don't** turn tomato or acid yellow into unbounded decoration; they communicate action and state.
- **Don't** obscure the arena with floating panels or let opposing readouts collide with the matchup stamp.
- **Don't** make one Move visually dominant over the other two.
- **Don't** rely on colour alone for class, status, availability, health, or outcome.
- **Don't** add decorative motion without a short purpose and a reduced-motion equivalent.
