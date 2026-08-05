---
name: loftwah/fighter V2
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
  charge-green: "#8eef5d"
  move-support: "#55b96a"
  move-team-attack: "#ff8a3d"
  move-team-stun: "#d98cff"
  move-team-support: "#4dd4c6"
  tier-silver: "#b9c3cc"
  tier-gold: "#e2b531"
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
  compact:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
  micro:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, sans-serif"
    fontSize: "0.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.03em"
  combat:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "normal"
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
  mode-bill:
    backgroundColor: "{colors.chalk-paper}"
    textColor: "{colors.registration-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "clamp(1.25rem, 3vw, 2.6rem)"
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

# Design System: loftwah/fighter V2

## Overview

**Creative North Star: "The Collector Drawer"**

loftwah/fighter feels like a pulled-open collector drawer full of underground fight bills, specimen labels, scuffed toys, and hand-stamped results. It is tactile, dense, irreverent, and immediately playable: the interface behaves like a physical archive being sorted under pressure, never like a floating sci-fi HUD.

The visual world uses a constrained risograph palette, blunt display type, torn seams, clipped paper corners, halftone texture, and square pull-tabs. The player enters through an explicit three-mode launcher, then sees navigation scoped to the chosen game context. Static opaque character frames become kinetic through metadata-aware cover crops, fixed panel masks, two-layer crossfades, internal pans and zooms, sliding cut-ins, hit-stop, shake, flashes, and stamped feedback. Story's durable interaction loop is story node → Lineup → Charge Strip → Stamps → next print.

**Key Characteristics:**

- Pulled-open drawer composition with compact rails and strict trays.
- Three explicit game-mode bills before any session begins.
- Separate global and Story-scoped navigation rails.
- Indigo board, tomato and acid-yellow spot inks, chalk stock, and near-black registration ink.
- Layered rectangular Kinetic Print stills with halftone wear and purposeful misregistration.
- Square, bordered controls with torn or clipped paper edges; circles are reserved for holes and stamps.
- Large condensed uppercase display type paired with highly legible body copy.
- Short, forceful motion that always has a reduced-motion equivalent.

### Production Bitmap Layer

The six-Character launch roster and its environments use the implemented
**Saturday-Night Toybox** bitmap language rather than the historical risograph
fighter set: bright cartoon–anime collectible forms, character-dependent
proportions, heavy controlled near-black outlines, simple cel shading, large
colour masses, and light tactile texture. Local Character palettes vary, but a
single frame uses an ink/warm-light foundation and no more than two loud
accents.

Each launch Character ships one canonical plate, two compatible idle keys, a
3 × 2 reaction sheet, and three opponent-free Move plates. Canonical art faces
the camera for selection and profile surfaces. Both battle-idle keys are
separate right-facing plates; the opponent copy is mirrored by the registered
side-aware policy so fighters face inward. Exact identity details, prop geometry, cracks, armour
seams, and background layout remain registered between idle keys. Code owns
every label, value, status, flash, speed line, mask, and input state.

Every Accessory ships one registered opaque square plate. Setup and battle
surfaces render that asset with a visible code-native name, effect, Charge and
readiness state; initials are fallback behaviour, not launch-quality art.

Every Modification ships one registered opaque square plate used by Store and
Collection. Its name, mechanical effect, price, ownership and equipped state
remain code-native rather than being baked into the image.

Arena, Story, Tournament, and responsive startup ensembles share the same
outline, shading, material, and value hierarchy. Establishing art keeps the
interaction plane calm and moves environmental detail toward the edges.
Character portraits use registry focal points in both Phaser and DOM crops.
The legacy drawer palette still governs unfinished interface surfaces; it must
not be used as the prompt lock for new bitmap artwork.

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
- **Charge Green:** A battle-only readiness signal borrowed from the pinned control reference. It is reserved for player Charge fill and ready Move states and is always paired with a value or label.

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

### Spatial approval status

The visual language and view requirements below are authoritative; the current
production compositions are not blanket approvals. Battle and Shared Fight
Setup now have a game-first playtest candidate derived from the owner's Teeny
Titans 2 screenshots: character art owns the viewport, permanent HUD is thin,
and matchup, countdown, Move resolution, and result are dedicated states rather
than more dashboard panels. It is not locked until the owner playtests it. Main
Menu and global/Story navigation still require their own real-application,
screenshot-led mock-up and implementation batch.

