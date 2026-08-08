import { describe, expect, it } from "vitest";
import {
  createQuickFightWorkflow,
  quickFightPreset,
} from "../../app/quick-fight-workflow";
import {
  advanceFightWorkflow,
  setFightWorkflowBuild,
} from "../../app/fight-workflow";
import { renderMatchSettingsScreen } from "./match-settings-screen";

describe("Quick Fight setup surfaces", () => {
  it("renders one compact preset selector with the affected rules beneath it", () => {
    const draft = advanceFightWorkflow(
      createQuickFightWorkflow("quick.custom", "hard"),
    ).draft;
    const markup = renderMatchSettingsScreen({
      draft,
      preset: quickFightPreset("quick.custom"),
      section: "rules",
      selectedBuildInstanceId: draft.selections.player.starterInstanceId,
      parentLabel: "Fighters",
      parentCommand: "back-to-fighters",
      mainMenuCommand: "main-menu",
    });
    expect(markup).toContain("Quick Fight Settings");
    expect(markup).toContain("Fight Clock");
    expect(markup).toContain("Opening Charge");
    expect(markup).toContain('data-command="set-match-difficulty"');
    expect(markup.match(/<select/g)).toHaveLength(1);
    expect(markup).toContain('name="quickPreset"');
    expect(markup).toContain("Full Power");
    expect(markup).toContain("Hot Start");
    expect(markup).toContain("Uses the settings shown below.");
    expect(markup).not.toContain("Gear");
    expect(markup).not.toContain("Accessory");
    expect(markup).not.toContain("Progression");
  });

  it("shows per-instance build editors without Lineup Accessory controls", () => {
    const draft = advanceFightWorkflow(
      createQuickFightWorkflow("quick.custom"),
    ).draft;
    const preset = quickFightPreset("quick.custom");
    const builds = renderMatchSettingsScreen({
      draft,
      preset,
      section: "builds",
      selectedBuildInstanceId: draft.selections.player.starterInstanceId,
      parentLabel: "Fighters",
      parentCommand: "back-to-fighters",
      mainMenuCommand: "main-menu",
    });
    expect(builds).toContain('data-command="adjust-match-level"');
    expect(builds).toContain('data-command="cycle-match-tier"');
    expect(builds).toContain('class="match-build-fighter-art"');
    expect(builds).toContain("Vitality");
    expect(builds).toContain("Modification");
    expect(builds).not.toContain("Accessory");
    expect(builds).toContain('aria-label="Decrease Viking level"');
    expect(builds).toContain('aria-label="Increase Viking Vitality"');
    expect(builds).toContain('aria-label="Move Battle Boast later"');
  });

  it("explains and disables build controls until their level unlocks", () => {
    const initialDraft = advanceFightWorkflow(
      createQuickFightWorkflow("quick.custom"),
    ).draft;
    const instanceId = initialDraft.selections.player.starterInstanceId!;
    const currentBuild = initialDraft.settings.builds[instanceId]!;
    const draft = setFightWorkflowBuild(initialDraft, instanceId, {
      ...currentBuild,
      level: 4,
    }).draft;
    const markup = renderMatchSettingsScreen({
      draft,
      preset: quickFightPreset("quick.custom"),
      section: "builds",
      selectedBuildInstanceId: instanceId,
      parentLabel: "Fighters",
      parentCommand: "back-to-fighters",
      mainMenuCommand: "main-menu",
    });

    expect(markup).toContain("Unlocks at Level 5");
    expect(markup).toContain("Reordering and tier upgrades unlock at Level 10");
    expect(markup).toMatch(/data-command="set-match-patch"[^>]*disabled/);
    expect(markup).toMatch(/data-command="move-match-action"[^>]*disabled/);
    expect(markup).toMatch(/data-command="cycle-match-tier"[^>]*disabled/);
  });
});
