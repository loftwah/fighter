# LOFTWAH FIGHTER V2 owner questionnaire

**Status:** COMPLETE OWNER INPUT — RECONCILED 2026-07-31

Every answer is dispositioned in
`docs/v2-release-spec.md#7-owner-questionnaire-reconciliation`. Original owner
wording remains here as historical evidence; product-facing rules use the
repository's neutral terminology.

**Purpose:** capture only the product decisions that the current repository,
recent design work, and implemented game cannot settle safely.

This is an owner input, not a second game-design document. Short answers are
enough. Skip anything you do not care about yet; `DEFER` is a valid answer.
Agents must reconcile accepted answers into the authoritative documents before
changing an established rule.

Useful answer labels:

- **KEEP** — keep the current implemented rule.
- **CHANGE** — replace it with the answer given.
- **TEST** — prepare two or more named variants for a playtest.
- **DEFER** — not needed for V2.
- **NO** — deliberately exclude it.

## Already resolved — do not ask again

These decisions are already supported by recent owner direction, authoritative
documents, or implemented contracts:

- The player-facing V2 title is **LOFTWAH FIGHTER**. The repository remains
  `loftwah/fighter`, the slash is not displayed in the game title, and the
  canonical public home is `fighter.loftwah.com`.
- The first intended release is **V2**.
- V2 ships with the initial six Characters. V2.1 expands the release roster to
  twenty.
- V2 is a responsive mobile-first website. V2.1 adds PWA installation, V2.2
  adds accounts and cloud saves, V2.3 proves iOS and Android development shells
  built from the shared web/game codebase, and V2.4 is the final currently
  planned feature milestone for multiplayer. Public app-store distribution can
  follow V2.3 when the game and developer memberships are ready.
- V2 is the feature-freeze baseline. Older conversations, research, and
  specifications remain preserved evidence but cannot silently override the
  ratified V2 authorities.
- The game has Story, Quick Fight, and Tournament modes; it does not use a
  walkable map.
- Every Tournament has one illustrated Trophy. First victory adds it to the
  selected Profile; custom Tournaments can use registered generic Trophy art.
- A Story completes only when all of its required Missions and Tournaments are
  complete. Quick Fight is the unrestricted end-game sandbox after completion,
  not a separate fourth mode.
- All fight modes share one Character-selection and fight-confirmation
  interaction contract.
- Battle is a real-time 3v3 Lineup fight with one active Character per side.
- Both active Health and Charge belong in one readable console per side.
- The player's Move-and-Charge field is the primary control surface. The enemy
  Charge rail and thresholds must be almost as legible.
- All six deployed Characters remain edge-visible, with Health. Their three
  Moves and tiers are inspectable during battle.
- The bounded fight feed sits immediately beneath the player's Charge Strip.
- Every Move has three visible upgrade states: Normal, Tier 1, and Tier 2.
- Move tiers may add authored qualitative properties as well as numeric output
  when that property is part of the calibrated kit. Viking's returning axe
  becoming undodgeable at Tier 1 is the first accepted example.
- Viking is the default forgiving leader and first balance benchmark. The
  other five launch Characters each own one source-role-equivalent calibration
  target in `docs/launch-roster-calibration.md`.
- The Character level cap is 25. Permanent allocated stats are Vitality, Power,
  Evasion, Fortune, and Tempo; Defence remains temporary battle state.
- Stat points can be reallocated freely outside active fights and Tournaments.
- Move placement uses the nine Low/Centre/High positions across three cost
  bands. Reordering, position tuning, and Move enhancement unlock at level 10.
- A combat-ready Character has all three Moves. One selected matching duplicate
  advances one Move by one tier.
- Every Move also declares one primary tactical category. Its inner band shows
  tier; its outer band and text label show the category. The pause key explains
  both without relying on colour alone.
- The Charge range remains 0–100 and must use that space legibly through scale
  marks, thresholds, values, and fill speed.
- Story failure is forgiving. Difficulty cannot gate story progress or punish
  the player for changing it.
- Content is data. New Characters, Moves, stories, encounters, tournaments,
  shops, and missions must not require bespoke renderer or combat branches.
- Combat is deterministic under an explicit seed and should be replayable and
  inspectable.
