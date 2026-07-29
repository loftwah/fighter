# Repository instructions

## Authority

- `docs/game-design.md` is the product and rules source of truth.
- `docs/technical-design.md` is the architecture source of truth.
- `DESIGN.md` is the implemented visual-system source of truth.
- `conversation.txt` and `walkthrough-questions.md` are historical inputs. Do not implement a historical statement that conflicts with the authoritative documents.
- When a rule changes, update the authoritative document, its tests, and relevant content schema in the same change.

## Runtime and commands

- Enter through `mise`; do not assume a globally installed Node or pnpm.
- Use Node 22 and pnpm 11 as pinned in `mise.toml`.
- Run `mise run check` before handing off code.
- Use the asset tasks rather than overwriting approved generated assets by hand.

## Architecture

- Domain/gameplay modules under `src/combat`, `src/economy`, `src/progression`, `src/missions`, `src/store`, `src/stories`, and `src/tournaments` must not import Phaser.
- Phaser belongs under `src/game` and consumes semantic domain events.
- Content is data. Adding a character, action, story, mission, store entry, or tournament should not require a new renderer or bespoke domain branch.
- Random behaviour must use an explicit seed.
- Stable logical asset IDs must be resolved through registries; content must not depend on fragile filenames.
- Preserve local-first save compatibility. If a persisted shape changes, add an explicit migration or bump the development schema and document the reset.

## Product guardrails

- Do not add open-world walking, map traversal, backend requirements, multiplayer, monetisation, or mobile packaging without an accepted design change.
- Failure stays forgiving. Difficulty must not gate story progress or punish the player for changing it.
- Never silently scale old encounters to the current player level.
- Rectangular and square art, two-frame swaps, and kinetic panel motion are the presentation language.
- Missing images resolve through the asset fallback chain. Missing dialogue and SFX resolve to silent placeholders.

## UI and accessibility

- Core controls remain semantic DOM controls even when Phaser renders the battle field.
- Support keyboard focus, touch-sized targets, reduced motion, visible labels in addition to colour, and independent music/SFX/dialogue settings.
- Avoid generic rounded dashboard cards, glassmorphism, neon sci-fi HUD styling, and unbounded decorative animation.
