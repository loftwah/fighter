import { execFile, spawn } from "node:child_process";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { chromium } from "playwright";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(repositoryRoot, "output/video");
const rawDirectory = resolve(outputDirectory, "raw");
const rawVideoPath = resolve(
  rawDirectory,
  "loftwah-fighter-gameplay-1080p.webm",
);
const finalVideoPath = resolve(
  outputDirectory,
  "loftwah-fighter-gameplay-1080p.mp4",
);
const metadataPath = resolve(
  outputDirectory,
  "loftwah-fighter-gameplay-1080p.json",
);
const demoUrl = process.env.FIGHTER_DEMO_URL ?? "http://127.0.0.1:4173/";
const battleCaptureMs = Number(process.env.FIGHTER_DEMO_BATTLE_MS ?? 42_000);
const minimumCaptureSeconds = 50.5;
const viewport = { width: 1920, height: 1080 };

function log(message) {
  process.stdout.write(`[demo] ${message}\n`);
}

async function verifyMediaTools() {
  for (const tool of ["ffmpeg", "ffprobe"]) {
    try {
      await execFileAsync(tool, ["-version"], {
        maxBuffer: 2 * 1024 * 1024,
      });
    } catch {
      throw new Error(
        `${tool} is unavailable. Run \`mise run install\` to provision the capture toolchain.`,
      );
    }
  }
}

