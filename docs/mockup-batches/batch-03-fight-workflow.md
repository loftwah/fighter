# Batch 03 — Fighter Select, Match Settings, and Fight Setup

Status: **QUICK STANDARD IMPLEMENTED — STORY, TOURNAMENT, AND CUSTOM SETTINGS NEXT**

Date: 2026-08-07

This batch replaces the overloaded pre-fight page with three explicit tasks.
It is the active visual and interaction family in
`docs/view-mockup-programme.md`.

## Decision

`Fight Setup` is the complete pre-fight process. Its final shared screen is a
read-only match confirmation. Character selection and editable match rules do
not live inside that confirmation screen.

```text
mode-owned eligibility and build state
  → Fighter Select when a Lineup must be chosen
  → Match Settings when the mode permits rule or Accessory changes
  → shared Fight Setup confirmation
  → validated match configuration
  → Battle
```

- Quick Fight normally selects both sides from the full sandbox catalogue.
  Exact duplicate Characters use distinct temporary instance IDs. Registered
  rivalry presets may arrive at Fight Setup pre-filled; editing one creates or
  resumes a Quick draft.
- Story ordinary fights select one to three eligible members from the active
  Story Squad. The Story definition owns the opponent and any forced
  composition or rules.
- Standalone Tournament entry locks up to six configured sandbox instances.
  Each fight selects one to three living members from that Roster. The
  Tournament definition owns the opponent and effective rules.
- Story Tournaments inherit eligible Story instances and use the same
  Tournament runner. Their opponent Squads and rules remain authored.
- Developer Lab may bypass the visible screens, but still resolves the same
  validated, progression-neutral gameplay input.

## Live evidence

The existing Quick Fight screen was exercised through real semantic controls
on 2026-08-07.

| Reference viewport |      Viewport | Document height | Result                       |
| ------------------ | ------------: | --------------: | ---------------------------- |
| 1920×1080 capture  | `1920 × 1080` |          `1181` | confirmation below the fold  |
| Tier 1 MacBook Pro | `1728 × 1117` |          `1181` | 64 px deliberate page scroll |
| iPhone 14 portrait |   `390 × 844` |          `2301` | roughly 2.7 viewports        |

The screen currently combines six Character selectors, two Accessory
selectors, two Trait summaries, duplicated difficulty controls, a rules badge
wall, matchup review, and final confirmation. Its document length is a symptom
of mixed ownership rather than a spacing defect.

### Accepted Quick Standard evidence

The first production tranche was implemented and exercised through the real
browser flow on 2026-08-07:

| Surface              |      Viewport | Document height | Result                                       |
| -------------------- | ------------: | --------------: | -------------------------------------------- |
| Quick Fighter Select | `1920 × 1080` |          `1080` | bounded, six visible catalogue entries       |
| Quick Fighter Select |   `390 × 844` |           `844` | bounded six-up grid and selected Lineup dock |
| Quick Fight Setup    | `1920 × 1080` |          `1080` | bounded side-by-side match cabinet           |
| Quick Fight Setup    |   `390 × 844` |           `844` | bounded vertical duel                        |

The live regression selected three distinct sandbox instances of Viking,
confirmed them against Grim Reaper, and launched Battle with all three copies
present. Direct slot targeting, catalogue-to-slot drag-and-drop, selected-fighter
reordering, editing both sides, Change Fighters, Search, filter cycling, and the
unchanged Viking benchmark launch were also exercised. The browser console
reported no errors.

Implementation is split across the pure instance-aware workflow in
`src/app/fight-workflow.ts`, the reusable
`src/ui/screens/fighter-select-screen.ts`, the reusable read-only
`src/ui/screens/fight-confirmation-screen.ts`, and the Quick session adapter in
`src/app/App.ts`. Story and Tournament adapters deliberately remain subsequent
work; Match Settings remains required for Custom Quick Fight.

## Screen contracts

### Fighter Select

Job: choose the participating instances, their order, and starter from a
mode-owned eligible pool.

