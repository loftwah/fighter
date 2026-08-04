import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const packageDirectory = join(
  repositoryRoot,
  "public/assets/generated/launch-roster",
);
const sourceDirectory = join(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/production-sources",
);
const directionalSourceDirectory = join(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/directional-battle-sources",
);
const accessorySourceDirectory = join(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/accessory-sources",
);
const modificationSourceDirectory = join(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/modification-sources",
);
const manifest = JSON.parse(
  readFileSync(join(packageDirectory, "manifest.json"), "utf8"),
) as { outputs: string[] };

describe("launch-art production package", () => {
  it("locks the reviewed source and output contracts", () => {
    expect(
      readdirSync(sourceDirectory).filter((name) =>
        name.endsWith("-source.png"),
      ),
    ).toHaveLength(41);
    expect(readdirSync(directionalSourceDirectory)).toHaveLength(12);
    expect(readdirSync(accessorySourceDirectory)).toHaveLength(5);
    expect(readdirSync(modificationSourceDirectory)).toHaveLength(4);
    expect(manifest.outputs).toHaveLength(56);
    expect(new Set(manifest.outputs)).toHaveLength(56);

    for (const path of manifest.outputs) {
      expect(
        readFileSync(join(repositoryRoot, "public", path)).byteLength,
        path,
      ).toBeGreaterThan(0);
    }
  });

  it("ships distinct directional idle pairs without silently overwriting them", () => {
    for (const slug of [
      "tux",
      "humpty",
      "moses",
      "viking",
      "ned-kelly",
      "grim-reaper",
    ]) {
      expect(
        readFileSync(join(packageDirectory, slug, "idle-a.png")),
      ).not.toEqual(
        readFileSync(join(packageDirectory, slug, "canonical.png")),
      );
      expect(
        readFileSync(join(packageDirectory, slug, "idle-a.png")),
      ).not.toEqual(readFileSync(join(packageDirectory, slug, "idle-b.png")));
    }

    const result = spawnSync(
      process.execPath,
      ["scripts/build-launch-art.mjs"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Refusing to overwrite 57");
  });
});