The application opens on a deliberate launcher, never inside a game session. On desktop, Story Mode is the dominant image-and-copy bill while Quick Fight and Tournament form a smaller side stack; each card explains persistence and reward consequences before its explicit start or resume action. The global top rail contains Main Menu, Profile, and Settings. Once Story Mode is active, that rail switches to Story, Lineup, Collection, Store, and Missions, with a separate Exit game action back to the launcher.

General screens alternate between image-plus-copy splits and strict card grids; primary content receives fluid section padding. Battle is the signature spatial model: Phaser owns the full viewport while a small pause control, timer, one opponent Health-and-Charge strip, edge Lineup portraits, and the player's Move-and-Charge field sit above it. Player Health belongs to the persistent active Lineup ticket; that ticket may extend one attached Health strip into the lower console instead of repeating the value on its square face. Secondary configuration, trait detail, readiness prose, difficulty, music, and the event feed move to setup, pause, focus help, or post-fight evidence instead of occupying the live arena.

Spacing follows a tight print-production rhythm: micro gaps for meter and status internals, compact gaps inside tickets, base gaps between related controls, grouped gaps between modules, and fluid section insets for large surfaces. Thick solid borders establish objects; dashed rules imply perforation, receipts, or separable sections.

At 1180px, navigation and labels compress before structure changes. At 860px, desktop navigation moves to a fixed bottom rail: three destinations globally or six in Story. Battle itself has no application navigation. At 620px, Shared Fight Setup becomes a two-up character stage with compact native selectors and one clear start action. Battle keeps the arena full-screen, reduces the opponent strip, hides the redundant enemy portrait rail, stacks the player Lineup at lower left, and retains all three touch-sized rectangular Move controls with visible names. Short landscape uses the same edge HUD grammar.

**The Arena-First Rule.** Compress labels and secondary metadata before reducing the central art stage below a usable decision surface.

**The Thin-HUD Rule.** Permanent battle UI is limited to pause, timer, opponent Health and Charge, Lineup health, three Moves, one player Charge Strip, and a contextual Accessory. Everything else is progressive disclosure or a dedicated state.

**The Three-Move Rule.** All three Move controls remain equally prominent; no action receives a privileged hero-card slot.

**The Explicit Launch Rule.** Story, Quick Fight, and Tournament begin or resume only from a deliberate launcher action.

**The Context Rail Rule.** Global navigation and Story navigation are separate; Store and Missions never leak into global, Quick Fight, or standalone Tournament context.

**The Charge-First Rule.** The player reads one large Charge Strip and three rectangular Move controls as a single control field. Exact costs remain printed on the Moves; fuller forecasts stay available on focus without crowding the arena.

**The Two-Band Move Rule.** Every Move control's cost seal has two independent
readings. The inner band communicates Normal, Tier 1 silver, or Tier 2 gold. The outer
spot-colour band communicates the authored tactical category: Attack tomato,
Team attack orange, Stun yellow, Team stun violet, Support mid-green, Team
support teal, Charge control cyan, or Special chalk. Support does not use the
brighter charge green reserved for readiness. Both meanings also have visible
text labels. Pause contains the shared key; colour is never the only carrier.

**The Deliberate Pause Rule.** Escape always toggles the blocking pause sheet.
P follows the player's global choice: hold to pause and release to resume, or
press to toggle. The visible pause control remains available to touch and
pointer users, and the pause sheet states both keyboard behaviours.

**The Developer Switchboard Rule.** Development builds add a dense operator surface in the same print-archive world: one-click scenario tickets lead, the custom Lineup composer sits beneath them, and diagnostics/convenience tools remain in a narrow ledger. It is visibly marked as an isolated sandbox and never masquerades as a fourth game mode.

## Elevation & Depth

Depth is structural rather than atmospheric. Paper tickets lift from indigo board with hard offset shadows; drawer rails use inset side shadows; image wells deepen through dark tonal fields. In battle, enlarged low-opacity echoes sit behind the active fighter stills to create misregistered print depth, then pulse laterally at a slow cadence. Moves temporarily hand the arena to either one dominant Kinetic Print shot or three Comic Cutaway frames, followed by lunge, impact, and reset while simulation time is held. Rotated cards and stamps create physical imperfection, but the interface never becomes soft, translucent, or glassy.

### Shadow Vocabulary

