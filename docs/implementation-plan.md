# Archived pre-V2 implementation plan

Status: **ARCHIVE EVIDENCE**

This plan records how the current vertical slice was assembled. It is no longer
the release backlog. `docs/v2-release-spec.md` owns the V2 milestone and
`docs/release-roadmap.md` owns later release scope.

## Now — vertical slice

1. Runtime, lint, format, typecheck, test, and build tasks through `mise`.
2. Validated initial content and stable asset registries.
3. Seeded two-team combat with actions, AI, switching, charge, statuses, class wheel, and reports.
4. Phaser Kinetic Print renderer plus semantic DOM battle controls.
5. Story nodes `00` → `07`, including store/mission unlocks, two authored
   encounters, the three-round Cheap Seats Cup, ending reward/rival reveal,
   reward/retry, and persisted path progression.
6. Local preferences and three save slots.
7. Existing soundtrack integration and silent SFX/dialogue fallbacks.
8. Generated MVP art integration.
9. Desktop and narrow-layout browser verification.
10. Stable bar-integrated Move controls, full-simulation pause, and a
    development-only scenario/inspection lab.

The vertical slice also includes validated corrupt-save recovery, independent
slot selection, persistent Patch ownership/equipping, owned-instance combat
loadouts, exact participant XP, deterministic battle reports, idempotent
mission claiming, atomic store purchases, and story/tournament reward isolation.
The Cup persists carried Case health and interlude choices, awards a champion
badge once, locks the exact Case roster/builds when a run opens, resets to
Round 1 after a loss, and unlocks the final story print. Completed replays pay
the Cup purse again by design.

## Next — system breadth

1. Authored Gold/Platinum Move patches, Enhancement Core conversion,
   selling, favouriting, and saved build presets. Move reordering, exact
   nine-position tuning, tiers, and stat allocation are implemented.
2. Accessory selection and a reusable setup policy shared by Story selection,
   Quick Fight, and Tournament Case selection.
3. Custom Quick/Tournament rules and an explicit progression-eligible Profile
   ruleset layered over the implemented Standard Build defaults.
4. Integer fixed-point combat quantities and versioned replay compatibility,
   preserving the implemented timestamped headless replay API.
5. Save import after schema stabilisation; profile and battle-report export are
   already implemented.
6. Extract the cohesive live battle-session controller from `App` once the
   Accessory and custom-match configuration contracts are stable.

## Later

- expanded stories and cast;
- expanded balance simulation batches built on Developer Lab scenarios;
- PWA/offline decision;
- mobile-specific composition and optional Capacitor;
- Cloudflare sync/identity;
- ElevenLabs generation;
- telemetry provider;
- multiplayer feasibility.
