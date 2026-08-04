# ADR 0004: Multiplayer is the final planned feature milestone

Status: accepted on 2026-07-31

## Context

The earlier roadmap combined optional accounts, cloud saves, and multiplayer in
V2.2. That understated multiplayer's product and operational cost. A reliable
network battle also requires authoritative timing, versioned transport,
reconnect, desynchronisation recovery, reward trust, cheating resistance,
matchmaking, privacy, moderation, capacity planning, cost controls,
observability, incident response, and permanent backend operations.

Building those systems before the offline game is tight would increase scope,
make balance harder to read, and create infrastructure whose rules are still
unsettled.

## Decision

- V2 remains the tight six-Character web release.
- V2.1 adds content breadth, SFX, and PWA installation.
- V2.2 adds optional accounts and cloud saves, but no network battles.
- V2.3 proves native development builds from the shared codebase.
- V2.4 is the final currently planned feature milestone and owns
  server-authoritative multiplayer.
- Public native distribution may follow V2.3 and does not wait for multiplayer.
- V2–V2.3 preserve deterministic, side-agnostic domain seams but do not add a
  remote controller, multiplayer UI, sockets, matchmaking, match rooms, or
  speculative online rewards.

## Consequences

The team can refine combat feel, content, progression, responsive web, PWA,
accounts, cloud saves, and native packaging without carrying network-game
failure modes. V2.4 begins with a local two-client authoritative coordinator,
then private Cloudflare matches, authenticated friend matches, and only then
public matchmaking.

Deferring implementation does not mean ignoring architecture. Explicit seeds,
serialisable commands, controller ownership outside the combat domain,
versioned reports, and deterministic replay remain protected. The detailed
future boundary is recorded in
[the multiplayer seam](../multiplayer-seam.md).