async function serverIsReady() {
  try {
    const response = await fetch(demoUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(serverProcess) {
  const timeoutAt = Date.now() + 20_000;
  while (Date.now() < timeoutAt) {
    if (await serverIsReady()) {
      return;
    }
    if (serverProcess.exitCode !== null) {
      throw new Error(`Vite exited before ${demoUrl} became available.`);
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
  throw new Error(`Timed out waiting for ${demoUrl}.`);
}

async function startServer() {
  if (await serverIsReady()) {
    log(`Using the existing server at ${demoUrl}`);
    return null;
  }

  const url = new URL(demoUrl);
  const serverProcess = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--host",
      url.hostname,
      "--port",
      url.port || "4173",
      "--strictPort",
    ],
    {
      cwd: repositoryRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverOutput = "";
  serverProcess.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  serverProcess.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });
  try {
    await waitForServer(serverProcess);
  } catch (error) {
    serverProcess.kill("SIGTERM");
    throw new Error(`${error.message}\n${serverOutput.trim()}`);
  }
  log(`Started the game at ${demoUrl}`);
  return serverProcess;
}

async function clickWhenVisible(locator) {
  if ((await locator.count()) === 0 || !(await locator.first().isVisible())) {
    return false;
  }
  await locator.first().click();
  return true;
}

async function playDemo(page, captureStartedAt) {
  const consoleErrors = [];
  const musicRequests = [];
  const chapters = {};
  const publicMusicDirectory = resolve(repositoryRoot, "public/music");
  const recordChapter = (name) => {
    chapters[name] = Math.max(0, (Date.now() - captureStartedAt) / 1000);
  };
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    const pathname = decodeURIComponent(requestUrl.pathname);
    if (!pathname.startsWith("/music/") || !pathname.endsWith(".mp3")) {
      return;
    }
    const path = resolve(repositoryRoot, "public", pathname.slice(1));
    const relativeMusicPath = relative(publicMusicDirectory, path);
    if (relativeMusicPath.startsWith("..")) {
      return;
    }
    const observed = {
      path,
      requestedAtSeconds: Math.max(0, (Date.now() - captureStartedAt) / 1000),
      title: basename(path, ".mp3"),
    };
    const previous = musicRequests.at(-1);
    if (
      previous?.path === observed.path &&
      observed.requestedAtSeconds - previous.requestedAtSeconds < 1
    ) {
      return;
    }
    musicRequests.push(observed);
  });

  await page.goto(demoUrl, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const pageDocument = globalThis.document;
    await pageDocument.fonts.ready;
    await Promise.all(
      [...pageDocument.images].map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolveImage) => {
              image.addEventListener("load", resolveImage, { once: true });
              image.addEventListener("error", resolveImage, { once: true });
            }),
      ),
    );
  });
  await page.waitForTimeout(1_500);

  recordChapter("opening");
  await page.getByRole("button", { name: "Enter LOFTWAH FIGHTER" }).click();
  await page.getByRole("heading", { name: "Choose a game." }).waitFor();
  recordChapter("mainMenu");
  await page.waitForTimeout(2_200);

  const enabledMusic = await clickWhenVisible(
    page.getByRole("button", { name: "Turn music on" }),
  );
  if (!enabledMusic) {
    throw new Error("Could not enable music before the demonstration flow.");
  }
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: "Start New Story" }).click();
  await page
    .getByRole("heading", { name: "Everyone received the same invitation." })
    .waitFor();
  recordChapter("story");
  await page.waitForTimeout(2_600);
  await page.getByRole("button", { name: "Start First Run" }).click();
  await page
    .getByRole("heading", { name: "The Viking skipped registration." })
    .waitFor();
  recordChapter("storyReward");
  await page.waitForTimeout(2_200);
  await page
    .getByRole("button", { name: "Main Menu", exact: true })
    .first()
    .click();
  await page.getByRole("heading", { name: "Choose a game." }).waitFor();
  await page.waitForTimeout(1_200);

  await page.getByRole("button", { name: "Start Tournament" }).click();
  await page.getByRole("heading", { name: "Tournament Choice" }).waitFor();
  recordChapter("tournamentChoice");
  await page.waitForTimeout(2_400);
  await page.getByRole("button", { name: "Choose this Cup" }).click();
  await page.getByRole("heading", { name: "Tournament Roster" }).waitFor();
  recordChapter("tournamentRoster");
  await page.waitForTimeout(2_000);
  await page.getByRole("button", { name: /Copy 1 Tux/ }).click();
  recordChapter("tournamentBuild");
  await page.waitForTimeout(2_000);
  await page.getByRole("button", { name: "Main Menu", exact: true }).click();
  await page.getByRole("heading", { name: "Choose a game." }).waitFor();
  await page.waitForTimeout(1_200);

  await page.getByRole("button", { name: /Set up Quick Fight/ }).click();
  await page.getByRole("heading", { name: "Choose Fighters" }).waitFor();
  recordChapter("fighterSelect");
  await page.waitForTimeout(2_400);

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Quick Fight Settings" }).waitFor();
  recordChapter("fightSettings");
  await page
    .getByRole("combobox", { name: /Quick Fight preset/ })
    .selectOption({ label: "Hot Start" });
  await page.waitForTimeout(2_400);

  await page.getByRole("button", { name: "Review Fight" }).click();
  await page.getByRole("heading", { name: "Review Fight" }).waitFor();
  recordChapter("reviewFight");
  await page.waitForTimeout(2_600);

  await page.getByRole("button", { name: "Start Fight" }).click();
  const battleStartedAt = Date.now();
  await page
    .locator('.battle-stage[data-battle-phase="active"]')
    .waitFor({ timeout: 20_000 });
  recordChapter("battle");

  const actionSequence = [0, 1, 2, 1, 2];
  let actionSequenceIndex = 0;
  let resultSeenAt = null;
  const captureEndsAt = Math.max(
    Date.now() + battleCaptureMs,
    captureStartedAt + minimumCaptureSeconds * 1000,
  );

  while (Date.now() < captureEndsAt) {
    const result = page.locator(".battle-result:not([hidden])");
    if ((await result.count()) > 0 && (await result.isVisible())) {
      if (resultSeenAt === null) {
        resultSeenAt = Date.now();
        recordChapter("result");
      }
      if (
        Date.now() - resultSeenAt >= 3_500 &&
        Date.now() >= captureStartedAt + minimumCaptureSeconds * 1000
      ) {
        break;
      }
      await page.waitForTimeout(200);
      continue;
    }

    const activePhase = page.locator(
      '.battle-stage[data-battle-phase="active"]',
    );
    if ((await activePhase.count()) > 0) {
      const accessory = page.locator(
        '[data-player-accessory].is-ready[aria-disabled="false"]',
      );
      if ((await accessory.count()) > 0) {
        await accessory.click();
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        await page.waitForTimeout(350);
        continue;
      }

      const desiredAction =
        actionSequence[actionSequenceIndex] ?? actionSequence.at(-1);
      const move = page.locator(
        `.charge-move[data-action-index="${desiredAction}"].is-available[aria-disabled="false"]`,
      );
      if ((await move.count()) > 0) {
        await move.click();
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        actionSequenceIndex += 1;
        await page.waitForTimeout(450);
        continue;
      }
    }
    await page.waitForTimeout(150);
  }

  const battleOffsetSeconds = Math.max(
    0,
    (battleStartedAt - captureStartedAt) / 1000,
  );
  const soundtrack = musicRequests.map((track) => ({
    ...track,
    context:
      track.requestedAtSeconds < battleOffsetSeconds - 0.25 ? "main" : "battle",
  }));
  if (!soundtrack.some((track) => track.context === "main")) {
    throw new Error(
      "The browser did not request a menu soundtrack after music was enabled.",
    );
  }
  if (!soundtrack.some((track) => track.context === "battle")) {
    throw new Error(
      "The browser did not request a battle soundtrack when combat began.",
    );
  }

  return {
    battleOffsetSeconds,
    chapters,
    consoleErrors,
    soundtrack,
  };
}

async function probeVideo(videoPath) {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,r_frame_rate:format=duration,size",
      "-of",
      "json",
      videoPath,
    ],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
}

function parseLoudnessAnalysis(stderr) {
  const analysisStart = stderr.lastIndexOf("{");
  const analysisEnd = stderr.indexOf("}", analysisStart);
  if (analysisStart < 0 || analysisEnd < 0) {
    throw new Error("FFmpeg did not return measurable loudness statistics.");
  }
  return JSON.parse(stderr.slice(analysisStart, analysisEnd + 1));
}

