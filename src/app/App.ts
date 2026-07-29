import type Phaser from "phaser";
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
import { calculateBattleReward } from "../economy/rewards";
import type { BattleScene } from "../game/BattleScene";
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
  cheapSeatsEncounters,
  cheapSeatsPlayerIds,
  createCheapSeatsRun,
  lockCheapSeatsCase,
  recordCheapSeatsResult,
  restoreCaseHealth,
  type CheapSeatsDrop,
} from "../tournament/cheap-seats";
import {
  applyDevStartingHealth,
  defaultDevScenario,
  devBattleScenarios,
  devBuildsForSide,
  findDevScenario,
  validateDevScenario,
  type BattleControllerKind,
  type DevBattleScenario,
  type DevMoveTier,
} from "../dev/scenarios";

type Route =
  | "menu"
  | "story"
  | "lineup"
  | "battle"
  | "collection"
  | "store"
  | "missions"
  | "quick"
  | "tournament"
  | "profile"
  | "settings"
  | "dev";

type SessionMode = "menu" | "story" | "quick" | "tournament" | "dev";

interface BattleRewardView {
  won: boolean;
  stamps: number;
  xp: number;
  xpRecipients: number;
  firstClearBonus: number;
  cupCompletionBonus: number;
}

const ICONS = {
  story:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm3 0v13a3 3 0 0 0-3-3m6-6h5m-5 4h5"/></svg>',
  collection:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4v10l-8 4-8-4V7l8-4Zm0 0v18M4 7l8 4 8-4"/></svg>',
  store:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1-5H5L4 9Zm1 0v11h14V9M9 20v-6h6v6"/></svg>',
  missions:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6V3Zm3 5 2 2 4-4m-6 9h6"/></svg>',
  tournament:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v4m-4 3h8"/></svg>',
  quick:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 11h6l-1 9 9-12h-6V2Z"/></svg>',
  profile:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0H5Z"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/></svg>',
  music:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l10-2v13M9 9l10-2M6 16c2 0 3 1 3 2s-1 2-3 2-3-1-3-2 1-2 3-2Zm10-2c2 0 3 1 3 2s-1 2-3 2-3-1-3-2 1-2 3-2Z"/></svg>',
} as const;