- **Ticket Lift** (`0.55rem 0.7rem 1.25rem rgb(4 8 22 / 35%)`): Standard lift for paper cards, tickets, rails, and offers.
- **Rail Lift** (`0 0.45rem 1.1rem rgb(4 8 22 / 26%)`): Shallow separation beneath sticky navigation.
- **Drawer Channel** (`inset ±0.8rem 0 0 rgb(9 17 40 / 45%)`): Paired inset edges that make the battle field read as an open storage drawer.
- **Result Lift** (`0.8rem 1rem 2rem rgb(0 0 0 / 50%)`): Highest emphasis, reserved for the blocking result stamp.

### Named Rules

**The Printed-Object Rule.** A shadow represents a physical label or drawer layer, never a generic floating panel.

**The No-Glass Rule.** Tonal opacity may support legibility over art, but blur, glow, and glassmorphism do not belong in this world.

**The Layered-Still Rule.** Build spectacle by composing and displacing static prints; never disguise limited-frame art with generic particle noise.

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

### Game Mode Bills

The Main Menu presents exactly three explicit session objects: Story Mode, Quick Fight, and Tournament. Story receives the largest desktop bill because it owns progression; Quick Fight and Tournament remain visibly separate alternatives with plain-language persistence and reward consequences. On compact mobile, all three become equally direct text-first bills, keep one full-width action each, and omit large decorative art before removing explanation text.

### Inputs / Fields

- **Style:** White field, square corners, three-pixel registration border, dark text, and touch-safe height.
- **Focus:** The global cyan focus outline sits outside the existing border.
- **Checkbox / Range:** Native controls retain visible labels and use tomato as their accent.
- **Disabled:** Desaturated and translucent, never hidden.

### Collection Build Tickets

Each owned Character copy has one square build ticket beneath the visual
collection wall. The ticket keeps identity and Modification choice at the top,
then uses two bordered workbench rows:

- five compact labelled steppers for Vitality, Power, Evasion, Fortune, and
  Tempo, with the unspent total always visible;
- three numbered Move rows showing current order, exact Charge cost, tier,
  earlier/later controls, and an explicit matching-copy enhancement selector.

Build controls stay semantic buttons/selects with touch-safe dimensions. Locked
level or Tournament states remain visible and explained; they never disappear
or rely on colour. On narrow screens stat steppers stack and each Move becomes
a two-column work order without shrinking its controls below the touch target.

### Tournament Roster Tickets

The Cup lobby shows all six locked Roster copies as compact square tickets in a
three-column workbench. Every ticket includes opaque portrait art, Type, carried
Health, a visible Deploy checkbox, and a separate Starts radio. Deployed tickets
turn yellow and gain a hard print shadow; defeated tickets remain visible in
greyscale. The counter above the grid always states how many of the allowed
three are deployed.

### Fight Setup

Every player-facing fight stops at the same labelled match-contract surface
before the arena is built. The hierarchy is fixed across Quick Fight, Story and
Tournament: encounter title and rules, two visible Lineups, starter and bench
state, Accessory and Trait evidence, mode-specific preparation, then one
confirmation rail. The mode changes the content and available controls, never
the visual order.

Quick Fight is the fullest editable version. Its native Character selector is
embedded in each visible portrait slot rather than repeated in a detached form;
selected Characters cannot be duplicated within one Lineup. Story uses the
same portrait stage for owned, loaned or forced builds. Tournament places its
event, Trophy and bracket evidence above that stage, then keeps carried Health,
deployment and starter controls below it. Primary actions consistently say
`Confirm Lineup` or `Confirm Lineups` before naming the mode-specific
consequence. Standard fight rules use plain language: Level 10, nine equal stat
points, Stock Moves, no Modifications, and no Story rewards.

### Navigation

Desktop navigation is a chalk top rail with equal-width tabs, dashed dividers, and indigo labels. Hover and active states fill with acid yellow; the active tab also receives a thick tomato underline. The loftwah/fighter wordmark always returns to the Main Menu. Global context exposes Main Menu, Profile, and Settings; Story context exposes Story, Lineup, Collection, Store, and Missions plus an explicit Exit game control. Compact layouts move the current context to a fixed bottom rail with icon and visible text: three columns globally, six inside Story.

### Audio Control