- The product is local-first. Backend accounts, multiplayer, monetisation,
  energy systems, and mobile packaging are outside V2 without a separate
  accepted design change.
- Rectangular or square opaque artwork, two-frame swaps, and Kinetic Panel
  Motion are the presentation language.
- Core controls remain semantic DOM controls with keyboard, touch, reduced
  motion, visible-label, and independent audio support.
- Tier 1 targets are modern mobile browsers in portrait and landscape plus the
  16-inch MacBook Pro desktop reference. Other desktops and tablets are Tier 2.
- Nothing is added by default: extend before creating, reuse before duplicating,
  and generalise before specialising.
- Documentation, tests, telemetry, and assets must each have an explicit owner
  and purpose. One fact has one authority.

## 1. V2 outcome and scope

### Q01 — What must a player say after their first good V2 session?

One sentence is ideal. This is the emotional definition of success.

**Answer:**

That was actually pretty fun.

### Q02 — Rank the four V2 outcomes

Rank `1` (most important) to `4`:

- battle feel and readability;
- build/progression depth;
- content breadth and replayability;
- fast AI-assisted content authoring.

**Answer:**

No preference. I just want this done, and done as well as it can be.

### Q03 — What is explicitly not required for the first V2 release?

**Status:** PARTIALLY ANSWERED AND ADOPTED 2026-07-31

**Answer:** More than six release Characters, substantial Story and Tournament
content breadth, produced SFX, PWA installation, accounts, cloud saves,
multiplayer, and native applications must not delay V2. These are assigned to
later milestones in `docs/release-roadmap.md`; multiplayer is deliberately last
at V2.4, while public app-store distribution may follow V2.3. Add any other
tempting exclusions that matter to you.

I don't know. I thought I answered this. You already have this right with the versions and what comes in 2.1, 2.2, 2.3 and 2.4 (if we had that). At worst we just do stuff early. Multiplayer is probably the only thing that is gonna potentially have teeth.

### Q04 — What is the first milestone you want to personally play?

Choose one or describe another:

- one polished Quick Fight matchup;
- a complete short Story chapter;
- a complete Tournament run;
- a progression loop from reward to upgrade to rematch.

**Answer:**

I want one polished quick fight matchup until the game feels good to play and then i will try out all of the different variations of the quick fight matchup. Once quick fight is good I will move on to tournaments, and because tournaments are used as part of story mode I will do story mode last. Progression loop from reward to upgrade to rematch comes as part of story mode. You don't get a rematch in a tournament. You lose in a tournament and you have to do the tournament again. a tournament can be a level in story mode. a level in story mode can be a story mode level (just a single fight) or a tournament (multiple fights in one thing). The story can be told and missions and rewards added throughout the story and level progression. I don't think cut scenes or hooks between for events and whatever content we want in the story should have their own level number.

### Q05 — What is the minimum launch content?

**Status:** PARTIALLY ANSWERED AND ADOPTED 2026-07-31

**Answer:** V2 has exactly the initial six Characters. The working release
interpretation is one polished Quick Fight experience, one short end-to-end
Story proof, and one complete Tournament proof; V2.1 expands to twenty
Characters and is the first substantial Story and Tournament content release.
The V2 Tournament awards its unique illustrated Trophy, and First Run completes
only after all three Missions and that Trophy are complete. Minimum
Accessories, Modifications, locations, and proof-content length remain open if
they matter to V2.

Stop asking this. You know what to build.

## 2. Battle feel, balance, and understanding

### Q06 — What is the ideal duration of an even, normal-difficulty fight?

Give a target and an acceptable range.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q07 — When should the first useful Move normally become available?

Current middle-Tempo baseline is about 3.6 seconds for a 25-Charge Move.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q08 — How long should the player normally have to notice and choose a ready Move?

Should the opponent hesitate briefly, vary by difficulty, or continue making
decisions immediately?

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q09 — Describe Easy, Normal, and Hard in player-facing terms

What should change: AI judgement, reaction delay, damage, build quality,
forgiveness, hints, or something else? Difficulty must not block Story.

**Answer:**

