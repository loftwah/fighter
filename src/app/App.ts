import type Phaser from "phaser";
import {
  isRouteAvailableInSession,
  routeIds,
  type Route,
  type SessionMode,
} from "./routes";
import {
  validateBattleLaunchRequest,
  type BattleLaunchRequest,
  type LineupConfirmation,
} from "./match-entry";
import {
  addFightWorkflowFighter,
  advanceFightWorkflow,
  removeFightWorkflowFighter,
  reorderFightWorkflowFighter,
  retreatFightWorkflow,
  openFightWorkflowSettings,
  setFightWorkflowLineupAccessory,
  setFightWorkflowRule,
  validateFightWorkflowDraft,
  type FightWorkflowDraft,
  type FightWorkflowSide,
} from "./fight-workflow";
import {
  adjustQuickFightBuildLevel,
  adjustQuickFightBuildStat,
  applyQuickFightPreset,
  cycleQuickFightBuildTier,
  createQuickFightWorkflow,
  launchQuickFightWorkflow,
  markQuickFightCustom,
  resolveQuickFightWorkflow,
  moveQuickFightBuildAction,
  quickFightPreset,
  setQuickFightBuildPatch,
  type QuickFightPresetId,
} from "./quick-fight-workflow";
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
  type TournamentWorkflowDraft,
} from "./tournament-workflow";
import {
  battleInputForMatch,
  createResolvedMatchConfiguration,
  type ResolvedMatchConfiguration,
  type ResolvedMatchFighter,
} from "./match-configuration";
import { AudioManager } from "../audio/manager";
import { findMusic } from "../audio/registry";
import {
  musicSeed,
  selectMusicTrack,
  type MusicContext,
} from "../audio/selection";
import {
  chooseAiCommand,
  createBattle,
  forfeitBattle,
  predictedDamage,
  predictedBaseDamage,
  requestAction,
  requestAccessory,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "../combat/engine";
import {
  actionChargeMsForCombatant,
  actionCostForCombatant,
  actionEffectsForCombatant,
  actionFormRequirementMet,
  actionPositionForCombatant,
  CHARACTER_TRAITS,
  difficultyAiDelay,
  isAlive,
  POSITION_RULES,
  teamChargePerSecond,
  TIER_MULTIPLIERS,
  traitSynergy,
  typeMultiplier,
} from "../combat/rules";
import type {
  ActionPosition,
  BattleCommand,
  BattleEvent,
  BattleState,
  CombatType,
  CombatantBuild,
  Difficulty,
  Side,
  StatBlock,
  StatusState,
  Transition,
} from "../combat/types";
import { createStandardBuild } from "../combat/standard-build";
import {
  appendBattleTick,
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
  quickFightDefaults,
  storyNodes,
} from "../content/initial-content";
import { startupSequence } from "../content/startup-content";
import { calculateBattleReward } from "../economy/rewards";
import type { BattleScene } from "../game/BattleScene";
import {
  aiDecisionReady,
  BATTLE_COUNTDOWN,
  battlePresentationDuration,
  battlePresentationStateCommitDelay,
  holdAiDecisionClock,
} from "../game/presentation-timing";
import { evaluateMissionProgress } from "../missions/evaluate";
import {
  nextImageFallback,
  resolveImageObjectPosition,
  resolveImagePath,
} from "../assets/registry";
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
  saveTournamentVictory,
  type Preferences,
  type SaveData,
  type TournamentCaseBuild,
  type TournamentRunData,
} from "../persistence/save";
import { addXp } from "../progression/levels";
import {
  adjustStatAllocation,
  ALLOCATABLE_STATS,
  enhanceOwnedAction,
  moveOwnedAction,
  setOwnedActionPosition,
} from "../progression/builds";
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
  cheapSeatsPlayerIds,
  lockCheapSeatsCase,
} from "../tournaments/cheap-seats";
import {
  createTournamentRun,
  exhaustTournamentAccessoriesFromEvents,
  normaliseTournamentRun,
  recordTournamentBattleResult,
  restartTournamentRun,
  resolveTournamentInterlude,
  selectTournamentDeployment,
} from "../tournaments/runner";
import {
  applyTournamentMatchInitialState,
  resolveTournamentMatch,
} from "../tournaments/match";
import {
  awardTournamentDefinitionTrophy,
  createTournamentVariant,
  resolveTournamentRunDefinition,
  tournamentDefinition,
  tournamentFightDefinition,
} from "../tournaments/catalog";
import {
  applyDevScenarioState,
  defaultDevScenario,
  devBuildsForSide,
  findDevScenario,
  validateDevScenario,
  type BattleControllerKind,
  type DevBattleScenario,
  type DevMoveTier,
} from "../dev/scenarios";
import {
  battleDecisionGuidance,
  battlePresentationGuidance,
  opponentDecisionGuidance,
} from "../ui/battle-guidance";
import { renderBenchMoveDisclosure } from "../ui/battle-bench";
import { escapeHtml, formatLabel, formatTime } from "../ui/format";
import {
  moveCategoryDetail,
  renderMoveCategoryKey,
} from "../ui/move-category-key";
import {
  renderStartupScreen,
  startupAdvanceDelay,
  type StartupStage,
} from "../ui/screens/startup-screen";
import { renderAchievementsScreen } from "../ui/screens/achievements-screen";
import {
  renderFighterSelectScreen,
  type FighterSelectInstance,
  type FighterSelectLineup,
  type FighterSelectSlotId,
} from "../ui/screens/fighter-select-screen";
import {
  renderFightConfirmationScreen,
  type FightConfirmationLineup,
  type FightConfirmationTrait,
} from "../ui/screens/fight-confirmation-screen";
import { renderProfileScreen } from "../ui/screens/profile-screen";
import { renderSettingsScreen } from "../ui/screens/settings-screen";
import { renderMainMenuScreen } from "../ui/screens/main-menu-screen";
import { renderStoryScreen } from "../ui/screens/story-screen";
import { renderLineupScreen } from "../ui/screens/lineup-screen";
import { renderCollectionScreen } from "../ui/screens/collection-screen";
import { renderStoreScreen } from "../ui/screens/store-screen";
import { renderMissionsScreen } from "../ui/screens/missions-screen";
import { renderTournamentScreen } from "../ui/screens/tournament-screen";
import {
  renderTournamentChoiceScreen,
  renderTournamentRosterScreen,
  renderTournamentSettingsScreen,
} from "../ui/screens/tournament-workflow-screen";
import { renderDevLabScreen } from "../ui/screens/dev-lab-screen";
import {
  renderMatchSettingsScreen,
  type MatchBuildSection,
  type MatchSettingsSection,
} from "../ui/screens/match-settings-screen";
import {
  renderBattleScreen,
  type BattleScreenModel,
} from "../ui/screens/battle-screen";
import { pauseKeyCommand } from "./pause-input";
import { renderDifficultyOptions } from "../ui/components/difficulty-options";
import { explainBattleResult } from "../ui/battle-result-explanation";
import {
  renderBattleResultScreen,
  type BattleResultMode,
  type BattleResultReward,
} from "../ui/screens/battle-result-screen";
import { traitBonusLabel } from "../ui/components/trait-synergy";
import {
  renderAppHeader,
  renderMobileNavigation,
  type AppShellModel,
} from "../ui/shell/app-shell";
import { renderStorageWarning } from "../ui/shell/storage-warning";
import {
  actionResolutionFeedback,
  actionOutputSummary,
  actionPreviewHeading,
  empowerStatusSummary,
  moveSealOutput,
} from "../ui/combat-output";
import {
  enemyHudPresentation,
  isPointNearRect,
  shouldReleaseEnemyHudForceCompact,
} from "../ui/enemy-hud";
import {
  loadDevExperiments,
  saveDevExperiments,
  type BattlePresentationStyle,
  type DevExperimentSelections,
} from "../dev/experiments";

interface BattleRewardView {
  won: boolean;
  stamps: number;
  xp: number;
  xpRecipients: number;
  firstClearBonus: number;
  cupCompletionBonus: number;
}

type PendingBattleLaunchRequest = Extract<
  BattleLaunchRequest,
  { kind: "story" | "tournament" }
>;

interface PendingFightSetup {
  request: PendingBattleLaunchRequest;
  returnRoute: "lineup" | "tournament";
}

const CUP_COMPLETION_BONUS = 240;
const DEV_TOOLS_ENABLED = import.meta.env.DEV;

function renderCombatStatus(status: StatusState): string {
  const seconds = Math.max(1, Math.ceil(status.remainingMs / 1_000));
  const label =
    status.kind === "empower"
      ? `Next Move +${Math.round(status.magnitude * 100)}%`
      : status.kind === "reflection"
        ? `Reflect ${Math.round(status.magnitude * 100)}% · ${seconds}s`
        : status.kind === "dodgeCounter"
          ? `Counter · ${status.remainingTriggers ?? 1}× · ${seconds}s`
          : status.kind === "form"
            ? `Beast form · ${seconds}s`
            : formatLabel(status.kind);
  const description =
    status.kind === "empower"
      ? `Next damaging Move gains ${Math.round(status.magnitude * 100)} percent Power; stacks combine`
      : status.kind === "reflection"
        ? `Reflect ${Math.round(status.magnitude * 100)} percent of health damage, ${seconds} seconds remaining`
        : status.kind === "dodgeCounter"
          ? `Dodge counter ready, ${status.remainingTriggers ?? 1} trigger remaining, ${seconds} seconds remaining`
          : status.kind === "form"
            ? `Beast form raises Power for ${seconds} more seconds`
            : `${formatLabel(status.kind)}, ${seconds} seconds remaining`;
  return `<span data-status-kind="${status.kind}" aria-label="${description}">${label}</span>`;
}

function transitionWasRejected(transition: Transition): boolean {
  return transition.events.some((event) => event.type === "commandRejected");
}

