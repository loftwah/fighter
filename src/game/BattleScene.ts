import Phaser from "phaser";
import {
  presentationAssets,
  resolveImagePath,
  type NormalizedRect,
} from "../assets/registry";
import type { BattleEvent, BattleState, Side } from "../combat/types";
import { combatContent } from "../content/initial-content";
import { FramedShot } from "./presentation/FramedShot";
import { calculateBattleLayout } from "./presentation/framing";
import {
  CHARGED_MOVE_IMPACT_DELAY_MS,
  DAMAGE_STAGGER_MS,
  IMPACT_VISUAL_MS,
  INSTANT_MOVE_IMPACT_DELAY_MS,
  REACTION_IMPACT_DELAY_MS,
} from "./presentation-timing";
import {
  activeSideForPresentationTarget,
  presentationActionSide,
} from "./presentation/targeting";

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
  #presentationActive = false;
  #presentationRun = 0;
  #snapshotArtSignature = "";
  #onReady: (scene: BattleScene) => void;

  constructor(
    onReady: (scene: BattleScene) => void,
    initialSnapshot: BattleState | null = null,
  ) {
    super("battle");
    this.#onReady = onReady;
    this.#initialSnapshot = initialSnapshot;
  }

  preload(): void {
    this.load.image("arena-bg", "/assets/generated/arena-bg.png");
    const encounterCharacterIds = this.#initialSnapshot
      ? new Set(
          (["player", "enemy"] as const).flatMap((side) =>
            this.#initialSnapshot![side].squad.map(
              (combatant) => combatant.characterId,
            ),
          ),
        )
      : new Set(Object.keys(combatContent.characters));
    const encounterCharacters = [...encounterCharacterIds]
      .map((id) => combatContent.characters[id])
      .filter((character) => character !== undefined);
    const imageIds = new Set(
      encounterCharacters.flatMap((character) => {
        const ids = [...character.idleAssetIds, character.portraitAssetId];
        if (character.reactionAssetId) {
          ids.push(character.reactionAssetId);
        }
        return ids;
      }),
    );
    for (const id of imageIds) {
      this.load.image(id, resolveImagePath(id));
    }
    const presentationIds = new Set(
      encounterCharacters.flatMap((character) =>
        character.actionIds
          .map((actionId) => combatContent.actions[actionId]?.presentationId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    for (const id of presentationIds) {
      const presentation = presentationAssets[id];
      if (presentation?.path) {
        this.load.image(presentation.id, presentation.path);
      }
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111f46");
    this.#background = this.add.image(0, 0, "arena-bg").setOrigin(0.5);
    const initialTexture = (
      side: Side,
      fallback: "image.viking.idle.a" | "image.ned-kelly.idle.a",
    ): string => {
      const team = this.#initialSnapshot?.[side];
      const combatant = team?.squad[team.activeIndex];
      return combatant
        ? (combatContent.characters[combatant.characterId]?.idleAssetIds[0] ??
            fallback)
        : fallback;
    };
    this.#playerShot = new FramedShot(this, {
      side: "player",
      textureKey: initialTexture("player", "image.viking.idle.a"),
      depth: 5,
    });
    this.#enemyShot = new FramedShot(this, {
      side: "enemy",
      textureKey: initialTexture("enemy", "image.ned-kelly.idle.a"),
      depth: 4,
    });
    this.scale.on("resize", () => this.layout());
    this.time.addEvent({
      delay: 620,
      loop: true,
      callback: () => {
        if (!this.#reducedMotion && !this.#presentationActive) {
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
    const player =
      snapshot.player.squad[snapshot.player.activeIndex]?.instanceId ?? "";
    const enemy =
      snapshot.enemy.squad[snapshot.enemy.activeIndex]?.instanceId ?? "";
    const signature = `${player}:${enemy}`;
    if (signature !== this.#snapshotArtSignature) {
      this.#snapshotArtSignature = signature;
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
    const types = new Set(events.map((event) => event.type));
    const started = events.find(
      (event) => event.type === "actionStarted" && event.actionId,
    );
    const resolved = types.has("actionCharged");
    const actionSide = presentationActionSide(events);
    let impactDelay = 0;

    if (started?.actionId) {
      this.presentCutIn(started.actionId, started.side ?? "player");
      impactDelay = resolved ? INSTANT_MOVE_IMPACT_DELAY_MS : 0;
      if (resolved) {
        this.presentLunge(
          started.side ?? "player",
          INSTANT_MOVE_IMPACT_DELAY_MS - 140,
        );
      }
    } else if (resolved && actionSide) {
      this.presentLunge(actionSide, CHARGED_MOVE_IMPACT_DELAY_MS - 140);
      impactDelay = CHARGED_MOVE_IMPACT_DELAY_MS;
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
      });
    } else {
      if (afterSnapshot) {
        this.setSnapshot(afterSnapshot);
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
      const keys = combatant
        ? combatContent.characters[combatant.characterId]?.idleAssetIds
        : undefined;
      const textureKey = keys?.[this.#idleFrame] ?? keys?.[0];
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
    const keys = character?.idleAssetIds;
    const textureKey = keys?.[this.#idleFrame] ?? keys?.[0];
    const resolvedTextureKey =
      textureKey && this.textures.exists(textureKey)
        ? textureKey
        : character?.portraitAssetId &&
            this.textures.exists(character.portraitAssetId)
          ? character.portraitAssetId
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
    if (!reactionAssetId || !shot || !this.textures.exists(reactionAssetId)) {
      return;
    }
    shot.setTexture(reactionAssetId, {
      crossfade: true,
      reducedMotion: this.#reducedMotion,
      sourceRegion: REACTION_REGIONS[kind],
      facingOverride: "right",
    });
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
}
