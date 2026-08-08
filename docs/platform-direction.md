# From fighter to AI-operable game platform

Status: **STRATEGIC PRODUCT DIRECTION — NOT RELEASE SCOPE OR IMPLEMENTED ARCHITECTURE**

Created: 2026-08-08

## Purpose and authority

This document preserves the long-term direction that grew out of LOFTWAH
FIGHTER: use one maintained, known-good game foundation to create, release, and
operate multiple coherent games with substantial AI assistance.

It is intentionally a direction document rather than a platform specification.
It does not override:

1. `docs/v2-release-spec.md` for V2 scope and freeze;
2. `docs/release-roadmap.md` for accepted milestone scope;
3. `docs/game-design.md` for current player-facing rules;
4. `docs/technical-design.md` for implemented architecture; or
5. `docs/brand-and-site.md` for the LOFTWAH FIGHTER identity.

An idea recorded here becomes implementation work only when the release roadmap
accepts a bounded proof or milestone. The current repository must not be
restructured merely to resemble the future described below.

## How the project arrived here

The public-safe origin is straightforward. The project began as an experiment
in how quickly one person could make a small fighting game with modern
AI-assisted development. As the game became real, the same question kept
appearing:

> If an agent can help produce this much of the game, why hard-code a decision
> that the next game will need to make again?

Characters and Moves became validated data. Randomness became seeded. Art and
audio gained logical IDs, fallbacks, and repeatable build tasks. Story and
Tournament content began moving towards reusable definitions. Release gates,
migrations, provenance, and agent instructions became as important as the
runtime itself.

The objective therefore changed. AI was no longer useful only for building one
game. A maintained game could become the first proven gameplay capability in a
system that turns a high-level brief into a distinct, maintainable product.

The pace can feel urgent because AI capabilities, tools, and distribution
opportunities are changing quickly, while every improvement to the maintained
foundation can compound across later products. That urgency is a reason to
preserve the direction and finish useful proofs. It is not permission to build
speculative abstractions faster than they can be validated. The antidote to
panic-building is an explicit destination, a protected current release, and
small proofs with exit criteria.

This account deliberately names no former employer, private system, client,
colleague, or non-public experience. Semantic versioning, backwards
compatibility, dependency management, staged releases, migrations, automated
validation, and approval gates are established software-engineering practices.
Their value here comes from applying them coherently to a fleet of games.

## North star

The long-term experience is:

> Describe the game or campaign in ordinary language. The system researches
> the subject where appropriate, turns the intent into reviewable product and
> content decisions, creates the required material inside a known-good gameplay
> grammar, validates the result, and produces a release candidate that can be
> maintained after launch.

The person supplying the idea should not need to know the combat engine,
content schemas, art manifest, build system, store requirements, or release
workflow. A conversational interface may eventually gather the brief and
resolve ambiguity. The canonical input used by the repository may eventually
be structured, but this document does not assume that a literal form, one
schema, or one interface is already the right answer.

The desired product loop is broader than game generation:

```text
idea, trend, or customer brief
  → research and concept
  → reviewable product proposal
  → world, characters, story, gameplay content, and assets
  → automated validation and human approvals
  → web/PWA release candidate
  → supporting content and optional merchandise candidates
  → observation and iteration
  → optional native promotion and continued operation
```

“Commercially releasable” means that an artefact can pass the relevant quality,
rights, policy, platform, and owner gates. It does not mean that generated work
may be published automatically or that perfect balance can be promised.
“Balance-tested against declared tolerances” is a defensible future capability;
“perfectly balanced” is not.

## This is constrained generation

The goal is not to accept any prompt and generate arbitrary application code or
an arbitrary game engine.

The maintained platform should supply a known mechanical and production
grammar. An agent receives substantial creative freedom inside explicit
boundaries:

- what may change for an individual product;
- what must remain stable for reliability and compatibility;
- what valid Characters, Moves, Stories, Tournaments, assets, and saves look
  like;
- what evidence is required before a generated result is accepted;
- which actions incur cost or create an external effect;
- which decisions require human approval; and
- how the product can be migrated or retired later.

The fighter is the first gameplay capability in that grammar. It must first
prove that substantially different products can share its mechanics without
becoming shallow reskins or divergent code forks.

## Current truth

The repository contains promising seams, not a finished game-generation
platform.

