import { resolveImagePath, resolveVideoPath } from "../../assets/registry";
import type { StartupBeat } from "../../content/startup-content";
import { escapeHtml } from "../format";

export type StartupStage = "intro" | "loading" | "ready";

export interface StartupScreenModel {
  stage: Exclude<StartupStage, "ready">;
  beat: StartupBeat | null;
  beatIndex: number;
  beatCount: number;
}

export function renderStartupScreen(model: StartupScreenModel): string {
  if (model.stage === "loading") {
    return `
      <main class="startup-screen startup-loading" aria-labelledby="startup-loading-title" aria-busy="true">
        <div class="waiting-spinner" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p class="eyebrow">Opening the drawer</p>
        <h1 id="startup-loading-title">Loading Riot Relics</h1>
        <p>Sorting figures, moves, and unpaid invoices.</p>
      </main>
    `;
  }
  if (!model.beat) {
    return "";
  }
  const isLastBeat = model.beatIndex === model.beatCount - 1;
  return `
    <main class="startup-screen startup-intro" aria-labelledby="startup-title">
      ${renderStartupMedia(model.beat)}
      <div class="startup-ink">
        ${model.beat.eyebrow ? `<p class="eyebrow">${escapeHtml(model.beat.eyebrow)}</p>` : ""}
        <h1 id="startup-title">${escapeHtml(model.beat.title)}</h1>
        ${model.beat.body ? `<p>${escapeHtml(model.beat.body)}</p>` : ""}
        <div class="startup-actions">
          <button class="primary-action" data-command="advance-startup">
            ${isLastBeat ? "Open the drawer" : "Next print"}
          </button>
          <button class="text-button" data-command="skip-startup">Skip intro</button>
        </div>
      </div>
      <p class="startup-progress" aria-label="Intro item ${
        model.beatIndex + 1
      } of ${model.beatCount}">
        ${String(model.beatIndex + 1).padStart(2, "0")} / ${String(model.beatCount).padStart(2, "0")}
      </p>
    </main>
  `;
}

function renderStartupMedia(beat: StartupBeat): string {
  if (beat.kind === "text") {
    return '<div class="startup-type-field" aria-hidden="true">RR</div>';
  }
  if (beat.kind === "image") {
    return `
      <img
        class="startup-media"
        src="${resolveImagePath(beat.imageAssetId)}"
        data-asset-id="${beat.imageAssetId}"
        alt="${escapeHtml(beat.imageAlt)}"
      />
    `;
  }
  const videoPath = resolveVideoPath(beat.videoAssetId);
  if (!videoPath) {
    return `
      <img
        class="startup-media"
        src="${resolveImagePath(beat.posterImageAssetId)}"
        data-asset-id="${beat.posterImageAssetId}"
        alt=""
      />
    `;
  }
  return `
    <video
      class="startup-media"
      src="${videoPath}"
      poster="${resolveImagePath(beat.posterImageAssetId)}"
      autoplay
      muted
      playsinline
    ></video>
  `;
}
