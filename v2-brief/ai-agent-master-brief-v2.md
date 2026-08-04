# Master AI Agent Brief — Build loftwah/fighter V2

Paste the prompt below into a fresh Codex task opened at the repository root.

---

You are taking over `/Users/deanlofts/gits/fighter` to move
**loftwah/fighter V2** from its current playable vertical slice to an excellent,
original collectible squad battler.

Your goal is systematic capability coverage, balance, readability, feel, and
content-authoring leverage—not a blind rewrite and not a one-for-one copy of
protected content.

## Authority and evidence

Read `AGENTS.md` first. Then read these authorities in order:

1. `docs/v2-release-spec.md` — V2 scope, release gates, and freeze contract;
2. `docs/release-roadmap.md` — strict later-milestone boundaries;
3. `docs/game-design.md` — product and gameplay rules;
4. `docs/technical-design.md` — architecture;
5. `DESIGN.md` — implemented visual system;
6. `docs/specification-alignment.md` — adopted, deferred, and rejected imported
   requirements.
7. `docs/v2-source-ledger.md` — historical preservation and traceability.

Then read:

- `v2-brief/fighter-v2-owner-questionnaire.md`;
- `IN-TRAY.md`;
- `OUT-TRAY.md`;
- `v2-brief/reference-game-mechanic-registry-v2.json`;
- `v2-brief/reference-game-mechanics-audit-v2.md`;
- `v2-brief/ultimate-reference-equivalent-spec-v2.md`;
- `v2-brief/v2-research-changelog.md`;
- `docs/reference-game-functional-audit.md`;
- `docs/reference-game-battle-parity.md`;
- recent relevant tests and implementation.

The imported V2 research is evidence and a completeness checklist, not
authority. Never replace an implemented authoritative rule with an imported
proposal merely because the imported document calls it locked or equivalent.
Dates, tests, and current code help interpret history, but they do not outrank
the authorities. Archive status never means that research should be deleted or
ignored: every relevant candidate mechanic needs an explicit disposition.

Do not reintroduce direct external-game naming, protected names, branded
examples, art, dialogue, audio, or UI assets. Use `reference game` only when a
neutral research comparison is genuinely necessary. The product identity is
`loftwah/fighter`; its first intended release is V2.

## Product shape that is already settled

- Story, Quick Fight, and Tournament are explicit modes.
- There is no walkable map or exploration layer.
- Every mode creates a configuration for one deterministic combat engine.
- Every player-facing fight uses the same Character-selection and confirmation
  contract, adapted to the mode's ownership and roster rules.
- Battle supports one to three Characters per side, one active per side,
  switching, side-owned Charge, three Moves per Character, visible opposing
  resources, seeded outcomes, and forgiving failure.
- Player Health and Charge form one lower console. Opponent Health and Charge
  form one upper console. All deployed Characters and their Health remain
  visible at the edges.
- The player's Move-and-Charge field is the primary decision surface; the
  opposing Charge rail and Move thresholds are nearly as legible.
- The fight feed sits immediately below the player's Charge Strip.
- Every Move declares one primary tactical category. The inner band and label
  show Normal/Tier 1/Tier 2; the outer band and label show Attack, Team attack,
  Stun, Team stun, Support, Team support, Charge control, or Special. Pause owns
  the shared key, and colour is never the only carrier.
- Content is data. New Characters, Moves, locations, stories, encounters,
  tournaments, missions, shops, and Accessories must not need new renderer or
  combat branches.
- Opaque rectangular/square art, two-frame swaps, and Kinetic Panel Motion are
  the presentation language.
- Local-first saves, explicit seeds, stable logical asset IDs, semantic DOM
  controls, keyboard/touch support, reduced motion, and independent audio
  preferences are non-negotiable.
- Tier 1 platforms are current mobile browsers in portrait and landscape plus
  the iPhone 14 and 16-inch 2024 MacBook Pro physical references.
- V2 ships six Characters as a responsive website. Twenty Characters, broader
  Story/Tournament content, produced SFX, and PWA installation belong to V2.1;
  accounts and cloud saves belong to V2.2; native iOS/Android packaging belongs
  to V2.3; server-authoritative multiplayer belongs last at V2.4.

## How to handle unanswered owner decisions

Do not repeat questions already answered by the repository. Do not invent a
material rule that remains unanswered in
`v2-brief/fighter-v2-owner-questionnaire.md`.

If an unanswered decision blocks the chosen milestone:

1. prepare two or three concrete, testable options;
2. add one concise item to `IN-TRAY.md`;
3. continue safe work that does not prejudice the decision.

Owner lore work is not automatically urgent. First ask which parts the owner
wants to write; prepare small reviewable briefs for everything else.

