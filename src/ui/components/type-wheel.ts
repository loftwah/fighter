const TYPE_WHEEL = [
  "Brawler",
  "Beast",
  "Oddball",
  "Arcane",
  "Sharpshooter",
  "Tech",
] as const;

export function renderTypeWheel(): string {
  return `
    <aside class="type-wheel" aria-labelledby="type-wheel-title">
      <div>
        <p class="eyebrow">Matchup reference</p>
        <strong id="type-wheel-title">Each Type hits the next Type harder</strong>
        <span>${TYPE_WHEEL.join(" → ")} → Brawler</span>
      </div>
      <ol aria-hidden="true">
        ${TYPE_WHEEL.map(
          (typeName, index) => `
            <li style="--type-index: ${index}">
              <span>${typeName}</span>
              <b>›</b>
            </li>
          `,
        ).join("")}
      </ol>
    </aside>
  `;
}
