# ADR 0005: Multiplayer has no committed milestone

Status: accepted on 2026-08-07

## Context

The earlier programme reserved V2.4 for server-authoritative multiplayer. The
owner subsequently confirmed that the complete local solo game through V2.3 is
the desired product scope and that multiplayer may not be wanted at all.

Reserving a numbered milestone implied delivery intent and kept backend,
matchmaking, moderation, operational, and security questions in the active
programme even though none of them improves the current single-player game.

## Decision

- V2–V2.3 are the complete committed programme.
- Multiplayer has no version number, delivery date, or active owner question.
- Existing deterministic and transport-neutral seams remain because they are
  good local architecture, not because they promise online play.
- `docs/multiplayer-seam.md` is retained as optional research only.
- Any multiplayer implementation requires a new accepted design change and a
  separately scoped roadmap, product policy, security review, and operational
  gate.

## Consequences

No current view, persistence change, account feature, native shell, or release
gate depends on multiplayer. Optional V2.2 accounts and cloud synchronisation
remain useful for local-first identity and recovery without enabling network
battles. Historical V2.4 material stays traceable but is not executable scope.
