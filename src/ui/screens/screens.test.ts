import { describe, expect, it } from "vitest";
import { startupSequence } from "../../content/startup-content";
import { defaultDevScenario } from "../../dev/scenarios";
import {
  createDefaultSave,
  createOwnedCharacter,
  defaultPreferences,
} from "../../persistence/save";
import { baseOffers } from "../../store/catalog";
import { renderDifficultyOptions } from "../components/difficulty-options";
import { renderStorageWarning } from "../shell/storage-warning";
import { renderAchievementsScreen } from "./achievements-screen";
import { renderBattleScreen } from "./battle-screen";
import { renderCollectionScreen } from "./collection-screen";
import { renderDevLabScreen } from "./dev-lab-screen";
import { renderLineupScreen } from "./lineup-screen";
import { renderMainMenuScreen } from "./main-menu-screen";
import { renderMissionsScreen } from "./missions-screen";
import { renderProfileScreen } from "./profile-screen";
import { renderQuickFightScreen } from "./quick-fight-screen";
import { renderSettingsScreen } from "./settings-screen";
import { renderStartupScreen, startupAdvanceDelay } from "./startup-screen";
import { renderStoreScreen } from "./store-screen";
import { renderStoryScreen } from "./story-screen";
import { renderTournamentScreen } from "./tournament-screen";

