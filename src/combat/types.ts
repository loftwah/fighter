export type Side = "player" | "enemy";
export type Difficulty = "easy" | "normal" | "hard" | "brutal";
export type BattleOutcome = "active" | "playerWon" | "enemyWon";

export type ActionPosition =
  "1L" | "1" | "1H" | "2L" | "2" | "2H" | "3L" | "3" | "3H";

export type MoveCategory =
  | "attack"
  | "teamAttack"
  | "stun"
  | "teamStun"
  | "support"
  | "teamSupport"
  | "strip"
  | "special";

export type TargetKind =
  "self" | "activeAlly" | "allAllies" | "activeEnemy" | "allEnemies";

export type CombatType =
  | "brawler"
  | "sharpshooter"
  | "arcane"
  | "tech"
  | "beast"
  | "oddball"
  | "typeless";

export type CharacterTrait =
  "hero" | "villain" | "monster" | "mythic" | "historic" | "icon";

export type TraitScoreRecord = Record<CharacterTrait, number>;
export type TraitBonusRecord = Record<CharacterTrait, number>;
export type ActionTier = "stock" | "gold" | "platinum";

export interface ActionTierProperties {
  undodgeable?: boolean;
  shieldPiercing?: boolean;
}

export interface StatBlock {
  health: number;
  power: number;
  evasion: number;
  fortune: number;
  tempo: number;
}

export type ActionEffect =
  | {
      kind: "damage";
      target: TargetKind;
      power: number;
      hits?: number;
      undodgeable?: boolean;
      shieldPiercing?: boolean;
      lifeStealRatio?: number;
      requiresHit?: boolean;
    }
  | {
      kind: "heal";
      target: TargetKind;
      power: number;
      requiresHit?: boolean;
    }
  | {
      kind: "damageOverTime";
      target: TargetKind;
      power: number;
      durationMs: number;
      intervalMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "healOverTime";
      target: TargetKind;
      power: number;
      durationMs: number;
      intervalMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "stun";
      target: TargetKind;
      durationMs: number;
      chance: number;
      requiresHit?: boolean;
    }
  | {
      kind: "modifyAttack";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "empowerNextMove";
      target: TargetKind;
      magnitude: number;
      requiresHit?: boolean;
    }
  | {
      kind: "modifyDefence";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "modifyEvasion";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "modifyFortune";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "switchLock";
      target: TargetKind;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "reflectDamage";
      target: TargetKind;
      ratio: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "counterOnDodge";
      target: TargetKind;
      power: number;
      durationMs: number;
      uses?: number;
      requiresHit?: boolean;
    }
  | {
      kind: "bar";
      target: "allies" | "enemies";
      amount: number;
      requiresHit?: boolean;
    }
  | {
      kind: "modifyChargeRate";
      target: "allies" | "enemies";
      multiplier: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "shield";
      target: TargetKind;
      amount: number;
      durationMs: number;
      requiresHit?: boolean;
    }
  | {
      kind: "cleanse";
      target: TargetKind;
      requiresHit?: boolean;
    };

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  position: ActionPosition;
  chargeMs: number;
  interruptionPolicy?: "spend";
  effects: ActionEffect[];
  tierProperties?: Partial<
    Record<Exclude<ActionTier, "stock">, ActionTierProperties>
  >;
  presentationId: string;
  audioId: string;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  lore: string;
  typeId: CombatType;
  traitIds: [] | [CharacterTrait] | [CharacterTrait, CharacterTrait];
  level: number;
  baseStats: StatBlock;
  actionIds: [string, string, string];
  portraitAssetId: string;
  idleAssetIds: [string, string];
  reactionAssetId?: string;
  musicId: string;
}

export type AccessoryEffect =
  | {
      kind: "bar";
      target: "allies" | "enemies";
      amount: number;
    }
  | {
      kind: "modifyChargeRate";
      target: "allies" | "enemies";
      multiplier: number;
      durationMs: number;
    }
  | {
      kind: "heal";
      target: "allies";
      amount: number;
    }
  | {
      kind: "shield";
      target: "allies";
      amount: number;
      durationMs: number;
    }
  | {
      kind: "blockMove";
      target: "enemies";
      slotIndex: 0 | 1 | 2;
      durationMs: number;
    };

export interface AccessoryDefinition {
  id: string;
  name: string;
  description: string;
  imageAssetId: string;
  effects: AccessoryEffect[];
}