| State           | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proven now      | One deterministic combat engine; seeded reports and replay; validated Character, Move, Accessory, Story, and Tournament concepts; stable logical asset IDs and fallbacks; local schema migrations; Story, Quick Fight, and Tournament orchestration; opaque framed-shot art production; current music; a Remotion demonstration project; one repository quality gate.                                                                            |
| Partly proven   | Generic Story Level steps exist beside First Run-specific branches; image and Trophy production retain useful records but are not one provider-neutral generation system; Character rights metadata exists but all launch records still require distribution review; V2 content authoring is documented but has not produced a second independent game; release engineering versions this application, not a fleet-facing platform contract.     |
| Not implemented | A canonical product brief; automated web-research capture; product/world consistency records; a configurable public identity boundary; multiple independently releasable products; fleet compatibility or uplift; remote content; telemetry; consumer monetisation; merchandise fulfilment; a social-content library contract; generated voice/SFX production; native store releases; reusable mini-games; a second primary gameplay capability. |

The code also contains important coupling that a real re-theme will expose. The
LOFTWAH FIGHTER identity appears in public metadata and application copy,
First Run remains explicit in Story and persistence code, launch content is
registered directly in TypeScript, and the application controller still owns
substantial orchestration. These are observations, not instructions to extract
frameworks pre-emptively.

Until a second coherent product has been built and compared, the accurate claim
is:

> LOFTWAH FIGHTER is being made increasingly data-driven and agent-operable,
> with the long-term aim of becoming the first gameplay foundation of a
> reusable product line.

Do not market the current repository as an autonomous game studio or finished
white-label platform.

## What may vary and what should improve centrally

A useful working principle is:

> Product identity should be replaceable where practical. Reliability,
> compatibility, accessibility, and the quality of proven gameplay should
> improve centrally.

Likely product-specific concerns include theme, setting, public identity,
characters, factions, terminology, lore, stories, dialogue, visual and musical
direction, environments, promotional material, content breadth, policy, and
some supported progression or economy choices.

Likely central concerns include deterministic game rules, reusable effect
vocabularies, semantic controls, save compatibility, validation, asset
resolution, accessibility, release evidence, migrations, and the common
behaviour of proven modes.

That boundary is a hypothesis. The first real re-theme must produce a change
inventory showing what varied, what was awkward, what was accidentally coupled,
and what genuinely deserves extraction. One instance is not enough evidence
for a universal abstraction.

## Brief-driven creation

A future brief may need to express:

- the subject, purpose, audience, tone, and desired player response;
- visual, musical, dialogue, and voice direction;
- source material and required research;
- required and prohibited content;
- desired characters, factions, stories, lore, and educational outcomes;
- supported gameplay modes and progression expectations;
- monetisation and merchandise expectations;
- web, PWA, native, and other distribution expectations;
- brand material, languages, accessibility, rating, and policy constraints;
- copyright, trade mark, likeness, licence, cultural-care, and commercial-use
  constraints;
- analytics, privacy, operational, and release requirements; and
- explicit approval owners and budget limits.

This is an input inventory, not a frozen schema. The first brief contract should
be derived from a real second product and record `unknown`, `not applicable`,
and unresolved decisions honestly. A conversational intake can produce the
canonical input later; no bespoke customer portal is required to prove the
workflow.

## Research, facts, and invented canon

Research may be part of product creation, particularly for history, sport,
politics, education, organisations, current events, military subjects, popular
culture, communities, and trends. The system should be capable of creating
substantial lore and informational content rather than a handful of shallow
profiles.

Where factual accuracy matters, sources, factual claims, interpretations, and
invented canon must remain distinguishable. A future product should be able to
answer:

- which sources informed this statement or design;
- when time-sensitive research was checked;
- what is a factual claim, creative transformation, satire, or fictional canon;
- which claims require subject-matter or customer review; and
- what must be corrected or remotely updated when the real world changes.

Do not bake one subject area into the core. An Australian tri-service-inspired
fighter is a useful example because personnel archetypes, equipment, vehicles,
history, education, recruitment, community, and veteran support could be
translated into original characters and Stories. It is not a request for
military-specific engine branches.

## Rights, policy, and publication safety

Technical ability is not distribution permission. A private experiment based
on a trend, public figure, sport, army, film, meme, or recognisable character
does not automatically become a lawful commercial game or merchandise line.