Visual target: a full-screen arcade match cabinet, not a neutral application
form. Existing arena art provides the environmental stage; the centre is a dark
portrait board flanked by persistent blue-indigo and tomato Lineup bays. Real
Character art, active-side framing and the yellow Continue lever carry the
hierarchy. Light paper is limited to small labels rather than used as the main
panel colour.

Always visible:

- paginated Mortal Kombat-style portrait grid;
- selected Lineup dock with `Starter`, `Bench 1`, and `Bench 2` order;
- opponent preview when the opponent is authored or locked;
- clear unavailable, forced, loaned, defeated, and selected states;
- Back and Continue actions.

Quick Fight keeps `Your Lineup` and `Opponent Lineup` visible together on
desktop; selecting either Lineup or one of its slots changes the catalogue
target without a separate side-switch tab. Story and Tournament edit only the
player's eligible side. A standalone Tournament Roster uses the same grid
language with a six-instance limit, but remains a separate commitment step from
per-fight deployment.

There are no Character dropdowns and no separate `Make Starter` action. Slot
one is the starter; drag-and-drop or earlier/later controls change the order.
Desktop shows up to eight catalogue entries per page. iPhone shows up to six.
Search and filters reduce a large catalogue. A one-page catalogue has no
pagination chrome; larger catalogues use icon arrows, a compact page fraction,
and direct page dots to preserve position for a future 300-Character roster.

### Match Settings

Job: edit only the rules the current mode permits and explain inherited or
locked rules.

- Standard Quick Fight may skip this screen.
- Custom Quick Fight uses it for supported sandbox rules and builds.
- Tournament Builder reuses its rule-editor components for Tournament defaults
  and authored fight overrides.
- Story and active Tournament runs show authored effective rules but do not
  expose player edits.
- Difficulty remains a global Settings preference. A mode may constrain the
  effective difficulty, but Fight Setup never contains a difficulty dropdown.
- Team Accessories use visual paginated tiles or a bounded picker, never a
  native dropdown.

### Shared Fight Setup

Job: verify the resolved match and start it exactly once.

Always visible:

- real mode, Story Level, Tournament, and round identity;
- `Your Lineup` and `Opponent Lineup`;
- starter and bench order;
- effective builds and material customisations;
- selected team Accessories and availability;
- Team Trait or synergy evidence;
- carried Tournament Health and defeated state where applicable;
- concise effective match rules and difficulty;
- `Change Fighters`, optional `Match Settings`, and one `Start Fight` action.

The screen is read-only. It never contains Character, Accessory, build, or
difficulty form controls. Its internal confirmation record still satisfies the
validated match-entry boundary.

## Copy and information hierarchy

The previous `Set the match.` explanation and disconnected rules pins are
removed. `Ready to Fight?` was explored as a heading in generated mock-ups, but
is not a new screen, route, or product state and is not selected production
copy. Fight Setup uses the match's real identity as its heading:

- `Quick Fight` for an ordinary sandbox match;
- the authored encounter title for Story;
- Tournament name, opponent Squad, and round for Tournament.

The default is quiet. Fight Setup does not show `Builds: Standard`,
`Progression: Practice only`, equal stat-point counts, or other implementation
facts merely because they exist in the resolved configuration. `Standard Build`
remains an internal and help-level contract, not assumed player vocabulary.

Only facts that change a decision or consequence receive first-view evidence:

- current global difficulty;
- a real Custom rule or build deviation;
- an authored objective, time limit, starting status, or unusual resource rule;
- carried Tournament Health, defeated members, exhausted Accessory state, or
  the fact that Health continues into the next fight;
- a concrete reward or loss consequence only where the player must understand
  it before committing.

Quick Fight's lack of Story progression is explained when choosing the mode,
not repeated on every Fight Setup. Primary action copy is `Start Fight`.

## Responsive and scrolling contract

The normal Fighter Select and Fight Setup state must fit the Tier 1 viewport at
`1728 × 1117` and `390 × 844` without deliberate document scrolling. An
emergency overflow path remains preferable to clipping under browser zoom,
large text, keyboard, or exceptional localisation.

