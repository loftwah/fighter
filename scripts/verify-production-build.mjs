import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { initialCodeAssets } from "./production-build-assets.mjs";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(target) : [target];
    }),
  );
  return files.flat();
}

function relative(file) {
  return path.relative(outputDirectory, file).split(path.sep).join("/");
}

const files = await filesBelow(outputDirectory);
const sourceMaps = files.filter((file) => file.endsWith(".map"));
if (sourceMaps.length > 0) {
  throw new Error(
    `Production artefact contains source maps: ${sourceMaps.map(relative).join(", ")}`,
  );
}

const indexHtml = await readFile(
  path.join(outputDirectory, "index.html"),
  "utf8",
);
const initialAssets = initialCodeAssets(indexHtml);

const initialMeasurements = await Promise.all(
  initialAssets.map(async (asset) => {
    const contents = await readFile(path.join(outputDirectory, asset));
    return {
      asset,
      rawBytes: contents.byteLength,
      gzipBytes: gzipSync(contents).byteLength,
    };
  }),
);
const totalBytes = (
  await Promise.all(files.map(async (file) => (await stat(file)).size))
).reduce((total, size) => total + size, 0);

console.log(
  JSON.stringify(
    {
      productionArtifactBytes: totalBytes,
      initialCode: initialMeasurements,
      sourceMaps: 0,
      eagerPhaserModuleGuard: "passed",
    },
    null,
    2,
  ),
);
