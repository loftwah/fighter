import { describe, expect, it } from "vitest";
import {
  renderFightConfirmationScreen,
  type FightConfirmationScreenModel,
} from "./fight-confirmation-screen";

const baseModel: FightConfirmationScreenModel = {
  mode: "quick",
  title: "Quick Fight",
  difficulty: "normal",
  player: {
    label: "Your Lineup",
    members: [
      {
        instanceId: "quick.player.0.viking",
        characterId: "character.viking",
        position: "starter",
      },
      {
        instanceId: "quick.player.1.tux",
        characterId: "character.tux",
        position: "bench",
      },
    ],
    accessoryId: "accessory.press-pass",
    traits: [{ label: "Historic 1.5 points", effect: "+7.5 opening Charge" }],
  },
  opponent: {
    label: "Opponent Lineup",
    members: [
      {
        instanceId: "quick.enemy.0.grim",
        characterId: "character.grim-reaper",
        position: "starter",
      },
    ],
    accessoryId: "accessory.dead-air",
  },
};

describe("read-only Fight Setup confirmation", () => {
  it("renders the real match identity, resolved order, assets, Traits and actions", () => {
    const markup = renderFightConfirmationScreen({
      ...baseModel,
      matchSettingsAvailable: true,
      commands: {
        parent: "back-to-settings",
        parentLabel: "Fight Settings",
        mainMenu: "main-menu",
      },
    });

    expect(markup).toContain("Quick Fight");
    expect(markup).toContain("data-fight-confirmation");
    expect(markup).toContain('class="fight-setup-confirmation ');
    expect(markup).not.toContain('class="fight-confirmation ');
    expect(markup).toContain('data-fight-confirmation-mode="quick"');
    expect(markup).toContain("data-fight-setup");
    expect(markup).toContain("Normal");
    expect(markup).toContain("Your Lineup");
    expect(markup).toContain("Opponent Lineup");
    expect(markup).toContain("Starter");
    expect(markup).toContain("Bench 1");
    expect(markup).toContain('data-asset-id="image.viking.canonical"');
    expect(markup).toContain('data-asset-id="image.accessory.second-wind"');
    expect(markup).toContain("Lineup Accessory");
    expect(markup).not.toContain("Team Accessory");
    expect(markup).toContain("Historic 1.5 points");
    expect(markup).toContain("+7.5 opening Charge");
    expect(markup).toContain("Change Fighters");
    expect(markup).toContain("Match Settings");
    expect(markup).toContain("Start Fight");
    expect(markup).toContain('data-command="change-fighters"');
    expect(markup).toContain('data-command="open-match-settings"');
    expect(markup).toContain('data-command="start-fight"');
    expect(markup).toContain('data-command="back-to-settings"');
    expect(markup).toContain("Fight Settings");
    expect(markup).toContain('data-command="main-menu"');
    expect(markup).toContain('aria-label="Return to Fight Settings"');
    expect(markup).toContain('aria-label="Return to Main Menu"');
  });

  it("contains no edit controls, empty slots, or rejected default copy", () => {
    const markup = renderFightConfirmationScreen({
      ...baseModel,
      title: "Custom",
      context: "Make it yours.",
    });

    expect(markup).toContain("Review Fight");
    expect(markup).toContain("Quick Fight");
    expect(markup).not.toContain("Custom");
    expect(markup).not.toContain("Make it yours.");
    expect(markup).not.toContain("<select");
    expect(markup).not.toContain("<input");
    expect(markup).not.toContain("Open slot");
    expect(markup).not.toContain("Ready To Fight");
    expect(markup).not.toContain("Builds Standard");
    expect(markup).not.toContain("Progression");
    expect(markup).not.toContain("equal stat points");
    expect(markup).not.toContain("Stock Moves");
    expect(markup).not.toContain("No Modifications");
    expect(markup).not.toContain("No Story rewards");
    expect(markup).not.toContain("Match Settings");
  });

  it("shows only supplied decision-changing facts and carried state", () => {
    const markup = renderFightConfirmationScreen({
      ...baseModel,
      mode: "tournament",
      title: "Wrong Door Cup · Round 2",
      context: "The Bone Orchard",
      player: {
        ...baseModel.player,
        members: [
          {
            ...baseModel.player.members[0]!,
            health: { current: 61, maximum: 147 },
            statuses: ["Stunned at the opening bell"],
            buildFacts: ["Gold Axe First"],
          },
        ],
        accessoryState: "Already used",
      },
      decisionFacts: [
        { label: "Carried Health", value: "Continues after this fight" },
        { label: "Objective", value: "Defeat the full opposing Lineup" },
      ],
    });

    expect(markup).toContain("Wrong Door Cup · Round 2");
    expect(markup).toContain("61</strong> / 147 Health");
    expect(markup).toContain("Stunned at the opening bell");
    expect(markup).toContain("Gold Axe First");
    expect(markup).toContain("Already used");
    expect(markup).toContain("Continues after this fight");
    expect(markup).toContain("Defeat the full opposing Lineup");
  });

  it("rejects unresolved Lineups before rendering confirmation", () => {
    expect(() =>
      renderFightConfirmationScreen({
        ...baseModel,
        player: {
          ...baseModel.player,
          members: [
            ...baseModel.player.members,
            {
              instanceId: "quick.player.2.moses",
              characterId: "character.moses",
              position: "starter",
            },
          ],
        },
      }),
    ).toThrow("exactly one starter");

    expect(() =>
      renderFightConfirmationScreen({
        ...baseModel,
        opponent: { ...baseModel.opponent, members: [] },
      }),
    ).toThrow("one to three resolved fighters");
  });
});
