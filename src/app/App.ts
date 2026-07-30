import type Phaser from "phaser";
import {
  isRouteAvailableInSession,
  routeIds,
  type Route,
  type SessionMode,
} from "./routes";
import { AudioManager } from "../audio/manager";
import { findMusic } from "../audio/registry";
import {
  chooseAiCommand,
  createBattle,
  predictedDamage,
  requestAction,
  requestSwitch,
  tickBattle,
} from "../combat/engine";
import {
  classMultiplier,
  difficultyAiDelay,
  isAlive,
  POSITION_RULES,
} from "../combat/rules";
import type {
  BattleEvent,
  BattleState,
  CombatantBuild,
  Difficulty,
  Side,
  Transition,
} from "../combat/types";
import { createStandardBuild } from "../combat/standard-build";
import {
  appendBattleTransition,
  createBattleReport,
  recordBattleDecision,
  recordBattleDebugAction,
  recordBattleDifficultyChange,
  type BattleReport,
} from "../combat/report";
import {
  combatContent,
  missions,
  storyNodes,
} from "../content/initial-content";
import { startupSequence } from "../content/startup-content";
import { calculateBattleReward } from "../economy/rewards";
import type { BattleScene } from "../game/BattleScene";
import {
  BATTLE_COUNTDOWN,
  battlePresentationDuration,
} from "../game/presentation-timing";
import { evaluateMissionProgress } from "../missions/evaluate";
import { nextImageFallback, resolveImagePath } from "../assets/registry";
import {
  acceptSafeDefaults,
  collectCorruptBackups,
  createOwnedCharacter,
  loadActiveSaveSlot,
  loadPreferences,
  loadStorageWarning,
  savePreferences,
  saveActiveSaveSlot,
  saveSlot,
  type Preferences,
  type SaveData,
  type TournamentCaseBuild,
  type TournamentRunData,
} from "../persistence/save";
import { addXp } from "../progression/levels";
import {
  buildForOwnedCharacter,
  equipPatch,
  findPatch,
  openingChargeBonus,
  patches,
} from "../progression/patches";
import { rotatingOffers, type StoreOffer } from "../store/catalog";
import { purchaseOffer } from "../store/purchase";
import {
  claimFirstRunEnding,
  FIRST_RUN_ENDING_REWARD,
  firstRunEncounter,
  isFirstRunNodeReached,
  type FirstRunBattleNodeId,
} from "../story/first-run";
import { loadFirstRunSave } from "../story/save";
import {
  applyCheapSeatsDrop,
  cheapSeatsEncounter,
  cheapSeatsPlayerIds,
  createCheapSeatsRun,
  lockCheapSeatsCase,
  recordCheapSeatsResult,
  restoreCaseHealth,
  type CheapSeatsDrop,
} from "../tournaments/cheap-seats";
import {
  applyDevStartingHealth,
  defaultDevScenario,
  devBuildsForSide,
  findDevScenario,
  validateDevScenario,
  type BattleControllerKind,
  type DevBattleScenario,
  type DevMoveTier,
} from "../dev/scenarios";
import { escapeHtml, formatClass, formatTime } from "../ui/format";
import {
  renderStartupScreen,
  type StartupStage,
} from "../ui/screens/startup-screen";
import { renderAchievementsScreen } from "../ui/screens/achievements-screen";
import { renderQuickFightScreen } from "../ui/screens/quick-fight-screen";
import { renderProfileScreen } from "../ui/screens/profile-screen";
import { renderSettingsScreen } from "../ui/screens/settings-screen";
import { renderMainMenuScreen } from "../ui/screens/main-menu-screen";
import { renderStoryScreen } from "../ui/screens/story-screen";
import { renderLineupScreen } from "../ui/screens/lineup-screen";
import { renderCollectionScreen } from "../ui/screens/collection-screen";
import { renderStoreScreen } from "../ui/screens/store-screen";
import { renderMissionsScreen } from "../ui/screens/missions-screen";
import { renderTournamentScreen } from "../ui/screens/tournament-screen";
import { renderDevLabScreen } from "../ui/screens/dev-lab-screen";
import {
  renderBattleScreen,
  type BattleScreenModel,
} from "../ui/screens/battle-screen";
import { renderDifficultyOptions } from "../ui/components/difficulty-options";
import {
  renderAppHeader,
  renderMobileNavigation,
  type AppShellModel,
} from "../ui/shell/app-shell";
import { renderStorageWarning } from "../ui/shell/storage-warning";

interface BattleRewardView {
  won: boolean;
  stamps: number;
  xp: number;
  xpRecipients: number;
  firstClearBonus: number;
  cupCompletionBonus: number;
}

const CUP_COMPLETION_BONUS = 240;
const DEV_TOOLS_ENABLED = import.meta.env.DEV;

