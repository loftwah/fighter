# LOFTWAH FIGHTER promotional art production

Status: production contract; no public campaign package approved yet

This guide lets a Codex session generate landing, social, release, documentation,
and future store artwork without inventing a second visual identity.

## Source authority

Before generating, read:

1. [`PRODUCT.md`](../PRODUCT.md);
2. [`DESIGN.md`](../DESIGN.md);
3. [Brand and site](brand-and-site.md);
4. [Launch-roster art production](launch-roster-art-production.md);
5. the target surface brief or release brief.

## Asset matrix

| Asset                                      | Required size                             | Status                                         |
| ------------------------------------------ | ----------------------------------------- | ---------------------------------------------- |
| Landing hero, desktop                      | `1536 × 864` or larger in the same ratio  | approved launch-roster ensemble exists         |
| Landing hero, portrait                     | `1024 × 1280` or larger in the same ratio | approved portrait ensemble exists              |
| Social sharing image                       | `1200 × 630`                              | required before public launch                  |
| Release banner                             | `1920 × 1080`                             | generate for an accepted release candidate     |
| Documentation header                       | `1600 × 600`                              | optional; use only when it improves navigation |
| App-store screenshots and feature graphics | platform requirements at production time  | beyond V2.3                                    |

Do not generate app-store material before the application and required claims
exist.

## Shared prompt lock

Use this as the common visual block, then append the exact asset purpose,
composition, subjects, safe areas, and exclusions:

> LOFTWAH FIGHTER promotional bitmap in the approved Saturday-Night Toybox
> language: bright cartoon–anime collectible forms, character-dependent chunky
> proportions, heavy controlled near-black outlines, simple cel shading, large
> graphic colour masses, warm practical light, and subtle tactile printed
> texture. Compose as an intentional opaque rectangular or square frame with
> calm safe areas for semantic HTML copy where requested. Preserve registered
> Character identity, costume, props, proportions, and palette. No text,
> letters, numbers, logos, UI, watermark, transparency, photorealism, glossy
> 3D, generic anime-mobile finish, neon sci-fi HUD, malformed hands, duplicated
> props, or unrequested characters.

The final prompt must name:

- use case and dimensions;
- exact Characters or environment;
- landscape/portrait crop and focal point;
- empty safe area required for semantic copy;
- whether the scene is calm, confrontational, celebratory, or instructional;
- invariants from the registered source art;
- negative constraints.

## Workflow

1. Prefer existing approved artwork when a new generation would only restage
   the same information.
2. Generate exploratory mock-ups under `.impeccable/mocks/`; they are design
   evidence and never runtime assets.
3. Put reviewed source candidates under a named
   `.impeccable/review/<direction>/` folder.
4. Inspect every selected image at desktop and portrait crops.
5. Record the built-in image-generation mode or approved fallback, exact final
   prompt, source paths, dimensions, crop notes, and owner approval.
6. Build approved runtime files atomically through a task under `scripts/`.
7. Register a stable logical asset ID. Content and UI must not depend on a
   generated filename.
8. Test the registry entry, missing-asset fallback, dimensions, opacity, and
   non-overwrite behaviour.

## Landing direction mock-ups

The current mock-ups are compositional references only:

- `.impeccable/mocks/landing-charge-strip.png`;
- `.impeccable/mocks/landing-fight-bills.png`;
- `.impeccable/mocks/landing-collector-drawer.png`.

Their exact prompts and decision gate live in
[landing-page composition study](landing-page-comps.md).

They contain illustrative rasterised copy and may misstate small details. The
shipped page must use the authoritative product language and semantic HTML/CSS,
not copy pixels or generated claims from a mock-up.
