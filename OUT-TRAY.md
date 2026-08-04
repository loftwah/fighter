# Agent out-tray

This file is the owner-facing queue of prepared outputs. An item is complete
only when it links to its evidence and says what review, if any, is still
needed.

Status values: `DRAFT`, `READY FOR REVIEW`, `ACCEPTED`, `SUPERSEDED`.

## Outputs

### OUT-001 — Reduced V2 owner questionnaire

- **Status:** ACCEPTED
- **Output:** `v2-brief/fighter-v2-owner-questionnaire.md`
- **What changed:** Replaced the 163-question inventory with focused decision
  prompts. Settled repository and owner decisions are recorded once and are no
  longer asked back; newly supplied roadmap, roster-calibration, and batched
  view-review answers are adopted or queued in place.
- **Owner review:** Complete. All answers are reconciled in the V2 release
  specification.

### OUT-002 — Two-band Move language

- **Status:** ACCEPTED
- **Output:** Battle Move cost seals, Lineup attack disclosures, and the Pause key.
- **What changed:** Inner material communicates Normal/Tier 1/Tier 2. A
  labelled outer spot-colour band communicates the Move's declared tactical
  category. Tooltips and assistive labels use the same source.
- **Evidence:** Focused schema and UI tests cover category completeness and key
  rendering. Desktop and 390 × 844 mobile battle/Pause paths were rendered and
  inspected; `mise run check` passes all 200 tests, content validation,
  formatting, lint, typecheck, and production build.
- **Owner review:** Category structure and original-equivalent vocabulary are
  accepted. Future colour/layout changes follow their owning visual batch.

### OUT-003 — Repository identity and terminology pass

- **Status:** ACCEPTED
- **Output:** Repository documentation and UI identify the project as
  `loftwah/fighter`; direct external-game naming is replaced by neutral internal
  research terminology.
- **Compatibility:** The old lowercase local-storage namespace remains only to
  preserve existing profiles and is labelled as legacy in the technical design.
- **Owner decision adopted:** The V2 game title is **LOFTWAH FIGHTER**, the
  repository remains `loftwah/fighter`, and the canonical public home is
  `fighter.loftwah.com`.

### OUT-005 — V2 release contract, roadmap, and source ledger

- **Status:** ACCEPTED
- **Output:** `docs/v2-release-spec.md`, `docs/release-roadmap.md`, and
  `docs/v2-source-ledger.md`.
- **What changed:** Defined V2 as the six-Character feature-freeze baseline;
  assigned the twenty-Character, Story/Tournament breadth, SFX, PWA, account,
  native, and multiplayer milestones through V2.4; and made older research
  preserved, traceable archive evidence rather than disposable material.
- **Platform finding:** The current web/domain split supports Cloudflare and
  later Capacitor packaging without a second gameplay implementation. V2.3 now
  owns development shells and physical-device proof; public store distribution
  follows when the product and memberships are ready, while multiplayer waits
  until the final planned V2.4 milestone.
- **Owner review:** Complete. Scope is ratified; release gates remain open.

### OUT-006 — Tournament Trophies and Story completion

- **Status:** READY FOR REVIEW
- **Output:** One unique Wrong Door Cup Trophy, three generic custom-Tournament
  Trophy designs, a Profile Trophy cabinet, idempotent save ownership, and a
  First Run completion checklist.
- **What changed:** Every Tournament now requires a registered illustrated
  Trophy. First Run completes only after all three Missions and the Wrong Door
  Cup are complete; Quick Fight then serves as the unrestricted end-game
  sandbox.
- **Evidence:** `docs/trophy-art-production.md`,
  `src/tournaments/catalog.ts`, focused domain/screen/asset tests, and the
  additive champion-badge save migration.
- **Owner review:** Complete IN-007 during the next playable build.

### OUT-007 — Public identity, documentation hub, and landing direction

- **Status:** READY FOR REVIEW
- **Output:** `docs/README.md`, `docs/brand-and-site.md`,
  `docs/promotional-art-production.md`, canonical browser/social metadata, and
  three retained landing-page composition mock-ups.
- **What changed:** Separated the player-facing title from repository notation,
  adopted `fighter.loftwah.com`, organised current documentation by authority
  and task, recorded truthful public claims, and defined a reusable Codex image
  production workflow.
- **Owner review:** Complete IN-009. Implementation intentionally waits for
  that composition decision.

### OUT-008 — Deferred multiplayer seam

- **Status:** ACCEPTED
- **Output:** `docs/multiplayer-seam.md` and the revised
  `docs/release-roadmap.md`.
- **What changed:** V2.2 now ends at optional accounts and cloud saves, V2.3
  owns native readiness, and V2.4 is the final currently planned feature
  milestone for server-authoritative multiplayer.
