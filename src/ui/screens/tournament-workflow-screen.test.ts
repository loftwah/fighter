import { describe, expect, it } from "vitest";
import {
  createTournamentWorkflow,
  setTournamentDefault,
  toggleTournamentRosterInstance,
} from "../../app/tournament-workflow";
import {
  renderTournamentChoiceScreen,
  renderTournamentRosterScreen,
  renderTournamentSettingsScreen,
} from "./tournament-workflow-screen";

describe("Tournament workflow screens", () => {
  it("renders registered preset identity and explicit new-run choice", () => {
    const markup = renderTournamentChoiceScreen({
      tournamentId: "tournament.cheap-seats",
      run: null,
      trophyCollected: false,
    });
    expect(markup).toContain('data-tournament-stage="choice"');
    expect(markup).toContain('data-asset-id="image.tournament.cheap-seats"');
    expect(markup).toContain('data-asset-id="image.trophy.wrong-door-cup"');
    expect(markup).toContain('data-command="new-tournament"');
    expect(markup).toContain("Custom Builder");
    expect(markup).not.toContain("tournamentDeployment");
  });

  it("renders an explicit terminal forfeit consequence", () => {
    const markup = renderTournamentChoiceScreen({
      tournamentId: "tournament.cheap-seats",
      run: null,
      trophyCollected: false,
      result: {
        title: "Tournament forfeited",
        message: "The run has ended.",
      },
    });
    expect(markup).toContain("Tournament Result");
    expect(markup).toContain("Tournament forfeited");
    expect(markup).toContain("The run has ended");
  });

  it("renders resume state separately from start-new consequences", () => {
    const markup = renderTournamentChoiceScreen({
      tournamentId: "tournament.cheap-seats",
      run: {
        tournamentId: "tournament.cheap-seats",
        origin: "standalone",
        currentNodeId: "round-2",
        roundIndex: 1,
        phase: "ready",
        caseBuilds: [],
        deployedInstanceIds: [],
        healthRatios: { one: 0.5, two: 0 },
        opponentHealthRatios: {},
        activeInstanceId: null,
        nextRoundChargeBonus: 0,
        selectedDrop: null,
        exhaustedAccessoryIds: [],
      },
      trophyCollected: false,
    });
    expect(markup).toContain("Resume Round 2");
    expect(markup).toContain("Both sides keep their current Health");
    expect(markup).toContain("Start new run");
  });

  it("paginates the complete sandbox catalogue and exposes per-copy builds", () => {
    let draft = createTournamentWorkflow("normal");
    draft = toggleTournamentRosterInstance(
      draft,
      draft.catalogue[0]!.instanceId,
    );
    const markup = renderTournamentRosterScreen({
      tournamentId: draft.tournamentId,
      catalogue: draft.catalogue.slice(0, 6),
      selectedCatalogue: draft.catalogue.slice(0, 1),
      selectedInstanceIds: draft.rosterInstanceIds,
      page: 1,
      pageCount: 3,
      buildInstanceId: draft.rosterInstanceIds[0]!,
    });
    expect(markup).toContain('data-command="toggle-tournament-roster"');
    expect(markup).toContain('data-command="configure-tournament-build"');
    expect(markup).toContain('data-command="adjust-tournament-build-level"');
    expect(markup).toContain('data-command="adjust-tournament-build-stat"');
    expect(markup).toContain('data-command="move-tournament-build-action"');
    expect(markup).toContain('data-command="cycle-tournament-build-tier"');
    expect(markup).toContain('data-command="set-tournament-build-patch"');
    expect(markup).toContain("Roster Tray");
    expect(markup).toContain("1/6");
    expect(markup).toContain("1/3");
  });

  it("shows preset isolation and explicit per-fight overrides", () => {
    const draft = setTournamentDefault(
      createTournamentWorkflow("normal"),
      "timeLimitMs",
      180_000,
    );
    const markup = renderTournamentSettingsScreen({
      tournamentId: draft.tournamentId,
      settings: draft.settings,
      customVariant: draft.customVariant,
    });
    expect(markup).toContain("Custom run variant");
    expect(markup).toContain("registered preset remains unchanged");
    expect(markup).toContain('data-command="set-tournament-fight-charge"');
    expect(markup).toContain('data-command="set-tournament-fight-time"');
    expect(markup).toContain(
      'data-command="set-tournament-fight-opponent-charge"',
    );
    expect(markup).toContain("Accessories are chosen with each deployment");
  });
});