export interface CombatantBuild {
  instanceId?: string;
  level?: number;
  statBonuses?: Partial<StatBlock>;
  actionIds?: [string, string, string];
  actionPositions?: Partial<Record<string, ActionPosition>>;
  actionTiers?: Partial<Record<string, ActionTier>>;
  interruptionResistance?: number;
  equippedPatchId?: string | null;
}

export interface StatusState {
  id: string;
  kind:
    | "stun"
    | "attack"
    | "defence"
    | "evasion"
    | "fortune"
    | "shield"
    | "switchLock"
    | "reflection"
    | "dodgeCounter"
    | "damageOverTime"
    | "regeneration"
    | "empower";
  remainingMs: number;
  magnitude: number;
  intervalMs?: number;
  nextTickMs?: number;
  remainingTriggers?: number;
  sourceId?: string;
  sourceSide?: Side;
  actionId?: string;
}

export type TeamStatusState =
  | {
      id: string;
      kind: "chargeRate";
      remainingMs: number;
      multiplier: number;
    }
  | {
      id: string;
      kind: "moveBlock";
      remainingMs: number;
      slotIndex: 0 | 1 | 2;
    };

export interface AccessoryState {
  accessoryId: string;
  charge: number;
  activations: number;
}

export type BattlePickupKind = "battery" | "repair" | "surge";

export interface BattlePickup {
  id: string;
  kind: BattlePickupKind;
  side: Side;
  amount: number;
  remainingMs: number;
}

export interface CombatantState {
  instanceId: string;
  side: Side;
  characterId: string;
  level: number;
  stats: StatBlock;
  currentHealth: number;
  maxHealth: number;
  statuses: StatusState[];
  actionIds: [string, string, string];
  actionPositions: Partial<Record<string, ActionPosition>>;
  actionTiers: Record<string, ActionTier>;
  interruptionResistance: number;
  equippedPatchId: string | null;
}

export interface TeamState {
  side: Side;
  bar: number;
  activeIndex: number;
  squad: CombatantState[];
  traitScores: TraitScoreRecord;
  traitBonuses: TraitBonusRecord;
  echoChargeBonus: boolean;
  statuses: TeamStatusState[];
  accessory: AccessoryState | null;
}

export interface PendingAction {
  side: Side;
  actionId: string;
  sourceInstanceId: string;
  lockedTargetIds: Partial<Record<TargetKind, string[]>>;
  remainingMs: number;
}

export interface BattleState {
  seed: number;
  rngState: number;
  dropRngState: number;
  elapsedMs: number;
  timeLimitMs: number;
  outcome: BattleOutcome;
  difficulty: Difficulty;
  player: TeamState;
  enemy: TeamState;
  pickups: BattlePickup[];
  pickupSequence: number;
  pendingActions: Partial<Record<Side, PendingAction>>;
  eventSequence: number;
}

export interface BattleEvent {
  id: number;
  type:
    | "battleStarted"
    | "barChanged"
    | "accessoryCharged"
    | "accessoryActivated"
    | "pickupDropped"
    | "pickupCollected"
    | "pickupExpired"
    | "characterSwitched"
    | "actionStarted"
    | "actionCharged"
    | "actionInterrupted"
    | "interruptionResisted"
    | "reactionTriggered"
    | "damageApplied"
    | "healingApplied"
    | "statusApplied"
    | "statusRemoved"
    | "characterDodged"
    | "criticalHit"
    | "characterDefeated"
    | "battleEnded"
    | "commandRejected";
  side?: Side;
  sourceId?: string;
  targetId?: string;
  actionId?: string;
  reactionId?: string;
  triggerEventId?: number;
  amount?: number;
  message?: string;
  periodic?: boolean;
  reactionKind?: "reflection" | "counter";
}

export interface Transition {
  state: BattleState;
  events: BattleEvent[];
}

export type BattleCommand =
  | { kind: "action"; actionId: string }
  | { kind: "switch"; targetIndex: number }
  | { kind: "accessory" }
  | { kind: "pickup"; pickupId: string }
  | { kind: "forfeit" };

export interface CombatContent {
  actions: Record<string, ActionDefinition>;
  characters: Record<string, CharacterDefinition>;
  accessories: Record<string, AccessoryDefinition>;
}
