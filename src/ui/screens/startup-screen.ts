import {
  resolveImageObjectPosition,
  resolveImagePath,
  resolveVideoPath,
} from "../../assets/registry";
import type { StartupBeat } from "../../content/startup-content";
import { escapeHtml } from "../format";

export type StartupStage = "intro" | "loading" | "ready";

export interface StartupScreenModel {
  stage: Exclude<StartupStage, "ready">;
  beat: StartupBeat | null;
  beatIndex: number;
  beatCount: number;
}

export function startupAdvanceDelay(
  stage: StartupStage,
  reducedMotion: boolean,
): number | null {
  if (stage !== "loading") {
    return null;
  }
  return reducedMotion ? 120 : 480;
}

export function renderStartupScreen(model: StartupScreenModel): string {
  if (model.stage === "loading") {
    return `
      <main class="startup-screen startup-loading" aria-labelledby="startup-loading-title" aria-busy="true">
        <div class="waiting-spinner" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <h1 id="startup-loading-title">Opening Main Menu</h1>
        <p>Choose Story, Quick Fight, or Tournament. Nothing starts until you do.</p>
      </main>
    `;
  }
  if (!model.beat) {
    return "";
  }
  const isLastBeat = model.beatIndex === model.beatCount - 1;
  const hasMultipleBeats = model.beatCount > 1;
  return `
    <main class="startup-screen startup-intro" aria-labelledby="startup-title">
      ${renderStartupMedia(model.beat)}
      <div class="startup-ink">
        ${model.beat.eyebrow ? `<p class="eyebrow">${escapeHtml(model.beat.eyebrow)}</p>` : ""}
        <h1 id="startup-title">${escapeHtml(model.beat.title)}</h1>
        ${model.beat.body ? `<p>${escapeHtml(model.beat.body)}</p>` : ""}
        <div class="startup-actions">
          <button class="primary-action" data-command="advance-startup">
            ${isLastBeat ? "Enter LOFTWAH FIGHTER" : "Next"}
          </button>
          ${hasMultipleBeats ? '<button class="text-button" data-command="skip-startup">Skip intro</button>' : ""}
        </div>
      </div>
      ${
        hasMultipleBeats
          ? `<p class="startup-progress" aria-label="Intro item ${model.beatIndex + 1} of ${model.beatCount}">
              ${String(model.beatIndex + 1).padStart(2, "0")} / ${String(model.beatCount).padStart(2, "0")}
            </p>`
          : ""
      }
    </main>
  `;
}

function renderStartupMedia(beat: StartupBeat): string {
  if (beat.kind === "text") {
    return '<div class="startup-type-field" aria-hidden="true">VS</div>';
  }
  if (beat.kind === "image") {
    const image = `
      <img
        class="startup-media"
        src="${resolveImagePath(beat.imageAssetId)}"
        data-asset-id="${beat.imageAssetId}"
        style="object-position: ${resolveImageObjectPosition(beat.imageAssetId)}"
        alt="${escapeHtml(beat.imageAlt)}"
      />
    `;
    if (!beat.portraitImageAssetId) {
      return image;
    }
    return `
      <picture
        class="startup-picture"
        style="
          --startup-backdrop: url('${resolveImagePath(beat.imageAssetId)}');
          --startup-portrait-position: ${resolveImageObjectPosition(beat.portraitImageAssetId)};
        "
      >
        <source
          media="(max-width: 760px)"
          srcset="${resolveImagePath(beat.portraitImageAssetId)}"
        />
        ${image}
      </picture>
    `;
  }
  const videoPath = resolveVideoPath(beat.videoAssetId);
  if (!videoPath) {
    return `
      <img
        class="startup-media"
        src="${resolveImagePath(beat.posterImageAssetId)}"
        data-asset-id="${beat.posterImageAssetId}"
        style="object-position: ${resolveImageObjectPosition(beat.posterImageAssetId)}"
        alt=""
      />
    `;
  }
  return `
    <video
      class="startup-media"
      src="${videoPath}"
      poster="${resolveImagePath(beat.posterImageAssetId)}"
      style="object-position: ${resolveImageObjectPosition(beat.posterImageAssetId)}"
      autoplay
      muted
      playsinline
    ></video>
  `;
}
