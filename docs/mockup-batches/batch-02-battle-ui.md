# Mock-up batch 02 — Battle UI state study

Status: **IMPLEMENTED CANDIDATE READY FOR OWNER PLAYTEST — PRODUCTION DIRECTION NOT YET LOCKED**

Created: 2026-07-31

Images:

- [Variant A — Three Locked Bands](../../.impeccable/mocks/view-batches/batch-02-battle-ui/variant-a-three-locked-bands.png)
- [Variant B — Mirrored Fight Corners](../../.impeccable/mocks/view-batches/batch-02-battle-ui/variant-b-mirrored-fight-corners.png)
- [Variant C — Rail-first Arena](../../.impeccable/mocks/view-batches/batch-02-battle-ui/variant-c-rail-first-arena.png)

Current-build evidence:

- [iPhone Battle](../../.impeccable/review/battle-ui-2026-07-31/current-iphone-battle-live.png)
- [desktop Battle](../../.impeccable/review/battle-ui-2026-07-31/current-desktop-battle-live.png)
- [iPhone Quick Fight setup](../../.impeccable/review/battle-ui-2026-07-31/current-iphone-quick-setup-full.png)
- [iPhone Main Menu](../../.impeccable/review/battle-ui-2026-07-31/current-iphone-main-menu.png)

Generation mode: built-in image generation. The current application captures,
authoritative Battle visibility rules, Tier 1 viewports, and the established
print-archive visual language were supplied as references. Generated type,
icons, dimensions, incidental copy, and artwork are not product truth.

## Diagnosis

The current iPhone Battle is not failing because one panel needs another
margin. It uses a full-height, overflow-hidden stage while the enemy console,
player console, Lineup tickets, Move seals, Accessory, event readout, and
presentation state are all positioned independently. At `390 × 844`, those
layers occupy the same physical space:

| Region              | Current measured box (`x, y, width, height`) |
| ------------------- | -------------------------------------------- |
| Opponent console    | `67, 66, 256, 252`                           |
| Player vitals       | `67, 581, 256, 57`                           |
| Move 2              | `131, 634, 77, 99`                           |
| Player command deck | `67, 657, 256, 136`                          |
| Charge Strip        | `67, 732, 256, 51`                           |
| Accessory           | `141, 752, 108, 40`                          |
| Event readout       | `67, 798, 256, 37`                           |

Move 2 crosses into the vitals, the Move controls and Charge Strip compete for
the same area, Accessory sits over the Strip, and the event readout is pushed
to the viewport edge. The opposing console also covers a large part of the
arena and side Lineup. Desktop has enough empty space to disguise the same
ownership problem, but the consoles still cover fighter art.

Quick Fight setup has a related composition failure. Its two-column picker
collapses into a long document on iPhone, and content that auto-places into the
remaining columns can collide. It is roughly five viewports tall instead of a
focused select-and-confirm workspace. The launcher is readable but cannot keep
the three modes, global destinations, and development-only tools within the
first iPhone viewport.

The repair therefore needs a spatial ownership model, not a series of new
`z-index` values. Every live state must change content inside reserved regions;
it must not add another floating panel over the arena or command field.

## View packet

### Identity and job

- Routes: Story Battle, Quick Battle, and Tournament Battle.
- Blocking substates: countdown, Move presentation, Pause, result, and
  recovery.
- Job: compare both Charge states, choose a readable Move when the player is
  ready, understand what the opponent is about to do, and track the condition
  of every deployed Character.
- Success: the player's eyes can stay on the two resource consoles. The arena
  explains the action; it does not become the only place where rules or damage
  are legible.

### Fixed spatial ownership

Each proposal must reserve these regions before optional state is rendered:

1. an opponent resource console containing identity, Health, readiness and a
   substantial Charge rail;
2. an arena containing fighters, targeting, impact, countdown and the current
   presentation beat;
3. a player resource console containing identity, Health, readiness, the three
   Moves, dominant Charge Strip, Accessory and the event readout;
4. persistent edge space for both full Lineups and each member's Health;
5. a small safe-area-aware utility position for timer and Pause.

