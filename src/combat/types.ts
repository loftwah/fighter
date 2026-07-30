export type Side = "player" | "enemy";
export type Difficulty = "easy" | "normal" | "hard" | "brutal";
export type BattleOutcome = "active" | "playerWon" | "enemyWon";

export type ActionPosition =
  "1L" | "1" | "1H" | "2L" | "2" | "2H" | "3L" | "3" | "3H";

export type TargetKind =
  "self" | "activeAlly" | "allAllies" | "activeEnemy" | "allEnemies";

export type CharacterClass =
  "impact" | "feral" | "guile" | "circuit" | "hex" | "guard" | "neutral";

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
    }
  | {
      kind: "heal";
      target: TargetKind;
      power: number;
    }
  | {
      kind: "stun";
      target: TargetKind;
      durationMs: number;
      chance: number;
    }
  | {
      kind: "modifyAttack";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
    }
  | {
      kind: "modifyDefence";
      target: TargetKind;
      magnitude: number;
      durationMs: number;
    }
  | {
      kind: "bar";
      target: "allies" | "enemies";
      amount: number;
    }
  | {
      kind: "shield";
      target: TargetKind;
      amount: number;
      durationMs: number;
    }
  | {
      kind: "cleanse";
      target: TargetKind;
    };

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  position: ActionPosition;
  chargeMs: number;
  effects: ActionEffect[];
  presentationId: string;
  audioId: string;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  lore: string;
  classId: CharacterClass;
  factionId: string;
  level: number;
  baseStats: StatBlock;
  actionIds: [string, string, string];
  portraitAssetId: string;
  idleAssetIds: [string, string];
  musicId: string;
}

export type ActionTier = "stock" | "gold" | "platinum";

export interface CombatantBuild {
  instanceId?: string;
  level?: number;
  statBonuses?: Partial<StatBlock>;
  actionIds?: [string, string, string];
  actionTiers?: Partial<Record<string, ActionTier>>;
  interruptionResistance?: number;
  equippedPatchId?: string | null;
}

export interface StatusState {
  id: string;
  kind: "stun" | "attack" | "defence" | "shield" | "switchLock";
  remainingMs: number;
  magnitude: number;
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
  actionTiers: Record<string, ActionTier>;
  interruptionResistance: number;
  equippedPatchId: string | null;
}

export interface TeamState {
  side: Side;
  bar: number;
  activeIndex: number;
  squad: CombatantState[];
  factionSynergy: number;
  echoChargeBonus: boolean;
}

export interface PendingAction {
  side: Side;
  actionId: string;
  sourceInstanceId: string;
  remainingMs: number;
}

export interface BattleState {
  seed: number;
  rngState: number;
  elapsedMs: number;
  timeLimitMs: number;
  outcome: BattleOutcome;
  difficulty: Difficulty;
  player: TeamState;
  enemy: TeamState;
  pendingActions: Partial<Record<Side, PendingAction>>;
  eventSequence: number;
}

export interface BattleEvent {
  id: number;
  type:
    | "battleStarted"
    | "barChanged"
    | "characterSwitched"
    | "actionStarted"
    | "actionCharged"
    | "actionInterrupted"
    | "interruptionResisted"
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
  amount?: number;
  message?: string;
}

export interface Transition {
  state: BattleState;
  events: BattleEvent[];
}

export type BattleCommand =
  | { kind: "action"; actionId: string }
  | { kind: "switch"; targetIndex: number };

export interface CombatContent {
  actions: Record<string, ActionDefinition>;
  characters: Record<string, CharacterDefinition>;
}
