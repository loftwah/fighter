import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const musicFiles = {
  "Battle 1 — Tiny Trouble.mp3": "battle-1-tiny-trouble.mp3",
  "Battle 2 — Bar’s Almost Full.mp3": "battle-2-bars-almost-full.mp3",
  "Battle 3 — Final Round Freakout.mp3": "battle-3-final-round-freakout.mp3",
  "Can't Tell.mp3": "cant-tell.mp3",
  "Grim Reaper — Clocked Out.mp3": "grim-reaper-clocked-out.mp3",
  "Humpty Dumpty — Cracked But Dangerous.mp3":
    "humpty-dumpty-cracked-but-dangerous.mp3",
  "Main Theme — Pocket-Sized Chaos.mp3": "main-theme-pocket-sized-chaos.mp3",
  "Mirrors.mp3": "mirrors.mp3",
  "Moses — Part the Dancefloor.mp3": "moses-part-the-dancefloor.mp3",
  "Ned Kelly — Iron Head.mp3": "ned-kelly-iron-head.mp3",
  "No Control.mp3": "no-control.mp3",
  "Obsessed.mp3": "obsessed.mp3",
  "Red Thread.mp3": "red-thread.mp3",
  "Soft Static Halo.mp3": "soft-static-halo.mp3",
  "Tux — Root Access.mp3": "tux-root-access.mp3",
  "Viking — Small Axe, Big Problem.mp3": "viking-small-axe-big-problem.mp3",
  "Wandering Around.mp3": "wandering-around.mp3",
  "Weather Outside.mp3": "weather-outside.mp3",
};

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

await mkdir(resolve(root, "public/music"), { recursive: true });

const suppliedMusic = (await readdir(resolve(root, "music"))).filter((name) =>
  name.toLowerCase().endsWith(".mp3"),
);
const unregisteredMusic = suppliedMusic.filter(
  (name) => musicFiles[name] === undefined,
);
if (unregisteredMusic.length > 0) {
  throw new Error(
    `Register new soundtrack sources before syncing: ${unregisteredMusic.join(", ")}`,
  );
}

let copied = 0;
let unchanged = 0;
for (const [sourceName, outputName] of Object.entries(musicFiles)) {
  const sourcePath = resolve(root, "music", sourceName);
  const outputPath = resolve(root, "public/music", outputName);
  const source = await readFile(sourcePath);
  const current = await readFile(outputPath).catch(() => null);
  if (current && digest(current) === digest(source)) {
    unchanged += 1;
    continue;
  }
  await copyFile(sourcePath, outputPath);
  copied += 1;
}

console.log(
  `Music catalogue ready: ${copied} copied, ${unchanged} unchanged, ${Object.keys(musicFiles).length} total.`,
);
