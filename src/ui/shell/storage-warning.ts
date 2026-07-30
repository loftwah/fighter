import { escapeHtml } from "../format";

export function renderStorageWarning(message: string | null): string {
  if (!message) {
    return "";
  }

  return `
    <aside class="storage-warning" role="status">
      <span>${escapeHtml(message)}</span>
      <div>
        <button data-command="download-storage-backup">Download backup</button>
        <button data-command="dismiss-storage-warning">Use safe defaults</button>
      </div>
    </aside>
  `;
}
