export interface ImageAsset {
  id: string;
  path: string;
  fallback: string | null;
}

export const imageAssets: Record<string, ImageAsset> = Object.fromEntries(
  [
    {
      id: "image.arena.first-run",
      path: "/assets/generated/arena-bg.png",
      fallback: null,
    },
    {
      id: "image.story.first-run",
      path: "/assets/generated/story-bg.png",
      fallback: "image.arena.first-run",
    },
    {
      id: "image.tournament.cheap-seats",
      path: "/assets/generated/tournament-bg.png",
      fallback: "image.arena.first-run",
    },
    {
      id: "image.mara-vex.canonical",
      path: "/assets/generated/mara-vex-canonical.png",
      fallback: "image.placeholder.impact",
    },
    {
      id: "image.mara-vex.idle.a",
      path: "/assets/generated/mara-vex-idle-a.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.mara-vex.idle.b",
      path: "/assets/generated/mara-vex-idle-b.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.knuckle-tax.canonical",
      path: "/assets/generated/knuckle-tax-canonical.png",
      fallback: "image.placeholder.guard",
    },
    {
      id: "image.knuckle-tax.idle.a",
      path: "/assets/generated/knuckle-tax-idle-a.png",
      fallback: "image.knuckle-tax.canonical",
    },
    {
      id: "image.knuckle-tax.idle.b",
      path: "/assets/generated/knuckle-tax-idle-b.png",
      fallback: "image.knuckle-tax.canonical",
    },
    {
      id: "image.zipwire.canonical",
      path: "/assets/generated/zipwire-canonical.png",
      fallback: "image.placeholder.circuit",
    },
    {
      id: "image.zipwire.idle.a",
      path: "/assets/generated/zipwire-idle-a.png",
      fallback: "image.zipwire.canonical",
    },
    {
      id: "image.zipwire.idle.b",
      path: "/assets/generated/zipwire-idle-b.png",
      fallback: "image.zipwire.canonical",
    },
    {
      id: "image.velvet-hex.canonical",
      path: "/assets/generated/velvet-hex-canonical.png",
      fallback: "image.placeholder.hex",
    },
    {
      id: "image.velvet-hex.idle.a",
      path: "/assets/generated/velvet-hex-idle-a.png",
      fallback: "image.velvet-hex.canonical",
    },
    {
      id: "image.velvet-hex.idle.b",
      path: "/assets/generated/velvet-hex-idle-b.png",
      fallback: "image.velvet-hex.canonical",
    },
    {
      id: "image.gutter-grin.canonical",
      path: "/assets/generated/gutter-grin-canonical.png",
      fallback: "image.placeholder.guile",
    },
    {
      id: "image.gutter-grin.idle.a",
      path: "/assets/generated/gutter-grin-idle-a.png",
      fallback: "image.gutter-grin.canonical",
    },
    {
      id: "image.gutter-grin.idle.b",
      path: "/assets/generated/gutter-grin-idle-b.png",
      fallback: "image.gutter-grin.canonical",
    },
    {
      id: "image.scrapjack.canonical",
      path: "/assets/generated/scrapjack-canonical.png",
      fallback: "image.placeholder.feral",
    },
    {
      id: "image.scrapjack.idle.a",
      path: "/assets/generated/scrapjack-idle-a.png",
      fallback: "image.scrapjack.canonical",
    },
    {
      id: "image.scrapjack.idle.b",
      path: "/assets/generated/scrapjack-idle-b.png",
      fallback: "image.scrapjack.canonical",
    },
    {
      id: "image.action.mara.quick",
      path: "/assets/generated/mara-vex-action-quick.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.action.mara.control",
      path: "/assets/generated/mara-vex-action-control.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.action.mara.finisher",
      path: "/assets/generated/mara-vex-action-finisher.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.mara-vex.reactions",
      path: "/assets/generated/mara-vex-reactions.png",
      fallback: "image.mara-vex.canonical",
    },
    {
      id: "image.store.mara-vex",
      path: "/assets/generated/store-mara-vex.png",
      fallback: "image.mara-vex.canonical",
    },
  ].map((asset) => [asset.id, asset]),
);

const placeholderClass =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#ef4d39"/><path d="M0 160L800 20v210L0 370zm0 520l800-150v240L0 920z" fill="#f2d742"/><circle cx="400" cy="390" r="150" fill="#111f46"/><path d="M180 920c25-240 120-350 220-350s195 110 220 350" fill="#111f46"/></svg>`,
  );

export function resolveImagePath(id: string): string {
  const asset = imageAssets[id];
  if (!asset) {
    return placeholderClass;
  }
  return asset.path;
}

export const fallbackImagePath = placeholderClass;

export interface VideoAsset {
  id: string;
  path: string | null;
}

export const videoAssets: Record<string, VideoAsset> = {
  "video.intro.first-print": {
    id: "video.intro.first-print",
    path: null,
  },
};

export function resolveVideoPath(id: string): string | null {
  return videoAssets[id]?.path ?? null;
}

export function nextImageFallback(
  id: string,
): { id: string; path: string } | null {
  const fallbackId = imageAssets[id]?.fallback;
  if (!fallbackId) {
    return { id: "image.placeholder.generic", path: placeholderClass };
  }
  return { id: fallbackId, path: resolveImagePath(fallbackId) };
}

export interface PresentationAsset {
  id: string;
  path: string | null;
}

export const presentationAssets: Record<string, PresentationAsset> =
  Object.fromEntries(
    [
      {
        id: "presentation.mara.quick",
        path: "/assets/generated/mara-vex-action-quick.png",
      },
      {
        id: "presentation.mara.control",
        path: "/assets/generated/mara-vex-action-control.png",
      },
      {
        id: "presentation.mara.finisher",
        path: "/assets/generated/mara-vex-action-finisher.png",
      },
      { id: "presentation.knuckle.quick", path: null },
      { id: "presentation.knuckle.guard", path: null },
      { id: "presentation.knuckle.finisher", path: null },
      { id: "presentation.generic.quick", path: null },
      { id: "presentation.generic.control", path: null },
      { id: "presentation.generic.finisher", path: null },
      { id: "presentation.generic.heal", path: null },
      { id: "presentation.generic.guard", path: null },
    ].map((asset) => [asset.id, asset]),
  );
