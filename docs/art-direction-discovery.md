# Art direction discovery

Status: accepted product direction and proposed visual-production brief  
Recorded: 2026-07-30  
Implementation status: the current loftwah/fighter visual system remains the
implemented truth in `DESIGN.md` until a replacement direction is selected,
built, inspected, and documented.

## Product thesis

This is a scalable crossover-style battle engine where characters arrive as
validated content packs, but every character is translated through one
recognisable visual, mechanical, and presentation grammar.

The roster may become culturally chaotic. The engine may not.

## Accepted preferences

- Battles should feel **bright, playful, and kinetic**.
- They must not feel frustrating, overwhelming, complicated, muddy, cluttered,
  or generic.
- The desired illusion is intense action without intense cognitive load.
- The primary audience is nostalgic adults who still want something readable
  and enjoyable beside younger family members.
- The tone is a cute, collectible exterior with an adult, fandom-literate comedy
  brain.
- Comedy should be character-specific, absurd, mischievous, and willing to
  become sharp. Generic profanity, copied catchphrases, and interchangeable
  “edgy” dialogue are not a voice.
- the reference game is the functional benchmark for collection, battle clarity,
  action availability, switching, and approachable mechanical reuse. Its
  protected characters, writing, artwork, and exact presentation are not source
  assets.
- Characters may be human, animal, robot, monster, magical, mundane, or
  deliberately ridiculous.
- The house translation should allow character-dependent proportions inside a
  recognisable chibi/vinyl-toy family.
- Heavy outlines are preferred because they strengthen silhouettes inside
  aggressive crops, zooms, panel motion, and collisions.
- Arenas should choose their lighting and accent colours from their location,
  rather than forcing every scene onto the same light or dark foundation.
- Attacks should use the complete limited-animation toolbox: panel cuts, impact
  words, speed lines, camera punches, squash and stretch, collisions, flashes,
  hit-stop, reactions, and decisive resets.
- Play feel and system repeatability matter more than preserving any current
  placeholder character, name, faction, or attack theme.

## Decisions made from the answers

### 1. Calm controls, explosive locks

Ordinary battle state must remain exceptionally clear: active fighters, Charge,
available Moves, costs, target, and last outcome. Visual chaos is permitted
during a short blocking attack presentation because the player is not being
asked to decide during it. The stage then resets cleanly.

This is how the game can feel intense without becoming overwhelming.

### 2. One translation language

Imported inspiration does not retain an unrelated rendering style unchanged.
Every character is translated through the same silhouette, outline, shading,
framing, and reaction rules. Proportions and local flavour may vary; production
grammar does not.

The working style hypothesis is:

> **Saturday-Night Toybox:** chibi/vinyl forms, heavy ink, simple cel shading,
> sticker-clean silhouettes, selective print imperfection, and late-night
> comedy energy inside a toy-commercial shell.

This is a candidate to visualise, not an approved replacement for `DESIGN.md`.

### 3. Palette must be proven visually

A radioactive snack-aisle family is worth testing:

| Role          | Candidate |
| ------------- | --------- |
| Electric cyan | `#20d9ff` |
| Slime lime    | `#b6ff38` |
| Hot magenta   | `#ff3d9a` |
| Nacho orange  | `#ff8a2a` |
| Ink purple    | `#21133d` |
| Warm cream    | `#fff3d1` |

The rule is more important than the swatches: one stable ink/foundation pair
plus no more than two loud scene accents at once. All six may not compete on
every screen. These values remain unapproved until style-frame comparison.

### 4. UI has one hierarchy

The proposed interface grammar is:

1. clean, readable interaction and state underneath;
2. toy-packaging structure for collecting, builds, and inventory;
3. comic stickers and impact typography for battle feedback;
4. late-1990s/early-2000s television graphics for story and tournament
   transitions.

These are layers in one system, not four independent themes.

## Character packages, not character classes

“Character as an object” is the correct product model, but characters should be
authored data packages rather than engine subclasses. The package has several
contracts that are allowed to evolve independently:

```text
content-pack manifest
├── combat character definition
├── three action definitions
├── presentation profile and action recipes
├── narrative/comedy profile
└── registered asset manifest
```

The pure combat engine consumes only combat fields and reusable effect
primitives. UI, Phaser, dialogue, and asset details remain outside the domain
definition.

### Combat character definition

- stable ID and display name;
- one Combat Type, zero to two Team Traits, base statistics, and three Move
  IDs;
- balance/build defaults owned by the appropriate game mode.

### Presentation profile

- proportions and facing;
- body and impact anchors;
- palette and effect-family tags;
- preferred camera intensity and timing personality;
- fallback reaction and presentation IDs.

### Narrative and comedy profile