The music button is a global on/off intent control with a visible icon, accessible pressed state, and persistent preference. An off choice survives route changes, game-mode changes, profiles, and reloads; no surface turns music back on by itself. Volume and mute remain separate settings.

**The Persistent Intent Rule.** Turning music off is durable user intent, not a temporary state for the current screen.

While music is enabled, meaningful context changes may select a new seeded
track from the inclusive soundtrack. Main, wandering, battle, and matching
Character-theme roles alter probability without creating exclusive playlists;
the battle HUD continues to show the selected title.

### Lineup Tickets

Each Relic is a horizontal specimen ticket with a square portrait well, class
label, health or state copy, a registration border, and a cut or notched edge.
Battle-edge tickets never disappear: each keeps its portrait and the text
`ACTIVE`, `READY`, or `OUT`. Benched and enemy tickets retain exact
current/maximum Health and a small tomato Health track throughout attack
presentation. The active player ticket instead extends one attached,
lower-console tomato Health readout and suppresses the duplicate value and
track on its square face. Active player tickets shift right; active enemy
tickets shift left. A touch-sized `Attacks` tab
remains attached to every ticket. Its closed face gives the three tiers as
`N`, `1`, or `2`; hover or activating the native disclosure by keyboard or
touch shows all three attack names, Charge costs, and full `Normal`, `Tier 1`,
or `Tier 2` labels.

### Move Controls

The battle's three Moves are equal rectangular press controls immediately above
the Charge Strip. Each persistently exposes its name and exact cost. Damaging
Moves anchor their current predicted attack points in the central seal. The
neutral amount is static; a raised amount ignites a jagged yellow-and-tomato
corona and attaches an explicit `POWERED +N` marker to the seal, while a reduced
amount adds a tomato uneven pulse and an explicit `REDUCED −N` marker. These
treatments stop under reduced motion but retain their
different shapes, labels and colours. Readiness is communicated by fill,
contrast and an accessible state label. Tactical category is the dominant
coloured stamp on every Move: it pairs the full role name with a compact inked
marker such as `HIT`, `STN`, `AID`, `BAR`, or `FX`. Upgrade tier remains a
smaller, differently shaped secondary stamp. Desktop stamps are explicitly
prefixed `Role` and `Tier`; compact stamps retain the marker, full role value,
shape and colour when those prefixes no longer fit. Predicted hit/effect detail,
the authored description and charge timing remain in the semantic label and
focus disclosure rather than competing with the fighters. Unavailable Moves remain focusable and
explanatory through `aria-disabled`; they state how much more Charge is needed
or identify a blocking state such as Stunned. A selected Move hands the arena
to the chosen presentation style before returning to the same control geometry.

Compact decision guidance is announced semantically instead of occupying a
permanent labelled panel. Ready controls use charge green and retain their
currently usable number keys. Unavailable controls recede while the arena
remains visually stable. This is persistent instruction, not a first-run
tooltip or a banner over the arena.

The opponent's thresholds remain represented by its independent Charge track
and semantic action information rather than a second visible set of Move
controls. Readiness uses hostile tomato, never the player's charge green.
The complete opponent HUD rests at roughly four-fifths scale with slightly
reduced opacity so the opposing Character remains visible. Mouse proximity,
keyboard focus, or the explicit touch-sized `Opponent HUD` tab restores the
instrument to full size without changing its contents. The tab can pin or
reduce the full view; compact controls do not accept pointer input until the
instrument expands. An explicit Reduce wins over retained button focus or
proximity until the pointer leaves and approaches again, or keyboard focus
moves into an opponent control.

Each side also owns one Accessory with an independent percentage. The player's
Accessory is a separate semantic ticket adjacent to the lower Charge Strip,
with its own name, percentage, readiness statement and miniature meter. It may
share the lower console row on compact layouts, but must never read as part of
the Team Charge fill. Opponent
Accessory state remains available to assistive technology and pause/help detail
without adding another permanent ticket above the arena.

**The Touch Explanation Rule.** Responsive compression may move the predicted
hit/effect summary into the control's accessible name or focus disclosure, but
it may not remove the explanation entirely. Pause/help states that holding a
Move opens its details so touch inspection is discoverable without permanent
tutorial prose over the Charge Strip.

### Battle Pickups

