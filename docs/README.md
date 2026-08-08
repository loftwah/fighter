# LOFTWAH FIGHTER documentation

This is the front door to the project documentation. Start with the release
contract for scope, the game design for rules, and the technical design for
architecture. Historical research informs those documents but does not
override them.

## Start here

| If you need to understand…                             | Read                                                      |
| ------------------------------------------------------ | --------------------------------------------------------- |
| What V2 must contain before it can freeze              | [V2 release specification](v2-release-spec.md)            |
| What agents should execute next                        | [V2 continuation programme](v2-continuation-programme.md) |
| What belongs in V2.1 through V2.3                      | [Release roadmap](release-roadmap.md)                     |
| Where the product may evolve after the fighter proof   | [Platform direction](platform-direction.md)               |
| How the game plays                                     | [Game design](game-design.md)                             |
| How the application is built                           | [Technical design](technical-design.md)                   |
| How production startup transfer is measured            | [V2 performance baseline](v2-performance-baseline.md)     |
| How every fight is selected, reviewed, and launched    | [Match-launch flows](match-launch-flows.md)               |
| How the implemented interface should look and behave   | [`DESIGN.md`](../DESIGN.md)                               |
| How interface and combat icons are sourced             | [Icon system](icon-system.md)                             |
| The public name, domain, landing page, and site claims | [Brand and site](brand-and-site.md)                       |
| Where each view lives                                  | [View inventory](view-inventory.md)                       |
| Which views are awaiting composition review            | [View mock-up programme](view-mockup-programme.md)        |
| What Dean needs to answer or review                    | [`IN-TRAY.md`](../IN-TRAY.md)                             |
| What agents have prepared                              | [`OUT-TRAY.md`](../OUT-TRAY.md)                           |

## Authority order

1. [V2 release specification](v2-release-spec.md) owns V2 scope, acceptance,
   and freeze.
2. [Release roadmap](release-roadmap.md) owns later milestone scope.
3. [Platform direction](platform-direction.md) preserves long-term strategic
   intent but cannot create release scope or implemented architecture.
4. [Game design](game-design.md) owns player-facing rules.
5. [Technical design](technical-design.md) owns architecture and persistence.
6. [`DESIGN.md`](../DESIGN.md) owns the implemented visual system.
7. [Brand and site](brand-and-site.md) owns public naming, domain, landing-page
   truth, and promotional presentation.
8. [Specification alignment](specification-alignment.md) records adopted,
   deferred, and rejected imported requirements.
9. [V2 source ledger](v2-source-ledger.md) preserves provenance and archive
   retrieval.

If two documents disagree, update the lower-authority document or record an
explicit design change. Do not average contradictory rules.

## Build and author content

- [Content authoring](content-authoring.md) — data contracts for Characters,
  Moves, Stories, Missions, Tournaments, and Trophies.
- [Art brief template](art-brief-template.md) — required text ownership,
  mirroring, safe-area, prompt, and review fields for bitmap production.
- [Launch-roster functional calibration](launch-roster-calibration.md) — the
  six source-role-equivalent kit targets and their V2 acceptance status.
- [Launch-roster art production](launch-roster-art-production.md) — approved
  source-to-runtime artwork pipeline.
- [Tournament Trophy art production](trophy-art-production.md) — unique and
  reusable Trophy artwork.
- [Promotional art production](promotional-art-production.md) — landing,
  release, social-preview, and store-listing artwork.
- [Landing-page composition study](landing-page-comps.md) — retained mock-ups,
  exact generation prompts, and the current owner decision.
- [View mock-up programme](view-mockup-programme.md) — batched desktop/mobile
  composition reviews before production implementation.
- [Batch 01: Main Menu](mockup-batches/batch-01-main-menu.md) — three launcher
  variants, visibility rules, trade-offs, and owner questions.
- [Multiplayer seam](multiplayer-seam.md) — optional unscheduled seam research;
  not part of the committed programme.
- [Audio plan](audio-plan.md) — current music, SFX/dialogue runtime, and fallback policy.
- [Audio bible](audio-bible.md) — selected SFX/dialogue direction and safe ElevenLabs production workflow.
- [Gameplay demo capture](demo-capture.md) — reproducible 1080p browser
  recording and music-mixed social delivery workflow.
- [Visual direction V2](visual-direction-v2.md) — retained direction evidence
  beneath the implemented `DESIGN.md` authority.

## Decisions and evidence

- [Application structure audit](application-structure-audit.md)
- [Web/Phaser/domain boundary](decisions/0001-web-phaser-domain-boundary.md)
- [Local-first, no required backend](decisions/0002-local-first-no-backend.md)
- [Imported-specification reconciliation](decisions/0003-imported-specification-reconciliation.md)
- [Superseded: multiplayer as the final milestone](decisions/0004-multiplayer-last.md)
- [Multiplayer has no committed milestone](decisions/0005-multiplayer-uncommitted.md)
- [Reference-game functional audit](reference-game-functional-audit.md)
- [Reference-game battle parity](reference-game-battle-parity.md)
- [Art-direction discovery](art-direction-discovery.md)
- [Art-direction questionnaire](art-direction-questionnaire.md)

The reference audits are research inputs, not public copy or a licence to copy
protected names, characters, writing, artwork, or branding.

## Historical material

[Implementation plan](implementation-plan.md) and
[MVP artwork plan](mvp-artwork-plan.md) describe earlier delivery stages.
They remain useful provenance but do not set current scope. Use the
[V2 source ledger](v2-source-ledger.md) before deleting, rewriting, or
re-asking historical material.

## Documentation quality rule

Every maintained document must state its purpose or status, link to the
authority it depends on, use Australian English, and avoid repeating facts
that already have a canonical owner. A gameplay-rule change updates the game
design, code/content schema, and tests together. An architecture change updates
the technical design and a decision record when the trade-off is durable.
