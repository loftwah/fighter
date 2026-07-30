const CLASS_WHEEL = [
  "Impact",
  "Feral",
  "Guile",
  "Circuit",
  "Hex",
  "Guard",
] as const;

export function renderClassWheel(): string {
  return `
    <aside class="class-wheel" aria-labelledby="class-wheel-title">
      <div>
        <p class="eyebrow">Matchup reference</p>
        <strong id="class-wheel-title">Each class hits the next class harder</strong>
        <span>${CLASS_WHEEL.join(" → ")} → Impact</span>
      </div>
      <ol aria-hidden="true">
        ${CLASS_WHEEL.map(
          (className, index) => `
            <li style="--class-index: ${index}">
              <span>${className}</span>
              <b>›</b>
            </li>
          `,
        ).join("")}
      </ol>
    </aside>
  `;
}