The workflow must eventually accommodate evidence and approval for:

- copyright and source licences;
- trade marks and organisational branding;
- personality, likeness, and publicity rights;
- public-domain status and the originality of the chosen interpretation;
- parody, satire, commentary, and jurisdiction-specific risk;
- generated-asset commercial terms;
- cultural, religious, military, political, and community policy;
- age ratings, consumer protection, platform policy, and advertising claims;
- educational, recruitment, health, or support information that requires
  accuracy; and
- the separate rights required for merchandise.

The platform should support original transformation, but renaming a protected
subject or changing its appearance is not by itself a rights clearance. Public
release, paid promotion, native submission, and merchandise publication are
natural human approval gates. Legal questions require qualified review; the
repository should preserve the evidence needed for that review rather than
pretend to encode a universal legal engine.

Customer or organisational policy may eventually be supplied as part of a
brief. The capability is “obey a reviewed policy input”, not “hard-code every
possible organisation's policy”.

## Coherent worlds and reusable content

One generation run should produce a coherent identity, not unrelated assets.
The Character in the game, story art, promotional video, voice, social post,
and merchandise candidate should share a recognisable appearance, personality,
terminology, relationships, and world rules.

Consistency may eventually require canonical reference material for visual
identity, character voice, lore, relationships, terminology, music, and
prohibited drift. The exact representation should be learned through content
production. The repository does not need a speculative `world/` hierarchy or a
universal lore database now.

Generated product content should continue to use stable logical IDs. A display
name, model provider, file name, or public rebrand must not become a fragile
foreign key.

## Gameplay and Story direction

The existing three major modes remain the first supported product grammar:

- **Quick Fight** provides the immediate, repeatable game;
- **Tournament** provides multi-round survival with carried Health and
  between-fight decisions; and
- **Story** provides level-based progression through ordered content, fights,
  Tournaments, rewards, choices, and other supported steps.

Story content should feel like part of a game rather than a web article. Its
presentation may grow through registered backgrounds, character plates,
dialogue, narration, music, sound, transitions, slideshows, video, choices, and
light interaction. That does not imply a walkable world, full RPG, or universal
visual-novel engine.

Mini-games may later become reusable Story steps when a concrete product needs
one. They should be known-good, validated gameplay capabilities with explicit
save, input, accessibility, and release behaviour. The system should not emit
an arbitrary unreviewed JavaScript mini-game for each trend.

Fighting is the first primary gameplay capability, not a permanent definition
of the whole platform. A second primary gameplay type should be built only for
a concrete product. Comparing two real gameplay capabilities will reveal which
assumptions are fighter-specific and which belong to the broader product
system. Do not create an abstract universal game-engine interface before then.

## Asset and media generation

AI-assisted image, music, sound, voice, and video production is central, but
generation remains an offline authoring concern. A released game must not need
an AI provider to start or play.

The repository should teach an agent the requirements of this game: art
direction, reference use, character consistency, shot roles, dimensions,
cropping, opacity, text and mirroring policy, audio identity, compression,
fallbacks, and runtime purpose. Generic prompting is insufficient.

Providers and models will change. OpenAI image generation, ElevenLabs,
music-generation systems, Remotion, and media-processing tools are current or
plausible inputs, not permanent domain dependencies. Provider credentials,
billable actions, and model-specific adapters remain outside game rules and
require explicit spend controls.

For important generated artefacts, retain enough provenance to answer:

- which tool, provider, model, and version produced it;
- which prompt, seed, settings, and source references were used;
- when it was produced and under what usage terms;
- which product, Character, Story, or campaign uses it;
- which derived artefacts came from it;
- whether it was rejected, approved for development, or approved for a named
  distribution use; and
- whether it can be regenerated or replaced.

Provenance should be proportional to risk and value. It must make important
work reproducible without turning every low-risk draft into bureaucracy.
Approved generated assets are never silently overwritten.

## Supporting content and programmatic video

Creating a game should naturally create a library that external publishing
tools can consume. This repository does not own the user's social scheduler and
must not grow a social network, scheduler, or publishing service merely because
promotion matters.

Useful outputs may include character introductions, lore, artwork, gameplay
captures, short clips, memes, launch material, update announcements,
Tournament material, soundtrack content, seasonal material, evergreen posts,
and merchandise promotion.