export class App {
  readonly #root: HTMLElement;
  #route: Route = "menu";
  #sessionMode: SessionMode = "menu";
  #preferences: Preferences;
  #save: SaveData;
  #audio: AudioManager;
  #battle: BattleState | null = null;
  #battleScene: BattleScene | null = null;
  #phaserGame: Phaser.Game | null = null;
  #animationFrame = 0;
  #lastFrameAt = 0;
  #lastAiAt = 0;
  #lastUiAt = 0;
  #battleReward: BattleRewardView | null = null;
  #eventLog: string[] = [];
  #battleHandled = false;
  #isTournamentFight = false;
  #isQuickFight = false;
  #isDevFight = false;
  #quickPlayerIds = ["character.mara-vex"];
  #quickEnemyIds = ["character.knuckle-tax"];
  #devScenario: DevBattleScenario | null = null;
  #devDraft: DevBattleScenario = structuredClone(defaultDevScenario);
  #battleControllers: Record<Side, BattleControllerKind> = {
    player: "human-local",
    enemy: "ai",
  };
  #battleReady = false;
  #battlePaused = false;
  #battleCountdownTimer = 0;
  #battlePresentationLockedUntil = 0;
  #battleViewDirty = false;
  #pauseMenuOpen = false;
  #devInspectorOpen = false;
  #battleOverlayOpener: HTMLElement | null = null;
  #battleTimeScale = 1;
  #actionTraySignature = "";
  #recentBattleReports: BattleReport[] = [];
  #tournamentRoundIndex: 0 | 1 | 2 = 0;
  #cupCompletedThisBattle = false;
  #storyBattleNodeId: FirstRunBattleNodeId = "story.first-run.02";
  #battleReport: BattleReport | null = null;
  #battleReportArchived = false;
  #stableMarkup = new WeakMap<HTMLElement, string>();
  #storageWarning: string | null;
  #startupStage: StartupStage =
    startupSequence.length > 0 ? "intro" : "loading";
  #startupBeatIndex = 0;
  #startupTimer = 0;

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#preferences = loadPreferences(localStorage);
    this.#save = loadFirstRunSave(
      localStorage,
      loadActiveSaveSlot(localStorage),
    );
    this.normaliseLoadedTournamentRun();
    this.#storageWarning = loadStorageWarning(localStorage);
    this.#audio = new AudioManager(this.#preferences);
    this.#root.addEventListener("click", this.onClick);
    this.#root.addEventListener("change", this.onChange);
    this.#root.addEventListener("input", this.onInput);
    this.#root.addEventListener("error", this.onMediaError, true);
    window.addEventListener("keydown", this.onKeyDown);
  }

  mount(): void {
    this.render();
    this.scheduleStartupAdvance();
  }

  destroy(): void {
    cancelAnimationFrame(this.#animationFrame);
    window.clearTimeout(this.#battleCountdownTimer);
    window.clearTimeout(this.#startupTimer);
    this.#phaserGame?.destroy(true);
    this.#audio.destroy();
    this.#root.removeEventListener("click", this.onClick);
    this.#root.removeEventListener("change", this.onChange);
    this.#root.removeEventListener("input", this.onInput);
    this.#root.removeEventListener("error", this.onMediaError, true);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onMediaError = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.dataset.assetId) {
      return;
    }
    const fallback = nextImageFallback(target.dataset.assetId);
    if (!fallback || fallback.id === target.dataset.assetId) {
      return;
    }
    target.dataset.assetId = fallback.id;
    target.src = fallback.path;
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.#route !== "battle" || !this.#battle) {
      return;
    }
    if (
      event.key === "Tab" &&
      (this.#pauseMenuOpen || this.#devInspectorOpen)
    ) {
      this.trapBattleOverlayFocus(event);
      return;
    }
    if (
      event.key === "Escape" &&
      this.#battleReady &&
      !this.isBattlePresentationLocked() &&
      this.#battle.outcome === "active"
    ) {
      event.preventDefault();
      if (this.#devInspectorOpen) {
        this.#devInspectorOpen = false;
        this.#pauseMenuOpen = true;
        this.updateBattleOverlay();
      } else {
        this.toggleBattlePause();
      }
      return;
    }
    if (
      !this.#battleReady ||
      this.#battlePaused ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active" ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    const actionIndex = Number(event.key) - 1;
    if (actionIndex < 0 || actionIndex > 2) {
      return;
    }
    const active = this.#battle.player.squad[this.#battle.player.activeIndex];
    const actionId = active?.actionIds[actionIndex];
    if (actionId) {
      event.preventDefault();
      this.playerAction("player", actionId);
    }
  };

  private onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const routeButton = target.closest<HTMLElement>("[data-route]");
    if (routeButton?.dataset.route) {
      this.navigate(routeButton.dataset.route as Route);
      return;
    }
    const command = target.closest<HTMLElement>("[data-command]");
    if (!command?.dataset.command) {
      return;
    }
    switch (command.dataset.command) {
      case "advance-startup":
        this.advanceStartup();
        break;
      case "skip-startup":
        this.enterStartupLoading();
        break;
      case "enter-story":
        this.#sessionMode = "story";
        this.navigate("story");
        break;
      case "enter-quick":
        this.#sessionMode = "quick";
        this.navigate("quick");
        break;
      case "enter-tournament":
        this.#sessionMode = "tournament";
        this.navigate("tournament");
        break;
      case "enter-dev":
        if (DEV_TOOLS_ENABLED) {
          this.#sessionMode = "dev";
          this.navigate("dev");
        }
        break;
      case "main-menu":
        this.exitToMainMenu();
        break;
      case "continue-story":
        this.continueStory();
        break;
      case "advance-story-node":
        this.advanceStoryNode();
        break;
      case "start-battle":
        this.startBattle(false);
        break;
      case "start-quick-battle":
        this.startQuickBattle();
        break;
      case "start-tournament":
        this.startTournamentBattle();
        break;
      case "start-dev-scenario":
        if (command.dataset.scenarioId) {
          const scenarioDefinition = findDevScenario(
            command.dataset.scenarioId,
          );
          if (scenarioDefinition) {
            this.startDevBattle(scenarioDefinition);
          }
        }
        break;
      case "start-dev-custom":
        this.startDevBattle({
          ...validateDevScenario(this.#devDraft),
          id: "dev.custom",
          name: "Custom Fight",
          description: "A developer-composed deterministic matchup.",
          startPaused: command.dataset.paused === "true",
        });
        break;
      case "cup-drop":
        if (command.dataset.drop) {
          this.chooseCupDrop(command.dataset.drop as CheapSeatsDrop);
        }
        break;
      case "battle-action":
        if (
          command.dataset.actionId &&
          command.getAttribute("aria-disabled") !== "true"
        ) {
          this.playerAction(
            command.dataset.side === "enemy" ? "enemy" : "player",
            command.dataset.actionId,
          );
        }
        break;
      case "battle-switch":
        if (command.dataset.index) {
          this.playerSwitch(
            command.dataset.side === "enemy" ? "enemy" : "player",
            Number(command.dataset.index),
          );
        }
        break;
      case "pause-battle":
        this.openBattlePause();
        break;
      case "resume-battle":
        this.closeBattleOverlaysAndResume();
        break;
      case "open-dev-inspector":
        if (DEV_TOOLS_ENABLED) {
          this.openDevInspector();
        }
        break;
      case "close-dev-inspector":
        this.#devInspectorOpen = false;
        this.#pauseMenuOpen = true;
        this.updateBattleOverlay();
        break;
      case "dev-step":
        this.stepDevBattle(Number(command.dataset.ms) || 100);
        break;
      case "dev-add-charge":
        this.addDevCharge(
          command.dataset.side === "enemy" ? "enemy" : "player",
          Number(command.dataset.amount) || 25,
        );
        break;
      case "dev-copy-state":
        void this.copyBattleState();
        break;
      case "download-battle-report":
        this.downloadBattleReport();
        break;
      case "restart-battle":
        if (this.#isDevFight && this.#devScenario) {
          this.startDevBattle(this.#devScenario);
        } else if (this.#isTournamentFight) {
          this.startTournamentBattle();
        } else if (this.#isQuickFight) {
          this.startQuickBattle();
        } else {
          this.startBattle(false);
        }
        break;
      case "dev-grant-stamps":
        this.grantDevStamps(Number(command.dataset.amount) || 500);
        break;
      case "dev-unlock-story":
        this.unlockStoryForDevelopment();
        break;
      case "dev-grant-collection":
        this.grantDevCollection();
        break;
      case "retry-battle":
        if (this.#isTournamentFight) {
          this.startTournamentBattle();
        } else if (this.#isDevFight && this.#devScenario) {
          this.startDevBattle(this.#devScenario);
        } else if (this.#isQuickFight) {
          this.startQuickBattle();
        } else {
          this.startBattle(false);
        }
        break;
      case "leave-battle":
        if (this.#isDevFight) {
          this.navigate("dev");
        } else if (this.#isQuickFight) {
          this.navigate("quick");
        } else if (this.#isTournamentFight) {
          this.navigate(
            this.#sessionMode === "story" && this.#cupCompletedThisBattle
              ? "story"
              : "tournament",
          );
        } else {
          this.navigate("story");
        }
        break;
      case "toggle-music":
        this.toggleMusicPlayback();
        this.updateNowPlaying();
        break;
      case "buy-offer":
        if (command.dataset.offerId) {
          this.buyOffer(command.dataset.offerId);
        }
        break;
      case "claim-mission":
        if (command.dataset.missionId) {
          this.claimMission(command.dataset.missionId);
        }
        break;
      case "dismiss-storage-warning":
        {
          const recovered = acceptSafeDefaults(localStorage, this.#save.slot);
          this.#preferences = recovered.preferences;
          this.#save = recovered.save;
        }
        this.#storageWarning = null;
        this.render();
        break;
      case "download-storage-backup":
        this.downloadStorageBackup();
        break;
      case "download-profile-data":
        this.downloadProfileData();
        break;
    }
  };

  private onChange = (event: Event): void => {
    const target = event.target;
    if (!(
      target instanceof HTMLInputElement || target instanceof HTMLSelectElement
    )) {
      return;
    }
    if (target.name === "difficulty") {
      const difficulty = target.value as Difficulty;
      if (this.#battle?.outcome === "active" && this.#battleReport) {
        this.#battleReport = recordBattleDifficultyChange(
          this.#battleReport,
          this.#battle,
          difficulty,
        );
      }
      this.#preferences.difficulty = difficulty;
      if (this.#battle?.outcome === "active") {
        this.#battle.difficulty = this.#preferences.difficulty;
      }
      this.persistPreferences();
      if (this.#route !== "battle") {
        this.render();
      }
    }
    const quickSelection = target.name.match(/^quick(Player|Enemy)\.(\d)$/);
    if (quickSelection) {
      const side = quickSelection[1];
      const index = Number(quickSelection[2]);
      const ids =
        side === "Player"
          ? [...this.#quickPlayerIds]
          : [...this.#quickEnemyIds];
      if (target.value) {
        ids[index] = target.value;
      } else {
        ids.splice(index, 1);
      }
      const compactIds = ids.filter(Boolean).slice(0, 3);
      if (side === "Player") {
        this.#quickPlayerIds = compactIds;
      } else {
        this.#quickEnemyIds = compactIds;
      }
      this.render();
    }
    if (target.dataset.devField && DEV_TOOLS_ENABLED) {
      this.updateDevDraftFromControl(target);
    }
    if (target.name === "profileSlot") {
      const slot = Number(target.value);
      if (slot === 1 || slot === 2 || slot === 3) {
        saveActiveSaveSlot(localStorage, slot);
        this.#save = loadFirstRunSave(localStorage, slot);
        this.normaliseLoadedTournamentRun();
        this.#storageWarning = loadStorageWarning(localStorage);
        this.render();
        this.announce(`Save slot ${slot} opened.`);
      }
    }
    if (target.name === "reducedMotion" && target instanceof HTMLInputElement) {
      this.#preferences.reducedMotion = target.checked;
      this.persistPreferences();
      this.#battleScene?.setReducedMotion(target.checked);
    }
    if (
      target.name === "musicPlaybackEnabled" &&
      target instanceof HTMLInputElement
    ) {
      this.#preferences.musicPlaybackEnabled = target.checked;
      if (target.checked) {
        this.#preferences.musicMuted = false;
      }
      this.persistPreferences();
      this.#audio.applyPreferences(this.#preferences);
      if (target.checked) {
        void this.#audio.playTrack(
          this.#audio.currentTrackId || "music.red-thread",
        );
      }
      this.render();
    }
    if (
      target.name === "musicMuted" ||
      target.name === "sfxMuted" ||
      target.name === "dialogueMuted"
    ) {
      this.#preferences[target.name] = (target as HTMLInputElement).checked;
      if (
        target.name === "musicMuted" &&
        (target as HTMLInputElement).checked
      ) {
        this.#preferences.musicPlaybackEnabled = false;
      }
      this.persistPreferences();
      this.#audio.applyPreferences(this.#preferences);
    }
    if (target.name === "playerName") {
      this.#save.playerName = target.value.trim() || "Collector";
      this.#save = saveSlot(localStorage, this.#save);
      this.render();
    }
    if (target.name === "equippedPatch") {
      if (this.#save.tournamentRun) {
        this.render();
        this.announce("Patches stay locked while a Cup Case is open.");
        return;
      }
      const instanceId = target.dataset.instanceId;
      if (instanceId) {
        const patchId = target.value || null;
        this.#save.collection = equipPatch(
          this.#save.collection,
          this.#save.ownedPatches,
          instanceId,
          patchId,
        );
        this.#save = saveSlot(localStorage, this.#save);
        this.render();
        this.announce(
          patchId
            ? `${findPatch(patchId)?.name ?? "Patch"} equipped.`
            : "Patch removed.",
        );
      }
    }
  };

  private onInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "range") {
      return;
    }
    const value = Number(target.value);
    if (
      target.name === "musicVolume" ||
      target.name === "sfxVolume" ||
      target.name === "dialogueVolume"
    ) {
      this.#preferences[target.name] = value;
      this.persistPreferences();
      this.#audio.applyPreferences(this.#preferences);
      const output = this.#root.querySelector<HTMLOutputElement>(
        `output[for="${target.id}"]`,
      );
      if (output) {
        output.value = `${Math.round(value * 100)}%`;
      }
    }
  };

  private persistPreferences(): void {
    savePreferences(localStorage, this.#preferences);
    document.documentElement.dataset.reducedMotion = String(
      this.#preferences.reducedMotion,
    );
  }

  private exitToMainMenu(): void {
    if (this.#route === "battle") {
      this.stopBattle();
    }
    this.#sessionMode = "menu";
    this.#route = "menu";
    this.render();
    window.scrollTo(0, 0);
  }

  private toggleMusicPlayback(): void {
    this.#preferences.musicPlaybackEnabled =
      !this.#preferences.musicPlaybackEnabled;
    if (this.#preferences.musicPlaybackEnabled) {
      this.#preferences.musicMuted = false;
    }
    this.persistPreferences();
    this.#audio.applyPreferences(this.#preferences);
    if (this.#preferences.musicPlaybackEnabled) {
      void this.#audio
        .playTrack(this.#audio.currentTrackId || "music.red-thread")
        .then(() => this.updateNowPlaying());
    } else {
      this.#audio.pauseMusic();
    }
  }

  private navigate(route: Route): void {
    if (route === "menu") {
      this.exitToMainMenu();
      return;
    }
    if (this.routeLocked(route)) {
      this.announce("That print has not been revealed in First Run yet.");
      return;
    }
    if (this.#route === "battle" && route !== "battle") {
      this.stopBattle();
    }
    this.#route = route;
    this.render();
    window.scrollTo(0, 0);
    const heading = this.#root.querySelector<HTMLElement>(
      "#main-content h1, #main-content h2",
    );
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  private routeLocked(route: Route): boolean {
    if (
      !isRouteAvailableInSession(route, this.#sessionMode, DEV_TOOLS_ENABLED)
    ) {
      return true;
    }
    const targetNodeId =
      route === "store"
        ? "story.first-run.03"
        : route === "missions"
          ? "story.first-run.04"
          : route === "tournament" && this.#sessionMode === "story"
            ? "story.first-run.06"
            : null;
    return targetNodeId
      ? !isFirstRunNodeReached(
          this.#save.currentNodeId,
          this.#save.clearedNodeIds,
          targetNodeId,
        )
      : false;
  }

  private continueStory(): void {
    switch (this.#save.currentNodeId) {
      case "story.first-run.00":
        this.grantMaraReward();
        this.completeStoryNodes(["story.first-run.00"], "story.first-run.01");
        this.navigate("story");
        break;
      case "story.first-run.01":
        this.grantMaraReward();
        this.completeStoryNodes(["story.first-run.01"], "story.first-run.02");
        this.navigate("lineup");
        break;
      case "story.first-run.03":
        this.navigate("store");
        break;
      case "story.first-run.04":
        this.navigate("missions");
        break;
      case "story.first-run.05":
        this.navigate("lineup");
        break;
      case "story.first-run.06":
        this.navigate("tournament");
        break;
      case "story.first-run.07":
        {
          const ending = claimFirstRunEnding(this.#save);
          if (!ending.claimed) {
            break;
          }
          this.#save = saveSlot(localStorage, ending.save);
          this.render();
          this.announce(
            `First Run complete. ${FIRST_RUN_ENDING_REWARD} Stamps and the Knuckle Tax rival file were added.`,
          );
        }
        break;
      case "story.first-run.02":
      default:
        this.navigate("lineup");
        break;
    }
  }

  private grantMaraReward(): void {
    if (
      this.#save.collection.some(
        (entry) => entry.characterId === "character.mara-vex",
      )
    ) {
      return;
    }
    this.#save.collection.push(
      createOwnedCharacter("owned.mara-vex.1", "character.mara-vex", 7),
    );
    this.#save.missionProgress["mission.fresh-ink"] = 1;
  }

  private advanceStoryNode(): void {
    if (this.#save.currentNodeId === "story.first-run.03") {
      this.completeStoryNodes(["story.first-run.03"], "story.first-run.04");
      this.navigate("missions");
      return;
    }
    if (this.#save.currentNodeId === "story.first-run.04") {
      this.completeStoryNodes(["story.first-run.04"], "story.first-run.05");
      this.navigate("lineup");
    }
  }

  private completeStoryNodes(nodeIds: string[], nextNodeId: string): void {
    for (const nodeId of nodeIds) {
      if (!this.#save.clearedNodeIds.includes(nodeId)) {
        this.#save.clearedNodeIds.push(nodeId);
      }
    }
    this.#save.currentNodeId = nextNodeId;
    this.#save = saveSlot(localStorage, this.#save);
  }

  private render(): void {
    this.persistPreferences();
    if (this.#startupStage !== "ready") {
      this.renderStartup();
      return;
    }
    if (this.#route === "battle") {
      this.renderBattle();
      return;
    }
    const shellModel = this.appShellModel();
    this.#root.innerHTML = `
      <div class="app-shell">
        ${renderAppHeader(shellModel)}
        ${renderStorageWarning(this.#storageWarning)}
        <main class="screen" id="main-content">
          ${this.screenContent()}
        </main>
        ${renderMobileNavigation(shellModel)}
        <div class="sr-only" aria-live="polite" id="announcer"></div>
      </div>
    `;
  }

  private appShellModel(): AppShellModel {
    return {
      route: this.#route,
      sessionMode: this.#sessionMode,
      save: this.#save,
      preferences: this.#preferences,
      difficultyOptions: renderDifficultyOptions(
        this.#preferences.difficulty,
        true,
      ),
      devToolsEnabled: DEV_TOOLS_ENABLED,
      lockedRoutes: new Set(
        routeIds.filter((route) => this.routeLocked(route)),
      ),
    };
  }

  private renderStartup(): void {
    const beat = startupSequence[this.#startupBeatIndex];
    if (this.#startupStage === "intro" && !beat) {
      this.enterStartupLoading();
      return;
    }
    this.#root.innerHTML = renderStartupScreen({
      stage: this.#startupStage === "loading" ? "loading" : "intro",
      beat: beat ?? null,
      beatIndex: this.#startupBeatIndex,
      beatCount: startupSequence.length,
    });
  }

  private scheduleStartupAdvance(): void {
    window.clearTimeout(this.#startupTimer);
    if (this.#startupStage === "ready") {
      return;
    }
    const delay =
      this.#startupStage === "loading"
        ? this.#preferences.reducedMotion
          ? 120
          : 650
        : startupSequence[this.#startupBeatIndex]?.durationMs;
    if (delay === undefined) {
      this.enterStartupLoading();
      return;
    }
    this.#startupTimer = window.setTimeout(() => {
      if (this.#startupStage === "loading") {
        this.#startupStage = "ready";
        this.render();
        return;
      }
      this.advanceStartup();
    }, delay);
  }

  private advanceStartup(): void {
    window.clearTimeout(this.#startupTimer);
    if (
      this.#startupStage === "intro" &&
      this.#startupBeatIndex < startupSequence.length - 1
    ) {
      this.#startupBeatIndex += 1;
      this.render();
      this.scheduleStartupAdvance();
      return;
    }
    this.enterStartupLoading();
  }

  private enterStartupLoading(): void {
    window.clearTimeout(this.#startupTimer);
    this.#startupStage = "loading";
    this.render();
    this.scheduleStartupAdvance();
  }

  private downloadStorageBackup(): void {
    const backups = collectCorruptBackups(localStorage);
    const blob = new Blob([JSON.stringify(backups, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "riot-relics-corrupt-save-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  private downloadProfileData(): void {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            profile: this.#save,
            preferences: this.#preferences,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `riot-relics-profile-${this.#save.slot}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private downloadBattleReport(): void {
    const report = this.#battleReport ?? this.#recentBattleReports[0];
    if (!report) {
      this.announce("Run a battle before exporting a report.");
      return;
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.encounterId.replaceAll(".", "-")}-report.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private grantDevStamps(amount: number): void {
    if (!DEV_TOOLS_ENABLED) {
      return;
    }
    this.#save.stamps += Math.max(0, Math.round(amount));
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce(`${amount} development Stamps added.`);
  }

  private grantDevCollection(): void {
    if (!DEV_TOOLS_ENABLED) {
      return;
    }
    for (const character of Object.values(combatContent.characters)) {
      if (
        this.#save.collection.some(
          (entry) => entry.characterId === character.id,
        )
      ) {
        continue;
      }
      this.#save.collection.push(
        createOwnedCharacter(
          `dev-grant.${this.#save.slot}.${character.id}`,
          character.id,
          Math.max(10, character.level),
        ),
      );
    }
    this.#save.ownedPatches = Array.from(
      new Set([
        ...this.#save.ownedPatches,
        ...patches.map((patch) => patch.id),
      ]),
    );
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("All current Relics and Patches granted.");
  }

  private unlockStoryForDevelopment(): void {
    if (!DEV_TOOLS_ENABLED) {
      return;
    }
    this.#save.clearedNodeIds = storyNodes
      .filter((node) => node.id !== "story.first-run.07")
      .map((node) => node.id);
    this.#save.currentNodeId = "story.first-run.07";
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("First Run views unlocked for development.");
  }

  private screenContent(): string {
    switch (this.#route) {
      case "menu":
        return renderMainMenuScreen({
          save: this.#save,
          devToolsEnabled: DEV_TOOLS_ENABLED,
        });
      case "story":
        return renderStoryScreen(this.#save);
      case "lineup":
        return renderLineupScreen({
          save: this.#save,
          difficulty: this.#preferences.difficulty,
        });
      case "collection":
        return renderCollectionScreen(this.#save);
      case "store":
        return renderStoreScreen({
          save: this.#save,
          offers: this.currentOffers(),
          locked: this.routeLocked("store"),
        });
      case "missions":
        return renderMissionsScreen(this.#save, this.routeLocked("missions"));
      case "quick":
        return renderQuickFightScreen({
          playerIds: this.#quickPlayerIds,
          enemyIds: this.#quickEnemyIds,
          difficultyOptions: renderDifficultyOptions(
            this.#preferences.difficulty,
          ),
        });
      case "tournament":
        return renderTournamentScreen({
          save: this.#save,
          sessionMode: this.#sessionMode,
          run: this.activeTournamentRun(),
          locked: this.routeLocked("tournament"),
        });
      case "achievements":
        return renderAchievementsScreen(this.#save);
      case "profile":
        return renderProfileScreen(this.#save);
      case "settings":
        return renderSettingsScreen({
          preferences: this.#preferences,
          difficultyOptions: renderDifficultyOptions(
            this.#preferences.difficulty,
          ),
        });
      case "dev":
        return DEV_TOOLS_ENABLED
          ? renderDevLabScreen({
              save: this.#save,
              draft: this.#devDraft,
              recentBattleReports: this.#recentBattleReports,
            })
          : renderMainMenuScreen({
              save: this.#save,
              devToolsEnabled: DEV_TOOLS_ENABLED,
            });
      case "battle":
        return "";
    }
  }

  private updateDevDraftFromControl(
    target: HTMLInputElement | HTMLSelectElement,
  ): boolean {
    const field = target.dataset.devField;
    if (!field) {
      return false;
    }
    const next = structuredClone(this.#devDraft);
    const characterField = /^(player|enemy)Character\.(\d)$/.exec(field);
    if (characterField) {
      const side = characterField[1] as Side;
      const ids = [0, 1, 2]
        .map(
          (index) =>
            this.#root.querySelector<HTMLSelectElement>(
              `[data-dev-field="${side}Character.${index}"]`,
            )?.value ?? "",
        )
        .filter(Boolean);
      if (ids.length > 0) {
        if (side === "player") {
          next.playerCharacterIds = ids;
        } else {
          next.enemyCharacterIds = ids;
        }
      }
    } else if (field === "devDifficulty") {
      next.difficulty = target.value as Difficulty;
    } else if (field === "playerTier" || field === "enemyTier") {
      next[field] = target.value as DevMoveTier;
    } else if (field === "playerPatchId" || field === "enemyPatchId") {
      next[field] = target.value || null;
    } else {
      const numericValue =
        target instanceof HTMLInputElement
          ? target.valueAsNumber
          : Number(target.value);
      if (!Number.isFinite(numericValue)) {
        target.setCustomValidity("Enter a number in the supported range.");
        target.reportValidity();
        this.announce("That development value must be a number.");
        return false;
      }
      if (field === "timeLimitSeconds") {
        next.timeLimitMs = numericValue * 1000;
      } else if (field === "playerHealthPercent") {
        next.playerHealthRatio = numericValue / 100;
      } else if (field === "enemyHealthPercent") {
        next.enemyHealthRatio = numericValue / 100;
      } else if (
        field === "playerLevel" ||
        field === "enemyLevel" ||
        field === "playerStartingBar" ||
        field === "enemyStartingBar" ||
        field === "seed"
      ) {
        next[field] = numericValue;
      }
    }
    try {
      this.#devDraft = validateDevScenario(next);
      target.setCustomValidity("");
      return true;
    } catch {
      target.setCustomValidity("Enter a value in the supported range.");
      target.reportValidity();
      this.announce("That scenario value is outside the supported range.");
      return false;
    }
  }

  private currentOffers(): StoreOffer[] {
    return rotatingOffers(new Date().toISOString().slice(0, 10));
  }

  private buyOffer(offerId: string): void {
    const offer = this.currentOffers().find(
      (candidate) => candidate.id === offerId,
    );
    if (!offer) {
      return;
    }
    const purchase = purchaseOffer(
      this.#save,
      offer,
      offer.kind === "character"
        ? `owned.${offer.itemId}.${Date.now()}`
        : undefined,
    );
    if (!purchase.ok) {
      return;
    }
    this.#save = saveSlot(localStorage, purchase.save);
    this.render();
    this.announce(`${offer.name} added to your shelf.`);
  }

  private claimMission(missionId: string): void {
    const mission = missions.find((candidate) => candidate.id === missionId);
    if (
      !mission ||
      this.#save.claimedMissionIds.includes(mission.id) ||
      (this.#save.missionProgress[mission.id] ?? 0) < mission.target
    ) {
      return;
    }
    this.#save.claimedMissionIds.push(mission.id);
    this.#save.stamps += mission.rewardStamps;
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce(`${mission.name} paid ${mission.rewardStamps} Stamps.`);
  }

  private renderBattle(): void {
    if (!this.#battle) {
      this.startBattle(false);
      return;
    }
    this.#root.innerHTML = renderBattleScreen(this.battleScreenModel());

    const canvasParent =
      this.#root.querySelector<HTMLElement>("#battle-canvas");
    if (!canvasParent) {
      return;
    }
    void this.mountBattleGame(canvasParent);
    this.updateBattleView();
    this.updateBattleOverlay();
    this.#lastFrameAt = performance.now();
    this.#lastAiAt = this.#lastFrameAt;
    this.#animationFrame = requestAnimationFrame(this.battleLoop);
    void this.#audio
      .playTrack("music.red-thread")
      .then(() => this.updateNowPlaying());
  }

  private battleScreenModel(): BattleScreenModel {
    const roundLabel = this.#isTournamentFight
      ? `CHEAP SEATS · ROUND ${this.#tournamentRoundIndex + 1} · ${cheapSeatsEncounter(this.#tournamentRoundIndex).title.toUpperCase()}`
      : this.#isDevFight && this.#devScenario
        ? `DEV LAB · ${this.#devScenario.name.toUpperCase()}`
        : this.#isQuickFight
          ? `QUICK FIGHT · ${this.#quickPlayerIds.length} VS ${this.#quickEnemyIds.length}`
          : firstRunEncounter(this.#storyBattleNodeId).railLabel;

    return {
      roundLabel,
      difficultyOptions: renderDifficultyOptions(
        this.#battle?.difficulty ?? this.#preferences.difficulty,
        true,
      ),
      musicPlaybackEnabled: this.#preferences.musicPlaybackEnabled,
      devToolsEnabled: DEV_TOOLS_ENABLED,
    };
  }

  private async mountBattleGame(canvasParent: HTMLElement): Promise<void> {
    const { createBattleGame } = await import("../game/create-game");
    if (
      !canvasParent.isConnected ||
      this.#route !== "battle" ||
      !this.#battle
    ) {
      return;
    }
    this.#phaserGame = createBattleGame(canvasParent, (scene) => {
      this.#battleScene = scene;
      scene.setReducedMotion(this.#preferences.reducedMotion);
      if (this.#battle) {
        scene.setSnapshot(this.#battle);
      }
      this.#lastFrameAt = performance.now();
      scene.setSimulationPaused(this.#battlePaused);
      const loading = this.#root.querySelector<HTMLElement>(
        "[data-battle-loading]",
      );
      if (loading) {
        loading.hidden = true;
      }
      if (this.#isDevFight && this.#battlePaused) {
        this.activateBattle();
        this.updateBattleOverlay();
      } else {
        this.startBattleCountdown();
      }
    });
  }

  private startBattleCountdown(): void {
    window.clearTimeout(this.#battleCountdownTimer);
    this.#battleCountdownTimer = 0;
    this.#battleReady = false;
    this.setBattlePhase("countdown");
    const panel = this.#root.querySelector<HTMLElement>(
      "[data-battle-countdown]",
    );
    const label = panel?.querySelector<HTMLElement>("[data-countdown-label]");
    const note = panel?.querySelector<HTMLElement>("span");
    if (panel) {
      panel.hidden = false;
    }

    let index = 0;
    const showBeat = (): void => {
      if (!this.#battle || this.#route !== "battle") {
        return;
      }
      const beat = BATTLE_COUNTDOWN[index];
      if (!beat) {
        this.activateBattle();
        return;
      }
      if (label) {
        label.textContent = beat.label;
      }
      if (note) {
        note.textContent = beat.label === "FIGHT" ? "Fight!" : "Stand by";
      }
      panel?.classList.remove("is-beat");
      void panel?.offsetWidth;
      panel?.classList.add("is-beat");
      this.#battleScene?.presentCountdownBeat(beat.label);
      index += 1;
      this.#battleCountdownTimer = window.setTimeout(showBeat, beat.durationMs);
    };

    showBeat();
  }

  private activateBattle(): void {
    window.clearTimeout(this.#battleCountdownTimer);
    this.#battleCountdownTimer = 0;
    this.#battleReady = true;
    this.#battlePresentationLockedUntil = 0;
    this.#lastFrameAt = performance.now();
    this.#lastAiAt = this.#lastFrameAt;
    this.setBattlePhase(this.#battlePaused ? "paused" : "active");
    const countdown = this.#root.querySelector<HTMLElement>(
      "[data-battle-countdown]",
    );
    if (countdown) {
      countdown.hidden = true;
    }
    const pause = this.#root.querySelector<HTMLButtonElement>(
      '[data-command="pause-battle"]',
    );
    if (pause) {
      pause.disabled = false;
    }
    this.updateBattleView();
    this.announce("Fight.");
  }

  private setBattlePhase(
    phase: "loading" | "countdown" | "active" | "presenting" | "paused",
  ): void {
    const screen = this.#root.querySelector<HTMLElement>(".battle-stage");
    if (!screen) {
      return;
    }
    screen.dataset.battlePhase = phase;
    screen.setAttribute(
      "aria-busy",
      String(
        phase === "loading" || phase === "countdown" || phase === "presenting",
      ),
    );
  }

  private isBattlePresentationLocked(now = performance.now()): boolean {
    return this.#battlePresentationLockedUntil > now;
  }

  private lockBattlePresentation(durationMs: number): void {
    if (durationMs <= 0 || this.#battlePaused) {
      return;
    }
    this.#battlePresentationLockedUntil = Math.max(
      this.#battlePresentationLockedUntil,
      performance.now() + durationMs,
    );
    this.#battleViewDirty = true;
    this.setBattlePhase("presenting");
  }

  private startTournamentBattle(): void {
    let run = this.activeTournamentRun();
    if (!run) {
      run = createCheapSeatsRun(
        this.tournamentCaseBuilds(),
        this.#sessionMode === "story" ? "story" : "standalone",
      );
      this.setActiveTournamentRun(run);
      this.#save = saveSlot(localStorage, this.#save);
    } else if (run.caseBuilds.length === 0) {
      run = lockCheapSeatsCase(run, this.tournamentCaseBuilds());
      this.setActiveTournamentRun(run);
      this.#save = saveSlot(localStorage, this.#save);
    }
    if (run.phase !== "ready") {
      this.navigate("tournament");
      return;
    }
    this.#tournamentRoundIndex = run.roundIndex;
    this.startBattle(true);
  }

  private normaliseLoadedTournamentRun(): void {
    let changed = false;
    for (const field of ["tournamentRun", "standaloneTournamentRun"] as const) {
      const run = this.#save[field];
      if (!run || run.caseBuilds.length > 0) {
        continue;
      }
      this.#save[field] = lockCheapSeatsCase(
        run,
        this.tournamentCaseBuilds(
          field === "tournamentRun" ? "story" : "standalone",
        ),
      );
      changed = true;
    }
    if (changed) {
      this.#save = saveSlot(localStorage, this.#save);
    }
  }

  private activeTournamentRun(): TournamentRunData | null {
    return this.#sessionMode === "story"
      ? this.#save.tournamentRun
      : this.#save.standaloneTournamentRun;
  }

  private setActiveTournamentRun(run: TournamentRunData | null): void {
    if (this.#sessionMode === "story") {
      this.#save.tournamentRun = run;
    } else {
      this.#save.standaloneTournamentRun = run;
    }
  }

  private chooseCupDrop(drop: CheapSeatsDrop): void {
    const run = this.activeTournamentRun();
    if (!run) {
      return;
    }
    this.setActiveTournamentRun(applyCheapSeatsDrop(run, drop));
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("Case drop locked. The next round is ready.");
  }

  private startQuickBattle(): void {
    this.startBattle(false, true);
  }

  private startDevBattle(scenarioDefinition: DevBattleScenario): void {
    if (!DEV_TOOLS_ENABLED) {
      return;
    }
    const validated = validateDevScenario(scenarioDefinition);
    this.#sessionMode = "dev";
    this.#devScenario = structuredClone(validated);
    this.startBattle(false, false, validated);
  }

  private startBattle(
    tournament: boolean,
    quick = false,
    devScenario: DevBattleScenario | null = null,
  ): void {
    const requestedStoryNodeId =
      !tournament && !quick && !devScenario && this.#route === "battle"
        ? this.#storyBattleNodeId
        : firstRunEncounter(this.#save.currentNodeId).nodeId;
    this.stopBattle();
    this.#isTournamentFight = tournament;
    this.#isQuickFight = quick;
    this.#isDevFight = Boolean(devScenario);
    this.#battleControllers = devScenario?.controllers ?? {
      player: "human-local",
      enemy: "ai",
    };
    this.#battleReady = false;
    this.#battlePaused = devScenario?.startPaused ?? false;
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = Boolean(devScenario?.startPaused);
    this.#battleTimeScale = 1;
    this.#actionTraySignature = "";
    this.#cupCompletedThisBattle = false;
    if (!quick && !devScenario) {
      this.#storyBattleNodeId = requestedStoryNodeId;
    }
    const storyEncounter = firstRunEncounter(requestedStoryNodeId);
    const tournamentRun =
      this.activeTournamentRun() ??
      createCheapSeatsRun(
        [],
        this.#sessionMode === "story" ? "story" : "standalone",
      );
    const tournamentEncounter = cheapSeatsEncounter(this.#tournamentRoundIndex);
    const playerIds = devScenario
      ? devScenario.playerCharacterIds
      : quick
        ? this.#quickPlayerIds
        : tournament
          ? tournamentRun.caseBuilds.map((build) => build.characterId)
          : storyEncounter.playerCharacterIds;
    const enemyIds = devScenario
      ? devScenario.enemyCharacterIds
      : quick
        ? this.#quickEnemyIds
        : tournament
          ? tournamentEncounter.enemyCharacterIds
          : storyEncounter.enemyCharacterIds;
    const playerBuilds = devScenario
      ? devBuildsForSide(devScenario, "player")
      : quick
        ? this.quickFightBuilds(playerIds, "player")
        : tournament
          ? tournamentRun.caseBuilds
          : this.playerBuilds(playerIds);
    const enemyBuilds = devScenario
      ? devBuildsForSide(devScenario, "enemy")
      : quick
        ? this.quickFightBuilds(enemyIds, "enemy")
        : undefined;
    const quickSeed = [
      ...this.#quickPlayerIds,
      "versus",
      ...this.#quickEnemyIds,
    ]
      .join(".")
      .split("")
      .reduce(
        (seed, character) =>
          Math.imul(seed ^ character.charCodeAt(0), 16_777_619) >>> 0,
        2_026_100,
      );
    const created = createBattle(
      {
        playerCharacterIds: playerIds,
        playerBuilds,
        enemyCharacterIds: enemyIds,
        enemyBuilds,
        playerStartingBar: devScenario
          ? devScenario.playerStartingBar + openingChargeBonus(playerBuilds)
          : openingChargeBonus(playerBuilds) +
            (tournament ? tournamentRun.nextRoundChargeBonus : 0),
        enemyStartingBar: devScenario
          ? devScenario.enemyStartingBar + openingChargeBonus(enemyBuilds ?? [])
          : undefined,
        seed:
          devScenario?.seed ??
          (quick
            ? quickSeed
            : tournament
              ? tournamentEncounter.seed
              : storyEncounter.seed),
        difficulty: devScenario?.difficulty ?? this.#preferences.difficulty,
        timeLimitMs: devScenario?.timeLimitMs,
      },
      combatContent,
    );
    const initialState = devScenario
      ? applyDevStartingHealth(created.state, devScenario)
      : tournament
        ? restoreCaseHealth(created.state, tournamentRun)
        : created.state;
    this.#battle = initialState;
    this.#battleReport = createBattleReport(initialState, created.events, {
      mode: devScenario
        ? "dev"
        : tournament
          ? "tournament"
          : quick
            ? "quick"
            : "story",
      encounterId: devScenario
        ? devScenario.id
        : tournament
          ? `tournament.cheap-seats.round-${tournamentEncounter.roundIndex + 1}`
          : quick
            ? `quick.${this.#quickPlayerIds.join("+")}.vs.${this.#quickEnemyIds.join("+")}`
            : storyEncounter.nodeId,
    });
    this.#battleReportArchived = false;
    this.#battleReward = null;
    this.#eventLog = [];
    this.#battleHandled = false;
    this.#route = "battle";
    this.render();
  }

  private quickFightBuilds(
    characterIds: string[],
    side: "player" | "enemy",
  ): CombatantBuild[] {
    return characterIds.map((characterId, index) => {
      const definition = combatContent.characters[characterId];
      if (!definition) {
        throw new Error(`Missing character definition: ${characterId}`);
      }
      return createStandardBuild(definition, side, index);
    });
  }

  private playerBuilds(characterIds: string[]): CombatantBuild[] {
    return characterIds.map((characterId, index) => {
      const definition = combatContent.characters[characterId];
      if (!definition) {
        throw new Error(`Missing character definition: ${characterId}`);
      }
      const owned = this.#save.collection.find(
        (entry) => entry.characterId === characterId,
      );
      if (owned) {
        return buildForOwnedCharacter(owned, definition);
      }
      return {
        instanceId: `loaner.${index}.${characterId}`,
        level: definition.level,
        actionIds: definition.actionIds,
        actionTiers: Object.fromEntries(
          definition.actionIds.map((actionId) => [actionId, "stock"]),
        ),
      };
    });
  }

  private tournamentCaseBuilds(
    origin: "story" | "standalone" = this.#sessionMode === "story"
      ? "story"
      : "standalone",
  ): TournamentCaseBuild[] {
    const builds =
      origin === "story"
        ? this.playerBuilds([...cheapSeatsPlayerIds])
        : this.quickFightBuilds([...cheapSeatsPlayerIds], "player");
    return builds.map((build, index) => {
      const characterId = cheapSeatsPlayerIds[index];
      if (!characterId) {
        throw new Error(`Missing Cheap Seats Case character at ${index}`);
      }
      const definition = combatContent.characters[characterId];
      if (!definition) {
        throw new Error(`Missing character definition: ${characterId}`);
      }
      const actionIds = build.actionIds ?? definition.actionIds;
      return {
        characterId,
        instanceId: build.instanceId ?? `loaner.${index}.${characterId}`,
        level: build.level ?? definition.level,
        statBonuses: {
          health: build.statBonuses?.health ?? 0,
          power: build.statBonuses?.power ?? 0,
          evasion: build.statBonuses?.evasion ?? 0,
          fortune: build.statBonuses?.fortune ?? 0,
          tempo: build.statBonuses?.tempo ?? 0,
        },
        actionIds,
        actionTiers: Object.fromEntries(
          actionIds.map((actionId) => [
            actionId,
            build.actionTiers?.[actionId] ?? "stock",
          ]),
        ),
        interruptionResistance: build.interruptionResistance ?? 0,
        equippedPatchId: build.equippedPatchId ?? null,
      };
    });
  }

  private stopBattle(): void {
    this.archiveCurrentBattleReport();
    cancelAnimationFrame(this.#animationFrame);
    window.clearTimeout(this.#battleCountdownTimer);
    this.#animationFrame = 0;
    this.#battleCountdownTimer = 0;
    this.#battlePresentationLockedUntil = 0;
    this.#battleViewDirty = false;
    this.#phaserGame?.destroy(true);
    this.#phaserGame = null;
    this.#battleScene = null;
    this.#battle = null;
    this.#battleReward = null;
    this.#battleReport = null;
    this.#battleReportArchived = false;
    this.#battleReady = false;
    this.#battlePaused = false;
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = false;
    this.#battleOverlayOpener = null;
    this.#actionTraySignature = "";
  }

  private archiveCurrentBattleReport(): void {
    const report = this.#battleReport;
    if (!report || this.#battleReportArchived) {
      return;
    }
    this.#recentBattleReports = [
      structuredClone(report),
      ...this.#recentBattleReports,
    ].slice(0, 10);
    this.#battleReportArchived = true;
  }

  private battleLoop = (now: number): void => {
    if (!this.#battle || this.#route !== "battle") {
      return;
    }
    if (!this.#battleReady || this.#battlePaused) {
      this.#lastFrameAt = now;
      this.#animationFrame = requestAnimationFrame(this.battleLoop);
      return;
    }
    if (this.isBattlePresentationLocked(now)) {
      this.#lastFrameAt = now;
      this.#animationFrame = requestAnimationFrame(this.battleLoop);
      return;
    }
    if (this.#battlePresentationLockedUntil > 0) {
      this.#battlePresentationLockedUntil = 0;
      this.setBattlePhase("active");
      if (this.#battleViewDirty) {
        this.#battleViewDirty = false;
        this.updateBattleView();
      }
    }
    const delta = Math.min(
      250,
      (now - this.#lastFrameAt) * this.#battleTimeScale,
    );
    this.#lastFrameAt = now;
    this.applyTransition(tickBattle(this.#battle, delta, combatContent));
    if (this.isBattlePresentationLocked(now)) {
      this.#animationFrame = requestAnimationFrame(this.battleLoop);
      return;
    }

    if (
      this.#battle.outcome === "active" &&
      this.#battleControllers.enemy === "ai" &&
      now - this.#lastAiAt >= difficultyAiDelay(this.#battle.difficulty)
    ) {
      this.#lastAiAt = now;
      const command = chooseAiCommand(this.#battle, combatContent);
      if (command?.kind === "action") {
        this.applyTransition(
          requestAction(this.#battle, "enemy", command.actionId, combatContent),
        );
      } else if (command?.kind === "switch") {
        this.applyTransition(
          requestSwitch(this.#battle, "enemy", command.targetIndex),
        );
      }
    }
    if (this.isBattlePresentationLocked(now)) {
      this.#animationFrame = requestAnimationFrame(this.battleLoop);
      return;
    }

    if (now - this.#lastUiAt >= 70) {
      this.#lastUiAt = now;
      this.updateBattleView();
    }
    if (this.#battle.outcome !== "active" && !this.#battleHandled) {
      this.handleBattleEnd();
    }
    this.#animationFrame = requestAnimationFrame(this.battleLoop);
  };

  private toggleBattlePause(): void {
    if (this.#battlePaused && this.#pauseMenuOpen) {
      this.closeBattleOverlaysAndResume();
    } else {
      this.openBattlePause();
    }
  }

  private openBattlePause(): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active"
    ) {
      return;
    }
    this.captureBattleOverlayOpener();
    this.#pauseMenuOpen = true;
    this.#devInspectorOpen = false;
    this.setBattlePaused(true);
    this.updateBattleOverlay();
  }

  private openDevInspector(): void {
    if (!this.#battle || !DEV_TOOLS_ENABLED) {
      return;
    }
    this.captureBattleOverlayOpener();
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = true;
    this.setBattlePaused(true);
    this.updateBattleOverlay();
  }

  private closeBattleOverlaysAndResume(): void {
    const focusTarget = this.#battleOverlayOpener;
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = false;
    this.setBattlePaused(false);
    this.updateBattleOverlay();
    this.#battleOverlayOpener = null;
    if (focusTarget?.isConnected) {
      focusTarget.focus({ preventScroll: true });
    }
  }

  private captureBattleOverlayOpener(): void {
    if (
      this.#pauseMenuOpen ||
      this.#devInspectorOpen ||
      !(document.activeElement instanceof HTMLElement) ||
      !this.#root.contains(document.activeElement)
    ) {
      return;
    }
    this.#battleOverlayOpener = document.activeElement;
  }

  private trapBattleOverlayFocus(event: KeyboardEvent): void {
    const panel = this.#root.querySelector<HTMLElement>(
      "[data-battle-overlay]",
    );
    if (!panel || panel.hidden) {
      return;
    }
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (!panel.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private setBattlePaused(paused: boolean): void {
    if (!this.#battle || this.#battlePaused === paused) {
      return;
    }
    this.#battlePaused = paused;
    this.#lastFrameAt = performance.now();
    this.#lastAiAt = this.#lastFrameAt;
    this.#battleScene?.setSimulationPaused(paused);
    this.setBattlePhase(paused ? "paused" : "active");
    if (this.#battleReport) {
      this.#battleReport = recordBattleDebugAction(
        this.#battleReport,
        this.#battle,
        { action: paused ? "pause" : "resume" },
      );
    }
  }

  private stepDevBattle(deltaMs: number): void {
    if (
      !DEV_TOOLS_ENABLED ||
      !this.#battle ||
      !this.#battlePaused ||
      this.#battle.outcome !== "active"
    ) {
      return;
    }
    const safeDelta = Math.min(5_000, Math.max(1, Math.round(deltaMs)));
    const startingElapsedMs = this.#battle.elapsedMs;
    let remainingMs = safeDelta;
    while (
      remainingMs > 0 &&
      this.#battle &&
      this.#battle.outcome === "active"
    ) {
      const sliceMs = Math.min(250, remainingMs);
      this.applyTransition(tickBattle(this.#battle, sliceMs, combatContent));
      remainingMs -= sliceMs;
    }
    if (this.#battleReport && this.#battle) {
      this.#battleReport = recordBattleDebugAction(
        this.#battleReport,
        this.#battle,
        {
          action: "step",
          amount: this.#battle.elapsedMs - startingElapsedMs,
        },
      );
    }
    this.updateBattleView();
    if (this.#battle.outcome !== "active" && !this.#battleHandled) {
      this.handleBattleEnd();
      return;
    }
    this.updateBattleOverlay();
  }

  private addDevCharge(side: Side, amount: number): void {
    if (!DEV_TOOLS_ENABLED || !this.#battle || !this.#battlePaused) {
      return;
    }
    const state = structuredClone(this.#battle);
    state[side].bar = Math.min(
      100,
      Math.max(0, state[side].bar + Math.round(amount)),
    );
    const event: BattleEvent = {
      id: state.eventSequence,
      type: "barChanged",
      side,
      amount: state[side].bar,
      message: "development adjustment",
    };
    state.eventSequence += 1;
    if (this.#battleReport) {
      this.#battleReport = recordBattleDebugAction(
        this.#battleReport,
        this.#battle,
        { action: "addCharge", side, amount },
      );
    }
    this.applyTransition({ state, events: [event] });
    this.updateBattleView();
    this.updateBattleOverlay();
  }

  private async copyBattleState(): Promise<void> {
    if (!this.#battle) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(this.#battle, null, 2),
      );
      if (this.#battleReport) {
        this.#battleReport = recordBattleDebugAction(
          this.#battleReport,
          this.#battle,
          { action: "copyState" },
        );
      }
      this.announce("Battle state copied.");
    } catch {
      this.announce(
        "The browser blocked clipboard access. Export the report instead.",
      );
    }
  }

  private updateBattleOverlay(): void {
    const panel = this.#root.querySelector<HTMLElement>(
      "[data-battle-overlay]",
    );
    if (!panel || !this.#battle) {
      return;
    }
    const visible = this.#pauseMenuOpen || this.#devInspectorOpen;
    panel.hidden = !visible;
    for (const element of this.#root.querySelectorAll<HTMLElement>(
      ".battle-rail, .battle-drawer",
    )) {
      element.inert = visible;
    }
    if (!visible) {
      panel.innerHTML = "";
      return;
    }
    const activeCommand =
      panel.contains(document.activeElement) &&
      document.activeElement instanceof HTMLElement
        ? [
            document.activeElement.dataset.command ?? "",
            document.activeElement.dataset.ms ?? "",
            document.activeElement.dataset.side ?? "",
            document.activeElement.dataset.amount ?? "",
          ].join(":")
        : "";
    if (this.#devInspectorOpen) {
      const events =
        this.#battleReport?.events
          .filter((event) => event.type !== "barChanged")
          .slice(-10)
          .reverse() ?? [];
      panel.innerHTML = `
        <div class="dev-inspector-sheet">
          <header>
            <div>
              <span>Development inspector</span>
              <h2 id="battle-overlay-title">Battle paused.</h2>
            </div>
            <button data-command="close-dev-inspector">Back to pause</button>
          </header>
          <div class="dev-inspector-toolbar">
            <button data-command="enter-dev">Open Developer Lab</button>
            <button data-command="dev-copy-state">Copy state</button>
            <button data-command="download-battle-report">Export report</button>
            <button class="primary-action" data-command="resume-battle">Resume fight</button>
          </div>
          <div class="dev-inspector-grid">
            <section>
              <h3>Simulation</h3>
              <dl class="dev-state-summary">
                <div><dt>Scenario</dt><dd>${escapeHtml(
                  this.#battleReport?.encounterId ?? "battle",
                )}</dd></div>
                <div><dt>Seed</dt><dd>${this.#battle.seed}</dd></div>
                <div><dt>Elapsed</dt><dd>${Math.round(
                  this.#battle.elapsedMs,
                )} ms</dd></div>
                <div><dt>RNG state</dt><dd>${this.#battle.rngState}</dd></div>
                <div><dt>Player Charge</dt><dd>${Math.floor(
                  this.#battle.player.bar,
                )}</dd></div>
                <div><dt>Enemy Charge</dt><dd>${Math.floor(
                  this.#battle.enemy.bar,
                )}</dd></div>
              </dl>
              <div class="dev-inspector-actions">
                <button data-command="dev-step" data-ms="100">Step 100 ms</button>
                <button data-command="dev-step" data-ms="1000">Step 1 second</button>
                <button data-command="dev-add-charge" data-side="player" data-amount="25">Player +25 Charge</button>
                <button data-command="dev-add-charge" data-side="enemy" data-amount="25">Enemy +25 Charge</button>
              </div>
            </section>
            <section>
              <h3>Recent semantic events</h3>
              <ol class="dev-event-list">
                ${
                  events.length
                    ? events
                        .map(
                          (event) =>
                            `<li><strong>${event.id}</strong><span>${event.type}</span><small>${escapeHtml(
                              event.actionId ??
                                event.message ??
                                event.targetId ??
                                "",
                            )}</small></li>`,
                        )
                        .join("")
                    : "<li>No events recorded yet.</li>"
                }
              </ol>
            </section>
            <section class="dev-raw-state">
              <h3>Raw state</h3>
              <pre>${escapeHtml(JSON.stringify(this.#battle, null, 2))}</pre>
            </section>
          </div>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="pause-sheet">
          <span>${this.#battleReady ? "Simulation stopped" : "Preparing arena"}</span>
          <h2 id="battle-overlay-title">Paused.</h2>
          <p>
            Charge, statuses, pending Moves, AI, the timer, and arena motion are stopped.
          </p>
          <div class="pause-actions">
            <button class="primary-action" data-command="resume-battle">Resume</button>
            <button data-command="restart-battle">Restart fight</button>
            ${
              DEV_TOOLS_ENABLED
                ? `
                  <button data-command="open-dev-inspector">Inspect battle</button>
                  <button data-command="enter-dev">Open Developer Lab</button>
                `
                : ""
            }
            <button class="secondary-action" data-command="leave-battle">Leave game</button>
          </div>
          <small>Escape resumes · 1, 2, 3 activate ready Moves</small>
        </div>
      `;
    }
    const focusTarget =
      Array.from(
        panel.querySelectorAll<HTMLElement>("button[data-command]"),
      ).find(
        (button) =>
          [
            button.dataset.command ?? "",
            button.dataset.ms ?? "",
            button.dataset.side ?? "",
            button.dataset.amount ?? "",
          ].join(":") === activeCommand,
      ) ?? panel.querySelector<HTMLElement>("button");
    focusTarget?.focus();
  }

  private applyTransition(transition: Transition): void {
    if (this.#battleReport) {
      this.#battleReport = appendBattleTransition(
        this.#battleReport,
        transition,
      );
    }
    this.#battle = transition.state;
    this.#battleScene?.setSnapshot(transition.state);
    this.updateChargeRails();
    const presentationMs = battlePresentationDuration(transition.events);
    if (!this.#battlePaused) {
      this.#battleScene?.present(transition.events, presentationMs);
      this.lockBattlePresentation(presentationMs);
      if (presentationMs > 0) {
        this.updateActions();
      }
    }
    for (const event of transition.events) {
      if (event.type === "actionStarted" && event.actionId) {
        const audioId = combatContent.actions[event.actionId]?.audioId;
        const action = combatContent.actions[event.actionId];
        const source = this.characterNameFromInstance(event.sourceId);
        if (audioId) {
          this.#audio.playSfx(audioId);
        }
        if (action) {
          this.announce(`${source} uses ${action.name}.`);
        }
      }
    }
    this.logEvents(transition.events);
  }

  private playerAction(side: Side, actionId: string): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.#battlePaused ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active"
    ) {
      return;
    }
    if (this.#battleControllers[side] !== "human-local") {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        side,
        { kind: "action", actionId },
      );
    }
    this.applyTransition(
      requestAction(this.#battle, side, actionId, combatContent),
    );
    if (!this.isBattlePresentationLocked()) {
      this.updateBattleView();
    }
  }

  private playerSwitch(side: Side, index: number): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.#battlePaused ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active"
    ) {
      return;
    }
    if (this.#battleControllers[side] !== "human-local") {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        side,
        { kind: "switch", targetIndex: index },
      );
    }
    this.applyTransition(requestSwitch(this.#battle, side, index));
    if (!this.isBattlePresentationLocked()) {
      this.updateBattleView();
    }
  }

  private logEvents(events: BattleEvent[]): void {
    for (const event of events) {
      let message = "";
      if (event.type === "commandRejected") {
        message = event.message ?? "That command is unavailable.";
      }
      if (event.type === "damageApplied") {
        const target = this.characterNameFromInstance(event.targetId);
        message = `${target} took ${event.amount ?? 0}.`;
      }
      if (event.type === "characterDodged") {
        message = `${this.characterNameFromInstance(event.targetId)} dodged clean.`;
      }
      if (event.type === "criticalHit") {
        message = "Critical print. The ink landed heavy.";
      }
      if (event.type === "actionInterrupted") {
        message = `${this.characterNameFromInstance(event.sourceId)} was interrupted.`;
      }
      if (event.type === "interruptionResisted") {
        message = `${this.characterNameFromInstance(event.sourceId)} refused to flinch.`;
      }
      if (event.type === "statusApplied" && event.message === "stun") {
        message = `${this.characterNameFromInstance(event.targetId)} is stunned.`;
      }
      if (message) {
        this.#eventLog.unshift(message);
      }
    }
    this.#eventLog = this.#eventLog.slice(0, 1);
  }

  private characterNameFromInstance(instanceId?: string): string {
    if (!instanceId || !this.#battle) {
      return "Relic";
    }
    const combatant = [
      ...this.#battle.player.squad,
      ...this.#battle.enemy.squad,
    ].find((candidate) => candidate.instanceId === instanceId);
    return combatant
      ? (combatContent.characters[combatant.characterId]?.name ?? "Relic")
      : "Relic";
  }

  private updateBattleView(): void {
    if (!this.#battle) {
      return;
    }
    const time = this.#root.querySelector<HTMLElement>("[data-battle-time]");
    if (time) {
      time.textContent = formatTime(
        this.#battle.timeLimitMs - this.#battle.elapsedMs,
      );
    }
    this.updateTeamReadout("player");
    this.updateTeamReadout("enemy");
    this.updateChargeRails();
    this.updateBench("player");
    this.updateBench("enemy");
    this.updateActions();
    this.updateMatchup();
    const log = this.#root.querySelector<HTMLElement>("[data-combat-log]");
    if (log) {
      this.setStableMarkup(
        log,
        this.#eventLog
          .map((entry) => `<span>${escapeHtml(entry)}</span>`)
          .join(""),
      );
    }
    this.updateNowPlaying();
  }

  private updateTeamReadout(side: "player" | "enemy"): void {
    if (!this.#battle) {
      return;
    }
    const team = this.#battle[side];
    const combatant = team.squad[team.activeIndex]!;
    const character = combatContent.characters[combatant.characterId]!;
    const target = this.#root.querySelector<HTMLElement>(
      `[data-${side}-readout]`,
    );
    if (!target) {
      return;
    }
    const healthPercent = (combatant.currentHealth / combatant.maxHealth) * 100;
    const pending = this.#battle.pendingActions[side];
    const pendingAction = pending
      ? combatContent.actions[pending.actionId]
      : undefined;
    const statusLabels = combatant.statuses
      .map((status) => `<span>${formatClass(status.kind)}</span>`)
      .join("");
    const markup = `
      <div class="readout-heading">
        <div>
          <span>${side === "player" ? "Active print" : "Target print"}</span>
          <strong>${character.name}</strong>
        </div>
        <span class="class-mark">${formatClass(character.classId)}</span>
      </div>
      <div class="meter-label">
        <span>Health</span>
        <strong>${combatant.currentHealth}/${combatant.maxHealth}</strong>
      </div>
      <div
        class="meter health-meter"
        role="meter"
        aria-label="${character.name} health"
        aria-valuemin="0"
        aria-valuemax="${combatant.maxHealth}"
        aria-valuenow="${combatant.currentHealth}"
      ><span style="--meter-scale:${healthPercent / 100}"></span></div>
      <div class="pending-move ${pendingAction ? "is-active" : ""}">
        <span>${pendingAction ? "Pending Move" : "Move state"}</span>
        <strong>${
          pendingAction
            ? `${escapeHtml(pendingAction.name)} · ${Math.max(
                0,
                pending?.remainingMs ?? 0,
              ).toFixed(0)} ms`
            : "Ready for command"
        }</strong>
      </div>
      <div class="status-row ${statusLabels ? "is-active" : ""}">${statusLabels}</div>
    `;
    this.setStableMarkup(target, markup);
  }

  private updateChargeRails(): void {
    if (!this.#battle) {
      return;
    }

    for (const side of ["player", "enemy"] as const) {
      const exactValue = this.#battle[side].bar;
      const displayValue = Math.floor(exactValue);
      const label = this.#root.querySelector<HTMLElement>(
        `[data-${side}-charge-value]`,
      );
      const meter = this.#root.querySelector<HTMLElement>(
        `[data-${side}-charge-meter]`,
      );
      const fill = this.#root.querySelector<HTMLElement>(
        `[data-${side}-charge-fill]`,
      );
      const nextLabel = `${displayValue} / 100`;
      if (label && label.textContent !== nextLabel) {
        label.textContent = nextLabel;
      }
      if (
        meter &&
        meter.getAttribute("aria-valuenow") !== String(displayValue)
      ) {
        meter.setAttribute("aria-valuenow", String(displayValue));
      }
      if (fill) {
        fill.style.transform = `scaleX(${Math.max(
          0,
          Math.min(1, exactValue / 100),
        )})`;
      }
    }
  }

  private updateBench(side: "player" | "enemy"): void {
    if (!this.#battle) {
      return;
    }
    const team = this.#battle[side];
    const target = this.#root.querySelector<HTMLElement>(
      `[data-${side}-bench]`,
    );
    if (!target) {
      return;
    }
    const markup = team.squad
      .map((combatant, index) => {
        const character = combatContent.characters[combatant.characterId]!;
        const active = index === team.activeIndex;
        const alive = isAlive(combatant);
        const art = resolveImagePath(character.portraitAssetId);
        const body = `
          <span class="bench-art is-${character.classId}">
            <img src="${art}" data-asset-id="${character.portraitAssetId}" alt="" />
          </span>
          <span class="bench-copy">
            <strong>${character.name}</strong>
            <small>${formatClass(character.classId)} · ${combatant.currentHealth} HP</small>
          </span>
          <span class="bench-state">${active ? "ACTIVE" : alive ? "READY" : "OUT"}</span>
        `;
        if (side === "player") {
          return `
            <button
              class="bench-ticket ${active ? "is-active" : ""}"
              data-command="battle-switch"
              data-side="${side}"
              data-index="${index}"
              ${active || !alive || this.#battle?.outcome !== "active" ? "disabled" : ""}
              aria-label="Switch to ${character.name}, ${combatant.currentHealth} health"
            >${body}</button>
          `;
        }
        return `<div class="bench-ticket ${active ? "is-active" : ""}">${body}</div>`;
      })
      .join("");
    this.setStableMarkup(target, markup);
  }

  private updateActions(): void {
    if (!this.#battle) {
      return;
    }
    const tray = this.#root.querySelector<HTMLElement>("[data-action-tray]");
    if (!tray) {
      return;
    }
    const active = this.#battle.player.squad[this.#battle.player.activeIndex]!;
    const pending = this.#battle.pendingActions.player;
    const signature = `${active.instanceId}:${active.actionIds.join(":")}:${active.actionIds
      .map((actionId) => active.actionTiers[actionId] ?? "stock")
      .join(":")}`;
    if (signature !== this.#actionTraySignature) {
      tray.innerHTML = active.actionIds
        .map((actionId, index) => {
          const action = combatContent.actions[actionId]!;
          const rule = POSITION_RULES[action.position];
          const tier = active.actionTiers[action.id] ?? "stock";
          const tierClass =
            tier === "platinum"
              ? "tier-2"
              : tier === "gold"
                ? "tier-1"
                : "tier-normal";
          const tierLabel =
            tier === "platinum"
              ? "Tier 2"
              : tier === "gold"
                ? "Tier 1"
                : "Normal";
          return `
            <button
              class="charge-move ${tierClass} is-unavailable"
              style="--action-threshold:${rule.cost}%"
              data-command="battle-action"
              data-side="player"
              data-action-id="${action.id}"
              data-action-index="${index}"
              aria-disabled="true"
            >
              <span class="charge-move-seal">
                <span class="charge-move-key">${index + 1}</span>
                <strong>${rule.cost}</strong>
                <small>Charge</small>
              </span>
              <span class="charge-move-name">${escapeHtml(action.name)}</span>
              <span class="charge-move-state" data-action-state>Waiting</span>
              <span class="charge-move-tier">${tierLabel}</span>
              <span class="charge-move-output" data-action-output>—</span>
              <span class="action-tooltip" role="tooltip">
                <strong>${escapeHtml(action.name)}</strong>
                <span>${escapeHtml(action.description)}</span>
                <small>
                  Cost ${rule.cost} ·
                  <span data-action-estimate>—</span> ·
                  ${
                    action.chargeMs > 0
                      ? `${(action.chargeMs / 1000).toFixed(1)}s charge`
                      : "instant"
                  }
                </small>
              </span>
            </button>
          `;
        })
        .join("");
      this.#actionTraySignature = signature;
    }
    for (const [index, actionId] of active.actionIds.entries()) {
      const action = combatContent.actions[actionId]!;
      const rule = POSITION_RULES[action.position];
      const button = tray.querySelector<HTMLButtonElement>(
        `[data-action-index="${index}"]`,
      );
      if (!button) {
        continue;
      }
      const stunned = active.statuses.some(
        (status) => status.kind === "stun" && status.remainingMs > 0,
      );
      const presentationLocked = this.isBattlePresentationLocked();
      const available =
        this.#battleReady &&
        !presentationLocked &&
        this.#battle.player.bar >= rule.cost &&
        !pending &&
        !stunned &&
        this.#battle.outcome === "active";
      const charging = pending?.actionId === action.id;
      const estimate = predictedDamage(
        this.#battle,
        "player",
        action.id,
        combatContent,
      );
      const remainingCharge = Math.max(
        0,
        Math.ceil(rule.cost - this.#battle.player.bar),
      );
      const stateLabel = charging
        ? `Charging ${Math.max(0, pending.remainingMs / 1000).toFixed(1)}s`
        : !this.#battleReady
          ? "Stand by"
          : presentationLocked
            ? "Resolving"
            : stunned
              ? "Stunned"
              : available
                ? `READY · PRESS ${index + 1}`
                : this.#battle.outcome === "active"
                  ? `${remainingCharge} to go`
                  : "Fight ended";
      button.classList.toggle("is-available", available);
      button.classList.toggle("is-unavailable", !available);
      button.classList.toggle("is-charging", charging);
      button.setAttribute("aria-disabled", String(!available));
      button.setAttribute(
        "aria-label",
        `${action.name}. ${stateLabel}. Costs ${rule.cost} Charge. ${
          estimate > 0 ? `Predicted hit ${estimate}.` : "Applies an effect."
        }`,
      );
      const state = button.querySelector<HTMLElement>("[data-action-state]");
      const estimateLabel = button.querySelector<HTMLElement>(
        "[data-action-estimate]",
      );
      const outputLabel = button.querySelector<HTMLElement>(
        "[data-action-output]",
      );
      if (state) {
        state.textContent = stateLabel;
      }
      if (estimateLabel) {
        estimateLabel.textContent =
          estimate > 0 ? `predicted hit ${estimate}` : "effect";
      }
      if (outputLabel) {
        const extraEffects = Array.from(
          new Set(
            action.effects
              .map((effect) => effect.kind)
              .filter((kind) => kind !== "damage"),
          ),
        ).map((kind) => formatClass(kind.replace(/([a-z])([A-Z])/g, "$1 $2")));
        outputLabel.textContent = [
          estimate > 0 ? `Hit ${estimate}` : null,
          ...extraEffects,
        ]
          .filter(Boolean)
          .join(" + ");
      }
    }
  }

  private updateMatchup(): void {
    if (!this.#battle) {
      return;
    }
    const player = this.#battle.player.squad[this.#battle.player.activeIndex]!;
    const enemy = this.#battle.enemy.squad[this.#battle.enemy.activeIndex]!;
    const playerClass = combatContent.characters[player.characterId]!.classId;
    const enemyClass = combatContent.characters[enemy.characterId]!.classId;
    const matchup = classMultiplier(playerClass, enemyClass);
    const advantage =
      matchup > 1
        ? "Your advantage"
        : matchup < 1
          ? "Enemy advantage"
          : "Neutral";
    const target = this.#root.querySelector<HTMLElement>("[data-matchup]");
    if (!target) {
      return;
    }
    target.innerHTML = `
      <span>Class matchup</span>
      <strong>${formatClass(playerClass)} <span aria-hidden="true">↔</span> ${formatClass(
        enemyClass,
      )} · ${advantage}</strong>
    `;
  }

  private setStableMarkup(target: HTMLElement, markup: string): void {
    if (this.#stableMarkup.get(target) === markup) {
      return;
    }
    target.innerHTML = markup;
    this.#stableMarkup.set(target, markup);
  }

  private updateNowPlaying(): void {
    const label = this.#root.querySelector<HTMLElement>("[data-now-playing]");
    if (label) {
      label.textContent = findMusic(
        this.#audio.currentTrackId || "music.red-thread",
      ).title;
    }
    for (const button of this.#root.querySelectorAll<HTMLButtonElement>(
      '[data-command="toggle-music"]',
    )) {
      button.setAttribute(
        "aria-pressed",
        String(this.#preferences.musicPlaybackEnabled),
      );
      button.setAttribute(
        "aria-label",
        this.#preferences.musicPlaybackEnabled
          ? "Turn music off"
          : "Turn music on",
      );
    }
  }

  private handleBattleEnd(): void {
    if (!this.#battle || this.#battleHandled) {
      return;
    }
    this.#battleHandled = true;
    const won = this.#battle.outcome === "playerWon";
    const sandboxFight = this.#isQuickFight || this.#isDevFight;
    const storyEncounter = firstRunEncounter(this.#storyBattleNodeId);
    const firstClear =
      !this.#isTournamentFight &&
      !sandboxFight &&
      !this.#save.clearedNodeIds.includes(storyEncounter.nodeId);
    const reportEnemy = this.#battleReport?.participants.filter(
      (participant) => participant.side === "enemy",
    );
    const opponentLevel = Math.max(
      1,
      ...(reportEnemy?.map((participant) => participant.level) ?? [6]),
    );
    const reward = sandboxFight
      ? { stamps: 0, xp: 0, firstClearBonus: 0 }
      : calculateBattleReward({
          won,
          firstClear,
          opponentLevel,
          difficulty: this.#battle.difficulty,
        });
    this.#save.stamps += reward.stamps;
    const participantInstanceIds = new Set(
      this.#battleReport?.participants
        .filter((participant) => participant.side === "player")
        .map((participant) => participant.instanceId) ??
        this.#battle.player.squad.map((combatant) => combatant.instanceId),
    );
    const xpRecipients = sandboxFight
      ? []
      : this.#save.collection.filter((entry) =>
          participantInstanceIds.has(entry.instanceId),
        );
    const baseXpShare =
      xpRecipients.length > 0 ? Math.floor(reward.xp / xpRecipients.length) : 0;
    let xpRemainder =
      xpRecipients.length > 0 ? reward.xp % xpRecipients.length : 0;
    for (const recipient of xpRecipients) {
      const awardedXp = baseXpShare + (xpRemainder > 0 ? 1 : 0);
      xpRemainder = Math.max(0, xpRemainder - 1);
      const progress = addXp(
        {
          level: recipient.level,
          xp: recipient.xp,
          unspentStatPoints: recipient.unspentStatPoints,
        },
        awardedXp,
      );
      recipient.level = progress.level;
      recipient.xp = progress.xp;
      recipient.unspentStatPoints = progress.unspentStatPoints;
    }
    this.#battleReward = {
      won,
      ...reward,
      xpRecipients: xpRecipients.length,
      cupCompletionBonus: 0,
    };
    const opponentIds =
      reportEnemy?.map((participant) => participant.characterId) ??
      this.#battle.enemy.squad.map((combatant) => combatant.characterId);
    const vengeanceTargetId =
      opponentIds.find((opponentId) =>
        this.#save.lossesTo.includes(opponentId),
      ) ??
      opponentIds.find(
        (opponentId) => opponentId === "character.knuckle-tax",
      ) ??
      opponentIds[0] ??
      "character.knuckle-tax";
    const previouslyLost = this.#save.lossesTo.includes(vengeanceTargetId);
    if (!sandboxFight) {
      this.#save.missionProgress["mission.invoice-denied"] =
        evaluateMissionProgress(
          "mission.invoice-denied",
          this.#save.missionProgress["mission.invoice-denied"] ?? 0,
          { type: "battleEnded", won, opponentCharacterIds: opponentIds },
        );
      this.#save.missionProgress["mission.print-it-personal"] =
        evaluateMissionProgress(
          "mission.print-it-personal",
          this.#save.missionProgress["mission.print-it-personal"] ?? 0,
          {
            type: "vengeanceResolved",
            opponentCharacterId: vengeanceTargetId,
            previouslyLost,
            won,
          },
        );
    }
    if (won && !this.#isTournamentFight && !sandboxFight) {
      if (!this.#save.clearedNodeIds.includes(storyEncounter.nodeId)) {
        this.#save.clearedNodeIds.push(storyEncounter.nodeId);
      }
      this.#save.currentNodeId = storyEncounter.nextNodeId;
    } else if (this.#isTournamentFight) {
      const run =
        this.activeTournamentRun() ??
        createCheapSeatsRun(
          [],
          this.#sessionMode === "story" ? "story" : "standalone",
        );
      const result = recordCheapSeatsResult(run, this.#battle, won);
      if (result.status === "lost") {
        this.setActiveTournamentRun(null);
      } else if (result.status === "complete") {
        this.setActiveTournamentRun(null);
        if (
          !this.#save.tournamentBadges.includes("badge.cheap-seats-champion")
        ) {
          this.#save.tournamentBadges.push("badge.cheap-seats-champion");
        }
        if (run.origin === "story") {
          if (!this.#save.clearedNodeIds.includes("story.first-run.06")) {
            this.#save.clearedNodeIds.push("story.first-run.06");
          }
          this.#save.currentNodeId = "story.first-run.07";
        }
        this.#save.stamps += CUP_COMPLETION_BONUS;
        this.#battleReward.cupCompletionBonus = CUP_COMPLETION_BONUS;
        this.#cupCompletedThisBattle = true;
      } else {
        this.setActiveTournamentRun(result.run);
      }
    } else if (
      !won &&
      !this.#isTournamentFight &&
      !sandboxFight &&
      !this.#save.lossesTo.includes(vengeanceTargetId)
    ) {
      this.#save.lossesTo.push(vengeanceTargetId);
    }
    if (!sandboxFight) {
      this.#save = saveSlot(localStorage, this.#save);
    }
    this.archiveCurrentBattleReport();
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = false;
    this.#battleOverlayOpener = null;
    this.updateBattleOverlay();
    this.showBattleResult();
  }

  private showBattleResult(): void {
    if (!this.#battleReward) {
      return;
    }
    const storyEncounter = firstRunEncounter(this.#storyBattleNodeId);
    const cupEncounter = cheapSeatsEncounter(this.#tournamentRoundIndex);
    const panel = this.#root.querySelector<HTMLElement>("[data-battle-result]");
    if (!panel) {
      return;
    }
    for (const element of this.#root.querySelectorAll<HTMLElement>(
      ".battle-rail, .battle-drawer",
    )) {
      element.inert = true;
    }
    panel.hidden = false;
    panel.innerHTML = `
      <div class="result-stamp ${this.#battleReward.won ? "is-win" : "is-loss"}">
        <span>${this.#battleReward.won ? "PRINT CLEARED" : "PRINT JAMMED"}</span>
        <h2 id="battle-result-title">${
          this.#battleReward.won
            ? this.#isTournamentFight
              ? this.#cupCompletedThisBattle
                ? "The Cheap Seats are yours."
                : `Round ${cupEncounter.roundIndex + 1} takes the stamp.`
              : this.#isDevFight
                ? `${this.#devScenario?.name ?? "Development scenario"}: player side wins.`
                : this.#isQuickFight
                  ? `${combatContent.characters[this.#quickPlayerIds[0]!]!.name}'s Lineup wins the sandbox.`
                  : storyEncounter.victoryTitle
            : this.#isDevFight
              ? `${this.#devScenario?.name ?? "Development scenario"}: enemy side wins.`
              : this.#isQuickFight
                ? `${combatContent.characters[this.#quickEnemyIds[0]!]!.name}'s Lineup takes the print.`
                : "Partial credit. Full grudge."
        }</h2>
        <p>
          ${
            this.#battleReward.won
              ? this.#isTournamentFight
                ? this.#cupCompletedThisBattle
                  ? "The Case survived all three rounds. Your champion badge and final purse are recorded."
                  : "Case health is saved. Return to the Cup and choose one drop before the next round."
                : this.#isDevFight
                  ? "The scenario ended in the isolated development sandbox. The report is retained for inspection and progression was not changed."
                  : this.#isQuickFight
                    ? "Quick Fight ends here. Story progress, Stamps, XP, Missions, and unlocks were not changed."
                    : storyEncounter.victoryCopy
              : this.#isTournamentFight
                ? "The loss closes this Case. Partial XP is paid; retry opens a fresh run from Round 1."
                : this.#isDevFight
                  ? "The scenario ended in the isolated development sandbox. Inspect or export the report, then rerun the same seed."
                  : this.#isQuickFight
                    ? "Quick Fight ends here. Change the matchup or run the same deterministic rematch."
                    : "Losses still pay partial XP. Level, adjust, and make it personal."
          }
        </p>
        ${
          this.#isQuickFight || this.#isDevFight
            ? `
              <dl>
                <div><dt>Game type</dt><dd>${
                  this.#isDevFight ? "Development" : "Quick Fight"
                }</dd></div>
                <div><dt>Progression</dt><dd>Unchanged</dd></div>
                <div><dt>Result</dt><dd>${this.#battleReward.won ? "Win" : "Loss"}</dd></div>
              </dl>
            `
            : `
              <dl>
                <div><dt>Battle Stamps</dt><dd>+${
                  this.#battleReward.stamps - this.#battleReward.firstClearBonus
                }</dd></div>
                <div><dt>Lineup XP · ${this.#battleReward.xpRecipients} Relic${
                  this.#battleReward.xpRecipients === 1 ? "" : "s"
                }</dt><dd>+${this.#battleReward.xp}</dd></div>
                <div><dt>First clear</dt><dd>+${this.#battleReward.firstClearBonus}</dd></div>
                ${
                  this.#battleReward.cupCompletionBonus > 0
                    ? `<div><dt>Cup purse</dt><dd>+${this.#battleReward.cupCompletionBonus}</dd></div>`
                    : ""
                }
              </dl>
            `
        }
        <p class="battle-report-note">
          Report ${this.#battleReport?.encounterId ?? "battle"} · seed ${
            this.#battleReport?.seed ?? this.#battle?.seed ?? 0
          } · ${this.#battleReport?.decisions.length ?? 0} player decisions recorded
        </p>
        <div class="result-actions">
          ${
            this.#isTournamentFight && this.#battleReward.won
              ? ""
              : `<button class="primary-action" data-command="retry-battle">${
                  this.#isTournamentFight
                    ? "Restart Cup from Round 1"
                    : this.#isDevFight
                      ? "Run scenario again"
                      : this.#isQuickFight
                        ? "Rematch"
                        : "Print it again"
                }</button>`
          }
          <button class="secondary-action" data-command="download-battle-report">Export report</button>
          <button class="${
            this.#isTournamentFight && this.#battleReward.won
              ? "primary-action"
              : "secondary-action"
          }" data-command="leave-battle">${
            this.#isTournamentFight
              ? this.#cupCompletedThisBattle
                ? this.#sessionMode === "story"
                  ? "See the ending print"
                  : "Return to Tournament"
                : this.#battleReward.won
                  ? "Choose a Case drop"
                  : "Leave the Cup"
              : this.#isDevFight
                ? "Return to Developer Lab"
                : this.#isQuickFight
                  ? "Change matchup"
                  : "Return to story"
          }</button>
        </div>
      </div>
    `;
    panel.querySelector<HTMLElement>("button")?.focus();
  }

  private announce(message: string): void {
    const announcer = this.#root.querySelector<HTMLElement>("#announcer");
    if (announcer) {
      announcer.textContent = message;
    }
  }
}
