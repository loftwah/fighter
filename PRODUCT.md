# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary player enjoys collectible-character games, short active battles, team-building, visible progression, and experimenting with overpowered combinations. They play in a desktop browser first, with mouse, touch, and keyboard support; mobile web is a later adaptation.

The player is represented in fiction as a collector who competes against other collectors. They may name and customise a profile, but the avatar is not the centre of every story.

## Product Purpose

The product is a collectible squad battler built around fast real-time battle-bar combat. Players collect character figures, arrange one-to-three-character battle teams, configure builds, fight authored or sandbox opponents, earn XP and currency, and return stronger.

Success means the first playable slice proves the complete emotional loop:

```text
fight → earn → upgrade → collect → unlock → fight again
```

It must also prove that static rectangular art can feel energetic through image swaps, panel motion, zoom, shake, hit-stop, flashes, particles, and sound.

## Positioning

Unlike an exploration RPG, the game delivers story, stores, missions, choices, tournaments, rewards, and battles through authored nodes from `00` to `n`. Its reusable effect engine and kinetic rectangular presentation allow a large, visually varied roster without conventional animation or bespoke gameplay code for every action.

## Operating Context

- The application opens on a Main Menu. Story Mode, Quick Fight, and Tournament
  Mode are explicit game-session objects that the player starts or resumes.
- Story Mode contains replayable, skippable authored nodes and a canonical main story, while independent stories can be added from content data.
- Quick Fight exposes all characters, actions, levels, and builds for unrestricted experimentation.
- Tournament Mode runs a self-contained sequence in one sitting, with a locked tournament roster and persistent health/defeat state between rounds.
- Store and Missions are Story Mode surfaces and never appear in the global
  Main Menu.
- Profile owns Collector identity and progression selection. Settings separately
  owns preferences, accessibility, audio, and local-data controls.
- Desktop is the first target. A mobile layout may later use portrait, landscape, or both.

## Capabilities and Constraints

- Phaser 3, TypeScript, Vite, Vitest, Node 22, pnpm 11, and `mise`.
- Gameplay modules must not import Phaser; Phaser renders semantic gameplay events.
- Two independent team battle bars persist across character switches.
- One active character per side; each deployed team contains one to three characters.
- Three reorderable actions per character, composed from reusable effects and positioned from `1L` through `3H`.
- Seeded randomness, visible predicted action values, switching, charge-up actions, interruption, critical hits, dodge, statuses, team targeting, type advantage, and squad synergy.
- Six character classes plus optional neutral characters. Character class determines effectiveness; actions do not have independent classes.
- Character cap 25; modifications unlock at level 5; action reordering and upgrades unlock at level 10; action tiers are stock, gold, and platinum.
- Local-first settings and multiple local Collector profiles, with progression separate from preferences.
- Easy, Normal, Hard, and Brutal difficulty; changing difficulty never blocks story progress.
- Existing music under `music/` is the current soundtrack pool.
- Dialogue and sound effects use silent placeholder files until a later ElevenLabs integration.
- No open-world walking, map traversal, backend, multiplayer, monetisation, or mobile packaging in this stage.
- The authoritative requirements live in `docs/game-design.md`; the imported conversation is historical input only.

## Brand Commitments

- The world may be funny, stylish, dramatic, strange, irreverent, anime-inspired, toy-like, and sincere or absurd depending on the moment.
- Characters and mechanics must use distinctive names rather than generic implementation labels.
- Rectangular and square image panels are the presentation language, not a temporary compromise.
- Characters and individual stories may have their own visual and musical flavour while still satisfying consistent asset templates.
- Any initial title, cast, terminology, factions, and visual world invented during this stage are working proposals and remain replaceable through content and design records.

## Evidence on Hand

- `walkthrough-questions.md` contains the consolidated walkthrough and 190 product answers.
- `conversation.txt` and the supplied pasted-text attachment are byte-identical historical source material.
- Seven manually curated MP3 tracks exist in `music/`.
- No incumbent application code, approved logo, approved character reference art, customer claims, analytics data, or production backend exists yet.

## Product Principles

1. Make static art move through authored presentation, not conventional animation volume.
2. Keep gameplay deterministic, data-driven, and independent from rendering.
3. Reward experimentation and allow players to outgrow old challenges.
4. Add stories, characters, actions, and tournaments as content rather than new engine code.
5. Keep failure forgiving and information visible; difficulty is a preference, not a gate.

## Accessibility & Inclusion

Support reduced motion, readable status and type labels that do not rely on colour alone, keyboard navigation for application UI, scalable responsive layouts, independent music/SFX/dialogue volume controls, and subtitles for future dialogue.
