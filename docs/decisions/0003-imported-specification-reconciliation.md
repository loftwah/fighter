# ADR 0003: Reconcile the imported battler specification

Status: accepted  
Date: 2026-07-31

## Context

The project received a large consolidated specification containing prior owner
decisions, source-game inspiration, proposed numeric baselines, implementation
guidance, and a handoff sequence intended for a new repository.

This repository is not new. It already has authoritative documents, a tested
headless combat engine, persistence migrations, mode orchestration, and an
implemented presentation system. Treating the import as an unconditional
replacement would reintroduce settled questions and regress direct owner
requirements.

## Decision

The import is a high-priority design input, reconciled requirement by
requirement through `docs/specification-alignment.md`.

- Compatible locked decisions are promoted into `docs/game-design.md` and
  `docs/technical-design.md`.
- Numeric baselines are adopted only when they improve or clarify the current
  system and remain data-driven.
- Direct owner instructions and existing evidence-backed parity decisions win
  documented conflicts.
- Missing capabilities remain explicit backlog items rather than documentation
  claims.
- The full imported document is not duplicated into the repository.

## Consequences

- Future agents have one compact traceability source instead of several
  near-identical GDDs.
- Target locking, exact nine-position tuning, six-character Tournament
  registration, faster Charge pacing, and continuous Trait contribution are
  now implemented and tested.
- Full presentation pauses, the existing Type cycle, five allocated stats,
  direct duplicate enhancement, and progression-neutral Quick Fight remain
  deliberate deviations.
- Fixed-point integers, versioned replays, full effect breadth, and Profile
  Quick Fight remain visible implementation work.
