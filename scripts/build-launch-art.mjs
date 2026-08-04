import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/production-sources",
);
const directionalBattleSourceDirectory = resolve(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/directional-battle-sources",
);
const accessorySourceDirectory = resolve(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/accessory-sources",
);
const modificationSourceDirectory = resolve(
  repositoryRoot,
  ".impeccable/review/visual-direction-v2/modification-sources",
);
const outputDirectory = resolve(
  repositoryRoot,
  "public/assets/generated/launch-roster",
);
const force = process.argv.includes("--force");
const artContract = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "src/assets/launch-art-contract.json"),
    "utf8",
  ),
);
const characters = artContract.characters;

const jobs = [];
for (const character of characters) {
  const characterOutput = resolve(outputDirectory, character.slug);
  jobs.push(
    {
      source: `${character.slug}-canonical-source.png`,
      output: resolve(characterOutput, "canonical.png"),
      width: 1024,
      height: 1280,
      mode: "contain",
    },
    {
      sourceDirectory: directionalBattleSourceDirectory,
      source: `${character.slug}-idle-a-source.png`,
      output: resolve(characterOutput, "idle-a.png"),
      width: 1024,
      height: 1280,
      mode: "contain",
    },
    {
      sourceDirectory: directionalBattleSourceDirectory,
      source: `${character.slug}-idle-b-source.png`,
      output: resolve(characterOutput, "idle-b.png"),
      width: 1024,
      height: 1280,
      mode: "contain",
    },
    {
      source: `${character.slug}-reactions-source.png`,
      output: resolve(characterOutput, "reactions.png"),
      width: 1536,
      height: 1024,
      mode: "exact",
    },
  );
  for (const action of character.moves) {
    jobs.push({
      source: `${character.slug}-${action}-source.png`,
      output: resolve(characterOutput, "actions", `${action}.png`),
      width: 1536,
      height: 864,
      mode: "cover",
    });
  }
}

for (const { slug: accessory } of artContract.accessories) {
  jobs.push({
    sourceDirectory: accessorySourceDirectory,
    source: `${accessory}-source.png`,
    output: resolve(outputDirectory, "accessories", `${accessory}.png`),
    width: 1024,
    height: 1024,
    mode: "cover",
  });
}

for (const { slug: modification } of artContract.modifications) {
  jobs.push({
    sourceDirectory: modificationSourceDirectory,
    source: `${modification}-source.png`,
    output: resolve(outputDirectory, "modifications", `${modification}.png`),
    width: 1024,
    height: 1024,
    mode: "cover",
  });
}

for (const environment of artContract.environments) {
  jobs.push({
    source: `${environment}-source.png`,
    output: resolve(outputDirectory, "environments", `${environment}.png`),
    width: 1536,
    height: 864,
    mode: "cover",
  });
}
jobs.push({
  source: "intro-launch-roster-source.png",
  output: resolve(outputDirectory, "environments", "intro-launch-roster.png"),
  width: 1536,
  height: 864,
  mode: "cover",
});
jobs.push({
  source: "intro-launch-roster-portrait-source.png",
  output: resolve(
    outputDirectory,
    "environments",
    "intro-launch-roster-portrait.png",
  ),
  width: 1024,
  height: 1280,
  mode: "contain",
});

const pendingOutputs = jobs.map((job) => job.output);
const manifestPath = resolve(outputDirectory, "manifest.json");
const protectedOutputs = [...pendingOutputs, manifestPath];
const existingOutputs = protectedOutputs.filter((path) => existsSync(path));
if (existingOutputs.length > 0 && !force) {
  throw new Error(
    `Refusing to overwrite ${existingOutputs.length} launch-art file(s). Re-run with --force only after reviewing the new production sources.`,
  );
}