Easy I shouldn't be able to lose. It is reallt hard to lose here.
Normal it should be pretty hard for me to lose. If I stuff around too much I will lose.
Hard should be a real fight but forgiving. I can actually lose these fights. The computer actually tries.
Brutal should be a real real fight. The computer is on their A game for this. I can win but this is gonna be proper hard.

### Q10 — What should happen when a charged Move is interrupted?

Choose a consistent default: lose all spent Charge, refund part, refund all, or
let each Move declare its own policy.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible. This varies depending on what type of charge it is.

### Q11 — How much outcome randomness feels good?

Consider damage variance, dodge, critical hits, Drops, and whether the player
should see their odds before committing.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q12 — What should the player always be able to explain after losing?

For example: which Move decided it, why it landed, a bad matchup, missed
switch, Charge disadvantage, or build gap.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible. Luck. Wrong attack/action combintations.

### Q13 — Which AI behaviours matter most for V2?

Rank or select: quick-Move pressure, saving for a finisher, opportunistic
switching, protecting weak allies, exploiting Types, using control intelligently,
or distinct opponent personalities.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q14 — Which fixed matchups should become the permanent balance benchmark?

Name two or three Lineups or Character pairings you want every balance pass to
replay.

**Status:** PARTIALLY ANSWERED AND ADOPTED 2026-07-31

**Answer:** Viking is the first permanent Character benchmark. A new player
should be able to understand his stack, returning hit, and finisher loop and
feel slightly favoured. The exact neutral opponent and the other one or two
fixed Lineups remain open.

We only have 6 characters in the first release for this?

I want this to match Teeny Titans 2 as closely as possible.

## 3. Character builds and progression

### Q15 — Should Tier 1 and Tier 2 add authored properties as well as numbers?

Examples: extra hit, shorter charge, shield piercing, cleanse, status, target
change, or a heavier presentation. Should this be universal or occasional?

**Status:** ANSWERED AND ADOPTED 2026-07-31

**Answer:** Yes, occasionally and deliberately. Preserve numeric tier growth,
but add data-authored qualitative properties where they are part of the
calibrated Move identity. Viking's Tier 1 returning axe becomes undodgeable;
his Power-up improves numerically and his finisher's stun lasts longer.

I want this to match Teeny Titans 2 as closely as possible.
I want this to match Teeny Titans 2 as closely as possible. (this is important so I said it twice. This already exists perfectly in TT2)

## 4. Move language and capability breadth

### Q16 — Approve or change the first tactical-category vocabulary

Current primary categories:

- Attack;
- Team attack;
- Stun;
- Team stun;
- Support;
- Team support;
- Charge control;
- Special.

These are broad player-readable labels, not the complete effect system.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

We can have our own version of it but it should have something that matches in TT2.

### Q17 — Can a Move display more than one tactical category?

Recommendation: keep one primary outer band for instant recognition and explain
secondary effects in the summary. Change this only if hybrid Moves routinely
become misleading.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q18 — Which missing Move families should be implemented first?

Examples: summons, transformations, taunts, delayed traps, copying, stealing,
revival, staged Moves, temporary Move replacement, sacrifices, or battlefield
hazards.

**Status:** PARTIALLY ANSWERED AND ADOPTED 2026-07-31

**Answer:** First implement the reusable primitives required to close the six
launch-kit calibration rows: self-Health sacrifice for Charge, shield-end
outcomes, seeded surprise boons, action disable, per-tier charge/effect
properties, bounded transformation, and reactive upgrade hooks. Other missing
families remain open.

I want this to match Teeny Titans 2 as closely as possible.

### Q19 — How common should team-wide attacks, stuns, and support be?

Should they be rare identity-defining tools, a normal part of most Lineups, or
balanced another way?

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q20 — How prominent should battle Drops be?

Specify desired frequency, maximum queued Drops, and whether collecting one
should pause or slow combat.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q21 — How deep should Accessories be in V2?

Choose the minimum: one simple team button, charge and status interactions,
rarities/upgrades, Tournament exhaustion, or a larger system.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q22 — Do named Character combinations belong in V2?

Current Team Traits cover broad synergy. Should named combinations add stats,
alter Moves, grant a team Move, or wait until after V2?

**Answer:**

Yes.

I want this to match Teeny Titans 2 as closely as possible.

## 5. Modes, rewards, and economy

