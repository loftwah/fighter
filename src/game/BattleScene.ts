import Phaser from "phaser";
import {
  imageFallbackChain,
  presentationAssets,
  type NormalizedRect,
} from "../assets/registry";
import type { BattleEvent, BattleState, Side } from "../combat/types";
import type { BattlePresentationStyle } from "../dev/experiments";
import { combatContent } from "../content/initial-content";
import { FramedShot } from "./presentation/FramedShot";
import {
  calculateBattleLayout,
  calculateComicPanelLayout,
} from "./presentation/framing";
import {
  CHARGED_MOVE_IMPACT_DELAY_MS,
  DAMAGE_STAGGER_MS,
  IMPACT_VISUAL_MS,
  INSTANT_MOVE_IMPACT_DELAY_MS,
  REACTION_IMPACT_DELAY_MS,
} from "./presentation-timing";
import {
  activeSideForPresentationTarget,
  presentationActionEvent,
  presentationActionSide,
} from "./presentation/targeting";
import {
  activeBattleCharacterIds,
  battleIdleTextureId,
  battleTexturePlan,
  richBattleAssetIds,
} from "./presentation/assets";

type ReactionKind =
  "hurt" | "dodge" | "stunned" | "defeated" | "victory" | "tense";

const REACTION_REGIONS: Record<ReactionKind, NormalizedRect> = {
  hurt: { x: 0, y: 0, width: 1 / 3, height: 1 / 2 },
  dodge: { x: 1 / 3, y: 0, width: 1 / 3, height: 1 / 2 },
  stunned: { x: 2 / 3, y: 0, width: 1 / 3, height: 1 / 2 },
  defeated: { x: 0, y: 1 / 2, width: 1 / 3, height: 1 / 2 },
  victory: { x: 1 / 3, y: 1 / 2, width: 1 / 3, height: 1 / 2 },
  tense: { x: 2 / 3, y: 1 / 2, width: 1 / 3, height: 1 / 2 },
};

export class BattleScene extends Phaser.Scene {
  readonly #initialSnapshot: BattleState | null;
  #snapshot: BattleState | null = null;
  #background?: Phaser.GameObjects.Image;
  #playerShot?: FramedShot;
  #enemyShot?: FramedShot;
  #idleFrame = 0;
  #reducedMotion = false;
  readonly #presentationStyle: BattlePresentationStyle;
  #presentationActive = false;
  #presentationRun = 0;
  #snapshotArtSignature = "";
  #resolvedImageTextureKeys = new Map<string, string>();
  #imageLoadRequests = new Map<
    string,
    { candidates: Array<{ id: string; path: string }>; index: number }
  >();
  #imageCandidateWaiters = new Map<string, Set<string>>();
  #failedImageCandidateIds = new Set<string>();
  #loadedRichCharacterIds = new Set<string>();
  #activeRichCharacterIds = new Set<string>();
  #richImageOwners = new Map<string, string>();
  #presentationOwners = new Map<string, string>();
  #onReady: (scene: BattleScene) => void;

