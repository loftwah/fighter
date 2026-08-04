# Mock-up batch 01 — Main Menu / mode launcher

Status: **READY FOR OWNER REVIEW**

Created: 2026-07-31

Images:

- [Variant A — Hero Bill + Mode Stack](../../.impeccable/mocks/view-batches/batch-01-launcher/variant-a-hero-bill-mode-stack.png)
- [Variant B — Three Equal Fight Bills](../../.impeccable/mocks/view-batches/batch-01-launcher/variant-b-equal-fight-bills.png)
- [Variant C — Roster Command Table](../../.impeccable/mocks/view-batches/batch-01-launcher/variant-c-roster-command-table.png)

Generation mode: built-in image generation with the approved six-fighter
roster source as the identity reference and the retained Fight Bills landing
study as a visual-system reference. The generated images are comparison
material, not production assets.

## View packet

### Identity and job

- Route: global Main Menu.
- Status: implemented; composition remains open for V2.
- Visitor mode: Operate.
- Player situation: the application has finished its optional intro/loading
  sequence and no Story, Quick Fight, or Tournament session has been started by
  this render.
- Job: deliberately choose which kind of game to play and understand what that
  choice will persist or reward.
- Success: the player can distinguish all three modes and start or resume the
  intended one without opening another page for basic explanation.

### Entry and exit

Entry:

- startup completes;
- the wordmark is activated from another global view;
- a player explicitly exits Story, Quick Fight, or Tournament;
- a battle/result returns to the launcher.

Exits:

- Story Mode setup/session;
- Quick Fight setup;
- Tournament lobby;
- Profile;
- Achievements;
- Settings.

Rendering alone must not create a mode session, start music, change the selected
profile, claim a reward, or mutate progression.

### Visibility contract

Always visible:

- `LOFTWAH FIGHTER`;
- selected Collector identity;
- `Story Mode`, `Quick Fight`, and `Tournament`;
- the consequence of each mode:
  - Story owns progression and rewards;
  - Quick Fight Standard Build is progression-neutral;
  - Tournament is a multi-round Trophy run;
- one direct action for each visible mode or one selected-mode action when the
  composition explicitly uses selection first;
- Profile, Achievements, and Settings.

Conditional:

| Information/action         | Visible when                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `Continue Story`           | the selected Profile has an active or replayable Story                        |
| `Start Story`              | the selected Profile has not started the default Story                        |
| Story completion/post-game | the Story completion requirements are met                                     |
| `Resume Tournament`        | a valid run is active                                                         |
| Trophy owned/available     | the selected Tournament has a registered Trophy and Profile ownership differs |
| Achievement notification   | one or more newly derived awards remain unacknowledged                        |
| Storage warning            | local data recovery needs explicit attention                                  |
| Developer Lab              | development build only; separate from the three player-facing modes           |

Excluded:

- Story-only Collection, Store, and Missions;
- Lineup editors and Character statistics;
- battle Health, Charge, Moves, matchup, and event feed;
- account, multiplayer, monetisation, adverts, and news;
- release roadmap or marketing copy.

### Content ranges and states

- Exactly three player-facing modes in V2.
- Three local Profiles exist, but only the selected Collector summary belongs
  on the launcher.
- First run has `Start Story`, no resumable Tournament, no Trophy ownership, and
  may have no Achievements.
- Returning state may have a Story continuation, completed Story, active
  Tournament, Trophy ownership, and newly unlocked Achievements.
- Loading and storage recovery interrupt before the launcher becomes operable;
  they do not appear as ordinary mode bills.

### Tier 1 layout constraints

- Complete at `1728 × 1117` desktop and `390 × 844` iPhone portrait without
  ordinary page scrolling.
- Touch controls remain at least 44 CSS pixels.
- Desktop can show explanatory consequence text and larger art.
- Mobile removes decorative area before explanation or actions.
- Global mobile navigation may be a fixed bottom rail when it does not collide
  with browser safe areas.
- Keyboard focus order follows the visual choice order and never moves because
  a mode becomes selected.

### Opportunities to evaluate

