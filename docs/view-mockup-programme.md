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
- Fighter Select and ordinary Fight Setup confirmation;
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

## One-at-a-time perfection checklist

This programme is also the owner-facing delivery board. Exactly one interaction
family is **ACTIVE**. One may be named **NEXT** so dependencies are visible;
everything else stays queued or on hold. Work does not move forward merely
because code exists or a mock-up looks promising.

Every interaction family uses the same completion checklist:

- [ ] reconcile its job, state owner, entry/exit paths, and exclusions with the
      authoritative documents;
- [ ] capture the real application at `1728 × 1117` and `390 × 844`, plus
      `844 × 390` when landscape materially changes the task;
- [ ] document minimum, typical, maximum, loading, empty, error, resume,
      complete, and development-only states that apply;
- [ ] prepare the required composition alternatives from the real captures;
- [ ] record Dean's `APPROVE`, `COMBINE`, `REVISE`, `REJECT`, or `DEFER`
      decision;
- [ ] reconcile the accepted direction into `DESIGN.md`, the view inventory,
      the relevant authority, and its surface brief;
- [ ] implement semantic responsive controls without duplicating domain or
      orchestration rules;
- [ ] prove route/session availability, state isolation, keyboard/touch/focus,
      reduced motion, and the interaction family's specific contracts;
- [ ] complete one bounded desktop/mobile browser inspection and fix pass;
- [ ] pass `mise run check`, record evidence, and mark the family **ACCEPTED**.

## Delivery order

The active order reflects the owner's 2026-08-07 decision to keep the currently
satisfactory Battle/gameplay surface stable while entry, setup, and surrounding
application flows are perfected one at a time.

| Order | Interaction family                                                            | Status     | Exit condition                                                                                                                                            |
| ----: | ----------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    00 | Mode ownership, Story Save, Tournament/Trophy, and validated match foundation | **DONE**   | Schema-v3 Profile migration, Story/Tournament content contracts, repeat deployment, Trophy provenance, and validated Battle entry pass the full check.    |
|    01 | Fighter Select, Match Settings, and shared Fight Setup                        | **ACTIVE** | Each task has one owner; selection and confirmation fit Tier 1 without deliberate scrolling; every player fight confirms one resolved draft exactly once. |
|    02 | Story Squad and Tournament Roster commitments                                 | `QUEUED`   | Story ownership, six-instance commitments, standalone sandbox builds, presets, and validation remain upstream of per-fight deployment.                    |
|    03 | Tournament library, lobby, nodes, repeat deployment, forfeit, and Result      | `QUEUED`   | Preset/custom definitions, mandatory Trophies, persistent Health, interstitials, and all-six defeat flow are coherent.                                    |
|    04 | Story library, Story Save, Levels/content, ordinary Result, and Ending        | `QUEUED`   | Concurrent Stories own their progression and collections; Levels compose content/grants/fights/preset Tournaments; completion awards project globally.    |
|    05 | Main Menu, LOFTWAH FIGHTER wordmark, and global game utilities                | `QUEUED`   | Three modes and resume state fit one viewport; navigation feels like game chrome rather than an assumed website header.                                   |
|    06 | Profile identity, records, Story saves, and Trophy/award cabinets             | `QUEUED`   | Global identity and archives are distinct from Story-owned collections and progression.                                                                   |
|    07 | Settings and the music/audio control model                                    | `QUEUED`   | Preferences remain global; playback intent and context changes are predictable; controls do not crowd game surfaces.                                      |
|    08 | Story Collection, builds, Store, Missions, and lore                           | `QUEUED`   | Owned instances, purchases, upgrades, claims, and catalogues stay inside the selected Story Save.                                                         |
|    09 | Intro, honest loading, storage recovery, and completion states                | `QUEUED`   | Entry and recovery are explicit, skippable where promised, and never silently start a session or erase data.                                              |
|    10 | Developer Lab and development inspector                                       | `QUEUED`   | Development entry remains isolated, validated, non-progressing, visibly assisted, and removable from public builds.                                       |
|    11 | Achievements                                                                  | `LAST`     | Profile-derived awards are polished after their durable global and Story source facts are settled.                                                        |
|  HOLD | Shared Battle, Pause, and gameplay presentation                               | `HOLD`     | Keep the current candidate available; reopen for a concrete defect, failed acceptance check, or explicit review.                                          |

### Completed package 00 — Foundation Packet F00

F00 is deliberately not a visual batch. It owns the corrected global
Player/Story Save boundary, sandbox builds, generic Tournament definitions and
nodes, repeat deployment until all six are defeated, Tournament forfeit,
source-aware Trophy projection, Story Level steps, migration, and the one
validated match boundary. Its complete contract is recorded in
`docs/v2-continuation-programme.md`.

It completed on 2026-08-07. The implementation anchors are
`src/persistence/save.ts`, `src/story/contracts.ts`,
`src/tournaments/catalog.ts`, `src/tournaments/cheap-seats.ts`, and
`src/app/match-entry.ts`.

No screen may be declared production-complete against the retired assumption
that the global Profile owns Characters or that one lost Tournament fight ends
the complete run.

### Active package 01 boundary — Fight workflow

`Fight Setup` is the overall process. Fighter Select chooses participating
instances, order, and starter; Match Settings edits only mode-permitted rules,
builds, music, and team Accessories; the required final Fight Setup screen is a
read-only match confirmation. Quick Fight presets may arrive pre-filled, but
every player-facing fight reaches that final screen before Battle:

```text
Quick preset → pre-filled Fight Setup → Battle
Quick Standard → Fighter Select → Fight Setup → Battle
Quick Custom → Fighter Select → Match Settings → Fight Setup → Battle
Story fight → eligible Fighter Select → Fight Setup → Battle
Tournament fight → living-Roster Fighter Select → Fight Setup → Battle
```

Fight Setup displays the resolved one-to-three-instance Lineups, starter/bench
order, Accessories, opponent, effective rules, difficulty, carried state, and
consequences. It has no dropdowns or editable configuration controls. It never
determines ownership, sandbox build legality, Story Squad membership,
Tournament Roster membership, or rewards.

The selected direction and live measurements are recorded in
`docs/mockup-batches/batch-03-fight-workflow.md`.

### Package 05 boundary — Main Menu and game chrome

The Main Menu remains a one-viewport three-mode launcher, but no persistent
website-style header is assumed. The later batch must compare minimal game
utilities, contextual mode controls, and any compact navigation treatment from
real application states. Battle keeps only gameplay and Pause chrome.

The earlier Batch 01 variants remain historical evidence. They are not
approval for the current Story-dominant production composition.

Package boundaries may change when a review exposes a shared component that
must settle earlier. The owner is asked about one active package only.

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
