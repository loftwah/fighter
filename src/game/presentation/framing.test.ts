import { describe, expect, it } from "vitest";
import {
  calculateBattleLayout,
  calculateComicPanelLayout,
  calculateCoverCrop,
  shouldMirrorFramedShot,
  type Rect,
} from "./framing";

const fullSafeCrop = { x: 0, y: 0, width: 1, height: 1 };

const expectRectWithin = (inner: Rect, outer: Rect): void => {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height);
};

describe("opaque framed-shot cover crop", () => {
  it("mirrors only side-aware directional art toward the opponent", () => {
    const rightFacing = {
      facing: "right",
      mirrorPolicy: "side-aware",
    } as const;
    expect(shouldMirrorFramedShot(rightFacing, "player")).toBe(false);
    expect(shouldMirrorFramedShot(rightFacing, "enemy")).toBe(true);
    expect(
      shouldMirrorFramedShot(
        { facing: "right", mirrorPolicy: "never" },
        "enemy",
      ),
    ).toBe(false);
    expect(
      shouldMirrorFramedShot(
        { facing: "camera", mirrorPolicy: "never" },
        "enemy",
      ),
    ).toBe(false);
  });

  it("crops a 4:5 source to a wide panel without stretching", () => {
    const result = calculateCoverCrop(
      { width: 800, height: 1_000 },
      { width: 1_600, height: 900 },
      {
        focalPoint: { x: 0.5, y: 0.35 },
        safeCrop: fullSafeCrop,
      },
    );

    expect(result.source.width).toBeCloseTo(800);
    expect(result.source.height).toBeCloseTo(450);
    expect(result.source.width / result.source.height).toBeCloseTo(16 / 9);
    expect(result.scaleX).toBeCloseTo(result.scaleY);
    expectRectWithin(result.source, {
      x: 0,
      y: 0,
      width: 800,
      height: 1_000,
    });
  });

  it("crops a 16:9 source to a portrait panel without stretching", () => {
    const result = calculateCoverCrop(
      { width: 1_920, height: 1_080 },
      { width: 390, height: 600 },
      {
        focalPoint: { x: 0.72, y: 0.5 },
        safeCrop: fullSafeCrop,
      },
    );

    expect(result.source.height).toBeCloseTo(1_080);
    expect(result.source.width).toBeCloseTo(702);
    expect(result.source.width / result.source.height).toBeCloseTo(390 / 600);
    expect(result.scaleX).toBeCloseTo(result.scaleY);
  });

  it("keeps the focal point centred as closely as safe bounds allow", () => {
    const result = calculateCoverCrop(
      { width: 1_000, height: 1_000 },
      { width: 800, height: 400 },
      {
        focalPoint: { x: 0.5, y: 0.55 },
        safeCrop: { x: 0.1, y: 0.45, width: 0.8, height: 0.4 },
      },
    );

    expect(result.source.x).toBeCloseTo(0);
    expect(result.source.y).toBeCloseTo(350);
    expect(result.source.width).toBeCloseTo(1_000);
    expect(result.source.height).toBeCloseTo(500);
    expect(result.focalInDestination.x).toBeCloseTo(0.5);
    expect(result.focalInDestination.y).toBeCloseTo(0.4);
    expectRectWithin(
      { x: 100, y: 450, width: 800, height: 400 },
      result.source,
    );
  });

  it("mirrors presentation coordinates deterministically without changing the source crop", () => {
    const options = {
      focalPoint: { x: 0.3, y: 0.45 },
      safeCrop: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    };
    const normal = calculateCoverCrop(
      { width: 1_200, height: 1_200 },
      { width: 900, height: 500 },
      options,
    );
    const mirrored = calculateCoverCrop(
      { width: 1_200, height: 1_200 },
      { width: 900, height: 500 },
      { ...options, flipX: true },
    );

    expect(mirrored.source).toEqual(normal.source);
    expect(mirrored.focalInDestination.x).toBeCloseTo(
      1 - normal.focalInDestination.x,
    );
    expect(mirrored.focalInDestination.y).toBeCloseTo(
      normal.focalInDestination.y,
    );
    expect(mirrored.flipX).toBe(true);
  });

  it("keeps equal-aspect inputs uncropped and stable at edge focal points", () => {
    const result = calculateCoverCrop(
      { width: 1_600, height: 900 },
      { width: 800, height: 450 },
      {
        focalPoint: { x: 0, y: 1 },
        safeCrop: fullSafeCrop,
      },
    );

    expect(result.source).toEqual({
      x: 0,
      y: 0,
      width: 1_600,
      height: 900,
    });
    expect(result.scaleX).toBeCloseTo(0.5);
    expect(result.scaleY).toBeCloseTo(0.5);
  });

  it("rejects invalid sizes and focal points outside the authored safe crop", () => {
    expect(() =>
      calculateCoverCrop(
        { width: 0, height: 900 },
        { width: 800, height: 450 },
        {
          focalPoint: { x: 0.5, y: 0.5 },
          safeCrop: fullSafeCrop,
        },
      ),
    ).toThrow("sourceSize must have finite positive dimensions");

    expect(() =>
      calculateCoverCrop(
        { width: 1_600, height: 900 },
        { width: 800, height: 450 },
        {
          focalPoint: { x: 0.9, y: 0.5 },
          safeCrop: { x: 0.1, y: 0.1, width: 0.5, height: 0.8 },
        },
      ),
    ).toThrow("focalPoint must be inside safeCrop");
  });
});

