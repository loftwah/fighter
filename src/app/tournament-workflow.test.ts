import { describe, expect, it } from "vitest";
import {
  adjustTournamentBuildStat,
  createTournamentWorkflow,
  cycleTournamentBuildTier,
  enterTournamentStage,
  lockedTournamentRoster,
  moveTournamentBuildAction,
  setTournamentBuildPatch,
  setTournamentBuildLevel,
  setTournamentDefault,
  setTournamentFightOverride,
  toggleTournamentRosterInstance,
} from "./tournament-workflow";

describe("standalone Tournament workflow", () => {
  it("exposes the complete sandbox catalogue and locks six unique instances", () => {
    let draft = createTournamentWorkflow("normal");
    expect(
      new Set(draft.catalogue.map((fighter) => fighter.characterId)).size,
    ).toBe(6);
    expect(draft.catalogue.length).toBe(36);
    for (const fighter of draft.catalogue.slice(0, 6)) {
      draft = toggleTournamentRosterInstance(draft, fighter.instanceId);
    }
    expect(lockedTournamentRoster(draft)).toHaveLength(6);
    expect(() =>
      toggleTournamentRosterInstance(draft, draft.catalogue[6]!.instanceId),
    ).toThrow(/up to six/i);
  });

  it("keeps duplicate Character definitions as distinct configured instances", () => {
    let draft = createTournamentWorkflow("normal");
    const copies = draft.catalogue.filter(
      (fighter) => fighter.characterId === "character.viking",
    );
    draft = toggleTournamentRosterInstance(draft, copies[0]!.instanceId);
    draft = toggleTournamentRosterInstance(draft, copies[1]!.instanceId);
    draft = setTournamentBuildLevel(draft, copies[1]!.instanceId, 18);
    const roster = lockedTournamentRoster(draft);
    expect(roster.map((fighter) => fighter.instanceId)).toEqual([
      copies[0]!.instanceId,
      copies[1]!.instanceId,
    ]);
    expect(roster.map((fighter) => fighter.level)).toEqual([10, 18]);
  });

  it("configures a selected instance without changing its duplicate", () => {
    let draft = createTournamentWorkflow("normal");
    const copies = draft.catalogue.filter(
      (fighter) => fighter.characterId === "character.viking",
    );
    draft = toggleTournamentRosterInstance(draft, copies[0]!.instanceId);
    draft = toggleTournamentRosterInstance(draft, copies[1]!.instanceId);
    const editedId = copies[0]!.instanceId;
    draft = setTournamentBuildLevel(draft, editedId, 11);
    const originalPower = draft.builds[editedId]!.statBonuses.power;
    const duplicatePower =
      draft.builds[copies[1]!.instanceId]!.statBonuses.power;
    draft = adjustTournamentBuildStat(draft, editedId, "power", 1);
    const firstAction = draft.builds[editedId]!.actionIds[0];
    draft = moveTournamentBuildAction(draft, editedId, firstAction, 1);
    draft = cycleTournamentBuildTier(draft, editedId, firstAction);
    draft = setTournamentBuildPatch(draft, editedId, "patch.hot-start");
    expect(draft.builds[editedId]!.statBonuses.power).toBe(originalPower + 1);
    expect(draft.builds[editedId]!.actionIds[1]).toBe(firstAction);
    expect(draft.builds[editedId]!.actionTiers[firstAction]).toBe("gold");
    expect(draft.builds[editedId]!.equippedPatchId).toBe("patch.hot-start");
    expect(draft.builds[copies[1]!.instanceId]!.statBonuses.power).toBe(
      duplicatePower,
    );
  });

  it("creates a custom variant without mutating the registered preset", () => {
    const base = createTournamentWorkflow("normal");
    const changed = setTournamentFightOverride(
      setTournamentDefault(base, "timeLimitMs", 180_000),
      "round-2",
      "playerStartingCharge",
      25,
    );
    expect(changed.customVariant).toBe(true);
    expect(base.settings.timeLimitMs).toBe(120_000);
    expect(base.settings.fightOverrides).toEqual({});
  });

  it("will not advance to Settings with an empty Roster", () => {
    expect(() =>
      enterTournamentStage(createTournamentWorkflow("normal"), "settings"),
    ).toThrow(/at least one Character/i);
  });
});
