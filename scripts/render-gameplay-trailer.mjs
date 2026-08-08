import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

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

async function capturedSoundtrack() {
  let metadata;
  try {
    metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  } catch (error) {
    throw new Error(
      `The capture metadata is missing or invalid. Run \`mise run demo:capture\` first. ${error.message}`,
    );
  }
  const tracks = Array.isArray(metadata.music) ? metadata.music : [];
  const mainTracks = tracks.filter(
    (track) => track?.context === "main" && typeof track.path === "string",
  );
  const battle = tracks.find(
    (track) => track?.context === "battle" && typeof track.path === "string",
  );
  if (mainTracks.length === 0 || !battle) {
    throw new Error(
      "The capture metadata does not contain observed menu and battle soundtrack selections.",
    );
  }
  return {
    battle: battle.path,
    intro: mainTracks[0].path,
    main: mainTracks.at(-1).path,
  };
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
  if (!Number.isFinite(duration) || duration < 50) {
    throw new Error(
      `The authentic capture is ${duration.toFixed(1)} seconds; the trailer requires at least 50.0 seconds of source footage.`,
    );
  }
  const soundtrack = await capturedSoundtrack();
  const assets = [
    [gameplayPath, resolve(stagedDirectory, "gameplay.mp4")],
    [
      await existingFile(
        soundtrack.intro,
        "The captured intro soundtrack is unavailable.",
      ),
      resolve(stagedDirectory, "intro.mp3"),
    ],
    [
      await existingFile(
        soundtrack.main,
        "The captured menu soundtrack is unavailable.",
      ),
      resolve(stagedDirectory, "main.mp3"),
    ],
    [
      await existingFile(
        soundtrack.battle,
        "The captured battle soundtrack is unavailable.",
      ),
      resolve(stagedDirectory, "battle.mp3"),
    ],
  ];

  await mkdir(stagedDirectory, { recursive: true });
  for (const [source, destination] of assets) {
    await existingFile(source, "A required trailer asset is unavailable.");
    await copyFile(source, destination);
  }
  log(`Staged authentic capture and soundtrack from ${metadataPath}`);
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
      "comment=Authentic gameplay edited with Remotion",
      finalOutputPath,
    ],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  log(`Shareable trailer: ${finalOutputPath}`);
}

await verifyMediaTools();
await stageAssets();
await renderTrailer();
