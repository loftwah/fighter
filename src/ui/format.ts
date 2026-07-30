export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTime(remainingMs: number): string {
  return Math.max(0, Math.ceil(remainingMs / 1000))
    .toString()
    .padStart(2, "0");
}
