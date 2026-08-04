# Visual direction v2 — bright crossover toybox

Status: accepted bitmap direction; launch raster package implemented
Accepted: 2026-07-30

`DESIGN.md` remains the implemented visual-system source of truth. The launch
bitmap rules in this document now exist in the running game and are mirrored
there. Broader interface palette/material replacement remains in progress.

## Target

The game should look bright, cute, fun, absurd, and immediately readable. The
house style is a stylised cartoon–anime hybrid made for a roster whose sources
do not naturally belong together.

- nostalgic-adult appeal without excluding younger players;
- bold, unmistakable silhouettes and expressive faces;
- collectible, toy-like proportions with character-dependent variation;
- heavy controlled outlines and simple cel-like shading;
- cute without becoming infantile;
- energetic without continuous visual noise;
- humorous, dramatic, and ridiculous when the Character calls for it;
- no generic realistic AI look;
- no interchangeable generic-anime finish.

Individual Characters retain their identity through shape, pose, local palette,
props, expression, and attack language. They do not retain unrelated rendering
styles from source material.

## Opaque-image production contract

Generated bitmap inputs are opaque rectangles or squares. Transparency is not
required and generated controls or changing text are prohibited.

Each launch Character package contains:

- one collection/profile portrait;
- two compatible battle-idle frames;
- a reaction sheet or individual reaction panels;
- one opponent-free panel for each of its three Moves;
- optional story and victory panels where reuse cannot carry the moment.

The generated image owns the Character, a compatible simple background field,
and static illustrative action marks that belong to that exact Move or reaction
pose. Code owns crops, masks, panel frames, timed speed lines and particles,
lighting overlays, impact words, screen flashes, damage numbers, health,
Charge, Move costs, availability, focus, and all other changing information.

## Implemented launch package

- Six canonical 4:5 plates.
- Six canonical-derived idle-A plates and six controlled idle-B edits.
- Six 3 × 2 reaction sheets in the order
  `hurt, dodge, stunned / defeated, victory, tense`.
- Eighteen character-specific opponent-free 16:9 Move cut-ins.
- Matching arena, Story, and Tournament establishing plates.
- Landscape and portrait six-Character startup ensembles.

Reviewed sources, prompt records, contact sheets, and build instructions are
recorded in `docs/launch-roster-art-production.md`. Runtime files are rebuilt
through `mise run assets:launch-roster`; approved output is never silently
overwritten.

## Motion grammar

Normal decision state is visually calm. Active fighter, target, health, both
Charge Strips, available Moves, costs, and Team Trait state remain obvious.

Starting a Move creates a short presentation lock. During that lock the game can
use:

- aggressive crop and camera push;
- panel slide, wipe, split, stack, and hard cut;
- two-frame pose swap;
- anticipation squash and release stretch;
- impact frame, hit stop, recoil, shake, flash, and particles;
- reaction insert and decisive reset to the stable arena composition.

The player and AI cannot issue commands while the presentation lock is active.
Reduced motion simplifies travel and shake while preserving the same combat
timing and information.

## Colour rule

Use a stable dark ink and warm light foundation, then no more than two loud
scene accents at once. Arena and Character palettes may vary. Brightness comes
from deliberate contrast and large colour masses, not from putting every accent
on every surface.

The current risograph/archive palette is not the release target. Palette
replacement must be tested as complete battle, menu, selection, and result
frames rather than approved as isolated swatches.

## First proof batch

Before producing the full raster package, make and compare:

1. one battle composition with Tux and Viking;
2. one Combat Type/Team Trait selection screen;
3. one Move presentation sequence shown as four keyframes;
4. one collection card for each of the six launch Characters;
5. wide desktop and narrow portrait variants of the same battle state.

The proof passes only if opaque art feels intentional, both Charge Strips are
equally understandable, available Moves are unmistakable, and the six
incompatible Characters still look as though they belong to one game.
