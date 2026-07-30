import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertValidFramedShotMetadata,
  assertValidFramedShotRegistries,
  createAssetRegistry,
  fallbackFramedShot,
  fallbackImagePath,
  FRAMED_SHOT_CONTRACT_VERSION,
  imageAssetList,
  imageAssets,
  nextImageFallback,
  presentationAssetList,
  presentationAssets,
  resolveFramedShotMetadata,
  resolveImagePath,
  type FramedShotAspect,
  type FramedShotMetadataV1,
} from "./registry";

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const aspectRatios: Record<FramedShotAspect, number> = {
  "16:9": 16 / 9,
  "4:5": 4 / 5,
  "1:1": 1,
  "3:2": 3 / 2,
};

interface PngContract {
  width: number;
  height: number;
  colorType: number;
  hasTransparencyChunk: boolean;
}

function readPngContract(publicPath: string): PngContract {
  const source = readFileSync(join(process.cwd(), "public", publicPath));
  expect(source.subarray(0, 8)).toEqual(pngSignature);
  expect(source.readUInt32BE(8)).toBe(13);
  expect(source.subarray(12, 16).toString("ascii")).toBe("IHDR");

  let offset = 8;
  let hasTransparencyChunk = false;
  while (offset + 12 <= source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.subarray(offset + 4, offset + 8).toString("ascii");
    hasTransparencyChunk ||= type === "tRNS";
    offset += length + 12;
  }

  return {
    width: source.readUInt32BE(16),
    height: source.readUInt32BE(20),
    colorType: source[25]!,
    hasTransparencyChunk,
  };
}

describe("opaque framed-shot asset registry", () => {
  it("gives every image and presentation a valid v1 framed-shot contract", () => {
    expect(() => assertValidFramedShotRegistries()).not.toThrow();

    for (const asset of [
      ...Object.values(imageAssets),
      ...Object.values(presentationAssets),
    ]) {
      expect(asset.framedShot.contractVersion).toBe(
        FRAMED_SHOT_CONTRACT_VERSION,
      );
      expect(asset.framedShot.compositing).toBe("opaque-frame");
    }
    expect(() =>
      assertValidFramedShotMetadata(
        "image.placeholder.generic",
        fallbackFramedShot,
      ),
    ).not.toThrow();
  });

  it("builds registries from preserved source lists without silent duplicates", () => {
    expect(Object.keys(imageAssets)).toHaveLength(imageAssetList.length);
    expect(Object.keys(presentationAssets)).toHaveLength(
      presentationAssetList.length,
    );
    expect(() =>
      createAssetRegistry("test registry", [
        { id: "image.duplicate" },
        { id: "image.duplicate" },
      ]),
    ).toThrow("test registry contains duplicate asset ID image.duplicate");
  });

  it("authors facing from each shipped character frame", () => {
    for (const id of [
      "image.tux.canonical",
      "image.humpty.idle.a",
      "image.moses.idle.b",
      "image.viking.canonical",
      "image.ned-kelly.idle.a",
      "image.grim-reaper.idle.b",
    ]) {
      expect(imageAssets[id]?.framedShot.facing, id).toBe("camera");
    }
  });

  it("matches registered aspect classes to opaque shipped PNGs", () => {
    const physicalAssets = [
      ...Object.values(imageAssets).filter((asset) =>
        asset.path.startsWith("/assets/"),
      ),
      ...Object.values(presentationAssets).filter(
        (
          asset,
        ): asset is (typeof presentationAssets)[string] & {
          path: string;
        } => asset.path?.startsWith("/assets/") ?? false,
      ),
    ];

    for (const asset of physicalAssets) {
      const png = readPngContract(asset.path);
      expect(
        png.width / png.height,
        `${asset.id} does not match ${asset.framedShot.aspect}`,
      ).toBeCloseTo(aspectRatios[asset.framedShot.aspect], 3);
      expect(
        [4, 6],
        `${asset.id} has an alpha-bearing PNG color type`,
      ).not.toContain(png.colorType);
      expect(
        png.hasTransparencyChunk,
        `${asset.id} has a PNG transparency chunk`,
      ).toBe(false);
    }
  });

  it("rejects invalid crops and mismatched frame classes", () => {
    const invalidCrop: FramedShotMetadataV1 = {
      ...fallbackFramedShot,
      focalPoint: { x: 0.9, y: 0.5 },
      safeCrop: { x: 0.1, y: 0.1, width: 0.5, height: 0.8 },
    };
    expect(() =>
      assertValidFramedShotMetadata("image.test.invalid-crop", invalidCrop),
    ).toThrow("focal point outside its safe crop");

    const invalidAspect: FramedShotMetadataV1 = {
      ...fallbackFramedShot,
      aspect: "16:9",
    };
    expect(() =>
      assertValidFramedShotMetadata("image.test.invalid-aspect", invalidAspect),
    ).toThrow("frame class portrait does not match 16:9");
  });

  it("preserves the image fallback chain and supplies fallback metadata", () => {
    expect(nextImageFallback("image.tux.idle.a")).toEqual({
      id: "image.tux.canonical",
      path: resolveImagePath("image.tux.canonical"),
    });
    expect(nextImageFallback("image.tux.canonical")).toEqual({
      id: "image.placeholder.generic",
      path: fallbackImagePath,
    });
    expect(resolveImagePath("image.missing")).toBe(fallbackImagePath);
    expect(resolveFramedShotMetadata("image.missing")).toBe(fallbackFramedShot);
  });
});