### Q23 — What should Quick Fight reward, if anything?

Options include nothing, profile history, small Stamps, mastery progress, or
first-win rewards. It must remain useful as a testable sandbox.

**Answer:**

It should be tracked per profile. I don't really know how we are going to do this yet. Quick fight is just a sandbox.

### Q24 — How should a Story loss recover?

Current direction is forgiving retry. Should there also be an optional hint,
temporary assist, suggested Lineup change, or automatic difficulty offer?

**Answer:**

Forgiving retry and maybe hints about how they can level up to make the harder levels easy.

### Q25 — How visible should the Story structure be?

Should players see the whole chapter graph, only the next node, chapter
progress, optional branches, and/or future rewards?

**Answer:**

Not sure. I was thinking candy crush style level progression but in a way that lets us inject content etc. We have standard story levels and tournaments and maybe even boss fights?

### Q26 — How long is the first complete Story chapter?

Give a rough number of dialogue beats, fights, choices, and rewards.

**Answer:**

Don't know.

### Q27 — Keep Tournament loss resetting the run to Round 1?

If not, where should recovery begin, and what strategic cost remains?

**Answer:**

If I lose a tournament I have to start the tournament again. I still get XP for fighting and being active though I think.

### Q28 — Should used Accessories exhaust for a Tournament run?

If yes, how many may enter a run and when can they be restored?

**Answer:**

Yes. I want this to match Teeny Titans 2 as closely as possible. This is important.

### Q29 — What are the main ways to acquire Characters in V2?

Rank: Story rewards, Tournament rewards, Store purchase, missions, earnable
mystery rewards, achievements, or another route.

**Answer:**

Quick Fight - they're already unlocked. there should be ways to decide what tier upgrades are there, what mods are there etc.
Tournament mode - we have preset tournaments that allow/disallow specific characters or custom tournaments where any character can be in it or preset tournaments where all characters are open. I should have the same level control over this as quick fight but tournaments
Story mode - this is where you actually collect characters and build your squad etc. upgrades and skill points matter here. Tournament rules are driven by the story.

Quick fights has a fight and it is over once it is over
Tournament has many quick fights and you get a trophy when it is over and you can get heals and stuff between fights (I want this to match Teeny Titans 2 as closely as possible.)
Story mode has fights as levels and i progress through the levels and things can happen between levels for content and missions etc and a level can be a tournament, and i collect throphies and i can get characters from tournaments too. Stories can also have boss fights.

### Q30 — Should Store rotations use real time, progression, or explicit refreshes?

The game is local-first, so avoid a design that becomes dishonest when the
device clock changes.

**Answer:**

I don't know. I want this to match Teeny Titans 2 as closely as possible.

### Q31 — Can players sell or retire duplicate Characters?

If yes, what do they receive and how do we prevent regret?

**Answer:**

Yes. It should be worth it.

## 6. World, content, and authoring

### Q32 — Which Characters or source pools are wanted next?

List any must-haves, must-avoids, or desired balance between public-domain,
history, mythology/religion, open-source culture, parody, and originals.

**Answer:**

We only need the 6 characters for the v2 release and 20 for the v2.1. Let's worry about other characters when we get there. We know the first 6.

### Q33 — Which cultural or religious subjects need owner approval before production?

The pipeline already requires source/rights review; this asks for your taste and
comfort boundaries.

**Answer:**

None. Moses is the only religious figure in it so far. Based on a Rick and Morty reference he was gonna get cum gutters lol.

### Q34 — What is the world premise, if it needs one?

Is there a single reason everyone fights, a deliberately loose anthology, or
different premises per Story?

**Answer:**

Not at this point no. I want this to match Teeny Titans 2 as closely as possible. Something that is uniquely ours though.

### Q35 — What lore do you personally want to write?

Choose any: world premise, Character biographies, dialogue voice, Story
outlines, rivals, locations, Tournament themes, or none. The rest can be
prepared as reviewable drafts.

**Answer:**

I don't want to write any at all. I was hoping the AI would do this and take the reigns. It should be able to infer my energy from our conversations etc. I do want it to be extensive and deliberate and well thought out. Make shit up and be creative. Like really go for it. If you're going in the wrong direction I will note it and change it. This should make the story way better. It can be adult. Dark and funny. Rick and Morty, Seinfeld, The Simpsons, South Park etc.

