# ADR 0002: Local-first prototype

Status: accepted for V2

The prototype stores preferences and versioned game data locally and builds as
a static web bundle. The original three flat progression slots are a
transitional implementation superseded by the Player Profile plus one Story
Save per Story definition target accepted on 2026-08-07. It does not require
authentication, a backend, cloud saves, telemetry, or multiplayer.

Persisted schemas are explicitly versioned so a later sync layer can migrate
rather than infer. `docs/release-roadmap.md` now assigns PWA work to V2.1,
optional accounts/cloud saves to V2.2 and native packaging to V2.3. Multiplayer
has no committed milestone. Each later boundary still requires its own
architecture and privacy decision before implementation.