- **Preserved seam:** Explicit seeds, serialisable side-agnostic commands,
  controller ownership outside combat, versioned reports, and deterministic
  replay remain the path to a later Worker/Durable Object match adapter.
- **Owner review:** None required before V2. Multiplayer rules stay deferred
  until IN-010.

### OUT-009 — Launch-roster functional calibration

- **Status:** SUPERSEDED
- **Output:** `docs/launch-roster-calibration.md` and the implemented Viking
  benchmark.
- **What changed:** This established Viking's source-role-equivalent loop, but
  its Power Move label, presentation and resolved magnitude were not correctly
  reconciled. OUT-014 replaces this output without discarding its research.
- **Owner review:** Superseded by the owner's 2026-07-31 clarification.

### OUT-010 — Batched view mock-up programme and Main Menu variants

- **Status:** SUPERSEDED
- **Output:** `docs/view-mockup-programme.md`,
  `docs/mockup-batches/batch-01-main-menu.md`, and three paired
  MacBook/iPhone launcher mock-ups.
- **What changed:** Every future batch now receives a purpose, visibility,
  state, range, responsive, opportunity, and no-scroll brief before generation.
  Batch 01 tests a Story-led launcher, equal mode bills, and a roster-first
  command table without changing production UI.
- **Owner review:** Complete. Variant A was directionally useful, but the batch
  did not meet the intended real-application screenshot-led workflow. A
  dedicated replacement launcher batch is agent work, not a current owner
  action.

### OUT-011 — Battle UI diagnosis and state mock-ups

- **Status:** READY FOR REVIEW
- **Output:** `docs/mockup-batches/batch-02-battle-ui.md`, four current-build
  evidence captures, and three paired MacBook/iPhone Battle compositions.
- **What changed:** The iPhone failure is recorded as a spatial-ownership bug,
  with measured panel collisions and a complete state visibility contract.
  Variant A uses three locked bands, B uses mirrored fight corners, and C makes
  the two Charge rails the governing geometry. After the owner authorised an
  interactive Battle-first evaluation, the app adopted C's spatial ownership
  with A's rectangular Move labels as the current development candidate.
- **Owner review:** Playtest the implemented candidate before it is locked as
  the production Battle direction. The three original mock-ups remain the
  preserved decision history, not three parallel combat-rule implementations.

## In progress

### OUT-004 — V2 implementation programme

- **Status:** READY FOR REVIEW
- **Output:** `v2-brief/ai-agent-master-brief-v2.md`,
  `docs/v2-continuation-programme.md`, and their supporting
  mechanic/specification research.
- **Current state:** Gate 0 is complete. Gate V2-02 is active around
  `v2.viking-acceptance`; its interaction shell and first two presentation
  treatments are ready for open-ended owner playtest. The continuation
  programme separates owner checkpoints from autonomous work, specifies the
  shared typed Battle-modifier and Dev Mode boundary, preserves the unassisted
  acceptance fingerprint, sequences every remaining release gate, and breaks
  delivery into bounded medium-reasoning packets. Main Menu, navigation, and
  Shared Fight Setup remain separate unapproved, real-application
  screenshot-led batches.
- **Next agent packet:** M01, the typed modifier resolver and Dev Mode
  foundation, may proceed while Dean playtests because it changes no approved
  production defaults or disputed spatial direction.
- **Owner review:** Complete IN-012 naturally. No new questionnaire or modifier
  decision is required before M01.

### OUT-012 — Gate 0 reconciliation and ratified programme contract

- **Status:** ACCEPTED
- **Output:** `docs/v2-release-spec.md`,
  `v2-brief/reference-game-mechanic-registry-v2.json`,
  `docs/specification-alignment.md`, and `docs/v2-source-ledger.md`.
- **Evidence:** All 44 questionnaire answers have a disposition; all 117
  research mechanics have exactly one allowed status and adopted/adapted rows
  track all eleven proof columns. Verified references are mechanic-specific;
  missing proof remains visibly null rather than being inferred by category.
- **Owner review:** None. This records the completed questionnaire and starts
  the programme; it does not claim V2 release completion.

### OUT-013 — Fixed-seed Viking Gate 1 slice

- **Status:** READY FOR REVIEW
- **Output:** Default one-versus-one Quick Fight and Developer Lab preset
  `v2.viking-acceptance`, seed `3844240869`, Profile-owned sandbox record, and
  report-derived win/loss explanation.
- **Deterministic evidence:** Battle Boast → Axe First → Battle Boast → Berserker
  Oath wins on Normal at 23.3 seconds simulation / approximately 47.67 seconds
  including presentation, with the first decision at 1.9 seconds and about 47%
  Health remaining. Replay reproduces the report.
