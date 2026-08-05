import type { MoveCategory } from "../combat/types";

export interface MoveCategoryDetail {
  id: MoveCategory;
  label: string;
  shortLabel: string;
  marker: string;
  description: string;
}

export const MOVE_CATEGORY_DETAILS = {
  attack: {
    id: "attack",
    label: "Attack",
    shortLabel: "Attack",
    marker: "HIT",
    description: "Damages the active opponent.",
  },
  teamAttack: {
    id: "teamAttack",
    label: "Team attack",
    shortLabel: "Team hit",
    marker: "ALL",
    description: "Damages the opposing Lineup.",
  },
  stun: {
    id: "stun",
    label: "Stun",
    shortLabel: "Stun",
    marker: "STN",
    description: "Threatens the active opponent with control.",
  },
  teamStun: {
    id: "teamStun",
    label: "Team stun",
    shortLabel: "Team stun",
    marker: "LOCK",
    description: "Threatens the opposing Lineup with control.",
  },
  support: {
    id: "support",
    label: "Support",
    shortLabel: "Support",
    marker: "AID",
    description: "Heals, shields, cleanses, or strengthens one fighter.",
  },
  teamSupport: {
    id: "teamSupport",
    label: "Team support",
    shortLabel: "Team aid",
    marker: "TEAM",
    description: "Helps the allied Lineup.",
  },
  strip: {
    id: "strip",
    label: "Charge control",
    shortLabel: "Charge",
    marker: "BAR",
    description: "Gains, drains, slows, or otherwise changes Charge.",
  },
  special: {
    id: "special",
    label: "Special",
    shortLabel: "Special",
    marker: "FX",
    description:
      "Uses a counter, debuff, transformation, summon, or other trick.",
  },
} satisfies Record<MoveCategory, MoveCategoryDetail>;

export function moveCategoryDetail(category: MoveCategory): MoveCategoryDetail {
  return MOVE_CATEGORY_DETAILS[category];
}

export function renderMoveCategoryKey(): string {
  const categories = Object.values(MOVE_CATEGORY_DETAILS)
    .map(
      (detail) => `
        <li data-move-category="${detail.id}">
          <i aria-hidden="true">${detail.marker}</i>
          <span><strong>${detail.label}</strong><small>${detail.description}</small></span>
        </li>
      `,
    )
    .join("");
  return `
    <section class="move-category-key" aria-labelledby="move-category-key-title">
      <header>
        <div>
          <span>How to read Moves</span>
          <h3 id="move-category-key-title">Move bands</h3>
        </div>
        <p><strong>Inner band</strong> shows upgrade tier. <strong>Outer band</strong> shows the Move's main tactical job. On touch, hold a Move for details.</p>
      </header>
      <div class="move-tier-key" aria-label="Upgrade tier bands">
        <span data-move-tier="stock"><i aria-hidden="true"></i>Normal</span>
        <span data-move-tier="gold"><i aria-hidden="true"></i>Tier 1</span>
        <span data-move-tier="platinum"><i aria-hidden="true"></i>Tier 2</span>
      </div>
      <ul>${categories}</ul>
    </section>
  `;
}
