import { describe, expect, it, vi } from "vitest";
import { createBattle } from "../combat/engine";
import { combatContent } from "../content/initial-content";
import { battleInputForMatch } from "./match-configuration";
import {
  addFightWorkflowFighter,
  advanceFightWorkflow,
  setFightWorkflowLineupAccessory,
  setFightWorkflowRule,
  setFightWorkflowStarter,
} from "./fight-workflow";
import {
  applyQuickFightPreset,
  adjustQuickFightBuildLevel,
  cycleQuickFightBuildTier,
  createQuickFightWorkflow,
  launchQuickFightWorkflow,
  markQuickFightCustom,
  moveQuickFightBuildAction,
  QUICK_FIGHT_FULL_POWER_STATS,
  QUICK_FIGHT_MAX_LEVEL,
  quickFightPresets,
  resolveQuickFightWorkflow,
  setQuickFightBuildPatch,
} from "./quick-fight-workflow";

describe("Quick Fight workflow adapter", () => {
  it("registers the three player-facing value presets with human copy", () => {
    expect(
      quickFightPresets.map(({ id, name, summary }) => ({ id, name, summary })),
    ).toEqual([
      {
        id: "quick.full-power",
        name: "Full Power",
        summary: "Everything unlocked. Every fighter at their best.",
      },
      {
        id: "quick.hot-start",
        name: "Hot Start",
        summary: "Big Moves are ready almost immediately.",
      },
      {
        id: "quick.custom",
        name: "Custom",
        summary: "Uses the settings shown below.",
      },
    ]);
  });

  it("launches one starter-first triple-duplicate snapshot", () => {
    let draft = createQuickFightWorkflow();
    const vikingCopies = draft.policy.player.eligibleFighters.filter(
      (fighter) => fighter.characterId === "character.viking",
    );
    for (const fighter of vikingCopies.slice(1)) {
      draft = addFightWorkflowFighter(
        draft,
        "player",
        fighter.instanceId,
      ).draft;
    }
    draft = setFightWorkflowStarter(
      draft,
      "player",
      vikingCopies[2]!.instanceId,
    ).draft;
    draft = advanceFightWorkflow(draft).draft;
    expect(draft.step).toBe("settings");
    draft = advanceFightWorkflow(draft).draft;
    const launch = vi.fn();

    const result = launchQuickFightWorkflow(draft, launch);

    expect(result.issues).toEqual([]);
    expect(launch).toHaveBeenCalledTimes(1);
    expect(result.resolved?.playerCharacterIds).toEqual([
      "character.viking",
      "character.viking",
      "character.viking",
    ]);
    expect(result.resolved?.snapshot.lineup.playerInstanceIds).toEqual([
      vikingCopies[2]!.instanceId,
      vikingCopies[0]!.instanceId,
      vikingCopies[1]!.instanceId,
    ]);
  });

  it("requires Settings and resolves every edited value", () => {
    let draft = createQuickFightWorkflow("quick.custom", "hard");
    const playerId = draft.selections.player.starterInstanceId!;
    draft = setFightWorkflowLineupAccessory(
      draft,
      "player",
      "accessory.field-kit",
    ).draft;
    draft = advanceFightWorkflow(draft).draft;
    expect(draft.step).toBe("settings");

    draft = setFightWorkflowRule(draft, "timeLimitMs", 120_000).draft;
    draft = setFightWorkflowRule(draft, "playerStartingCharge", 75).draft;
    draft = adjustQuickFightBuildLevel(draft, playerId, -1);
    draft = advanceFightWorkflow(draft).draft;

    const resolved = resolveQuickFightWorkflow(draft).resolved!;
    expect(resolved.match).toMatchObject({
      presetId: "quick.custom",
      difficulty: "hard",
      timeLimitMs: 120_000,
      player: {
        accessoryId: "accessory.field-kit",
        startingCharge: 80,
      },
    });
    expect(resolved.match.player.fighters[0]!.build.level).toBe(24);
  });

  it("opens Full Power with exact maximum sandbox values", () => {
    const draft = createQuickFightWorkflow("quick.full-power", "normal");
    const playerId = draft.selections.player.starterInstanceId!;
    const build = draft.settings.builds[playerId]!;

    expect(draft.policy.settings).toBe("required");
    expect(draft.settings).toMatchObject({
      presetId: "quick.full-power",
      timeLimitMs: 120_000,
      playerStartingCharge: 25,
      opponentStartingCharge: 25,
    });
    expect(build.level).toBe(QUICK_FIGHT_MAX_LEVEL);
    expect(build.statBonuses).toEqual(QUICK_FIGHT_FULL_POWER_STATS);
    expect(Object.values(build.actionTiers ?? {})).toEqual([
      "platinum",
      "platinum",
      "platinum",
    ]);
    expect(build.equippedPatchId).toBeNull();
  });

  it("applies presets in place while preserving both prepared Lineups", () => {
    let draft = createQuickFightWorkflow();
    const extraPlayer = draft.policy.player.eligibleFighters[4]!;
    draft = addFightWorkflowFighter(
      draft,
      "player",
      extraPlayer.instanceId,
    ).draft;
    draft = setFightWorkflowStarter(
      draft,
      "player",
      extraPlayer.instanceId,
    ).draft;
    draft = setFightWorkflowLineupAccessory(
      draft,
      "player",
      "accessory.field-kit",
    ).draft;
    const before = structuredClone(draft.selections);

    const hotStart = applyQuickFightPreset(draft, "quick.hot-start");

    expect(hotStart.selections).toEqual(before);
    expect(hotStart.settings).toMatchObject({
      presetId: "quick.hot-start",
      timeLimitMs: 90_000,
      playerStartingCharge: 75,
      opponentStartingCharge: 75,
    });
    expect(
      hotStart.settings.builds[extraPlayer.instanceId]?.actionTiers,
    ).toEqual(
      Object.fromEntries(
        combatContent.characters[extraPlayer.characterId]!.actionIds.map(
          (actionId) => [actionId, "platinum"],
        ),
      ),
    );
    const custom = markQuickFightCustom(hotStart);
    expect(custom.settings.presetId).toBe("quick.custom");
    expect(custom.settings.timeLimitMs).toBe(90_000);
    expect(custom.selections).toEqual(before);
  });

  it("keeps the chosen rules preset when only a Lineup Accessory changes", () => {
    const fullPower = createQuickFightWorkflow("quick.full-power");
    const changed = setFightWorkflowLineupAccessory(
      fullPower,
      "player",
      "accessory.field-kit",
    ).draft;

    expect(changed.settings.presetId).toBe("quick.full-power");
    expect(changed.selections.player.accessoryId).toBe("accessory.field-kit");
  });

  it.each([
    ["patch.heavy-ink", "power", 3],
    ["patch.lucky-misprint", "fortune", 4],
    ["patch.no-flinch", "interruptionResistance", 0.5],
  ] as const)(
    "materialises %s as an effective Battle build",
    (patchId, property, amount) => {
      let draft = createQuickFightWorkflow("quick.custom");
      const playerId = draft.selections.player.starterInstanceId!;
      const before = draft.settings.builds[playerId]!;
      draft = advanceFightWorkflow(draft).draft;
      draft = setQuickFightBuildPatch(draft, playerId, patchId);
      draft = advanceFightWorkflow(draft).draft;

      const match = resolveQuickFightWorkflow(draft).resolved!.match;
      const battle = createBattle(
        // Resolving the match is the only supported Quick Battle boundary.
        battleInputForMatch(match),
        combatContent,
      ).state;
      const combatant = battle.player.squad[0]!;

      if (property === "interruptionResistance") {
        expect(combatant.interruptionResistance).toBe(amount);
      } else {
        expect(combatant.stats[property]).toBe(
          (combatContent.characters[combatant.characterId]!.baseStats[
            property
          ] ?? 0) +
            (before.statBonuses?.[property] ?? 0) +
            amount,
        );
      }
    },
  );

  it("resolves Hot Start and Historic bonuses once into capped opening Charge", () => {
    let draft = createQuickFightWorkflow("quick.custom");
    const playerId = draft.selections.player.starterInstanceId!;
    draft = advanceFightWorkflow(draft).draft;
    draft = setFightWorkflowRule(draft, "playerStartingCharge", 90).draft;
    draft = setQuickFightBuildPatch(draft, playerId, "patch.hot-start");
    draft = advanceFightWorkflow(draft).draft;

    const match = resolveQuickFightWorkflow(draft).resolved!.match;
    expect(match.player.startingCharge).toBe(100);
  });

  it("enforces Modification and Move customisation level gates", () => {
    let draft = createQuickFightWorkflow("quick.custom");
    const playerId = draft.selections.player.starterInstanceId!;
    const actionId = draft.settings.builds[playerId]!.actionIds![0];
    draft = advanceFightWorkflow(draft).draft;

    for (let level = QUICK_FIGHT_MAX_LEVEL; level > 4; level -= 1) {
      draft = adjustQuickFightBuildLevel(draft, playerId, -1);
    }
    expect(() =>
      setQuickFightBuildPatch(draft, playerId, "patch.hot-start"),
    ).toThrow("Modification slots unlock at level 5");
    expect(() =>
      moveQuickFightBuildAction(draft, playerId, actionId, 1),
    ).toThrow("Move ordering unlocks at level 10");
    expect(() => cycleQuickFightBuildTier(draft, playerId, actionId)).toThrow(
      "Move enhancement unlocks at level 10",
    );
  });

  it("allows unlocked Modification and Move transitions at their thresholds", () => {
    let draft = createQuickFightWorkflow("quick.custom");
    const playerId = draft.selections.player.starterInstanceId!;
    const originalActions = draft.settings.builds[playerId]!.actionIds!;
    draft = advanceFightWorkflow(draft).draft;

    const patched = setQuickFightBuildPatch(draft, playerId, "patch.hot-start");
    const reordered = moveQuickFightBuildAction(
      patched,
      playerId,
      originalActions[0],
      1,
    );
    const enhanced = cycleQuickFightBuildTier(
      reordered,
      playerId,
      originalActions[0],
    );

    expect(enhanced.settings.builds[playerId]).toMatchObject({
      equippedPatchId: "patch.hot-start",
      actionIds: [originalActions[1], originalActions[0], originalActions[2]],
      actionTiers: { [originalActions[0]]: "stock" },
    });
  });

  it("freezes every Move-order tuple in the workflow snapshot", () => {
    const draft = createQuickFightWorkflow("quick.custom");
    const playerId = draft.selections.player.starterInstanceId!;

    expect(Object.isFrozen(draft.settings.builds[playerId]!.actionIds)).toBe(
      true,
    );
    expect(
      Object.isFrozen(
        draft.policy.player.eligibleFighters[0]!.build!.actionIds,
      ),
    ).toBe(true);
  });
});
