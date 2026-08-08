# LOFTWAH FIGHTER release roadmap

Status: **AUTHORITATIVE MILESTONE SCOPE**

Created: 2026-07-31

This roadmap states strict release requirements without prescribing a detailed
implementation backlog. `docs/v2-release-spec.md` owns V2 acceptance.
`docs/platform-direction.md` preserves the larger AI-operated product-line
direction but cannot add work to a milestone by itself.

## Version policy

- `V2` means the first frozen release and maps to `v2.0.0`.
- `2.0.x` releases fix or refine V2 without adding planned feature breadth.
- `V2.1`, `V2.2`, and `V2.3` are cumulative. A later release must
  preserve the accepted quality and compatibility of every earlier milestone.
- A milestone does not ship merely because its headline feature exists. Its
  complete release gate must pass.
- Milestones have no date until the preceding release provides enough evidence
  to estimate them honestly.

## V2 — first complete web release

### Required

- Six release Characters and eighteen Moves.
- Release-quality battle feel, readability, balance evidence, and explanation.
- A complete Quick Fight experience.
- One short end-to-end Story proof and one complete Tournament proof.
- A storage-agnostic global Player Profile with Story-owned collection,
  economy, progression, active Squad, and one local Story Save per Story
  definition. The same model remains usable without an account.
- One validated shared Lineup boundary used by Quick Fight, Story, and
  Tournament after their separate preset/build/ownership policies resolve.
- The representative Tournament keeps a locked Roster of up to six, persists
  Health across the run, repeats an unfinished fight while any Roster member
  lives, and ends only when every required opponent Squad is beaten, the whole
  player Roster is defeated, or the player forfeits.
- The representative Tournament awards one unique illustrated Trophy to the
  selected Profile. A Story-local win also records that Trophy in the Story
  Save without duplicating its global ownership. Story completion requires
  every V2 Mission and Tournament, awards the Story's completion item, then
  identifies Quick Fight as the unrestricted end-game sandbox.
- Coherent production-facing pages, views, navigation, local profiles,
  progression, recovery, settings, accessibility, and responsive layouts.
- A truthful public landing page at `fighter.loftwah.com` with a deliberate
  play action, gameplay proof, browser metadata, and direct paths into the
  project documentation.
- A maintained documentation hub that distinguishes authoritative contracts,
  authoring guides, owner actions, production records, and historical research.
- Mobile-first website quality on iPhone 14 plus a deliberate 16-inch 2024
  MacBook Pro desktop experience.
- Validated templates for adding Characters, Moves, encounters, Story content,
  Tournaments, and environments.
- Current music, with silent SFX and dialogue fallbacks.
- Feature freeze and `v2.0.0` release evidence defined by
  `docs/v2-release-spec.md`.

### Not in V2

- More than six release Characters.
- Substantial Story or Tournament content breadth.
- Produced SFX or dialogue.
- PWA installation.
- Accounts, cloud saves, multiplayer, or a required backend.
- Native store applications.

## V2.1 — content and installed-web release

### Required

- Expand from six to exactly twenty release-ready Characters: fourteen new
  Characters, each with provenance, complete art, three data-authored Moves,
  balance coverage, AI use, and authoring records.
- Release the first substantial Stories and Tournaments. V2's proof content may
  be retained, rewritten, or promoted, but V2.1 must offer at least one complete
  publishable Story and one complete standalone Tournament beyond a mechanics
  demonstration.
- Every shipping Tournament has its own registered illustrated Trophy. Custom
  Tournament authoring can select from a maintained generic Trophy set without
  requiring a new engine or per-Tournament UI branch.
- Ship the local custom Tournament builder over the same validated definition
  schema: editable name, mandatory generic Trophy, configured opponent Squads,
  at least one fight, and ordered fight/content/chance/recovery nodes. Custom
  Tournament deletion removes its dependent global Trophy record.
- Produce and integrate SFX for every shipping Move family and core UI,
  readiness, hit, status, victory, defeat, reward, and navigation event.
- Keep music, SFX, and dialogue independently controllable.
- Become an installable PWA with a versioned web app manifest, service worker,
  update/recovery UX, install assets, and an offline-capable application shell.
- Cache content selectively. Installation must not force the complete music and
  twenty-Character library into device storage.
- Preserve local-first play and provide a tested migration from every accepted
  V2 save.
- Demonstrate that the Character, Story, Tournament, environment, and audio
  templates can create the expanded content without bespoke engine branches.

### Release gate