Health and Charge never separate for either active Character. The event
readout remains immediately beneath the player's Charge Strip. The player and
opponent readiness lamps remain visible in equivalent positions. Move controls
remain attached to their Charge thresholds.

### Always visible

- active Character name and exact current/maximum Health for both sides;
- both independent Charge values and effective fill rates;
- player and opponent readiness labels, not colour alone;
- all deployed Lineup members, current/max Health, and `ACTIVE`, `READY`, or
  `OUT` state;
- the player's three Move names, Charge costs, tier, tactical category, and
  ready/locked state;
- opponent Move thresholds without exposing hidden AI decisions;
- player Accessory charge and availability;
- timer and Pause;
- the latest short event directly beneath the player Charge Strip.

### Conditional, inside reserved slots

| State            | What changes                                                             | What must not move or disappear                     |
| ---------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| `3, 2, 1, FIGHT` | Arena receives a blocking countdown                                      | Both consoles and Lineups remain readable but inert |
| Charging         | Readiness labels name next threshold and remaining Charge                | Health, Charge and Move positions                   |
| Player ready     | Player lamp and eligible Move receive a strong light/marker              | Opponent lamp and rail                              |
| Opponent ready   | Opponent lamp and threshold receive the matching warning                 | Player controls                                     |
| Player Move      | Arena becomes the presentation surface; player console reads `RESOLVING` | Both Health/Charge consoles and Lineups             |
| Opponent Move    | Same presentation treatment in the opponent colour                       | Same persistent combat state                        |
| Status active    | Labelled stamp sits beside that Character's Health                       | Fighter art and Charge rails                        |
| Pickup available | Token uses the reserved pickup rail above player controls                | Move seals and Charge Strip                         |
| Bench inspection | Edge ticket expands within an edge drawer                                | Both resource consoles                              |
| Pause            | One blocking sheet freezes simulation                                    | Underlying state remains recognisable and inert     |
| Victory/defeat   | One blocking result sheet replaces interaction                           | No live controls remain operable                    |
| Recovery/error   | Plain-language blocking sheet offers safe retry or exit                  | No partial simulation continues                     |

### Excluded

- global or Story navigation during an active Battle;
- difficulty, music controls, debug telemetry, or scenario controls as
  permanent player-facing battle chrome;
- free-floating logs over the fighters;
- multiple simultaneous status toasts;
- hidden Health or Lineup state during Move presentation;
- ordinary page scrolling at either Tier 1 viewport.

## Variant A — Three Locked Bands

Opponent console, arena, and player console are explicit full-width horizontal
bands. Mobile is the clearest expression of the rule: the opponent band owns
the top, the arena owns the middle, and the player band owns the bottom. Moves
use compact rectangular labels above the Charge Strip.

Strengths:

- easiest composition to make collision-proof;
- Health, readiness and Charge read as one console for both sides;
- strongest labels and touch targets;
- easiest to verify across every blocking state.

Risks:

- can feel more like a control surface than a toy fight;
- desktop needs careful restraint so the bands do not consume the arena;
- the generated labels are examples, not exact production typography.

## Variant B — Mirrored Fight Corners

Desktop places the opponent console on the left and player command console on
the right, framing a large central arena. The phone returns to a vertical
composition but keeps each full Lineup inside its side's console.

Strengths:

- largest uninterrupted desktop arena;
- the two sides feel like opposing corners;
- Lineup information has a clear parent region.

Risks:

- the player's eyes travel sideways instead of comparing parallel rails;
- desktop and phone use more structurally different compositions;
- least faithful to the established upper-opponent/lower-player spatial rule.

## Variant C — Rail-first Arena

The two Charge rails are the governing geometry. Opponent state anchors the
top; player state anchors the bottom; fighter art occupies the uninterrupted
space between them. Player Move controls attach directly to their thresholds
on the lower rail and Lineup tickets stay at the outer edges.

Strengths:

- makes Charge visibly become the game board;
- preserves the current product rules while removing arbitrary overlays;
- gives opponent Charge nearly the same visual weight as the player's;
- makes ready and resolving states easy to show without moving controls.

Risks:

- threshold-attached controls need a semantic DOM layout that still behaves
  predictably at narrow widths;
