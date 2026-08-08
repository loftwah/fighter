import { describe, expect, it } from "vitest";
import { productionBundleGuard } from "../vite-production-guard.ts";

function chunk(overrides = {}) {
  return {
    type: "chunk",
    fileName: "assets/index.js",
    isEntry: true,
    imports: [],
    dynamicImports: [],
    modules: { "/repo/src/main.ts": {} },
    ...overrides,
  };
}

function runGuard(bundle) {
  const hook = productionBundleGuard().generateBundle;
  if (typeof hook !== "function") throw new Error("Missing bundle guard hook");
  hook({}, bundle);
}

describe("production bundle guard", () => {
  it("rejects Phaser merged into the initial entry graph", () => {
    expect(() =>
      runGuard({
        "assets/index.js": chunk({
          modules: {
            "/repo/src/main.ts": {},
            "/repo/node_modules/phaser/dist/phaser.js": {},
          },
        }),
      }),
    ).toThrow("eagerly includes the battle renderer");
  });

  it("permits Phaser in a dynamically imported battle chunk", () => {
    expect(() =>
      runGuard({
        "assets/index.js": chunk({
          dynamicImports: ["assets/create-game.js"],
        }),
        "assets/create-game.js": chunk({
          fileName: "assets/create-game.js",
          isEntry: false,
          modules: { "/repo/node_modules/phaser/dist/phaser.js": {} },
        }),
      }),
    ).not.toThrow();
  });

  it("fails closed when no JavaScript entry exists", () => {
    expect(() =>
      runGuard({
        "assets/create-game.js": chunk({
          fileName: "assets/create-game.js",
          isEntry: false,
        }),
      }),
    ).toThrow("no JavaScript entry chunk");
  });
});
