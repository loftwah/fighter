---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["src/main.ts", "src/styles.css", "src/app/App.ts"]
---

# Launcher, battle, and Developer Lab surface brief

- Scope: desktop-first launcher, common battle surface, pause sheet, and development-only operator lab; visitor mode is Operate.
- Player task: deliberately choose Story Mode, Quick Fight, or Tournament, then control a battle through one large shared Charge Strip with three Move seals anchored directly above their costs.
- Developer task: launch a known scenario in one click, compose a custom one-to-three-Relic fight, start paused or live, inspect deterministic state, and use explicit convenience tools without touching progression accidentally.
- Required battle state: both Lineups and health, active portraits, enemy Charge, large player Charge field, Move cost/readiness/tier, timer, matchup, statuses, predicted values, pause, retry, and result.
- Required Developer Lab state: isolated-sandbox warning; six named presets; custom Lineups, levels, Move tiers, Patches, starting health/Charge, difficulty, seed, and time controls; Start Paused/Live actions; diagnostics; report export; profile/story convenience actions.
- Controller boundary: current player-facing modes are local human versus AI. Side ownership is explicit and side-agnostic so a second local human can be added without changing combat rules; a second human control surface is not part of this pass.
- Chosen composition: Fight Switchboard. Scenario tickets lead across the first working row, the custom matchup bench owns the centre, and diagnostics/convenience tools remain in a narrow ledger.
- Approved north star: `.impeccable/mocks/developer-lab-switchboard.png`; inspector-density reference: `.impeccable/mocks/developer-lab-scenario-desk.png`.
- Battle reference: Teeny Titans 2 informs only the structural relationship between a dominant charging bar and circular ability controls; Riot Relics keeps its own printed-object identity and semantics.
- Memorable moment: Charge visibly reaches a Move seal, its waiting label stamps to Ready, and the same control can be activated without the DOM node or keyboard focus moving.
- Semantic/code inventory: global Dev Lab entry; scenario tickets; Lineup selects; number/select fields; separate Start Paused/Live actions; stable circular Move buttons; readiness, predicted output, and visible tier labels; pause dialog with focus containment/restoration; inspector state; stepping and Charge controls; export actions; keyboard help.
- Existing-asset inventory: canonical Relic portraits remain in HTML; Phaser arena and idle stills remain unchanged; no new raster asset is required for the operator surface.
- Responsive commitment: preset tickets wrap; custom Lineups stack before diagnostics; the Charge field remains full-width and all three Move seals retain touch-sized targets on narrow screens.
- Safety: development battles and debug mutations are labelled and cannot award Stamps/XP, update Missions/Story, or alter a tournament run.
- Unresolved: future local-human enemy controls will reuse the side-agnostic command surface after controller assignment is proven here.