- **Human-delay evidence:** The same four-Move policy still wins when every
  player command waits a stable 1.5 seconds after becoming available, with more
  than 20% Health remaining. This tests comprehension time rather than an
  impossible zero-latency controller.
- **Real-browser evidence:** The semantic controls produced the exact four-Move
  win, 65/147 Health remaining, final Berserker Oath hit of 107, correct Type
  explanation, seed `3844240869`, and four recorded player decisions. The
  earlier Battery Drop pointer interception is repaired by the reserved arena,
  pickup, Accessory, Move, Charge, and fight-feed regions.
- **Owner review:** Playtest feel is still required. Automated success proves
  deterministic operability; it does not decide whether banking Power and the
  presentation cadence feel satisfying to a person.

### OUT-014 — Viking functional-equivalence correction

- **Status:** ACCEPTED
- **Output:** `docs/launch-roster-calibration.md`, Viking's three authored
  Moves, combined Power-stack UI, predicted attack outputs, and focused tests.
- **What changed:** Viking now uses original player-facing labels **Battle
  Boast**, **Axe First**, and **Berserker Oath** for the accepted functional
  mapping. Battle Boast banks a visible `+28%` Stock Power stack; Axe First is
  the returning direct attack whose Tier 1 enhancement is undodgeable; and
  Berserker Oath is explicitly presented as an Attack with a disclosed `72%`
  post-hit Stun chance and longer enhanced stun duration.
- **Defect corrected:** The prior `0.28` authored utility magnitude was reduced
  by the `1L` position multiplier to `0.196`. It is now authored at `0.4`, so
  the deterministic resolved Stock stack equals the advertised `0.28`.
- **Compatibility:** The legacy `shield-bash` logical IDs remain stable. Their
  old defensive meaning is not authoritative. All three Viking source and
  generated plates now match the functional kit: a delighted three-mark Power
  boast, one separated axe on a returning loop, and one heavy axe impact with
  stun marks. Superseded sources remain as non-built `.legacy.png` files.
- **Evidence:** Content, domain, UI-output and fixed-seed acceptance tests cover
  original labels, both damaging Moves, stacking, consumption, the exact Stock
  magnitude, Tier upgrades, and replay. `mise run check` passes all 246 tests.
  Real-browser evidence is the initial three-Move contract in
  `.impeccable/review/battle-ui-2026-07-31/viking-move-contract-live.png` and
  the banked Power state in
  `.impeccable/review/battle-ui-2026-07-31/viking-power-stack-live.png`. The
  regenerated production output is
  `public/assets/generated/launch-roster/viking/actions/shield-bash.png`.
- **Owner review:** None for the behaviour mapping; this implements the owner's
  clarification. Final Battle spatial approval remains IN-012.

### OUT-015 — Gate 1 Battle shell and presentation experiment

- **Status:** READY FOR REVIEW
- **Output:** A single rail-first semantic interaction shell, exact Charge
  threshold anchors, responsive Pause/result handling, and the selectable
  **Kinetic Print** / **Comic Cutaways** presentation treatments.
- **Boundary:** Health, Charge, Lineups, Move labels, readiness, Accessory,
  pickups, timer, Pause, focus order, and battle reports are interaction or
  gameplay contracts. Crops, temporary frame arrangements, zooms, wipes, and
  panel choreography are cosmetic. Presentation lock remains
  presentation-active because it freezes simulation and changes wall-clock
  feel even though Phaser cannot decide combat outcomes.
- **Viewport evidence:** Real-browser inspection at `390 × 844`, `844 × 390`,
  and `1728 × 1117` found no document overflow, no out-of-bounds critical
  region, and no sibling intersection among consoles, arena, Lineups, Moves,
  Accessory, or fight feed. Short-landscape Pause keeps Resume and all other
  actions in the first viewport; short-landscape results scroll safely. A
  follow-up collision sweep removed a 16-pixel Pause/Lineup overlap, kept
  active status stamps visible at `844 × 390`, and measured both short-landscape
  Pause and portrait Accessory at 44 pixels. A Switching 3v3 run advanced
  through two defeats and repeated resizes without the former outgoing-texture
  `FramedShot` failure.
- **Screenshots:** `output/playwright/gate1-kinetic-print-iphone-portrait.png`,
  `output/playwright/gate1-comic-cutaway-iphone-portrait.png`,
  `output/playwright/gate1-pause-iphone-landscape.png`, and
  `output/playwright/gate1-victory-iphone-landscape.png`.
- **Owner review:** Compare the two visual styles during the same acceptance
  fight and judge presentation energy separately from the fixed control shell
  and combat tuning.

## Accepted-output policy

Accepted and superseded records remain above in numerical order so the decision
trail stays readable. Status, not physical section placement, is authoritative.