- The complete V2 gate still passes.
- PWA install, update, rollback/recovery, storage pressure, offline launch, and
  content-cache behaviour pass on physical iPhone and Android reference devices.
- The twenty-Character roster remains readable and performant rather than
  becoming one initial download or decode burst.

## V2.2 — accounts and cloud-save release

### Required

- Optional Player accounts with secure sign-in, account recovery, account
  deletion, privacy controls, and explicit guest-to-account linking.
- Cloud save with schema-versioned sync, conflict handling, offline mutation,
  recovery, and no silent replacement of a newer local profile.
- Account export, deletion, retention, audit, rate-limit, support, and
  operational recovery paths.
- A versioned service boundary that could authenticate a future match session
  if multiplayer is separately approved, without implementing matchmaking or
  network battles in V2.2.
- Local Quick Fight and owned offline content remain playable without an
  account.

### Cloudflare direction

The intended platform is:

- Cloudflare Workers Static Assets for the web application;
- Worker API routes for account, save, and support boundaries;
- a reviewed identity implementation rather than hand-rolled password storage;
- D1 or another explicitly selected durable store for account/profile metadata;
- R2 only where versioned content or support artefacts benefit from object
  storage;
- explicit privacy, retention, observability, threat-model, cost, and region
  decisions before production data is collected.

Cloudflare is the preferred direction, not permission to couple the combat
domain to Worker APIs. Network, identity, and storage remain adapters around
the existing engine. V2.2 does not ship matchmaking, match rooms, remote battle
commands, or multiplayer UI.

### Release gate

- V2.1 remains fully functional without a network wherever its offline promise
  applies.
- Authentication and cloud save receive security, privacy, load, conflict,
  migration, deletion, cost, and incident-recovery reviews.
- The account identity and guest-linking methods are ratified before
  implementation becomes release-bound.

## V2.3 — native readiness and device-build release

### Required

- Package the shared web application with Capacitor unless a prototype proves
  that a different thin-container approach materially improves quality.
- Keep one gameplay, content, style, and domain source tree. Native projects are
  platform shells and integration adapters, not separate game implementations.
- Produce reproducible iOS and Android development builds from tagged source
  and run them on owned physical devices where available.
- Integrate lifecycle, safe areas, status/navigation bars, orientation, audio
  interruption, haptics where useful, deep links, offline storage, update
  policy, and platform-appropriate sharing/support.
- Preserve account, cloud-save, PWA, and responsive-web compatibility.
- Prepare store-grade icons, screenshots, privacy disclosures, support links,
  release notes, and review instructions without making public store
  distribution a V2.3 blocker.
- Test physical low-memory/background-resume behaviour and not merely desktop
  emulation.

### Release gate

- Device builds provide lasting game value beyond a repackaged website and pass
  the platform-readiness checklist.
- iOS and Android build pipelines are reproducible from a GitHub tag. Missing
  paid developer memberships may defer signing, TestFlight, closed testing, and
  public distribution without failing V2.3.
- Platform-specific code cannot decide combat results or fork content rules.
- The web and native applications consume the same versioned content and save
  contracts.

## Deferred multiplayer — no committed milestone

Multiplayer is not part of the committed V2–V2.3 delivery programme. Nothing in
those releases may be delayed by speculative multiplayer implementation. The
existing deterministic, side-agnostic domain and adapter seams remain useful,
but they do not promise a multiplayer release or reserve the label V2.4.

The requirements below are preserved as an optional future gate only. They do
not become backlog items until the owner accepts a separate design change.

### Required

- Live multiplayer uses the existing side-agnostic deterministic combat command
  model with a server-authoritative match coordinator. Clients submit intent;
  they do not submit trusted results or reward claims.
- Begin with friend/private matches, then add one discoverable public
  matchmaking path only after the private-match reliability gate passes.
- Match creation, authenticated seat assignment, ready state, authoritative
  seed and clock, ordered command acknowledgement, reconnect, timeout, forfeit,
  desynchronisation detection, result persistence, and replay evidence.
- Versioned protocol negotiation rejects incompatible client, content, engine,
  or save versions before a match starts.
- Abuse controls, rate limits, player blocking/reporting where communication or
  identity makes it relevant, operational support tools, and an emergency
  multiplayer disable switch.
- Multiplayer rewards cannot be forged and are never required for Story
  completion or ownership of offline content.
- Local Quick Fight, Story, Tournament, PWA, and owned offline content remain
  playable when multiplayer or the complete backend is unavailable.

### Cloudflare direction

