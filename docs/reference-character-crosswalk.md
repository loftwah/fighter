# Internal reference-character crosswalk

Status: **AUTHORING CONTROL — NOT PLAYER-FACING**

Last reviewed: 2026-08-04

This is the retained Teeny Titans 2 research crosswalk for functional roster
calibration. It records which source Character supplies the decision reference;
it does not authorise copying names into the game, dialogue, visual designs,
art, audio, exact values, or UI expression.

The implementation must preserve materially similar battle decisions while
using LOFTWAH FIGHTER's own Character, Move, fiction, presentation and balance.
`src/content/character-calibration.ts` makes coverage and one-to-one assignment
machine-checkable. `src/combat/launch-roster-calibration.test.ts` proves the
signature mechanics in seeded battles.

## Original six

| LOFTWAH FIGHTER | Teeny Titans 2 functional reference | Required decision identity                                                     |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| Viking          | Robin                               | Stack next-Move Power → dependable returning hit → strongest hit plus Stun     |
| Grim Reaper     | Beast Boy                           | Bounded transformation → personal boon → whole-Lineup attack                   |
| Humpty Dumpty   | Silkie                              | Shield with end value → surprise boon → timed reflection                       |
| Moses           | Raven                               | Charged Strip slow → direct control hit → complete Move-kit disable            |
| Ned Kelly       | Starfire                            | Charged blast → Lineup healing → team Charge acceleration                      |
| Tux             | Cyborg                              | Health-for-Charge battery → disruptive shot → multi-hit percentage Strip drain |

## Twenty-Character expansion control

V2.1 adds fourteen rows rather than treating “twenty Characters” as an
unstructured content target. Before production art or balance work begins, each
new row must record:

1. one unused source Character and the evidence for its three-Move rhythm;
2. the three decisions the player should recognise;
3. the reusable engine effects and tier properties required;
4. an explicit adaptation for any behaviour we cannot or should not reproduce;
5. an original Character identity, Move writing and visual brief;
6. deterministic Stock, Tier 1 and Tier 2 behaviour tests;
7. at least one Standard-build matchup simulation against every Combat Type;
8. HUD preview, status, AI valuation and Battle Report coverage.

Adding a playable Character without a unique entry in
`characterCalibrations` fails the content test. That turns the reference into a
repeatable authoring gate rather than research we have to rediscover later.

| Expansion slot | Original Character | Unused source reference | Evidence | Adaptation | Tests |
| -------------- | ------------------ | ----------------------- | -------- | ---------- | ----- |
| 07             | To author          | To assign               | Open     | Open       | Open  |
| 08             | To author          | To assign               | Open     | Open       | Open  |
| 09             | To author          | To assign               | Open     | Open       | Open  |
| 10             | To author          | To assign               | Open     | Open       | Open  |
| 11             | To author          | To assign               | Open     | Open       | Open  |
| 12             | To author          | To assign               | Open     | Open       | Open  |
| 13             | To author          | To assign               | Open     | Open       | Open  |
| 14             | To author          | To assign               | Open     | Open       | Open  |
| 15             | To author          | To assign               | Open     | Open       | Open  |
| 16             | To author          | To assign               | Open     | Open       | Open  |
| 17             | To author          | To assign               | Open     | Open       | Open  |
| 18             | To author          | To assign               | Open     | Open       | Open  |
| 19             | To author          | To assign               | Open     | Open       | Open  |
| 20             | To author          | To assign               | Open     | Open       | Open  |
