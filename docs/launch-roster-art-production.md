# Launch-roster art production

Status: generated, reviewed, registered, and runtime-integrated  
Generation mode: built-in `image_gen`  
Production direction: Saturday-Night Toybox

## Deliverables

Sixty-two reviewed source images across four source directories produce
fifty-six runtime PNGs:

- 6 canonical Character sources;
- 12 directional battle-idle sources, two per Character;
- 18 opponent-free Move sources;
- 6 reaction sheets;
- 3 empty environment plates;
- 2 responsive startup ensembles.
- 5 square Accessory plates.
- 4 square Modification plates.

Canonical plates are selection/profile art and face the camera. Battle idle A
and B are separate, right-facing, opponent-free plates. The renderer preserves
the player source and mirrors the enemy source so the fighters face inward.

Reviewed sources:

```text
.impeccable/review/visual-direction-v2/production-sources/
.impeccable/review/visual-direction-v2/directional-battle-sources/
.impeccable/review/visual-direction-v2/accessory-sources/
.impeccable/review/visual-direction-v2/modification-sources/
```

Runtime package:

```text
public/assets/generated/launch-roster/
```

Review sheets:

```text
.impeccable/review/visual-direction-v2/production-canonical-contact-sheet.png
.impeccable/review/visual-direction-v2/production-idle-pairs-contact-sheet.png
.impeccable/review/visual-direction-v2/production-directional-idles-contact-sheet.png
.impeccable/review/visual-direction-v2/production-actions-a-contact-sheet.png
.impeccable/review/visual-direction-v2/production-actions-b-contact-sheet.png
.impeccable/review/visual-direction-v2/production-accessories-contact-sheet.png
.impeccable/review/visual-direction-v2/production-modifications-contact-sheet.png
.impeccable/review/visual-direction-v2/production-reactions-contact-sheet.png
.impeccable/review/visual-direction-v2/production-environments-contact-sheet.png
```

## Build and replacement policy

```sh
mise run assets:launch-roster
```

The first build normalises every reviewed source, strips metadata, disables
alpha, and writes a dithered opaque 256-colour PNG. This keeps the complete
runtime package near 20 MiB without materially changing the cartoon artwork.

The task refuses to overwrite an existing package. After explicit visual
approval of replacement sources:

```sh
mise run assets:launch-roster -- --force
```

The builder preflights all sixty-two sources and all protected destinations,
builds the full package in a sibling staging directory, validates every
expected output, and only then promotes it. If promotion fails, the previous
package is restored; a failed conversion cannot leave a mixed old/new package.

Production canvases:

| Role                      |      Canvas |
| ------------------------- | ----------: |
| Canonical and idle        | 1024 × 1280 |
| Reaction sheet            | 1536 × 1024 |
| Move and environment      |  1536 × 864 |
| Portrait startup ensemble | 1024 × 1280 |
| Accessory                 | 1024 × 1024 |
| Modification              | 1024 × 1024 |

The machine-readable coverage source is
`src/assets/launch-art-contract.json`. The builder, registry and tests consume
the same Character, Move, Accessory and Modification inventory so a content
item cannot be added to one list and silently omitted from artwork production.

## Reference lock

The generation anchor was:

```text
.impeccable/review/visual-direction-v2/launch-roster-style-lock-v1.png
```

Environment and ensemble prompts also used:

```text
.impeccable/review/visual-direction-v2/tux-viking-battle-keyart-v1.png
```

The battle key art supplied energy and broad value hierarchy only. Prompts
explicitly rejected its block-town architecture and embedded Characters when
generating reusable empty environments.

## Shared prompt lock

Every Character asset used this invariant:

> Bright cartoon–anime toybox illustration; bold controlled near-black
> outlines; simple cel shading; large graphic colour masses; cute but not
> infantile; subtle tactile printed-paper texture; highly readable collectible
> silhouette. The source is one complete opaque rectangle with a simple
> background field. Preserve identity, body markings, costume topology, prop
> geometry, local palette, camera and crop from the canonical reference. No
> opponent, transparency, UI, frame, text, letters, numbers, logos, badges,
> status icons, damage values or watermark. Avoid photorealism, glossy 3D,
> generic anime-mobile finish, neon HUD styling, risograph-poster treatment,
> gore, duplicate limbs, duplicate props and cropped defining features.