- description, lore, categories, and searchable tags;
- content pack and provenance;
- relationships, rivalries, obsessions, and social flaws;
- intro, victory, defeat, and encounter attitudes;
- humour intensity and prohibited joke areas;
- story and tournament hooks.

Narrative metadata should help authored or generated writing stay
character-specific. It must not be treated as permission to imitate scripts,
quotes, or a living writer's voice.

### Content-pack manifest

- stable pack ID, version, dependencies, and compatible schema version;
- original, licensed, private-development, or user-local provenance;
- distribution permission and attribution notes;
- included character, action, presentation, narrative, and asset IDs;
- default-on or optional preset membership.

Public builds must be able to reject non-distributable packs. “Private
development” is an organisational boundary, not a guarantee that every use of a
protected character, trademark, likeness, or real person is lawful.

## Reusable action architecture

An authored Move is:

```text
cost position
+ charge/interrupt timing
+ target rule
+ ordered mechanical effects
+ presentation recipe
+ audio cues
```

The engine already supports damage, multi-hit damage, healing, stun, attack and
defence modification, Charge gain/drain, shield, and cleanse. Future primitives
should be added only when a real Move needs distinct gameplay—not because a new
name or visual theme sounds different.

For example, “Hot Chip Meteor,” “Laser Eyes,” and “Passive-Aggressive Email” can
all use direct damage while selecting completely different art, timing, effect,
sound, and camera recipes.

## Opaque framed-shot contract

Every generated bitmap is a complete opaque rectangle or square. The game does
not depend on transparency and does not pretend that character images are
sprites. A character frame is a visible camera shot: a fighter window, comic
panel, reaction insert, collection image, or full-field cut-in.

Generated frames use consistent aspect classes, declared focal points, safe
crop zones, facing, and simple controlled background fields. Code may place a
rectangular frame inside a diagonal or irregular procedural mask, but the source
asset remains complete and opaque.

This avoids a combinatorial trap. We do not generate every character on every
arena. Arena images, fighter plates, and action cut-ins remain independent
rectangles joined by a stable panel grammar.

### Generated assets

- arena and story establishing shots;
- canonical character and collection frames;
- two-frame idle plates;
- character reaction plates;
- opponent-free Move cut-ins;
- optional projectiles, props, transformations, or special full-field shots
  when they materially improve a Move.

### Code-native presentation

- Health, Charge, timers, costs, readiness, targets, and countdown;
- exact action names, damage values, status labels, and impact words;
- panel borders, shadows, wipes, masks, split lines, speed lines, and flashes;
- camera pans, zooms, shake, hit-stop, parallax, tint, particles, and screen
  inversion;
- input, focus, pause, reduced-motion behaviour, and accessibility state.

### Hybrid choreography

The renderer can make an opaque frame feel animated by changing the crop inside
a fixed panel, moving the whole panel, swapping or crossfading frames, briefly
claiming the full screen, stacking a reaction insert over the arena, and
procedurally masking the rectangular source into a diagonal composition.

The image supplies authored character and scene specificity. Code supplies
timing, continuity, dynamic state, and responsiveness.

## Minimum character art contract

### Required set

- canonical collection image;
- battle portrait;
- idle A and idle B;
- hurt;
- stunned;
- dodge;
- victory;
- defeat/KO;
- one action pose or cut-in for each of the three Moves.

### Optional set

- anticipation poses;
- alternate hurt or dodge reactions;
- summon, prop, projectile, or transformation layers;
- story expressions;
- premium collection/card composition;
- arena-specific costume or lighting variants.

The fallback chain remains essential: specific action/reaction art → character
fallback → house template → silent or generic placeholder.

A complete first-pass character therefore needs roughly 10–12 generated
frames, not an unlimited bespoke animation set. Optional alternates may expand a
popular character without changing the manifest expected by the engine.

## Generation scale

The authoring pipeline can generate a very large number of images in repeated
batches, but the shipped game must not assume that generation is instantaneous,
free, perfectly consistent, or available at runtime. Every accepted frame still
has generation time, review cost, storage, download, decode, and memory impact.

The scalable promise is:

> effectively unbounded authored content, produced offline through one bounded
> and validated character contract.

The browser loads the current encounter's small working set rather than the
entire installed roster. The required 10–12 frames establish a dependable
floor; optional art creates richer characters without becoming a requirement
for gameplay compatibility.

## Limited-animation presentation recipe

Each attack is a small directed sequence:

1. anticipation;
2. cut-in or panel claim;
3. subject movement through translate, scale, and rotation;
4. action-image swap;
5. impact flash, effect, word, or collision;
6. hit-stop;
7. target reaction and optional camera shake;
8. recovery and decisive stage reset.