describe("screen renderers", () => {
  const save = createDefaultSave(1);
  const difficultyOptions = renderDifficultyOptions("normal");
  const screens = [
    {
      name: "main menu",
      markup: renderMainMenuScreen({
        save,
        devToolsEnabled: true,
      }),
      heading: "Choose a game.",
    },
    {
      name: "profile",
      markup: renderProfileScreen(save),
      heading: "Player Profile",
    },
    {
      name: "settings",
      markup: renderSettingsScreen({
        preferences: defaultPreferences,
        difficultyOptions,
        devToolsEnabled: true,
        experiments: { battlePresentationStyle: "kinetic-print" },
      }),
      heading: "Settings",
    },
    {
      name: "achievements",
      markup: renderAchievementsScreen(save),
      heading: "Achievements",
    },
    {
      name: "story",
      markup: renderStoryScreen(save),
      heading: "First Run",
    },
    {
      name: "lineup",
      markup: renderLineupScreen({
        save,
        difficulty: "normal",
      }),
      heading: "History Disagrees",
    },
    {
      name: "collection",
      markup: renderCollectionScreen(save),
      heading: "Your shelf has opinions.",
    },
    {
      name: "store",
      markup: renderStoreScreen({
        save,
        offers: baseOffers.slice(0, 4),
        locked: false,
      }),
      heading: "Lost Property",
    },
    {
      name: "missions",
      markup: renderMissionsScreen(save, false),
      heading: "Reasons to make it personal.",
    },
    {
      name: "quick fight",
      markup: renderQuickFightScreen({
        playerIds: ["character.viking"],
        enemyIds: ["character.tux"],
        playerAccessoryId: "accessory.press-pass",
        enemyAccessoryId: "accessory.dead-air",
        difficultyOptions,
      }),
      heading: "Set the match.",
    },
    {
      name: "tournament",
      markup: renderTournamentScreen({
        save,
        sessionMode: "tournament",
        run: null,
        locked: false,
      }),
      heading: "The Wrong Door Cup",
    },
    {
      name: "developer lab",
      markup: renderDevLabScreen({
        save,
        draft: structuredClone(defaultDevScenario),
        recentBattleReports: [],
      }),
      heading: "Developer Lab",
    },
    {
      name: "battle",
      markup: renderBattleScreen({
        roundLabel: "QUICK FIGHT · 1 VS 1",
        difficultyOptions: renderDifficultyOptions("normal", true),
        musicPlaybackEnabled: false,
        pauseKeyMode: "hold",
        devToolsEnabled: true,
        presentationStyle: "kinetic-print",
      }),
      heading: "Your Lineup",
    },
    {
      name: "startup",
      markup: renderStartupScreen({
        stage: "intro",
        beat: startupSequence[0]!,
        beatIndex: 0,
        beatCount: startupSequence.length,
      }),
      heading: startupSequence[0]!.title,
    },
    {
      name: "loading",
      markup: renderStartupScreen({
        stage: "loading",
        beat: null,
        beatIndex: 0,
        beatCount: startupSequence.length,
      }),
      heading: "Opening Main Menu",
    },
  ] as const;

  it.each(screens)(
    "renders the $name view as a semantic, actionable document",
    ({ markup, heading }) => {
      expect(markup).toContain(heading);
      expect(markup).toMatch(/<(?:main|section)\b/);
      expect(markup).not.toContain(">undefined<");
    },
  );

  it("escapes profile-owned display text", () => {
    const markup = renderProfileScreen({
      ...save,
      playerName: '<img src=x onerror="alert(1)">',
    });

    expect(markup).toContain("&lt;img");
    expect(markup).not.toContain("<img src=x");
  });

  it("reserves an explicit visual hit or miss verdict in the battle arena", () => {
    const battle = screens.find((screen) => screen.name === "battle")!;

    expect(battle.markup).toContain("data-battle-impact-verdict");
    expect(battle.markup).toContain("data-battle-impact-label");
    expect(battle.markup).toContain("data-battle-impact-detail");
  });

  it("renders collected Tournament Trophies as accessible Profile artwork", () => {
    const markup = renderProfileScreen({
      ...save,
      tournamentTrophyIds: ["trophy.wrong-door-cup"],
    });

    expect(markup).toContain("Trophy cabinet");
    expect(markup).toContain("Wrong Door Cup");
    expect(markup).toContain("/assets/generated/trophies/wrong-door-cup.png");
    expect(markup).toContain(
      'alt="A gold trophy formed from mismatched blue and red doors around a keyhole."',
    );
  });

  it("shows the selected Profile's progression-neutral Quick Fight record", () => {
    const markup = renderProfileScreen({
      ...save,
      quickFightRecord: {
        ...save.quickFightRecord,
        fightsPlayed: 5,
        wins: 3,
        losses: 2,
      },
    });

    expect(markup).toContain("Quick Fights");
    expect(markup).toContain("3–2");
  });

  it("distils a one-beat intro to one clear entry action", () => {
    const markup = renderStartupScreen({
      stage: "intro",
      beat: startupSequence[0]!,
      beatIndex: 0,
      beatCount: 1,
    });

    expect(markup).toContain("Enter LOFTWAH FIGHTER");
    expect(markup).not.toContain("Skip intro");
    expect(markup).not.toContain("startup-progress");
  });

  it("keeps progress and skip controls for a genuine multi-beat intro", () => {
    const markup = renderStartupScreen({
      stage: "intro",
      beat: startupSequence[0]!,
      beatIndex: 0,
      beatCount: 2,
    });

    expect(markup).toContain("Next");
    expect(markup).toContain("Skip intro");
    expect(markup).toContain("01 / 02");
  });

  it("does not duplicate global navigation inside the Main Menu", () => {
    const markup = renderMainMenuScreen({ save, devToolsEnabled: true });

    expect(markup).not.toContain("dev-launch-ticket");
    expect(markup).not.toContain('data-route="achievements"');
    expect(markup).not.toContain('data-route="profile"');
    expect(markup).not.toContain('data-route="settings"');
  });

  it("shows every selected Quick Fight member, Trait bonus, and Accessory", () => {
    const markup = renderQuickFightScreen({
      playerIds: ["character.viking", "character.ned-kelly", "character.tux"],
      enemyIds: ["character.grim-reaper", "character.moses"],
      playerAccessoryId: "accessory.press-pass",
      enemyAccessoryId: "accessory.dead-air",
      difficultyOptions,
    });

    expect(markup.match(/class="fight-member /g)).toHaveLength(6);
    expect(markup.match(/is-empty/g)).toHaveLength(1);
    expect(markup).toContain("Viking");
    expect(markup).toContain("Ned Kelly");
    expect(markup).toContain("Tux");
    expect(markup).toContain("Grim Reaper");
    expect(markup).toContain("Moses");
    expect(markup).toContain("Lineup bonuses");
    expect(markup).toContain("Historic 1.5 points");
    expect(markup).toContain("+7.5 opening Charge");
    expect(markup).toContain("Level 10");
    expect(markup).not.toContain("Standard L10");
    expect(markup).toMatch(
      /name="quickPlayer\.1"[\s\S]*?value="character\.viking"\s+disabled/,
    );
    expect(markup).toContain("add 30 Charge");
    expect(markup).toContain('data-asset-id="image.accessory.second-wind"');
    expect(markup).toContain('data-asset-id="image.accessory.dead-air"');
  });

  it("keeps previously claimed Missions visibly complete after rule revisions", () => {
    const markup = renderMissionsScreen(
      {
        ...save,
        claimedMissionIds: ["mission.print-it-personal"],
      },
      false,
    );

    expect(markup).toMatch(
      /mission-slip is-complete[\s\S]*Run It Back[\s\S]*2\/2[\s\S]*Paid/,
    );
  });

  it("routes an incomplete ending to its remaining Story requirements", () => {
    const markup = renderStoryScreen({
      ...save,
      currentNodeId: "story.first-run.07",
    });

    expect(markup).toContain("The bracket is not the whole story.");
    expect(markup).toContain("Story completion requirements");
    expect(markup).toContain('data-route="missions"');
    expect(markup).toContain("Tournament · Wrong Door Cup");
  });

  it("renders storage recovery as shell-owned, escaped status markup", () => {
    const markup = renderStorageWarning("<strong>invalid save</strong>");

    expect(markup).toContain('class="storage-warning"');
    expect(markup).toContain("&lt;strong&gt;invalid save&lt;/strong&gt;");
    expect(markup).toContain('data-command="download-storage-backup"');
  });

  it("gives both teams stable, independently updated Charge rails", () => {
    const markup = renderBattleScreen({
      roundLabel: "QUICK FIGHT · 1 VS 1",
      difficultyOptions: renderDifficultyOptions("normal", true),
      musicPlaybackEnabled: false,
      pauseKeyMode: "hold",
      devToolsEnabled: true,
      presentationStyle: "kinetic-print",
    });

    expect(markup).toContain("data-player-charge-fill");
    expect(markup).toContain("data-enemy-charge-fill");
    expect(markup).toContain("data-player-charge-rate");
    expect(markup).toContain("data-enemy-charge-rate");
    expect(markup).toMatch(
      /data-enemy-combat-console[\s\S]*data-enemy-readout[\s\S]*data-enemy-charge-meter/,
    );
    expect(markup).toMatch(
      /data-player-combat-console[\s\S]*data-player-readout[\s\S]*data-player-charge-meter/,
    );
    expect(markup).toContain('aria-label="Enemy Charge"');
    expect(markup).toContain("<span>25</span>");
    expect(markup).toContain("<span>50</span>");
    expect(markup).toContain("<span>75</span>");
    expect(markup).toContain("data-battle-presentation-state");
    expect(markup).toContain(
      'class="sr-only battle-presentation-announcement"',
    );
    expect(markup).not.toContain('class="battle-presentation-state"');
    expect(markup).toContain("data-battle-decision-cue");
    expect(markup).toContain("data-enemy-decision-cue");
    expect(markup).toContain("data-battle-inspectable");
    expect(markup).toContain("Team Charge");
    expect(markup).not.toContain("Inspect a Move for exact effects");
    expect(markup).toContain("data-enemy-hud-shell");
    expect(markup).toContain('data-hud-force-compact="false"');
    expect(markup).toContain('data-command="toggle-enemy-hud"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('data-command="inspect-battle-detail"');
    expect(markup).toContain('title="Pause fight · Escape toggles · hold P"');
    expect(markup).toMatch(
      /data-player-charge-meter[\s\S]*data-battle-event-feed/,
    );
    expect(markup).toContain("WATCH · controls return after the hit");
    expect(markup).toContain('aria-live="off"');
    expect(markup.match(/aria-live="assertive"/g)).toHaveLength(2);
  });

  it("keeps the startup story readable until the player advances it", () => {
    expect(startupAdvanceDelay("intro", false)).toBeNull();
    expect(startupAdvanceDelay("loading", false)).toBeGreaterThan(0);
  });

  it("marks every player-facing pre-fight surface as Fight Setup", () => {
    const storySetup = renderLineupScreen({
      save,
      difficulty: "normal",
    });
    const quickSetup = renderQuickFightScreen({
      playerIds: ["character.viking"],
      enemyIds: ["character.tux"],
      playerAccessoryId: "accessory.press-pass",
      enemyAccessoryId: "accessory.dead-air",
      difficultyOptions,
    });
    const tournamentSetup = renderTournamentScreen({
      save,
      sessionMode: "tournament",
      run: null,
      locked: false,
    });
    const ongoingTournamentSetup = renderTournamentScreen({
      save,
      sessionMode: "tournament",
      run: {
        tournamentId: "tournament.cheap-seats",
        origin: "standalone",
        roundIndex: 1,
        phase: "ready",
        caseBuilds: [],
        deployedInstanceIds: [],
        healthRatios: {},
        activeInstanceId: null,
        nextRoundChargeBonus: 0,
        selectedDrop: null,
        exhaustedAccessoryIds: [],
      },
      locked: false,
    });

    for (const markup of [storySetup, quickSetup, tournamentSetup]) {
      expect(markup).toContain("data-fight-setup");
      expect(markup).toContain('class="fight-matchup"');
      expect(markup.match(/class="fight-team /g)).toHaveLength(2);
    }
    expect(tournamentSetup).toContain(
      "Confirm Lineup · Lock Roster · Enter Round 1",
    );
    expect(ongoingTournamentSetup).toContain("Confirm Lineup · Enter Round 2");
  });

  it("renders semantic per-copy build controls in Collection", () => {
    const buildSave = {
      ...save,
      collection: [
        {
          ...createOwnedCharacter("viking-a", "character.viking", 10),
          unspentStatPoints: 2,
        },
        createOwnedCharacter("viking-b", "character.viking", 3),
      ],
      ownedPatches: ["patch.hot-start"],
    };
    const markup = renderCollectionScreen(buildSave);

    expect(markup).toContain('data-command="adjust-build-stat"');
    expect(markup).toContain('data-command="move-build-action"');
    expect(markup).toContain('data-command="enhance-build-action"');
    expect(markup).toContain("Choose duplicate");
    expect(markup).toContain("25 Charge");
    expect(markup).toContain('data-asset-id="image.modification.hot-start"');
  });

  it("renders Character and Modification art in the Store", () => {
    const markup = renderStoreScreen({
      save,
      offers: baseOffers,
      locked: false,
    });

    expect(markup).toContain('data-asset-id="image.tux.canonical"');
    expect(markup).toContain('data-asset-id="image.modification.hot-start"');
    expect(markup).toContain('data-asset-id="image.modification.lucky-charm"');
  });
});
