# Art brief template

Use this template for every generated or commissioned bitmap before producing
the asset. The completed brief belongs beside the source record in the relevant
art manifest.

```yaml
logical_id: image.character.purpose
role: character-canonical | character-idle | move-cut-in | reaction-sheet | environment | accessory | modification | trophy | promotional
dimensions: 1536x864
frame: opaque rectangle | opaque square
facing: left | right | camera | none | multiple
mirror_policy: side-aware | never
text_policy: none | decorative-only | authored-copy
runtime_overlays:
  - Character name
  - Move name
  - predicted attack points
  - Charge cost
safe_areas:
  - describe the quiet regions required by runtime UI
identity_references:
  - logical IDs or reviewed source paths
prompt: |
  Complete generation prompt, including the required text exclusion below.
review_notes: |
  Confirm identity, crop, direction, text policy, and overlay clearance.
```

## Text ownership

`text_policy: none` is mandatory for gameplay artwork: Character plates, idle
frames, Move cut-ins, reaction sheets, battle environments, setup portraits,
Accessories, and Modifications. Append this exact constraint to their generation prompts:

> No readable or pseudo-readable text, letters, numbers, logos, UI, captions,
> labels, Move names, Character names, damage values, Charge costs, status
> words, badges, signs, or watermark. Leave declared safe areas clear for live
> game UI.

The game or site owns every meaningful label. Character names, Move names,
damage, healing, Power, Charge, costs, tiers, categories, statuses, readiness,
instructions, dialogue, countdowns, and results must remain code-native so they
can change, localise, respond to state, remain accessible, and never duplicate
pixels inside an image.

`decorative-only` permits marks that cannot be read as meaningful copy, such as
abstract paper texture or an indistinct crowd poster. It must not carry game
information. If generated decoration resembles readable wording, reject or
remove it.

`authored-copy` is reserved for a named promotional or editorial deliverable
whose final composition intentionally includes fixed copy. Record the exact
copy in the brief, set `mirror_policy: never`, and do not place a second live
version of the same copy over the bitmap. Accessible HTML copy or alternative
text still accompanies the image where appropriate.

## Review gate

Reject an asset when:

- gameplay-critical copy appears in the pixels;
- accidental lettering competes with a runtime overlay;
- a required runtime-overlay safe area is occupied;
- side-aware mirroring would reverse text, symbols, handedness, or identity;
- the source prompt and text policy are missing from the manifest.

Do not hide required game UI to accommodate a non-compliant image. Regenerate,
edit, or replace the image instead.

## Directional battle contract

Author one text-free right-facing idle pair for each Character. Keep identity,
feet, silhouette, props, crop and background registered between A and B; frame
B is a restrained breathing/weight shift, not a new pose. Register both with
`mirror_policy: side-aware`. Canonical camera-facing art remains separate.

Never use `side-aware` for an image containing readable copy, asymmetric
identity marks that cannot reverse, or a handed prop whose direction changes
game meaning. Such art needs explicit left/right variants and
`mirror_policy: never`.