Gameplay chooses the outcome before this sequence. The presentation consumes
semantic events and may not decide damage, dodge, interruption, status, or
targeting. Reduced motion simplifies travel and flashing while preserving the
same blocking gameplay interval.

Browser-native transforms and opacity should carry most movement. Phaser owns
arena composition and effects that benefit from its scene graph. Neither should
continuously rebuild semantic controls.

For independently generated idle A/B frames, a short crossfade or masked wipe
is safer than a naked hard swap because tiny background texture differences can
otherwise read as accidental jitter.

## Current repository fit

| Concern          | Current foundation                                                 | Needed next                                             |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| Character combat | Stable data IDs, stats, class, faction, three actions              | Keep deliberately small                                 |
| Actions          | Reusable ordered effects and separate presentation/audio IDs       | Version effect catalogue as actual Moves demand         |
| Assets           | Stable registry, fallbacks, portraits, idle pairs, some action art | Versioned character asset manifest and reaction set     |
| Presentation     | Semantic events and a single presentation asset ID                 | Data-driven multi-beat presentation recipes             |
| Narrative        | Name and lore                                                      | Separate narrative/comedy schema                        |
| Packs            | Content is data but bundled together                               | Manifest, provenance, validation, presets               |
| Generation       | Approved assets are protected from silent overwrite                | Intake template, generation batches, anchors, QA report |

The architecture is pointed in the right direction. The most important gap is
not another combat subclass; it is the versioned presentation/asset contract
that connects reusable mechanics to infinitely varied characters.

The existing generated assets already satisfy the fundamental format
constraint: they are opaque RGB PNG rectangles in 16:9, 4:5, 1:1, and
reaction-sheet frame classes. The new pipeline needs to formalise how those
frames are cropped and choreographed, not convert them into transparent
cut-outs.

## Proof scene

The proof should not be arbitrary even if its fiction is disposable. It must
exercise the full pipeline with original material:

- a squat, visually simple hero;
- a lanky rival with a different silhouette;
- a location with foreground, background, and reactive elements;
- direct damage, control/status, and healing/support Moves;
- action, hurt, dodge, status, victory, and defeat presentation;
- desktop and portrait crops.

“Snack Wizard versus Terms & Conditions in a fluorescent convenience store at
2:13 a.m.” is a useful first candidate because it tests those needs without
borrowing the appeal of an existing franchise. Names and fiction remain
replaceable.

## Production sequence

1. Generate three style frames of the same proof battle with identical content
   and framing requirements.
2. Select or deliberately combine one translation language.
3. Produce hero and rival reference sheets before individual action art.
4. Lock canvas classes, anchors, line weight, shading, palette behaviour, and
   file/registry naming. Include focal point, safe crop, facing,
   background-field behaviour, and shot role.
5. Generate one complete character set in small related batches.
6. Register and validate the package without modifying the combat engine.
7. Play repeated fights and tune timing, camera, sound, and Charge feel.
8. Generate the rival through the same pipeline and record every exception.
9. Only then make the third character the “can the pipeline repeat?” test.

## Style-frame comparison rendered

Status: three unapproved style frames were rendered on 2026-07-30 using the
same Snack Wizard versus Terms & Conditions convenience-store brief. None has
replaced approved game art.

1. **Saturday-Night Toybox** — the working house hypothesis: chunky
   collectible shapes, clean heavy ink, cream/ink foundation, slime and nacho
   accents. The first render also demonstrates why generated HUD elements are
   prohibited: dynamic battle state must remain code-native.
2. **After-Hours Video Store** — late-1990s anime-cel geometry, VHS colour
   bloom, midnight foundation, cyan/magenta accents, and a cleaner full-field
   composition. This is the strongest candidate for immediate character appeal
   and kinetic camera crops, but its gloss needs to remain toy-like rather than
   drift into generic anime-mobile polish.
3. **Paperback Panel Pop** — lively brush ink, screen-printed flat colour,
   sparse halftone, warm paper, tomato, and cyan. This is the strongest
   candidate for a distinct ownable illustration language and honest opaque
   rectangles, but the production template must constrain texture so small
   phone crops stay clean.

The next art decision is intentionally narrow: select one base direction, or
name one specific trait to combine from another. Character sheets, battle
plates, and action art should not be batch-generated until that choice is made.

## Explicit boundaries

- The current release roster must use original, commissioned, licensed, or
  otherwise approved material.
- Real people, violent criminals, online personalities, and adult subject matter
  create likeness, defamation, safety, age-rating, and tonal questions beyond
  ordinary fictional parody. Pack provenance and release presets must make those
  decisions explicit.
- Backend multiplayer remains outside the accepted stage. A future design change
  may add it, but current content contracts should not be distorted around
  speculative networking.
- Do not generate a large cast before the proof battle and package validator are
  convincing.