const CUP_COMPLETION_BONUS = 240;
const DEV_TOOLS_ENABLED = import.meta.env.DEV;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatClass(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTime(remainingMs: number): string {
  return Math.max(0, Math.ceil(remainingMs / 1000))
    .toString()
    .padStart(2, "0");
}

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
  #quickPlayerId = "character.mara-vex";
  #quickEnemyId = "character.knuckle-tax";
  #devScenario: DevBattleScenario | null = null;
  #devDraft: DevBattleScenario = structuredClone(defaultDevScenario);
  #battleControllers: Record<Side, BattleControllerKind> = {
    player: "human-local",
    enemy: "ai",
  };
  #battleReady = false;
  #battlePaused = false;
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
  }

  destroy(): void {
    cancelAnimationFrame(this.#animationFrame);
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
    if (event.key === "Escape" && this.#battle.outcome === "active") {
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
      this.#battlePaused ||
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
    if (target.name === "quickPlayer") {
      this.#quickPlayerId = target.value;
      this.render();
    }
    if (target.name === "quickEnemy") {
      this.#quickEnemyId = target.value;
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
    if (route === "dev") {
      return !DEV_TOOLS_ENABLED;
    }
    if (
      (route === "story" ||
        route === "lineup" ||
        route === "collection" ||
        route === "store" ||
        route === "missions") &&
      this.#sessionMode !== "story"
    ) {
      return true;
    }
    if (route === "quick" && this.#sessionMode !== "quick") {
      return true;
    }
    if (route === "tournament" && this.#sessionMode === "tournament") {
      return false;
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
    if (this.#route === "battle") {
      this.renderBattle();
      return;
    }
    this.#root.innerHTML = `
      <div class="app-shell">
        ${this.shellHeader()}
        ${this.storageWarningBanner()}
        <main class="screen" id="main-content">
          ${this.screenContent()}
        </main>
        ${this.mobileNavigation()}
        <div class="sr-only" aria-live="polite" id="announcer"></div>
      </div>
    `;
  }

  private storageWarningBanner(): string {
    if (!this.#storageWarning) {
      return "";
    }
    return `
      <aside class="storage-warning" role="status">
        <span>${escapeHtml(this.#storageWarning)}</span>
        <div>
          <button data-command="download-storage-backup">Download backup</button>
          <button data-command="dismiss-storage-warning">Use safe defaults</button>
        </div>
      </aside>
    `;
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

  private shellHeader(): string {
    const storyNavigation =
      this.#sessionMode === "story" &&
      this.#route !== "menu" &&
      this.#route !== "profile" &&
      this.#route !== "settings";
    const showPlayTools =
      this.#sessionMode !== "menu" &&
      this.#route !== "profile" &&
      this.#route !== "settings";
    return `
      <header class="top-rail">
        <button class="wordmark" data-command="main-menu" aria-label="Riot Relics Main Menu">
          <span>RIOT</span><span>RELICS</span>
        </button>
        <nav class="primary-nav ${
          storyNavigation ? "is-story-nav" : "is-global-nav"
        }" aria-label="${storyNavigation ? "Story Mode" : "Global"}">
          ${
            storyNavigation
              ? `
                ${this.navButton("story", "Story", ICONS.story)}
                ${this.navButton("lineup", "Lineup", ICONS.quick)}
                ${this.navButton("collection", "Collection", ICONS.collection)}
                ${this.navButton("store", "Store", ICONS.store)}
                ${this.navButton("missions", "Missions", ICONS.missions)}
              `
              : `
                ${this.navButton("menu", "Main Menu", ICONS.story)}
                ${this.navButton("profile", "Profile", ICONS.profile)}
                ${this.navButton("settings", "Settings", ICONS.settings)}
              `
          }
        </nav>
        <div class="rail-tools">
          ${
            storyNavigation
              ? `
                <span class="stamp-counter" aria-label="${this.#save.stamps} Stamps">
                  <span aria-hidden="true">★</span>${this.#save.stamps}
                </span>
              `
              : `<span class="collector-chip">${escapeHtml(this.#save.playerName)}</span>`
          }
          ${
            showPlayTools
              ? `
                <label class="difficulty-control">
                  <span>Difficulty</span>
                  <select name="difficulty">
                    ${this.difficultyOptions(true)}
                  </select>
                </label>
              `
              : ""
          }
          ${
            DEV_TOOLS_ENABLED
              ? `<button class="dev-rail-button ${
                  this.#route === "dev" ? "is-active" : ""
                }" data-command="enter-dev">DEV LAB</button>`
              : ""
          }
          <button
            class="icon-button"
            data-command="toggle-music"
            aria-label="${
              this.#preferences.musicPlaybackEnabled
                ? "Turn music off"
                : "Turn music on"
            }"
            aria-pressed="${this.#preferences.musicPlaybackEnabled}"
          >
            ${ICONS.music}
          </button>
          ${
            showPlayTools
              ? '<button class="exit-mode-button" data-command="main-menu">Exit game</button>'
              : ""
          }
        </div>
      </header>
    `;
  }

  private navButton(route: Route, label: string, icon: string): string {
    const locked = this.routeLocked(route);
    return `
      <button
        class="nav-control ${this.#route === route ? "is-active" : ""}"
        data-route="${route}"
        ${this.#route === route ? 'aria-current="page"' : ""}
        ${locked ? 'disabled aria-label="' + label + ' locked"' : ""}
      >
        ${icon}<span>${label}</span>
      </button>
    `;
  }

  private mobileNavigation(): string {
    if (this.#route === "battle") {
      return "";
    }
    const storyNavigation =
      this.#sessionMode === "story" &&
      this.#route !== "profile" &&
      this.#route !== "settings";
    return `
      <nav class="mobile-nav" aria-label="Game">
        ${
          storyNavigation
            ? `
              ${this.navButton("story", "Story", ICONS.story)}
              ${this.navButton("lineup", "Lineup", ICONS.quick)}
              ${this.navButton("collection", "Relics", ICONS.collection)}
              ${this.navButton("store", "Store", ICONS.store)}
              ${this.navButton("missions", "Missions", ICONS.missions)}
              <button class="nav-control" data-command="main-menu">
                ${ICONS.settings}<span>Menu</span>
              </button>
            `
            : `
              ${this.navButton("menu", "Menu", ICONS.story)}
              ${this.navButton("profile", "Profile", ICONS.profile)}
              ${this.navButton("settings", "Settings", ICONS.settings)}
            `
        }
      </nav>
    `;
  }

  private difficultyOptions(compact = false): string {
    const descriptions: Record<Difficulty, string> = {
      easy: "Easy — mostly here for the posters",
      normal: "Normal — attentive is enough",
      hard: "Hard — look at you, trying",
      brutal: "Brutal — fun apparently requires paperwork",
    };
    const selectedDifficulty =
      this.#route === "battle" && this.#battle
        ? this.#battle.difficulty
        : this.#preferences.difficulty;
    return (["easy", "normal", "hard", "brutal"] as const)
      .map(
        (difficulty) =>
          `<option value="${difficulty}" ${
            selectedDifficulty === difficulty ? "selected" : ""
          }>${compact ? formatClass(difficulty) : descriptions[difficulty]}</option>`,
      )
      .join("");
  }

  private screenContent(): string {
    switch (this.#route) {
      case "menu":
        return this.mainMenuScreen();
      case "story":
        return this.storyScreen();
      case "lineup":
        return this.lineupScreen();
      case "collection":
        return this.collectionScreen();
      case "store":
        return this.storeScreen();
      case "missions":
        return this.missionsScreen();
      case "quick":
        return this.quickFightScreen();
      case "tournament":
        return this.tournamentScreen();
      case "profile":
        return this.profileScreen();
      case "settings":
        return this.settingsScreen();
      case "dev":
        return DEV_TOOLS_ENABLED ? this.devLabScreen() : this.mainMenuScreen();
      case "battle":
        return "";
    }
  }

  private mainMenuScreen(): string {
    const storyStarted =
      this.#save.clearedNodeIds.length > 0 ||
      this.#save.collection.length > 0 ||
      this.#save.currentNodeId !== "story.first-run.00";
    const storyComplete =
      this.#save.clearedNodeIds.includes("story.first-run.07");
    const standaloneRun = this.#save.standaloneTournamentRun;
    return `
      <section class="main-menu" aria-labelledby="main-menu-title">
        <div class="main-menu-intro">
          <h1 id="main-menu-title">Choose a game.</h1>
          <p>
            Nothing starts until you choose it. Story Mode keeps progression;
            Quick Fight is a sandbox; Tournament is a separate multi-round run.
          </p>
        </div>
        <div class="mode-launcher">
          <article class="mode-bill mode-story">
            <div class="mode-art mode-art-story" role="img" aria-label="The Free Shelf print shop"></div>
            <div class="mode-copy">
              <h2>Story Mode</h2>
              <p>
                Play First Run from dialogue to battles, Store, Missions, the
                story Cup, and the ending. This is where your collection grows.
              </p>
              <dl>
                <div><dt>Story</dt><dd>First Run</dd></div>
                <div><dt>Status</dt><dd>${
                  storyComplete
                    ? "Complete"
                    : storyStarted
                      ? "In progress"
                      : "Not started"
                }</dd></div>
              </dl>
              <button class="primary-action" data-command="enter-story">
                ${
                  storyComplete
                    ? "Open completed story"
                    : storyStarted
                      ? "Continue Story Mode"
                      : "Start New Story"
                }
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
          <div class="mode-side-stack">
            <article class="mode-bill mode-quick">
              <div class="mode-copy">
                <h2>Quick Fight</h2>
                <p>
                  Pick any two Relics and fight immediately. No ownership,
                  Story unlocks, Stamps, or XP are changed.
                </p>
                <button class="secondary-action" data-command="enter-quick">
                  Set up Quick Fight <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article class="mode-bill mode-tournament">
              <div class="mode-art mode-art-tournament" role="img" aria-label="The Cheap Seats arena"></div>
              <div class="mode-copy">
                <h2>Tournament</h2>
                <p>
                  Open a standalone three-round Cheap Seats Case. Health and
                  interlude choices persist until the run ends.
                </p>
                <button class="secondary-action" data-command="enter-tournament">
                  ${
                    standaloneRun
                      ? `Resume Round ${standaloneRun.roundIndex + 1}`
                      : "Start Tournament"
                  }
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          </div>
        </div>
        ${
          DEV_TOOLS_ENABLED
            ? `
              <aside class="dev-launch-ticket" aria-label="Development tools">
                <div>
                  <strong>Developer Lab</strong>
                  <span>Launch isolated scenarios, inspect battles, and use local convenience tools.</span>
                </div>
                <button data-command="enter-dev">Open Dev Lab <span aria-hidden="true">→</span></button>
              </aside>
            `
            : ""
        }
        <footer class="main-menu-profile">
          <div>
            <strong>${escapeHtml(this.#save.playerName)}</strong>
            <span>Collector profile ${this.#save.slot} · ${this.#save.collection.length} owned Relic${
              this.#save.collection.length === 1 ? "" : "s"
            } · ${this.#save.tournamentBadges.length} badge${
              this.#save.tournamentBadges.length === 1 ? "" : "s"
            }</span>
          </div>
          <button data-route="profile">Manage Profile</button>
          <button data-route="settings">Settings</button>
        </footer>
      </section>
    `;
  }

  private quickFightScreen(): string {
    const player = combatContent.characters[this.#quickPlayerId]!;
    const enemy = combatContent.characters[this.#quickEnemyId]!;
    const characterOptions = (selectedId: string): string =>
      Object.values(combatContent.characters)
        .map(
          (character) =>
            `<option value="${character.id}" ${
              character.id === selectedId ? "selected" : ""
            }>${character.name} · ${formatClass(character.classId)} · L${character.level}</option>`,
        )
        .join("");
    return `
      <section class="quick-setup" aria-labelledby="quick-title">
        <div class="quick-heading">
          <button class="text-button" data-command="main-menu">← Main Menu</button>
          <h1 id="quick-title">Build a Quick Fight.</h1>
          <p>
            Sandbox rules: every Relic is available at its authored stock level.
            The result is recorded on screen but does not change Story progress.
          </p>
        </div>
        <div class="quick-versus">
          <label class="quick-pick">
            <span>Your Relic</span>
            <select name="quickPlayer">${characterOptions(this.#quickPlayerId)}</select>
            <img src="${resolveImagePath(player.portraitAssetId)}" data-asset-id="${player.portraitAssetId}" alt="" />
            <strong>${player.name}</strong>
            <small>${formatClass(player.classId)} · Level ${player.level}</small>
          </label>
          <span class="versus-stamp" aria-hidden="true">VS</span>
          <label class="quick-pick is-enemy">
            <span>Opponent</span>
            <select name="quickEnemy">${characterOptions(this.#quickEnemyId)}</select>
            <img src="${resolveImagePath(enemy.portraitAssetId)}" data-asset-id="${enemy.portraitAssetId}" alt="" />
            <strong>${enemy.name}</strong>
            <small>${formatClass(enemy.classId)} · Level ${enemy.level}</small>
          </label>
        </div>
        <div class="quick-footer">
          <label>
            <span>Difficulty</span>
            <select name="difficulty">${this.difficultyOptions()}</select>
          </label>
          <button class="primary-action" data-command="start-quick-battle">
            Start Quick Fight <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    `;
  }

  private devLabScreen(): string {
    const characterOptions = (
      selectedId: string,
      optional: boolean,
    ): string => {
      const options = Object.values(combatContent.characters)
        .map(
          (character) =>
            `<option value="${character.id}" ${
              character.id === selectedId ? "selected" : ""
            }>${character.name} · ${formatClass(character.classId)}</option>`,
        )
        .join("");
      return `${optional ? '<option value="">Empty slot</option>' : ""}${options}`;
    };
    const lineupFields = (side: Side): string => {
      const ids =
        side === "player"
          ? this.#devDraft.playerCharacterIds
          : this.#devDraft.enemyCharacterIds;
      return [0, 1, 2]
        .map((index) => {
          const selectedId = ids[index] ?? "";
          return `
            <label class="dev-lineup-slot">
              <span>${index + 1}</span>
              <select
                name="dev-${side}-${index}"
                data-dev-field="${side}Character.${index}"
                aria-label="${side === "player" ? "Player" : "Enemy"} Relic ${index + 1}"
              >
                ${characterOptions(selectedId, index > 0)}
              </select>
            </label>
          `;
        })
        .join("");
    };
    const recentReport = this.#recentBattleReports[0];
    return `
      <!--
      THESIS: Development is a fight switchboard, not an admin dashboard.
      OWN-WORLD: Indigo drawer board, chalk scenario tickets, tomato actions, acid-yellow selection, hard registration borders.
      STORY: Pick a known test or compose one, prove it is isolated, then start paused or live with diagnostics beside the work.
      FIRST VIEWPORT: Six launch tickets lead; the Lineup composer fills the centre; a narrow diagnostic ledger stays at right; launch actions close the bottom edge.
      FORM: Fight Switchboard, grounded structure six, staged as threshold relay; seed ef4be0e0.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      -->
      <section class="dev-lab" aria-labelledby="dev-lab-title">
        <header class="dev-lab-heading">
          <div>
            <button class="text-button" data-command="main-menu">← Main Menu</button>
            <h1 id="dev-lab-title">Developer Lab</h1>
            <p>
              Isolated sandbox. Development fights never change Story,
              progression, Missions, rewards, or tournament runs.
            </p>
          </div>
          <div class="dev-environment-stamp">
            <span>Environment</span>
            <strong>Development</strong>
            <small>Local state · deterministic combat</small>
          </div>
        </header>

        <section class="dev-switchboard" aria-labelledby="dev-presets-title">
          <div class="dev-section-title">
            <h2 id="dev-presets-title">Fight Switchboard</h2>
            <span>One-click scenarios</span>
          </div>
          <div class="dev-preset-grid">
            ${devBattleScenarios
              .map(
                (preset) => `
                  <button
                    class="dev-preset-ticket"
                    data-command="start-dev-scenario"
                    data-scenario-id="${preset.id}"
                  >
                    <strong>${preset.name}</strong>
                    <span>${preset.description}</span>
                    <small>${preset.playerCharacterIds.length}v${preset.enemyCharacterIds.length} · ${
                      preset.startPaused ? "Starts paused" : "Starts live"
                    }</small>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>

        <div class="dev-workbench">
          <section class="dev-composer" aria-labelledby="dev-composer-title">
            <div class="dev-section-title">
              <h2 id="dev-composer-title">Custom Fight Composer</h2>
              <span>Build a deterministic sandbox</span>
            </div>
            <div class="dev-versus-builder">
              <fieldset>
                <legend>Your Lineup</legend>
                ${lineupFields("player")}
              </fieldset>
              <span class="dev-versus-mark" aria-hidden="true">VS</span>
              <fieldset>
                <legend>Enemy Lineup</legend>
                ${lineupFields("enemy")}
              </fieldset>
            </div>
            <div class="dev-config-grid">
              <label>
                <span>Player level</span>
                <input type="number" min="1" max="25" value="${
                  this.#devDraft.playerLevel
                }" data-dev-field="playerLevel" />
              </label>
              <label>
                <span>Enemy level</span>
                <input type="number" min="1" max="25" value="${
                  this.#devDraft.enemyLevel
                }" data-dev-field="enemyLevel" />
              </label>
              <label>
                <span>Player Moves</span>
                <select data-dev-field="playerTier">
                  ${this.devTierOptions(this.#devDraft.playerTier)}
                </select>
              </label>
              <label>
                <span>Enemy Moves</span>
                <select data-dev-field="enemyTier">
                  ${this.devTierOptions(this.#devDraft.enemyTier)}
                </select>
              </label>
              <label>
                <span>Player Patch</span>
                <select data-dev-field="playerPatchId">
                  ${this.devPatchOptions(this.#devDraft.playerPatchId)}
                </select>
              </label>
              <label>
                <span>Enemy Patch</span>
                <select data-dev-field="enemyPatchId">
                  ${this.devPatchOptions(this.#devDraft.enemyPatchId)}
                </select>
              </label>
              <label>
                <span>Player Charge</span>
                <input type="number" min="0" max="100" value="${
                  this.#devDraft.playerStartingBar
                }" data-dev-field="playerStartingBar" />
              </label>
              <label>
                <span>Enemy Charge</span>
                <input type="number" min="0" max="100" value="${
                  this.#devDraft.enemyStartingBar
                }" data-dev-field="enemyStartingBar" />
              </label>
              <label>
                <span>Player health · %</span>
                <input type="number" min="1" max="100" value="${
                  this.#devDraft.playerHealthRatio * 100
                }" data-dev-field="playerHealthPercent" />
              </label>
              <label>
                <span>Enemy health · %</span>
                <input type="number" min="1" max="100" value="${
                  this.#devDraft.enemyHealthRatio * 100
                }" data-dev-field="enemyHealthPercent" />
              </label>
              <label>
                <span>Difficulty</span>
                <select data-dev-field="devDifficulty">
                  ${(["easy", "normal", "hard", "brutal"] as const)
                    .map(
                      (difficulty) =>
                        `<option value="${difficulty}" ${
                          this.#devDraft.difficulty === difficulty
                            ? "selected"
                            : ""
                        }>${formatClass(difficulty)}</option>`,
                    )
                    .join("")}
                </select>
              </label>
              <label>
                <span>Time limit · seconds</span>
                <input type="number" min="1" max="600" value="${
                  this.#devDraft.timeLimitMs / 1000
                }" data-dev-field="timeLimitSeconds" />
              </label>
              <label class="dev-seed-field">
                <span>Seed</span>
                <input type="number" min="0" value="${
                  this.#devDraft.seed
                }" data-dev-field="seed" />
              </label>
            </div>
            <div class="dev-launch-actions">
              <button
                class="primary-action"
                data-command="start-dev-custom"
                data-paused="true"
              >Start Paused</button>
              <button
                class="secondary-action"
                data-command="start-dev-custom"
                data-paused="false"
              >Start Live</button>
            </div>
          </section>

          <aside class="dev-ledger" aria-labelledby="dev-ledger-title">
            <div class="dev-section-title">
              <h2 id="dev-ledger-title">Diagnostics</h2>
            </div>
            <dl>
              <div><dt>Profile</dt><dd>${escapeHtml(this.#save.playerName)} · slot ${
                this.#save.slot
              }</dd></div>
              <div><dt>Content</dt><dd>${
                Object.keys(combatContent.characters).length
              } Relics · ${Object.keys(combatContent.actions).length} Moves</dd></div>
              <div><dt>Recent reports</dt><dd>${
                this.#recentBattleReports.length
              } this session</dd></div>
              <div><dt>Last fight</dt><dd>${
                recentReport
                  ? `${escapeHtml(recentReport.encounterId)} · ${recentReport.outcome ?? "active"}`
                  : "Run a fight to generate a report"
              }</dd></div>
            </dl>
            <div class="dev-convenience">
              <h3>Convenience</h3>
              <button data-command="dev-grant-collection">Grant all Relics + Patches</button>
              <button data-command="dev-grant-stamps" data-amount="500">Add 500 Stamps</button>
              <button data-command="dev-unlock-story">Unlock First Run views</button>
              <button data-command="download-profile-data">Export profile JSON</button>
              <button
                data-command="download-battle-report"
                ${recentReport ? "" : "disabled"}
              >Export last battle report</button>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  private devTierOptions(selected: DevMoveTier): string {
    return (
      [
        ["normal", "Normal · base outline"],
        ["tier1", "Tier 1 · silver outline"],
        ["tier2", "Tier 2 · gold outline"],
      ] as const
    )
      .map(
        ([value, label]) =>
          `<option value="${value}" ${
            selected === value ? "selected" : ""
          }>${label}</option>`,
      )
      .join("");
  }

  private devPatchOptions(selectedId: string | null): string {
    return [
      '<option value="">No Patch</option>',
      ...patches.map(
        (patch) =>
          `<option value="${patch.id}" ${
            selectedId === patch.id ? "selected" : ""
          }>${escapeHtml(patch.name)} · ${escapeHtml(patch.description)}</option>`,
      ),
    ].join("");
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

  private profileScreen(): string {
    const storyClears = this.#save.clearedNodeIds.length;
    return `
      <section class="profile-sheet" aria-labelledby="profile-title">
        <div class="section-heading">
          <button class="text-button" data-command="main-menu">← Main Menu</button>
          <h1 id="profile-title">Collector Profile</h1>
          <p>
            Identity and progression live here. Audio, accessibility, and local
            data controls live separately in Settings.
          </p>
        </div>
        <div class="profile-layout">
          <fieldset class="profile-identity">
            <legend>Identity</legend>
            <label>
              <span>Collector name</span>
              <input name="playerName" value="${escapeHtml(this.#save.playerName)}" />
            </label>
            <label>
              <span>Local profile</span>
              <select name="profileSlot">
                ${([1, 2, 3] as const)
                  .map(
                    (slot) =>
                      `<option value="${slot}" ${
                        this.#save.slot === slot ? "selected" : ""
                      }>Collector profile ${slot}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <small>
              Three local profiles are available in this prototype. Switching
              profiles never changes your global Settings.
            </small>
          </fieldset>
          <section class="profile-record" aria-labelledby="profile-record-title">
            <h2 id="profile-record-title">${escapeHtml(this.#save.playerName)}'s drawer</h2>
            <dl>
              <div><dt>Story prints cleared</dt><dd>${storyClears}/8</dd></div>
              <div><dt>Owned Relics</dt><dd>${this.#save.collection.length}</dd></div>
              <div><dt>Stamps</dt><dd>${this.#save.stamps}</dd></div>
              <div><dt>Tournament badges</dt><dd>${this.#save.tournamentBadges.length}</dd></div>
            </dl>
            <button class="primary-action" data-command="enter-story">
              ${storyClears > 0 ? "Continue this Story" : "Start this Story"}
              <span aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      </section>
    `;
  }

  private storyScreen(): string {
    const cleared = new Set(this.#save.clearedNodeIds);
    const firstRunComplete = cleared.has("story.first-run.07");
    const baseProgress = {
      "story.first-run.00": {
        title: "The ink is wet. The bill is due.",
        copy: "The Ledger has arrived to confiscate every unofficial Relic in the shop. Mara Vex has one reply and three increasingly expensive ways to print it.",
        speaker: "MARA",
        line: "Tell Knuckle Tax I kept the receipt. It says no refunds.",
        action: "Start First Run",
      },
      "story.first-run.01": {
        title: "Shelf space is a legal argument.",
        copy: "Mara Vex is off the display card and in your Lineup. The Ledger would prefer you called that evidence.",
        speaker: "MARA",
        line: "If they wanted it mint, they should have left it wrapped.",
        action: "Face the invoice",
      },
      "story.first-run.02": {
        title: "An invoice with fists.",
        copy: "Knuckle Tax is blocking the front door with a three-print collection notice. Your Charge Strip belongs to the whole Lineup—switch without losing it.",
        speaker: "KNUCKLE TAX",
        line: "Unofficial stock. Official consequences.",
        action: "Set the Tax Due Lineup",
      },
      "story.first-run.03": {
        title: "The backroom counter opens.",
        copy: "Winning bought breathing room and access to rotating Relics and reusable Patches. Browsing is free. The labels are not.",
        speaker: "MARA",
        line: "Nothing says legitimate like a price written by hand.",
        action: "Enter Backroom Counter",
      },
      "story.first-run.04": {
        title: "Read the fine print.",
        copy: "Three mission slips have appeared on the wall. Their rewards count whether the story likes your methods or not.",
        speaker: "ZIPWIRE",
        line: "I read all three. That felt more dangerous than fighting.",
        action: "Open the mission board",
      },
      "story.first-run.05": {
        title: "Two prints enter the qualifier.",
        copy: "The qualifier checks whether you can share Charge and switch cleanly. Zipwire is available as a story loan if you have not bought a copy.",
        speaker: "MARA",
        line: "Try not to make the teamwork look deliberate.",
        action: "Set the Qualifier Lineup",
      },
      "story.first-run.06": {
        title: "Cheap seats. Expensive mistakes.",
        copy: "The qualifier stamp is dry. The three-round Cup is the next print on the board.",
        speaker: "KNUCKLE TAX",
        line: "The bracket has already billed you for losing.",
        action: "Enter the Cheap Seats Cup",
      },
      "story.first-run.07": {
        title: "Officially unofficial.",
        copy: "The first print run survives. Stamp the ending panel to archive the run and reveal the rival file.",
        speaker: "MARA",
        line: "Put that on the invoice.",
        action: "Claim the ending print",
      },
    }[this.#save.currentNodeId] ?? {
      title: "The ink is wet. The bill is due.",
      copy: "The Ledger has arrived to confiscate every unofficial Relic in the shop.",
      speaker: "MARA",
      line: "Tell Knuckle Tax I kept the receipt.",
      action: "Continue First Run",
    };
    const progress =
      this.#save.currentNodeId === "story.first-run.07" && firstRunComplete
        ? {
            title: "First Run: archived.",
            copy: "The shop survives, the champion badge is in the drawer, and Knuckle Tax is now filed as a revealed rival.",
            speaker: "MARA",
            line: "Official enough for me.",
            action: "First Run complete",
          }
        : baseProgress;
    return `
      <section class="story-board" aria-labelledby="story-title">
        <div class="story-art" role="img" aria-label="The Free Shelf print shop at night"></div>
        <div class="story-copy">
          <p class="story-label">Main story · First Run</p>
          <h1 id="story-title">${escapeHtml(progress.title)}</h1>
          <p>${escapeHtml(progress.copy)}</p>
          <div class="dialogue-line">
            <span class="speaker-stamp">${escapeHtml(progress.speaker)}</span>
            <q>${escapeHtml(progress.line)}</q>
          </div>
          <button
            class="primary-action"
            data-command="continue-story"
            ${
              this.#save.currentNodeId === "story.first-run.07" &&
              firstRunComplete
                ? "disabled"
                : ""
            }
          >
            ${escapeHtml(progress.action)} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      ${
        this.#save.currentNodeId === "story.first-run.07"
          ? `
            <aside class="ending-reward-panel ${
              firstRunComplete ? "is-claimed" : ""
            }" aria-label="First Run ending reward">
              <span>${firstRunComplete ? "ARCHIVED" : "ENDING REWARD"}</span>
              <div>
                <strong>★ ${FIRST_RUN_ENDING_REWARD} Stamps</strong>
                <strong>Rival file · Knuckle Tax</strong>
                <strong>Badge · Cheap Seats Champion</strong>
              </div>
            </aside>
          `
          : ""
      }
      <section class="node-strip" aria-labelledby="path-title">
        <div class="section-heading">
          <h2 id="path-title">Eight prints. One very bad invoice.</h2>
          <p>Cleared prints stay stamped. Locked prints preview what comes next.</p>
        </div>
        <ol class="story-path">
          ${storyNodes
            .map((node) => {
              const isAvailable =
                cleared.has(node.id) || node.id === this.#save.currentNodeId;
              const isCleared = cleared.has(node.id);
              return `
                <li class="story-node ${isCleared ? "is-cleared" : ""} ${
                  isAvailable ? "" : "is-locked"
                }">
                  <span class="node-index">${node.index}</span>
                  <span class="node-kind">${node.type}</span>
                  <strong>${node.title}</strong>
                  <span>${node.summary}</span>
                  <span class="node-state">${
                    isCleared ? "Cleared" : isAvailable ? "Available" : "Locked"
                  }</span>
                </li>
              `;
            })
            .join("")}
        </ol>
      </section>
    `;
  }

  private lineupScreen(): string {
    const encounter = firstRunEncounter(this.#save.currentNodeId);
    const lineup = encounter.playerCharacterIds;
    const factionCounts = new Map<string, number>();
    for (const id of lineup) {
      const factionId = combatContent.characters[id]!.factionId;
      factionCounts.set(factionId, (factionCounts.get(factionId) ?? 0) + 1);
    }
    const synergyCount = Math.max(...factionCounts.values());
    return `
      <section class="lineup-workbench" aria-labelledby="lineup-title">
        <div class="lineup-heading">
          <button class="text-button" data-route="story">← Back to story</button>
          <h1 id="lineup-title">${
            encounter.nodeId === "story.first-run.05"
              ? "Two prints. One shared strip."
              : "Pull three. Print one."
          }</h1>
          <p>
            ${
              encounter.nodeId === "story.first-run.05"
                ? "Qualifier rules require two Relics. Zipwire is supplied as a story loan when you do not own a copy."
                : "Story loaners are marked in yellow. Your Charge Strip belongs to the Lineup and survives every switch."
            }
          </p>
        </div>
        <div class="match-sheet">
          <div class="lineup-side">
            <h2>Your Lineup</h2>
            ${lineup
              .map((id) =>
                this.lineupRelic(
                  id,
                  !this.#save.collection.some(
                    (entry) => entry.characterId === id,
                  ),
                ),
              )
              .join("")}
            <div class="synergy-ticket">
              <span>Free Shelf ×${synergyCount}</span>
              <strong>${
                synergyCount >= 3
                  ? "+2 Vitality · +2 Power"
                  : synergyCount >= 2
                    ? "+2 Vitality"
                    : "No active synergy"
              }</strong>
            </div>
          </div>
          <div class="versus-stamp" aria-label="versus">VS</div>
          <div class="lineup-side is-enemy">
            <h2>The Ledger</h2>
            ${encounter.enemyCharacterIds
              .map((id) => this.lineupRelic(id, false))
              .join("")}
            <div class="class-wheel-mini">
              <strong>Class wheel</strong>
              <span>Impact → Feral → Guile → Circuit → Hex → Guard</span>
            </div>
          </div>
        </div>
        <div class="lineup-footer">
          <div>
            <span>Node ${encounter.index} · ${encounter.title}</span>
            <strong>${formatClass(this.#preferences.difficulty)}</strong>
          </div>
          <button class="primary-action" data-command="start-battle">
            Tear into battle <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    `;
  }

  private lineupRelic(characterId: string, loaned: boolean): string {
    const character = combatContent.characters[characterId]!;
    const owned = this.#save.collection.find(
      (entry) => entry.characterId === characterId,
    );
    const level = owned?.level ?? character.level;
    return `
      <article class="lineup-ticket">
        <div class="ticket-portrait is-${character.classId}">
          <img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" alt="" />
        </div>
        <div>
          <span class="class-mark">${formatClass(character.classId)}</span>
          <h3>${character.name}</h3>
          <p>Level ${level} · ${owned ? "Owned build" : loaned ? "Story loan" : "Ready"}</p>
        </div>
        <span class="ticket-notch" aria-hidden="true"></span>
      </article>
    `;
  }

  private collectionScreen(): string {
    const ownedIds = new Set(
      this.#save.collection.map((entry) => entry.characterId),
    );
    return `
      <section class="collection-wall" aria-labelledby="collection-title">
        <div class="section-heading">
          <h1 id="collection-title">Your shelf has opinions.</h1>
          <p>
            Owned copies keep independent levels, Move tiers, allocations, and
            Patches. Exact duplicates are legal. Taste is not guaranteed.
          </p>
        </div>
        <div class="collection-grid">
          ${Object.values(combatContent.characters)
            .map((character) => {
              const ownedCopies = this.#save.collection.filter(
                (entry) => entry.characterId === character.id,
              );
              const owned = ownedIds.has(character.id);
              return `
                <article class="relic-box ${owned ? "" : "is-locked"}">
                  <div class="box-art">
                    <img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" alt="" />
                  </div>
                  <div class="box-label">
                    <span>${formatClass(character.classId)}</span>
                    <h2>${owned ? character.name : "Unrevealed Relic"}</h2>
                    <p>${
                      owned
                        ? `Owned ×${ownedCopies.length} · ${ownedCopies
                            .map((entry) => `L${entry.level}`)
                            .join(" / ")}`
                        : "Find the right print first."
                    }</p>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
        <section class="patch-shelf" aria-labelledby="patch-shelf-title">
          <h2 id="patch-shelf-title">Patch drawer</h2>
          <p>
            One Patch per owned Relic from level 5. Reusable means moving a
            Patch here removes it from its previous wearer.
          </p>
          <div class="patch-inventory">
            ${
              this.#save.ownedPatches.length > 0
                ? this.#save.ownedPatches
                    .map((patchId) => {
                      const patch = findPatch(patchId);
                      return `
                        <span>
                          <strong>${escapeHtml(patch?.name ?? patchId)}</strong>
                          ${escapeHtml(patch?.description ?? "Unknown Patch")}
                        </span>
                      `;
                    })
                    .join("")
                : "<p>No Patches owned yet. The Backroom Counter rotates them in.</p>"
            }
          </div>
          <div class="owned-build-list">
            ${this.#save.collection
              .map((owned) => {
                const character = combatContent.characters[owned.characterId];
                if (!character) {
                  return "";
                }
                const patch = findPatch(owned.equippedPatchId);
                const unlocked = owned.level >= 5;
                const patchLocked = Boolean(this.#save.tournamentRun);
                return `
                  <article class="owned-build-ticket">
                    <div>
                      <span>${formatClass(character.classId)} · ${owned.instanceId}</span>
                      <h3>${character.name} · Level ${owned.level}</h3>
                      <p>${owned.xp} XP · ${owned.unspentStatPoints} unspent stat points</p>
                    </div>
                    <label>
                      <span>${
                        patchLocked
                          ? "Patch locked during the Cheap Seats Cup"
                          : unlocked
                            ? "Equipped Patch"
                            : "Patch slot unlocks at level 5"
                      }</span>
                      <select
                        name="equippedPatch"
                        data-instance-id="${owned.instanceId}"
                        ${
                          unlocked &&
                          !patchLocked &&
                          this.#save.ownedPatches.length > 0
                            ? ""
                            : "disabled"
                        }
                      >
                        <option value="">No Patch</option>
                        ${this.#save.ownedPatches
                          .map(
                            (patchId) =>
                              `<option value="${patchId}" ${
                                owned.equippedPatchId === patchId
                                  ? "selected"
                                  : ""
                              }>${escapeHtml(findPatch(patchId)?.name ?? patchId)}</option>`,
                          )
                          .join("")}
                      </select>
                    </label>
                    <small>${escapeHtml(patch?.description ?? "No build modifier equipped.")}</small>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      </section>
    `;
  }

  private storeScreen(): string {
    if (this.routeLocked("store")) {
      return this.lockedFeatureScreen(
        "store-title",
        "Backroom Counter",
        "Clear Tax Due to reveal rotating Relics and Patches.",
      );
    }
    const offers = this.currentOffers();
    const ownedIds = new Set(
      this.#save.collection.map((entry) => entry.characterId),
    );
    const ownedPatches = new Set(this.#save.ownedPatches);
    return `
      <section class="store-counter" aria-labelledby="store-title">
        ${
          this.#save.currentNodeId === "story.first-run.03"
            ? `
              <aside class="story-unlock-slip">
                <div>
                  <span>First Run · Node 03</span>
                  <strong>Rotating stock revealed</strong>
                  <p>Inspect today's four labels. Buying is optional; the mission board is already being pinned up.</p>
                </div>
                <button class="primary-action" data-command="advance-story-node">
                  Read the mission slips <span aria-hidden="true">→</span>
                </button>
              </aside>
            `
            : ""
        }
        <div class="store-scene">
          <div>
            <h1 id="store-title">Backroom Counter</h1>
            <p>
              Prices rotate with the print run. Favourites will eventually pin
              revealed stock; for now, today's four labels are the whole box.
            </p>
          </div>
          <span class="store-balance">★ ${this.#save.stamps} Stamps</span>
        </div>
        <div class="offer-rack">
          ${offers
            .map((offer, index) =>
              this.offerLabel(
                offer,
                index,
                offer.kind === "character"
                  ? ownedIds.has(offer.itemId)
                  : ownedPatches.has(offer.itemId),
              ),
            )
            .join("")}
        </div>
      </section>
    `;
  }

  private currentOffers(): StoreOffer[] {
    return rotatingOffers(new Date().toISOString().slice(0, 10));
  }

  private offerLabel(
    offer: StoreOffer,
    index: number,
    alreadyOwned: boolean,
  ): string {
    const canAfford = this.#save.stamps >= offer.price;
    const canBuy = canAfford && !(offer.kind === "patch" && alreadyOwned);
    return `
      <article class="offer-label tone-${index % 3}">
        <div>
          <span>${offer.rarity} · ${offer.kind}</span>
          <h2>${offer.name}</h2>
          <p>${
            offer.kind === "character"
              ? `Arrives at level ${offer.level}. ${
                  alreadyOwned
                    ? "Another independent copy."
                    : "New shelf entry."
                }`
              : escapeHtml(
                  findPatch(offer.itemId)?.description ??
                    "Reusable. One equipped Relic at a time.",
                )
          }</p>
        </div>
        <button
          data-command="buy-offer"
          data-offer-id="${offer.id}"
          ${canBuy ? "" : "disabled"}
        >
          <span>★ ${offer.price}</span>
          ${
            offer.kind === "patch" && alreadyOwned
              ? "Already on shelf"
              : canAfford
                ? "Buy label"
                : "Need more Stamps"
          }
        </button>
      </article>
    `;
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

  private missionsScreen(): string {
    if (this.routeLocked("missions")) {
      return this.lockedFeatureScreen(
        "missions-title",
        "Mission Board",
        "Inspect the Backroom Counter in Node 03 to reveal these slips.",
      );
    }
    return `
      <section class="mission-board" aria-labelledby="missions-title">
        ${
          this.#save.currentNodeId === "story.first-run.04"
            ? `
              <aside class="story-unlock-slip">
                <div>
                  <span>First Run · Node 04</span>
                  <strong>Three missions unlocked</strong>
                  <p>Progress is semantic: losses can count actions, but win objectives still require a win.</p>
                </div>
                <button class="primary-action" data-command="advance-story-node">
                  Set the Qualifier Lineup <span aria-hidden="true">→</span>
                </button>
              </aside>
            `
            : ""
        }
        <div class="section-heading">
          <h1 id="missions-title">Reasons to make it personal.</h1>
          <p>
            Action objectives can progress on a loss. Win objectives remain
            stubbornly interested in winning.
          </p>
        </div>
        <div class="mission-list">
          ${missions
            .map((mission) => {
              const progress = Math.min(
                mission.target,
                this.#save.missionProgress[mission.id] ?? 0,
              );
              const complete = progress >= mission.target;
              return `
                <article class="mission-slip ${complete ? "is-complete" : ""}">
                  <span class="mission-check" aria-hidden="true">${
                    complete ? "✓" : "×"
                  }</span>
                  <div>
                    <h2>${mission.name}</h2>
                    <p>${mission.description}</p>
                  </div>
                  <div class="mission-progress">
                    <strong>${progress}/${mission.target}</strong>
                    ${
                      this.#save.claimedMissionIds.includes(mission.id)
                        ? `<span>Paid · ★ ${mission.rewardStamps}</span>`
                        : complete
                          ? `<button data-command="claim-mission" data-mission-id="${mission.id}">Claim ★ ${mission.rewardStamps}</button>`
                          : `<span>★ ${mission.rewardStamps}</span>`
                    }
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  private lockedFeatureScreen(
    headingId: string,
    title: string,
    copy: string,
  ): string {
    return `
      <section class="locked-feature" aria-labelledby="${headingId}">
        <span>FIRST RUN · LOCKED PRINT</span>
        <h1 id="${headingId}">${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy)}</p>
        <button class="primary-action" data-route="story">
          Return to the story <span aria-hidden="true">→</span>
        </button>
      </section>
    `;
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

  private tournamentScreen(): string {
    if (this.routeLocked("tournament")) {
      return this.lockedFeatureScreen(
        "tournament-title",
        "The Cheap Seats Cup",
        "Clear the two-Relic qualifier to earn a place in the bracket.",
      );
    }
    const run = this.activeTournamentRun();
    const champion = this.#save.tournamentBadges.includes(
      "badge.cheap-seats-champion",
    );
    const encounter = cheapSeatsEncounter(run?.roundIndex ?? 0);
    const caseEntries = Object.entries(run?.healthRatios ?? {});
    const caseStatus =
      caseEntries.length > 0
        ? caseEntries
            .map(([instanceId, ratio]) => {
              const owned = this.#save.collection.find(
                (entry) => entry.instanceId === instanceId,
              );
              const character = owned
                ? combatContent.characters[owned.characterId]
                : Object.values(combatContent.characters).find((candidate) =>
                    instanceId.includes(candidate.id),
                  );
              return `<span><strong>${escapeHtml(character?.name ?? "Case Relic")}</strong>${Math.round(ratio * 100)}% Case health</span>`;
            })
            .join("")
        : "<span><strong>Fresh Case</strong>Full health at the opening bell</span>";
    const controls =
      run?.phase === "interlude"
        ? `
          <div class="cup-drops" aria-label="Choose an interstitial drop">
            <button data-command="cup-drop" data-drop="front-print-repair">
              <strong>Front Print Repair</strong>
              Heal the Relic that ended the prior round active by 45%.
            </button>
            <button data-command="cup-drop" data-drop="case-repair">
              <strong>Case Repair</strong>
              Heal the Case by 18% and revive one defeated Relic at 35%.
            </button>
            <button data-command="cup-drop" data-drop="hot-start">
              <strong>Hot Start</strong>
              Begin the next round with another 18 Charge.
            </button>
          </div>
        `
        : `
          <button class="primary-action" data-command="start-tournament">
            ${run ? `Enter Round ${encounter.roundIndex + 1}` : "Open Case · Enter Round 1"}
            <span aria-hidden="true">→</span>
          </button>
        `;
    return `
      <section class="tournament-poster" aria-labelledby="tournament-title">
        <div class="tournament-art"></div>
        <div class="tournament-copy">
          <button class="text-button" ${
            this.#sessionMode === "story"
              ? 'data-route="story"'
              : 'data-command="main-menu"'
          }>
            ← ${this.#sessionMode === "story" ? "Back to Story" : "Main Menu"}
          </button>
          ${champion ? '<span class="cup-badge">★ Cheap Seats Champion</span>' : ""}
          <h1 id="tournament-title">The Cheap Seats Cup</h1>
          <p>
            ${
              run?.phase === "interlude"
                ? `Round ${run.roundIndex} is stamped. Choose one drop before ${escapeHtml(encounter.title)}.`
                : `Round ${encounter.roundIndex + 1} · ${escapeHtml(encounter.title)} — ${escapeHtml(encounter.subtitle)}`
            }
          </p>
          <div class="bracket">
            ${cheapSeatsEncounters
              .map(
                (round) => `
                  <span class="${
                    run && round.roundIndex < run.roundIndex
                      ? "is-cleared"
                      : round.roundIndex === (run?.roundIndex ?? 0)
                        ? "is-current"
                        : ""
                  }">
                    Round ${round.roundIndex + 1}<br />
                    <strong>${escapeHtml(round.title)}</strong>
                  </span>
                `,
              )
              .join("")}
          </div>
          <div class="case-health">${caseStatus}</div>
          ${controls}
          <small>
            Case health, defeats, chosen drops, and the current round persist in
            this ${
              this.#sessionMode === "story" ? "Story game" : "Tournament game"
            }. Equipped Patches stay locked for the run.${
              champion ? " Opening a new Case replays the full bracket." : ""
            }
          </small>
        </div>
      </section>
    `;
  }

  private settingsScreen(): string {
    return `
      <section class="settings-sheet" aria-labelledby="settings-title">
        <div class="section-heading">
          <button class="text-button" data-command="main-menu">← Main Menu</button>
          <h1 id="settings-title">Settings</h1>
          <p>
            These preferences apply to every game type and every Collector
            profile. Identity and progression are managed from Profile.
          </p>
        </div>
        <div class="settings-columns">
          <fieldset>
            <legend>Play and accessibility</legend>
            <label>
              <span>Difficulty</span>
              <select name="difficulty">${this.difficultyOptions()}</select>
            </label>
            <label class="toggle-row">
              <span>
                <strong>Reduced motion</strong>
                <small>Preserves state changes without shake, cut-in travel, or bob.</small>
              </span>
              <input type="checkbox" name="reducedMotion" ${
                this.#preferences.reducedMotion ? "checked" : ""
              } />
            </label>
            <label class="toggle-row">
              <span>
                <strong>Music playback</strong>
                <small>
                  Off stays off across menus, battles, reloads, and profiles.
                </small>
              </span>
              <input type="checkbox" name="musicPlaybackEnabled" ${
                this.#preferences.musicPlaybackEnabled ? "checked" : ""
              } />
            </label>
          </fieldset>
          <fieldset>
            <legend>Audio</legend>
            ${this.volumeControl("music", "Music", this.#preferences.musicVolume)}
            ${this.volumeControl("sfx", "Sound effects", this.#preferences.sfxVolume)}
            ${this.volumeControl(
              "dialogue",
              "Dialogue",
              this.#preferences.dialogueVolume,
            )}
            <p class="settings-note">
              SFX and dialogue currently resolve to valid silent placeholders.
              The controls and logical IDs are ready for ElevenLabs output.
            </p>
          </fieldset>
          <fieldset class="data-settings">
            <legend>Local data</legend>
            <p>
              Progress is stored in this browser. Export the selected Collector
              profile and global preferences as readable JSON.
            </p>
            <button class="secondary-action" data-command="download-profile-data">
              Export current profile
            </button>
            <button class="text-button" data-route="profile">
              Manage Collector profiles
            </button>
          </fieldset>
        </div>
      </section>
    `;
  }

  private volumeControl(
    category: "music" | "sfx" | "dialogue",
    label: string,
    value: number,
  ): string {
    const muted = this.#preferences[`${category}Muted`];
    return `
      <div class="volume-row">
        <label for="${category}-volume">${label}</label>
        <input
          id="${category}-volume"
          type="range"
          name="${category}Volume"
          min="0"
          max="1"
          step="0.05"
          value="${value}"
        />
        <output for="${category}-volume">${Math.round(value * 100)}%</output>
        <label class="mute-control">
          <input type="checkbox" name="${category}Muted" ${muted ? "checked" : ""} />
          Mute
        </label>
      </div>
    `;
  }

  private renderBattle(): void {
    if (!this.#battle) {
      this.startBattle(false);
      return;
    }
    this.#root.innerHTML = `
      <!--
      THESIS: The Charge Strip is the combat control, not a meter beneath three cards.
      OWN-WORLD: Indigo drawer, chalk track, acid fill, tomato readiness, circular press seals, hard registration borders.
      STORY: Read Charge, see exactly which Move threshold it has reached, activate without losing focus, and pause or inspect safely.
      FIRST VIEWPORT: Rail and Lineups frame the arena; one full-width integrated Move-and-Charge field anchors the lower edge.
      FORM: Bar-first battle control, pinned by the supplied Teeny Titans 2 structural reference.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      -->
      <main class="battle-screen" id="main-content">
        <header class="battle-rail">
          <button class="battle-wordmark" data-command="pause-battle">RIOT RELICS</button>
          <span class="round-label">${
            this.#isTournamentFight
              ? `CHEAP SEATS · ROUND ${this.#tournamentRoundIndex + 1} · ${cheapSeatsEncounter(this.#tournamentRoundIndex).title.toUpperCase()}`
              : this.#isDevFight && this.#devScenario
                ? `DEV LAB · ${this.#devScenario.name.toUpperCase()}`
                : this.#isQuickFight
                  ? `QUICK FIGHT · ${combatContent.characters[this.#quickPlayerId]!.name.toUpperCase()} VS ${combatContent.characters[this.#quickEnemyId]!.name.toUpperCase()}`
                  : firstRunEncounter(this.#storyBattleNodeId).railLabel
          }</span>
          <span class="timer-ticket"><span>TIME</span><strong data-battle-time>90</strong></span>
          <div class="battle-rail-tools">
            <label>
              <span class="sr-only">Difficulty</span>
              <select name="difficulty">${this.difficultyOptions(true)}</select>
            </label>
            <button
              data-command="toggle-music"
              class="now-playing"
              aria-label="${
                this.#preferences.musicPlaybackEnabled
                  ? "Turn music off"
                  : "Turn music on"
              }"
              aria-pressed="${this.#preferences.musicPlaybackEnabled}"
            >
              ${ICONS.music}<span data-now-playing>Red Thread</span>
            </button>
            ${
              DEV_TOOLS_ENABLED
                ? '<button class="dev-battle-button" data-command="open-dev-inspector">DEV</button>'
                : ""
            }
            <button class="pause-battle-button" data-command="pause-battle">PAUSE</button>
          </div>
        </header>
        <section class="battle-drawer" aria-label="Battle">
          <aside class="bench-rail player-bench" aria-label="Your Lineup">
            <h2>Your Lineup</h2>
            <div data-player-bench></div>
          </aside>
          <section class="arena-specimen">
            <div class="fighter-readout player-readout" data-player-readout></div>
            <div class="fighter-readout enemy-readout" data-enemy-readout></div>
            <div class="arena-canvas" id="battle-canvas" aria-hidden="true"></div>
            <div class="matchup-stamp" data-matchup></div>
            <div class="combat-log" aria-live="polite" data-combat-log></div>
            <div class="battle-loading" data-battle-loading role="status">
              Preparing print
            </div>
          </section>
          <aside class="bench-rail enemy-bench" aria-label="Enemy Lineup">
            <h2>Enemy Lineup</h2>
            <div data-enemy-bench></div>
          </aside>
          <section class="command-deck" aria-label="Moves and player Charge">
            <div class="player-charge-deck">
              <div class="charge-deck-heading">
                <span>Your Charge</span>
                <strong data-player-charge-value>0 / 100</strong>
              </div>
              <div class="charge-control-field">
                <section
                  class="action-tray"
                  aria-label="Moves integrated with Charge"
                  data-action-tray
                ></section>
                <div
                  class="meter charge-meter command-charge-meter"
                  role="meter"
                  aria-label="Player Charge"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="0"
                  data-player-charge-meter
                >
                  <span data-player-charge-fill></span>
                </div>
                <div class="charge-scale" aria-hidden="true">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>
            </div>
          </section>
        </section>
        <section
          class="battle-overlay"
          data-battle-overlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="battle-overlay-title"
          hidden
        ></section>
        <section
          class="battle-result"
          data-battle-result
          role="dialog"
          aria-modal="true"
          aria-labelledby="battle-result-title"
          hidden
        ></section>
        <div class="sr-only" aria-live="polite" id="announcer"></div>
      </main>
    `;

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
      this.#battleReady = true;
      this.#lastFrameAt = performance.now();
      scene.setSimulationPaused(this.#battlePaused);
      const loading = this.#root.querySelector<HTMLElement>(
        "[data-battle-loading]",
      );
      if (loading) {
        loading.hidden = true;
      }
      this.updateBattleOverlay();
    });
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
      this.#save[field] = lockCheapSeatsCase(run, this.tournamentCaseBuilds());
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
        ? [this.#quickPlayerId]
        : tournament
          ? tournamentRun.caseBuilds.map((build) => build.characterId)
          : storyEncounter.playerCharacterIds;
    const enemyIds = devScenario
      ? devScenario.enemyCharacterIds
      : quick
        ? [this.#quickEnemyId]
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
    const quickSeed =
      20_261_000 +
      Object.keys(combatContent.characters).indexOf(this.#quickPlayerId) * 10 +
      Object.keys(combatContent.characters).indexOf(this.#quickEnemyId);
    const created = createBattle(
      {
        playerCharacterIds: playerIds,
        playerBuilds,
        enemyCharacterIds: enemyIds,
        enemyBuilds,
        playerStartingBar: devScenario
          ? devScenario.playerStartingBar + openingChargeBonus(playerBuilds)
          : 22 +
            openingChargeBonus(playerBuilds) +
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
            ? `quick.${this.#quickPlayerId}.vs.${this.#quickEnemyId}`
            : storyEncounter.nodeId,
    });
    this.#battleReportArchived = false;
    this.#battleReward = null;
    this.#eventLog = [
      tournament
        ? `${tournamentEncounter.title} is live. Case damage carries.`
        : devScenario
          ? `${devScenario.name} loaded. Development sandbox; progression is isolated.`
          : quick
            ? "Quick Fight is live. Sandbox results do not change Story progress."
            : "The print is live. Spend Charge or switch Relics.",
    ];
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
      return {
        instanceId: `quick.${side}.${index}.${characterId}`,
        level: definition.level,
        actionIds: definition.actionIds,
        actionTiers: Object.fromEntries(
          definition.actionIds.map((actionId) => [actionId, "stock"]),
        ),
      };
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

  private tournamentCaseBuilds(): TournamentCaseBuild[] {
    return this.playerBuilds([...cheapSeatsPlayerIds]).map((build, index) => {
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
    this.#animationFrame = 0;
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
    const delta = Math.min(
      250,
      (now - this.#lastFrameAt) * this.#battleTimeScale,
    );
    this.#lastFrameAt = now;
    this.applyTransition(tickBattle(this.#battle, delta, combatContent));

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
    if (!this.#battle || this.#battle.outcome !== "active") {
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
    this.#battleScene?.present(transition.events);
    for (const event of transition.events) {
      if (event.type === "actionStarted" && event.actionId) {
        const audioId = combatContent.actions[event.actionId]?.audioId;
        if (audioId) {
          this.#audio.playSfx(audioId);
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
    this.updateBattleView();
  }

  private playerSwitch(side: Side, index: number): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.#battlePaused ||
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
    this.updateBattleView();
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
    this.#eventLog = this.#eventLog.slice(0, 3);
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
    this.updatePlayerChargeDeck();
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
    target.innerHTML = `
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
      ${
        side === "enemy"
          ? `
            <div class="meter-label">
              <span>Enemy Charge</span>
              <strong>${Math.floor(team.bar)}/100</strong>
            </div>
            <div
              class="meter charge-meter"
              role="meter"
              aria-label="Enemy Charge"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.floor(team.bar)}"
            ><span style="--meter-scale:${team.bar / 100}"></span></div>
          `
          : ""
      }
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
      <div class="status-row">${statusLabels || "<span>Clear</span>"}</div>
    `;
  }

  private updatePlayerChargeDeck(): void {
    if (!this.#battle) {
      return;
    }
    const value = Math.floor(this.#battle.player.bar);
    const label = this.#root.querySelector<HTMLElement>(
      "[data-player-charge-value]",
    );
    const meter = this.#root.querySelector<HTMLElement>(
      "[data-player-charge-meter]",
    );
    const fill = this.#root.querySelector<HTMLElement>(
      "[data-player-charge-fill]",
    );
    if (label) {
      label.textContent = `${value} / 100`;
    }
    if (meter) {
      meter.setAttribute("aria-valuenow", String(value));
    }
    if (fill) {
      fill.style.setProperty("--meter-scale", String(value / 100));
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
      const available =
        this.#battleReady &&
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
          ? "Preparing"
          : stunned
            ? "Stunned"
            : available
              ? "Ready"
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
                  ? `${combatContent.characters[this.#quickPlayerId]!.name} wins the sandbox.`
                  : storyEncounter.victoryTitle
            : this.#isDevFight
              ? `${this.#devScenario?.name ?? "Development scenario"}: enemy side wins.`
              : this.#isQuickFight
                ? `${combatContent.characters[this.#quickEnemyId]!.name} takes the print.`
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