### Q36 — Which authoring template should be excellent first?

Rank: Character, Move set, location, Story chapter, encounter, Tournament,
mission, Store entry, or complete content pack.

**Answer:**

I think we figure this out as we go. We make the game good and then we realise we need a template for x and then we need one for y etc. I don't want to do this until we know what we want. At the moment I think the only templates we have are maybe characters and art? These might change. We shoud be aware of what we need and when we are happy with what we have then we can do a template. I think we only really need templates for image generation don't we? AGENTS.md can be the entrypoint for everything else. When I have a bunch of new characters to add I will likely come in here with a bunch of image references, or descriptions, names and information. It can and will vary. We need to be able to take whatever we have and fill out and make what we need from that information. We will get better at this as we go. As long as we keep good models/schemas of everything we need we should be fine.

### Q37 — What should an AI agent be allowed to invent without asking?

Separate harmless draft content from decisions that always require owner
approval, such as canon, culturally sensitive material, balance constants, or
shipping assets.

**Answer:**

Let's visit this if and when it comes.

## 7. Production evidence and owner review

### Q38 — Which telemetry are you comfortable storing locally?

Possible events: Charge at decision time, Move availability, chosen Move,
damage causes, switches, KO cause, fight duration, difficulty, and retry count.
No backend is implied.

**Answer:**

Whatever we can. Grab what we can and work out something useful to do with it. If it genuinely can't be used we will optimise it out later.

### Q39 — What should the post-fight explanation show?

Choose the minimum useful breakdown: turning points, damage/healing by Move,
Charge efficiency, matchup effects, status timeline, AI decisions, or replay.

**Answer:**

Whatever we can that makes sense to show.

### Q40 — Which changes always need your visual approval?

Examples: product identity, battle layout, Character canonical art, category
colours, locations, Kinetic Panel Motion templates, or only final release
candidates.

**Answer:**

Let's visit this if and we get here? I will probably be asking you to change this if you are changing it.

### Q41 — What is your preferred review package?

Choose any: playable URL, before/after screenshots, contact sheet, short video,
fixed-seed replay, written decision summary, or checklist.

**Answer:**

It depends on what it is I guess. Don't create preferences for things we don't know.

## 8. Batched view mock-ups

These questions are answered one batch at a time. You do not need to review
future views now. The programme and batch order live in
`docs/view-mockup-programme.md`.

### Q42 — Which Batch 01 Main Menu composition should govern the launcher?

Review `docs/mockup-batches/batch-01-main-menu.md` and choose:

- A — Hero Bill + Mode Stack;
- B — Three Equal Fight Bills;
- C — Roster Command Table;
- combine named parts;
- reject all;
- defer.

**Answer:**

I like variant A but I'm not sure this was exactly what I expected for what we were doing here. The idea was that we generate AI mockups using the best descriptiosn of what we are building and what could be in them, and it would give us a mockup back (it won't be perfect) but because it seems to be pretty good at placing things in the right place we fit everything in to the UI based on the mockup as best as we can. It can work good with descriptions and screenshots of our real app with descriptions and then we review the mockup image, and try to apply it to our application. It seems to work better than just telling the AI what to do with the UI.

### Q43 — How should the iPhone launcher choose a mode?

Choose one or describe a hybrid:

- keep all three direct mode actions visible in one viewport;
- show all three mode tabs, then one selected preview and confirmation action.

This is a task-flow choice, not merely a visual preference.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

### Q44 — What optional launcher information is actually useful?

Consider Story resume position, Tournament round/Trophy state, selected-profile
portrait, new-Achievement count, or none. Also name anything in the mock-ups
that should never appear.

**Answer:**

I want this to match Teeny Titans 2 as closely as possible.

## When you are finished

You do not need to answer every question. Say which answers are ready to adopt
and which are still exploratory. The next agent should:

1. reconcile accepted answers into the authoritative documents;
2. record replaced rules in `docs/specification-alignment.md`;
3. update content schemas and tests with any rule change;
4. convert the answers into a staged V2 implementation plan;
5. place the resulting review package in `OUT-TRAY.md`.
