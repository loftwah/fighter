import { describe, expect, it } from "vitest";
import { startupSequence } from "../../content/startup-content";
import { defaultDevScenario } from "../../dev/scenarios";
import { createDefaultSave, defaultPreferences } from "../../persistence/save";
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
import { renderStartupScreen } from "./startup-screen";
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
      heading: "Collector Profile",
    },
    {
      name: "settings",
      markup: renderSettingsScreen({
        preferences: defaultPreferences,
        difficultyOptions,
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
      heading: "Pull three. Print one.",
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
      heading: "Backroom Counter",
    },
    {
      name: "missions",
      markup: renderMissionsScreen(save, false),
      heading: "Reasons to make it personal.",
    },
    {
      name: "quick fight",
      markup: renderQuickFightScreen({
        playerIds: ["character.mara-vex"],
        enemyIds: ["character.zipwire"],
        difficultyOptions,
      }),
      heading: "Quick Fight",
    },
    {
      name: "tournament",
      markup: renderTournamentScreen({
        save,
        sessionMode: "tournament",
        run: null,
        locked: false,
      }),
      heading: "The Cheap Seats Cup",
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
        devToolsEnabled: true,
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
      heading: "Loading Riot Relics",
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
      devToolsEnabled: true,
    });

    expect(markup).toContain("data-player-charge-fill");
    expect(markup).toContain("data-enemy-charge-fill");
    expect(markup).toContain('aria-label="Enemy Charge"');
  });
});
