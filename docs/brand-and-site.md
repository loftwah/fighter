# LOFTWAH FIGHTER brand and public site

Status: **AUTHORITATIVE PUBLIC IDENTITY AND SITE CONTRACT**

Created: 2026-07-31

This document owns public naming, the canonical domain, landing-page truth,
browser metadata, and promotional-art boundaries. `DESIGN.md` continues to own
the implemented visual system.

## Naming

| Context                                  | Required form                  |
| ---------------------------------------- | ------------------------------ |
| Player-facing game title                 | **LOFTWAH FIGHTER**            |
| Spoken or sentence-case title            | **Loftwah Fighter**            |
| Repository and internal project identity | `loftwah/fighter`              |
| Canonical public URL                     | `https://fighter.loftwah.com/` |
| First frozen release                     | **V2**, tagged `v2.0.0`        |

The slash is repository notation. It does not appear in the player-facing
wordmark, browser title, social title, spoken name, or store listing.

Stable content IDs, save namespaces, and migration identifiers do not change
merely because public naming changes later.

## One-sentence description

LOFTWAH FIGHTER is a local-first browser squad battler where players collect
Characters, arrange a one-to-three-Character Lineup, and commit Moves on shared
real-time Charge Strips.

## Public promise

The landing page must make three things understandable before asking the player
to enter:

1. this is a playable squad battler, not a development dashboard;
2. timing and reading both Charge Strips creates the central battle decision;
3. Story, Quick Fight, and Tournament are distinct ways to play.

The primary action is **Play V2** or a similarly explicit play action. It opens
the Main Menu without silently starting Story, Quick Fight, Tournament, music,
or a battle.

## Truthful proof available in V2

- six release Characters and eighteen Moves;
- one-to-three-Character Lineups;
- one complete short Story proof;
- unrestricted Quick Fight setup;
- one complete three-round Tournament and illustrated Trophy;
- local Player profiles and local-first saves;
- responsive browser play;
- visible player and opponent Health, Charge, readiness, and Lineups.

Do not publish player counts, ratings, testimonials, press quotes, release
dates, prices, rankings, online multiplayer claims, native-app availability, or
other unsupported proof.

## Landing-page structure

The final composition is owner-selected through the
[landing-page composition study](landing-page-comps.md), but the shipped
surface must contain:

- LOFTWAH FIGHTER as the unambiguous title;
- one concise gameplay promise;
- one dominant **Play V2** action;
- the approved launch-roster ensemble;
- a simplified, truthful demonstration of the Charge decision;
- clear Story, Quick Fight, and Tournament explanations;
- a route to How to Play and the development roadmap;
- a local-first/browser availability note;
- an accessible footer with repository/project provenance where appropriate.

The page is part of the existing web application and shares its design tokens,
assets, semantic controls, reduced-motion preference, and responsive code. It
must not become a separate gameplay build.

## Canonical metadata

- Title: `LOFTWAH FIGHTER · Pick Your Fight`
- Canonical URL: `https://fighter.loftwah.com/`
- Description: `Build a three-Character squad and fight on a shared real-time Charge Strip in LOFTWAH FIGHTER, a local-first browser battler.`
- Social card type: large image
- Current social preview source:
  `image.intro.launch-roster`

Before public launch, produce a dedicated `1200 × 630` registered social image
so messaging apps do not depend on a gameplay crop.

## Domain and deployment

`fighter.loftwah.com` is the canonical production hostname. Preview deployments
may use provider URLs, but they must not emit those URLs as canonical metadata.
When Cloudflare hosting is adopted:

- DNS and deployment credentials remain outside the repository;
- the checked `dist/` artefact is deployed rather than rebuilt from unknown
  source;
- production deployment uses a protected GitHub environment;
- redirects preserve the canonical host and HTTPS;
- no backend is required for V2.

## Copy voice

Use Australian English. Headlines are short, direct, playful, and specific.
Body copy explains the real decision without lore fog or invented grandeur.
Prefer the game vocabulary—Character, Lineup, Move, Charge, Story, Quick Fight,
Tournament, Trophy—over generic marketing terms.

## Artwork rule

Public artwork follows the same Saturday-Night Toybox bitmap language and
opaque rectangular production model as the game. Reuse approved art when it
communicates the required truth. Generate new art only for a named crop,
campaign, social, release, store, or documentation need, then register its
logical ID and preserve its prompt/source record through
[promotional-art-production.md](promotional-art-production.md).