Battle pickups are temporary square print tokens suspended above the player
Charge field. Battery uses yellow, Repair uses chalk, and Surge uses tomato;
each also carries a visible name, exact `+N` value, and destination label.
Tokens are semantic touch-sized buttons, never Phaser-only hit regions. No more
than two appear for one side, and removing or expiring one must not move the
Charge Strip or Move controls.
Active reaction statuses remain visible beside Health as labelled stamps with
their remaining time and magnitude or trigger count; colour is supplementary.
At the `844 × 390` short-landscape reference these collapse to one-line,
ellipsised stamps inside the readout rather than disappearing. Pause and the
player Accessory remain at least 44 pixels tall at that reference.

### Framed Shots

Every Phaser fighter image is a complete opaque plate viewed through a fixed,
ink-bordered rectangular mask. Registry focal points and safe-crop metadata
select the cover crop without stretching. A small overscan lets the image pan,
zoom, recoil, or squash inside the mask without exposing an edge.

The panel owns separate layout and motion roots. Responsive layout changes only
the outer panel and mask; idle swaps and presentation tweens only touch the
inner image layer. Idle A/B plates crossfade rather than hard-swap so minor
generated-background differences read as intentional limited animation.
Optional 3 × 2 reaction sheets use the same masked source-region path for hurt,
dodge, stun, KO, victory, and tense beats; a missing sheet retains the idle
plate and code-native reaction effects.
An outgoing crossfade layer keeps its texture alive through later responsive
layout passes. Rich art becomes removable only after neither persistent framed
shot layer refers to it.
Landscape and portrait stages use different asymmetric player/enemy rectangles.
A **Kinetic Print** Move cut-in creates one dominant temporary masked shot over
a procedural matte and diagonal slash. **Comic Cutaways** instead composes
three temporary lead, action, and reaction shots with staggered slides and
independent zoom settles. Both destroy their temporary frames before control
returns and neither changes semantic controls, report data, or lock duration.

**The Honest Rectangle Rule.** Generated art is never treated as a transparent
sprite. Its rectangle is the shot. A bespoke Move or reaction plate may include
static illustrative arcs, debris, stars, or impact shapes that belong to that
single authored pose; code still supplies the panel, crop, timed movement,
changing particles, impact words, values, statuses, and dynamic state.

**The Live Copy Rule.** Gameplay artwork contains no readable or
pseudo-readable names, Move titles, values, costs, statuses, instructions, or
UI. The game layer owns that text and may place it over a declared quiet region
of the shot. Fixed text is allowed only in an explicitly authored promotional
composition that is never mirrored and is not duplicated by a live overlay.

### Meters

Health and Charge Strips are bordered tracks paired with numeric labels where
space permits. The lower resource is visibly named `Team Charge` because it is
shared by the active Lineup; its current value remains an explicit `x / 100`.
Health uses tomato; Team Charge uses battle-only charge green with a yellow
leading edge, printed texture and interval marks over an indigo track. The opponent's identity and Health form one compact upper
strip with a thinner independent Charge track directly beneath it. The active
player Lineup ticket may extend its single Health readout into the lower combat
console, while the dominant player Charge Strip stays attached to the three
Move controls. The Health readout sits spatially above the Moves but beneath
their stacking layer, with a deliberate physical gap; Move controls always win
if responsive geometry ever approaches that boundary. Both Charge fills track exact
fractional simulation state. Accessory percentage remains visually and
semantically separate from normal Charge. Combat events remain available to
assistive technology and the post-fight report but do not form permanent live
HUD chrome.

### Battle Timing and Motion

Every battle opens with a dedicated VS beat followed by blocking `3, 2, 1, FIGHT`. Charge, timer, status durations, AI, and player commands remain frozen until `FIGHT` clears. The same complete hold applies whenever a Move resolves: controls read “Resolving”, de-emphasise without disappearing, and the action runs as a full-field cut-in plus targeted lunge/impact/float/KO beats. Only the Character and Move name overlays the action; instructional prose is announced semantically.

The lock duration is gameplay presentation timing, not decorative animation timing. Instant Moves hold for about 2.1 seconds, charged impacts for about 1.8 seconds, Accessories for about 1.6 seconds, and defeats for about 2.6 seconds, expanding for multi-hit sequences. These windows are derived far enough past the final staggered impact beat that simulation cannot resume while a damage number is still resolving. Reduced motion removes travel, zoom, flash, and shake but retains the same lock and state sequence so it cannot alter balance. Ordinary idle motion stays limited to short two-frame crossfades and an occasional restrained masked pan.