- A Worker authenticates sessions and routes match creation.
- One Durable Object coordinates each authoritative match room and owns its
  ordered command stream.
- WebSockets carry versioned commands, acknowledgements, state snapshots, and
  recovery messages. Hibernation is used only where it preserves correct match
  timing and materially reduces idle cost.
- Durable storage retains only the minimum match/replay evidence required by
  the accepted retention and support policy.
- D1 or the selected V2.2 account store owns identity and durable match
  metadata; Durable Objects do not become an unbounded global player database.

Cloudflare is the intended adapter, not part of combat rules. The complete
pre-implementation seam and protocol checklist lives in
`docs/multiplayer-seam.md`.

### Release gate

- The exact ruleset, ranking policy, regions, latency budget, pause policy,
  disconnect outcome, reward policy, and matchmaking scope are ratified.
- Private matches pass deterministic replay, packet delay/loss, reconnect,
  duplicate/out-of-order command, version-skew, load, cost, security, cheating,
  privacy, moderation, migration, and incident-recovery tests.
- Public matchmaking launches only after staged capacity evidence and includes
  an operational rollback/disable path.
- A local or solo player loses no existing capability because multiplayer
  exists.

## Distribution after V2.3

After V2.3, a distribution release may ship signed iOS and Android store
applications once the game is ready and the required developer memberships,
privacy material, ratings, testing tracks, and review evidence exist. App Store
or Play Store distribution is deliberately not required while web play remains
the primary development loop, and it does not need to wait for multiplayer.

## Beyond V2.3

The roadmap does not currently assign a release number or delivery commitment
to:

- monetisation;
- open-world traversal;
- user-generated public content;
- guilds or social feeds;
- voice chat;
- a second gameplay implementation.

Any of these requires an accepted design change and its own release milestone.

The absence of a release number does not discard the longer product direction.
LOFTWAH FIGHTER is intended to become the first proven gameplay capability in a
system that can create and maintain materially different games from high-level
briefs. The direction includes research, coherent world/content generation,
provider-neutral asset production, web-first canaries, supporting content,
optional merchandise and monetisation, controlled native promotion, and safe
uplift of active products. `docs/platform-direction.md` owns that strategic
context and its safety boundaries.

## Unversioned product-line proofs

These are evidence gates, not accepted feature releases. They may be assigned
to versions only through normal change control. Safe discovery may accompany an
existing milestone when it directly satisfies that milestone—for example, a
V2.1 Character or Story template may record what a later product brief would
need—but speculative platform work cannot delay the owning release.

### Proof P0 — known-good fighter baseline

- Freeze V2 with its fun, quality, accessibility, deterministic report,
  content-template, migration, and release evidence intact.
- Preserve the current public identity and local-first behaviour.
- Record the cost and manual work required to add V2.1 content before claiming
  autonomous generation.

Exit: `v2.0.0` is accepted and the first content templates can recreate their
release structures without bespoke engine or renderer branches.

### Proof P1 — one radical re-theme

- Produce one coherent, rights-safe variation of the fighter using a real
  brief and the existing known-good mechanics.
- Inventory every changed identity, content, asset, copy, audio, build,
  persistence, and code concern.
- Identify accidental LOFTWAH FIGHTER and First Run coupling from evidence.
- Do not create repository fleet machinery, a customer portal, or a universal
  schema merely to complete the comparison.

Exit: the variation is playable and reviewable, and the comparison clearly
distinguishes configurable content from code that genuinely deserves
extraction.

### Proof P2 — earned product boundary

- Produce LOFTWAH FIGHTER and the re-themed product as independent release
  candidates while sharing the proven combat, accessibility, validation, and
  migration behaviour.
- Define only the minimum product identity/content contract required by those
  two builds.
- Keep public names, storage identities, content IDs, and assets from leaking
  between products.
- Record what is versioned and what compatibility currently means.

Exit: two products build and validate without copying the combat implementation
or forcing product-specific branches into the domain.

### Proof P3 — brief to reviewed proposal

- Use one real high-level brief and, where relevant, time-stamped source-backed
  research.
- Produce a reviewable concept, audience/purpose statement, character and Story
  plan, asset inventory, consistency anchors, rights/policy risks, generation
  budget, and approval plan before high-cost production.
- Preserve factual research separately from invented canon.
- Treat the input fields as learned evidence rather than a universal form.

Exit: an owner can approve, revise, or reject the proposal without reading the
game's internal schemas or paying for the complete asset run.

### Proof P4 — generated web canary

- Generate or author the approved content and media through explicit,
  provider-replaceable workflows with provenance and fallbacks.
