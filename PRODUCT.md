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
  Mode are explicit game-session objects that the player starts or resumes. A
  skippable data-driven intro and visible wait state may run before the launcher
  without creating a game session.
- Story Mode contains replayable, skippable authored nodes and a canonical main story, while independent stories can be added from content data.
- Quick Fight exposes all characters and begins with a progression-neutral
  Standard Build; explicitly labelled Custom rules can expose supported levels,
  Moves, tiers, Modifications, and encounter overrides.
- Tournament Mode runs a self-contained sequence in one sitting, with a locked tournament roster and persistent health/defeat state between rounds.
- Store and Missions are Story Mode surfaces and never appear in the global
  Main Menu.
- Profile owns Player identity and progression selection. Settings separately
  owns preferences, accessibility, audio, and local-data controls.
- Achievements are profile-specific and retroactively derived from durable
  progression facts.
- Desktop is the first target. A mobile layout may later use portrait, landscape, or both.

## Capabilities and Constraints

- Phaser 3, TypeScript, Vite, Vitest, Node 22, pnpm 11, and `mise`.
- Gameplay modules must not import Phaser; Phaser renders semantic gameplay events.
- Two independent team battle bars persist across character switches.
- One active character per side; each deployed team contains one to three characters.
- Three reorderable actions per character, composed from reusable effects and positioned from `1L` through `3H`.
- Seeded randomness, visible predicted action values, switching, charge-up actions, interruption, critical hits, dodge, statuses, team targeting, type advantage, and squad synergy.
- Six Combat Types plus uncommon Typeless Characters. A Character's Type
  determines matchup effectiveness; Moves do not have independent Types.
- Six independent Team Traits use visible fractional Lineup scoring and bonuses
  at scores two and three. A Character has at most two Traits and contributes at
  most one total Trait point.
- Character cap 25; modifications unlock at level 5; action reordering and upgrades unlock at level 10; action tiers are stock, gold, and platinum.
- Local-first settings and multiple local Player profiles, with progression separate from preferences.
- Easy, Normal, Hard, and Brutal difficulty; changing difficulty never blocks story progress.
- Existing music under `music/` is the current soundtrack pool.
- Dialogue and sound effects use silent placeholder files until a later ElevenLabs integration.
- No open-world walking, map traversal, backend, multiplayer, monetisation, or mobile packaging in this stage.
- The authoritative requirements live in `docs/game-design.md`; the imported conversation is historical input only.

## Brand Commitments

- Battles should feel bright, playful, and kinetic without becoming frustrating,
  overwhelming, complicated, muddy, cluttered, or generic.
- The primary audience is nostalgic adults, with enough clarity and collectible
  appeal to remain enjoyable beside younger family members.
- The tone combines a cute, collectible exterior with character-specific,
  fandom-literate adult comedy. Sharpness comes from character, social behaviour,
  and escalation rather than generic profanity or copied catchphrases.
- Characters and mechanics must use distinctive names rather than generic implementation labels.
- Opaque rectangular and square image panels are the presentation language, not
  a temporary compromise. Generated fighter art is never required to provide
  transparency; code may crop, clip, mask, stack, tint, move, and replace the
  complete frames.
- Characters and individual stories may have their own visual and musical flavour
  while still satisfying a strict house translation, asset manifest, and
  presentation grammar.
- The roster may mix genres, body types, people, animals, robots, monsters,
  magical beings, and objects. Variety in content must not create bespoke combat
  branches or incompatible rendering rules.
- Heavy silhouettes, character-dependent chibi/vinyl proportions, and aggressive
  limited-animation choreography are preferred hypotheses to prove through style
  frames.
- Any initial title, cast, terminology, factions, palette, and visual world
  invented during this stage are working proposals and remain replaceable through
  content and design records. The Riot Relics name and current risograph/archive
  direction are not approved brand commitments.
- Public releases use original, commissioned, licensed, or otherwise approved
  character material. Private or local content packs remain clearly separated
  from distributable presets.

## Evidence on Hand

- `walkthrough-questions.md` contains the consolidated walkthrough and 190 product answers.
- `conversation.txt` and the supplied pasted-text attachment are byte-identical historical source material.
- `docs/art-direction-discovery.md` records the accepted first-round art-direction
  answers and the proposed character/art package pipeline.
- Eighteen manually curated MP3 tracks exist in `music/`.
- No incumbent application code, approved logo, approved character reference art, customer claims, analytics data, or production backend exists yet.

## Product Principles

1. Make static art move through authored presentation, not conventional animation volume.
2. Keep gameplay deterministic, data-driven, and independent from rendering.
3. Reward experimentation and allow players to outgrow old challenges.
4. Add stories, characters, actions, and tournaments as content rather than new engine code.
5. Keep failure forgiving and information visible; difficulty is a preference, not a gate.

## Accessibility & Inclusion

Support reduced motion, readable status and type labels that do not rely on colour alone, keyboard navigation for application UI, scalable responsive layouts, independent music/SFX/dialogue volume controls, and subtitles for future dialogue.