This package uses `text_policy: none` from the shared
[art brief template](art-brief-template.md). In particular, Move plates must
never contain the Move name, Character name, attack points, Charge cost, tier,
category, status, or instructions. Those labels are rendered from live combat
state. Accidental readable or pseudo-readable lettering fails review rather
than causing the runtime label to be removed.

Canonical and idle plates keep the head focal point near 38% height, 12% safe
margins, and the battle-critical face, hands and prop in the upper central
crop. Move plates place the Character left-centre, facing right, with effect
energy travelling into open right-side space and a quiet lower title band.

## Character identity prompts

| Character     | Canonical prompt delta                                                                                                                                                                                                                   | Idle-B edit delta                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Tux           | Original cheerful open-source-inspired penguin tech fighter; black/warm-white body, orange beak and feet, teal scarf, chunky gloves, unreadable diagnostic device and utility pouches; teal pixel burst. No copied mascot pose or marks. | 3% breathing squash, soft blink, tiny antenna tilt and lowered free glove; all device and body geometry locked.      |
| Humpty Dumpty | Living cream eggshell Oddball with stable repaired cracks, thick eyebrows, sly smile, teal waistcoat, red bow tie, striped socks, curled shoes and one plain stone block; warm-yellow shell burst.                                       | Controlled 4° wobble, sideways eyes and counterbalancing hand; shell contour and every crack locked.                 |
| Moses         | Respectful older West Asian/North African leader with warm brown skin, white hair and beard, cream robe, deep blue mantle, curled wooden staff and guiding hand; restrained parted-water field.                                          | Soft blink and breath, slightly lowered hand, tiny beard/mantle shift; face, staff and garment topology locked.      |
| Viking        | Broad friendly saga-era fighter with orange beard, hornless nasal helmet, red wool tunic, fur-trimmed cloak, round wooden shield and one short axe; tomato impact field.                                                                 | 3% weight settle, tiny shield/axe dip and beard-tip shift; helmet, shield pattern and weapon locked.                 |
| Ned Kelly     | Historical-material interpretation of compact homemade iron armour, cylindrical helmet and narrow eye slit over charcoal coat, with one period revolver held down; quiet ochre scrub field. No performer likeness.                       | 3% shoulder/knee settle, tiny revolver-wrist and coat shift, moved slit highlight; armour plates and firearm locked. |
| Grim Reaper   | Original small floating skeletal figure with oversized purple hood, simple ivory skull-mask, cyan eyes, one crescent scythe, cyan charm and restrained mist; violet crescent field.                                                      | 3% floating settle, slight mask tilt and mist/robe shift; skull, scythe and charm locked.                            |

## Move prompt set

All Move sources are separate built-in generations using that Character's
canonical source as the identity reference.

