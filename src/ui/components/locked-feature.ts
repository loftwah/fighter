import { escapeHtml } from "../format";
import { ICONS } from "../icons";

export function renderLockedFeature(
  headingId: string,
  title: string,
  copy: string,
): string {
  return `
    <section class="locked-feature" aria-labelledby="${headingId}">
      <span class="locked-stamp">Locked</span>
      <h1 id="${headingId}">${escapeHtml(title)}</h1>
      <p>${escapeHtml(copy)}</p>
      <button class="primary-action" data-route="story">
        Back to First Run ${ICONS.arrowRight}
      </button>
    </section>
  `;
}
