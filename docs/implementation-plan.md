# Prioritised implementation plan

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

The vertical slice also includes validated corrupt-save recovery, independent
slot selection, persistent Patch ownership/equipping, owned-instance combat
loadouts, exact participant XP, deterministic battle reports, idempotent
mission claiming, atomic store purchases, and story/tournament reward isolation.
The Cup persists carried Case health and interlude choices, awards a champion
badge once, locks the exact Case roster/builds when a run opens, resets to
Round 1 after a loss, and unlocks the final story print. Completed replays pay
the Cup purse again by design.

## Next — system breadth

1. Move reordering, tiers, stat allocation, selling, and favouriting.
2. Quick Fight configuration and unrestricted roster.
3. Save export/import after schema stabilisation.

## Later

- expanded stories and cast;
- balance tools and simulation batches;
- PWA/offline decision;
- mobile-specific composition and optional Capacitor;
- Cloudflare sync/identity;
- ElevenLabs generation;
- telemetry provider;
- multiplayer feasibility.
