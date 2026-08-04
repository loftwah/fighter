# LOFTWAH FIGHTER view mock-up programme

Status: **ACTIVE V2 DESIGN REVIEW PROGRAMME**

Created: 2026-07-31

This programme turns `docs/view-inventory.md` into reviewable interface
decisions before implementation. It keeps product truth, the implemented
visual system, and responsive constraints fixed while testing genuinely
different compositions in small batches.

## Outcome

For every player-facing view, Dean should be able to answer:

- which composition makes the view's purpose immediately obvious;
- which information belongs in the first viewport;
- what can be conditional, disclosed, paginated, or removed;
- whether desktop and mobile feel like the same product without being the same
  arrangement;
- which parts should be combined before implementation.

The mock-ups are north stars, not raster specifications. Generated typography,
icons, spacing, and incidental art are approximate. Production controls,
labels, state, focus, and responsive behaviour remain semantic HTML/CSS and
registered project assets.

## Tier 1 review frames

Each composition is shown at both references in the same image:

| Reference                        | Review viewport                                                    |
| -------------------------------- | ------------------------------------------------------------------ |
| 16-inch 2024 MacBook Pro browser | `1728 × 1117` CSS pixels at the common default scaled-display mode |
| iPhone 14 portrait browser       | `390 × 844` CSS pixels, including dynamic safe-area considerations |

Landscape mobile is checked during implementation, not used as a third
composition in every decision image. A batch may add it when the view changes
materially in landscape, especially Battle and dense build editing.

## View packet

Before any mock-up is generated, its batch brief must state:

1. **Identity and status** — route/substate, implemented state, and authority.
2. **Job** — why the player came here and the one thing they need to do.
3. **Entry and exit** — how it opens, where it can go, and what rendering alone
   must never start or mutate.
4. **Always visible** — the minimum state and actions required for
   understanding.
5. **Conditional** — resume state, rewards, warnings, locks, owned content, or
   development-only controls and the condition that reveals each one.
6. **Excluded** — tempting information that belongs elsewhere.
7. **Content ranges** — minimum, typical, and maximum values that can change
   layout.
8. **States** — first run, empty, loading, error, success, locked, complete, and
   expert use where relevant.
9. **Responsive behaviour** — what moves, collapses, paginates, discloses, or
   becomes fixed on each Tier 1 frame.
10. **Opportunities** — useful additions that improve the player's decision
    without widening the product.

Every batch produces three distinct composition variants unless the owner asks
for two. One view or tightly coupled interaction family is reviewed at a time.
No production implementation begins until the batch is approved, combined, or
explicitly delegated.

## Viewport and scrolling policy

Avoiding scroll is a hierarchy rule, not permission to shrink content below
comfortable reading or touch sizes.

### Must be viewport-contained on Tier 1

- Main Menu;
- Quick Fight and ordinary Character confirmation;
- Battle, countdown, ordinary Pause, and Result;
- Tournament round choice;
- any blocking recovery or confirmation state.

Primary actions remain visible without scrolling. Safe-area padding, browser
toolbars, zoom, large text, and virtual keyboards still need resilient
overflow behaviour; an emergency scroll is preferable to clipped controls.

### Bounded browsing views

Collection, Store, Missions, Achievements, Trophy cabinet, and long Story
archives may exceed one viewport. They use:

- a fixed or sticky context header with the primary action;
- explicit filters and sort;
- numbered pagination or `Previous` / `Next`, with current range and total;
- a bounded result area rather than an endlessly growing document;
- a stable detail region so selection does not move the page;
- preserved page, filter, and focused item when the player returns.

Desktop should normally show a paginated grid plus an adjacent detail/workbench
region. iPhone should normally show a paginated grid or list, then open one
full-height detail state with a clear return action. Infinite scroll is not the
default because it obscures position and makes returning to a Character
unreliable.

Settings and How to Play may use ordinary document scrolling when their content
is inherently sequential. Their section navigation and save/back action remain
reachable.

## Batch order

The order follows the player's comprehension path and resolves shared patterns
before dependent screens:

| Batch | Interaction family                            | Principal questions                                                                 |
| ----: | --------------------------------------------- | ----------------------------------------------------------------------------------- |
|    01 | Main Menu / mode launcher                     | Mode hierarchy, resume state, global navigation, one-viewport mobile                |
|    02 | Shared Battle and Pause                       | Side consoles, Charge decisions, Lineup visibility, event feed, readiness, overlays |
|    03 | Shared Fight Setup                            | Character selection, opponent preview, synergy, Accessory, Standard versus Custom   |
|    04 | Story Home, node, Result, and Ending          | Narrative focus, next action, recovery, completion checklist                        |
|    05 | Lineup, Collection, build editing, and lore   | Pagination, owned copies, Move tiers, stats, Modifications, detail topology         |
|    06 | Tournament lobby, Case, interlude, and Result | Trophy desire, carried Health, deploy/start choices, round progression              |
|    07 | Profile, Achievements, and Trophy cabinet     | Identity, durable progress, collection proof, local slots                           |
|    08 | Story Store and Missions                      | Purchases, claims, locks, balance, small/large catalogues                           |
|    09 | Settings, How to Play, Move key, and recovery | Discoverability, accessibility, local data, long-form help                          |
|    10 | Intro, loading, empty, error, and completion  | Honest waiting, skip, recovery, first/returning-player states                       |

Current front-of-queue status:

| Batch | Status                 | Next evidence action                                                                                                         |
| ----: | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
|   01R | `REBUILD REQUIRED`     | Capture the real Main Menu and global/Story navigation states, then generate three replacement compositions.                 |
|    02 | `IMPLEMENTED PLAYTEST` | Owner-test the rail-first C + rectangular A-label candidate and either lock it or request named changes.                     |
|    03 | `QUEUED`               | Capture Standard/Custom, one-to-three Character, opponent, Accessory, validation, and return states from Shared Fight Setup. |

Batch 01R treats the Main Menu and navigation as one tightly coupled launcher
family, but its brief and evidence must distinguish global navigation from the
Story-owned rail. Batch 03 owns Shared Fight Setup. Neither current production
composition is approved merely because its requirements are documented in
`DESIGN.md`.

Batch boundaries can change when one review exposes a shared component that
should be settled earlier. Battle remains its own batch because it needs
portrait, landscape, and desktop variants plus multiple live states.

Batch 02 was deliberately moved ahead of the replacement launcher/navigation
batch and Shared Fight Setup after the
2026-07-31 playtest exposed Battle collisions that prevented useful gameplay
testing. Batch 02 also establishes the screenshot-led process requested in the
Batch 01 review: capture the real application, describe every required state,
generate alternatives from that evidence, then implement only an approved
direction.

## Review answer format

For each batch, Dean can answer in a few lines:

```text
Batch:
Preferred variant:
Carry forward:
Remove or change:
Desktop:
iPhone:
Opportunities:
Decision: APPROVE / COMBINE / REVISE / REJECT / DEFER
```

Answers are reconciled into `DESIGN.md`, `docs/view-inventory.md`, and the
relevant surface brief before implementation. Rejected variants remain
preserved as evidence and are not silently blended into the chosen direction.