export class App {
  readonly #root: HTMLElement;
  #route: Route = "menu";
  #sessionMode: SessionMode = "menu";
  #preferences: Preferences;
  #devExperiments: DevExperimentSelections;
  #save: SaveData;
  #audio: AudioManager;
  #battle: BattleState | null = null;
  #battleScene: BattleScene | null = null;
  #phaserGame: Phaser.Game | null = null;
  #animationFrame = 0;
  #lastFrameAt = 0;
  #lastAiAt: Record<Side, number> = { player: 0, enemy: 0 };
  #lastUiAt = 0;
  #battleReward: BattleRewardView | null = null;
  #eventLog: string[] = [];
  #battleHandled = false;
  #isTournamentFight = false;
  #isQuickFight = false;
  #isDevFight = false;
  #quickPlayerIds: string[] = [...quickFightDefaults.playerIds];
  #quickEnemyIds: string[] = [...quickFightDefaults.enemyIds];
  #quickWorkflow: FightWorkflowDraft = createQuickFightWorkflow();
  #quickSettingsSection: MatchSettingsSection = "rules";
  #quickBuildInstanceId: string | null = null;
  #quickBuildSection: MatchBuildSection = "stats";
  #quickSelectSide: FightWorkflowSide = "player";
  #quickFighterPage = 1;
  #quickFighterSearch = "";
  #quickFighterFilter: CombatType | null = null;
  #quickTargetSlot: {
    side: FightWorkflowSide;
    slotId: FighterSelectSlotId;
    index: number;
  } | null = null;
  #quickAccessorySide: FightWorkflowSide | null = null;
  #pendingFocusSelector: string | null = null;
  #devScenario: DevBattleScenario | null = null;
  #devDraft: DevBattleScenario = structuredClone(defaultDevScenario);
  #battleControllers: Record<Side, BattleControllerKind> = {
    player: "human-local",
    enemy: "ai",
  };
  #battleReady = false;
  #battlePaused = false;
  #battleCountdownTimer = 0;
  #battleStateCommitTimer = 0;
  #battlePresentationLockedUntil = 0;
  #battleViewDirty = false;
  #pauseMenuOpen = false;
  #devInspectorOpen = false;
  #holdPauseActive = false;
  #battleOverlayOpener: HTMLElement | null = null;
  #battleTimeScale = 1;
  #battleInspectionTimer = 0;
  #battleInspectionTarget: HTMLElement | null = null;
  #suppressBattleInspectionClick: HTMLElement | null = null;
  #actionTraySignature = "";
  #recentBattleReports: BattleReport[] = [];
  #tournamentDraftDeploymentIds: string[] = [];
  #tournamentDraftStarterId: string | null = null;
  #tournamentDraftAccessoryId: string | null = "accessory.press-pass";
  #tournamentWorkflow: TournamentWorkflowDraft =
    createTournamentWorkflow("normal");
  #tournamentRosterPage = 1;
  #tournamentBuildInstanceId: string | null = null;
  #tournamentRoundIndex = 0;
  #tournamentFightTitle = "Tournament Fight";
  #tournamentName = "Tournament";
  #terminalTournamentRun: TournamentRunData | null = null;
  #tournamentChoiceResult: { title: string; message: string } | null = null;
  #pendingFightSetup: PendingFightSetup | null = null;
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
  #musicSessionSeed = Date.now() >>> 0;
  #musicSelectionSequence = 0;
  #musicContext: MusicContext | null = null;

  constructor(root: HTMLElement) {
    this.#root = root;
    for (const [property, assetId] of [
      ["--art-story", "image.story.first-run"],
      ["--art-tournament", "image.tournament.cheap-seats"],
    ] as const) {
      this.setCssImageWithFallback(property, assetId);
    }
    this.#preferences = loadPreferences(localStorage);
    this.#quickWorkflow = createQuickFightWorkflow(
      "quick.full-power",
      this.#preferences.difficulty,
    );
    this.#tournamentWorkflow = createTournamentWorkflow(
      this.#preferences.difficulty,
    );
    this.#devExperiments = loadDevExperiments(
      localStorage,
      DEV_TOOLS_ENABLED ? window.location.search : "",
    );
    this.#save = loadFirstRunSave(
      localStorage,
      loadActiveSaveSlot(localStorage),
    );
    this.normaliseLoadedTournamentRun();
    this.#storageWarning = loadStorageWarning(localStorage);
    this.#audio = new AudioManager(this.#preferences);
    this.#root.addEventListener("click", this.onClick);
    this.#root.addEventListener("change", this.onChange);
    this.#root.addEventListener("submit", this.onSubmit);
    this.#root.addEventListener("dragstart", this.onFighterDragStart);
    this.#root.addEventListener("dragover", this.onFighterDragOver);
    this.#root.addEventListener("drop", this.onFighterDrop);
    this.#root.addEventListener("dragend", this.onFighterDragEnd);
    this.#root.addEventListener("focusin", this.onBattleHudFocusChange);
    this.#root.addEventListener("focusout", this.onBattleHudFocusChange);
    this.#root.addEventListener("input", this.onInput);
    this.#root.addEventListener("pointerdown", this.onBattlePointerDown);
    this.#root.addEventListener("error", this.onMediaError, true);
    window.addEventListener("pointermove", this.onBattlePointerMove);
    window.addEventListener("pointerup", this.onBattlePointerEnd);
    window.addEventListener("pointercancel", this.onBattlePointerEnd);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onWindowBlur);
  }

  mount(): void {
    this.render();
    this.scheduleStartupAdvance();
  }

  destroy(): void {
    cancelAnimationFrame(this.#animationFrame);
    window.clearTimeout(this.#battleCountdownTimer);
    window.clearTimeout(this.#battleStateCommitTimer);
    window.clearTimeout(this.#battleInspectionTimer);
    window.clearTimeout(this.#startupTimer);
    this.#phaserGame?.destroy(true);
    this.#audio.destroy();
    this.#root.removeEventListener("click", this.onClick);
    this.#root.removeEventListener("change", this.onChange);
    this.#root.removeEventListener("submit", this.onSubmit);
    this.#root.removeEventListener("dragstart", this.onFighterDragStart);
    this.#root.removeEventListener("dragover", this.onFighterDragOver);
    this.#root.removeEventListener("drop", this.onFighterDrop);
    this.#root.removeEventListener("dragend", this.onFighterDragEnd);
    this.#root.removeEventListener("focusin", this.onBattleHudFocusChange);
    this.#root.removeEventListener("focusout", this.onBattleHudFocusChange);
    this.#root.removeEventListener("input", this.onInput);
    this.#root.removeEventListener("pointerdown", this.onBattlePointerDown);
    this.#root.removeEventListener("error", this.onMediaError, true);
    window.removeEventListener("pointermove", this.onBattlePointerMove);
    window.removeEventListener("pointerup", this.onBattlePointerEnd);
    window.removeEventListener("pointercancel", this.onBattlePointerEnd);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onWindowBlur);
  }

  private onBattlePointerDown = (event: PointerEvent): void => {
    if (
      this.#route !== "battle" ||
      event.pointerType === "mouse" ||
      event.button !== 0
    ) {
      return;
    }
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-battle-inspectable]")
        : null;
    if (!target) {
      return;
    }
    window.clearTimeout(this.#battleInspectionTimer);
    this.closeBattleInspections(target);
    this.#battleInspectionTarget = target;
    this.#battleInspectionTimer = window.setTimeout(() => {
      target.classList.add("is-inspecting");
      target.setAttribute("aria-expanded", "true");
      this.#suppressBattleInspectionClick = target;
      this.#battleInspectionTimer = 0;
    }, 480);
  };

  private onBattlePointerMove = (event: PointerEvent): void => {
    if (this.#route !== "battle" || event.pointerType !== "mouse") {
      return;
    }
    const shell = this.#root.querySelector<HTMLElement>(
      "[data-enemy-hud-shell]",
    );
    const console = shell?.querySelector<HTMLElement>(
      "[data-enemy-combat-console]",
    );
    if (!shell || !console) {
      return;
    }
    if (shell.dataset.hudForceCompact === "true") {
      const toggle = shell.querySelector<HTMLElement>(
        '[data-command="toggle-enemy-hud"]',
      );
      const pointerHasLeft = !isPointNearRect(
        event.clientX,
        event.clientY,
        console.getBoundingClientRect(),
        104,
      );
      if (
        !shouldReleaseEnemyHudForceCompact({
          forceCompact: true,
          pointerHasLeft,
          toggleFocused: document.activeElement === toggle,
        })
      ) {
        return;
      }
      shell.dataset.hudForceCompact = "false";
    }
    const wasNearby = shell.classList.contains("is-proximity-expanded");
    const isNearby = isPointNearRect(
      event.clientX,
      event.clientY,
      console.getBoundingClientRect(),
      wasNearby ? 104 : 72,
    );
    if (isNearby === wasNearby) {
      return;
    }
    shell.classList.toggle("is-proximity-expanded", isNearby);
    this.updateEnemyHudToggle(shell);
  };

  private updateEnemyHudToggle(shell: HTMLElement): void {
    const button = shell.querySelector<HTMLButtonElement>(
      '[data-command="toggle-enemy-hud"]',
    );
    const action = button?.querySelector<HTMLElement>(
      "[data-enemy-hud-toggle-action]",
    );
    if (!button || !action) {
      return;
    }
    const pinned = shell.dataset.hudPinned === "true";
    const nearby = shell.classList.contains("is-proximity-expanded");
    const focused = shell.matches(":focus-within");
    const presentation = enemyHudPresentation({
      focused,
      forceCompact: shell.dataset.hudForceCompact === "true",
      nearby,
      pinned,
    });
    button.setAttribute("aria-expanded", String(presentation.expanded));
    button.setAttribute("aria-label", presentation.ariaLabel);
    action.textContent = presentation.action;
  }

  private onBattleHudFocusChange = (event: FocusEvent): void => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-enemy-hud-shell]")
        : null;
    const related =
      event.relatedTarget instanceof Element
        ? event.relatedTarget.closest<HTMLElement>("[data-enemy-hud-shell]")
        : null;
    const shell = target ?? related;
    if (!shell) {
      return;
    }
    queueMicrotask(() => {
      const toggle = shell.querySelector<HTMLElement>(
        '[data-command="toggle-enemy-hud"]',
      );
      if (
        shell.dataset.hudForceCompact === "true" &&
        document.activeElement !== toggle
      ) {
        shell.dataset.hudForceCompact = "false";
      }
      this.updateEnemyHudToggle(shell);
    });
  };

  private toggleEnemyHud(shell: HTMLElement): void {
    const pinned = shell.dataset.hudPinned === "true";
    shell.dataset.hudPinned = String(!pinned);
    shell.dataset.hudForceCompact = String(pinned);
    if (pinned) {
      shell.classList.remove("is-proximity-expanded");
    }
    this.updateEnemyHudToggle(shell);
  }

  private onBattlePointerEnd = (): void => {
    window.clearTimeout(this.#battleInspectionTimer);
    this.#battleInspectionTimer = 0;
    const target = this.#battleInspectionTarget;
    this.#battleInspectionTarget = null;
    if (!target?.classList.contains("is-inspecting")) {
      return;
    }
    window.setTimeout(() => {
      this.closeBattleInspections();
    }, 180);
    window.setTimeout(() => {
      if (this.#suppressBattleInspectionClick === target) {
        this.#suppressBattleInspectionClick = null;
      }
    }, 650);
  };

  private closeBattleInspections(except?: HTMLElement): void {
    for (const target of this.#root.querySelectorAll<HTMLElement>(
      "[data-battle-inspectable].is-inspecting",
    )) {
      if (target === except) {
        continue;
      }
      target.classList.remove("is-inspecting");
      target.setAttribute("aria-expanded", "false");
    }
  }

  private toggleBattleInspection(target: HTMLElement): void {
    const opening = !target.classList.contains("is-inspecting");
    this.closeBattleInspections(opening ? target : undefined);
    target.classList.toggle("is-inspecting", opening);
    target.setAttribute("aria-expanded", String(opening));
  }

  private onMediaError = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.dataset.assetId) {
      return;
    }
    const pictureSources = target
      .closest("picture")
      ?.querySelectorAll("source");
    if (pictureSources?.length) {
      pictureSources.forEach((source) => source.remove());
      const authoredFallback = target.getAttribute("src");
      if (authoredFallback) {
        target.src = authoredFallback;
      }
      return;
    }
    const fallback = nextImageFallback(target.dataset.assetId);
    if (!fallback || fallback.id === target.dataset.assetId) {
      return;
    }
    target.dataset.assetId = fallback.id;
    target.src = fallback.path;
  };

  private setCssImageWithFallback(property: string, assetId: string): void {
    const visited = new Set<string>();
    const tryAsset = (id: string, path: string): void => {
      if (visited.has(id)) return;
      visited.add(id);
      this.#root.style.setProperty(property, `url("${path}")`);
      const probe = new Image();
      probe.addEventListener("error", () => {
        const fallback = nextImageFallback(id);
        if (fallback) {
          tryAsset(fallback.id, fallback.path);
        }
      });
      probe.src = path;
    };
    tryAsset(assetId, resolveImagePath(assetId));
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.#route === "quick" && this.#quickAccessorySide) {
      const tray = this.#root.querySelector<HTMLElement>(
        `[data-accessory-tray][data-side="${this.#quickAccessorySide}"]`,
      );
      if (event.key === "Escape") {
        event.preventDefault();
        this.#pendingFocusSelector = `[data-command="open-lineup-accessories"][data-side="${this.#quickAccessorySide}"]`;
        this.#quickAccessorySide = null;
        this.render();
        return;
      }
      if (event.key === "Tab" && tray) {
        const controls = Array.from(
          tray.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (
          first &&
          last &&
          ((event.shiftKey && document.activeElement === first) ||
            (!event.shiftKey && document.activeElement === last))
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
        return;
      }
    }
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
      this.#holdPauseActive = false;
      if (this.#devInspectorOpen) {
        this.#devInspectorOpen = false;
        this.#pauseMenuOpen = true;
        this.updateBattleOverlay();
      } else {
        this.toggleBattlePause();
      }
      return;
    }
    const pauseCommand = pauseKeyCommand({
      key: event.key,
      phase: "keydown",
      repeat: event.repeat,
      mode: this.#preferences.pauseKeyMode,
      holdActive: this.#holdPauseActive,
    });
    if (
      pauseCommand &&
      this.#battleReady &&
      !this.isBattlePresentationLocked() &&
      this.#battle.outcome === "active" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLSelectElement) &&
      !(event.target instanceof HTMLTextAreaElement) &&
      !(event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      event.preventDefault();
      if (pauseCommand === "toggle") {
        this.toggleBattlePause();
      } else if (pauseCommand === "pause" && !this.#battlePaused) {
        this.openBattlePause();
        this.#holdPauseActive = this.#battlePaused;
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

  private onKeyUp = (event: KeyboardEvent): void => {
    const command = pauseKeyCommand({
      key: event.key,
      phase: "keyup",
      repeat: event.repeat,
      mode: this.#preferences.pauseKeyMode,
      holdActive: this.#holdPauseActive,
    });
    if (command !== "resume") {
      return;
    }
    event.preventDefault();
    this.#holdPauseActive = false;
    if (
      this.#route === "battle" &&
      this.#battle?.outcome === "active" &&
      this.#pauseMenuOpen &&
      !this.#devInspectorOpen
    ) {
      this.closeBattleOverlaysAndResume();
    }
  };

  private onWindowBlur = (): void => {
    // A keyup may be lost when focus leaves the window. Keep the simulation
    // safely paused, but let Escape or a fresh P press work after focus returns.
    this.#holdPauseActive = false;
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
      this.closeBattleInspections();
      return;
    }
    if (this.#suppressBattleInspectionClick === command) {
      event.preventDefault();
      this.#suppressBattleInspectionClick = null;
      return;
    }
    switch (command.dataset.command) {
      case "advance-startup":
        this.advanceStartup();
        this.playMusicForCurrentContext();
        break;
      case "skip-startup":
        this.enterStartupLoading();
        this.playMusicForCurrentContext();
        break;
      case "enter-story":
        this.#sessionMode = "story";
        this.navigate("story");
        break;
      case "enter-quick":
        this.#sessionMode = "quick";
        while (this.#quickWorkflow.step !== "fighters") {
          this.#quickWorkflow = retreatFightWorkflow(this.#quickWorkflow).draft;
        }
        this.#quickSelectSide = "player";
        this.#quickTargetSlot = null;
        this.#quickAccessorySide = null;
        this.#quickFighterPage = 1;
        this.#quickFighterSearch = "";
        this.#quickFighterFilter = null;
        this.#quickSettingsSection = "rules";
        this.#quickBuildInstanceId =
          this.#quickWorkflow.selections.player.starterInstanceId;
        this.navigate("quick");
        break;
      case "enter-tournament":
        this.#sessionMode = "tournament";
        this.#tournamentWorkflow = enterTournamentStage(
          this.#tournamentWorkflow,
          "choice",
        );
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
        this.startStoryBattle();
        break;
      case "confirm-story-fight":
      case "confirm-tournament-fight":
        this.confirmPendingFightSetup();
        break;
      case "change-story-fighters":
      case "change-tournament-fighters": {
        const returnRoute = this.#pendingFightSetup?.returnRoute;
        this.#pendingFightSetup = null;
        if (returnRoute) this.#route = returnRoute;
        this.render();
        break;
      }
      case "start-quick-battle":
        this.startQuickBattle();
        break;
      case "target-fighter-side":
        if (
          command.dataset.side === "player" ||
          command.dataset.side === "opponent"
        ) {
          this.#quickSelectSide = command.dataset.side;
          this.#quickTargetSlot = null;
          this.#quickFighterPage = 1;
          this.render();
        }
        break;
      case "target-fighter-slot": {
        const side =
          command.dataset.side === "opponent" ? "opponent" : "player";
        const slotId = command.dataset.slot as FighterSelectSlotId | undefined;
        const index = Number(command.dataset.slotIndex);
        if (
          (slotId === "starter" ||
            slotId === "bench-1" ||
            slotId === "bench-2") &&
          Number.isInteger(index)
        ) {
          this.#quickSelectSide = side;
          this.#quickTargetSlot = { side, slotId, index };
          this.#quickFighterPage = 1;
          this.render();
        }
        break;
      }
      case "select-fighter":
        if (command.dataset.instanceId) {
          this.placeQuickFighter(
            command.dataset.instanceId,
            this.#quickSelectSide,
            this.#quickTargetSlot?.index ?? null,
          );
        }
        break;
      case "remove-fighter": {
        const instanceId = command.dataset.instanceId;
        const side =
          command.dataset.side === "opponent" ? "opponent" : "player";
        if (instanceId) {
          const slot = command.dataset.slot;
          const slotIndex = slot === "starter" ? 0 : slot === "bench-1" ? 1 : 2;
          this.#pendingFocusSelector = `[data-command="target-fighter-slot"][data-side="${side}"][data-slot="${slot ?? "bench-2"}"][data-slot-index="${slotIndex}"]`;
          if (
            this.#quickTargetSlot?.side === side &&
            this.quickOrderedSelection(side)[this.#quickTargetSlot.index] ===
              instanceId
          ) {
            this.#quickTargetSlot = null;
          }
          this.applyQuickWorkflowTransition(
            removeFightWorkflowFighter(this.#quickWorkflow, side, instanceId),
          );
        }
        break;
      }
      case "move-fighter": {
        const instanceId = command.dataset.instanceId;
        const side =
          command.dataset.side === "opponent" ? "opponent" : "player";
        const direction = Number(command.dataset.direction);
        const currentIndex = instanceId
          ? this.quickOrderedSelection(side).indexOf(instanceId)
          : -1;
        if (instanceId && currentIndex >= 0 && Math.abs(direction) === 1) {
          this.moveQuickFighter(side, instanceId, currentIndex + direction);
        }
        break;
      }
      case "continue-quick-fighters":
        this.#quickAccessorySide = null;
        this.applyQuickWorkflowTransition(
          advanceFightWorkflow(this.#quickWorkflow),
        );
        break;
      case "change-quick-fighters":
        {
          const first = retreatFightWorkflow(this.#quickWorkflow);
          this.applyQuickWorkflowTransition(
            first.draft.step === "settings"
              ? retreatFightWorkflow(first.draft)
              : first,
          );
        }
        break;
      case "open-quick-match-settings": {
        this.applyQuickWorkflowTransition(
          openFightWorkflowSettings(this.#quickWorkflow),
        );
        break;
      }
      case "back-from-match-settings":
        this.applyQuickWorkflowTransition(
          retreatFightWorkflow(this.#quickWorkflow),
        );
        break;
      case "review-quick-fight":
        this.applyQuickWorkflowTransition(
          advanceFightWorkflow(this.#quickWorkflow),
        );
        break;
      case "show-match-settings-section":
        if (
          command.dataset.section === "rules" ||
          command.dataset.section === "builds"
        ) {
          this.#quickSettingsSection = command.dataset.section;
          this.render();
        }
        break;
      case "show-match-build-section":
        if (
          command.dataset.section === "stats" ||
          command.dataset.section === "moves" ||
          command.dataset.section === "modification"
        ) {
          this.#quickBuildSection = command.dataset.section;
          this.render();
        }
        break;
      case "set-match-difficulty":
        if (command.dataset.value) {
          this.applyQuickCustomTransition(
            setFightWorkflowRule(
              this.#quickWorkflow,
              "difficulty",
              command.dataset.value as Difficulty,
            ),
          );
        }
        break;
      case "set-match-time":
        this.applyQuickNumberSetting(command, "timeLimitMs");
        break;
      case "set-match-charge":
        this.applyQuickNumberSetting(
          command,
          command.dataset.side === "opponent"
            ? "opponentStartingCharge"
            : "playerStartingCharge",
        );
        break;
      case "reroll-match-seed":
        this.applyQuickCustomTransition(
          setFightWorkflowRule(
            this.#quickWorkflow,
            "seed",
            crypto.getRandomValues(new Uint32Array(1))[0]!,
          ),
        );
        break;
      case "open-lineup-accessories":
        if (
          command.dataset.side === "player" ||
          command.dataset.side === "opponent"
        ) {
          this.#quickAccessorySide = command.dataset.side;
          this.#pendingFocusSelector = `[data-command="close-lineup-accessories"][data-side="${command.dataset.side}"]`;
          this.render();
        }
        break;
      case "close-lineup-accessories":
        this.#pendingFocusSelector = `[data-command="open-lineup-accessories"][data-side="${command.dataset.side === "opponent" ? "opponent" : "player"}"]`;
        this.#quickAccessorySide = null;
        this.render();
        break;
      case "set-lineup-accessory": {
        const side =
          command.dataset.side === "opponent" ? "opponent" : "player";
        this.#pendingFocusSelector = `[data-command="open-lineup-accessories"][data-side="${side}"]`;
        this.#quickAccessorySide = null;
        this.applyQuickWorkflowTransition(
          setFightWorkflowLineupAccessory(
            this.#quickWorkflow,
            side,
            command.dataset.accessoryId || null,
          ),
        );
        break;
      }
      case "select-match-build":
        this.#quickBuildInstanceId = command.dataset.instanceId ?? null;
        this.render();
        break;
      case "adjust-match-level":
        this.updateQuickBuild(command, "level");
        break;
      case "adjust-match-stat":
        this.updateQuickBuild(command, "stat");
        break;
      case "move-match-action":
        this.updateQuickBuild(command, "action");
        break;
      case "cycle-match-tier":
        this.updateQuickBuild(command, "tier");
        break;
      case "set-match-patch":
        this.updateQuickBuild(command, "patch");
        break;
      case "previous-fighter-page":
        this.#quickFighterPage = Math.max(1, this.#quickFighterPage - 1);
        this.render();
        break;
      case "next-fighter-page":
        this.#quickFighterPage += 1;
        this.render();
        break;
      case "go-to-fighter-page": {
        const page = Number(command.dataset.page);
        if (Number.isInteger(page) && page > 0) {
          this.#quickFighterPage = page;
          this.render();
        }
        break;
      }
      case "search-fighters": {
        event.preventDefault();
        const input = this.#root.querySelector<HTMLInputElement>(
          'input[name="fighterSearch"]',
        );
        this.#quickFighterSearch = input?.value.trim() ?? "";
        this.#quickFighterPage = 1;
        this.render();
        break;
      }
      case "open-fighter-filters":
        this.cycleQuickFighterFilter();
        break;
      case "start-tournament":
        this.startTournamentBattle();
        break;
      case "new-tournament":
        this.beginNewStandaloneTournament();
        break;
      case "resume-tournament":
        this.#tournamentChoiceResult = null;
        this.#tournamentDraftAccessoryId =
          this.activeTournamentRun()?.deploymentAccessoryId ?? null;
        this.#tournamentWorkflow = enterTournamentStage(
          this.#tournamentWorkflow,
          "deployment",
        );
        this.render();
        break;
      case "back-to-tournament-choice":
        this.#tournamentWorkflow = enterTournamentStage(
          this.#tournamentWorkflow,
          "choice",
        );
        this.render();
        break;
      case "back-to-tournament-roster":
        this.#tournamentWorkflow = enterTournamentStage(
          this.#tournamentWorkflow,
          "roster",
        );
        this.render();
        break;
      case "toggle-tournament-roster":
        if (command.dataset.instanceId) {
          this.updateTournamentRoster(command.dataset.instanceId);
        }
        break;
      case "configure-tournament-build":
        this.#tournamentBuildInstanceId = command.dataset.instanceId ?? null;
        this.render();
        break;
      case "adjust-tournament-build-level":
        if (command.dataset.instanceId) {
          const current =
            this.#tournamentWorkflow.builds[command.dataset.instanceId];
          const delta = Number(command.dataset.delta);
          if (current && Number.isFinite(delta)) {
            this.#tournamentWorkflow = setTournamentBuildLevel(
              this.#tournamentWorkflow,
              command.dataset.instanceId,
              current.level + delta,
            );
            this.render();
          }
        }
        break;
      case "adjust-tournament-build-stat":
        this.updateTournamentBuild(command, "stat");
        break;
      case "move-tournament-build-action":
        this.updateTournamentBuild(command, "action");
        break;
      case "cycle-tournament-build-tier":
        this.updateTournamentBuild(command, "tier");
        break;
      case "set-tournament-build-patch":
        this.updateTournamentBuild(command, "patch");
        break;
      case "previous-tournament-roster-page":
        this.#tournamentRosterPage = Math.max(
          1,
          this.#tournamentRosterPage - 1,
        );
        this.render();
        break;
      case "next-tournament-roster-page":
        this.#tournamentRosterPage += 1;
        this.render();
        break;
      case "continue-tournament-settings":
        try {
          this.#tournamentWorkflow = enterTournamentStage(
            this.#tournamentWorkflow,
            "settings",
          );
          this.render();
        } catch (error) {
          this.announce(
            error instanceof Error
              ? error.message
              : "Choose a Tournament Roster.",
          );
        }
        break;
      case "set-tournament-difficulty":
        if (
          command.dataset.value === "easy" ||
          command.dataset.value === "normal" ||
          command.dataset.value === "hard" ||
          command.dataset.value === "brutal"
        ) {
          this.#tournamentWorkflow = setTournamentDefault(
            this.#tournamentWorkflow,
            "difficulty",
            command.dataset.value,
          );
          this.render();
        }
        break;
      case "set-tournament-time":
        this.updateTournamentNumberSetting(
          "timeLimitMs",
          Number(command.dataset.value),
        );
        break;
      case "set-tournament-charge":
        this.updateTournamentNumberSetting(
          "playerStartingCharge",
          Number(command.dataset.value),
        );
        break;
      case "set-tournament-opponent-charge":
        this.updateTournamentNumberSetting(
          "opponentStartingCharge",
          Number(command.dataset.value),
        );
        break;
      case "set-tournament-fight-charge":
        this.updateTournamentFightOverride(command, "playerStartingCharge");
        break;
      case "set-tournament-fight-opponent-charge":
        this.updateTournamentFightOverride(command, "opponentStartingCharge");
        break;
      case "set-tournament-fight-time":
        this.updateTournamentFightOverride(command, "timeLimitMs");
        break;
      case "lock-tournament-roster":
        this.lockStandaloneTournamentRoster();
        break;
      case "select-tournament-accessory":
        this.#tournamentDraftAccessoryId =
          command.dataset.accessoryId?.trim() || null;
        if (this.activeTournamentRun()) {
          const selection = this.tournamentSelectionModel();
          this.setActiveTournamentRun(
            selectTournamentDeployment(
              selection.run!,
              selection.deployedInstanceIds,
              selection.starterInstanceId,
              this.#tournamentDraftAccessoryId,
            ),
          );
          this.#save = saveSlot(localStorage, this.#save);
        }
        this.render();
        this.announce(
          this.#tournamentDraftAccessoryId
            ? "Deployment Accessory selected."
            : "This deployment will enter without an Accessory.",
        );
        break;
      case "move-tournament-deployment":
        if (command.dataset.instanceId) {
          this.moveTournamentDeployment(
            command.dataset.instanceId,
            Number(command.dataset.direction),
          );
        }
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
      case "tournament-interlude-choice":
        if (command.dataset.choiceId) {
          this.chooseTournamentInterlude(command.dataset.choiceId);
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
      case "battle-accessory":
        if (command.getAttribute("aria-disabled") === "true") {
          this.toggleBattleInspection(command);
          break;
        }
        this.playerAccessory(
          command.dataset.side === "enemy" ? "enemy" : "player",
        );
        break;
      case "inspect-battle-detail":
        this.toggleBattleInspection(command);
        break;
      case "toggle-enemy-hud": {
        const shell = command.closest<HTMLElement>("[data-enemy-hud-shell]");
        if (shell) {
          this.toggleEnemyHud(shell);
        }
        break;
      }
      case "battle-pickup":
        if (command.dataset.pickupId) {
          this.playerPickup(
            command.dataset.side === "enemy" ? "enemy" : "player",
            command.dataset.pickupId,
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
      case "dev-set-speed":
        this.setDevBattleSpeed(Number(command.dataset.speed) || 1);
        break;
      case "hide-battle-overlay":
        this.hideBattleOverlayForCapture();
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
          if (
            !this.forfeitActiveTournamentBattle(
              "The fight will restart from the saved Tournament state.",
            )
          ) {
            return;
          }
          this.startTournamentBattle();
        } else if (this.#isQuickFight) {
          this.startQuickBattle(true);
        } else {
          this.startStoryBattle(true);
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
          this.restartTerminalTournament();
        } else if (this.#isDevFight && this.#devScenario) {
          this.startDevBattle(this.#devScenario);
        } else if (this.#isQuickFight) {
          this.startQuickBattle(true);
        } else {
          this.startStoryBattle(true);
        }
        break;
      case "leave-battle":
      case "quit-battle-parent":
        this.leaveBattleToParent();
        break;
      case "quit-battle-main":
        this.leaveBattleToMainMenu();
        break;
      case "forfeit-tournament":
        this.forfeitActiveTournamentRun();
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
      case "adjust-build-stat":
        this.adjustBuildStat(command);
        break;
      case "move-build-action":
        this.moveBuildAction(command);
        break;
      case "enhance-build-action":
        this.enhanceBuildAction(command);
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

  private buildEditingLocked(): boolean {
    if (!this.#save.tournamentRun && !this.#save.standaloneTournamentRun) {
      return false;
    }
    this.render();
    this.announce(
      "Character builds stay locked while a Tournament Roster is active.",
    );
    return true;
  }

  private persistBuildCollection(
    collection: SaveData["collection"],
    announcement: string,
  ): void {
    this.#save.collection = collection;
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce(announcement);
  }

  private adjustBuildStat(command: HTMLElement): void {
    if (this.buildEditingLocked()) {
      return;
    }
    const instanceId = command.dataset.instanceId;
    const stat = command.dataset.stat as keyof StatBlock | undefined;
    const delta = Number(command.dataset.delta);
    if (
      !instanceId ||
      !stat ||
      !ALLOCATABLE_STATS.includes(stat) ||
      (delta !== -1 && delta !== 1)
    ) {
      return;
    }
    try {
      this.persistBuildCollection(
        adjustStatAllocation(this.#save.collection, instanceId, stat, delta),
        `${formatLabel(stat)} allocation updated.`,
      );
    } catch (error) {
      this.announce(
        error instanceof Error ? error.message : "Build update failed.",
      );
    }
  }

  private moveBuildAction(command: HTMLElement): void {
    if (this.buildEditingLocked()) {
      return;
    }
    const instanceId = command.dataset.instanceId;
    const actionId = command.dataset.actionId;
    const direction = Number(command.dataset.direction);
    const owned = this.#save.collection.find(
      (entry) => entry.instanceId === instanceId,
    );
    const character = owned
      ? combatContent.characters[owned.characterId]
      : undefined;
    if (
      !instanceId ||
      !actionId ||
      !character ||
      (direction !== -1 && direction !== 1)
    ) {
      return;
    }
    try {
      this.persistBuildCollection(
        moveOwnedAction(
          this.#save.collection,
          instanceId,
          character,
          actionId,
          direction,
        ),
        `${combatContent.actions[actionId]?.name ?? "Move"} reordered.`,
      );
    } catch (error) {
      this.announce(
        error instanceof Error ? error.message : "Build update failed.",
      );
    }
  }

  private enhanceBuildAction(command: HTMLElement): void {
    if (this.buildEditingLocked()) {
      return;
    }
    const instanceId = command.dataset.instanceId;
    const actionId = command.dataset.actionId;
    const donorSelect =
      command
        .closest(".move-build-row")
        ?.querySelector<HTMLSelectElement>('select[name="moveDonor"]') ?? null;
    const donorInstanceId = donorSelect?.value;
    const owned = this.#save.collection.find(
      (entry) => entry.instanceId === instanceId,
    );
    const character = owned
      ? combatContent.characters[owned.characterId]
      : undefined;
    if (!instanceId || !actionId || !donorInstanceId || !character) {
      this.announce("Choose a matching duplicate before enhancing this Move.");
      return;
    }
    try {
      this.persistBuildCollection(
        enhanceOwnedAction(
          this.#save.collection,
          instanceId,
          character,
          actionId,
          donorInstanceId,
        ),
        `${combatContent.actions[actionId]?.name ?? "Move"} enhanced. ${donorInstanceId} was consumed.`,
      );
    } catch (error) {
      this.announce(
        error instanceof Error ? error.message : "Build update failed.",
      );
    }
  }

  private onChange = (event: Event): void => {
    const target = event.target;
    if (!(
      target instanceof HTMLInputElement || target instanceof HTMLSelectElement
    )) {
      return;
    }
    if (target.name === "quickPreset" && target instanceof HTMLSelectElement) {
      try {
        this.#quickWorkflow = applyQuickFightPreset(
          this.#quickWorkflow,
          target.value as QuickFightPresetId,
        );
        this.#quickBuildInstanceId =
          this.#quickWorkflow.selections.player.starterInstanceId;
        this.render();
        this.announce(
          `${quickFightPreset(target.value).name} applied to this Quick Fight.`,
        );
      } catch (error) {
        this.announce(
          error instanceof Error
            ? error.message
            : "That preset is unavailable.",
        );
      }
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
    if (
      (target.name === "tournamentDeployment" ||
        target.name === "tournamentStarter") &&
      target instanceof HTMLInputElement
    ) {
      this.updateTournamentSelection(target);
      return;
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
    if (target.name === "pauseKeyMode" && target instanceof HTMLSelectElement) {
      this.#preferences.pauseKeyMode =
        target.value === "toggle" ? "toggle" : "hold";
      this.persistPreferences();
      this.announce(
        this.#preferences.pauseKeyMode === "hold"
          ? "P pauses while held and resumes when released."
          : "P now toggles pause on each press.",
      );
    }
    if (
      DEV_TOOLS_ENABLED &&
      target.name === "experiment.battlePresentationStyle" &&
      target instanceof HTMLSelectElement
    ) {
      this.#devExperiments.battlePresentationStyle =
        target.value as BattlePresentationStyle;
      saveDevExperiments(localStorage, this.#devExperiments);
      this.announce(
        `Battle visual style set to ${target.selectedOptions[0]?.textContent ?? target.value}.`,
      );
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
      this.render();
      if (this.#preferences.musicPlaybackEnabled) {
        this.playMusicForCurrentContext();
      }
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
      this.#save.playerName = target.value.trim() || "Player";
      this.#save = saveSlot(localStorage, this.#save);
      this.render();
    }
    if (target.name === "equippedPatch") {
      if (this.buildEditingLocked()) {
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
            ? `${findPatch(patchId)?.name ?? "Modification"} equipped.`
            : "Modification removed.",
        );
      }
    }
    if (target.name === "movePosition") {
      if (this.buildEditingLocked()) {
        return;
      }
      const instanceId = target.dataset.instanceId;
      const actionId = target.dataset.actionId;
      const owned = this.#save.collection.find(
        (entry) => entry.instanceId === instanceId,
      );
      const character = owned
        ? combatContent.characters[owned.characterId]
        : undefined;
      if (!instanceId || !actionId || !character) {
        return;
      }
      try {
        this.persistBuildCollection(
          setOwnedActionPosition(
            this.#save.collection,
            instanceId,
            character,
            actionId,
            target.value as ActionPosition,
          ),
          `${combatContent.actions[actionId]?.name ?? "Move"} position updated.`,
        );
      } catch (error) {
        this.announce(
          error instanceof Error ? error.message : "Position update failed.",
        );
      }
    }
  };

  private onSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.fighterSearch) {
      return;
    }
    event.preventDefault();
    const input = form.elements.namedItem("fighterSearch");
    this.#quickFighterSearch =
      input instanceof HTMLInputElement ? input.value.trim() : "";
    this.#quickFighterPage = 1;
    this.render();
  };

  private onFighterDragStart = (event: DragEvent): void => {
    const target = event.target;
    const draggable =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-fighter-drag]")
        : null;
    if (!draggable || !event.dataTransfer) {
      return;
    }
    const payload = {
      kind: draggable.dataset.fighterDrag,
      instanceId: draggable.dataset.instanceId,
      characterId: draggable.dataset.characterId,
      side: draggable.dataset.side,
    };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-loftwah-fighter",
      JSON.stringify(payload),
    );
    draggable.classList.add("is-dragging");
  };

  private onFighterDragOver = (event: DragEvent): void => {
    const target = event.target;
    const slot =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-fighter-slot-target]")
        : null;
    if (!slot) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    this.#root
      .querySelectorAll(".is-drop-target")
      .forEach((element) => element.classList.remove("is-drop-target"));
    slot.classList.add("is-drop-target");
  };

  private onFighterDrop = (event: DragEvent): void => {
    const target = event.target;
    const slot =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-fighter-slot-target]")
        : null;
    if (!slot || !event.dataTransfer) {
      return;
    }
    event.preventDefault();
    const side = slot.dataset.side === "opponent" ? "opponent" : "player";
    const targetIndex = Number(slot.dataset.slotIndex);
    if (!Number.isInteger(targetIndex)) {
      return;
    }
    try {
      const payload = JSON.parse(
        event.dataTransfer.getData("application/x-loftwah-fighter"),
      ) as {
        kind?: string;
        instanceId?: string;
        characterId?: string;
        side?: string;
      };
      if (payload.kind === "selected" && payload.instanceId) {
        if (payload.side === side) {
          this.moveQuickFighter(side, payload.instanceId, targetIndex);
        }
      } else if (payload.kind === "catalogue" && payload.characterId) {
        const instanceId = this.nextQuickFighterInstance(
          side,
          payload.characterId,
        );
        if (instanceId) {
          this.#quickSelectSide = side;
          this.placeQuickFighter(instanceId, side, targetIndex);
        }
      }
    } catch {
      this.announce("That fighter could not be placed. Try again.");
    } finally {
      this.clearQuickFighterDragState();
    }
  };

  private onFighterDragEnd = (): void => {
    this.clearQuickFighterDragState();
  };

  private clearQuickFighterDragState(): void {
    this.#root
      .querySelectorAll(".is-dragging, .is-drop-target")
      .forEach((element) =>
        element.classList.remove("is-dragging", "is-drop-target"),
      );
  }

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
    this.#pendingFightSetup = null;
    this.#route = "menu";
    this.render();
    this.playMusicForCurrentContext();
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
      this.playMusicForCurrentContext();
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
      this.announce("That Character has not been revealed in First Run yet.");
      return;
    }
    if (this.#route === "battle" && route !== "battle") {
      this.stopBattle();
    }
    this.#pendingFightSetup = null;
    this.#route = route;
    this.render();
    this.playMusicForCurrentContext();
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
        this.grantVikingReward();
        this.completeStoryNodes(["story.first-run.00"], "story.first-run.01");
        this.navigate("story");
        break;
      case "story.first-run.01":
        this.grantVikingReward();
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
            if (ending.blockedBy) {
              const missionCount = ending.blockedBy.incompleteMissionIds.length;
              const trophyCount = ending.blockedBy.missingTrophyIds.length;
              this.announce(
                `First Run still needs ${missionCount} Mission${
                  missionCount === 1 ? "" : "s"
                } and ${trophyCount} Tournament Troph${
                  trophyCount === 1 ? "y" : "ies"
                }.`,
              );
            }
            break;
          }
          this.#save = saveSlot(localStorage, ending.save);
          this.render();
          this.announce(
            `First Run complete. ${FIRST_RUN_ENDING_REWARD} Stamps and the Ned Kelly rival file were added. Quick Fight is the end-game sandbox.`,
          );
        }
        break;
      case "story.first-run.02":
      default:
        this.navigate("lineup");
        break;
    }
  }

  private grantVikingReward(): void {
    if (
      this.#save.collection.some(
        (entry) => entry.characterId === "character.viking",
      )
    ) {
      return;
    }
    this.#save.collection.push(
      createOwnedCharacter("owned.viking.1", "character.viking", 7),
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
    const focusSelector =
      this.#pendingFocusSelector ??
      this.focusSelectorFor(document.activeElement);
    this.#pendingFocusSelector = null;
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
    if (focusSelector) {
      this.#root
        .querySelector<HTMLElement>(focusSelector)
        ?.focus({ preventScroll: true });
    }
  }

  private focusSelectorFor(element: Element | null): string | null {
    if (!(element instanceof HTMLElement) || !this.#root.contains(element)) {
      return null;
    }
    if (
      (element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement) &&
      element.name
    ) {
      return `[name="${CSS.escape(element.name)}"]`;
    }
    const command = element.dataset.command;
    if (!command) return null;
    const attributes = [
      "side",
      "instanceId",
      "characterId",
      "slot",
      "slotIndex",
      "section",
      "value",
      "delta",
      "stat",
      "actionId",
      "direction",
      "patchId",
      "accessoryId",
    ] as const;
    return attributes.reduce(
      (selector, key) => {
        const value = element.dataset[key];
        return value === undefined
          ? selector
          : `${selector}[data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${CSS.escape(value)}"]`;
      },
      `[data-command="${CSS.escape(command)}"]`,
    );
  }

  private appShellModel(): AppShellModel {
    return {
      route: this.#route,
      sessionMode: this.#sessionMode,
      save: this.#save,
      preferences: this.#preferences,
      musicTitle: this.#audio.currentTrackId
        ? findMusic(this.#audio.currentTrackId).title
        : null,
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
    const delay = startupAdvanceDelay(
      this.#startupStage,
      this.#preferences.reducedMotion,
    );
    if (delay === null) {
      return;
    }
    this.#startupTimer = window.setTimeout(() => {
      this.#startupStage = "ready";
      this.render();
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
    link.download = "loftwah-fighter-corrupt-save-backup.json";
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
    link.download = `loftwah-fighter-profile-${this.#save.slot}.json`;
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
    this.announce("All current Characters and Modifications granted.");
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

  private applyQuickWorkflowTransition(transition: {
    draft: FightWorkflowDraft;
    issues: readonly { message: string }[];
  }): void {
    this.#quickWorkflow = transition.draft;
    if (transition.issues[0]) {
      this.announce(transition.issues[0].message);
      return;
    }
    this.render();
  }

  private applyQuickCustomTransition(transition: {
    draft: FightWorkflowDraft;
    issues: readonly { message: string }[];
  }): void {
    if (transition.issues[0]) {
      this.announce(transition.issues[0].message);
      return;
    }
    this.#quickWorkflow = markQuickFightCustom(transition.draft);
    this.render();
  }

  private applyQuickNumberSetting(
    command: HTMLElement,
    field: "timeLimitMs" | "playerStartingCharge" | "opponentStartingCharge",
  ): void {
    const value = Number(command.dataset.value);
    if (!Number.isFinite(value)) return;
    this.applyQuickCustomTransition(
      setFightWorkflowRule(this.#quickWorkflow, field, value),
    );
  }

  private updateQuickBuild(
    command: HTMLElement,
    edit: "level" | "stat" | "action" | "tier" | "patch",
  ): void {
    const instanceId = command.dataset.instanceId;
    if (!instanceId) return;
    try {
      if (edit === "level") {
        const delta = Number(command.dataset.delta);
        if (delta !== -1 && delta !== 1) return;
        this.#quickWorkflow = adjustQuickFightBuildLevel(
          this.#quickWorkflow,
          instanceId,
          delta,
        );
      } else if (edit === "stat") {
        const delta = Number(command.dataset.delta);
        const stat = command.dataset.stat as keyof StatBlock | undefined;
        if (
          !stat ||
          !ALLOCATABLE_STATS.includes(stat) ||
          (delta !== -1 && delta !== 1)
        )
          return;
        this.#quickWorkflow = adjustQuickFightBuildStat(
          this.#quickWorkflow,
          instanceId,
          stat,
          delta,
        );
      } else if (edit === "action") {
        const actionId = command.dataset.actionId;
        const direction = Number(command.dataset.direction);
        if (!actionId || (direction !== -1 && direction !== 1)) return;
        this.#quickWorkflow = moveQuickFightBuildAction(
          this.#quickWorkflow,
          instanceId,
          actionId,
          direction,
        );
      } else if (edit === "tier") {
        if (!command.dataset.actionId) return;
        this.#quickWorkflow = cycleQuickFightBuildTier(
          this.#quickWorkflow,
          instanceId,
          command.dataset.actionId,
        );
      } else {
        this.#quickWorkflow = setQuickFightBuildPatch(
          this.#quickWorkflow,
          instanceId,
          command.dataset.patchId || null,
        );
      }
      this.render();
    } catch (error) {
      this.announce(
        error instanceof Error ? error.message : "Build update failed.",
      );
    }
  }

  private quickOrderedSelection(side: FightWorkflowSide): string[] {
    const selection = this.#quickWorkflow.selections[side];
    return selection.starterInstanceId
      ? [
          selection.starterInstanceId,
          ...selection.instanceIds.filter(
            (instanceId) => instanceId !== selection.starterInstanceId,
          ),
        ]
      : [...selection.instanceIds];
  }

  private nextQuickFighterInstance(
    side: FightWorkflowSide,
    characterId: string,
  ): string | null {
    const selected = this.#quickWorkflow.selections[side].instanceIds;
    return (
      this.#quickWorkflow.policy[side].eligibleFighters.find(
        (fighter) =>
          fighter.characterId === characterId &&
          !selected.includes(fighter.instanceId),
      )?.instanceId ?? null
    );
  }

  private placeQuickFighter(
    instanceId: string,
    side: FightWorkflowSide,
    targetIndex: number | null,
  ): void {
    let draft = this.#quickWorkflow;
    if (targetIndex !== null) {
      const replacedId = this.quickOrderedSelection(side)[targetIndex];
      if (replacedId) {
        const removed = removeFightWorkflowFighter(draft, side, replacedId);
        if (removed.issues[0]) {
          this.announce(removed.issues[0].message);
          return;
        }
        draft = removed.draft;
      }
    }
    const added = addFightWorkflowFighter(draft, side, instanceId);
    if (added.issues[0]) {
      this.announce(added.issues[0].message);
      return;
    }
    draft = added.draft;
    if (targetIndex !== null) {
      const reordered = reorderFightWorkflowFighter(
        draft,
        side,
        instanceId,
        targetIndex,
      );
      if (reordered.issues[0]) {
        this.announce(reordered.issues[0].message);
        return;
      }
      draft = reordered.draft;
    }
    this.#quickWorkflow = draft;
    this.#quickTargetSlot = null;
    this.render();
  }

  private moveQuickFighter(
    side: FightWorkflowSide,
    instanceId: string,
    targetIndex: number,
  ): void {
    const ordered = this.quickOrderedSelection(side);
    const boundedIndex = Math.max(0, Math.min(ordered.length - 1, targetIndex));
    const transition = reorderFightWorkflowFighter(
      this.#quickWorkflow,
      side,
      instanceId,
      boundedIndex,
    );
    if (transition.issues[0]) {
      this.announce(transition.issues[0].message);
      return;
    }
    const slotIds: readonly FighterSelectSlotId[] = [
      "starter",
      "bench-1",
      "bench-2",
    ];
    this.#quickWorkflow = transition.draft;
    this.#quickSelectSide = side;
    this.#quickTargetSlot = {
      side,
      slotId: slotIds[boundedIndex]!,
      index: boundedIndex,
    };
    this.render();
  }

  private quickFighterFromInstance(instanceId: string): FighterSelectInstance {
    const eligible = [
      ...this.#quickWorkflow.policy.player.eligibleFighters,
      ...this.#quickWorkflow.policy.opponent.eligibleFighters,
    ].find((fighter) => fighter.instanceId === instanceId);
    const character = eligible
      ? combatContent.characters[eligible.characterId]
      : undefined;
    if (!eligible || !character) {
      throw new Error(`Unknown Quick Fight instance: ${instanceId}`);
    }
    return {
      instanceId,
      characterId: character.id,
      name: character.name,
      portraitAssetId: character.portraitAssetId,
      typeLabel: formatLabel(character.typeId),
      traitLabels: character.traitIds.map(formatLabel),
      availability: "selected",
    };
  }

  private quickFighterLineup(
    side: FightWorkflowSide,
    label: string,
  ): FighterSelectLineup {
    const selection = this.#quickWorkflow.selections[side];
    const orderedIds = selection.starterInstanceId
      ? [
          selection.starterInstanceId,
          ...selection.instanceIds.filter(
            (instanceId) => instanceId !== selection.starterInstanceId,
          ),
        ]
      : [...selection.instanceIds];
    const slotDefinitions = [
      { id: "starter", label: "Starter" },
      { id: "bench-1", label: "Bench 1" },
      { id: "bench-2", label: "Bench 2" },
    ] as const;
    return {
      label,
      slots: slotDefinitions.map((slot, index) => ({
        ...slot,
        fighter: orderedIds[index]
          ? this.quickFighterFromInstance(orderedIds[index])
          : undefined,
      })),
      accessory: {
        selectedId: selection.accessoryId,
        options: Object.values(combatContent.accessories).map((accessory) => ({
          id: accessory.id,
          name: accessory.name,
          description: accessory.description,
          imageAssetId: accessory.imageAssetId,
        })),
      },
    };
  }

  private quickFighterCatalogue(): {
    fighters: FighterSelectInstance[];
    page: number;
    pageCount: number;
    rangeStart: number;
    rangeEnd: number;
    total: number;
  } {
    const side = this.#quickSelectSide;
    const selection = this.#quickWorkflow.selections[side];
    const search = this.#quickFighterSearch.toLocaleLowerCase();
    const eligible = this.#quickWorkflow.policy[side].eligibleFighters;
    const allFighters = Object.values(combatContent.characters)
      .filter((character) => {
        const matchesSearch =
          !search ||
          character.name.toLocaleLowerCase().includes(search) ||
          formatLabel(character.typeId).toLocaleLowerCase().includes(search) ||
          character.traitIds.some((trait) =>
            formatLabel(trait).toLocaleLowerCase().includes(search),
          );
        return (
          matchesSearch &&
          (!this.#quickFighterFilter ||
            character.typeId === this.#quickFighterFilter)
        );
      })
      .map((character): FighterSelectInstance => {
        const copies = eligible.filter(
          (fighter) => fighter.characterId === character.id,
        );
        const selectedCount = copies.filter((fighter) =>
          selection.instanceIds.includes(fighter.instanceId),
        ).length;
        const nextCopy = copies.find(
          (fighter) => !selection.instanceIds.includes(fighter.instanceId),
        );
        return {
          instanceId:
            nextCopy?.instanceId ?? copies.at(-1)?.instanceId ?? character.id,
          characterId: character.id,
          name: character.name,
          portraitAssetId: character.portraitAssetId,
          typeLabel: formatLabel(character.typeId),
          traitLabels: character.traitIds.map(formatLabel),
          statusLabels:
            selectedCount > 0
              ? [
                  selectedCount === 1
                    ? "In Lineup"
                    : `${selectedCount} in Lineup`,
                ]
              : undefined,
          availability: nextCopy ? "available" : "unavailable",
          unavailableReason: nextCopy
            ? undefined
            : "All three copies are selected",
        };
      });
    const pageSize = window.innerWidth <= 900 ? 6 : 8;
    const pageCount = Math.max(1, Math.ceil(allFighters.length / pageSize));
    const page = Math.min(Math.max(1, this.#quickFighterPage), pageCount);
    this.#quickFighterPage = page;
    const rangeStart = allFighters.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, allFighters.length);
    return {
      fighters: allFighters.slice(rangeStart - 1, rangeEnd),
      page,
      pageCount,
      rangeStart,
      rangeEnd,
      total: allFighters.length,
    };
  }

  private cycleQuickFighterFilter(): void {
    const types = Array.from(
      new Set(
        Object.values(combatContent.characters).map(
          (character) => character.typeId,
        ),
      ),
    );
    const currentIndex = this.#quickFighterFilter
      ? types.indexOf(this.#quickFighterFilter)
      : -1;
    this.#quickFighterFilter =
      currentIndex >= types.length - 1 ? null : types[currentIndex + 1]!;
    this.#quickFighterPage = 1;
    this.render();
  }

  private confirmationTraits(
    fighters: readonly ResolvedMatchFighter[],
  ): FightConfirmationTrait[] {
    const characters = fighters.map(
      (fighter) => combatContent.characters[fighter.characterId]!,
    );
    const synergy = traitSynergy(characters);
    return CHARACTER_TRAITS.filter((trait) => synergy.scores[trait] > 0).map(
      (trait) => ({
        label: `${formatLabel(trait)} · ${synergy.scores[trait]} point${synergy.scores[trait] === 1 ? "" : "s"}`,
        effect: traitBonusLabel(trait, synergy.bonuses),
      }),
    );
  }

  private resolvedBuildFacts(
    fighter: ResolvedMatchFighter,
    detailed: boolean,
  ): string[] {
    const character = combatContent.characters[fighter.characterId]!;
    const build = fighter.build;
    const patch = findPatch(build.equippedPatchId ?? null);
    if (!detailed) {
      const upgradedMoves = Object.values(build.actionTiers ?? {}).filter(
        (tier) => tier !== "stock",
      ).length;
      return [
        `Level ${build.level ?? character.level}`,
        ...(patch ? [`Modification: ${patch.name}`] : []),
        ...(upgradedMoves > 0
          ? [`${upgradedMoves} enhanced Move${upgradedMoves === 1 ? "" : "s"}`]
          : []),
      ];
    }
    const stats = build.statBonuses ?? {};
    const statFact = [
      ["Vitality", stats.health ?? 0],
      ["Power", stats.power ?? 0],
      ["Evasion", stats.evasion ?? 0],
      ["Fortune", stats.fortune ?? 0],
      ["Tempo", stats.tempo ?? 0],
    ]
      .map(([label, value]) => `${label} +${value}`)
      .join(" · ");
    const actionIds = build.actionIds ?? character.actionIds;
    const movesFact = actionIds
      .map((actionId) => {
        const action = combatContent.actions[actionId];
        const tier = build.actionTiers?.[actionId] ?? "stock";
        return `${action?.name ?? actionId} (${formatLabel(tier)})`;
      })
      .join(" → ");
    return [
      `Level ${build.level ?? character.level}`,
      statFact,
      `Moves: ${movesFact}`,
      `Modification: ${patch?.name ?? "None"}`,
    ];
  }

  private resolvedConfirmationLineup(
    match: ResolvedMatchConfiguration,
    side: FightWorkflowSide,
    label: string,
    detailedBuilds = false,
    statuses?: Readonly<Record<string, readonly string[]>>,
  ): FightConfirmationLineup {
    const resolvedSide = side === "player" ? match.player : match.opponent;
    return {
      label,
      members: resolvedSide.fighters.map((fighter, index) => ({
        instanceId: fighter.instanceId,
        characterId: fighter.characterId,
        position: index === 0 ? ("starter" as const) : ("bench" as const),
        buildFacts: this.resolvedBuildFacts(fighter, detailedBuilds),
        statuses: statuses?.[fighter.instanceId],
      })),
      accessoryId: resolvedSide.accessoryId,
      traits: this.confirmationTraits(resolvedSide.fighters),
    };
  }

  private effectiveOpeningCharge(
    match: ResolvedMatchConfiguration,
    side: FightWorkflowSide,
  ): number {
    const resolvedSide = side === "player" ? match.player : match.opponent;
    return resolvedSide.startingCharge;
  }

  private renderQuickFightWorkflow(): string {
    if (this.#quickWorkflow.step === "fighters") {
      const catalogue = this.quickFighterCatalogue();
      return renderFighterSelectScreen({
        mode: "quick",
        title: "Choose Fighters",
        context:
          "Choose up to 3 fighters for each side, then arrange the order.",
        activeSide: this.#quickSelectSide,
        canEditOpponent: true,
        player: this.quickFighterLineup("player", "Your Lineup"),
        opponent: this.quickFighterLineup("opponent", "Opponent Lineup"),
        catalogue: catalogue.fighters,
        pagination: catalogue,
        searchQuery: this.#quickFighterSearch,
        targetSlot: this.#quickTargetSlot ?? undefined,
        activeFilterLabel: this.#quickFighterFilter
          ? formatLabel(this.#quickFighterFilter)
          : "All Fighters",
        accessorySide: this.#quickAccessorySide ?? undefined,
        navigation: {
          parentLabel: "Main Menu",
          parentCommand: "main-menu",
        },
        continueCommand: "continue-quick-fighters",
        continueDisabled:
          validateFightWorkflowDraft(this.#quickWorkflow).length > 0,
      });
    }
    const preset = quickFightPreset(
      this.#quickWorkflow.settings.presetId ?? "quick.full-power",
    );
    if (this.#quickWorkflow.step === "settings") {
      return renderMatchSettingsScreen({
        draft: this.#quickWorkflow,
        preset,
        section: this.#quickSettingsSection,
        selectedBuildInstanceId: this.#quickBuildInstanceId,
        buildSection: this.#quickBuildSection,
        parentLabel: "Fighters",
        parentCommand: "back-from-match-settings",
        mainMenuCommand: "main-menu",
      });
    }
    const quickResolution = resolveQuickFightWorkflow(this.#quickWorkflow);
    const resolved = quickResolution.resolved;
    if (!resolved) {
      throw new Error(
        quickResolution.issues[0]?.message ??
          "The Quick Fight could not be resolved for review.",
      );
    }
    const match = resolved.match;
    const detailedBuilds = preset.kind === "custom";
    return renderFightConfirmationScreen({
      mode: "quick",
      title: preset.name,
      context: preset.rule,
      difficulty: match.difficulty,
      player: this.resolvedConfirmationLineup(
        match,
        "player",
        "Your Lineup",
        detailedBuilds,
      ),
      opponent: this.resolvedConfirmationLineup(
        match,
        "opponent",
        "Opponent Lineup",
        detailedBuilds,
      ),
      matchSettingsAvailable: true,
      decisionFacts: [
        {
          label: "Fight Clock",
          value: `${match.timeLimitMs / 1000} seconds`,
        },
        {
          label: "Effective Opening Charge",
          value: `${this.effectiveOpeningCharge(match, "player")} / ${this.effectiveOpeningCharge(match, "opponent")}`,
        },
      ],
      commands: {
        changeFighters: "change-quick-fighters",
        matchSettings: "open-quick-match-settings",
        startFight: "start-quick-battle",
        parent: "open-quick-match-settings",
        parentLabel: "Fight Settings",
        mainMenu: "main-menu",
      },
    });
  }

  private renderPendingFightSetup(): string {
    const pending = this.#pendingFightSetup;
    if (!pending) throw new Error("No resolved fight is waiting for review");
    const { request } = pending;
    const match = request.match;
    const statuses: Record<string, readonly string[]> = {};
    if (request.kind === "tournament") {
      const run = this.activeTournamentRun();
      for (const fighter of match.player.fighters) {
        const ratio = run?.healthRatios[fighter.instanceId] ?? 1;
        statuses[fighter.instanceId] = [
          `${Math.round(ratio * 100)}% carried Health`,
        ];
      }
      for (const fighter of match.opponent.fighters) {
        const ratio = run?.opponentHealthRatios[fighter.instanceId] ?? 1;
        statuses[fighter.instanceId] = [
          `${Math.round(ratio * 100)}% current Health`,
        ];
      }
    }
    const tournamentRun =
      request.kind === "tournament" ? this.activeTournamentRun() : null;
    const tournamentDefinitionForRequest = tournamentRun
      ? resolveTournamentRunDefinition(tournamentRun)
      : null;
    const tournamentNode =
      request.kind === "tournament"
        ? tournamentDefinitionForRequest?.nodes.find(
            (node) => node.id === request.nodeId && node.kind === "fight",
          )
        : null;
    const title =
      request.kind === "story"
        ? firstRunEncounter(request.encounterId).title
        : tournamentNode?.kind === "fight"
          ? tournamentNode.enemySquadName
          : tournamentFightDefinition(request.tournamentId, request.nodeId).node
              .enemySquadName;
    const context =
      request.kind === "story"
        ? "First Run"
        : `${tournamentDefinitionForRequest?.name ?? tournamentDefinition(request.tournamentId).name} · Round ${this.#tournamentRoundIndex + 1}`;
    return renderFightConfirmationScreen({
      mode: request.kind,
      title,
      context,
      difficulty: match.difficulty,
      player: this.resolvedConfirmationLineup(
        match,
        "player",
        "Your Lineup",
        false,
        statuses,
      ),
      opponent: this.resolvedConfirmationLineup(
        match,
        "opponent",
        request.kind === "tournament" ? "Round Rivals" : "Opponent Lineup",
        false,
        statuses,
      ),
      decisionFacts: [
        { label: "Fight Clock", value: `${match.timeLimitMs / 1000} seconds` },
        {
          label: "Effective Opening Charge",
          value: `${this.effectiveOpeningCharge(match, "player")} / ${this.effectiveOpeningCharge(match, "opponent")}`,
        },
      ],
      commands: {
        changeFighters:
          request.kind === "story"
            ? "change-story-fighters"
            : "change-tournament-fighters",
        startFight:
          request.kind === "story"
            ? "confirm-story-fight"
            : "confirm-tournament-fight",
        parent:
          request.kind === "story"
            ? "change-story-fighters"
            : "change-tournament-fighters",
        parentLabel: request.kind === "story" ? "Story" : "Tournament",
        mainMenu: "main-menu",
      },
    });
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
        return this.#pendingFightSetup?.request.kind === "story"
          ? this.renderPendingFightSetup()
          : renderLineupScreen({
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
        return this.renderQuickFightWorkflow();
      case "tournament": {
        if (this.#pendingFightSetup?.request.kind === "tournament") {
          return this.renderPendingFightSetup();
        }
        if (this.#sessionMode === "tournament") {
          if (this.#tournamentWorkflow.stage === "choice") {
            return renderTournamentChoiceScreen({
              tournamentId: this.#tournamentWorkflow.tournamentId,
              run: this.activeTournamentRun(),
              trophyCollected: this.#save.tournamentTrophyIds.includes(
                tournamentDefinition(this.#tournamentWorkflow.tournamentId)
                  .trophyId,
              ),
              result: this.#tournamentChoiceResult,
            });
          }
          if (this.#tournamentWorkflow.stage === "roster") {
            const pageSize = 6;
            const pageCount = Math.max(
              1,
              Math.ceil(this.#tournamentWorkflow.catalogue.length / pageSize),
            );
            this.#tournamentRosterPage = Math.min(
              Math.max(1, this.#tournamentRosterPage),
              pageCount,
            );
            const catalogue = this.#tournamentWorkflow.catalogue.map(
              (candidate) => ({
                ...candidate,
                ...this.#tournamentWorkflow.builds[candidate.instanceId],
                portraitAssetId: candidate.portraitAssetId,
              }),
            );
            return renderTournamentRosterScreen({
              tournamentId: this.#tournamentWorkflow.tournamentId,
              catalogue: catalogue.slice(
                (this.#tournamentRosterPage - 1) * pageSize,
                this.#tournamentRosterPage * pageSize,
              ),
              selectedCatalogue: catalogue.filter((candidate) =>
                this.#tournamentWorkflow.rosterInstanceIds.includes(
                  candidate.instanceId,
                ),
              ),
              selectedInstanceIds: this.#tournamentWorkflow.rosterInstanceIds,
              page: this.#tournamentRosterPage,
              pageCount,
              buildInstanceId: this.#tournamentBuildInstanceId,
            });
          }
          if (this.#tournamentWorkflow.stage === "settings") {
            return renderTournamentSettingsScreen({
              tournamentId: this.#tournamentWorkflow.tournamentId,
              settings: this.#tournamentWorkflow.settings,
              customVariant: this.#tournamentWorkflow.customVariant,
            });
          }
        }
        const selection = this.tournamentSelectionModel();
        return renderTournamentScreen({
          save: this.#save,
          sessionMode: this.#sessionMode,
          run: selection.run,
          caseBuilds: selection.caseBuilds,
          deployedInstanceIds: selection.deployedInstanceIds,
          starterInstanceId: selection.starterInstanceId,
          accessoryId:
            selection.run?.deploymentAccessoryId ??
            this.#tournamentDraftAccessoryId,
          locked: this.routeLocked("tournament"),
        });
      }
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
          devToolsEnabled: DEV_TOOLS_ENABLED,
          experiments: this.#devExperiments,
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
      const safeRoute: Route =
        this.#sessionMode === "story"
          ? "lineup"
          : this.#sessionMode === "quick"
            ? "quick"
            : this.#sessionMode === "tournament"
              ? "tournament"
              : "dev";
      this.navigate(safeRoute);
      this.announce(
        "Choose and confirm a valid Lineup before starting a fight.",
      );
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
    this.#lastAiAt = {
      player: this.#lastFrameAt,
      enemy: this.#lastFrameAt,
    };
    this.#animationFrame = requestAnimationFrame(this.battleLoop);
    this.playMusicForCurrentContext();
  }

  private battleScreenModel(): BattleScreenModel {
    const roundLabel = this.#isTournamentFight
      ? `${this.#tournamentName.toUpperCase()} · ROUND ${this.#tournamentRoundIndex + 1} · ${this.#tournamentFightTitle.toUpperCase()}`
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
      pauseKeyMode: this.#preferences.pauseKeyMode,
      devToolsEnabled: DEV_TOOLS_ENABLED,
      presentationStyle: this.#devExperiments.battlePresentationStyle,
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
    this.#phaserGame = createBattleGame(
      canvasParent,
      this.#battle,
      this.#devExperiments.battlePresentationStyle,
      (scene) => {
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
      },
    );
  }

  private startBattleCountdown(): void {
    window.clearTimeout(this.#battleCountdownTimer);
    this.#battleCountdownTimer = 0;
    this.#battleReady = false;
    this.setBattlePhase("countdown");
    // The arena is rendered before Phaser reports ready. Refresh the semantic
    // controls now so they cannot retain a stale "ready" state underneath the
    // visible countdown.
    this.updateBattleView();
    const panel = this.#root.querySelector<HTMLElement>(
      "[data-battle-countdown]",
    );
    const versus = this.#root.querySelector<HTMLElement>(
      "[data-battle-versus-intro]",
    );
    const label = panel?.querySelector<HTMLElement>("[data-countdown-label]");
    const note = panel?.querySelector<HTMLElement>("span");
    if (panel) {
      panel.hidden = true;
    }
    if (versus) {
      versus.hidden = false;
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
      if (versus) {
        versus.hidden = true;
      }
      if (panel) {
        panel.hidden = false;
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

    // Review hands directly to the VS plate while Phaser mounts. Once the
    // arena is ready, keep only a short authored beat before the countdown so
    // loading, VS, and countdown read as one continuous entrance.
    this.#battleCountdownTimer = window.setTimeout(
      showBeat,
      this.#preferences.reducedMotion ? 120 : 500,
    );
  }

  private activateBattle(): void {
    window.clearTimeout(this.#battleCountdownTimer);
    this.#battleCountdownTimer = 0;
    this.#battleReady = true;
    this.#battlePresentationLockedUntil = 0;
    this.#lastFrameAt = performance.now();
    this.#lastAiAt = {
      player: this.#lastFrameAt,
      enemy: this.#lastFrameAt,
    };
    this.setBattlePhase(this.#battlePaused ? "paused" : "active");
    const countdown = this.#root.querySelector<HTMLElement>(
      "[data-battle-countdown]",
    );
    if (countdown) {
      countdown.hidden = true;
    }
    const versus = this.#root.querySelector<HTMLElement>(
      "[data-battle-versus-intro]",
    );
    if (versus) {
      versus.hidden = true;
    }
    const pause = this.#root.querySelector<HTMLButtonElement>(
      '[data-command="pause-battle"]',
    );
    if (pause) {
      pause.disabled = false;
    }
    this.updateBattleView();
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
    const pause = screen.querySelector<HTMLButtonElement>(
      '[data-command="pause-battle"]',
    );
    if (pause) {
      pause.disabled = phase !== "active";
    }
    const presentation = screen.querySelector<HTMLElement>(
      "[data-battle-presentation-state]",
    );
    if (presentation) {
      presentation.hidden = phase !== "presenting";
    }
    if (phase !== "presenting") {
      const impactVerdict = screen.querySelector<HTMLElement>(
        "[data-battle-impact-verdict]",
      );
      if (impactVerdict) {
        impactVerdict.hidden = true;
      }
    }
  }

  private isBattlePresentationLocked(now = performance.now()): boolean {
    return this.#battlePresentationLockedUntil > now;
  }

  private lockBattlePresentation(
    durationMs: number,
    events: BattleEvent[],
  ): void {
    if (durationMs <= 0 || this.#battlePaused) {
      return;
    }
    this.#battlePresentationLockedUntil = Math.max(
      this.#battlePresentationLockedUntil,
      performance.now() + durationMs,
    );
    this.#battleViewDirty = true;
    const event = events.find(
      (candidate) =>
        (candidate.type === "actionStarted" ||
          candidate.type === "actionCharged") &&
        candidate.actionId,
    );
    const accessoryEvent = events.find(
      (candidate) => candidate.type === "accessoryActivated",
    );
    const presentation = this.#root.querySelector<HTMLElement>(
      "[data-battle-presentation-state]",
    );
    const sideLabel = this.#root.querySelector<HTMLElement>(
      "[data-battle-presentation-side]",
    );
    const title = this.#root.querySelector<HTMLElement>(
      "[data-battle-presentation-title]",
    );
    const instruction = this.#root.querySelector<HTMLElement>(
      "[data-battle-presentation-instruction]",
    );
    const impactVerdict = this.#root.querySelector<HTMLElement>(
      "[data-battle-impact-verdict]",
    );
    const action = event?.actionId
      ? combatContent.actions[event.actionId]
      : undefined;
    const accessory = accessoryEvent?.message
      ? combatContent.accessories[accessoryEvent.message]
      : undefined;
    const presentationEvent = event ?? accessoryEvent;
    const guidance = battlePresentationGuidance({
      side: presentationEvent?.side ?? "neutral",
      characterName: this.characterNameFromInstance(
        presentationEvent?.sourceId,
      ),
      moveName: action?.name ?? accessory?.name ?? "Battle update",
      kind: accessoryEvent && !event ? "accessory" : "move",
    });
    if (presentation) {
      presentation.dataset.presentationSide = guidance.side;
    }
    if (sideLabel) {
      sideLabel.textContent = guidance.title;
    }
    if (title) {
      title.textContent = guidance.detail;
    }
    if (instruction) {
      instruction.textContent = guidance.instruction;
    }
    if (impactVerdict) {
      if (action) {
        const feedback = actionResolutionFeedback(action, events);
        if (!feedback) {
          impactVerdict.hidden = true;
        } else {
          impactVerdict.dataset.impactTone = feedback.tone;
          impactVerdict.dataset.presentationSide = guidance.side;
          const label = impactVerdict.querySelector<HTMLElement>(
            "[data-battle-impact-label]",
          );
          const detail = impactVerdict.querySelector<HTMLElement>(
            "[data-battle-impact-detail]",
          );
          if (label) {
            label.textContent = feedback.label;
          }
          if (detail) {
            detail.textContent = feedback.detail;
          }
          impactVerdict.hidden = false;
        }
      } else {
        impactVerdict.hidden = true;
      }
    }
    this.setBattlePhase("presenting");
    this.updateAccessories();
    this.updatePickups();
  }

  private queueFightSetup(
    request: PendingBattleLaunchRequest,
    returnRoute: "lineup" | "tournament",
  ): void {
    const validated = validateBattleLaunchRequest(request).request;
    if (validated.kind !== "story" && validated.kind !== "tournament") {
      throw new Error("Only Story and Tournament fights enter this setup");
    }
    if (this.#route === "battle") {
      this.stopBattle();
    }
    this.#pendingFightSetup = { request: validated, returnRoute };
    this.#route = returnRoute;
    this.render();
    window.scrollTo(0, 0);
  }

  private confirmPendingFightSetup(): void {
    const pending = this.#pendingFightSetup;
    if (!pending) {
      this.announce("Review a resolved fight before starting Battle.");
      return;
    }
    this.#pendingFightSetup = null;
    this.startBattle(pending.request);
  }

  private beginNewStandaloneTournament(): void {
    if (
      this.activeTournamentRun() &&
      !window.confirm(
        "Start a new Tournament run? The unfinished run and its carried Health will be replaced.",
      )
    ) {
      return;
    }
    this.setActiveTournamentRun(null);
    this.#tournamentChoiceResult = null;
    if (this.#sessionMode === "tournament") {
      this.#tournamentWorkflow = enterTournamentStage(
        this.#tournamentWorkflow,
        "choice",
      );
    }
    this.#tournamentWorkflow = enterTournamentStage(
      createTournamentWorkflow(
        this.#preferences.difficulty,
        this.#tournamentWorkflow.tournamentId,
      ),
      "roster",
    );
    this.#tournamentRosterPage = 1;
    this.#tournamentBuildInstanceId = null;
    this.#tournamentDraftDeploymentIds = [];
    this.#tournamentDraftStarterId = null;
    this.#tournamentDraftAccessoryId = "accessory.press-pass";
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
  }

  private updateTournamentRoster(instanceId: string): void {
    try {
      this.#tournamentWorkflow = toggleTournamentRosterInstance(
        this.#tournamentWorkflow,
        instanceId,
      );
      if (
        !this.#tournamentWorkflow.rosterInstanceIds.includes(
          this.#tournamentBuildInstanceId ?? "",
        )
      ) {
        this.#tournamentBuildInstanceId =
          this.#tournamentWorkflow.rosterInstanceIds.at(-1) ?? null;
      }
      this.render();
      this.announce(
        `${this.#tournamentWorkflow.rosterInstanceIds.length} of 6 Tournament Roster places filled.`,
      );
    } catch (error) {
      this.announce(
        error instanceof Error
          ? error.message
          : "Tournament Roster could not be changed.",
      );
    }
  }

  private updateTournamentNumberSetting(
    field: "timeLimitMs" | "playerStartingCharge" | "opponentStartingCharge",
    value: number,
  ): void {
    if (!Number.isFinite(value)) return;
    this.#tournamentWorkflow = setTournamentDefault(
      this.#tournamentWorkflow,
      field,
      value,
    );
    this.render();
  }

  private updateTournamentFightOverride(
    command: HTMLElement,
    field: "timeLimitMs" | "playerStartingCharge" | "opponentStartingCharge",
  ): void {
    const nodeId = command.dataset.nodeId;
    if (!nodeId) return;
    const value = command.dataset.value ? Number(command.dataset.value) : null;
    this.#tournamentWorkflow = setTournamentFightOverride(
      this.#tournamentWorkflow,
      nodeId,
      field,
      value,
    );
    this.render();
  }

  private updateTournamentBuild(
    command: HTMLElement,
    edit: "stat" | "action" | "tier" | "patch",
  ): void {
    const instanceId = command.dataset.instanceId;
    if (!instanceId) return;
    try {
      if (edit === "stat") {
        const stat = command.dataset.stat as keyof StatBlock | undefined;
        const delta = Number(command.dataset.delta);
        if (!stat || (delta !== -1 && delta !== 1)) return;
        this.#tournamentWorkflow = adjustTournamentBuildStat(
          this.#tournamentWorkflow,
          instanceId,
          stat,
          delta,
        );
      } else if (edit === "action") {
        const actionId = command.dataset.actionId;
        const direction = Number(command.dataset.direction);
        if (!actionId || (direction !== -1 && direction !== 1)) return;
        this.#tournamentWorkflow = moveTournamentBuildAction(
          this.#tournamentWorkflow,
          instanceId,
          actionId,
          direction,
        );
      } else if (edit === "tier") {
        if (!command.dataset.actionId) return;
        this.#tournamentWorkflow = cycleTournamentBuildTier(
          this.#tournamentWorkflow,
          instanceId,
          command.dataset.actionId,
        );
      } else {
        this.#tournamentWorkflow = setTournamentBuildPatch(
          this.#tournamentWorkflow,
          instanceId,
          command.dataset.patchId || null,
        );
      }
      this.render();
    } catch (error) {
      this.announce(
        error instanceof Error
          ? error.message
          : "Tournament build update failed.",
      );
    }
  }

  private lockStandaloneTournamentRoster(): void {
    try {
      const roster = lockedTournamentRoster(this.#tournamentWorkflow);
      const deployed = roster.slice(0, 3).map((build) => build.instanceId);
      const preset = tournamentDefinition(
        this.#tournamentWorkflow.tournamentId,
      );
      const definition = this.#tournamentWorkflow.customVariant
        ? createTournamentVariant(preset.id, {
            id: `${preset.id}.variant.${Date.now()}`,
            matchDefaults: {
              difficulty: this.#tournamentWorkflow.settings.difficulty,
              timeLimitMs: this.#tournamentWorkflow.settings.timeLimitMs,
              playerStartingCharge:
                this.#tournamentWorkflow.settings.playerStartingCharge,
              opponentStartingCharge:
                this.#tournamentWorkflow.settings.opponentStartingCharge,
            },
            fightOverrides: this.#tournamentWorkflow.settings.fightOverrides,
          })
        : preset;
      let run = createTournamentRun({
        definition,
        roster,
        origin: "standalone",
        deployedInstanceIds: deployed,
        starterInstanceId: deployed[0] ?? null,
        deploymentAccessoryId: this.#tournamentDraftAccessoryId,
        defaults: {
          difficulty: this.#tournamentWorkflow.settings.difficulty,
          timeLimitMs: this.#tournamentWorkflow.settings.timeLimitMs,
          playerStartingCharge:
            this.#tournamentWorkflow.settings.playerStartingCharge,
          opponentStartingCharge:
            this.#tournamentWorkflow.settings.opponentStartingCharge,
        },
        fightOverrides: this.#tournamentWorkflow.settings.fightOverrides,
      });
      run = selectTournamentDeployment(
        run,
        deployed,
        deployed[0] ?? null,
        this.#tournamentDraftAccessoryId,
      );
      this.setActiveTournamentRun(run);
      this.#tournamentDraftDeploymentIds = [...deployed];
      this.#tournamentDraftStarterId = deployed[0] ?? null;
      this.#tournamentWorkflow = enterTournamentStage(
        this.#tournamentWorkflow,
        "deployment",
      );
      this.#save = saveSlot(localStorage, this.#save);
      this.render();
      this.announce("Tournament Roster locked. Prepare the first deployment.");
    } catch (error) {
      this.announce(
        error instanceof Error
          ? error.message
          : "Tournament Roster could not be locked.",
      );
    }
  }

  private startTournamentBattle(): void {
    let run = this.activeTournamentRun();
    if (!run) {
      const selection = this.tournamentSelectionModel();
      const definition = tournamentDefinition(
        this.#tournamentWorkflow.tournamentId,
      );
      run = createTournamentRun({
        definition,
        roster: selection.caseBuilds,
        origin: this.#sessionMode === "story" ? "story" : "standalone",
        deployedInstanceIds: selection.deployedInstanceIds,
        starterInstanceId: selection.starterInstanceId,
        deploymentAccessoryId: this.#tournamentDraftAccessoryId,
      });
      run = selectTournamentDeployment(
        run,
        selection.deployedInstanceIds,
        selection.starterInstanceId,
        this.#tournamentDraftAccessoryId,
      );
      this.setActiveTournamentRun(run);
      this.#save = saveSlot(localStorage, this.#save);
    } else {
      run =
        run.caseBuilds.length === 0
          ? lockCheapSeatsCase(run, this.tournamentCaseBuilds())
          : normaliseTournamentRun(run);
      this.setActiveTournamentRun(run);
      this.#save = saveSlot(localStorage, this.#save);
    }
    if (run.phase !== "ready") {
      this.navigate("tournament");
      return;
    }
    this.#terminalTournamentRun = null;
    this.#tournamentRoundIndex = run.roundIndex;
    const definition = resolveTournamentRunDefinition(run);
    this.#tournamentName = definition.name;
    const resolved = resolveTournamentMatch({
      definition,
      run,
      content: combatContent,
      preferredDifficulty: this.#preferences.difficulty,
    });
    const match = resolved.match;
    const tournamentNode = definition.nodes.find(
      (node) => node.id === resolved.nodeId && node.kind === "fight",
    );
    if (!tournamentNode || tournamentNode.kind !== "fight") {
      throw new Error("Current Tournament fight is not registered.");
    }
    const orderedPlayerInstanceIds = match.player.fighters.map(
      (fighter) => fighter.instanceId,
    );
    const playerStarterInstanceId = orderedPlayerInstanceIds[0]!;
    const opponentInstanceIds = match.opponent.fighters.map(
      (fighter) => fighter.instanceId,
    );
    const playerAccessoryId = match.player.accessoryId;
    const opponentAccessoryId = match.opponent.accessoryId;
    this.#tournamentFightTitle = tournamentNode.enemySquadName;
    this.queueFightSetup(
      {
        kind: "tournament",
        tournamentId: run.tournamentId,
        origin: run.origin,
        nodeId: tournamentNode.id,
        lineup: this.createLineupConfirmation({
          id: `lineup.${run.tournamentId}.round-${run.roundIndex + 1}`,
          playerInstanceIds: orderedPlayerInstanceIds,
          playerStarterInstanceId,
          opponentInstanceIds,
          playerAccessoryId,
          opponentAccessoryId,
        }),
        match,
      },
      "tournament",
    );
  }

  private normaliseLoadedTournamentRun(): void {
    let changed = false;
    for (const field of ["tournamentRun", "standaloneTournamentRun"] as const) {
      const run = this.#save[field];
      if (!run) {
        continue;
      }
      const normalised =
        run.caseBuilds.length === 0
          ? lockCheapSeatsCase(
              run,
              this.tournamentCaseBuilds(
                field === "tournamentRun" ? "story" : "standalone",
              ),
            )
          : normaliseTournamentRun(run);
      if (JSON.stringify(normalised) !== JSON.stringify(run)) {
        this.#save[field] = normalised;
        changed = true;
      }
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

  private tournamentSelectionModel(): {
    run: TournamentRunData | null;
    caseBuilds: TournamentCaseBuild[];
    deployedInstanceIds: string[];
    starterInstanceId: string | null;
  } {
    const run = this.activeTournamentRun();
    const caseBuilds = run?.caseBuilds.length
      ? run.caseBuilds
      : this.tournamentCaseBuilds();
    const validIds = new Set(caseBuilds.map((build) => build.instanceId));
    if (
      !run &&
      (this.#tournamentDraftDeploymentIds.length === 0 ||
        this.#tournamentDraftDeploymentIds.some(
          (instanceId) => !validIds.has(instanceId),
        ))
    ) {
      this.#tournamentDraftDeploymentIds = caseBuilds
        .slice(0, 3)
        .map((build) => build.instanceId);
      this.#tournamentDraftStarterId =
        this.#tournamentDraftDeploymentIds[0] ?? null;
    }
    return {
      run,
      caseBuilds,
      deployedInstanceIds: run
        ? run.deployedInstanceIds
        : this.#tournamentDraftDeploymentIds,
      starterInstanceId: run
        ? run.activeInstanceId
        : this.#tournamentDraftStarterId,
    };
  }

  private updateTournamentSelection(target: HTMLInputElement): void {
    const selection = this.tournamentSelectionModel();
    if (selection.run?.phase === "interlude") {
      this.render();
      return;
    }
    let deployedInstanceIds = [...selection.deployedInstanceIds];
    let starterInstanceId = selection.starterInstanceId;
    if (target.name === "tournamentDeployment") {
      if (target.checked) {
        if (
          deployedInstanceIds.length >= 3 ||
          deployedInstanceIds.includes(target.value)
        ) {
          this.render();
          return;
        }
        deployedInstanceIds.push(target.value);
      } else {
        if (deployedInstanceIds.length <= 1) {
          this.render();
          this.announce("Deploy at least one living Tournament Character.");
          return;
        }
        deployedInstanceIds = deployedInstanceIds.filter(
          (instanceId) => instanceId !== target.value,
        );
        if (starterInstanceId === target.value) {
          starterInstanceId = deployedInstanceIds[0] ?? null;
        }
      }
    } else if (deployedInstanceIds.includes(target.value)) {
      starterInstanceId = target.value;
    }

    try {
      if (selection.run) {
        this.setActiveTournamentRun(
          selectTournamentDeployment(
            selection.run,
            deployedInstanceIds,
            starterInstanceId,
            this.#tournamentDraftAccessoryId,
          ),
        );
        this.#save = saveSlot(localStorage, this.#save);
      } else {
        this.#tournamentDraftDeploymentIds = deployedInstanceIds;
        this.#tournamentDraftStarterId =
          starterInstanceId ?? deployedInstanceIds[0] ?? null;
      }
      this.render();
      this.announce(
        `${deployedInstanceIds.length} Tournament Character${
          deployedInstanceIds.length === 1 ? "" : "s"
        } deployed.`,
      );
    } catch (error) {
      this.render();
      this.announce(
        error instanceof Error ? error.message : "Tournament setup failed.",
      );
    }
  }

  private moveTournamentDeployment(
    instanceId: string,
    direction: number,
  ): void {
    const selection = this.tournamentSelectionModel();
    const currentIndex = selection.deployedInstanceIds.indexOf(instanceId);
    if (currentIndex < 0 || (direction !== -1 && direction !== 1)) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= selection.deployedInstanceIds.length) {
      return;
    }
    const reordered = [...selection.deployedInstanceIds];
    reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, instanceId);
    try {
      if (selection.run) {
        this.setActiveTournamentRun(
          selectTournamentDeployment(
            selection.run,
            reordered,
            selection.starterInstanceId,
            this.#tournamentDraftAccessoryId,
          ),
        );
        this.#save = saveSlot(localStorage, this.#save);
      } else {
        this.#tournamentDraftDeploymentIds = reordered;
      }
      this.render();
      this.announce("Tournament deployment order updated.");
    } catch (error) {
      this.announce(
        error instanceof Error
          ? error.message
          : "Deployment order could not be changed.",
      );
    }
  }

  private setActiveTournamentRun(run: TournamentRunData | null): void {
    if (this.#sessionMode === "story") {
      this.#save.tournamentRun = run;
    } else {
      this.#save.standaloneTournamentRun = run;
    }
  }

  private chooseTournamentInterlude(choiceId: string): void {
    const run = this.activeTournamentRun();
    if (!run) {
      return;
    }
    this.setActiveTournamentRun(
      resolveTournamentInterlude(
        resolveTournamentRunDefinition(run),
        run,
        choiceId,
      ),
    );
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("Roster drop locked. The next round is ready.");
  }

  private createLineupConfirmation(
    confirmation: LineupConfirmation,
  ): LineupConfirmation {
    return confirmation;
  }

  private startStoryBattle(retry = false): void {
    const encounterId = retry
      ? this.#storyBattleNodeId
      : firstRunEncounter(this.#save.currentNodeId).nodeId;
    const encounter = firstRunEncounter(encounterId);
    const playerBuilds = this.playerBuilds(encounter.playerCharacterIds);
    const playerInstanceIds = playerBuilds.map(
      (build, index) =>
        build.instanceId ??
        `player.${index}.${encounter.playerCharacterIds[index]}`,
    );
    const opponentInstanceIds = encounter.enemyCharacterIds.map(
      (characterId, index) => `enemy.${index}.${characterId}`,
    );
    const match = createResolvedMatchConfiguration(
      {
        id: `match.${encounterId}`,
        mode: "story",
        presetId: encounterId,
        difficulty: this.#preferences.difficulty,
        timeLimitMs: encounter.matchSettings.timeLimitMs,
        seed: encounter.seed,
        player: {
          fighters: playerBuilds.map((build, index) => ({
            instanceId: playerInstanceIds[index]!,
            characterId: encounter.playerCharacterIds[index]!,
            build: { ...build, instanceId: playerInstanceIds[index]! },
          })),
          accessoryId: encounter.matchSettings.playerAccessoryId,
          startingCharge: encounter.matchSettings.playerStartingCharge,
        },
        opponent: {
          fighters: encounter.enemyCharacterIds.map((characterId, index) => ({
            instanceId: opponentInstanceIds[index]!,
            characterId,
            build: this.baselineBuild(characterId, opponentInstanceIds[index]!),
          })),
          accessoryId: encounter.matchSettings.opponentAccessoryId,
          startingCharge: encounter.matchSettings.opponentStartingCharge,
        },
      },
      combatContent,
    );
    this.queueFightSetup(
      {
        kind: "story",
        storyId: "story.first-run",
        encounterId,
        lineup: this.createLineupConfirmation({
          id: `lineup.${encounterId}`,
          playerInstanceIds,
          playerStarterInstanceId:
            playerBuilds[0]?.instanceId ??
            `player.0.${encounter.playerCharacterIds[0]}`,
          opponentInstanceIds,
          playerAccessoryId: encounter.matchSettings.playerAccessoryId,
          opponentAccessoryId: encounter.matchSettings.opponentAccessoryId,
        }),
        match,
      },
      "lineup",
    );
  }

  private startQuickBattle(retry = false): void {
    if (!retry && this.#route !== "quick") {
      return;
    }
    const result = launchQuickFightWorkflow(this.#quickWorkflow, (resolved) => {
      const snapshot = resolved.snapshot;
      this.#quickPlayerIds = [...resolved.playerCharacterIds];
      this.#quickEnemyIds = [...resolved.opponentCharacterIds];
      this.startBattle({
        kind: "quick",
        draftId: snapshot.draftId,
        lineup: snapshot.lineup,
        match: resolved.match,
      });
    });
    if (!result.resolved) {
      this.announce(
        result.issues[0]?.message ??
          "Check both Lineups before starting the fight.",
      );
    }
  }

  private confirmTournamentForfeit(): boolean {
    return window.confirm(
      "Forfeit this entire Tournament? The current run and carried Health will be lost.",
    );
  }

  private forfeitActiveTournamentRun(): void {
    if (!this.activeTournamentRun() || !this.confirmTournamentForfeit()) {
      return;
    }
    this.setActiveTournamentRun(null);
    this.#tournamentChoiceResult = {
      title: "Tournament forfeited",
      message:
        "The run has ended. Its carried Health and exhausted Accessories were cleared.",
    };
    if (this.#sessionMode === "tournament") {
      this.#tournamentWorkflow = enterTournamentStage(
        this.#tournamentWorkflow,
        "choice",
      );
    }
    this.#save = saveSlot(localStorage, this.#save);
    this.render();
    this.announce("Tournament forfeited. The run has ended.");
  }

  private restartTerminalTournament(): void {
    const source = this.#terminalTournamentRun;
    if (!source) {
      this.navigate("tournament");
      return;
    }
    const restarted = restartTournamentRun(
      resolveTournamentRunDefinition(source),
      source,
    );
    this.setActiveTournamentRun(restarted);
    this.#terminalTournamentRun = null;
    this.#tournamentDraftDeploymentIds = [...restarted.deployedInstanceIds];
    this.#tournamentDraftStarterId = restarted.activeInstanceId;
    this.#tournamentDraftAccessoryId = restarted.deploymentAccessoryId ?? null;
    this.#tournamentWorkflow = enterTournamentStage(
      this.#tournamentWorkflow,
      "deployment",
    );
    this.#save = saveSlot(localStorage, this.#save);
    this.stopBattle();
    this.#route = "tournament";
    this.render();
    this.announce(
      "Tournament restarted with the same locked Roster and rules.",
    );
  }

  private forfeitActiveTournamentBattle(nextStep: string): boolean {
    if (
      !this.#battle ||
      !this.#isTournamentFight ||
      this.#battle.outcome !== "active"
    ) {
      return false;
    }
    if (
      !window.confirm(
        `Forfeit this fight? Current Health and the opponent's remaining Health will be saved. ${nextStep}`,
      )
    ) {
      return false;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        "player",
        { kind: "forfeit" },
      );
    }
    this.applyTransition(forfeitBattle(this.#battle, "player"));
    this.handleBattleEnd();
    return true;
  }

  private canLeaveCurrentBattle(destinationLabel: string): boolean {
    if (!this.#battle || this.#battle.outcome !== "active") return true;
    if (this.#isTournamentFight) {
      return this.forfeitActiveTournamentBattle(
        `You will then return to ${destinationLabel}.`,
      );
    }
    return window.confirm(
      `Quit this fight and return to ${destinationLabel}? This unfinished fight will be discarded.`,
    );
  }

  private leaveBattleToParent(): void {
    if (!this.canLeaveCurrentBattle(this.battleParentLabel())) return;
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
  }

  private leaveBattleToMainMenu(): void {
    if (!this.canLeaveCurrentBattle("Main Menu")) return;
    this.exitToMainMenu();
  }

  private battleParentLabel(): string {
    if (this.#isDevFight) return "Developer Lab";
    if (this.#isQuickFight) return "Review Fight";
    if (this.#isTournamentFight) return "Tournament";
    return "Story";
  }

  private startDevBattle(scenarioDefinition: DevBattleScenario): void {
    if (!DEV_TOOLS_ENABLED) {
      return;
    }
    const validated = validateDevScenario(scenarioDefinition);
    this.#sessionMode = "dev";
    this.#devScenario = structuredClone(validated);
    this.startBattle(
      {
        kind: "development",
        scenarioId: validated.id,
        bypass: "validated-dev-scenario",
      },
      validated,
    );
  }

  private startBattle(
    request: BattleLaunchRequest,
    devScenario: DevBattleScenario | null = null,
  ): void {
    const launch = validateBattleLaunchRequest(request);
    request = launch.request;
    if (
      (request.kind === "development" &&
        (!devScenario || devScenario.id !== request.scenarioId)) ||
      (request.kind !== "development" && devScenario)
    ) {
      throw new Error(
        "Development Battle launch must match one validated scenario",
      );
    }
    const tournament = request.kind === "tournament";
    const quick = request.kind === "quick";
    const requestedStoryNodeId =
      request.kind === "story"
        ? request.encounterId
        : firstRunEncounter(this.#save.currentNodeId).nodeId;
    this.stopBattle();
    this.#isTournamentFight = tournament;
    if (request.kind === "tournament") {
      const activeRun = this.activeTournamentRun();
      this.#tournamentName = activeRun
        ? resolveTournamentRunDefinition(activeRun).name
        : tournamentDefinition(request.tournamentId).name;
    }
    this.#isQuickFight = quick;
    this.#isDevFight = request.kind === "development";
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
    const storyEncounter = firstRunEncounter(requestedStoryNodeId);
    if (request.kind === "story") {
      this.#storyBattleNodeId = storyEncounter.nodeId;
    }
    const match = request.kind === "development" ? null : request.match;
    const playerBuilds = devScenario
      ? devBuildsForSide(devScenario, "player")
      : match!.player.fighters.map((fighter) => fighter.build);
    const enemyBuilds = devScenario
      ? devBuildsForSide(devScenario, "enemy")
      : match!.opponent.fighters.map((fighter) => fighter.build);
    const created = createBattle(
      devScenario
        ? {
            playerCharacterIds: devScenario.playerCharacterIds,
            playerBuilds,
            enemyCharacterIds: devScenario.enemyCharacterIds,
            enemyBuilds,
            playerStartingBar:
              devScenario.playerStartingBar + openingChargeBonus(playerBuilds),
            enemyStartingBar:
              devScenario.enemyStartingBar + openingChargeBonus(enemyBuilds),
            playerAccessoryId:
              devScenario.playerAccessoryId === null
                ? undefined
                : (devScenario.playerAccessoryId ?? "accessory.press-pass"),
            enemyAccessoryId:
              devScenario.enemyAccessoryId === null
                ? undefined
                : (devScenario.enemyAccessoryId ?? "accessory.dead-air"),
            seed: devScenario.seed,
            difficulty: devScenario.difficulty,
            timeLimitMs: devScenario.timeLimitMs,
          }
        : battleInputForMatch(match!),
      combatContent,
    );
    const initialState = devScenario
      ? applyDevScenarioState(created.state, devScenario)
      : tournament
        ? applyTournamentMatchInitialState(created.state, match!)
        : created.state;
    this.#battle = initialState;
    this.#battleReport = createBattleReport(initialState, created.events, {
      mode: launch.reportMode,
      encounterId: launch.encounterId,
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
    instanceIds?: readonly string[],
  ): CombatantBuild[] {
    return characterIds.map((characterId, index) => {
      const definition = combatContent.characters[characterId];
      if (!definition) {
        throw new Error(`Missing character definition: ${characterId}`);
      }
      const build = createStandardBuild(definition, side, index);
      return instanceIds?.[index]
        ? { ...build, instanceId: instanceIds[index] }
        : build;
    });
  }

  private baselineBuild(
    characterId: string,
    instanceId: string,
  ): CombatantBuild {
    const definition = combatContent.characters[characterId];
    if (!definition)
      throw new Error(`Missing character definition: ${characterId}`);
    return {
      instanceId,
      level: definition.level,
      statBonuses: { health: 0, power: 0, evasion: 0, fortune: 0, tempo: 0 },
      actionIds: definition.actionIds,
      actionTiers: Object.fromEntries(
        definition.actionIds.map((actionId) => [actionId, "stock"]),
      ),
      interruptionResistance: 0,
      equippedPatchId: null,
    };
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
        throw new Error(`Missing Tournament Roster Character at ${index}`);
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
        actionPositions: { ...build.actionPositions },
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
    window.clearTimeout(this.#battleStateCommitTimer);
    window.clearTimeout(this.#battleInspectionTimer);
    this.#animationFrame = 0;
    this.#battleCountdownTimer = 0;
    this.#battleStateCommitTimer = 0;
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
    this.#holdPauseActive = false;
    this.#battleOverlayOpener = null;
    this.#battleInspectionTimer = 0;
    this.#battleInspectionTarget = null;
    this.#suppressBattleInspectionClick = null;
    this.#actionTraySignature = "";
    this.#musicContext = null;
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
      this.#lastAiAt = {
        player: holdAiDecisionClock(now),
        enemy: holdAiDecisionClock(now),
      };
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
    this.applyTransition(tickBattle(this.#battle, delta, combatContent), delta);
    if (this.isBattlePresentationLocked(now)) {
      this.#lastAiAt = {
        player: holdAiDecisionClock(now),
        enemy: holdAiDecisionClock(now),
      };
      this.#animationFrame = requestAnimationFrame(this.battleLoop);
      return;
    }

    for (const side of ["player", "enemy"] as const) {
      if (
        this.#battle.outcome === "active" &&
        this.#battleControllers[side] === "ai" &&
        aiDecisionReady(
          this.#lastAiAt[side],
          now,
          difficultyAiDelay(this.#battle.difficulty),
        )
      ) {
        this.#lastAiAt[side] = now;
        const command = chooseAiCommand(this.#battle, combatContent, side);
        if (command) {
          this.applyAiCommand(side, command);
          if (this.isBattlePresentationLocked()) {
            break;
          }
        }
      }
    }
    if (this.isBattlePresentationLocked(now)) {
      this.#lastAiAt = {
        player: holdAiDecisionClock(now),
        enemy: holdAiDecisionClock(now),
      };
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

  private applyAiCommand(side: Side, command: BattleCommand): void {
    if (!this.#battle) {
      return;
    }
    let transition: Transition;
    switch (command.kind) {
      case "action":
        transition = requestAction(
          this.#battle,
          side,
          command.actionId,
          combatContent,
        );
        break;
      case "switch":
        transition = requestSwitch(this.#battle, side, command.targetIndex);
        break;
      case "accessory":
        transition = requestAccessory(this.#battle, side, combatContent);
        break;
      case "pickup":
        transition = requestPickup(this.#battle, side, command.pickupId);
        break;
      case "forfeit":
        transition = forfeitBattle(this.#battle, side);
        break;
    }
    if (transitionWasRejected(transition)) {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        side,
        command,
      );
    }
    this.applyTransition(transition);
  }

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
    this.#holdPauseActive = false;
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = false;
    this.setBattlePaused(false);
    this.updateBattleOverlay();
    this.#battleOverlayOpener = null;
    if (focusTarget?.isConnected) {
      focusTarget.focus({ preventScroll: true });
    }
  }

  private hideBattleOverlayForCapture(): void {
    if (!DEV_TOOLS_ENABLED || !this.#battle || !this.#battlePaused) {
      return;
    }
    this.#pauseMenuOpen = false;
    this.#devInspectorOpen = false;
    this.updateBattleOverlay();
    this.#battleOverlayOpener = null;
    this.announce("Frozen battle view. Press Escape to reopen the pause menu.");
  }

  private setDevBattleSpeed(requestedScale: number): void {
    if (!DEV_TOOLS_ENABLED || !this.#battle) {
      return;
    }
    const allowedScales = [0.25, 0.5, 1, 2] as const;
    const scale = allowedScales.includes(
      requestedScale as (typeof allowedScales)[number],
    )
      ? requestedScale
      : 1;
    this.#battleTimeScale = scale;
    this.#lastFrameAt = performance.now();
    if (this.#battleReport) {
      this.#battleReport = recordBattleDebugAction(
        this.#battleReport,
        this.#battle,
        { action: "setSpeed", amount: scale },
      );
    }
    this.updateBattleOverlay();
    this.announce(`Simulation speed set to ${scale} times.`);
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
    this.#lastAiAt = {
      player: this.#lastFrameAt,
      enemy: this.#lastFrameAt,
    };
    this.#battleScene?.setSimulationPaused(paused);
    this.setBattlePhase(paused ? "paused" : "active");
    this.updateBattleView();
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
      this.applyTransition(
        tickBattle(this.#battle, sliceMs, combatContent),
        sliceMs,
      );
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
                <div><dt>Speed</dt><dd>${this.#battleTimeScale}×</dd></div>
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
              <fieldset class="dev-speed-controls">
                <legend>Simulation speed</legend>
                ${[0.25, 0.5, 1, 2]
                  .map(
                    (speed) => `
                      <button
                        data-command="dev-set-speed"
                        data-speed="${speed}"
                        aria-pressed="${this.#battleTimeScale === speed}"
                      >${speed}×</button>
                    `,
                  )
                  .join("")}
              </fieldset>
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
          ${renderMoveCategoryKey()}
          <div class="pause-actions">
            <button class="primary-action" data-command="resume-battle">Resume</button>
            <button data-command="restart-battle">Restart fight</button>
            ${
              DEV_TOOLS_ENABLED
                ? `
                  <button data-command="open-dev-inspector">Inspect battle</button>
                  <button data-command="hide-battle-overlay">View frozen battle</button>
                  <button data-command="enter-dev">Open Developer Lab</button>
                `
                : ""
            }
            <button class="secondary-action" data-command="quit-battle-parent">Quit to ${escapeHtml(this.battleParentLabel())}</button>
            <button class="secondary-action" data-command="quit-battle-main">Quit to Main Menu</button>
          </div>
          <small>Escape toggles · P ${
            this.#preferences.pauseKeyMode === "hold"
              ? "pauses while held"
              : "toggles"
          } · 1, 2, 3 activate ready Moves</small>
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

  private applyTransition(
    transition: Transition,
    simulationDeltaMs?: number,
  ): void {
    const previousState = this.#battle;
    if (this.#battleReport) {
      this.#battleReport =
        simulationDeltaMs === undefined
          ? appendBattleTransition(this.#battleReport, transition)
          : appendBattleTick(this.#battleReport, simulationDeltaMs, transition);
    }
    const presentationMs = battlePresentationDuration(transition.events);
    const stateCommitDelay = battlePresentationStateCommitDelay(
      transition.events,
    );
    this.#battle = transition.state;
    if (stateCommitDelay > 0 && presentationMs > 0 && previousState) {
      this.scheduleBattleStateCommit(stateCommitDelay);
    } else if (
      transition.events.some(
        (event) =>
          event.type === "damageApplied" ||
          event.type === "healingApplied" ||
          event.type === "characterDefeated",
      )
    ) {
      this.commitVisibleBattleState();
    }
    this.updateChargeRails();
    if (!this.#battlePaused && presentationMs > 0 && previousState) {
      this.#battleScene?.present(
        transition.events,
        presentationMs,
        previousState,
        transition.state,
      );
      this.lockBattlePresentation(presentationMs, transition.events);
      this.updateActions();
      this.updateOpponentDecisionGuidance();
    } else {
      if (
        !this.#battlePaused &&
        transition.events.some((event) => event.periodic)
      ) {
        this.#battleScene?.presentPeriodic(transition.events, transition.state);
      } else {
        this.#battleScene?.setSnapshot(transition.state);
      }
    }
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

  private scheduleBattleStateCommit(delayMs: number): void {
    window.clearTimeout(this.#battleStateCommitTimer);
    this.#battleStateCommitTimer = window.setTimeout(() => {
      this.#battleStateCommitTimer = 0;
      if (!this.#battle || this.#route !== "battle") {
        return;
      }
      this.commitVisibleBattleState();
    }, delayMs);
  }

  private commitVisibleBattleState(): void {
    this.updateTeamReadout("player");
    this.updateTeamReadout("enemy");
    this.updateBench("player");
    this.updateBench("enemy");
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
    const transition = requestAction(
      this.#battle,
      side,
      actionId,
      combatContent,
    );
    if (transitionWasRejected(transition)) {
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
    this.applyTransition(transition);
    if (!this.isBattlePresentationLocked()) {
      this.updateBattleView();
    }
  }

  private playerAccessory(side: Side): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.#battlePaused ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active" ||
      this.#battleControllers[side] !== "human-local"
    ) {
      return;
    }
    const transition = requestAccessory(this.#battle, side, combatContent);
    if (transitionWasRejected(transition)) {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        side,
        { kind: "accessory" },
      );
    }
    this.applyTransition(transition);
    if (!this.isBattlePresentationLocked()) {
      this.updateBattleView();
    }
  }

  private playerPickup(side: Side, pickupId: string): void {
    if (
      !this.#battle ||
      !this.#battleReady ||
      this.#battlePaused ||
      this.isBattlePresentationLocked() ||
      this.#battle.outcome !== "active" ||
      this.#battleControllers[side] !== "human-local"
    ) {
      return;
    }
    const transition = requestPickup(this.#battle, side, pickupId);
    if (transitionWasRejected(transition)) {
      return;
    }
    if (this.#battleReport) {
      this.#battleReport = recordBattleDecision(
        this.#battleReport,
        this.#battle,
        side,
        { kind: "pickup", pickupId },
      );
    }
    this.applyTransition(transition);
    this.updateBattleView();
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
    const transition = requestSwitch(this.#battle, side, index);
    if (transitionWasRejected(transition)) {
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
    this.applyTransition(transition);
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
      if (event.type === "damageApplied" && !event.reactionKind) {
        const target = this.characterNameFromInstance(event.targetId);
        message = `${target} took ${event.amount ?? 0} damage.`;
      }
      if (event.type === "healingApplied") {
        const target = this.characterNameFromInstance(event.targetId);
        message = `${target} recovered ${event.amount ?? 0} Health.`;
      }
      if (event.type === "characterDodged") {
        message = `${this.characterNameFromInstance(event.targetId)} dodged clean.`;
      }
      if (event.type === "criticalHit") {
        message = "Critical hit.";
      }
      if (event.type === "actionInterrupted") {
        message = `${this.characterNameFromInstance(event.sourceId)} was interrupted.`;
      }
      if (event.type === "interruptionResisted") {
        message = `${this.characterNameFromInstance(event.sourceId)} refused to flinch.`;
      }
      if (event.type === "reactionTriggered") {
        const result = events.find(
          (candidate) =>
            candidate.type === "damageApplied" &&
            candidate.reactionKind === event.reactionKind &&
            candidate.reactionId === event.reactionId &&
            candidate.triggerEventId === event.triggerEventId &&
            candidate.sourceId === event.sourceId &&
            candidate.targetId === event.targetId,
        );
        const reactor = this.characterNameFromInstance(event.sourceId);
        const target = this.characterNameFromInstance(event.targetId);
        message =
          event.reactionKind === "counter"
            ? `${reactor} dodged and countered ${target} for ${result?.amount ?? 0}.`
            : `${reactor} reflected ${result?.amount ?? 0} back at ${target}.`;
      }
      if (event.type === "accessoryActivated" && event.message) {
        message = `${combatContent.accessories[event.message]?.name ?? "Accessory"} activated.`;
      }
      if (event.type === "pickupDropped" && event.side === "player") {
        message = `${formatLabel(event.message ?? "bonus")} pickup dropped.`;
      }
      if (event.type === "pickupCollected") {
        message = `${formatLabel(event.message ?? "bonus")} collected.`;
      }
      if (event.type === "statusApplied" && event.message === "stun") {
        message = `${this.characterNameFromInstance(event.targetId)} is stunned.`;
      }
      if (event.type === "characterDefeated") {
        message = `${this.characterNameFromInstance(event.targetId)} is out.`;
      }
      if (message) {
        this.#eventLog.unshift(message);
      }
    }
    this.#eventLog = this.#eventLog.slice(0, 2);
  }

  private characterNameFromInstance(instanceId?: string): string {
    if (!instanceId || !this.#battle) {
      return "Character";
    }
    const combatant = [
      ...this.#battle.player.squad,
      ...this.#battle.enemy.squad,
    ].find((candidate) => candidate.instanceId === instanceId);
    return combatant
      ? (combatContent.characters[combatant.characterId]?.name ?? "Character")
      : "Character";
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
    this.updateEnemyActions();
    this.updateAccessories();
    this.updatePickups();
    this.updateMatchup();
    this.updateBattleVersusIntro();
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

  private updateBattleVersusIntro(): void {
    if (!this.#battle) {
      return;
    }
    for (const side of ["player", "enemy"] as const) {
      const team = this.#battle[side];
      const combatant = team.squad[team.activeIndex]!;
      const character = combatContent.characters[combatant.characterId]!;
      const target = this.#root.querySelector<HTMLElement>(
        `[data-matchup-${side}]`,
      );
      if (!target) {
        continue;
      }
      this.setStableMarkup(
        target,
        `<img
          src="${resolveImagePath(character.portraitAssetId)}"
          data-asset-id="${character.portraitAssetId}"
          style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
          alt=""
        />
        <span>${side === "player" ? "Your fighter" : "Opponent"}</span>
        <strong>${escapeHtml(character.name)}</strong>`,
      );
    }
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
    const empowerSummary = empowerStatusSummary(combatant.statuses);
    const statusLabels = [
      empowerSummary
        ? `<span data-status-kind="empower" aria-label="${empowerSummary.description}">${empowerSummary.label}</span>`
        : null,
      ...combatant.statuses
        .filter((status) => status.kind !== "empower")
        .map(renderCombatStatus),
      ...team.statuses.map(
        (status) =>
          `<span data-status-kind="${status.kind}">${
            status.kind === "moveBlock"
              ? status.slotIndex === "all"
                ? "All Moves blocked"
                : `Move ${status.slotIndex + 1} blocked`
              : status.multiplier === 0
                ? "Charge frozen"
                : status.multiplier < 1
                  ? "Charge slowed"
                  : "Charge boosted"
          }</span>`,
      ),
    ]
      .filter(Boolean)
      .join("");
    const activeTraitLabels = CHARACTER_TRAITS.filter(
      (trait) => team.traitBonuses[trait] > 0,
    )
      .map(
        (trait) =>
          `<span>${formatLabel(trait)} · ${traitBonusLabel(
            trait,
            team.traitBonuses,
          )}</span>`,
      )
      .join("");
    const markup = `
      <div class="readout-heading">
        <div>
          <span>${side === "player" ? "Your Fighter" : "Opponent"}</span>
          <strong>${character.name}</strong>
        </div>
        <span class="type-mark">${formatLabel(character.typeId)}</span>
      </div>
      <div class="meter-label">
        <span>Health</span>
        <strong>${combatant.currentHealth} / ${combatant.maxHealth} · ${Math.round(
          healthPercent,
        )}%</strong>
      </div>
      <div
        class="meter health-meter"
        role="meter"
        aria-label="${character.name} health"
        aria-valuemin="0"
        aria-valuemax="${combatant.maxHealth}"
        aria-valuenow="${combatant.currentHealth}"
      ><span style="--meter-scale:${healthPercent / 100}"></span></div>
      <div
        class="team-trait-row ${activeTraitLabels ? "is-active" : ""}"
        aria-label="${side === "player" ? "Your" : "Opponent"} active Team Traits"
      >${activeTraitLabels}</div>
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
      const rateLabel = this.#root.querySelector<HTMLElement>(
        `[data-${side}-charge-rate]`,
      );
      if (rateLabel) {
        const rate = teamChargePerSecond(this.#battle[side]);
        rateLabel.textContent =
          rate > 0 ? `+${rate.toFixed(1)} / sec` : "Stopped";
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
    const openLoadoutIds = new Set(
      [...target.querySelectorAll<HTMLDetailsElement>(".bench-loadout[open]")]
        .map((details) => details.dataset.instanceId)
        .filter((id): id is string => Boolean(id)),
    );
    const markup = team.squad
      .map((combatant, index) => {
        const character = combatContent.characters[combatant.characterId]!;
        const active = index === team.activeIndex;
        const alive = isAlive(combatant);
        const stateLabel = active ? "active" : alive ? "ready" : "out";
        const art = resolveImagePath(character.portraitAssetId);
        const healthScale = Math.max(
          0,
          Math.min(1, combatant.currentHealth / combatant.maxHealth),
        );
        const body = `
          <span class="bench-art is-${character.typeId}">
            <img
              src="${art}"
              data-asset-id="${character.portraitAssetId}"
              width="128"
              height="128"
              style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
              alt=""
            />
          </span>
          <span class="bench-copy">
            <strong>${character.name}</strong>
            <small>${formatLabel(character.typeId)} · ${combatant.currentHealth} HP</small>
          </span>
          <span class="bench-state">
            <strong>${active ? "ACTIVE" : alive ? "READY" : "OUT"}</strong>
            <small>${combatant.currentHealth}/${combatant.maxHealth}</small>
          </span>
          <span
            class="bench-health"
            role="meter"
            aria-label="${character.name} health"
            aria-valuemin="0"
            aria-valuemax="${combatant.maxHealth}"
            aria-valuenow="${combatant.currentHealth}"
          ><span style="--meter-scale:${healthScale}"></span></span>
        `;
        const moveDisclosure = renderBenchMoveDisclosure(combatant);
        if (side === "player") {
          const inputLocked =
            !this.#battleReady ||
            this.#battlePaused ||
            this.isBattlePresentationLocked();
          return `
            <article class="bench-slot">
              <button
                class="bench-ticket ${active ? "is-active" : ""}"
                data-command="battle-switch"
                data-side="${side}"
                data-index="${index}"
                ${
                  active ||
                  !alive ||
                  inputLocked ||
                  this.#battle?.outcome !== "active"
                    ? "disabled"
                    : ""
                }
                aria-label="${character.name}, ${stateLabel}, ${combatant.currentHealth} of ${combatant.maxHealth} Health${active || !alive ? "" : ". Switch to this fighter"}"
              >${body}</button>
              ${moveDisclosure}
            </article>
          `;
        }
        return `
          <article class="bench-slot">
            <div class="bench-ticket ${active ? "is-active" : ""}">${body}</div>
            ${moveDisclosure}
          </article>
        `;
      })
      .join("");
    this.setStableMarkup(target, markup);
    for (const details of target.querySelectorAll<HTMLDetailsElement>(
      ".bench-loadout",
    )) {
      details.open = openLoadoutIds.has(details.dataset.instanceId ?? "");
    }
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
    const signature = `${active.instanceId}:${active.actionIds.join(":")}:${Object.values(active.actionPositions).join(":")}:${active.actionIds
      .map((actionId) => active.actionTiers[actionId] ?? "stock")
      .join(":")}`;
    if (signature !== this.#actionTraySignature) {
      const moveButtons = active.actionIds
        .map((actionId, index) => {
          const action = combatContent.actions[actionId]!;
          const cost = actionCostForCombatant(active, action);
          const chargeMs = actionChargeMsForCombatant(active, action);
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
          const category = moveCategoryDetail(action.category);
          const previewAction = {
            ...action,
            effects: actionEffectsForCombatant(active, action),
          };
          const hasReaction = previewAction.effects.some(
            (effect) =>
              effect.kind === "reflectDamage" ||
              effect.kind === "counterOnDodge",
          );
          return `
            <button
              class="charge-move ${tierClass} is-unavailable ${hasReaction ? "has-reaction" : ""}"
              style="--action-threshold:${cost}%"
              data-command="battle-action"
              data-side="player"
              data-action-id="${action.id}"
              data-action-index="${index}"
              data-action-category="${category.id}"
              data-battle-inspectable
              aria-expanded="false"
              aria-disabled="true"
            >
              <span class="charge-move-seal">
                <span class="charge-move-key">${index + 1}</span>
                <span class="charge-move-glyph" aria-hidden="true">${category.marker}</span>
                <strong data-action-value>${cost}</strong>
                <small data-action-value-label>Charge</small>
                <span class="charge-move-delta" data-action-delta hidden></span>
              </span>
              <span class="charge-move-cost" aria-hidden="true">
                <strong>${cost}</strong><small>Charge</small>
              </span>
              <span class="charge-move-name">${escapeHtml(action.name)}</span>
              <span class="charge-move-state" data-action-state>Waiting</span>
              <span class="charge-move-role">
                <b aria-hidden="true">${category.marker}</b>
                <span><small>Role</small><strong>${category.shortLabel}</strong></span>
              </span>
              <span class="charge-move-tier"><small>Tier</small><span>${tierLabel}</span></span>
              <span class="action-tooltip" role="tooltip">
                <span class="action-tooltip-heading">
                  <small>Move preview</small>
                  <strong>${escapeHtml(action.name)}</strong>
                  <b>${category.label}</b>
                </span>
                <span class="action-tooltip-impact">
                  <small>${actionPreviewHeading(previewAction)}</small>
                  <strong data-action-preview-value>—</strong>
                  <b data-action-preview-label>Result</b>
                </span>
                <span class="action-tooltip-now">
                  <small>Right now</small>
                  <strong data-action-inspect-state>Stand by</strong>
                </span>
                <span class="action-tooltip-summary" data-action-estimate>Calculating effect…</span>
                <span class="action-tooltip-description">${escapeHtml(action.description)}</span>
                <span class="action-tooltip-facts">
                  <span><small>Cost</small><strong>${cost} Charge</strong></span>
                  <span><small>Timing</small><strong>${
                    chargeMs > 0
                      ? `${(chargeMs / 1000).toFixed(1)}s charge`
                      : "Instant"
                  }</strong></span>
                  <span><small>Upgrade</small><strong>${tierLabel}</strong></span>
                </span>
              </span>
            </button>
          `;
        })
        .join("");
      const thresholdAnchors = active.actionIds
        .map((actionId) => {
          const action = combatContent.actions[actionId]!;
          const cost = actionCostForCombatant(active, action);
          return `<i
            class="charge-action-anchor"
            style="--action-threshold:${cost}%"
            data-action-category="${moveCategoryDetail(action.category).id}"
          ></i>`;
        })
        .join("");
      tray.innerHTML = `${moveButtons}<span class="charge-action-anchors" aria-hidden="true">${thresholdAnchors}</span>`;
      this.#actionTraySignature = signature;
    }
    for (const [index, actionId] of active.actionIds.entries()) {
      const action = combatContent.actions[actionId]!;
      const rule = POSITION_RULES[actionPositionForCombatant(active, action)];
      const cost = actionCostForCombatant(active, action);
      const tier = active.actionTiers[action.id] ?? "stock";
      const previewAction = {
        ...action,
        effects: actionEffectsForCombatant(active, action),
      };
      const button = tray.querySelector<HTMLButtonElement>(
        `[data-action-index="${index}"]`,
      );
      if (!button) {
        continue;
      }
      const stunned = active.statuses.some(
        (status) => status.kind === "stun" && status.remainingMs > 0,
      );
      const moveBlocked = this.#battle.player.statuses.some(
        (status) =>
          status.kind === "moveBlock" &&
          (status.slotIndex === "all" || status.slotIndex === index) &&
          status.remainingMs > 0,
      );
      const formRequirementMet = actionFormRequirementMet(active, action);
      const presentationLocked = this.isBattlePresentationLocked();
      const available =
        this.#battleReady &&
        !this.#battlePaused &&
        !presentationLocked &&
        this.#battle.player.bar >= cost &&
        !pending &&
        !stunned &&
        !moveBlocked &&
        formRequirementMet &&
        this.#battle.outcome === "active";
      const charging = pending?.actionId === action.id;
      const estimate = predictedDamage(
        this.#battle,
        "player",
        action.id,
        combatContent,
      );
      const baseEstimate = predictedBaseDamage(
        this.#battle,
        "player",
        action.id,
        combatContent,
      );
      const remainingCharge = Math.max(
        0,
        Math.ceil(cost - this.#battle.player.bar),
      );
      const outputSummary = actionOutputSummary(
        previewAction,
        estimate,
        rule.multiplier * TIER_MULTIPLIERS[tier],
      );
      const sealOutput = moveSealOutput(
        previewAction,
        estimate,
        baseEstimate,
        cost,
        rule.multiplier * TIER_MULTIPLIERS[tier],
      );
      const stateLabel = charging
        ? `Charging ${Math.max(0, pending.remainingMs / 1000).toFixed(1)}s`
        : !this.#battleReady
          ? "Stand by"
          : this.#battlePaused
            ? "Paused"
            : presentationLocked
              ? "Resolving"
              : stunned
                ? "Stunned"
                : moveBlocked
                  ? "Blocked"
                  : !formRequirementMet
                    ? "Needs form"
                    : available
                      ? `READY · ${index + 1}`
                      : this.#battle.outcome === "active"
                        ? `${remainingCharge} to go`
                        : "Fight ended";
      button.classList.toggle("is-available", available);
      button.classList.toggle("is-unavailable", !available);
      button.classList.toggle("is-charging", charging);
      button.classList.toggle(
        "is-output-boosted",
        sealOutput.tone === "boosted",
      );
      button.classList.toggle(
        "is-output-reduced",
        sealOutput.tone === "reduced",
      );
      button.dataset.actionOutputTone = sealOutput.tone;
      button.setAttribute("aria-disabled", String(!available));
      button.setAttribute(
        "aria-label",
        `${action.name}. ${moveCategoryDetail(action.category).label}. ${stateLabel}. Costs ${cost} Charge. ${
          outputSummary ? `${outputSummary}.` : "Applies an effect."
        } ${
          sealOutput.tone === "boosted"
            ? `Boosted by ${estimate - baseEstimate} attack points.`
            : sealOutput.tone === "reduced"
              ? `Reduced by ${baseEstimate - estimate} attack points.`
              : ""
        }`,
      );
      const state = button.querySelector<HTMLElement>("[data-action-state]");
      const estimateLabel = button.querySelector<HTMLElement>(
        "[data-action-estimate]",
      );
      const inspectState = button.querySelector<HTMLElement>(
        "[data-action-inspect-state]",
      );
      const previewValue = button.querySelector<HTMLElement>(
        "[data-action-preview-value]",
      );
      const previewLabel = button.querySelector<HTMLElement>(
        "[data-action-preview-label]",
      );
      const actionValue = button.querySelector<HTMLElement>(
        "[data-action-value]",
      );
      const actionValueLabel = button.querySelector<HTMLElement>(
        "[data-action-value-label]",
      );
      const actionDelta = button.querySelector<HTMLElement>(
        "[data-action-delta]",
      );
      if (state) {
        state.textContent = stateLabel;
      }
      if (estimateLabel) {
        estimateLabel.textContent = outputSummary ?? "Applies an effect";
      }
      if (inspectState) {
        inspectState.textContent = stateLabel;
      }
      if (previewValue) {
        previewValue.textContent = sealOutput.value;
      }
      if (previewLabel) {
        previewLabel.textContent = sealOutput.label;
      }
      if (actionValue) {
        actionValue.textContent = sealOutput.value;
      }
      if (actionValueLabel) {
        actionValueLabel.textContent = sealOutput.label;
      }
      if (actionDelta) {
        actionDelta.textContent = sealOutput.delta ?? "";
        actionDelta.hidden = sealOutput.delta === null;
        actionDelta.setAttribute("aria-hidden", "true");
      }
    }
    this.updateBattleDecisionGuidance();
  }

  private updateBattleDecisionGuidance(): void {
    if (!this.#battle) {
      return;
    }
    const active = this.#battle.player.squad[this.#battle.player.activeIndex]!;
    const character = combatContent.characters[active.characterId]!;
    const pending = this.#battle.pendingActions.player;
    const guidance = battleDecisionGuidance({
      battleReady: this.#battleReady,
      paused: this.#battlePaused,
      presenting: this.isBattlePresentationLocked(),
      outcomeActive: this.#battle.outcome === "active",
      activeCharacterName: character.name,
      bar: this.#battle.player.bar,
      pendingMoveName: pending
        ? (combatContent.actions[pending.actionId]?.name ?? "Move")
        : null,
      stunned: active.statuses.some(
        (status) => status.kind === "stun" && status.remainingMs > 0,
      ),
      moves: active.actionIds.map((actionId, index) => {
        const action = combatContent.actions[actionId]!;
        const cost = actionCostForCombatant(active, action);
        return {
          key: index + 1,
          name: action.name,
          cost,
          blocked: this.#battle!.player.statuses.some(
            (status) =>
              status.kind === "moveBlock" &&
              (status.slotIndex === "all" || status.slotIndex === index) &&
              status.remainingMs > 0,
          ),
        };
      }),
    });
    const screen = this.#root.querySelector<HTMLElement>(".battle-stage");
    if (screen) {
      screen.dataset.playerDecision = guidance.state;
    }
    const cue = this.#root.querySelector<HTMLElement>(
      "[data-battle-decision-cue]",
    );
    if (!cue) {
      return;
    }
    const key = `${guidance.state}:${guidance.title}:${guidance.detail}`;
    const previousKey = cue.dataset.decisionKey;
    if (previousKey === key) {
      return;
    }
    cue.dataset.decisionKey = key;
    cue.dataset.decisionState = guidance.state;
    cue.setAttribute("aria-label", `${guidance.title}. ${guidance.detail}.`);
    const title = cue.querySelector<HTMLElement>(
      "[data-battle-decision-title]",
    );
    const detail = cue.querySelector<HTMLElement>(
      "[data-battle-decision-detail]",
    );
    if (title) {
      title.textContent = guidance.title;
    }
    if (detail) {
      detail.textContent = guidance.detail;
    }
    if (guidance.state === "ready") {
      this.announce(`${guidance.title}. ${guidance.detail}.`);
    }
  }

  private updateEnemyActions(): void {
    if (!this.#battle) {
      return;
    }
    const tray = this.#root.querySelector<HTMLElement>(
      "[data-enemy-action-tray]",
    );
    if (!tray) {
      return;
    }
    const team = this.#battle.enemy;
    const active = team.squad[team.activeIndex]!;
    const pending = this.#battle.pendingActions.enemy;
    const stunned = active.statuses.some(
      (status) => status.kind === "stun" && status.remainingMs > 0,
    );
    const markup = active.actionIds
      .map((actionId, index) => {
        const action = combatContent.actions[actionId]!;
        const rule = POSITION_RULES[actionPositionForCombatant(active, action)];
        const cost = actionCostForCombatant(active, action);
        const chargeMs = actionChargeMsForCombatant(active, action);
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
        const category = moveCategoryDetail(action.category);
        const compactNameParts = action.name.split(/[\s-]+/).filter(Boolean);
        const compactName = (
          compactNameParts.length > 1
            ? compactNameParts.map((part) => part[0]).join("")
            : action.name.slice(0, 3)
        )
          .slice(0, 3)
          .toUpperCase();
        const previewAction = {
          ...action,
          effects: actionEffectsForCombatant(active, action),
        };
        const effectMultiplier = rule.multiplier * TIER_MULTIPLIERS[tier];
        const estimate = predictedDamage(
          this.#battle!,
          "enemy",
          action.id,
          combatContent,
        );
        const baseEstimate = predictedBaseDamage(
          this.#battle!,
          "enemy",
          action.id,
          combatContent,
        );
        const outputSummary = actionOutputSummary(
          previewAction,
          estimate,
          effectMultiplier,
        );
        const sealOutput = moveSealOutput(
          previewAction,
          estimate,
          baseEstimate,
          cost,
          effectMultiplier,
        );
        const blocked = team.statuses.some(
          (status) =>
            status.kind === "moveBlock" &&
            (status.slotIndex === "all" || status.slotIndex === index) &&
            status.remainingMs > 0,
        );
        const ready =
          this.#battleReady &&
          !pending &&
          !stunned &&
          !blocked &&
          team.bar >= cost &&
          this.#battle?.outcome === "active";
        const charging = pending?.actionId === action.id;
        const state = charging
          ? "Charging"
          : stunned
            ? "Stunned"
            : blocked
              ? "Blocked"
              : ready
                ? "Ready"
                : `${Math.max(0, Math.ceil(cost - team.bar))} to go`;
        return `
          <button
            type="button"
            class="enemy-charge-node ${tierClass} ${ready ? "is-ready" : ""} ${charging ? "is-charging" : ""}"
            style="--enemy-action-threshold:${cost}%"
            data-action-category="${category.id}"
            data-action-index="${index}"
            data-command="inspect-battle-detail"
            data-battle-inspectable
            title="${escapeHtml(action.name)} · ${state}"
            aria-label="Opponent Move ${index + 1}, ${action.name}. ${category.label}. ${tierLabel}. Costs ${cost} Charge. ${state}."
            aria-expanded="false"
          >
            <span class="enemy-move-seal">
              <small>${index + 1}</small>
              <span class="enemy-move-glyph" aria-hidden="true">${category.marker}</span>
              <strong>${cost}</strong>
            </span>
            <span class="enemy-move-name">${escapeHtml(action.name)}</span>
            <span class="enemy-move-short" aria-hidden="true">${escapeHtml(compactName)}</span>
            <span class="enemy-move-meta">
              <b><small aria-hidden="true">${category.marker}</small><span>${category.shortLabel}</span></b>
              <i>${tierLabel}</i>
            </span>
            <em>${ready ? "READY" : charging ? "CAST" : blocked ? "BLOCKED" : state}</em>
            <span class="action-tooltip opponent-action-tooltip" role="tooltip">
              <span class="action-tooltip-heading">
                <small>Opponent move</small>
                <strong>${escapeHtml(action.name)}</strong>
                <b>${category.label}</b>
              </span>
              <span class="action-tooltip-impact">
                <small>${actionPreviewHeading(previewAction)}</small>
                <strong>${sealOutput.value}</strong>
                <b>${sealOutput.label}</b>
              </span>
              <span class="action-tooltip-now">
                <small>Threat now</small>
                <strong>${state}</strong>
              </span>
              <span class="action-tooltip-summary">${escapeHtml(outputSummary || "Applies an effect")}</span>
              <span class="action-tooltip-description">${escapeHtml(action.description)}</span>
              <span class="action-tooltip-facts">
                <span><small>Cost</small><strong>${cost} Charge</strong></span>
                <span><small>Timing</small><strong>${
                  chargeMs > 0
                    ? `${(chargeMs / 1000).toFixed(1)}s charge`
                    : "Instant"
                }</strong></span>
                <span><small>Status</small><strong>${state}</strong></span>
              </span>
            </span>
          </button>
        `;
      })
      .join("");
    if (
      !tray.querySelector(".enemy-charge-node.is-inspecting") &&
      !tray.contains(document.activeElement)
    ) {
      this.setStableMarkup(tray, markup);
    }
    this.updateOpponentDecisionGuidance();
  }

  private updateOpponentDecisionGuidance(): void {
    if (!this.#battle) {
      return;
    }
    const team = this.#battle.enemy;
    const active = team.squad[team.activeIndex]!;
    const character = combatContent.characters[active.characterId]!;
    const pending = this.#battle.pendingActions.enemy;
    const guidance = opponentDecisionGuidance({
      battleReady: this.#battleReady,
      paused: this.#battlePaused,
      presenting: this.isBattlePresentationLocked(),
      outcomeActive: this.#battle.outcome === "active",
      activeCharacterName: character.name,
      bar: team.bar,
      pendingMoveName: pending
        ? (combatContent.actions[pending.actionId]?.name ?? "Move")
        : null,
      stunned: active.statuses.some(
        (status) => status.kind === "stun" && status.remainingMs > 0,
      ),
      moves: active.actionIds.map((actionId, index) => {
        const action = combatContent.actions[actionId]!;
        const cost = actionCostForCombatant(active, action);
        return {
          key: index + 1,
          name: action.name,
          cost,
          blocked: team.statuses.some(
            (status) =>
              status.kind === "moveBlock" &&
              (status.slotIndex === "all" || status.slotIndex === index) &&
              status.remainingMs > 0,
          ),
        };
      }),
    });
    const screen = this.#root.querySelector<HTMLElement>(".battle-stage");
    if (screen) {
      screen.dataset.enemyDecision = guidance.state;
    }
    const cue = this.#root.querySelector<HTMLElement>(
      "[data-enemy-decision-cue]",
    );
    if (!cue) {
      return;
    }
    const key = `${guidance.state}:${guidance.title}:${guidance.detail}`;
    if (cue.dataset.decisionKey === key) {
      return;
    }
    cue.dataset.decisionKey = key;
    cue.dataset.decisionState = guidance.state;
    cue.setAttribute("aria-label", `${guidance.title}. ${guidance.detail}.`);
    const title = cue.querySelector<HTMLElement>("[data-enemy-decision-title]");
    const detail = cue.querySelector<HTMLElement>(
      "[data-enemy-decision-detail]",
    );
    if (title) {
      title.textContent = guidance.title;
    }
    if (detail) {
      detail.textContent = guidance.detail;
    }
  }

  private updateAccessories(): void {
    if (!this.#battle) {
      return;
    }
    for (const side of ["player", "enemy"] as const) {
      const state = this.#battle[side].accessory;
      const definition = state
        ? combatContent.accessories[state.accessoryId]
        : undefined;
      const target = this.#root.querySelector<HTMLElement>(
        `[data-${side}-accessory]`,
      );
      if (!target) {
        continue;
      }
      if (!state || !definition) {
        target.classList.add("is-empty");
        target.classList.remove("is-ready");
        target.style.removeProperty("--accessory-charge");
        target.textContent = "No Accessory";
        target.setAttribute("aria-disabled", "true");
        continue;
      }
      target.classList.remove("is-empty");
      const active = this.#battle[side].squad[this.#battle[side].activeIndex]!;
      const ready =
        state.charge >= 100 &&
        !this.#battle.pendingActions[side] &&
        !active.statuses.some((status) => status.kind === "stun") &&
        this.#battle.outcome === "active";
      const controlReady =
        ready &&
        (side === "enemy" ||
          (this.#battleReady &&
            !this.#battlePaused &&
            !this.isBattlePresentationLocked()));
      target.classList.toggle("is-ready", controlReady);
      target.style.setProperty(
        "--accessory-charge",
        `${Math.max(0, Math.min(100, state.charge))}%`,
      );
      const readiness = controlReady
        ? side === "player"
          ? "READY · ACTIVATE"
          : "OPPONENT READY"
        : `${Math.ceil(100 - state.charge)} TO READY`;
      target.innerHTML = `
        <b class="accessory-kind">Accessory</b>
        <img
          src="${resolveImagePath(definition.imageAssetId)}"
          data-asset-id="${definition.imageAssetId}"
          width="64"
          height="64"
          alt=""
        />
        <span>${escapeHtml(definition.name)}</span>
        <strong>${Math.floor(state.charge)}%</strong>
        <small>${readiness}</small>
        <span class="battle-info-tooltip" role="tooltip">
          <strong>${escapeHtml(definition.name)}</strong>
          <span>${escapeHtml(definition.description)}</span>
          <small>Accessory Charge ${Math.floor(state.charge)} / 100</small>
        </span>
      `;
      target.setAttribute(
        "aria-label",
        `${definition.name}. ${Math.floor(state.charge)} percent charged. ${
          controlReady ? "Ready to activate." : definition.description
        }`,
      );
      target.setAttribute(
        "aria-disabled",
        String(side === "player" ? !controlReady : false),
      );
    }
  }

  private updatePickups(): void {
    const battle = this.#battle;
    if (!battle) {
      return;
    }
    const target = this.#root.querySelector<HTMLElement>(
      "[data-player-pickups]",
    );
    if (!target) {
      return;
    }
    const playerPickups = battle.pickups.filter(
      (pickup) => pickup.side === "player",
    );
    const label = {
      battery: "Battery",
      repair: "Repair",
      surge: "Charge",
    } as const;
    const effect = {
      battery: "Accessory",
      repair: "Health",
      surge: "Strip",
    } as const;
    this.setStableMarkup(
      target,
      playerPickups
        .map(
          (pickup) => `
            <button
              class="battle-pickup is-${pickup.kind}"
              data-command="battle-pickup"
              data-side="player"
              data-pickup-id="${pickup.id}"
              aria-label="${label[pickup.kind]} pickup. Add ${pickup.amount} ${effect[pickup.kind]}."
              ${
                !this.#battleReady ||
                this.#battlePaused ||
                this.isBattlePresentationLocked() ||
                battle.outcome !== "active"
                  ? "disabled"
                  : ""
              }
            >
              <span>${label[pickup.kind]}</span>
              <strong>+${pickup.amount}</strong>
              <small>${effect[pickup.kind]}</small>
            </button>
          `,
        )
        .join(""),
    );
  }

  private updateMatchup(): void {
    if (!this.#battle) {
      return;
    }
    const player = this.#battle.player.squad[this.#battle.player.activeIndex]!;
    const enemy = this.#battle.enemy.squad[this.#battle.enemy.activeIndex]!;
    const playerType = combatContent.characters[player.characterId]!.typeId;
    const enemyType = combatContent.characters[enemy.characterId]!.typeId;
    const matchup = typeMultiplier(playerType, enemyType);
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
      <span>Type matchup</span>
      <strong>${formatLabel(playerType)} <span aria-hidden="true">↔</span> ${formatLabel(
        enemyType,
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
    const trackTitle = findMusic(
      this.#audio.currentTrackId || "music.main-theme",
    ).title;
    const label = this.#root.querySelector<HTMLElement>("[data-now-playing]");
    if (label) {
      label.textContent = trackTitle;
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
          ? `Turn music off. Playing ${trackTitle}.`
          : "Turn music on",
      );
      button.title = this.#preferences.musicPlaybackEnabled
        ? `Playing ${trackTitle}`
        : "Music";
    }
  }

  private musicContextForCurrentRoute(): MusicContext {
    if (this.#route === "battle") {
      return "battle";
    }
    if (
      this.#route === "menu" ||
      this.#route === "achievements" ||
      this.#route === "profile" ||
      this.#route === "settings"
    ) {
      return "main";
    }
    return "wandering";
  }

  private playMusicForCurrentContext(): void {
    if (
      !this.#preferences.musicPlaybackEnabled ||
      this.#preferences.musicMuted
    ) {
      return;
    }
    const context = this.musicContextForCurrentRoute();
    if (this.#musicContext === context && this.#audio.currentTrackId) {
      void this.#audio
        .playTrack(this.#audio.currentTrackId)
        .then(() => this.updateNowPlaying());
      return;
    }
    const characterIds =
      context === "battle" && this.#battle
        ? Array.from(
            new Set(
              [...this.#battle.player.squad, ...this.#battle.enemy.squad].map(
                (combatant) => combatant.characterId,
              ),
            ),
          )
        : [];
    const track = selectMusicTrack({
      context,
      seed: musicSeed(
        this.#musicSessionSeed,
        this.#musicSelectionSequence++,
        context,
        this.#battle?.seed ?? 0,
        ...characterIds,
      ),
      characterIds,
      currentTrackId: this.#audio.currentTrackId,
    });
    this.#musicContext = context;
    void this.#audio.playTrack(track.id).then(() => this.updateNowPlaying());
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
    const tournamentRunForXp = this.#isTournamentFight
      ? this.activeTournamentRun()
      : null;
    const supportInstanceIds = new Set(
      tournamentRunForXp?.caseBuilds
        .map((build) => build.instanceId)
        .filter((instanceId) => !participantInstanceIds.has(instanceId)) ?? [],
    );
    const supportRecipients = sandboxFight
      ? []
      : this.#save.collection.filter((entry) =>
          supportInstanceIds.has(entry.instanceId),
        );
    const supportXpPool = Math.floor(reward.xp * 0.2);
    const supportXpShare =
      supportRecipients.length > 0
        ? Math.floor(supportXpPool / supportRecipients.length)
        : 0;
    for (const recipient of supportRecipients) {
      const progress = addXp(
        {
          level: recipient.level,
          xp: recipient.xp,
          unspentStatPoints: recipient.unspentStatPoints,
        },
        supportXpShare,
      );
      recipient.level = progress.level;
      recipient.xp = progress.xp;
      recipient.unspentStatPoints = progress.unspentStatPoints;
    }
    this.#battleReward = {
      won,
      ...reward,
      xpRecipients: xpRecipients.length + supportRecipients.length,
      cupCompletionBonus: 0,
    };
    const opponentIds =
      reportEnemy?.map((participant) => participant.characterId) ??
      this.#battle.enemy.squad.map((combatant) => combatant.characterId);
    const recordedLossTargetId =
      opponentIds.find((opponentId) => opponentId === "character.ned-kelly") ??
      opponentIds[0] ??
      "character.ned-kelly";
    if (!sandboxFight) {
      this.#save.missionProgress["mission.invoice-denied"] =
        evaluateMissionProgress(
          "mission.invoice-denied",
          this.#save.missionProgress["mission.invoice-denied"] ?? 0,
          { type: "battleEnded", won, opponentCharacterIds: opponentIds },
        );
      if (!this.#isTournamentFight && this.#sessionMode === "story") {
        this.#save.missionProgress["mission.print-it-personal"] =
          evaluateMissionProgress(
            "mission.print-it-personal",
            this.#save.missionProgress["mission.print-it-personal"] ?? 0,
            {
              type: "storyBattleEnded",
              won,
            },
          );
      }
    }
    if (won && !this.#isTournamentFight && !sandboxFight) {
      if (!this.#save.clearedNodeIds.includes(storyEncounter.nodeId)) {
        this.#save.clearedNodeIds.push(storyEncounter.nodeId);
      }
      this.#save.currentNodeId = storyEncounter.nextNodeId;
    } else if (this.#isTournamentFight) {
      const run = this.activeTournamentRun();
      if (!run) {
        throw new Error("A Tournament Battle ended without an active run.");
      }
      const definition = resolveTournamentRunDefinition(run);
      const runWithAccessoryUse = exhaustTournamentAccessoriesFromEvents(
        run,
        this.#battleReport?.events ?? [],
      );
      const result = recordTournamentBattleResult(
        definition,
        runWithAccessoryUse,
        this.#battle,
        won,
      );
      if (result.status === "lost") {
        this.#terminalTournamentRun = structuredClone(runWithAccessoryUse);
        this.setActiveTournamentRun(null);
        if (this.#sessionMode === "tournament") {
          this.#tournamentWorkflow = enterTournamentStage(
            this.#tournamentWorkflow,
            "choice",
          );
        }
      } else if (result.status === "complete") {
        this.#terminalTournamentRun = null;
        this.setActiveTournamentRun(null);
        if (this.#sessionMode === "tournament") {
          this.#tournamentWorkflow = enterTournamentStage(
            this.#tournamentWorkflow,
            "choice",
          );
        }
        const trophyAward = awardTournamentDefinitionTrophy(
          this.#save.tournamentTrophyIds,
          definition,
        );
        this.#save.tournamentTrophyIds = trophyAward.trophyIds;
        if (run.origin === "story") {
          if (
            !this.#save.storyTournamentTrophyIds.includes(trophyAward.trophyId)
          ) {
            this.#save.storyTournamentTrophyIds.push(trophyAward.trophyId);
          }
          if (!this.#save.clearedNodeIds.includes("story.first-run.06")) {
            this.#save.clearedNodeIds.push("story.first-run.06");
          }
          this.#save.currentNodeId = "story.first-run.07";
        }
        this.#save.stamps += CUP_COMPLETION_BONUS;
        this.#battleReward.cupCompletionBonus = CUP_COMPLETION_BONUS;
        this.#cupCompletedThisBattle = true;
        this.#save = saveTournamentVictory(
          localStorage,
          this.#save,
          definition.baseTournamentId ?? definition.id,
          run.origin,
          "story.first-run",
          definition.trophyId,
        );
      } else if (result.status === "continue" || result.status === "redeploy") {
        this.setActiveTournamentRun(result.run);
      }
    } else if (
      !won &&
      !this.#isTournamentFight &&
      !sandboxFight &&
      !this.#save.lossesTo.includes(recordedLossTargetId)
    ) {
      this.#save.lossesTo.push(recordedLossTargetId);
    }
    if (this.#isQuickFight) {
      this.#save.quickFightRecord = {
        fightsPlayed: this.#save.quickFightRecord.fightsPlayed + 1,
        wins: this.#save.quickFightRecord.wins + (won ? 1 : 0),
        losses: this.#save.quickFightRecord.losses + (won ? 0 : 1),
        lastSeed: this.#battle.seed,
        lastPlayerCharacterIds: this.#battle.player.squad.map(
          (combatant) => combatant.characterId,
        ),
        lastOpponentCharacterIds: this.#battle.enemy.squad.map(
          (combatant) => combatant.characterId,
        ),
      };
      this.#save = saveSlot(localStorage, this.#save);
    } else if (!sandboxFight) {
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
    if (!this.#battleReward || !this.#battle) {
      return;
    }
    const storyEncounter = firstRunEncounter(this.#storyBattleNodeId);
    const panel = this.#root.querySelector<HTMLElement>("[data-battle-result]");
    if (!panel) {
      return;
    }
    const tournamentCanRedeploy =
      this.#isTournamentFight &&
      !this.#battleReward.won &&
      Boolean(this.activeTournamentRun());
    const resultMode: BattleResultMode = this.#isDevFight
      ? "dev"
      : this.#isTournamentFight
        ? "tournament"
        : this.#isQuickFight
          ? "quick"
          : "story";
    const winningTeam = this.#battleReward.won
      ? this.#battle.player
      : this.#battle.enemy;
    const featuredFighter =
      winningTeam.squad.find((fighter) => fighter.currentHealth > 0) ??
      winningTeam.squad[winningTeam.activeIndex] ??
      winningTeam.squad[0];
    if (!featuredFighter) {
      return;
    }
    const rewards: BattleResultReward[] | undefined =
      resultMode === "quick" || resultMode === "dev"
        ? undefined
        : [
            {
              label: "Battle Stamps",
              value: `+${
                this.#battleReward.stamps - this.#battleReward.firstClearBonus
              }`,
            },
            {
              label: `Lineup XP · ${this.#battleReward.xpRecipients} Character${this.#battleReward.xpRecipients === 1 ? "" : "s"}`,
              value: `+${this.#battleReward.xp}`,
            },
            ...(this.#battleReward.firstClearBonus > 0
              ? [
                  {
                    label: "First clear",
                    value: `+${this.#battleReward.firstClearBonus}`,
                  },
                ]
              : []),
            ...(this.#battleReward.cupCompletionBonus > 0
              ? [
                  {
                    label: "Tournament purse",
                    value: `+${this.#battleReward.cupCompletionBonus}`,
                  },
                ]
              : []),
          ];
    const won = this.#battleReward.won;
    const title = won
      ? this.#isTournamentFight
        ? this.#cupCompletedThisBattle
          ? `${this.#tournamentName} is yours.`
          : `Round ${this.#tournamentRoundIndex + 1} belongs to you.`
        : this.#isDevFight
          ? `${this.#devScenario?.name ?? "Development scenario"} cleared.`
          : this.#isQuickFight
            ? "Your Lineup takes the fight."
            : storyEncounter.victoryTitle
      : this.#isDevFight
        ? `${this.#devScenario?.name ?? "Development scenario"} ends in defeat.`
        : this.#isQuickFight
          ? "The opposing Lineup takes it."
          : this.#isTournamentFight
            ? tournamentCanRedeploy
              ? "Your Roster can still fight."
              : "The Tournament is over."
            : "Not this time.";
    const message = won
      ? this.#isTournamentFight
        ? this.#cupCompletedThisBattle
          ? "Your Roster made it through every round. The Trophy and final purse are yours."
          : "Your Roster's Health is saved. Choose a drop, then prepare for the next round."
        : this.#isDevFight
          ? "Run the scenario again, inspect the report, or return to the Developer Lab."
          : this.#isQuickFight
            ? "Run it back with the same matchup, or return to Review Fight and make changes."
            : storyEncounter.victoryCopy
      : this.#isTournamentFight
        ? this.activeTournamentRun()
          ? "The opposing Squad keeps its damage. Choose from your surviving Roster and have another bite."
          : "Your full Roster is down. Start a fresh Tournament when you're ready."
        : this.#isDevFight
          ? "Run the scenario again, inspect the report, or return to the Developer Lab."
          : this.#isQuickFight
            ? "Run it back with the same matchup, or return to Review Fight and change your approach."
            : "You can fight again whenever you're ready.";
    const retryLabel = this.#isTournamentFight
      ? "Restart Tournament"
      : this.#isDevFight
        ? "Run again"
        : this.#isQuickFight
          ? "Rematch"
          : "Fight again";
    const parentLabel = this.#isTournamentFight
      ? this.#cupCompletedThisBattle
        ? this.#sessionMode === "story"
          ? "See the ending"
          : "Return to Tournament"
        : won
          ? "Choose a Roster drop"
          : tournamentCanRedeploy
            ? "Choose another Lineup"
            : "Leave Tournament"
      : this.#isDevFight
        ? "Developer Lab"
        : this.#isQuickFight
          ? "Review Fight"
          : "Return to Story";
    for (const element of this.#root.querySelectorAll<HTMLElement>(
      ".battle-rail, .battle-drawer",
    )) {
      element.inert = true;
    }
    panel.hidden = false;
    panel.innerHTML = renderBattleResultScreen({
      mode: resultMode,
      won,
      title,
      message,
      featuredCharacterId: featuredFighter.characterId,
      explanation: this.#battleReport
        ? explainBattleResult(this.#battleReport, combatContent)
        : undefined,
      rewards,
      actions: {
        retry:
          (this.#isTournamentFight && won) || tournamentCanRedeploy
            ? undefined
            : { command: "retry-battle", label: retryLabel },
        parent: { command: "quit-battle-parent", label: parentLabel },
        mainMenu: { command: "quit-battle-main", label: "Main Menu" },
        exportReport: this.#isDevFight
          ? {
              command: "download-battle-report",
              label: "Export report",
            }
          : undefined,
        parentIsPrimary:
          (this.#isTournamentFight && won) || tournamentCanRedeploy,
      },
    });
    panel.querySelector<HTMLElement>("button")?.focus();
  }

  private announce(message: string): void {
    const announcer = this.#root.querySelector<HTMLElement>("#announcer");
    if (announcer) {
      announcer.textContent = message;
    }
  }
}
