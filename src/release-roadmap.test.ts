import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const roadmap = readFileSync(
  new URL("../docs/release-roadmap.md", import.meta.url),
  "utf8",
);
const product = readFileSync(new URL("../PRODUCT.md", import.meta.url), "utf8");
const continuation = readFileSync(
  new URL("../docs/v2-continuation-programme.md", import.meta.url),
  "utf8",
);
const gameDesign = readFileSync(
  new URL("../docs/game-design.md", import.meta.url),
  "utf8",
);

function milestone(version: string, nextVersion: string): string {
  const start = roadmap.indexOf(`## ${version}`);
  const end = roadmap.indexOf(`## ${nextVersion}`, start + 1);
  expect(start, `${version} heading`).toBeGreaterThanOrEqual(0);
  expect(end, `${nextVersion} heading`).toBeGreaterThan(start);
  return roadmap.slice(start, end);
}

describe("release roadmap contract", () => {
  it("keeps V2.2 focused on accounts and cloud saves", () => {
    const v22 = milestone("V2.2", "V2.3");
    expect(v22).toContain("accounts and cloud-save release");
    expect(v22).toContain("V2.2 does not ship matchmaking");
    expect(v22).not.toContain("Live multiplayer");
    expect(v22).not.toContain("Durable Objects with WebSockets");
  });

  it("keeps multiplayer outside the committed milestone programme", () => {
    const deferred = milestone(
      "Deferred multiplayer",
      "Distribution after V2.3",
    );
    expect(deferred).toContain("not part of the committed V2–V2.3");
    expect(deferred).toContain("optional future gate");
    expect(deferred).toContain("server-authoritative match coordinator");
    expect(deferred).toContain("One Durable Object");
    expect(deferred).toContain(
      "local or solo player loses no existing capability",
    );
  });

  it("keeps the product summary aligned with the roadmap", () => {
    expect(product).toContain("Multiplayer has no committed milestone");
    expect(product).toMatch(/Public\s+app-store distribution can follow V2\.3/);
  });

  it("keeps the corrected mode foundation and current closeout in the active programme", () => {
    expect(continuation).toContain("AUTONOMOUS V2 CLOSEOUT ACTIVE");
    expect(continuation).toContain(
      "F00, Shared Lineup, Review Fight, and result storytelling",
    );
    expect(continuation).toContain("production-safe Fight Lab boundary");
    expect(gameDesign).toContain(
      "When a deployed Lineup loses but at least one Tournament Roster member lives",
    );
    expect(gameDesign).toContain(
      "The Player Profile does not own Characters or Story economy/progression",
    );
  });
});
