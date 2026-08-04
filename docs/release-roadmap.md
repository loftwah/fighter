# LOFTWAH FIGHTER release roadmap

Status: **AUTHORITATIVE MILESTONE SCOPE**

Created: 2026-07-31

This roadmap states strict release requirements without prescribing a detailed
implementation backlog. `docs/v2-release-spec.md` owns V2 acceptance.

## Version policy

- `V2` means the first frozen release and maps to `v2.0.0`.
- `2.0.x` releases fix or refine V2 without adding planned feature breadth.
- `V2.1`, `V2.2`, `V2.3`, and `V2.4` are cumulative. A later release must
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
- The representative Tournament awards one unique illustrated Trophy to the
  selected Profile; Story completion requires every V2 Mission and Tournament,
  then identifies Quick Fight as the unrestricted end-game sandbox.
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
  requiring new engine or UI code.
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
- A versioned service boundary that can authenticate a future V2.4 match
  session without implementing matchmaking or network battles.
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

## V2.4 — multiplayer release

V2.4 is the last currently planned feature milestone. Nothing in V2–V2.3 may be
delayed by speculative multiplayer implementation; those releases preserve
only the documented domain and adapter seams.

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
the primary development loop, and it does not need to wait for V2.4
multiplayer.

## Beyond V2.4

The roadmap does not currently commit to:

- monetisation;
- open-world traversal;
- user-generated public content;
- guilds or social feeds;
- voice chat;
- a second gameplay implementation.

Any of these requires an accepted design change and its own release milestone.

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
- PWA, account/Worker, native, and multiplayer workflows are added at their
  owning milestones; V2 does not carry unused signing secrets or backend
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