- compact Move labels need the explicit detail disclosure already required by
  the design;
- pickup and Accessory slots must be reserved before implementation.

## Recommended combination

Use **Variant C as the spatial model**, with **Variant A's more legible
rectangular Move labels and hard three-band collision rules**. Keep the
rail-first relationship, but calculate all Battle geometry from one shared
layout contract used by both DOM controls and Phaser art. Do not preserve the
current collection of independent absolute offsets.

The owner subsequently authorised an interactive Battle-first evaluation and
asked for the stable control/information layer to be separated from optional
visual treatments. The development build therefore implements this
recommendation as a playtest candidate: Variant C owns spatial regions and
Variant A supplies the rectangular Move labels. This does not silently turn
the candidate into the final production direction.

## Implemented candidate evidence

- One CSS grid owns the opponent console, arena, player console, and both edge
  Lineups. Phaser is clipped to the arena cell and cannot cover semantic
  controls.
- Move labels are three equal, touch-sized semantic buttons. Separate exact-cost
  ticks attach them to the Charge Strip without using overlapping absolute
  button positions.
- Accessory, pickups, fight feed, Pause, and result each have a reserved or
  blocking region. The short-landscape Pause keeps Resume visible without
  scrolling; the result sheet scrolls safely when its explanation is taller
  than the viewport.
- Real-browser geometry inspection reports no document overflow, out-of-bounds
  critical region, or sibling intersection at `390 × 844`, `844 × 390`, and
  `1728 × 1117`.
- At `844 × 390`, active statuses remain as compact labelled stamps and the
  44-pixel Pause tile clears the player Lineup rail. The portrait Accessory
  measures 44 pixels high at `390 × 844`.
- The Switching 3v3 regression advanced through two roster defeats, then
  repeatedly resized the live arena without a destroyed-texture or
  `FramedShot.applyFraming` error.
- The real semantic controls complete Battle Boast → Axe First → Battle Boast →
  Berserker Oath and produce a report-derived win at the fixed seed.
- Settings exposes **Kinetic Print** and **Comic Cutaways** as cosmetic Battle
  visual styles. Both use the same interaction shell and combat report.

## Implementation acceptance gates

The candidate can only be locked after:

1. every state in the table has a captured desktop and iPhone frame;
2. an automated geometry assertion reports no intersection between consoles,
   Move controls, Accessory, event readout, Lineup tickets, utility controls,
   or the safe areas;
3. both Health/Charge pairs are readable without looking in separate regions;
4. the opponent's Charge, rate and readiness are comparable to the player's;
5. all six Lineup tickets and their Health remain visible during Move
   presentation;
6. the player can identify Move name, cost, tier, category and availability
   without opening Pause;
7. keyboard focus, touch targets, reduced motion and colour-independent labels
   pass the existing accessibility contract;
8. no state introduces document scrolling at `390 × 844` or `1728 × 1117`.

## Prompt manifest

The generation prompt described a responsive LOFTWAH FIGHTER battle interface,
not a generic game HUD. It included:

- the exact view job, fixed spatial ownership, always-visible contract and
  state changes above;
- side-by-side `1728 × 1117` MacBook and `390 × 844` iPhone frames;
- current live screenshots as negative layout evidence;
- the indigo, chalk, tomato, acid-yellow and Charge-green print palette;
- opaque rectangular fighter art, hard borders, perforation, halftone texture,
  square pull-tabs and condensed fight-poster typography;
- no rounded dashboard cards, glass, neon sci-fi treatment, translucent
  overlays, scrolling, invented navigation or overlapping panels;
- distinct Ready, Charging and Opponent Move examples across the board.

Variant deltas were the three locked horizontal bands, mirrored fight corners,
and threshold-anchored rail-first arena described above.

## Owner playtest

Run `Developer Lab → V2 Viking Acceptance`, then compare the two choices under
`Settings → Development experiments → Battle visual style`. One short answer
is enough:

```text
Battle UI: lock C + A labels / change / reject
Visual style: Kinetic Print / Comic Cutaways / keep both / change
Keep:
Change:
```

The launcher, navigation, and Shared Fight Setup still receive their own
screenshot-led batches rather than being folded into this Battle decision.
