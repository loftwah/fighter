import { describe, expect, it } from "vitest";
import type { CombatantState } from "../combat/types";
import { combatContent } from "../content/initial-content";
import { renderBenchMoveDisclosure } from "./battle-bench";

describe("battle bench", () => {
  it("shows every attack name and its player-facing upgrade tier", () => {
    const character = combatContent.characters["character.viking"]!;
    const [first, second, third] = character.actionIds;
    const combatant: CombatantState = {
      instanceId: "player-viking",
      side: "player",
      characterId: character.id,
      level: 10,
      stats: character.baseStats,
      currentHealth: 151,
      maxHealth: 151,
      statuses: [],
      actionIds: character.actionIds,
      actionPositions: {},
      actionTiers: {
        [first]: "stock",
        [second]: "gold",
        [third]: "platinum",
      },
      interruptionResistance: 0,
      equippedPatchId: null,
    };

    const markup = renderBenchMoveDisclosure(combatant);

    expect(markup).toContain("<details");
    expect(markup).toContain('data-instance-id="player-viking"');
    expect(markup).toContain('aria-label="Viking attacks and upgrade tiers"');
    expect(markup).toContain("Attacks");
    expect(markup).toContain(combatContent.actions[first]!.name);
    expect(markup).toContain(combatContent.actions[second]!.name);
    expect(markup).toContain(combatContent.actions[third]!.name);
    expect(markup).toContain("Normal");
    expect(markup).toContain("Tier 1");
    expect(markup).toContain("Tier 2");
    expect(markup).toContain('data-move-category="support"');
    expect(markup.match(/data-move-category="attack"/g)).toHaveLength(2);
    expect(markup).not.toContain('data-move-category="stun"');
  });
});