## Systematic programme

Maintain one mechanic coverage registry. Every researched capability receives
exactly one status:

- `ADOPT`;
- `ADAPT`;
- `REPLACE`;
- `DEFER`;
- `REJECT`;
- `RESEARCH`.

For an adopted or adapted mechanic, track these proof columns:

- authoritative rule;
- schema/content vocabulary;
- deterministic domain implementation;
- AI use and counterplay;
- player-facing UI and explanation;
- save/migration impact;
- accessibility;
- content example;
- automated tests;
- fixed-seed playable scenario;
- local diagnostic or report evidence.

Never mark a mechanic complete because a document mentions it. Mark it complete
only when the required proof exists.

Work in vertical gates:

### Gate 0 — Reconcile

- Inspect the dirty worktree and preserve unrelated work.
- Reconcile accepted questionnaire answers into the authorities.
- Update the registry statuses.
- Choose one fixed-seed V2 acceptance matchup and record its intended feel,
  duration, first-decision timing, and loss explanation.

### Gate 1 — Battle understanding

- Make one representative fight readable, fair, and satisfying before adding
  broad capability.
- The player must understand both Charge races, ready windows, active and bench
  Health, Move category/tier, predicted output, statuses, interruptions,
  switches, damage causes, and defeat.
- Tune with deterministic replays and evidence, not intuition alone.

### Gate 2 — Capability grammar

- Implement the highest-priority missing reusable effect, trigger, targeting,
  lifecycle, hazard, Drop, Accessory, and AI families.
- Add representative content only after the reusable mechanic exists.
- Reject character-specific engine branches.

### Gate 3 — Builds and progression

- Prove level growth, stat allocation, Move positions, Move tiers,
  Modifications, duplicates, rewards, and rematches as one understandable loop.
- Preserve migrations and forgiving progression.

### Gate 4 — Mode parity

- Prove the shared setup and battle contract in Quick Fight, Story, and
  Tournament.
- Keep mode-specific persistence, rewards, roster locks, recovery, and
  progression outside the combat engine.

### Gate 5 — Content factory

Create validated, documented templates for:

- Character and complete three-Move kit;
- location and registered asset package;
- encounter and fixed-seed acceptance scenario;
- Story chapter/node graph;
- Tournament and interludes;
- mission, reward, Store entry, Accessory, and Modification;
- complete installable content pack.

Each template must include stable IDs, schema validation, rights/provenance,
asset fallbacks, AI compatibility, accessibility copy, tests, and a preview or
dry-run command. An agent should be able to add ordinary content without
editing a renderer or domain switch.

### Gate 6 — V2 release proof

- Run bounded gameplay, UX, visual, performance, accessibility, and production
  passes.
- Satisfy every gate in `docs/v2-release-spec.md`.
- Validate physical iPhone 14 portrait/landscape and the 16-inch 2024 MacBook
  Pro desktop reference.
- Produce a fixed-seed review package and an honest remaining-gap ledger.
- Do not pull V2.1–V2.4 features into V2 merely because the later architecture
  has been documented.

## Engineering and quality rules

- Enter through `mise`; use the pinned Node and pnpm versions.
- Domain gameplay modules do not import Phaser.
- Random behaviour uses an explicit seed.
- One fact has one authority. Extend before creating, reuse before duplicating,
  and generalise before specialising.
- Tests are production code. Every test must protect a stable contract for a
  named beneficiary; confidence matters more than test count.
- Comments explain why, not what.
- Keep changes inspectable, traceable, and reproducible through semantic events,
  deterministic reports, and fixed-seed scenarios.
- Use Australian English in player-facing copy and documentation.
- Use asset tasks rather than overwriting approved generated assets.
- Run `mise run check` before handoff.

## Working protocol

At the start of each implementation slice:

1. state the player problem and acceptance evidence;
2. name the authoritative rules and registry rows;
3. inspect before editing;
4. write or update the contract test;
5. implement the smallest complete vertical slice;
6. render and play it at representative desktop and mobile widths;
7. update authority, schema, registry, and evidence together when a rule
   changes.

At handoff:

- lead with the player-visible outcome;
- state what is complete, partial, mocked, deferred, or rejected;
- list tests and fixed-seed scenarios run;
- update `OUT-TRAY.md` with the review package;
- add only genuine owner actions to `IN-TRAY.md`;
- never claim capability coverage for an `UNKNOWN EXACT` value.

Start by reporting the current authority conflicts, accepted questionnaire
answers, highest-risk missing proof, and the single recommended next V2 gate.
Then proceed unless a genuinely material owner decision blocks it.

---
