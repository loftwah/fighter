import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(
  new URL("../index.html", import.meta.url),
  "utf8",
);

describe("public identity", () => {
  it("publishes the player-facing title without repository notation", () => {
    expect(indexHtml).toContain(
      "<title>LOFTWAH FIGHTER · Pick Your Fight</title>",
    );
    expect(indexHtml).toContain(
      '<meta property="og:site_name" content="LOFTWAH FIGHTER" />',
    );
    expect(indexHtml).not.toContain("<title>loftwah/fighter");
  });

  it("uses fighter.loftwah.com as the canonical public home", () => {
    expect(indexHtml).toContain(
      '<link rel="canonical" href="https://fighter.loftwah.com/" />',
    );
    expect(indexHtml).toContain(
      '<meta property="og:url" content="https://fighter.loftwah.com/" />',
    );
  });

  it("publishes a large social preview from a real registered launch asset", () => {
    expect(indexHtml).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    );
    expect(indexHtml).toContain(
      "https://fighter.loftwah.com/assets/generated/launch-roster/environments/intro-launch-roster.png",
    );
  });
});