for (const job of jobs) {
  const sourcePath = resolve(
    job.sourceDirectory ?? sourceDirectory,
    job.source,
  );
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing launch-art source ${sourcePath}`);
  }
}

function stagedOutputPath(stagingDirectory, finalPath) {
  return resolve(stagingDirectory, relative(outputDirectory, finalPath));
}

function runImageMagick(job, stagingDirectory) {
  const sourcePath = resolve(
    job.sourceDirectory ?? sourceDirectory,
    job.source,
  );
  const outputPath = stagedOutputPath(stagingDirectory, job.output);
  mkdirSync(dirname(outputPath), { recursive: true });

  const resizeArguments =
    job.mode === "exact"
      ? ["-resize", `${job.width}x${job.height}!`]
      : job.mode === "contain"
        ? [
            "-resize",
            `${job.width}x${job.height}`,
            "-gravity",
            "center",
            "-background",
            "#07101f",
            "-extent",
            `${job.width}x${job.height}`,
          ]
        : [
            "-resize",
            `${job.width}x${job.height}^`,
            "-gravity",
            "center",
            "-extent",
            `${job.width}x${job.height}`,
          ];

  const result = spawnSync(
    "magick",
    [
      sourcePath,
      "-auto-orient",
      ...resizeArguments,
      "-strip",
      "-colorspace",
      "sRGB",
      "-alpha",
      "off",
      "-dither",
      "FloydSteinberg",
      "-colors",
      "256",
      "-type",
      "Palette",
      `PNG8:${outputPath}`,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || `ImageMagick failed for ${outputPath}`);
  }
}

const manifest = {
  contractVersion: 2,
  sourceDirectories: [
    ".impeccable/review/visual-direction-v2/production-sources",
    ".impeccable/review/visual-direction-v2/directional-battle-sources",
    ".impeccable/review/visual-direction-v2/accessory-sources",
    ".impeccable/review/visual-direction-v2/modification-sources",
  ],
  outputs: pendingOutputs.map((output) =>
    output.slice(`${repositoryRoot}/public/`.length),
  ),
};
mkdirSync(dirname(outputDirectory), { recursive: true });
const stagingDirectory = mkdtempSync(
  resolve(dirname(outputDirectory), ".launch-roster-staging-"),
);
const backupDirectory = resolve(
  dirname(outputDirectory),
  `.launch-roster-backup-${Date.now()}`,
);
let previousPackageMoved = false;

try {
  for (const job of jobs) {
    runImageMagick(job, stagingDirectory);
  }

  writeFileSync(
    resolve(stagingDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const stagedOutputs = pendingOutputs.map((path) =>
    stagedOutputPath(stagingDirectory, path),
  );
  const missingStagedOutputs = stagedOutputs.filter(
    (path) => !existsSync(path),
  );
  if (missingStagedOutputs.length > 0) {
    throw new Error(
      `Launch-art staging is incomplete: ${missingStagedOutputs.join(", ")}`,
    );
  }
  const generatedBytes = stagedOutputs.reduce(
    (total, path) => total + readFileSync(path).byteLength,
    0,
  );

  if (existsSync(outputDirectory)) {
    renameSync(outputDirectory, backupDirectory);
    previousPackageMoved = true;
  }
  try {
    renameSync(stagingDirectory, outputDirectory);
  } catch (error) {
    if (previousPackageMoved && !existsSync(outputDirectory)) {
      renameSync(backupDirectory, outputDirectory);
      previousPackageMoved = false;
    }
    throw error;
  }
  if (previousPackageMoved) {
    rmSync(backupDirectory, { recursive: true, force: true });
    previousPackageMoved = false;
  }

  console.log(
    `Built ${pendingOutputs.length} opaque launch-roster PNGs (${(
      generatedBytes /
      1024 /
      1024
    ).toFixed(1)} MiB) and promoted the complete package atomically.`,
  );
} finally {
  if (existsSync(stagingDirectory)) {
    rmSync(stagingDirectory, { recursive: true, force: true });
  }
  if (previousPackageMoved && existsSync(backupDirectory)) {
    if (!existsSync(outputDirectory)) {
      renameSync(backupDirectory, outputDirectory);
    } else {
      rmSync(backupDirectory, { recursive: true, force: true });
    }
  }
}
