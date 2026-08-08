# LOFTWAH FIGHTER audio bible

Status: **SELECTED DIRECTION — GENERATION PIPELINE NOT YET IMPLEMENTED**

Created: 2026-08-07

This document owns the creative direction for future generated SFX and
dialogue. `docs/audio-plan.md` continues to own the current runtime catalogue,
fallback behaviour, and generation safeguards. V2 keeps silent logical
fallbacks; produced SFX and dialogue remain a V2.1 production requirement.

## Premise

LOFTWAH FIGHTER sounds like **a battered imaginary arcade cabinet from a future
that never happened**.

The sound is colourful, wonky, tactile, physical, and handmade. It has modern
clarity without modern cinematic gloss. A good impact makes the player grin;
it does not pretend someone fired a military weapon in a film trailer.

## Material palette

### Physical layer

- worn plastic shells;
- sprung metal, latches, relays, and cheap switches;
- rubber stops and soft mechanical rebounds;
- knocked wood and plywood cabinet resonance;
- tiny motors, fans, buzzers, and toy mechanisms;
- bandwidth-limited cabinet speakers and imperfect transducers.

### Electronic layer

- unstable analogue circuitry;
- primitive digital synthesis;
- CRT interference and short electrical residue;
- toy synthesisers;
- crunchy early sampling;
- slight wow, flutter, pitch drift, and component instability;
- controlled modern editing and loudness rather than nostalgic mud.

Every generated sound should lead with a physical cause and finish with a
small failed-future electronic trace. The trace supports the action; it does
not become generic cyberpunk decoration.

## Character

Audio should feel:

- playful under pressure;
- chunky rather than enormous;
- dry and close rather than cavernous;
- surprising but immediately readable;
- imperfect by design rather than poorly produced;
- compatible with the Kinetic Print and Saturday-Night Toybox visual world.

Audio should never feel:

- expensive, pristine, military, photorealistic, or cinematic;
- like a recognisable commercial arcade sample;
- like generic 8-bit nostalgia;
- like neon sci-fi lasers or a cyberpunk HUD;
- like a slot-machine reward loop;
- so musical that it fights the soundtrack;
- dependent on sound alone to explain a state.

## Functional hierarchy

### Frequent utility

Short, dry sounds with restrained variation. They must survive repetition:

- accepted selection;
- back/cancel;
- panel or page change;
- slot place/remove;
- invalid or blocked action;
- confirmation and match commit.

Never trigger selection audio merely because focus or hover moved. Play it only
after the underlying state mutation was accepted.

### Combat identity

Combat families receive stronger sonic identity and more candidate exploration:

- Charge milestones `1`, `2`, `3`, and `Ready`;
- dodge and miss;
- direct, stun, support, team attack, team stun, team support, and effect Move
  families;
- Accessory ready and activation;
- switch, defeat, victory, loss, and result reveal.

Charge milestones should feel related without being the same sound pitched four
times. `Ready` is the clearest cabinet event, not a musical fanfare.

### Character identity

Each Character receives a small material palette derived from their body,
equipment, temperament, and Move kit. Character layers may colour a shared Move
family, but never replace the shared functional cue. Adding a Character should
therefore require data and assets, not a bespoke playback branch.

### Dialogue

Dialogue is short, subtitled, interruptible where the authored scene permits,
and independently controllable from music and SFX. Generated performance should
sound characterful rather than announcer-polished. Combat barks remain concise
enough not to mask decision cues or require the player to wait.

Every dialogue record owns:

- stable dialogue ID;
- Character or narrator ID;
- exact authored text and subtitle;
- approved voice ID and provider/model provenance;
- emotion, energy, pace, and pronunciation notes;
- candidate files and review status;
- approved output digest and destination.

No generated take can silently rewrite authored words. The subtitle remains
the accessibility and factual authority.

## First vertical slice

The first generation batch proves the complete workflow rather than filling the
catalogue:

1. `sfx.ui.lineup.select` — an 80–140 ms dry ticket insertion: card scrape,
   worn selector detent, and faint degraded synthetic chirp;
2. `sfx.ui.lineup.confirm` — a 180–280 ms cabinet latch/start-button thunk with
   a brief unstable future-boot tail;
3. one coherent four-sound Charge milestone family: `1`, `2`, `3`, and
   `Ready`.

The Lineup selection sound plays only after an accepted Fighter Select or
Tournament deployment mutation. The confirmation sound plays only after the
shared Fight Setup request validates, before honest arena loading. Story
therefore receives confirmation without inventing selection audio for a forced
Lineup.

## Candidate policy

- Generate three to five candidates for signature, identity, and high-frequency
  sounds.
- Generate two or three candidates for ordinary utility sounds.
- Generate one or two candidates for rare low-risk sounds only after the sonic
  family is approved.
- Review candidates in the real game beneath representative music before
  approval.
- Keep rejected candidates outside runtime asset paths; retain their prompt and
  provenance when they remain useful research.

The first exploratory batch should remain approximately 20–30 sounds across a
few coherent directions. Do not generate the full catalogue before one
direction survives real play.

## Delivery target

Initial approved SFX target:

- mono;
- 48 kHz;
- 16-bit WAV source;
- non-looping unless explicitly authored otherwise;
- trimmed silence;
- 5–10 ms safety fades where appropriate;
- approximately −20 LUFS integrated and no higher than −2 dBTP before in-game
  review.

Browser delivery formats may be derived from the approved source. The approved
source, manifest record, and digest remain the authority.

## ElevenLabs generation contract

The ignored local environment may provide `ELEVENLABS_API_KEY`. Credentials are
never printed, committed, copied into manifests, or inherited by ordinary build
tasks.

Generation must follow this sequence:

1. a network-free dry run resolves selected IDs, prompts, duration targets,
   candidate counts, destinations, and the declared spend ceiling;
2. billable generation requires an explicit `--generate` action plus selected
   IDs, `--max-items`, `--max-seconds`, and a cost ceiling;
3. abort when cost cannot be bounded before the request;
4. write candidates into a timestamped review directory, never directly into
   `public/`;
5. use FFmpeg to trim, fade, resample, normalise, and probe each candidate;
6. record human approval and SHA-256 digest;
7. promote only approved, digest-matching outputs with a separate command;
8. refuse to overwrite an approved destination;
9. preserve silent fallback assets when generation, approval, or delivery is
   absent.

Install, build, test, development server, validation, and normal asset sync
must never call ElevenLabs or incur provider spend.

## Manifest minimum

Every SFX entry records:

- schema version and stable logical ID;
- sonic description and functional family;
- duration target and loop behaviour;
- output format, sample rate, channels, and destination;
- loudness and peak targets;
- provider, model, prompt version, and request provenance excluding secrets;
- candidate count and candidate paths;
- generation and approval status;
- approved candidate, SHA-256 digest, reviewer, and review date.

Runtime code resolves only stable logical IDs. Content never depends on a
provider filename or review-directory path.

## Review questions

Before approving a sound:

1. Does the action remain understandable with sound muted?
2. Does the sound explain the visible state rather than decorate it?
3. Can it repeat frequently without fatigue?
4. Does it remain clear under the current soundtrack?
5. Does it belong to the same battered cabinet as the other approved sounds?
6. Is its physical cause legible before its electronic residue?
7. Is the approved file reproducible from its manifest and review evidence?
