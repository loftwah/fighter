import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const packageDirectory = join(
  repositoryRoot,
  "public/assets/generated/trophies",
);
const sourceDirectory = join(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/trophy-sources",
);
const manifest = JSON.parse(
  readFileSync(join(packageDirectory, "manifest.json"), "utf8"),
) as { outputs: string[] };

describe("Trophy-art production package", () => {
  it("locks four reviewed sources and four runtime outputs", () => {
    expect(
      readdirSync(sourceDirectory).filter((name) =>
        name.endsWith("-source.png"),
      ),
    ).toHaveLength(4);
    expect(manifest.outputs).toHaveLength(4);
    expect(new Set(manifest.outputs)).toHaveLength(4);
    for (const path of manifest.outputs) {
      expect(
        readFileSync(join(repositoryRoot, "public", path)).byteLength,
        path,
      ).toBeGreaterThan(0);
    }
  });

  it("refuses to overwrite reviewed Trophy art without approval", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/build-trophy-art.mjs"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Refusing to overwrite 5");
  });
});
