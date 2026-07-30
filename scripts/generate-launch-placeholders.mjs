import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(
  repositoryRoot,
  "public/assets/generated/launch-placeholder",
);

const characters = [
  ["tux", "TUX", "TECH", "#45c9ff"],
  ["humpty", "HUMPTY", "ODDBALL", "#f2d742"],
  ["moses", "MOSES", "ARCANE", "#b48cff"],
  ["viking", "VIKING", "BRAWLER", "#ef4d39"],
  ["ned-kelly", "NED KELLY", "SHARPSHOOTER", "#f29b38"],
  ["grim-reaper", "GRIM REAPER", "BEAST", "#7ed957"],
];

function sourceSvg(name, type, accent, settlePixels) {
  const headY = 385 + settlePixels;
  const bodyY = 565 + settlePixels;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
    <rect width="800" height="1000" fill="#111f46"/>
    <path d="M0 90L800 0v250L0 390zm0 570l800-150v300L0 980z" fill="${accent}"/>
    <circle cx="400" cy="${headY}" r="145" fill="#f7f0dd" stroke="#090d1c" stroke-width="28"/>
    <path d="M155 ${930 + settlePixels}c25-245 125-365 245-365s220 120 245 365" transform="translate(0 ${bodyY - 565})" fill="#f7f0dd" stroke="#090d1c" stroke-width="28"/>
    <text x="400" y="130" fill="#f7f0dd" font-family="sans-serif" font-size="74" font-weight="900" text-anchor="middle">${name}</text>
    <text x="400" y="885" fill="#090d1c" font-family="sans-serif" font-size="42" font-weight="900" text-anchor="middle">${type}</text>
  </svg>`;
}

function renderPng(path, source) {
  const result = spawnSync(
    "magick",
    [
      "svg:-",
      "-resize",
      "1024x1280!",
      "-background",
      "#111f46",
      "-alpha",
      "off",
      `PNG24:${path}`,
    ],
    { input: source, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || `ImageMagick failed for ${path}`);
  }
}

mkdirSync(outputDirectory, { recursive: true });

for (const [id, name, type, accent] of characters) {
  renderPng(
    resolve(outputDirectory, `${id}-canonical.png`),
    sourceSvg(name, type, accent, 0),
  );
  renderPng(
    resolve(outputDirectory, `${id}-idle-a.png`),
    sourceSvg(name, type, accent, 0),
  );
  renderPng(
    resolve(outputDirectory, `${id}-idle-b.png`),
    sourceSvg(name, type, accent, 18),
  );
}

console.log(`Generated ${characters.length * 3} opaque launch placeholders.`);