**The Choose-Then-Watch Rule.** A command is selected before its presentation. No further player or AI decision may be accepted while that presentation owns the stage.
The opponent's reaction timer restarts only after presentation releases, leaving
the player a readable active beat before the next AI command.

Every damaging Move resolution owns one large arena verdict: `HIT`, `CRITICAL
HIT`, or `MISS`, paired with damage or dodge detail. Support Moves use an
equally direct effect verdict such as `POWER UP`. This is transient battle
feedback, while the semantic announcement and post-fight report retain the
complete event detail.

Reflection and dodge counters do not start a second full-field cut-in. The
triggering Move keeps ownership of the existing presentation lock; a
`REFLECT!` or `COUNTER!` word, short reverse lunge, and reaction damage stamp
play after its authored hits. This preserves timing clarity without turning a
reaction chain into another long cinematic.

**The Still-Image-Camera Rule.** Static art earns energy through entrance slides, asymmetric framing, scale changes, diagonal panels, cut-ins, hit reactions, damage stamps, and decisive camera resets—not ambient particles or constant wandering.

### Result Stamp

The result is the final gameplay scene, not a modal card. A full-width verdict banner, the frozen arena, a compact reward ledger, and explicit replay/leave actions fill the viewport. Wins use acid yellow; losses use tomato with chalk text. The underlying battle surface is inert while the scene is open.

Immediately after the verdict, a compact evidence block answers `Why you won`
or `Why you lost` from the versioned Battle Report. It names the decisive Move,
leading damage, Type edge, critical/dodge contribution, and recorded Move/switch
count when present. It never invents a cause and stays readable before the
report-export and rematch actions.

### Pause Sheet and Development Inspector

Escape opens a compact acid-yellow Pause Sheet and freezes the complete
single-player simulation. Its actions resume, restart, leave, inspect the
battle, or open the Developer Lab. The underlying battle is inert, keyboard
focus is trapped inside the sheet, and closing restores focus to the invoking
control.

The Development Inspector is a denser chalk operator sheet over the paused
battle. A top action strip keeps Open Lab, Copy state, Export report, and Resume
reachable before the three diagnostic panels: simulation controls, recent
semantic events, and independently scrolling raw state. On narrow screens the
panels stack and raw state is height-capped so primary actions are never buried.

## Do's and Don'ts

### Do:

- **Do** stage play as labelled physical matter: drawers, tickets, specimen wells, pull-tabs, perforations, and stamps.
- **Do** open on the explicit three-mode launcher and preserve the selected session context until the player exits it.
- **Do** keep the first battle viewport readable as dominant arena art with one thin opponent strip, edge Lineups, and one lower Move-and-Charge field.
- **Do** freeze the complete simulation during countdowns and attack presentations while letting presentation motion finish.
- **Do** use layered rectangular and square art as an intentional Kinetic Print language.
- **Do** retain a readable predicted hit/effect summary on touch layouts and a fuller explanation on hover or keyboard focus.
- **Do** pair colour with text, shape, position, or value for every gameplay state.
- **Do** preserve visible keyboard focus, touch-sized controls, and the reduced-motion override.
- **Do** preserve the player's music on/off intent across navigation, reloads, and Collector profiles.
- **Do** use stable logical asset IDs and the approved fallback chain when adding new art.

### Don't:

- **Don't** introduce rounded dashboard cards, pills as default controls, glassmorphism, neon glow, or a sci-fi HUD.
- **Don't** turn tomato or acid yellow into unbounded decoration; they communicate action and state.
- **Don't** obscure the arena with floating panels or let opposing readouts collide with the matchup stamp.
- **Don't** allow Charge, timers, status durations, AI, or commands to advance behind a countdown or attack cut-in.
- **Don't** mix global navigation with Story-only destinations such as Store or Missions.
- **Don't** start Story, Quick Fight, Tournament, or music playback merely because a screen rendered.
- **Don't** make one Move visually dominant over the other two.
- **Don't** separate the player's Move controls from the Charge Strip, shrink the Strip into a minor meter, or remove accessible Move explanation.
- **Don't** duplicate active Health, Charge, readiness, traits, statuses and event prose across multiple permanent panels.
- **Don't** rely on colour alone for class, status, availability, health, or outcome.
- **Don't** add decorative motion without a short purpose and a reduced-motion equivalent.
