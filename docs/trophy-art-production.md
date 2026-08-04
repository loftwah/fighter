# Tournament Trophy art production

Status: generated, registered, and runtime-integrated

Generation mode: built-in `image_gen`

Production direction: Saturday-Night Toybox

## Contract

Every authored Tournament declares exactly one collectible Trophy. Winning the
Tournament adds that Trophy's stable ID to the Player profile once. Repeat wins
may still grant repeatable authored rewards, but cannot duplicate the Trophy.

Custom Tournament definitions choose from the registered generic Trophy set.
They do not invent an unregistered filename.

Reviewed sources:

```text
.impeccable/review/visual-direction-v2/trophy-sources/
```

Runtime package:

```text
public/assets/generated/trophies/
```

Build without overwriting approved output:

```sh
mise run assets:trophies
```

After explicit visual approval of replacement sources:

```sh
mise run assets:trophies -- --force
```

## V2 set

| Stable Trophy ID              | Role                           | Runtime image              |
| ----------------------------- | ------------------------------ | -------------------------- |
| `trophy.wrong-door-cup`       | Authored Wrong Door Cup reward | `wrong-door-cup.png`       |
| `trophy.generic.gold-cup`     | Custom Tournament option       | `generic-gold-cup.png`     |
| `trophy.generic.silver-tower` | Custom Tournament option       | `generic-silver-tower.png` |
| `trophy.generic.bronze-chaos` | Custom Tournament option       | `generic-bronze-chaos.png` |

## Prompt record

All four sources used the same production lock:

> Opaque square collectible Tournament Trophy image in the bright
> cartoon–anime Saturday-night toybox style; bold controlled near-black
> outlines, simple cel shading, chunky collectible proportions, large graphic
> colour masses, subtle tactile printed-paper texture, strong centred
> silhouette, safe margins and a simple energetic background field. No people,
> characters, UI, frame, text, letters, numbers, logos, watermark,
> transparency, photorealism, glossy 3D, generic anime-mobile finish, neon
> sci-fi HUD or malformed geometry.

Subject deltas:

- Wrong Door Cup: mismatched blue and red door wings around a keyhole;
- Champion Cup: broad-handled classic gold cup;
- Victory Tower: tall stepped silver fins and a starburst crown;
- Chaos Trophy: asymmetrical bronze shield and bolt with a lime accent.