function timelineAudioFilter(duration, soundtrack, outputLabel) {
  const ordered = [...soundtrack].sort(
    (left, right) => left.requestedAtSeconds - right.requestedAtSeconds,
  );
  const segments = ordered.map((track, index) => {
    const start = Math.min(Math.max(0, track.requestedAtSeconds), duration);
    const nextStart = ordered[index + 1]?.requestedAtSeconds ?? duration;
    const segmentDuration = Math.max(
      0.1,
      Math.min(duration, nextStart) - start,
    );
    const fadeDuration = Math.min(0.12, segmentDuration / 3);
    const fadeOutAt = Math.max(0, segmentDuration - fadeDuration);
    const volume = track.context === "battle" ? 0.34 : 0.3;
    return `[${index + 1}:a]atrim=0:${segmentDuration.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fadeDuration.toFixed(3)},afade=t=out:st=${fadeOutAt.toFixed(3)}:d=${fadeDuration.toFixed(3)},adelay=${Math.round(start * 1000)}:all=1,volume=${volume}[track${index}]`;
  });
  const labels = ordered.map((_, index) => `[track${index}]`).join("");
  segments.push(
    `${labels}amix=inputs=${ordered.length}:duration=longest:normalize=0,atrim=0:${duration.toFixed(3)}[${outputLabel}]`,
  );
  return segments.join(";");
}

async function mixShareableVideo(soundtrack) {
  const source = await probeVideo(rawVideoPath);
  const duration = Number(source.format.duration);
  if (!Number.isFinite(duration) || duration < minimumCaptureSeconds - 0.5) {
    throw new Error(
      `The capture is ${duration.toFixed(1)} seconds; the trailer requires at least ${(minimumCaptureSeconds - 0.5).toFixed(1)} seconds.`,
    );
  }
  const inputArguments = soundtrack.flatMap((track) => [
    "-stream_loop",
    "-1",
    "-i",
    track.path,
  ]);
  const baseFilter = timelineAudioFilter(duration, soundtrack, "mix");
  const analysis = await execFileAsync(
    "ffmpeg",
    [
      "-i",
      rawVideoPath,
      ...inputArguments,
      "-filter_complex",
      `${baseFilter};[mix]loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json[analysis]`,
      "-map",
      "[analysis]",
      "-t",
      duration.toFixed(3),
      "-f",
      "null",
      "-",
    ],
    { maxBuffer: 24 * 1024 * 1024 },
  );
  const measured = parseLoudnessAnalysis(analysis.stderr);
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
  const audioFilter = `${baseFilter};[mix]${measuredFilter}[audio]`;

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawVideoPath,
      ...inputArguments,
      "-filter_complex",
      audioFilter,
      "-map",
      "0:v:0",
      "-map",
      "[audio]",
      "-vf",
      `scale=${viewport.width}:${viewport.height}:flags=lanczos`,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-movflags",
      "+faststart",
      "-metadata",
      "title=LOFTWAH FIGHTER Gameplay Demo",
      "-metadata",
      "comment=Automated real-game capture at 1920x1080",
      "-t",
      duration.toFixed(3),
      finalVideoPath,
    ],
    { maxBuffer: 24 * 1024 * 1024 },
  );
  return probeVideo(finalVideoPath);
}

async function main() {
  await verifyMediaTools();
  await mkdir(rawDirectory, { recursive: true });
  const serverProcess = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--autoplay-policy=no-user-gesture-required"],
    });
    const context = await browser.newContext({
      viewport,
      screen: viewport,
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "no-preference",
      recordVideo: { dir: rawDirectory, size: viewport },
    });
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const page = await context.newPage();
    const captureStartedAt = Date.now();
    const video = page.video();
    log("Recording the real game at 1920×1080");
    const capture = await playDemo(page, captureStartedAt);
    await context.close();
    const generatedVideoPath = await video.path();
    if (generatedVideoPath !== rawVideoPath) {
      await rename(generatedVideoPath, rawVideoPath);
    }

    log(
      `Mixing the tracks selected by the game: ${capture.soundtrack.map((track) => track.title).join(" → ")}`,
    );
    const finalProbe = await mixShareableVideo(capture.soundtrack);
    const stream = finalProbe.streams[0];
    const metadata = {
      createdAt: new Date().toISOString(),
      source: "Automated Playwright capture of the real application",
      url: demoUrl,
      width: stream.width,
      height: stream.height,
      frameRate: stream.r_frame_rate,
      durationSeconds: Number(finalProbe.format.duration),
      sizeBytes: Number(finalProbe.format.size),
      battleOffsetSeconds: capture.battleOffsetSeconds,
      chapters: capture.chapters,
      rawVideo: rawVideoPath,
      finalVideo: finalVideoPath,
      music: capture.soundtrack,
      browserConsoleErrors: capture.consoleErrors,
    };
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    if (capture.consoleErrors.length > 0) {
      throw new Error(
        `The capture completed with browser errors:\n${capture.consoleErrors.join("\n")}`,
      );
    }
    log(`Raw source: ${rawVideoPath}`);
    log(`Shareable MP4: ${finalVideoPath}`);
    log(
      `Verified ${stream.width}×${stream.height}, ${metadata.durationSeconds.toFixed(1)} seconds`,
    );
  } finally {
    await browser?.close();
    serverProcess?.kill("SIGTERM");
  }
}

await main();