describe("battle panel layout", () => {
  it("creates asymmetric desktop panels inside the viewport", () => {
    const layout = calculateBattleLayout(1_280, 720);

    expect(layout.orientation).toBe("landscape");
    expect(layout.playerFrame).not.toEqual(layout.enemyFrame);
    expect(layout.playerFrame.width).toBeGreaterThan(layout.enemyFrame.width);
    for (const rect of [
      layout.arena,
      layout.playerFrame,
      layout.enemyFrame,
      layout.cutInFrame,
      layout.impactFrame,
    ]) {
      expectRectWithin(rect, layout.viewport);
    }
  });

  it("creates bounded portrait panels at 390 by 844", () => {
    const layout = calculateBattleLayout(390, 844);

    expect(layout.orientation).toBe("portrait");
    expect(layout.enemyFrame.y).toBeLessThan(layout.playerFrame.y);
    expect(layout.enemyFrame).not.toEqual(layout.playerFrame);
    expect(layout.enemyFrame.y + layout.enemyFrame.height).toBeLessThanOrEqual(
      layout.playerFrame.y,
    );
    expect(layout.playerFrame.y + layout.playerFrame.height).toBeLessThan(
      layout.viewport.height * 0.8,
    );
    for (const rect of [
      layout.arena,
      layout.playerFrame,
      layout.enemyFrame,
      layout.cutInFrame,
      layout.impactFrame,
    ]) {
      expectRectWithin(rect, layout.viewport);
    }
  });

  it.each([
    [2_560, 720, "landscape"],
    [900, 900, "landscape"],
  ] as const)(
    "keeps panels bounded in a %d by %d viewport",
    (width, height, orientation) => {
      const layout = calculateBattleLayout(width, height);

      expect(layout.orientation).toBe(orientation);
      for (const rect of [
        layout.arena,
        layout.playerFrame,
        layout.enemyFrame,
        layout.cutInFrame,
        layout.impactFrame,
      ]) {
        expectRectWithin(rect, layout.viewport);
      }
    },
  );
});

describe("comic cutaway panel layout", () => {
  it.each([
    [390, 844, "portrait"],
    [844, 390, "landscape"],
    [1728, 1117, "landscape"],
  ] as const)(
    "keeps three distinct panels inside %d by %d",
    (width, height, orientation) => {
      const layout = calculateComicPanelLayout(width, height);

      expect(layout.orientation).toBe(orientation);
      expect(
        new Set([
          JSON.stringify(layout.leadFrame),
          JSON.stringify(layout.actionFrame),
          JSON.stringify(layout.reactionFrame),
        ]),
      ).toHaveLength(3);
      for (const rect of [
        layout.leadFrame,
        layout.actionFrame,
        layout.reactionFrame,
      ]) {
        expectRectWithin(rect, layout.viewport);
      }
    },
  );
});
