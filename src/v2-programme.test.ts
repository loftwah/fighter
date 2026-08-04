import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const releaseSpec = readFileSync(
  new URL("../docs/v2-release-spec.md", import.meta.url),
  "utf8",
);
const questionnaire = readFileSync(
  new URL("../v2-brief/fighter-v2-owner-questionnaire.md", import.meta.url),
  "utf8",
);
const inTray = readFileSync(new URL("../IN-TRAY.md", import.meta.url), "utf8");
const design = readFileSync(new URL("../DESIGN.md", import.meta.url), "utf8");

describe("ratified V2 programme contract", () => {
  it("reconciles all 44 answered owner questions", () => {
    expect(questionnaire).toContain(
      "**Status:** COMPLETE OWNER INPUT — RECONCILED 2026-07-31",
    );
    const reconciliationRows = releaseSpec.match(/^\| \d{2}\s+\|/gm) ?? [];
    expect(reconciliationRows).toHaveLength(44);
    expect(releaseSpec).toContain(
      "Status: **RATIFIED PROGRAMME CONTRACT — RELEASE NOT FROZEN**",
    );
    expect(releaseSpec).toContain("**Complete 2026-07-31.**");
  });

  it("pins the first fixed-seed Viking acceptance fight", () => {
    expect(releaseSpec).toContain("`v2.viking-acceptance`");
    expect(releaseSpec).toContain("seed `3844240869`");
    expect(releaseSpec).toMatch(
      /Battle Boast → Axe First →\s+Battle Boast → Berserker Oath/,
    );
    expect(releaseSpec).toContain("waits 1.5 seconds");
  });

  it("keeps the game-first Battle candidate and unapproved app layouts behind explicit owner gates", () => {
    expect(design).toContain(
      "production compositions are not blanket approvals",
    );
    expect(design).toContain(
      "game-first playtest candidate derived from the owner's Teeny",
    );
    expect(design).toMatch(
      /Main\s+Menu and global\/Story navigation still require their own/,
    );
    expect(inTray).toContain("### IN-012 — Choose the Battle UI spatial model");
    expect(inTray).toContain("**Status:** IN PROGRESS");
    expect(inTray).toContain("**Kinetic Print** and **Comic Cutaways**");
  });
});