- Reject invalid assets, content, Story/Tournament paths, builds, and release
  claims automatically where the repository has a declared contract.
- Stage and deliberately release one coherent web experiment.
- Record elapsed time, provider and human cost, failures, interventions,
  publication approvals, and reusable outputs.

Exit: the experiment can be stopped, archived, iterated, or promoted without
leaving an unmaintainable fork.

### Proof P5 — operate and uplift

- Define privacy-reviewed observation for a real active product rather than a
  speculative universal analytics taxonomy.
- Define experimental, active, maintenance-only, frozen, archived, and
  unsupported lifecycle behaviour as required.
- When at least two active products consume a central update, prove
  compatibility classification, migration, validation, staging, approval,
  rollback, and release.
- Add supported-version windows only when active product obligations justify
  them.

Exit: a central improvement measurably reduces fleet maintenance while each
product can remain, migrate, or retire deliberately.

### Optional proofs after product evidence

- Economy or monetisation for one product with consumer, platform, rating,
  support, refund, disclosure, and failure policy.
- A provider-neutral supporting-content hand-off to the existing external
  scheduler.
- Approved print-on-demand merchandise through a replaceable fulfilment
  adapter.
- PWA or native promotion for a canary whose purpose or traction justifies it.
- One reusable mini-game introduced by a concrete Story requirement.
- A second primary gameplay capability introduced by a concrete product, then
  compared with the fighter before any universal gameplay abstraction.

Repository topology, remote content/CMS, the canonical brief format, provider
selection, fleet release cadence, and the public platform identity remain open
until their owning proofs expose the requirement.

## Release engineering across milestones

- Pull requests and the main branch run `mise run check` in GitHub Actions.
- A release candidate builds the static `dist/` output once, uploads it as a
  workflow artefact, and deploys that reviewed artefact rather than rebuilding
  unknown source.
- Production deployment uses a protected GitHub environment with explicitly
  scoped Cloudflare credentials when Cloudflare hosting is adopted.
- Accepted versions use annotated Git tags and GitHub Releases. A Release links
  the exact source tag, web artefact, schema/migration notes, known issues, and
  owner acceptance evidence.
- PWA, account/Worker, and native workflows are added at their owning
  milestones; multiplayer workflows exist only after a separately accepted
  future milestone. V2 does not carry unused signing secrets or backend
  credentials.
- Public native-release jobs remain manual and environment-protected. They
  cannot run merely because a branch was pushed.

## Platform feasibility

The current TypeScript, Vite, Phaser, semantic DOM, and deterministic-domain
architecture is suitable for this roadmap:

- Apple's iPhone 14 reference has a 6.1-inch, `2532 × 1170` physical display;
  browser acceptance uses its actual safe-area viewport rather than treating
  hardware pixels as CSS pixels:
  <https://support.apple.com/en-us/111850>
- Apple's 16-inch 2024 MacBook Pro reference has a `3456 × 2234` native display;
  desktop acceptance uses the actual default-scaled browser workspace:
  <https://support.apple.com/en-us/121554>
- Cloudflare recommends Workers Static Assets for new static, SPA, and
  full-stack projects:
  <https://developers.cloudflare.com/workers/best-practices/workers-best-practices/>
- Workers supports SPA asset routing:
  <https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/>
- Durable Objects explicitly support stateful multiplayer coordination and
  WebSocket sessions:
  <https://developers.cloudflare.com/durable-objects/>
- Capacitor is designed to be added to an existing modern web project while
  retaining a web-focused codebase:
  <https://capacitorjs.com/docs>
- Home Screen web applications on Apple platforms support manifests,
  standalone presentation, service workers, and modern web-app capabilities:
  <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>
- Native iOS release still has to satisfy Apple's completeness, originality,
  quality, privacy, and minimum-functionality requirements:
  <https://developer.apple.com/app-store/review/guidelines/>
- A free Apple Account can test an app directly on owned devices through
  Xcode, with short-lived Personal Team provisioning. App Store distribution,
  TestFlight, and the full signing service require Apple Developer Program
  membership:
  <https://developer.apple.com/support/compare-memberships/>
- GitHub Releases bind tagged source to release notes and downloadable
  artefacts, while Actions workflow artefacts carry build outputs between jobs:
  <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository>
  and
  <https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts>

This is an easy evolutionary path only if the release gates preserve the
existing domain/platform boundary. Native distribution still creates separate
iOS and Android build artefacts and store work; it does not require a second
game codebase.
