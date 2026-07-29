# ADR 0002: Local-first prototype

Status: accepted

The prototype stores preferences and three save slots locally and builds as a static web bundle. It does not require authentication, a backend, cloud saves, telemetry, or multiplayer.

Cloudflare and observability remain future decisions. Persisted schemas are explicitly versioned so a later sync layer can migrate rather than infer.
