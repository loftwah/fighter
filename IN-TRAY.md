# Owner in-tray

This file contains actions that need Dean's judgement or source material.
Agents may prepare options, but they must not silently close these decisions.

Status values: `READY`, `IN PROGRESS`, `WAITING`, `DONE`, `DEFERRED`.

## Ready now

### IN-007 — Review the first Trophy set

- **Status:** READY
- **Why:** The Wrong Door Cup and three reusable custom-Tournament designs are
  implemented from generated opaque art.
- **Action:** In the next build, win or development-unlock the Wrong Door Cup,
  then review its Tournament preview and Profile Trophy cabinet. Say whether
  the four designs feel like the right visual family.
- **Unblocks:** locking the Trophy art template for V2.1 Tournaments.

### IN-009 — Choose the public landing-page composition

- **Status:** READY
- **Why:** The public identity, domain, truthful copy, and existing hero art are
  settled. The remaining decision is which composition should govern the
  complete landing surface.
- **Action:** Compare:
  `.impeccable/mocks/landing-charge-strip.png`,
  `.impeccable/mocks/landing-fight-bills.png`, and
  `.impeccable/mocks/landing-collector-drawer.png`. Choose one, ask to combine
  named parts, or reject all three.
- **Guardrail:** These are composition references. Generated small copy,
  Character names, and gameplay claims are not authoritative.
- **Unblocks:** semantic responsive implementation, browser QA, and the
  dedicated `1200 × 630` social image.

### IN-012 — Choose the Battle UI spatial model

- **Status:** IN PROGRESS
- **Why:** The owner authorised an interactive Battle-first evaluation and
  asked for the control/information shell to remain stable while presentation
  styles vary. The development candidate now implements Variant C's rail-first
  ownership with Variant A's rectangular Move labels; this is implementation
  for playtest, not silent final approval.
- **Action:** Play `Developer Lab → V2 Viking Acceptance` naturally on the
  phone. Experiment, make mistakes, and send any raw notes, screenshots or
  recordings in whatever form is easiest. There is no required Move sequence
  or questionnaire. The agent will reconcile the observations first and ask a
  follow-up only where two materially different implementation directions
  remain plausible.
- **Style comparison:** **Kinetic Print** and **Comic Cutaways** remain the two
  presentation treatments. If useful during natural play, compare them through
  `Settings → Development experiments → Battle visual style`.
- **Intake:** `docs/v2-continuation-programme.md#3-gate-v2-02-playtest-and-feedback-handling`
  records the lightweight context wrapper and triage process. Supplying that
  structure is optional; unstructured observations come first.
- **Evidence:** The semantic-control path completes the intended four-Move win
  at all three Tier 1 viewport sizes. Automated geometry inspection reports no
  out-of-bounds critical regions or sibling intersections at `390 × 844`,
  `844 × 390`, and `1728 × 1117`. Final review also exercised two roster
  defeats followed by repeated responsive layout passes without a Phaser
  texture error; compact landscape statuses remain visible and Pause plus
  Accessory meet the 44-pixel target floor.
- **Still separate:** Main Menu, navigation, and Shared Fight Setup retain their
  dedicated screenshot-led mock-up and implementation batches.

## Later, after the V2 rules are locked

### IN-008 — Obtain store developer memberships

- **Status:** WAITING
- **Why:** They are unnecessary for web development, V2–V2.2, or most V2.3
  native-readiness work. A free Apple Account can run short-lived development
  builds on owned devices; public App Store distribution requires the paid
  programme.
- **Action:** After V2.3 is accepted and public native distribution is the next
  milestone, enrol in the Apple Developer Program and the corresponding Google
  Play developer programme.
- **Unblocks:** signed testing tracks and public app-store releases.

### IN-010 — Ratify V2.4 multiplayer rules

- **Status:** DEFERRED
- **Why:** Multiplayer is the final currently planned feature milestone and
  must not distract from tightening V2–V2.3.
- **Action:** After V2.3 is accepted, review `docs/multiplayer-seam.md` and
  decide private/public scope, timing model, latency budget, pause/disconnect
  rules, ranking, rewards, regions, moderation, retention, and cost ceiling.
- **Unblocks:** the local two-client coordinator prototype. It does not
  authorise a production backend or public matchmaking.

## Completed owner actions

### IN-001 — Complete the V2 owner questionnaire

- **Status:** DONE 2026-07-31
- **Outcome:** All 44 answers are reconciled in
  `docs/v2-release-spec.md#7-owner-questionnaire-reconciliation`.

### IN-002 — Choose the first personal playtest milestone

- **Status:** DONE 2026-07-31
- **Outcome:** One polished Quick Fight comes first. The fixed-seed target is
  `v2.viking-acceptance` in `docs/v2-release-spec.md#33-battle`.

### IN-003 — Decide the Move category direction

- **Status:** DONE 2026-07-31
- **Outcome:** Keep one original primary category label with secondary effects
  explained in copy/report; do not copy source surface terminology.

### IN-004 — Assign world, Story, and lore authorship

- **Status:** DONE 2026-07-31
- **Outcome:** Agents author extensive deliberate drafts in the adult dark-comedy
  direction; owner corrections are review feedback. `docs/game-design.md#3-world-and-first-cast`
  owns the rule.

### IN-005 — Choose the review-package policy

- **Status:** DONE 2026-07-31
- **Outcome:** Packages are contextual. Each ready artefact names the useful
  review format; there is no speculative global preference.

### IN-006 — Ratify V2 scope and roadmap split

- **Status:** DONE 2026-07-31
- **Outcome:** The existing V2–V2.4 allocation is correct. The programme
  contract is ratified; release proof and freeze remain open.

### IN-011 — Review Main Menu mock-up batch 01

- **Status:** DONE 2026-07-31
- **Outcome:** Variant A is a useful hypothesis, but the batch did not satisfy
  the intended real-application screenshot-led process. No launcher layout was
  approved; the agent must prepare a dedicated replacement batch before asking
  again.
