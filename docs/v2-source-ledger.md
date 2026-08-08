# V2 source and archive ledger

Status: **AUTHORITATIVE PRESERVATION AND TRACEABILITY INDEX**

Created: 2026-07-31

V2 is a consolidation milestone, not permission to throw away the work that led
to it. This ledger keeps historical evidence useful without allowing an older
idea to silently replace a newer decision.

## Archive rule

When `docs/v2-release-spec.md` is ratified:

- the accepted V2 authorities and release evidence form the active baseline;
- older conversations, audits, briefs, prompts, questions, screenshots, and
  prototype plans are classified as archive evidence;
- archive evidence remains in the repository or Git history and remains
  searchable;
- archived claims are implemented only after they are adopted into an
  authority;
- no source mechanic disappears without a recorded status;
- superseded implementation plans are retained for rationale, not followed as a
  current backlog.

Archive status is semantic. Files do not need to be physically moved when doing
so would break useful links or obscure history.

## Evidence flow

```text
historical conversation and research
              ↓
mechanic registry and source ledger
              ↓
adopt / adapt / defer / reject / already covered / unresolved
              ↓
authoritative design and V2 release contract
              ↓
content schema, code, tests, review evidence, release tag
```

## Preserved sources

| Source                                              | What it contributes                                                                                                                                                                                                            | V2 handling                                                                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conversation.txt`                                  | Original product discussion, preferences, feedback, and reasoning                                                                                                                                                              | Preserved as searchable historical input. Current terminology is cleaned; original wording remains in Git history.                                                                      |
| `walkthrough-questions.md`                          | Consolidated walkthrough and approximately 190 prior answers                                                                                                                                                                   | Consult before asking the owner a new question. Adopted decisions belong in the authorities.                                                                                            |
| `questions-2.md` and `alignment.md`                 | Earlier inventories and reconciliation work                                                                                                                                                                                    | Archive evidence. Do not treat unchecked items as requirements.                                                                                                                         |
| `v2-brief/fighter-v2-owner-questionnaire.md`        | Completed owner decisions and delegated evidence calls                                                                                                                                                                         | Reconciled 2026-07-31 through `docs/v2-release-spec.md` section 7. Preserved as owner input; no longer an active question queue.                                                        |
| `v2-brief/reference-game-mechanic-registry-v2.json` | Machine-readable candidate-mechanic inventory                                                                                                                                                                                  | Every item must retain an explicit disposition and evidence trail.                                                                                                                      |
| `v2-brief/reference-game-mechanics-audit-v2.md`     | Detailed observed/researched mechanics                                                                                                                                                                                         | Evidence, not direct authority. Use it to avoid losing behavioural depth.                                                                                                               |
| `v2-brief/ultimate-reference-equivalent-spec-v2.md` | Broad equivalent-system proposal                                                                                                                                                                                               | Source inventory and design comparison. Conflicts are resolved through the current authorities.                                                                                         |
| `v2-brief/v2-research-changelog.md`                 | Research corrections and provenance                                                                                                                                                                                            | Preserve with the research set.                                                                                                                                                         |
| `docs/reference-game-battle-parity.md`              | Battle-focused implementation comparison                                                                                                                                                                                       | Maintain as a gap register until every relevant item is dispositioned.                                                                                                                  |
| `docs/reference-game-functional-audit.md`           | Whole-product comparison                                                                                                                                                                                                       | Maintain as a mode and system coverage register.                                                                                                                                        |
| `docs/specification-alignment.md`                   | Adopted, deferred, and deliberately rejected requirements                                                                                                                                                                      | Authoritative decision ledger for imported specification material.                                                                                                                      |
| Owner-supplied product-quality attachment           | Reusable screen, component, asset, optimisation, accessibility, and release review passes                                                                                                                                      | Adopted into the V2 release gates and project quality doctrine. The portable repository record is this ledger plus the V2 contract.                                                     |
| Owner scope session, 2026-08-07 (current task)      | Corrected Profile/Story ownership, shared Lineup entry, Tournament repeat deployments, Trophy provenance, Story steps, and removal of committed multiplayer                                                                    | Adopted into `docs/game-design.md`, `docs/technical-design.md`, `docs/v2-release-spec.md`, `docs/release-roadmap.md`, and Foundation Packet F00 in `docs/v2-continuation-programme.md`. |
| Owner platform-direction session, 2026-08-08        | Evolution from one white-label fighter towards a constrained AI-operated product line; brief-driven creation, research/lore, generated media, web canaries, commercial options, product lifecycle, and controlled fleet uplift | Preserved in `docs/platform-direction.md`; guarded unversioned proofs are recorded in `docs/release-roadmap.md`. It does not alter V2 scope or commit speculative architecture.         |
| Git history                                         | Original filenames, wording, experiments, and replaced implementations                                                                                                                                                         | Permanent retrieval layer; never rewrite merely to make the current tree look cleaner.                                                                                                  |

## No-loss rule

Before V2 freezes, the release review must establish that:

1. every mechanic-registry item has a disposition;
2. each still-relevant historical owner instruction is either represented by an
   authority, marked superseded, or assigned to a later milestone;
3. every questionnaire answer has an adoption record;
4. each deliberate difference from the reference research is documented rather
   than accidental;
5. deferred ideas identify a destination milestone or state why they have no
   current release value.

This rule protects useful research. It does not require copying another
product's names, writing, characters, art, exact UI, or protected audiovisual
material into the release.

## Gate 0 reconciliation record

Gate 0 completed on 2026-07-31 with these retrieval anchors:

- questionnaire decisions: `docs/v2-release-spec.md#7-owner-questionnaire-reconciliation`;
- all 117 mechanic dispositions and proof columns:
  `v2-brief/reference-game-mechanic-registry-v2.json`;
- deliberate retained differences: `docs/specification-alignment.md`;
- fixed-seed first fight: `src/dev/v2-acceptance.ts` and
  `src/dev/v2-acceptance.test.ts`;
- stale owner/agent queue corrections: `IN-TRAY.md` and `OUT-TRAY.md`.

The questionnaire's repeated source-equivalence answers are interpreted as a
request for materially similar decisions under original terminology and
presentation. They do not convert uncertain source formulas or protected
expression into requirements.

The first Gate 1 correction applied that rule to Viking. A working calibration
had promoted the misleading label `Shields Up` and paired it with obsolete
shield-bash presentation. The authoritative player label is now `Battle
Boast`; the stable `action.viking.shield-bash` and presentation IDs remain only
as compatibility anchors. The three-Move behaviour mapping is preserved in
`docs/launch-roster-calibration.md`, while reference labels remain in the
historical research trail rather than the shipped vocabulary.
