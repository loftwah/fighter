import { actionCostForCombatant } from "../combat/rules";
import type { ActionTier, CombatantState } from "../combat/types";
import { combatContent } from "../content/initial-content";
import { escapeHtml } from "./format";
import { moveCategoryDetail } from "./move-category-key";

const tierLabels: Record<ActionTier, string> = {
  stock: "Normal",
  gold: "Tier 1",
  platinum: "Tier 2",
};

export function renderBenchMoveDisclosure(combatant: CombatantState): string {
  const character = combatContent.characters[combatant.characterId];
  const rows = combatant.actionIds
    .map((actionId, index) => {
      const action = combatContent.actions[actionId];
      if (!action) {
        return "";
      }
      const tier = combatant.actionTiers[actionId] ?? "stock";
      const category = moveCategoryDetail(action.category);
      const cost = actionCostForCombatant(combatant, action);
      return `
        <li>
          <span><b>${index + 1}</b>${escapeHtml(action.name)}</span>
          <small>${cost} Charge</small>
          <small class="move-role-label" data-move-category="${category.id}">${category.shortLabel}</small>
          <em class="is-${tier}">${tierLabels[tier]}</em>
        </li>
      `;
    })
    .join("");
  const tierSummary = combatant.actionIds
    .map((actionId) => {
      const tier = combatant.actionTiers[actionId] ?? "stock";
      return tier === "platinum" ? "2" : tier === "gold" ? "1" : "N";
    })
    .join(" · ");

  return `
    <details class="bench-loadout" data-instance-id="${escapeHtml(combatant.instanceId)}">
      <summary aria-label="${escapeHtml(character?.name ?? "Fighter")} attacks and upgrade tiers">
        <span>Attacks</span>
        <small aria-hidden="true">${tierSummary}</small>
      </summary>
      <div class="bench-loadout-panel">
        <strong>${escapeHtml(character?.name ?? "Fighter")} · Attacks</strong>
        <ol>${rows}</ol>
      </div>
    </details>
  `;
}
