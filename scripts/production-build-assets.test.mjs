import { describe, expect, it } from "vitest";
import { initialCodeAssets } from "./production-build-assets.mjs";

describe("production HTML asset verification", () => {
  it("resolves relative and absolute code assets with either quote style", () => {
    expect(
      initialCodeAssets(`
        <script type="module" src='./assets/index.js?version=1'></script>
        <link rel="stylesheet" href="/assets/index.css#release">
      `),
    ).toEqual(["assets/index.js", "assets/index.css"]);
  });

  it("fails closed when the HTML has no initial JavaScript", () => {
    expect(() =>
      initialCodeAssets('<link rel="stylesheet" href="assets/index.css">'),
    ).toThrow("no resolvable initial JavaScript asset");
  });
});