Programmatic video is particularly useful because it can compose canonical
game assets without asking a generative-video model to rediscover each
Character. Remotion or a replaceable equivalent may support character reveals,
fight promos, trailers, story teasers, update videos, merchandise reveals,
soundtrack visualisers, and lore shorts. The current Remotion demonstration is
evidence of the medium, not a complete template library.

The future hand-off needs a documented content inventory, identity, intended
channel/use, dimensions or duration, copy, approval state, and stable source
references. Its exact storage and scheduler interface remain open.

## Merchandise and commerce

Successful products may produce approved print-on-demand merchandise. Character
and Story work can create candidates for shirts, posters, stickers, faction
art, event art, jokes, and other products. New Story events or popular
Characters may later trigger scheduled candidate generation.

Printful is one plausible fulfilment provider, not part of game rules or a
permanent platform dependency. Commerce should sit behind a replaceable
integration boundary. Web and native experiences have different payment,
linking, disclosure, and platform-policy constraints, which must be reviewed at
the time of implementation.

Every merchandise item requires its own asset quality, dimensions, colour,
rights, product-copy, price, sample, and publication approval. Approval of an
image for in-game use does not automatically approve it for sale on a shirt.

## Economy and monetisation

No final economy or monetisation model has been selected. Different products
may be free, sponsored, commissioned, premium, advertising-supported, cosmetic,
content-funded, collection-driven, merchandise-supported, or some reviewed
combination.

The existing collection, duplicates, progression, Store, and upgrades create
useful design evidence. They do not justify adding real-money purchases or
gacha-style collection without a complete economy design, age/rating review,
odds and disclosure policy, platform compliance, consumer-protection review,
analytics, support, refunds, and failure handling.

An educational, recruitment, community, or sponsored game may deliver its
commercial value without charging the player. Monetisation is a product choice,
not a universal core feature.

## Web-first experiments and native promotion

Web/PWA is the preferred canary for a topical or experimental product. A
conceptual `insert-trend-here.loftwah.com` launch makes it cheap to test whether
an idea deserves more investment. Speed matters, but the output must still be a
coherent interactive concept rather than low-quality topical artwork pasted on
the fighter.

A product lifecycle may be:

```text
proposed → approved for prototype → web canary → observed
         → stopped, archived, or iterated
         → promoted to maintained product
         → optionally promoted to native distribution
```

Native iOS and Android distribution remains a promotion path, not a requirement
for every experiment. Developer accounts, signing, privacy material, ratings,
store assets, review, update policy, support, and app-store acceptance create
real work beyond a web build. Desktop distribution remains an evidence-led
option rather than a current promise.

## Base releases and a fleet of products

The long-term operational goal is to maintain the valuable engineering once
and uplift active products without turning each one into an abandoned fork.

Desired behaviour includes:

- explicit compatibility between a product and the base capabilities it uses;
- semantic release meaning after a stable compatibility boundary exists;
- backwards compatibility where practical;
- explicit migrations for persisted or content-contract changes;
- automated compatibility checks, tests, simulations, builds, and staging;
- human approval at important product, rights, policy, economy, native, or
  publication gates;
- a supported-version policy when real customers or active products require
  one; and
- product lifecycle states such as experimental, active, maintenance-only,
  frozen, archived, and unsupported.

A patch could eventually flow to compatible active products with minimal
intervention. A backwards-compatible capability release could be adopted or
enabled deliberately. A breaking release could leave a product temporarily on
a supported older line while an agent prepares and validates its migration.

That semantic meaning does not exist merely because `package.json` currently
says `2.0.0`. Today that version identifies LOFTWAH FIGHTER. A fleet-facing
compatibility contract must be earned by at least two independently releasable
products and must state exactly what is versioned: runtime behaviour, content
schema, save schema, product content, platform shell, or some measured
combination.

Repository topology remains open. Do not assume forks, one monorepo, many
repositories, packages, templates, or a remote product registry. Select the
smallest model that can prove independent builds, controlled updates, and
non-divergence after the first real product comparison.

## Automated quality and observation

Autonomous creation requires increasingly strong autonomous rejection.
Depending on the product, validation may eventually cover:

- malformed content, missing states, references, localisation, or fallbacks;
- asset dimensions, opacity, cropping, text, consistency, file size, and
  corruption;
