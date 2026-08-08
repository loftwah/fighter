import { describe, expect, it } from "vitest";
import {
  renderBattleResultScreen,
  type BattleResultScreenModel,
} from "./battle-result-screen";

function quickResult(
  overrides: Partial<BattleResultScreenModel> = {},
): BattleResultScreenModel {
  return {
    mode: "quick",
    won: true,
    title: "Your Lineup takes the fight.",
    message: "Run it back or change the matchup.",
    featuredCharacterId: "character.viking",
    explanation: {
      heading: "How you won",
      decisiveMoment: "Axe First landed the final blow.",
      evidence: ["Axe First led your side with 94 damage."],
    },
    actions: {
      retry: { command: "retry-battle", label: "Rematch" },
      parent: { command: "quit-battle-parent", label: "Review Fight" },
      mainMenu: { command: "quit-battle-main", label: "Main Menu" },
      exportReport: {
        command: "download-battle-report",
        label: "Export report",
      },
    },
    ...overrides,
  };
}

describe("battle result screen", () => {
  it("renders a human Quick Fight result with explicit destinations", () => {
    const markup = renderBattleResultScreen(quickResult());

    expect(markup).toContain("Victory");
    expect(markup).toContain("Your Lineup takes the fight.");
    expect(markup).toContain("How you won");
    expect(markup).toContain("Rematch");
    expect(markup).toContain("Review Fight");
    expect(markup).toContain("Main Menu");
    expect(markup).not.toContain("Result: Win");
    expect(markup).not.toContain("Progression");
    expect(markup).not.toContain("Game type");
  });

  it("retains player choices when every evidence category is present", () => {
    const markup = renderBattleResultScreen(
      quickResult({
        explanation: {
          heading: "How you won",
          decisiveMoment: "Axe First landed the final blow.",
          evidence: [
            "Winning damage.",
            "Losing damage.",
            "Type edge.",
            "Luck record.",
            "You used 7 Moves: Axe First ×3 and Battle Boast ×3. You switched 0 times.",
          ],
        },
      }),
    );

    expect(markup).toContain("Winning damage.");
    expect(markup).toContain("Losing damage.");
    expect(markup).toContain("Type edge.");
    expect(markup).toContain("Luck record.");
    expect(markup).toContain("You used 7 Moves");
  });

  it("omits the reward ledger when the mode does not own rewards", () => {
    const markup = renderBattleResultScreen(
      quickResult({
        rewards: [{ label: "Progression", value: "+999" }],
      }),
    );

    expect(markup).not.toContain("battle-result-rewards");
    expect(markup).not.toContain("Fight rewards");
  });

  it("shows only explicitly supplied Story rewards", () => {
    const markup = renderBattleResultScreen(
      quickResult({
        mode: "story",
        rewards: [
          { label: "Battle Stamps", value: "+62" },
          { label: "Lineup XP", value: "+44" },
        ],
      }),
    );

    expect(markup).toContain("Fight rewards");
    expect(markup).toContain("Battle Stamps");
    expect(markup).toContain("+62");
    expect(markup).not.toContain("Progression");
  });

  it("escapes authored copy and action labels", () => {
    const markup = renderBattleResultScreen(
      quickResult({
        title: '<img src=x onerror="alert(1)">',
        actions: {
          retry: { command: "retry-battle", label: "Run <again>" },
          parent: { command: "quit-battle-parent", label: "Review Fight" },
          mainMenu: { command: "quit-battle-main", label: "Main Menu" },
          exportReport: {
            command: "download-battle-report",
            label: "Export report",
          },
        },
      }),
    );

    expect(markup).not.toContain("<img src=x");
    expect(markup).toContain("&lt;img src=x");
    expect(markup).toContain("Run &lt;again&gt;");
  });
});