- a truthful one-line resume marker for the current Story node;
- a Trophy preview only when it increases Tournament comprehension or desire;
- a compact selected-Profile portrait;
- a single new-Achievement count;
- a context-sensitive `Continue` action only if it never obscures the three
  explicit mode identities;
- a short local-save reassurance in first-run onboarding, not permanent chrome.

Avoid turning these into launcher metrics. Every addition must improve the mode
decision.

## Variant A — Hero Bill + Mode Stack

Desktop gives Story roughly two-thirds of the working area. Quick Fight and
Tournament remain complete bills in a right-hand stack. Mobile keeps all three
mode actions simultaneously visible, with Story as the larger first choice.

Strength:

- fastest path to the progression mode;
- all three mobile actions remain one-tap and visible;
- best room for explaining Story resume state.

Risk:

- visually declares Story more important than sandbox play;
- repeated Collector identity in the generated desktop comp should not be
  literalised.

## Variant B — Three Equal Fight Bills

Desktop gives all modes equal columns. Mobile uses visible mode tabs, one
selected preview, and one confirmation action.

Strength:

- clearest separation and equal status on desktop;
- easiest composition to extend with mode-specific art;
- mobile density stays calm.

Risk:

- mobile becomes a two-step choice;
- the non-selected modes expose less consequence information;
- narrow mode titles need careful real typography.

## Variant C — Roster Command Table

The six-fighter ensemble is the emotional focal point. Mode selection acts as a
command strip beneath it; one selected consequence panel and action changes
without starting the session.

Strength:

- feels most like opening a game rather than reading a launcher;
- reuses one strong roster asset instead of three independent illustrations;
- desktop and mobile share the same hierarchy cleanly.

Risk:

- mobile is still a two-step selection;
- art receives more space than explanation;
- the generated progress dots and extra icons are exploratory opportunities,
  not accepted requirements.

## Prompt manifest

All three prompts shared:

- the complete View packet above;
- two flat canvases on one `1536 × 1024` comparison board;
- a 16:10 MacBook browser view and an iPhone 14 portrait view;
- the registered roster source as identity reference;
- indigo archive board, chalk/aged stock, tomato, acid yellow, condensed
  fight-poster display type, Atkinson-like readable UI type, heavy registration
  borders, perforation and restrained wear;
- no scroll, rounded dashboard cards, pills, glass, neon HUD, gradients,
  developer tools, fake product features, or marketing layout;
- exact primary labels and clean rule lines instead of invented prose.

Variant-specific prompt deltas:

| Variant | Desktop direction                                                        | iPhone direction                                                          |
| ------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| A       | dominant Story bill plus stacked Quick Fight and Tournament              | Story larger; all three complete action strips visible                    |
| B       | three equal tall mode bills                                              | three visible tabs; one selected full preview; `1 OF 3` and previous/next |
| C       | roster art dominates; three adjacent mode tabs and one consequence strip | roster art top 42%; three selector tabs; one consequence row and full CTA |

Exact requested labels:

```text
LOFTWAH FIGHTER
COLLECTOR: PLAYER
STORY MODE
CONTINUE STORY
PROGRESSION • REWARDS
QUICK FIGHT
START QUICK FIGHT
STANDARD BUILD • NO PROGRESSION
TOURNAMENT
ENTER TOURNAMENT
THREE ROUNDS • TROPHY
PROFILE
ACHIEVEMENTS
SETTINGS
1 OF 3
```

The individual generated prompt text remains recoverable from this shared
manifest plus each variant delta; no unrecorded visual requirement should be
inferred from rendering accidents.

## Owner review

Answer questionnaire Q42–Q44 or annotate this file:

1. Choose A, B, C, combine named parts, reject all, or defer.
2. Say whether iPhone should keep all three direct actions visible or use
   selection-then-confirm.
3. Name any optional launcher information worth carrying forward and anything
   shown here that should never appear.

No implementation is authorised by a preference alone. The selected direction
is first reconciled into `DESIGN.md`, `docs/view-inventory.md`, and the launcher
surface brief.
