import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { findMusic } from "../src/audio/registry.ts";
import {
  CAPTURE_FPS,
  captureTimeline,
  requiredCaptureFrames,
} from "../video/src/showcase/capture-timeline.ts";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const videoRoot = resolve(repositoryRoot, "video");
const stagedDirectory = resolve(videoRoot, "public/generated");
const outputDirectory = resolve(repositoryRoot, "output/video");
const rawDirectory = resolve(outputDirectory, "raw");
const gameplayPath = resolve(
  outputDirectory,
  "loftwah-fighter-gameplay-1080p.mp4",
);
const metadataPath = resolve(
  outputDirectory,
  "loftwah-fighter-gameplay-1080p.json",
);
const remotionOutputPath = resolve(
  rawDirectory,
  "loftwah-fighter-showcase-remotion.mp4",
);
const finalOutputPath = resolve(
  outputDirectory,
  "loftwah-fighter-showcase-1080p.mp4",
);

function log(message) {
  process.stdout.write(`[trailer] ${message}\n`);
}

async function verifyMediaTools() {
  for (const tool of ["ffmpeg", "ffprobe"]) {
    try {
      await execFileAsync(tool, ["-version"], {
        maxBuffer: 2 * 1024 * 1024,
      });
    } catch {
      throw new Error(
        `${tool} is unavailable. Run \`mise run install\` to provision the video toolchain.`,
      );
    }
  }
}

async function existingFile(path, help) {
  try {
    const details = await stat(path);
    if (details.isFile()) {
      return path;
    }
  } catch {
    // The actionable error below is clearer than the filesystem error.
  }
  throw new Error(`${help}\nMissing: ${path}`);
}

function registeredMusicPath(id) {
  const track = findMusic(id);
  if (track.id !== id) {
    throw new Error(`The showcase soundtrack ID ${id} is not registered.`);
  }
  return resolve(repositoryRoot, "public", track.path.replace(/^\/+/, ""));
}

function showcaseSoundtrack() {
  return {
    battle: registeredMusicPath("music.battle-2"),
    main: registeredMusicPath("music.main-theme"),
  };
}

async function validateCaptureContract(duration) {
  const requiredDuration = requiredCaptureFrames / CAPTURE_FPS;
  if (!Number.isFinite(duration) || duration < requiredDuration) {
    throw new Error(
      `The authentic capture is ${duration.toFixed(1)} seconds; the latest authored source trim requires at least ${requiredDuration.toFixed(1)} seconds.`,
    );
  }

  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  for (const clip of Object.values(captureTimeline)) {
    if (!("chapter" in clip)) continue;
    const actualStart = metadata.chapters?.[clip.chapter];
    const authoredStart = clip.sourceStartFrame / CAPTURE_FPS;
    if (
      !Number.isFinite(actualStart) ||
      Math.abs(actualStart - authoredStart) > 0.4
    ) {
      throw new Error(
        `Capture chapter ${clip.chapter} starts at ${String(actualStart)} seconds, but the authored clip expects ${authoredStart.toFixed(2)} seconds (±0.4). Recapture or retime the showcase before rendering.`,
      );
    }
  }
}

async function videoDuration(path) {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      path,
    ],
    { maxBuffer: 2 * 1024 * 1024 },
  );
  return Number(stdout.trim());
}

async function stageAssets() {
  await existingFile(
    gameplayPath,
    "Capture the authentic game footage first with `mise run demo:capture`.",
  );
  const duration = await videoDuration(gameplayPath);
  await validateCaptureContract(duration);
  const soundtrack = showcaseSoundtrack();
  const assets = [
    [gameplayPath, resolve(stagedDirectory, "gameplay.mp4")],
    [
      await existingFile(
        soundtrack.main,
        "The showcase main-theme soundtrack is unavailable.",
      ),
      resolve(stagedDirectory, "main.mp3"),
    ],
    [
      await existingFile(
        soundtrack.battle,
        "The deliberate battle soundtrack is unavailable.",
      ),
      resolve(stagedDirectory, "battle.mp3"),
    ],
  ];

  await mkdir(stagedDirectory, { recursive: true });
  await rm(resolve(stagedDirectory, "intro.mp3"), { force: true });
  for (const [source, destination] of assets) {
    await existingFile(source, "A required trailer asset is unavailable.");
    await copyFile(source, destination);
  }
  log(
    `Staged authentic capture plus deliberate main-theme and battle cues; source metadata remains at ${metadataPath}`,
  );
}

async function renderTrailer() {
  await mkdir(rawDirectory, { recursive: true });
  if (process.env.FIGHTER_TRAILER_REUSE_RENDER === "1") {
    await existingFile(
      remotionOutputPath,
      "There is no previous Remotion render to reuse.",
    );
    log(`Reusing the intermediate render at ${remotionOutputPath}`);
  } else {
    log("Rendering the editable Remotion composition at 1920×1080");
    await execFileAsync(
      "pnpm",
      [
        "--dir",
        videoRoot,
        "exec",
        "remotion",
        "render",
        "src/index.ts",
        "LoftwahFighterShowcase",
        remotionOutputPath,
        "--codec=h264",
        "--crf=18",
        "--pixel-format=yuv420p",
        "--audio-codec=aac",
        "--audio-bitrate=320k",
        "--concurrency=1",
        `--public-dir=${resolve(videoRoot, "public")}`,
        "--overwrite",
      ],
      { cwd: repositoryRoot, maxBuffer: 32 * 1024 * 1024 },
    );
  }

  log("Measuring the soundtrack for two-pass loudness normalisation");
  const loudnessAnalysis = await execFileAsync(
    "ffmpeg",
    [
      "-i",
      remotionOutputPath,
      "-map",
      "0:a:0",
      "-af",
      "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
      "-f",
      "null",
      "-",
    ],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  const analysisStart = loudnessAnalysis.stderr.lastIndexOf("{");
  const analysisEnd = loudnessAnalysis.stderr.indexOf("}", analysisStart);
  if (analysisStart < 0 || analysisEnd < 0) {
    throw new Error("FFmpeg did not return measurable loudness statistics.");
  }
  const measured = JSON.parse(
    loudnessAnalysis.stderr.slice(analysisStart, analysisEnd + 1),
  );
  const measuredFilter = [
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    `measured_I=${measured.input_i}`,
    `measured_TP=${measured.input_tp}`,
    `measured_LRA=${measured.input_lra}`,
    `measured_thresh=${measured.input_thresh}`,
    `offset=${measured.target_offset}`,
    "linear=true",
    "print_format=summary",
  ].join(":");

  log("Normalising the final soundtrack for social playback");
  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-i",
      remotionOutputPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "256k",
      "-ar",
      "48000",
      "-af",
      measuredFilter,
      "-movflags",
      "+faststart",
      "-metadata",
      "title=LOFTWAH FIGHTER Gameplay Showcase",
      "-metadata",
      "comment=Authentic gameplay from fighter.loftwah.com edited with Remotion",
      finalOutputPath,
    ],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  log(`Shareable trailer: ${finalOutputPath}`);
}

await verifyMediaTools();
await stageAssets();
await renderTrailer();