- audio validity, loudness, duration, clipping, and missing subtitles;
- impossible Story or Tournament progression;
- deterministic replay and save migration;
- accessibility, responsive geometry, performance, and platform builds;
- rights, source, approval, and attribution completeness;
- seeded balance simulations and declared win-rate or completion tolerances;
- supporting-content and merchandise production requirements; and
- the complete release candidate rather than isolated generated files.

Telemetry may later close the operating loop:

```text
release → observe → explain → recommend → review → update
```

It could reveal abandonment, difficulty, content discovery, performance, or
commercial behaviour. It must not become invisible surveillance. Provider,
event taxonomy, consent, privacy, retention, deletion, cost, regional, customer,
and child-safety decisions remain open. V2 deliberately has no remote
telemetry.

## Commercial hypotheses

The same maintained foundation may eventually support:

- games owned and operated by Loftwah;
- fast topical or trend experiments;
- sponsored or commissioned games;
- educational, community, recruitment, or promotional campaigns;
- properly licensed IP products; and
- hosted maintenance, content updates, analytics, native release work, and
  continuing campaign services.

These are business hypotheses, not separate architectures or revenue promises.
Recurring operation and content may prove more valuable than direct player
spend. Evidence from real releases should decide packaging, pricing, service
levels, and which products remain active.

## Evidence-gated path

The roadmap should advance towards this direction in this order:

1. **Finish the known-good fighter.** Protect the V2 release contract and prove
   the complete fun, quality, content, save, and release loop.
2. **Prove radical variation.** Create one coherent, rights-safe re-theme using
   the existing fighter and record every identity/content/configuration/code
   change. Do not create a fleet system first.
3. **Extract only the earned product boundary.** Compare the two products,
   remove accidental coupling, and prove two independent builds without
   duplicating combat or accessibility behaviour.
4. **Prove brief to proposal.** Use one real brief and research record to
   produce a reviewable concept, content inventory, budget, rights risks, and
   approval plan before expensive generation.
5. **Prove one generated web canary.** Produce, validate, stage, and deliberately
   release one coherent experimental product. Record cost, elapsed time,
   failures, manual intervention, and reusable learning.
6. **Operate before scaling.** Decide how an active product is observed,
   updated, supported, frozen, or retired. Add economy, remote content,
   merchandise, or supporting-content integrations only for a real product
   that needs them.
7. **Earn fleet uplift.** When at least two active products consume central
   improvements, define compatibility, support windows, migrations, staged
   rollout, and approval behaviour from measured failure modes.
8. **Promote winners.** Use PWA and native distribution for products whose
   retention, purpose, customer commitment, or commercial evidence justifies
   the additional operational cost.
9. **Add another gameplay capability only on demand.** Let a concrete second
   primary game reveal the true platform boundary.

The exact release numbers and repository layout for steps 2–9 are deliberately
unassigned. `docs/release-roadmap.md` owns their adoption.

## Decisions deliberately left open

- the canonical brief format and interview interface;
- the boundary between base, product, world, campaign, and content pack;
- monorepo, multi-repository, package, template, or other topology;
- remote-updateable content and any CMS;
- research, generation, telemetry, commerce, fulfilment, hosting, and native
  providers;
- the first trend or commissioned canary;
- pricing, economy, advertising, collection, and gacha-style policies;
- the external social-content hand-off;
- the first reusable mini-game;
- whether and when a second gameplay capability is justified;
- the supported-version window and fleet release cadence; and
- the public name of any broader platform business.

An agent encountering one of these open decisions must gather evidence or seek
an accepted design change. It must not resolve uncertainty by creating a large
directory tree, universal schema, service, plugin system, or fork strategy.

## Directional completion test

This direction is genuinely proven only when the project can show all of the
following without hand-waving:

- at least two materially distinct, independently releasable products share
  centrally maintained gameplay and quality improvements;
- a high-level brief can become a reviewable, traceable product proposal;
- approved assets and content can be generated and regenerated consistently;
- each product can build, validate, release, migrate, and retire deliberately;
- rights, policy, spend, and publication approvals are visible;
- a web canary can be measured and either stopped or promoted cheaply; and
- central updates reduce total maintenance rather than creating hidden
  coordination work.

Until then, this document is a compass and a set of guardrails—not a claim that
the destination has already been built.
