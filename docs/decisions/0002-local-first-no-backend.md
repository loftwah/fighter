# ADR 0002: Local-first prototype

Status: accepted for V2

The prototype stores preferences and three save slots locally and builds as a static web bundle. It does not require authentication, a backend, cloud saves, telemetry, or multiplayer.

Persisted schemas are explicitly versioned so a later sync layer can migrate
rather than infer. `docs/release-roadmap.md` now assigns PWA work to V2.1,
Cloudflare-backed accounts/cloud saves to V2.2, native packaging to V2.3, and
server-authoritative multiplayer to V2.4. Each later boundary still requires
its own architecture and privacy decision before implementation.
