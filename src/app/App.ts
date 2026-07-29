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
  Transition,
} from "../combat/types";
import {
  appendBattleTransition,
  createBattleReport,
  recordBattleDecision,
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
} from "../persistence/save";
import { addXp } from "../progression/levels";
import {
  buildForOwnedCharacter,
  equipPatch,
  findPatch,
  openingChargeBonus,
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

type Route =
  | "story"
  | "lineup"
  | "battle"
  | "collection"
  | "store"
  | "missions"
  | "tournament"
  | "settings";

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
  settings:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/></svg>',
  music:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l10-2v13M9 9l10-2M6 16c2 0 3 1 3 2s-1 2-3 2-3-1-3-2 1-2 3-2Zm10-2c2 0 3 1 3 2s-1 2-3 2-3-1-3-2 1-2 3-2Z"/></svg>',
} as const;

const CUP_COMPLETION_BONUS = 240;

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
  #route: Route = "story";
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
  #tournamentRoundIndex: 0 | 1 | 2 = 0;
  #cupCompletedThisBattle = false;
  #storyBattleNodeId: FirstRunBattleNodeId = "story.first-run.02";
  #battleReport: BattleReport | null = null;
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
      case "continue-story":
        this.continueStory();
        break;
      case "advance-story-node":
        this.advanceStoryNode();
        break;
      case "start-battle":
        this.startBattle(false);
        break;
      case "start-tournament":
        this.startTournamentBattle();
        break;
      case "cup-drop":
        if (command.dataset.drop) {
          this.chooseCupDrop(command.dataset.drop as CheapSeatsDrop);
        }
        break;
      case "battle-action":
        if (command.dataset.actionId) {
          this.playerAction(command.dataset.actionId);
        }
        break;
      case "battle-switch":
        if (command.dataset.index) {
          this.playerSwitch(Number(command.dataset.index));
        }
        break;
      case "retry-battle":
        if (this.#isTournamentFight) {
          this.startTournamentBattle();
        } else {
          this.startBattle(false);
        }
        break;
      case "leave-battle":
        this.navigate(
          this.#isTournamentFight && !this.#cupCompletedThisBattle
            ? "tournament"
            : "story",
        );
        break;
      case "toggle-music":
        this.#audio.toggle();
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
    if (target.name === "saveSlot") {
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
      target.name === "musicMuted" ||
      target.name === "sfxMuted" ||
      target.name === "dialogueMuted"
    ) {
      this.#preferences[target.name] = (target as HTMLInputElement).checked;
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

  private navigate(route: Route): void {
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
    const targetNodeId =
      route === "store"
        ? "story.first-run.03"
        : route === "missions"
          ? "story.first-run.04"
          : route === "tournament"
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

  private shellHeader(): string {
    return `
      <header class="top-rail">
        <button class="wordmark" data-route="story" aria-label="Riot Relics home">
          <span>RIOT</span><span>RELICS</span>
        </button>
        <nav class="primary-nav" aria-label="Game">
          ${this.navButton("story", "Story", ICONS.story)}
          ${this.navButton("collection", "Collection", ICONS.collection)}
          ${this.navButton("store", "Store", ICONS.store)}
          ${this.navButton("missions", "Missions", ICONS.missions)}
          ${this.navButton("tournament", "Cup", ICONS.tournament)}
        </nav>
        <div class="rail-tools">
          <span class="stamp-counter" aria-label="${this.#save.stamps} Stamps">
            <span aria-hidden="true">★</span>${this.#save.stamps}
          </span>
          <label class="difficulty-control">
            <span>Difficulty</span>
            <select name="difficulty">
              ${this.difficultyOptions(true)}
            </select>
          </label>
          <button
            class="icon-button"
            data-command="toggle-music"
            aria-label="${this.#audio.isPlaying ? "Pause" : "Play"} music"
            aria-pressed="${this.#audio.isPlaying}"
          >
            ${ICONS.music}
          </button>
          <button class="icon-button" data-route="settings" aria-label="Settings">
            ${ICONS.settings}
          </button>
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
    return `
      <nav class="mobile-nav" aria-label="Game">
        ${this.navButton("story", "Story", ICONS.story)}
        ${this.navButton("collection", "Relics", ICONS.collection)}
        ${this.navButton("store", "Store", ICONS.store)}
        ${this.navButton("missions", "Missions", ICONS.missions)}
        ${this.navButton("tournament", "Cup", ICONS.tournament)}
        ${this.navButton("settings", "Settings", ICONS.settings)}
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
    return (["easy", "normal", "hard", "brutal"] as const)
      .map(
        (difficulty) =>
          `<option value="${difficulty}" ${
            this.#preferences.difficulty === difficulty ? "selected" : ""
          }>${compact ? formatClass(difficulty) : descriptions[difficulty]}</option>`,
      )
      .join("");
  }

  private screenContent(): string {
    switch (this.#route) {
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
      case "tournament":
        return this.tournamentScreen();
      case "settings":
        return this.settingsScreen();
      case "battle":
        return "";
    }
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
    const run = this.#save.tournamentRun;
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
              return `<span><strong>${escapeHtml(character?.name ?? "Story loan")}</strong>${Math.round(ratio * 100)}% Case health</span>`;
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
            this save. Equipped Patches stay locked for the run.${
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
          <h1 id="settings-title">Set the noise. Keep the save.</h1>
          <p>
            Preferences live separately from progression, so wiping a run never
            forgets how loud you wanted it.
          </p>
        </div>
        <div class="settings-columns">
          <fieldset>
            <legend>Profile and play</legend>
            <label>
              <span>Collector name</span>
              <input name="playerName" value="${escapeHtml(this.#save.playerName)}" />
            </label>
            <label>
              <span>Save slot</span>
              <select name="saveSlot">
                ${([1, 2, 3] as const)
                  .map(
                    (slot) =>
                      `<option value="${slot}" ${
                        this.#save.slot === slot ? "selected" : ""
                      }>Slot ${slot}</option>`,
                  )
                  .join("")}
              </select>
            </label>
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
      <main class="battle-screen" id="main-content">
        <header class="battle-rail">
          <button class="battle-wordmark" data-command="leave-battle">RIOT RELICS</button>
          <span class="round-label">${
            this.#isTournamentFight
              ? `CHEAP SEATS · ROUND ${this.#tournamentRoundIndex + 1} · ${cheapSeatsEncounter(this.#tournamentRoundIndex).title.toUpperCase()}`
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
              aria-label="${this.#audio.isPlaying ? "Pause" : "Play"} music"
              aria-pressed="${this.#audio.isPlaying}"
            >
              ${ICONS.music}<span data-now-playing>Red Thread</span>
            </button>
            <button class="icon-button" data-route="settings" aria-label="Settings">
              ${ICONS.settings}
            </button>
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
          </section>
          <aside class="bench-rail enemy-bench" aria-label="Enemy Lineup">
            <h2>Enemy Lineup</h2>
            <div data-enemy-bench></div>
          </aside>
          <section class="action-tray" aria-label="Moves" data-action-tray></section>
        </section>
        <section
          class="battle-result"
          data-battle-result
          role="dialog"
          aria-modal="true"
          aria-labelledby="battle-result-title"
          hidden
        ></section>
      </main>
    `;

    const canvasParent =
      this.#root.querySelector<HTMLElement>("#battle-canvas");
    if (!canvasParent) {
      return;
    }
    void this.mountBattleGame(canvasParent);
    this.updateBattleView();
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
    });
  }

  private startTournamentBattle(): void {
    let run = this.#save.tournamentRun;
    if (!run) {
      run = createCheapSeatsRun(this.tournamentCaseBuilds());
      this.#save.tournamentRun = run;
      this.#save = saveSlot(localStorage, this.#save);
    } else if (run.caseBuilds.length === 0) {
      run = lockCheapSeatsCase(run, this.tournamentCaseBuilds());
      this.#save.tournamentRun = run;
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
    const run = this.#save.tournamentRun;
    if (!run || run.caseBuilds.length > 0) {
      return;
    }
    this.#save.tournamentRun = lockCheapSeatsCase(
      run,
      this.tournamentCaseBuilds(),
    );
    this.#save = saveSlot(localStorage, this.#save);
  }

  private chooseCupDrop(drop: CheapSeatsDrop): void {
    if (!this.#save.tournamentRun) {
      return;
    }
    this.#save.tournamentRun = applyCheapSeatsDrop(
      this.#save.tournamentRun,
      drop,
    );
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("Case drop locked. The next round is ready.");
  }

  private startBattle(tournament: boolean): void {
    const requestedStoryNodeId =
      !tournament && this.#route === "battle"
        ? this.#storyBattleNodeId
        : firstRunEncounter(this.#save.currentNodeId).nodeId;
    this.stopBattle();
    this.#isTournamentFight = tournament;
    this.#cupCompletedThisBattle = false;
    this.#storyBattleNodeId = requestedStoryNodeId;
    const storyEncounter = firstRunEncounter(requestedStoryNodeId);
    const tournamentRun = this.#save.tournamentRun ?? createCheapSeatsRun();
    const tournamentEncounter = cheapSeatsEncounter(this.#tournamentRoundIndex);
    const playerIds = tournament
      ? tournamentRun.caseBuilds.map((build) => build.characterId)
      : storyEncounter.playerCharacterIds;
    const enemyIds = tournament
      ? tournamentEncounter.enemyCharacterIds
      : storyEncounter.enemyCharacterIds;
    const playerBuilds = tournament
      ? tournamentRun.caseBuilds
      : this.playerBuilds(playerIds);
    const created = createBattle(
      {
        playerCharacterIds: playerIds,
        playerBuilds,
        enemyCharacterIds: enemyIds,
        playerStartingBar:
          22 +
          openingChargeBonus(playerBuilds) +
          (tournament ? tournamentRun.nextRoundChargeBonus : 0),
        seed: tournament ? tournamentEncounter.seed : storyEncounter.seed,
        difficulty: this.#preferences.difficulty,
      },
      combatContent,
    );
    const initialState = tournament
      ? restoreCaseHealth(created.state, tournamentRun)
      : created.state;
    this.#battle = initialState;
    this.#battleReport = createBattleReport(initialState, created.events, {
      mode: tournament ? "tournament" : "story",
      encounterId: tournament
        ? `tournament.cheap-seats.round-${tournamentEncounter.roundIndex + 1}`
        : storyEncounter.nodeId,
    });
    this.#battleReward = null;
    this.#eventLog = [
      tournament
        ? `${tournamentEncounter.title} is live. Case damage carries.`
        : "The print is live. Spend Charge or switch Relics.",
    ];
    this.#battleHandled = false;
    this.#route = "battle";
    this.render();
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
    cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = 0;
    this.#phaserGame?.destroy(true);
    this.#phaserGame = null;
    this.#battleScene = null;
    this.#battle = null;
    this.#battleReward = null;
    this.#battleReport = null;
  }

  private battleLoop = (now: number): void => {
    if (!this.#battle || this.#route !== "battle") {
      return;
    }
    const delta = Math.min(250, now - this.#lastFrameAt);
    this.#lastFrameAt = now;
    this.applyTransition(tickBattle(this.#battle, delta, combatContent));

    if (
      this.#battle.outcome === "active" &&
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

  private playerAction(actionId: string): void {
    if (!this.#battle) {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        "player",
        { kind: "action", actionId },
      );
    }
    this.applyTransition(
      requestAction(this.#battle, "player", actionId, combatContent),
    );
    this.updateBattleView();
  }

  private playerSwitch(index: number): void {
    if (!this.#battle) {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        "player",
        { kind: "switch", targetIndex: index },
      );
    }
    this.applyTransition(requestSwitch(this.#battle, "player", index));
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
      <div class="meter-label">
        <span>Charge</span>
        <strong>${Math.floor(team.bar)}/100</strong>
      </div>
      <div
        class="meter charge-meter"
        role="meter"
        aria-label="${side} Charge"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${Math.floor(team.bar)}"
      ><span style="--meter-scale:${team.bar / 100}"></span></div>
      <div class="status-row">${statusLabels || "<span>Clear</span>"}</div>
    `;
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
    const markup = active.actionIds
      .map((actionId, index) => {
        const action = combatContent.actions[actionId]!;
        const rule = POSITION_RULES[action.position];
        const available =
          this.#battle!.player.bar >= rule.cost &&
          !pending &&
          this.#battle!.outcome === "active";
        const estimate = predictedDamage(
          this.#battle!,
          "player",
          action.id,
          combatContent,
        );
        const tone = ["tomato", "yellow", "chalk"][index]!;
        return `
          <button
            class="action-label is-${tone}"
            data-command="battle-action"
            data-action-id="${action.id}"
            ${available ? "" : "disabled"}
          >
            <span class="action-position">${action.position}</span>
            <span class="action-copy">
              <strong>${action.name}</strong>
              <small>${action.description}</small>
            </span>
            <span class="action-numbers">
              <span><small>COST</small>${rule.cost}</span>
              <span><small>${estimate > 0 ? "HIT" : "FX"}</small>${
                estimate > 0 ? estimate : "—"
              }</span>
            </span>
            ${
              action.chargeMs > 0
                ? `<span class="charge-note">${(action.chargeMs / 1000).toFixed(1)}s charge</span>`
                : '<span class="charge-note">instant</span>'
            }
          </button>
        `;
      })
      .join("");
    this.setStableMarkup(tray, markup);
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
      button.setAttribute("aria-pressed", String(this.#audio.isPlaying));
      button.setAttribute(
        "aria-label",
        `${this.#audio.isPlaying ? "Pause" : "Play"} music`,
      );
    }
  }

  private handleBattleEnd(): void {
    if (!this.#battle || this.#battleHandled) {
      return;
    }
    this.#battleHandled = true;
    const won = this.#battle.outcome === "playerWon";
    const storyEncounter = firstRunEncounter(this.#storyBattleNodeId);
    const firstClear =
      !this.#isTournamentFight &&
      !this.#save.clearedNodeIds.includes(storyEncounter.nodeId);
    const reportEnemy = this.#battleReport?.participants.filter(
      (participant) => participant.side === "enemy",
    );
    const opponentLevel = Math.max(
      1,
      ...(reportEnemy?.map((participant) => participant.level) ?? [6]),
    );
    const reward = calculateBattleReward({
      won,
      firstClear,
      opponentLevel,
      difficulty: this.#preferences.difficulty,
    });
    this.#save.stamps += reward.stamps;
    const participantInstanceIds = new Set(
      this.#battleReport?.participants
        .filter((participant) => participant.side === "player")
        .map((participant) => participant.instanceId) ??
        this.#battle.player.squad.map((combatant) => combatant.instanceId),
    );
    const xpRecipients = this.#save.collection.filter((entry) =>
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
    this.#save.missionProgress["mission.invoice-denied"] =
      evaluateMissionProgress(
        "mission.invoice-denied",
        this.#save.missionProgress["mission.invoice-denied"] ?? 0,
        { type: "battleEnded", won, opponentCharacterIds: opponentIds },
      );
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
    if (won && !this.#isTournamentFight) {
      if (!this.#save.clearedNodeIds.includes(storyEncounter.nodeId)) {
        this.#save.clearedNodeIds.push(storyEncounter.nodeId);
      }
      this.#save.currentNodeId = storyEncounter.nextNodeId;
    } else if (this.#isTournamentFight) {
      const run = this.#save.tournamentRun ?? createCheapSeatsRun();
      const result = recordCheapSeatsResult(run, this.#battle, won);
      if (result.status === "lost") {
        this.#save.tournamentRun = null;
      } else if (result.status === "complete") {
        this.#save.tournamentRun = null;
        if (
          !this.#save.tournamentBadges.includes("badge.cheap-seats-champion")
        ) {
          this.#save.tournamentBadges.push("badge.cheap-seats-champion");
        }
        if (!this.#save.clearedNodeIds.includes("story.first-run.06")) {
          this.#save.clearedNodeIds.push("story.first-run.06");
        }
        this.#save.currentNodeId = "story.first-run.07";
        this.#save.stamps += CUP_COMPLETION_BONUS;
        this.#battleReward.cupCompletionBonus = CUP_COMPLETION_BONUS;
        this.#cupCompletedThisBattle = true;
      } else {
        this.#save.tournamentRun = result.run;
      }
    } else if (
      !won &&
      !this.#isTournamentFight &&
      !this.#save.lossesTo.includes(vengeanceTargetId)
    ) {
      this.#save.lossesTo.push(vengeanceTargetId);
    }
    this.#save = saveSlot(localStorage, this.#save);
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
              : storyEncounter.victoryTitle
            : "Partial credit. Full grudge."
        }</h2>
        <p>
          ${
            this.#battleReward.won
              ? this.#isTournamentFight
                ? this.#cupCompletedThisBattle
                  ? "The Case survived all three rounds. Your champion badge and final purse are recorded."
                  : "Case health is saved. Return to the Cup and choose one drop before the next round."
                : storyEncounter.victoryCopy
              : this.#isTournamentFight
                ? "The loss closes this Case. Partial XP is paid; retry opens a fresh run from Round 1."
                : "Losses still pay partial XP. Level, adjust, and make it personal."
          }
        </p>
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
                    : "Print it again"
                }</button>`
          }
          <button class="${
            this.#isTournamentFight && this.#battleReward.won
              ? "primary-action"
              : "secondary-action"
          }" data-command="leave-battle">${
            this.#isTournamentFight
              ? this.#cupCompletedThisBattle
                ? "See the ending print"
                : this.#battleReward.won
                  ? "Choose a Case drop"
                  : "Leave the Cup"
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