- Desktop Fight Setup keeps both teams side by side. A starter is visually
  dominant; two bench members are smaller but fully labelled. The central `VS`
  is a narrow divider, not the largest object.
- iPhone Fight Setup keeps both complete Lineups visible in a vertical duel.
  At 3v3, each side uses a compact starter row plus two bench tickets rather
  than six full desktop cards.
- Fighter catalogues paginate. They do not create an infinitely growing
  document or hide the selected Lineup and Continue action below a grid.
- Controls remain semantic, keyboard-complete, visibly focused, reduced-motion
  safe, and at least 44 CSS pixels on touch surfaces.

## Selected visual direction

**Saturday-Night Match Cabinet** evolves the current Kinetic Print and
Saturday-Night Toybox system into game hardware rather than website chrome:

- deep battered indigo owns 70–80% of the stage;
- chalk is replaceable label stock, not a page background;
- tomato identifies opposition and urgent consequences;
- yellow identifies the starter, `VS`, and primary action;
- square portrait cartridges, pressed-metal rails, clipped print stock, hard
  offset shadows, restrained halftone wear, and shallow cabinet recesses;
- League Gothic is reserved for the wordmark, match title, Character names,
  `VS`, and major actions; Atkinson Hyperlegible carries facts and controls.

The generated references are north stars, not raster specifications. Production
removes photorealistic rust, decorative bolts, ornamental stars, giant chrome,
and information baked into imagery. Real labels and controls remain semantic
DOM content over restrained CSS layers and registered assets.

The generated images pre-date the final copy correction. Their `Ready to
Fight?`, `Builds: Standard`, and `Progression: Practice only` labels are rejected
copy and must not be implemented. Their value is composition, team hierarchy,
material direction, and viewport containment.

## Cross-application visual findings

These findings are recorded now but remain owned by Package 05 so Fight Setup
does not turn into an accidental global rebrand:

- the current two-word text block is legible but behaves like a website-home
  button rather than a distinctive game wordmark;
- the future wordmark should be a code-native/vector lock-up with a small
  `LOFTWAH` maker stamp and a dominant `FIGHTER` mark on irregular print stock;
- the current favicon reads like a detailed `R` plus a star at small sizes; its
  replacement should be one unmistakable `F` stencil with at most two colour
  shapes and no fine detail;
- the indigo, tomato, yellow, chalk, and ink palette is worth retaining. The
  problem is allocation: chalk and dotted wallpaper currently make screens feel
  like documents, while the cabinet direction needs indigo to own most of the
  stage and yellow/tomato to carry state sparingly;
- setup and selection screens use only compact game chrome. The later Main Menu
  batch decides the global navigation pattern; it must not reintroduce a
  full-width website header by default.

## Review references

- [Prompt-only desktop direction](assets/fight-setup/prompt-only-desktop.png)
- [Current-screenshot desktop redesign](assets/fight-setup/current-edit-desktop.png)
- [Current-screenshot iPhone redesign](assets/fight-setup/current-edit-iphone14.png)

The desktop screenshot-led reference is the strongest compositional north star.
The prompt-only reference proves the 3v3 starter-plus-bench hierarchy. The
iPhone reference proves the vertical-duel idea, but production must compress
its masthead and texture to preserve readable 3v3 evidence.

## Implementation sequence

1. Add regression coverage for the mode-owned Quick draft and shared match
   entry before moving controls.
2. Extract the shared instance-based Fighter Select model and mode policies.
3. Implement Quick Fighter Select, including duplicate Character instances.
4. Extract Match Settings and card-based Accessory selection.
5. Convert Fight Setup into read-only confirmation with retained Back/Edit
   paths.
6. Adapt Story deployment and Tournament deployment to the shared screens.
7. Run the fixed Viking benchmark and Story/Tournament smoke flows.
8. Capture both Tier 1 viewports, make one bounded fix pass, run
   `mise run check`, and record the accepted evidence.

Battle, Pause, combat timing, combat rules, and the gameplay HUD remain on hold
unless this migration exposes a concrete regression.