  constructor(
    onReady: (scene: BattleScene) => void,
    initialSnapshot: BattleState | null = null,
    presentationStyle: BattlePresentationStyle = "kinetic-print",
  ) {
    super("battle");
    this.#onReady = onReady;
    this.#initialSnapshot = initialSnapshot;
    this.#presentationStyle = presentationStyle;
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onImageFileComplete);
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onImageFileError);
    this.requestImage("image.arena.first-run");

    if (!this.#initialSnapshot) {
      this.#activeRichCharacterIds = new Set(
        Object.keys(combatContent.characters),
      );
      for (const character of Object.values(combatContent.characters)) {
        this.requestImage(battleIdleTextureId(character, 0));
        this.requestImage(battleIdleTextureId(character, 1));
        this.queueRichCharacterAssets(character.id);
      }
      return;
    }

    const plan = battleTexturePlan(this.#initialSnapshot, combatContent);
    this.#activeRichCharacterIds = new Set(
      activeBattleCharacterIds(this.#initialSnapshot),
    );
    for (const id of [...plan.baseImageIds, ...plan.richImageIds]) {
      this.requestImage(id);
    }
    for (const characterId of activeBattleCharacterIds(this.#initialSnapshot)) {
      this.queueRichCharacterAssets(characterId);
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111f46");
    const arenaTexture = this.resolvedTextureKey("image.arena.first-run");
    this.#background = this.add.image(0, 0, arenaTexture).setOrigin(0.5);
    const initialTexture = (
      side: Side,
      fallback: "image.viking.canonical" | "image.ned-kelly.canonical",
    ): string => {
      const team = this.#initialSnapshot?.[side];
      const combatant = team?.squad[team.activeIndex];
      const character = combatant
        ? combatContent.characters[combatant.characterId]
        : undefined;
      return this.resolvedTextureKey(
        character ? battleIdleTextureId(character, 0) : fallback,
      );
    };
    this.#playerShot = new FramedShot(this, {
      side: "player",
      textureKey: initialTexture("player", "image.viking.canonical"),
      depth: 5,
    });
    this.#enemyShot = new FramedShot(this, {
      side: "enemy",
      textureKey: initialTexture("enemy", "image.ned-kelly.canonical"),
      depth: 4,
    });
    this.scale.on("resize", () => this.layout());
    this.time.addEvent({
      delay: 620,
      loop: true,
      callback: () => {
        if (
          !this.#reducedMotion &&
          !this.#presentationActive &&
          this.#snapshot?.outcome === "active"
        ) {
          this.#idleFrame = this.#idleFrame === 0 ? 1 : 0;
          this.swapIdleTextures();
        }
      },
    });
    this.time.addEvent({
      delay: 2_200,
      loop: true,
      callback: () => this.pulsePrintLayers(),
    });
    this.layout();
    this.#onReady(this);
  }

  setReducedMotion(reduced: boolean): void {
    this.#reducedMotion = reduced;
    if (reduced) {
      this.#idleFrame = 0;
      this.#playerShot?.resetMotion();
      this.#enemyShot?.resetMotion();
      this.syncArt();
    }
  }

  setSnapshot(snapshot: BattleState): void {
    this.#snapshot = snapshot;
    this.#activeRichCharacterIds = new Set(activeBattleCharacterIds(snapshot));
    const player =
      snapshot.player.squad[snapshot.player.activeIndex]?.instanceId ?? "";
    const enemy =
      snapshot.enemy.squad[snapshot.enemy.activeIndex]?.instanceId ?? "";
    const signature = `${player}:${enemy}`;
    if (signature !== this.#snapshotArtSignature) {
      this.#snapshotArtSignature = signature;
      for (const characterId of activeBattleCharacterIds(snapshot)) {
        this.queueRichCharacterAssets(characterId);
      }
      this.startQueuedLoads();
      this.syncArt();
    }
  }

  setSimulationPaused(paused: boolean): void {
    if (paused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }
  }

  presentPeriodic(events: BattleEvent[], snapshot: BattleState): void {
    this.setSnapshot(snapshot);
    for (const event of events) {
      if (!event.periodic) {
        continue;
      }
      if (event.type === "damageApplied") {
        this.presentFloat(event, `-${event.amount ?? 0}`, "#f2d742");
      }
      if (event.type === "healingApplied") {
        this.presentFloat(event, `+${event.amount ?? 0}`, "#8de1ff");
      }
    }
  }

  present(
    events: BattleEvent[],
    durationMs = 0,
    beforeSnapshot: BattleState | null = this.#snapshot,
    afterSnapshot: BattleState | null = this.#snapshot,
  ): void {
    const run = ++this.#presentationRun;
    this.#presentationActive = durationMs > 0;
    this.#playerShot?.resetMotion();
    this.#enemyShot?.resetMotion();
    if (beforeSnapshot) {
      this.#snapshot = beforeSnapshot;
    }
    const started = events.find(
      (event) => event.type === "actionStarted" && event.actionId,
    );
    const charged = presentationActionEvent(events);
    const actionSide = presentationActionSide(events);
    let impactDelay = 0;

    if (charged?.actionId) {
      const chargedSide = charged.side ?? actionSide ?? "player";
      const isInstantMove = Boolean(started);
      impactDelay = isInstantMove
        ? INSTANT_MOVE_IMPACT_DELAY_MS
        : CHARGED_MOVE_IMPACT_DELAY_MS;
      this.presentCutIn(charged.actionId, chargedSide);
      this.presentLunge(chargedSide, impactDelay - 140);
    } else if (started?.sourceId) {
      this.presentReaction(started.sourceId, "tense");
    } else if (actionSide) {
      impactDelay = REACTION_IMPACT_DELAY_MS;
    }

    let damageIndex = 0;
    for (const event of events) {
      if (event.periodic) {
        if (event.type === "damageApplied") {
          this.presentFloat(event, `-${event.amount ?? 0}`, "#f2d742");
        }
        if (event.type === "healingApplied") {
          this.presentFloat(event, `+${event.amount ?? 0}`, "#8de1ff");
        }
        continue;
      }
      if (event.type === "damageApplied") {
        this.presentDamage(
          event,
          impactDelay + damageIndex * DAMAGE_STAGGER_MS,
        );
        damageIndex += 1;
      }
      if (event.type === "healingApplied") {
        this.presentFloat(
          event,
          `+${event.amount ?? 0}`,
          "#8de1ff",
          impactDelay,
        );
      }
      if (event.type === "characterDodged") {
        this.presentDodge(event, impactDelay);
      }
      if (event.type === "criticalHit") {
        this.presentImpactWord("CRITICAL!", "#f2d742", impactDelay);
      }
      if (event.type === "actionInterrupted") {
        this.presentImpactWord("INTERRUPTED!", "#ef4d39", impactDelay);
      }
      if (event.type === "interruptionResisted") {
        this.presentImpactWord("NO FLINCH!", "#8de1ff", impactDelay);
      }
      if (event.type === "reactionTriggered") {
        const reactionDelay = impactDelay + damageIndex * DAMAGE_STAGGER_MS;
        this.presentImpactWord(
          event.reactionKind === "counter" ? "COUNTER!" : "REFLECT!",
          event.reactionKind === "counter" ? "#8de1ff" : "#f2d742",
          reactionDelay,
        );
        if (event.side) {
          this.presentLunge(event.side, reactionDelay + 55);
        }
      }
      if (event.type === "accessoryActivated") {
        this.presentImpactWord("ACCESSORY!", "#8eef5d", 0);
      }
      if (event.type === "statusApplied" && event.message === "stun") {
        this.time.delayedCall(impactDelay + 80, () =>
          this.presentReaction(event.targetId, "stunned"),
        );
        this.presentImpactWord("STUNNED!", "#f2d742", impactDelay + 80);
      }
      if (event.type === "characterSwitched") {
        continue;
      }
      if (event.type === "characterDefeated") {
        this.presentDefeat(event, impactDelay + damageIndex * 105);
      }
    }

    const switchedSide = events.find(
      (event) => event.type === "characterSwitched",
    )?.side;
    let committed = false;
    if (durationMs > 0 && switchedSide && afterSnapshot) {
      this.time.delayedCall(Math.max(0, durationMs - 240), () => {
        if (run !== this.#presentationRun) {
          return;
        }
        committed = true;
        this.setSnapshot(afterSnapshot);
        this.presentEntrance(switchedSide);
      });
    }

    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (run !== this.#presentationRun) {
          return;
        }
        if (!committed && afterSnapshot) {
          this.setSnapshot(afterSnapshot);
        }
        this.syncArt();
        this.#presentationActive = false;
        this.#playerShot?.resetMotion();
        this.#enemyShot?.resetMotion();
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(this.scale.width / 2, this.scale.height / 2);
        this.layout();
        if (afterSnapshot) {
          this.presentOutcomeReactions(afterSnapshot);
          this.releaseInactiveRichAssets(afterSnapshot);
        }
      });
    } else {
      if (afterSnapshot) {
        this.setSnapshot(afterSnapshot);
        this.releaseInactiveRichAssets(afterSnapshot);
      }
      this.#presentationActive = false;
    }
  }

  presentCountdownBeat(label: "3" | "2" | "1" | "FIGHT"): void {
    if (this.#reducedMotion) {
      this.#playerShot?.setOpacity(1);
      this.#enemyShot?.setOpacity(1);
      return;
    }
    if (label === "3") {
      this.presentEntrance("player", 58);
      this.#enemyShot?.setOpacity(0.48);
      return;
    }
    if (label === "2") {
      this.#playerShot?.setOpacity(0.58);
      this.#enemyShot?.setOpacity(1);
      this.presentEntrance("enemy", 58);
      return;
    }
    if (label === "1") {
      this.#playerShot?.setOpacity(1);
      this.#enemyShot?.setOpacity(1);
      this.tweens.add({
        targets: [
          this.#playerShot?.motionRoot,
          this.#enemyShot?.motionRoot,
        ].filter(Boolean),
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 180,
        ease: "Expo.easeOut",
        yoyo: true,
      });
      return;
    }
    this.#playerShot?.setOpacity(1);
    this.#enemyShot?.setOpacity(1);
    this.cameras.main.flash(90, 242, 215, 66, false);
    this.cameras.main.shake(120, 0.005);
  }

  private syncArt(): void {
    if (!this.#snapshot || !this.#playerShot || !this.#enemyShot) {
      return;
    }
    const player =
      this.#snapshot.player.squad[this.#snapshot.player.activeIndex];
    const enemy = this.#snapshot.enemy.squad[this.#snapshot.enemy.activeIndex];
    if (!player || !enemy) {
      return;
    }
    this.setCharacterShot(this.#playerShot, player.characterId);
    this.setCharacterShot(this.#enemyShot, enemy.characterId);
    this.layout();
  }

  private swapIdleTextures(): void {
    if (!this.#snapshot || !this.#playerShot || !this.#enemyShot) {
      return;
    }
    for (const [side, shot] of [
      ["player", this.#playerShot],
      ["enemy", this.#enemyShot],
    ] as const) {
      const team = this.#snapshot[side];
      const combatant = team.squad[team.activeIndex];
      if (combatant && this.#snapshot.pendingActions[side]) {
        this.presentReaction(combatant.instanceId, "tense");
        continue;
      }
      const character = combatant
        ? combatContent.characters[combatant.characterId]
        : undefined;
      const logicalTextureKey = character
        ? battleIdleTextureId(character, this.#idleFrame as 0 | 1)
        : null;
      const textureKey = logicalTextureKey
        ? this.resolvedTextureKey(logicalTextureKey)
        : null;
      if (!textureKey || !this.textures.exists(textureKey)) {
        continue;
      }
      shot.setTexture(textureKey, {
        crossfade: true,
        reducedMotion: this.#reducedMotion,
      });
    }
  }

  private setCharacterShot(shot: FramedShot, characterId: string): void {
    const character = combatContent.characters[characterId];
    const logicalTextureKey = character
      ? battleIdleTextureId(character, this.#idleFrame as 0 | 1)
      : null;
    const textureKey = logicalTextureKey
      ? this.resolvedTextureKey(logicalTextureKey)
      : null;
    const resolvedTextureKey =
      textureKey && this.textures.exists(textureKey)
        ? textureKey
        : character?.portraitAssetId &&
            this.textures.exists(
              this.resolvedTextureKey(character.portraitAssetId),
            )
          ? this.resolvedTextureKey(character.portraitAssetId)
          : null;
    if (!resolvedTextureKey) {
      shot.showFallback(
        true,
        combatContent.characters[characterId]?.name ?? "UNPRINTED",
      );
      return;
    }
    shot
      .setTexture(resolvedTextureKey, {
        crossfade: false,
        reducedMotion: this.#reducedMotion,
      })
      .showFallback(false)
      .setOpacity(1)
      .resetMotion();
  }

  private layout(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    if (this.#background) {
      const texture = this.#background.texture.getSourceImage() as {
        width: number;
        height: number;
      };
      const cover = Math.max(width / texture.width, height / texture.height);
      this.#background
        .setPosition(width / 2, height / 2)
        .setScale(cover)
        .setAlpha(0.88);
    }

    const panelLayout = calculateBattleLayout(width, height);
    this.#playerShot
      ?.setFrame(panelLayout.playerFrame)
      .setDepth(panelLayout.orientation === "portrait" ? 5 : 4);
    this.#enemyShot?.setFrame(panelLayout.enemyFrame).setDepth(5);
  }

  private pulsePrintLayers(): void {
    if (this.#reducedMotion || this.#presentationActive) {
      return;
    }
    this.#playerShot?.pulse(1);
    this.#enemyShot?.pulse(-1);
  }

  private targetFor(instanceId: string | undefined): {
    shot: FramedShot;
    isPlayer: boolean;
  } | null {
    if (!this.#snapshot) {
      return null;
    }
    const side = activeSideForPresentationTarget(this.#snapshot, instanceId);
    if (!side) {
      return null;
    }
    const shot = side === "player" ? this.#playerShot : this.#enemyShot;
    return shot ? { shot, isPlayer: side === "player" } : null;
  }

  private presentReaction(
    instanceId: string | undefined,
    kind: ReactionKind,
  ): void {
    if (!this.#snapshot) {
      return;
    }
    const side = activeSideForPresentationTarget(this.#snapshot, instanceId);
    if (!side) {
      return;
    }
    const team = this.#snapshot[side];
    const combatant = team.squad[team.activeIndex];
    const character = combatant
      ? combatContent.characters[combatant.characterId]
      : undefined;
    const reactionAssetId = character?.reactionAssetId;
    const shot = side === "player" ? this.#playerShot : this.#enemyShot;
    const reactionTextureKey = reactionAssetId
      ? this.resolvedTextureKey(reactionAssetId)
      : null;
    if (
      !reactionAssetId ||
      !reactionTextureKey ||
      !shot ||
      !this.textures.exists(reactionTextureKey)
    ) {
      return;
    }
    const isReactionSheet = reactionTextureKey === reactionAssetId;
    shot.setTexture(reactionTextureKey, {
      crossfade: true,
      reducedMotion: this.#reducedMotion,
      sourceRegion: isReactionSheet ? REACTION_REGIONS[kind] : null,
      facingOverride: isReactionSheet ? "right" : null,
    });
  }

  private presentOutcomeReactions(snapshot: BattleState): void {
    if (snapshot.outcome === "active") {
      return;
    }
    const winningSide = snapshot.outcome === "playerWon" ? "player" : "enemy";
    for (const side of ["player", "enemy"] as const) {
      const team = snapshot[side];
      const combatant = team.squad[team.activeIndex];
      if (combatant?.instanceId) {
        this.presentReaction(
          combatant.instanceId,
          side === winningSide ? "victory" : "defeated",
        );
      }
    }
  }

  private requestImage(id: string): void {
    const resolved = this.#resolvedImageTextureKeys.get(id);
    if (resolved && this.textures.exists(resolved)) {
      return;
    }
    if (this.#imageLoadRequests.has(id)) {
      return;
    }
    this.#imageLoadRequests.set(id, {
      candidates: imageFallbackChain(id),
      index: 0,
    });
    this.tryNextImageCandidate(id);
  }

  private tryNextImageCandidate(id: string): void {
    const request = this.#imageLoadRequests.get(id);
    if (!request) return;

    while (request.index < request.candidates.length) {
      const candidate = request.candidates[request.index]!;
      if (this.#failedImageCandidateIds.has(candidate.id)) {
        request.index += 1;
        continue;
      }
      if (this.textures.exists(candidate.id)) {
        this.#resolvedImageTextureKeys.set(id, candidate.id);
        this.#imageLoadRequests.delete(id);
        return;
      }
      const existingWaiters = this.#imageCandidateWaiters.get(candidate.id);
      if (existingWaiters) {
        existingWaiters.add(id);
        return;
      }
      this.#imageCandidateWaiters.set(candidate.id, new Set([id]));
      this.load.image(candidate.id, candidate.path);
      return;
    }

    this.#imageLoadRequests.delete(id);
  }

  private onImageFileComplete = (key: string): void => {
    const presentationOwner = this.#presentationOwners.get(key);
    if (
      presentationOwner &&
      !this.#activeRichCharacterIds.has(presentationOwner)
    ) {
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
      this.#presentationOwners.delete(key);
    }

    const waiters = this.#imageCandidateWaiters.get(key);
    if (!waiters) return;
    this.#imageCandidateWaiters.delete(key);
    let retained = false;
    for (const id of waiters) {
      const owner = this.#richImageOwners.get(id);
      if (owner && !this.#activeRichCharacterIds.has(owner)) {
        this.#imageLoadRequests.delete(id);
        this.#richImageOwners.delete(id);
        continue;
      }
      this.#resolvedImageTextureKeys.set(id, key);
      this.#imageLoadRequests.delete(id);
      retained = true;
    }
    if (
      !retained &&
      ![...this.#resolvedImageTextureKeys.values()].includes(key) &&
      this.textures.exists(key)
    ) {
      this.textures.remove(key);
    }
    if (this.scene.isActive()) {
      this.syncArt();
    }
  };

  private onImageFileError = (file: Phaser.Loader.File): void => {
    const key = file.key;
    const waiters = this.#imageCandidateWaiters.get(key);
    if (!waiters) {
      this.#presentationOwners.delete(key);
      return;
    }
    this.#imageCandidateWaiters.delete(key);
    this.#failedImageCandidateIds.add(key);
    for (const id of waiters) {
      const request = this.#imageLoadRequests.get(id);
      if (!request) continue;
      request.index += 1;
      this.tryNextImageCandidate(id);
    }
  };

  private resolvedTextureKey(id: string): string {
    return this.#resolvedImageTextureKeys.get(id) ?? id;
  }

  private queueRichCharacterAssets(characterId: string): void {
    if (this.#loadedRichCharacterIds.has(characterId)) return;
    const character = combatContent.characters[characterId];
    if (!character) return;
    this.#loadedRichCharacterIds.add(characterId);
    const richAssets = richBattleAssetIds(character, combatContent);
    for (const id of richAssets.imageIds) {
      this.#richImageOwners.set(id, characterId);
      this.requestImage(id);
    }
    for (const id of richAssets.presentationIds) {
      const presentation = presentationAssets[id];
      this.#presentationOwners.set(id, characterId);
      if (!presentation?.path || this.textures.exists(id)) continue;
      this.load.image(id, presentation.path);
    }
  }

  private startQueuedLoads(): void {
    if (!this.load.isLoading()) {
      this.load.start();
    }
  }

  private releaseInactiveRichAssets(snapshot: BattleState): void {
    const activeCharacterIds = new Set(activeBattleCharacterIds(snapshot));
    for (const characterId of [...this.#loadedRichCharacterIds]) {
      if (activeCharacterIds.has(characterId)) continue;
      const character = combatContent.characters[characterId];
      if (!character) continue;
      const richAssets = richBattleAssetIds(character, combatContent);
      const retainedByShot = [
        ...richAssets.imageIds,
        ...richAssets.presentationIds,
      ].some((id) => this.textures.exists(id) && this.isShotTextureInUse(id));
      if (retainedByShot) {
        continue;
      }
      for (const id of richAssets.imageIds) {
        for (const waiters of this.#imageCandidateWaiters.values()) {
          waiters.delete(id);
        }
        const resolved = this.#resolvedImageTextureKeys.get(id);
        if (resolved === id && this.textures.exists(id)) {
          this.textures.remove(id);
        }
        this.#resolvedImageTextureKeys.delete(id);
        this.#imageLoadRequests.delete(id);
        this.#richImageOwners.delete(id);
      }
      for (const id of richAssets.presentationIds) {
        if (this.#presentationOwners.get(id) !== characterId) continue;
        if (this.textures.exists(id)) {
          this.textures.remove(id);
          this.#presentationOwners.delete(id);
        }
      }
      this.#loadedRichCharacterIds.delete(characterId);
    }
  }

  private isShotTextureInUse(textureKey: string): boolean {
    return Boolean(
      this.#playerShot?.usesTexture(textureKey) ||
      this.#enemyShot?.usesTexture(textureKey),
    );
  }

  private presentDamage(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      const { shot, isPlayer } = resolved;
      const center = shot.worldCenter;
      this.presentReaction(event.targetId, "hurt");
      const amount = this.add
        .text(
          center.x,
          shot.frame.y + shot.displayHeight * 0.18,
          `-${event.amount ?? 0}`,
          {
            fontFamily: "sans-serif",
            fontSize: `${Math.max(32, this.scale.width * 0.038)}px`,
            fontStyle: "bold",
            color: "#f2d742",
            stroke: "#091128",
            strokeThickness: 10,
          },
        )
        .setOrigin(0.5)
        .setDepth(30);
      if (this.#reducedMotion) {
        this.time.delayedCall(420, () => amount.destroy());
        return;
      }
      this.cameras.main.shake(110, 0.009);
      this.cameras.main.flash(80, 247, 240, 221, false);
      this.presentImpactBurst(center.x, center.y, isPlayer ? -1 : 1);
      this.tweens.add({
        targets: shot.motionRoot,
        x: isPlayer ? -34 : 34,
        angle: isPlayer ? -3 : 3,
        yoyo: true,
        duration: 85,
        ease: "Quad.easeOut",
      });
      this.tweens.add({
        targets: amount,
        y: amount.y - 92,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        duration: IMPACT_VISUAL_MS,
        ease: "Cubic.easeOut",
        onComplete: () => amount.destroy(),
      });
    });
  }

  private presentFloat(
    event: BattleEvent,
    label: string,
    color: string,
    delayMs = 0,
  ): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      const center = resolved.shot.worldCenter;
      const text = this.add
        .text(
          center.x,
          resolved.shot.frame.y + resolved.shot.displayHeight * 0.18,
          label,
          {
            fontFamily: "sans-serif",
            fontSize: `${Math.max(30, this.scale.width * 0.034)}px`,
            fontStyle: "bold",
            color,
            stroke: "#091128",
            strokeThickness: 9,
          },
        )
        .setOrigin(0.5)
        .setDepth(30);
      this.tweens.add({
        targets: text,
        y: text.y - (this.#reducedMotion ? 0 : 72),
        alpha: 0,
        duration: IMPACT_VISUAL_MS,
        ease: "Cubic.easeOut",
        onComplete: () => text.destroy(),
      });
    });
  }

  private presentDodge(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      this.presentReaction(event.targetId, "dodge");
      this.presentImpactWord("DODGE!", "#8de1ff", 0);
      if (this.#reducedMotion) {
        return;
      }
      this.tweens.add({
        targets: resolved.shot.motionRoot,
        x: resolved.isPlayer ? -86 : 86,
        duration: 110,
        ease: "Expo.easeOut",
        hold: 120,
        yoyo: true,
      });
    });
  }

  private presentImpactWord(label: string, color: string, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const width = this.scale.width;
      const height = this.scale.height;
      const text = this.add
        .text(width / 2, height * 0.34, label, {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(42, width * 0.062)}px`,
          fontStyle: "bold",
          color,
          stroke: "#091128",
          strokeThickness: 12,
        })
        .setOrigin(0.5)
        .setDepth(32)
        .setAngle(-3);
      if (!this.#reducedMotion) {
        text.setScale(1.45);
      }
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        alpha: { from: 1, to: 0 },
        duration: this.#reducedMotion ? 620 : IMPACT_VISUAL_MS,
        ease: "Expo.easeOut",
        hold: 160,
        onComplete: () => text.destroy(),
      });
    });
  }

  private presentEntrance(side: Side, distance = 44): void {
    const shot = side === "player" ? this.#playerShot : this.#enemyShot;
    if (!shot?.visible || this.#reducedMotion) {
      return;
    }
    shot.motionRoot.x = side === "player" ? -distance : distance;
    this.tweens.add({
      targets: shot.motionRoot,
      x: 0,
      duration: 240,
      ease: "Expo.easeOut",
    });
  }

  private presentLunge(side: Side, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const shot = side === "player" ? this.#playerShot : this.#enemyShot;
      if (!shot?.visible || this.#reducedMotion) {
        return;
      }
      const focus = shot.worldCenter;
      this.cameras.main.zoomTo(1.11, 150, "Expo.easeOut");
      this.cameras.main.pan(focus.x, focus.y, 150, "Expo.easeOut");
      this.tweens.add({
        targets: shot.motionRoot,
        x: side === "player" ? 78 : -78,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 130,
        ease: "Expo.easeOut",
        hold: 90,
        yoyo: true,
      });
    });
  }

  private presentDefeat(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      const { shot, isPlayer } = resolved;
      this.presentReaction(event.targetId, "defeated");
      this.presentImpactWord("K.O.", "#ef4d39", 0);
      this.tweens.add({
        targets: shot.motionRoot,
        y: this.#reducedMotion ? 0 : 70,
        angle: isPlayer ? -9 : 9,
        alpha: 0.42,
        duration: this.#reducedMotion ? 0 : 320,
        ease: "Cubic.easeIn",
      });
    });
  }

  private presentImpactBurst(x: number, y: number, direction: -1 | 1): void {
    const burst = this.add.graphics().setDepth(29);
    burst.fillStyle(0xf2d742, 0.95);
    burst.fillCircle(0, 0, 30);
    burst.lineStyle(8, 0xf7f0dd, 0.95);
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12;
      const inner = 48 + (index % 2) * 12;
      const outer = 112 + (index % 3) * 18;
      burst.lineBetween(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner,
        Math.cos(angle) * outer,
        Math.sin(angle) * outer,
      );
    }
    burst
      .setPosition(x + direction * 12, y)
      .setScale(this.#reducedMotion ? 0.72 : 0.2)
      .setAngle(direction * 9);
    this.tweens.add({
      targets: burst,
      scaleX: this.#reducedMotion ? 0.72 : 1.15,
      scaleY: this.#reducedMotion ? 0.72 : 1.15,
      alpha: 0,
      duration: this.#reducedMotion ? 380 : 460,
      ease: "Expo.easeOut",
      onComplete: () => burst.destroy(),
    });
  }

  private presentCutIn(actionId: string, side: Side): void {
    const action = combatContent.actions[actionId];
    const activeShot = side === "player" ? this.#playerShot : this.#enemyShot;
    const presentationKey = action?.presentationId;
    const key =
      presentationKey && this.textures.exists(presentationKey)
        ? presentationKey
        : activeShot?.textureKey;
    const width = this.scale.width;
    const height = this.scale.height;
    if (!key || !action || !this.textures.exists(key)) {
      this.presentLunge(side);
      return;
    }

    if (this.#presentationStyle === "comic-panels") {
      this.presentComicCutIn(action.name, key, side);
      return;
    }

    const layout = calculateBattleLayout(width, height);
    const matte = this.add
      .rectangle(
        width / 2,
        height / 2,
        width,
        height,
        side === "player" ? 0xef4d39 : 0xf2d742,
        0.5,
      )
      .setDepth(23);
    const slash = this.add.graphics().setDepth(24);
    slash.fillStyle(0x091128, 0.92);
    slash.fillPoints(
      [
        new Phaser.Geom.Point(width * 0.07, height),
        new Phaser.Geom.Point(width * 0.2, height),
        new Phaser.Geom.Point(width * 0.93, 0),
        new Phaser.Geom.Point(width * 0.8, 0),
      ],
      true,
    );
    const cutIn = new FramedShot(this, {
      side,
      textureKey: key,
      depth: 25,
    });
    cutIn.setFrame(layout.cutInFrame);
    const title = this.add
      .text(
        side === "player"
          ? layout.cutInFrame.x + width * 0.02
          : layout.cutInFrame.x + layout.cutInFrame.width - width * 0.02,
        layout.cutInFrame.y + layout.cutInFrame.height * 0.86,
        action.name.toUpperCase(),
        {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(34, width * 0.052)}px`,
          fontStyle: "bold",
          color: "#f7f0dd",
          stroke: "#091128",
          strokeThickness: 12,
          align: side === "player" ? "left" : "right",
        },
      )
      .setOrigin(side === "player" ? 0 : 1, 0.5)
      .setDepth(27);
    const destroy = (): void => {
      matte.destroy();
      slash.destroy();
      title.destroy();
      cutIn.destroy();
    };

    if (this.#reducedMotion) {
      this.time.delayedCall(760, destroy);
      return;
    }

    const travel = { x: side === "player" ? -width : width };
    cutIn.setPanelOffset(travel.x, 0);
    matte.setAlpha(0);
    slash.setAlpha(0);
    title.setAlpha(0);
    this.tweens.add({
      targets: travel,
      x: 0,
      duration: 220,
      ease: "Expo.easeOut",
      hold: 380,
      yoyo: true,
      onUpdate: () => cutIn.setPanelOffset(travel.x, 0),
      onComplete: destroy,
    });
    this.tweens.add({
      targets: [matte, slash, title],
      alpha: 1,
      duration: 150,
      hold: 520,
      yoyo: true,
    });
  }

  private presentComicCutIn(
    actionName: string,
    actionTextureKey: string,
    side: Side,
  ): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const layout = calculateComicPanelLayout(width, height);
    const activeShot = side === "player" ? this.#playerShot : this.#enemyShot;
    const targetSide = side === "player" ? "enemy" : "player";
    const targetShot =
      targetSide === "player" ? this.#playerShot : this.#enemyShot;
    if (!activeShot || !targetShot) {
      this.presentLunge(side);
      return;
    }

    const matte = this.add
      .rectangle(width / 2, height / 2, width, height, 0x091128, 0.96)
      .setDepth(23);
    const lead = new FramedShot(this, {
      side,
      textureKey: activeShot.textureKey,
      depth: 24,
    }).setFrame(layout.leadFrame);
    const action = new FramedShot(this, {
      side,
      textureKey: actionTextureKey,
      depth: 26,
    }).setFrame(layout.actionFrame);
    const reaction = new FramedShot(this, {
      side: targetSide,
      textureKey: targetShot.textureKey,
      depth: 25,
    }).setFrame(layout.reactionFrame);
    const title = this.add
      .text(
        layout.actionFrame.x + layout.actionFrame.width / 2,
        Math.min(
          height - 18,
          layout.actionFrame.y + layout.actionFrame.height - 18,
        ),
        actionName.toUpperCase(),
        {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(26, Math.min(58, width * 0.05))}px`,
          fontStyle: "bold",
          color: "#f7f0dd",
          stroke: "#091128",
          strokeThickness: 11,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(29)
      .setAngle(-2);
    const captionStock = this.add
      .rectangle(
        layout.actionFrame.x + layout.actionFrame.width / 2,
        Math.min(
          height - 18,
          layout.actionFrame.y + layout.actionFrame.height - 18,
        ),
        Math.min(layout.actionFrame.width * 0.86, title.width + 36),
        title.height + 12,
        side === "player" ? 0xef4d39 : 0xf2d742,
        0.96,
      )
      .setStrokeStyle(5, 0x091128)
      .setDepth(28)
      .setAngle(-2);

    const destroy = (): void => {
      matte.destroy();
      captionStock.destroy();
      title.destroy();
      lead.destroy();
      action.destroy();
      reaction.destroy();
    };
    if (this.#reducedMotion) {
      this.time.delayedCall(760, destroy);
      return;
    }

    const leadTravel = {
      x: layout.orientation === "landscape" ? -width * 0.34 : -width * 0.2,
      y: layout.orientation === "portrait" ? -height * 0.2 : 0,
    };
    const actionTravel = {
      x: 0,
      y: layout.orientation === "portrait" ? height * 0.2 : -height * 0.22,
    };
    const reactionTravel = {
      x: layout.orientation === "landscape" ? width * 0.34 : width * 0.2,
      y: layout.orientation === "portrait" ? height * 0.2 : 0,
    };
    lead.setPanelOffset(leadTravel.x, leadTravel.y);
    action.setPanelOffset(actionTravel.x, actionTravel.y);
    reaction.setPanelOffset(reactionTravel.x, reactionTravel.y);
    lead.motionRoot.setScale(1.14);
    action.motionRoot.setScale(1.08);
    reaction.motionRoot.setScale(1.16);
    matte.setAlpha(0);
    captionStock.setAlpha(0);
    title.setAlpha(0);

    for (const [shot, travel, delay] of [
      [lead, leadTravel, 0],
      [action, actionTravel, 65],
      [reaction, reactionTravel, 120],
    ] as const) {
      this.tweens.add({
        targets: travel,
        x: 0,
        y: 0,
        duration: 260,
        delay,
        ease: "Expo.easeOut",
        onUpdate: () => shot.setPanelOffset(travel.x, travel.y),
      });
      this.tweens.add({
        targets: shot.motionRoot,
        scaleX: 1,
        scaleY: 1,
        duration: 520,
        delay,
        ease: "Expo.easeOut",
      });
    }
    this.tweens.add({
      targets: matte,
      alpha: 0.96,
      duration: 120,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: [captionStock, title],
      alpha: 1,
      duration: 150,
      delay: 150,
      ease: "Quad.easeOut",
    });
    this.time.delayedCall(820, destroy);
  }
}
