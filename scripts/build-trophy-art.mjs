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
  ".impeccable/review/visual-direction-v2/trophy-sources",
);
const outputDirectory = resolve(
  repositoryRoot,
  "public/assets/generated/trophies",
);
const force = process.argv.includes("--force");

const slugs = [
  "wrong-door-cup",
  "generic-gold-cup",
  "generic-silver-tower",
  "generic-bronze-chaos",
];
const jobs = slugs.map((slug) => ({
  source: resolve(sourceDirectory, `${slug}-source.png`),
  output: resolve(outputDirectory, `${slug}.png`),
}));
const manifestPath = resolve(outputDirectory, "manifest.json");
const protectedOutputs = [...jobs.map(({ output }) => output), manifestPath];
const existingOutputs = protectedOutputs.filter((path) => existsSync(path));

if (existingOutputs.length > 0 && !force) {
  throw new Error(
    `Refusing to overwrite ${existingOutputs.length} Trophy-art file(s). Re-run with --force only after reviewing the new production sources.`,
  );
}

for (const job of jobs) {
  if (!existsSync(job.source)) {
    throw new Error(`Missing Trophy-art source ${job.source}`);
  }
}

const stagingDirectory = mkdtempSync(
  resolve(dirname(outputDirectory), ".trophy-staging-"),
);
const backupDirectory = resolve(
  dirname(outputDirectory),
  `.trophy-backup-${Date.now()}`,
);
let previousPackageMoved = false;

try {
  for (const job of jobs) {
    const stagedOutput = resolve(
      stagingDirectory,
      relative(outputDirectory, job.output),
    );
    mkdirSync(dirname(stagedOutput), { recursive: true });
    const result = spawnSync(
      "magick",
      [
        job.source,
        "-auto-orient",
        "-resize",
        "1024x1024^",
        "-gravity",
        "center",
        "-extent",
        "1024x1024",
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
        `PNG8:${stagedOutput}`,
      ],
      { encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(
        result.stderr || `ImageMagick failed for ${stagedOutput}`,
      );
    }
  }

  const manifest = {
    contractVersion: 1,
    sourceDirectory: ".impeccable/review/visual-direction-v2/trophy-sources",
    outputs: jobs.map(({ output }) =>
      output.slice(`${repositoryRoot}/public/`.length),
    ),
  };
  writeFileSync(
    resolve(stagingDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const stagedOutputs = jobs.map(({ output }) =>
    resolve(stagingDirectory, relative(outputDirectory, output)),
  );
  const missingOutputs = stagedOutputs.filter((path) => !existsSync(path));
  if (missingOutputs.length > 0) {
    throw new Error(`Trophy-art staging is incomplete: ${missingOutputs}`);
  }
  const generatedBytes = stagedOutputs.reduce(
    (total, path) => total + readFileSync(path).byteLength,
    0,
  );

  mkdirSync(dirname(outputDirectory), { recursive: true });
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
    `Built ${jobs.length} opaque Trophy PNGs (${(
      generatedBytes /
      1024 /
      1024
    ).toFixed(1)} MiB) and promoted the complete package atomically.`,
  );
} finally {
  if (existsSync(stagingDirectory)) {
    rmSync(stagingDirectory, { recursive: true, force: true });
  }
  if (previousPackageMoved && !existsSync(outputDirectory)) {
    renameSync(backupDirectory, outputDirectory);
  }
}
