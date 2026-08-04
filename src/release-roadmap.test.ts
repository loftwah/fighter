import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const roadmap = readFileSync(
  new URL("../docs/release-roadmap.md", import.meta.url),
  "utf8",
);
const product = readFileSync(new URL("../PRODUCT.md", import.meta.url), "utf8");

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

  it("places server-authoritative multiplayer last at V2.4", () => {
    const v24 = milestone("V2.4", "Distribution after V2.3");
    expect(v24).toContain("last currently planned feature milestone");
    expect(v24).toContain("server-authoritative match coordinator");
    expect(v24).toContain("One Durable Object");
    expect(v24).toContain("local or solo player loses no existing capability");
  });

  it("keeps the product summary aligned with the roadmap", () => {
    expect(product).toContain(
      "V2.4 is the final currently planned feature milestone",
    );
    expect(product).toContain("Public app-store distribution can follow V2.3");
  });
});
