import { escapeHtml } from "../format";

export function renderLockedFeature(
  headingId: string,
  title: string,
  copy: string,
): string {
  return `
    <section class="locked-feature" aria-labelledby="${headingId}">
      <span class="locked-stamp">Locked print</span>
      <h1 id="${headingId}">${escapeHtml(title)}</h1>
      <p>${escapeHtml(copy)}</p>
      <button class="primary-action" data-route="story">
        Back to First Run <span aria-hidden="true">→</span>
      </button>
    </section>
  `;
}