| Source                                 | Move-specific request                                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tux-ping-source.png`                  | Compact device aim; one crisp cyan pulse and restrained orange Charge-return arc.                                                                         |
| `tux-root-access-source.png`           | Braced two-glove device pose; cyan circuit roots pull energy from large orange blocks through dragging pressure rings.                                    |
| `tux-kernel-panic-source.png`          | Diagonal device-overload lunge; controlled cascade of cyan fault blocks and orange shock bands through the right field.                                   |
| `humpty-egg-on-your-face-source.png`   | Fast cocky sidestep and palm feint; one magenta/yellow shell-shaped swoop and rebound-counter arc.                                                        |
| `humpty-shell-game-source.png`         | Crouch behind three large interlocking shell-colour segments; one abstract incoming line rebounds right.                                                  |
| `humpty-great-fall-source.png`         | Intact-shell downward tumble; large yellow geometric impact crater, magenta shock arc and restrained debris.                                              |
| `moses-staff-tap-source.png`           | Staff planted with calm authority; warm cream/cyan water ribbon travels right in two healing pulses.                                                      |
| `moses-part-the-strip-source.png`      | Horizontal staff sweep; two water walls peel apart into a sharp passage and divided armour-like mass.                                                     |
| `moses-safe-passage-source.png`        | Staff raised between two clean parted water walls; warm healing currents travel through an empty corridor.                                                |
| `viking-axe-first-source.png`          | Completed throwing follow-through with an open empty hand; exactly one separated short axe travels out and returns on one readable loop.                  |
| `viking-shield-bash-source.png`        | Legacy stable filename for Battle Boast: delighted chest-forward boast, shield and axe raised, with stacked gold Power marks; no blocking pose or impact. |
| `viking-berserker-oath-source.png`     | One committed overhead/downward axe slam; exactly one thick impact arc and one impact point with restrained gold stun stars.                              |
| `ned-kelly-warning-shot-source.png`    | Compact side-on period-revolver shot; small muzzle flash and one straight ochre pressure line.                                                            |
| `ned-kelly-iron-outlaw-source.png`     | Armour brace with gun down; ochre impact returns as a cold-cyan reflection arc through large plate shapes.                                                |
| `ned-kelly-last-stand-source.png`      | One-knee deliberate shot; controlled gold muzzle bloom and cyan pressure cut pierce an abstract shield block.                                             |
| `grim-reaper-cold-touch-source.png`    | Free skeletal hand extended with scythe behind; restrained cyan cold ribbon and downward violet weakening wisps.                                          |
| `grim-reaper-deaths-shadow-source.png` | Vertical scythe power-up; one inverted-triangle violet shadow and three inward mist bands frame the small figure.                                         |
| `grim-reaper-final-harvest-source.png` | One broad scythe sweep; huge violet crescent, three cyan mist ribbons and one thin returning life-steal current.                                          |

The three Viking sources were regenerated on 2026-07-31 through the approved
asset task so their plates describe the corrected functional kit. The
superseded melee-swing, shield-impact, and three-hit sources are preserved
beside them as `.legacy.png` files and are not consumed by the build.
`viking-shield-bash-source.png` remains a compatibility filename, not a visual
instruction.

## Reaction prompt set

Each source is one exact 3 × 2 sheet:

```text
hurt | dodge   | stunned
KO   | victory | tense
```

Every cell keeps one Character, a quiet opaque field, central face/hands/prop,
and no labels. Character-specific invariants:

- Tux uses recoil, device tuck, antenna/eye disorientation, seated defeat,
  raised-fist victory, and a low device guard.
- Humpty uses squash/wobble and hand/eye acting only; no reaction adds a crack
  or detached shell.
- Moses remains restrained and respectful: step-back, robe pivot, braced
  kneel, dignified exhaustion, relieved guidance, and a resolute low stance.
- Viking uses shield recoil/pivot, safe axe handling, seated defeat, delighted
  victory, and a low shield guard; exactly one axe and shield per cell.
- Ned communicates through shoulders, coat, stance and eye-slit light; no face
  is exposed and the single revolver stays controlled.
- Grim uses hood, mask angle, mist and scythe language; no victims, gore or
  additional skulls.

## Environment and startup prompts

| Source                                    | Request                                                                                                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arena-source.png`                        | Empty repurposed community-theatre fight stage; warm central painted floor, timber scenery flats, ropes, curtains, prop doors, rails and lamps; teal/tomato accents; centre kept calm.        |
| `story-source.png`                        | Empty late-night registration hall where six abstract arrival routes converge; prop shelves, booth windows, water channel, timber ramp and warm lamps; subdued cyan/orange, copy-safe centre. |
| `tournament-source.png`                   | Empty municipal-sports-hall finals stage; scaffold lights, abstract pennants, trophy and crowd silhouettes, restrained streamers; tomato/gold accents and open competition plane.             |
| `intro-launch-roster-source.png`          | Landscape group arrival in the registration hall with exactly Tux, Humpty, Moses, Viking, Ned and Grim, reacting to the same unseen registration point without fighting.                      |
| `intro-launch-roster-portrait-source.png` | Responsive two-row companion composition: Tux, Humpty and Grim in front; Moses, Viking and Ned behind; all faces and props retained inside portrait safe crop.                                |

## QA and rights

- All final files are opaque PNGs at their exact registered canvas.
- All eighteen Move plates contain no opponent or generated interface text.
- Reaction sheets contain exactly six equal cells in runtime order.
- Canonical/idle pairs were compared side by side for silhouette and identity
  registration.
- Environments were reviewed as one contact sheet for a calm central decision
  plane.
- Launch provenance remains `development-review`, not distribution approval.
  Tux needs mascot/licence/attribution review; Moses needs cultural/religious
  review; Ned Kelly must remain free of performer likeness or copied modern
  costume design.
