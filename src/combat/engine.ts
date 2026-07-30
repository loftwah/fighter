import { nextRandom, randomBetween } from "./rng";
import {
  actionPositionForCombatant,
  chargePerSecond,
  hasStatus,
  historicOpeningCharge,
  isAlive,
  monsterDamageMultiplier,
  POSITION_RULES,
  statusMagnitude,
  TIER_MULTIPLIERS,
  traitSynergy,
  typeMultiplier,
} from "./rules";
import type {
  ActionDefinition,
  AccessoryDefinition,
  BattleCommand,
  BattleEvent,
  BattleState,
  CharacterDefinition,
  CombatantBuild,
  CombatContent,
  CombatantState,
  Difficulty,
  PendingAction,
  Side,
  StatusState,
  TeamStatusState,
  TargetKind,
  TeamState,
  TraitBonusRecord,
  Transition,
} from "./types";

export interface CreateBattleInput {
  playerCharacterIds: string[];
  playerBuilds?: CombatantBuild[];
  enemyCharacterIds: string[];
  enemyBuilds?: CombatantBuild[];
  playerStartingBar?: number;
  enemyStartingBar?: number;
  playerAccessoryId?: string;
  enemyAccessoryId?: string;
  seed: number;
  difficulty: Difficulty;
  timeLimitMs?: number;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

function opposingSide(side: Side): Side {
  return side === "player" ? "enemy" : "player";
}

function teamFor(state: BattleState, side: Side): TeamState {
  return state[side];
}

function sideForCombatant(combatant: CombatantState): Side {
  return combatant.side;
}

function characterFor(
  content: CombatContent,
  combatant: CombatantState,
): CharacterDefinition {
  const definition = content.characters[combatant.characterId];
  if (!definition) {
    throw new Error(`Missing character definition: ${combatant.characterId}`);
  }
  return definition;
}

function actionFor(content: CombatContent, actionId: string): ActionDefinition {
  const action = content.actions[actionId];
  if (!action) {
    throw new Error(`Missing action definition: ${actionId}`);
  }
  return action;
}

function accessoryFor(
  content: CombatContent,
  accessoryId: string,
): AccessoryDefinition {
  const accessory = content.accessories[accessoryId];
  if (!accessory) {
    throw new Error(`Missing Accessory definition: ${accessoryId}`);
  }
  return accessory;
}

function activeCombatant(team: TeamState): CombatantState {
  const combatant = team.squad[team.activeIndex];
  if (!combatant) {
    throw new Error(`Team ${team.side} has no active combatant`);
  }
  return combatant;
}

function createCombatant(
  definition: CharacterDefinition,
  side: Side,
  index: number,
  traitBonuses: TraitBonusRecord,
  build: CombatantBuild | undefined,
): CombatantState {
  const level = clamp(build?.level ?? definition.level, 1, 25);
  const heroHealthBonus = traitBonuses.hero;
  const baseHealth =
    definition.baseStats.health + (build?.statBonuses?.health ?? 0);
  const stats = {
    health: baseHealth + heroHealthBonus,
    power:
      definition.baseStats.power +
      (build?.statBonuses?.power ?? 0) +
      traitBonuses.villain,
    evasion: definition.baseStats.evasion + (build?.statBonuses?.evasion ?? 0),
    fortune:
      definition.baseStats.fortune +
      (build?.statBonuses?.fortune ?? 0) +
      traitBonuses.icon,
    tempo: definition.baseStats.tempo + (build?.statBonuses?.tempo ?? 0),
  };
  const actionIds = build?.actionIds ?? definition.actionIds;
  const maxHealth = Math.round(
    baseHealth * (1 + (level - 1) * 0.035) + heroHealthBonus,
  );
  return {
    instanceId: build?.instanceId ?? `${side}.${index}.${definition.id}`,
    side,
    characterId: definition.id,
    level,
    stats,
    currentHealth: maxHealth,
    maxHealth,
    statuses: [],
    actionIds,
    actionPositions: { ...build?.actionPositions },
    actionTiers: Object.fromEntries(
      actionIds.map((actionId) => [
        actionId,
        build?.actionTiers?.[actionId] ?? "stock",
      ]),
    ),
    interruptionResistance: clamp(build?.interruptionResistance ?? 0, 0, 1),
    equippedPatchId: build?.equippedPatchId ?? null,
  };
}

export function createBattle(
  input: CreateBattleInput,
  content: CombatContent,
): Transition {
  if (
    input.playerCharacterIds.length < 1 ||
    input.playerCharacterIds.length > 3 ||
    input.enemyCharacterIds.length < 1 ||
    input.enemyCharacterIds.length > 3
  ) {
    throw new Error("A battle requires one to three Characters per side");
  }

  const buildTeam = (
    side: Side,
    ids: string[],
    builds: CombatantBuild[] | undefined,
    startingBar: number,
    accessoryId: string | undefined,
  ): TeamState => {
    if (builds && builds.length !== ids.length) {
      throw new Error(
        `Team ${side} build count must match its Character count`,
      );
    }
    const definitions = ids.map((id) => {
      const definition = content.characters[id];
      if (!definition) {
        throw new Error(`Missing character definition: ${id}`);
      }
      return definition;
    });
    const synergy = traitSynergy(definitions);
    const echoChargeBonus = ids.length === 3 && new Set(ids).size === 1;

    return {
      side,
      bar: clamp(startingBar + historicOpeningCharge(synergy.bonuses), 0, 100),
      activeIndex: 0,
      squad: definitions.map((definition, index) =>
        createCombatant(
          definition,
          side,
          index,
          synergy.bonuses,
          builds?.[index],
        ),
      ),
      traitScores: synergy.scores,
      traitBonuses: synergy.bonuses,
      echoChargeBonus,
      statuses: [],
      accessory: accessoryId
        ? {
            accessoryId: accessoryFor(content, accessoryId).id,
            charge: 0,
            activations: 0,
          }
        : null,
    };
  };

  const state: BattleState = {
    seed: input.seed,
    rngState: input.seed >>> 0,
    dropRngState: (input.seed ^ 0x9e3779b9) >>> 0,
    elapsedMs: 0,
    timeLimitMs: input.timeLimitMs ?? 90_000,
    outcome: "active",
    difficulty: input.difficulty,
    player: buildTeam(
      "player",
      input.playerCharacterIds,
      input.playerBuilds,
      input.playerStartingBar ?? 0,
      input.playerAccessoryId,
    ),
    enemy: buildTeam(
      "enemy",
      input.enemyCharacterIds,
      input.enemyBuilds,
      input.enemyStartingBar ?? 0,
      input.enemyAccessoryId,
    ),
    pickups: [],
    pickupSequence: 0,
    pendingActions: {},
    eventSequence: 1,
  };

  return {
    state,
    events: [{ id: 0, type: "battleStarted" }],
  };
}

function emit(
  state: BattleState,
  events: BattleEvent[],
  event: Omit<BattleEvent, "id">,
): BattleEvent {
  const emitted = { ...event, id: state.eventSequence };
  events.push(emitted);
  state.eventSequence += 1;
  return emitted;
}

function reject(state: BattleState, message: string, side: Side): Transition {
  const events: BattleEvent[] = [];
  emit(state, events, { type: "commandRejected", side, message });
  return { state, events };
}

const PICKUP_DROP_CHANCE = 0.24;
const PICKUP_LIFETIME_MS = 7_000;
const PICKUP_MAX_PER_SIDE = 2;

function maybeDropPickup(
  state: BattleState,
  events: BattleEvent[],
  side: Side,
): void {
  if (
    state.pickups.filter((pickup) => pickup.side === side).length >=
    PICKUP_MAX_PER_SIDE
  ) {
    return;
  }
  const chanceRoll = nextRandom(state.dropRngState);
  state.dropRngState = chanceRoll.state;
  if (chanceRoll.value >= PICKUP_DROP_CHANCE) {
    return;
  }
  const kindRoll = nextRandom(state.dropRngState);
  state.dropRngState = kindRoll.state;
  const team = teamFor(state, side);
  const kind =
    kindRoll.value < 0.5 && team.accessory
      ? ("battery" as const)
      : kindRoll.value < 0.78
        ? ("repair" as const)
        : ("surge" as const);
  const amount = kind === "battery" ? 28 : kind === "repair" ? 16 : 18;
  state.pickups.push({
    id: `pickup.${side}.${state.pickupSequence}`,
    kind,
    side,
    amount,
    remainingMs: PICKUP_LIFETIME_MS,
  });
  state.pickupSequence += 1;
  emit(state, events, {
    type: "pickupDropped",
    side,
    amount,
    message: kind,
  });
}

function targetsFor(
  state: BattleState,
  side: Side,
  target: TargetKind,
): CombatantState[] {
  const allies = teamFor(state, side);
  const enemies = teamFor(state, opposingSide(side));
  switch (target) {
    case "self":
    case "activeAlly":
      return [activeCombatant(allies)];
    case "allAllies":
      return allies.squad.filter(isAlive);
    case "activeEnemy":
      return [activeCombatant(enemies)];
    case "allEnemies":
      return enemies.squad.filter(isAlive);
  }
}

function lockedTargetsFor(
  state: BattleState,
  pending: PendingAction,
  target: TargetKind,
): CombatantState[] {
  const lockedIds = pending.lockedTargetIds[target];
  if (!lockedIds) {
    return targetsFor(state, pending.side, target);
  }
  return lockedIds
    .map((instanceId) => combatantForInstance(state, instanceId))
    .filter((combatant): combatant is CombatantState => Boolean(combatant));
}

function captureLockedTargets(
  state: BattleState,
  side: Side,
  action: ActionDefinition,
): Partial<Record<TargetKind, string[]>> {
  const targetKinds = new Set<TargetKind>();
  for (const effect of action.effects) {
    if (effect.kind !== "bar" && effect.kind !== "modifyChargeRate") {
      targetKinds.add(effect.target);
    }
  }
  return Object.fromEntries(
    [...targetKinds].map((target) => [
      target,
      targetsFor(state, side, target).map((combatant) => combatant.instanceId),
    ]),
  );
}

function appendStatus(
  state: BattleState,
  events: BattleEvent[],
  side: Side,
  target: CombatantState,
  status: Omit<StatusState, "id">,
): void {
  const id = `${status.kind}.${state.eventSequence}.${target.instanceId}`;
  target.statuses.push({ ...status, id });
  emit(state, events, {
    type: "statusApplied",
    side,
    targetId: target.instanceId,
    amount: status.magnitude,
    message: status.kind,
  });
}

function appendTeamStatus(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  status:
    | Omit<Extract<TeamStatusState, { kind: "chargeRate" }>, "id">
    | Omit<Extract<TeamStatusState, { kind: "moveBlock" }>, "id">,
): void {
  const id = `${status.kind}.${state.eventSequence}.${team.side}`;
  if (status.kind === "chargeRate") {
    team.statuses.push({ ...status, id });
  } else {
    team.statuses.push({ ...status, id });
  }
  emit(state, events, {
    type: "statusApplied",
    side: team.side,
    amount: status.kind === "chargeRate" ? status.multiplier : status.slotIndex,
    message: status.kind,
  });
}

function interruptPending(
  state: BattleState,
  events: BattleEvent[],
  side: Side,
  target: CombatantState,
): void {
  const pending = state.pendingActions[side];
  if (pending?.sourceInstanceId !== target.instanceId) {
    return;
  }
  if (target.interruptionResistance > 0) {
    const resistanceRoll = nextRandom(state.rngState);
    state.rngState = resistanceRoll.state;
    if (resistanceRoll.value < target.interruptionResistance) {
      emit(state, events, {
        type: "interruptionResisted",
        side,
        sourceId: target.instanceId,
        actionId: pending.actionId,
      });
      return;
    }
  }
  delete state.pendingActions[side];
  emit(state, events, {
    type: "actionInterrupted",
    side,
    sourceId: target.instanceId,
    actionId: pending.actionId,
  });
}

function absorbShieldDamage(
  state: BattleState,
  events: BattleEvent[],
  target: CombatantState,
  incomingAmount: number,
): number {
  let remainingAmount = incomingAmount;
  const retained: StatusState[] = [];
  for (const status of target.statuses) {
    if (status.kind !== "shield" || remainingAmount <= 0) {
      retained.push(status);
      continue;
    }
    const absorbed = Math.min(status.magnitude, remainingAmount);
    remainingAmount -= absorbed;
    const remainingShield = status.magnitude - absorbed;
    if (remainingShield > 0) {
      retained.push({ ...status, magnitude: remainingShield });
    } else {
      emit(state, events, {
        type: "statusRemoved",
        side: target.side,
        targetId: target.instanceId,
        message: status.kind,
      });
    }
  }
  target.statuses = retained;
  return Math.max(0, Math.round(remainingAmount));
}

interface ReactionSignal {
  kind: "reflection" | "counter";
  reactorId: string;
  targetId: string;
  amount: number;
  sourceActionId?: string;
  triggerActionId: string;
  triggerEventId: number;
}

function combatantForInstance(
  state: BattleState,
  instanceId: string,
): CombatantState | undefined {
  return [...state.player.squad, ...state.enemy.squad].find(
    (combatant) => combatant.instanceId === instanceId,
  );
}

function applyReactionDamage(
  state: BattleState,
  events: BattleEvent[],
  signal: ReactionSignal,
): void {
  const reactor = combatantForInstance(state, signal.reactorId);
  const target = combatantForInstance(state, signal.targetId);
  if (!reactor || !target || !isAlive(target) || signal.amount <= 0) {
    return;
  }
  emit(state, events, {
    type: "reactionTriggered",
    side: reactor.side,
    sourceId: reactor.instanceId,
    targetId: target.instanceId,
    actionId: signal.triggerActionId,
    reactionId: signal.sourceActionId,
    triggerEventId: signal.triggerEventId,
    reactionKind: signal.kind,
    message: signal.kind,
  });
  const resistedAmount = Math.max(
    1,
    Math.round(
      signal.amount *
        monsterDamageMultiplier(teamFor(state, target.side).traitBonuses),
    ),
  );
  const appliedAmount = absorbShieldDamage(
    state,
    events,
    target,
    resistedAmount,
  );
  target.currentHealth = Math.max(0, target.currentHealth - appliedAmount);
  emit(state, events, {
    type: "damageApplied",
    side: reactor.side,
    sourceId: reactor.instanceId,
    targetId: target.instanceId,
    actionId: signal.triggerActionId,
    reactionId: signal.sourceActionId,
    triggerEventId: signal.triggerEventId,
    amount: appliedAmount,
    reactionKind: signal.kind,
  });
  if (appliedAmount > 0) {
    interruptPending(state, events, target.side, target);
  }
}

function queueDodgeCounter(
  state: BattleState,
  events: BattleEvent[],
  queue: ReactionSignal[],
  reactor: CombatantState,
  attacker: CombatantState,
  triggerActionId: string,
  triggerEventId: number,
): void {
  const counters = reactor.statuses.filter(
    (status) => status.kind === "dodgeCounter",
  );
  if (counters.length === 0) {
    return;
  }
  const counterIds = new Set(counters.map((status) => status.id));
  reactor.statuses = reactor.statuses.flatMap((status) => {
    if (!counterIds.has(status.id)) {
      return [status];
    }
    const remainingTriggers = (status.remainingTriggers ?? 1) - 1;
    if (remainingTriggers > 0) {
      return [{ ...status, remainingTriggers }];
    }
    emit(state, events, {
      type: "statusRemoved",
      side: reactor.side,
      targetId: reactor.instanceId,
      message: status.kind,
    });
    return [];
  });
  for (const counter of counters) {
    queue.push({
      kind: "counter",
      reactorId: reactor.instanceId,
      targetId: attacker.instanceId,
      amount: Math.max(1, Math.round(counter.magnitude)),
      sourceActionId: counter.actionId,
      triggerActionId,
      triggerEventId,
    });
  }
}

function queueReflection(
  queue: ReactionSignal[],
  reactor: CombatantState,
  attacker: CombatantState,
  incomingHealthDamage: number,
  triggerActionId: string,
  triggerEventId: number,
): void {
  if (!isAlive(reactor)) {
    return;
  }
  const reflections = reactor.statuses.filter(
    (status) => status.kind === "reflection" && status.magnitude > 0,
  );
  if (reflections.length === 0 || incomingHealthDamage <= 0) {
    return;
  }
  for (const reflection of reflections) {
    queue.push({
      kind: "reflection",
      reactorId: reactor.instanceId,
      targetId: attacker.instanceId,
      amount: Math.max(
        1,
        Math.round(incomingHealthDamage * clamp(reflection.magnitude, 0, 1)),
      ),
      sourceActionId: reflection.actionId,
      triggerActionId,
      triggerEventId,
    });
  }
}

interface DamageResult {
  landed: boolean;
  amount: number;
}

function damageOne(
  state: BattleState,
  events: BattleEvent[],
  content: CombatContent,
  side: Side,
  source: CombatantState,
  target: CombatantState,
  action: ActionDefinition,
  power: number,
  reactionQueue: ReactionSignal[],
  options: {
    shieldPiercing: boolean;
    undodgeable: boolean;
  },
): DamageResult {
  const sourceDefinition = characterFor(content, source);
  const targetDefinition = characterFor(content, target);
  const sourceStats = source.stats;
  const targetSide = target.side;

  const dodgeRoll = nextRandom(state.rngState);
  state.rngState = dodgeRoll.state;
  const defenceDown = statusMagnitude(target, "defence") > 0;
  const evasionModifier = statusMagnitude(target, "evasion");
  const dodgeChance = defenceDown
    ? 0
    : clamp((target.stats.evasion + evasionModifier) * 0.012, 0, 0.55);
  if (!options.undodgeable && dodgeRoll.value < dodgeChance) {
    const dodgeEvent = emit(state, events, {
      type: "characterDodged",
      side: targetSide,
      sourceId: source.instanceId,
      targetId: target.instanceId,
      actionId: action.id,
    });
    queueDodgeCounter(
      state,
      events,
      reactionQueue,
      target,
      source,
      action.id,
      dodgeEvent.id,
    );
    return { landed: false, amount: 0 };
  }

  const criticalRoll = nextRandom(state.rngState);
  state.rngState = criticalRoll.state;
  const fortuneModifier = statusMagnitude(source, "fortune");
  const criticalChance = clamp(
    (sourceStats.fortune + fortuneModifier) * 0.02,
    0,
    0.65,
  );
  const critical = criticalRoll.value < criticalChance;
  if (critical) {
    emit(state, events, {
      type: "criticalHit",
      side,
      sourceId: source.instanceId,
      targetId: target.instanceId,
      actionId: action.id,
    });
  }

  const varianceRoll = randomBetween(state.rngState, 0.94, 1.06);
  state.rngState = varianceRoll.state;
  const position = POSITION_RULES[actionPositionForCombatant(source, action)];
  const tier = source.actionTiers[action.id] ?? "stock";
  const levelGrowth = 1 + (source.level - 1) * 0.035;
  const powerGrowth = 1 + sourceStats.power * 0.035;
  const attackModifier = clamp(1 + statusMagnitude(source, "attack"), 0.25, 4);
  const defenceModifier = clamp(1 + statusMagnitude(target, "defence"), 0.4, 3);
  const typeEffect = typeMultiplier(
    sourceDefinition.typeId,
    targetDefinition.typeId,
  );
  let amount = Math.max(
    1,
    Math.round(
      power *
        position.multiplier *
        TIER_MULTIPLIERS[tier] *
        levelGrowth *
        powerGrowth *
        attackModifier *
        defenceModifier *
        typeEffect *
        varianceRoll.value *
        (critical ? 1.55 : 1),
    ),
  );
  amount = Math.max(
    1,
    Math.round(
      amount *
        monsterDamageMultiplier(teamFor(state, target.side).traitBonuses),
    ),
  );

  if (!options.shieldPiercing) {
    amount = absorbShieldDamage(state, events, target, amount);
  }

  target.currentHealth = Math.max(0, target.currentHealth - amount);
  const damageEvent = emit(state, events, {
    type: "damageApplied",
    side,
    sourceId: source.instanceId,
    targetId: target.instanceId,
    actionId: action.id,
    amount,
  });

  if (amount > 0) {
    interruptPending(state, events, targetSide, target);
    queueReflection(
      reactionQueue,
      target,
      source,
      amount,
      action.id,
      damageEvent.id,
    );
  }

  return { landed: true, amount };
}

function healOne(
  state: BattleState,
  events: BattleEvent[],
  side: Side,
  source: CombatantState,
  target: CombatantState,
  action: ActionDefinition,
  power: number,
): void {
  const tier = source.actionTiers[action.id] ?? "stock";
  const amount = Math.max(
    1,
    Math.round(
      power *
        POSITION_RULES[actionPositionForCombatant(source, action)].multiplier *
        TIER_MULTIPLIERS[tier] *
        (1 + source.level * 0.025),
    ),
  );
  const before = target.currentHealth;
  target.currentHealth = Math.min(target.maxHealth, before + amount);
  emit(state, events, {
    type: "healingApplied",
    side,
    sourceId: source.instanceId,
    targetId: target.instanceId,
    actionId: action.id,
    amount: target.currentHealth - before,
  });
}

function periodicEffectMagnitude(
  source: CombatantState,
  action: ActionDefinition,
  power: number,
): number {
  const tier = source.actionTiers[action.id] ?? "stock";
  return Math.max(
    1,
    Math.round(
      power *
        POSITION_RULES[actionPositionForCombatant(source, action)].multiplier *
        TIER_MULTIPLIERS[tier] *
        (1 + source.level * 0.025),
    ),
  );
}

function resolveAction(
  state: BattleState,
  events: BattleEvent[],
  content: CombatContent,
  pending: PendingAction,
): void {
  const team = teamFor(state, pending.side);
  const source = team.squad.find(
    (combatant) => combatant.instanceId === pending.sourceInstanceId,
  );
  if (!source || !isAlive(source)) {
    return;
  }
  const action = actionFor(content, pending.actionId);
  const tier = source.actionTiers[action.id] ?? "stock";
  const tierMultiplier = TIER_MULTIPLIERS[tier];
  const utilityMultiplier =
    POSITION_RULES[actionPositionForCombatant(source, action)].multiplier *
    tierMultiplier;
  const hitTargets = new Set<string>();
  const reactionQueue: ReactionSignal[] = [];
  const firstResolutionEventIndex = events.length;
  const livingBefore = new Set(
    [...state.player.squad, ...state.enemy.squad]
      .filter(isAlive)
      .map((combatant) => combatant.instanceId),
  );
  emit(state, events, {
    type: "actionCharged",
    side: pending.side,
    sourceId: source.instanceId,
    actionId: action.id,
  });

  for (const effect of action.effects) {
    if (!isAlive(source)) {
      break;
    }
    if (effect.kind === "bar") {
      if (effect.requiresHit && hitTargets.size === 0) {
        continue;
      }
      const targetSide =
        effect.target === "allies" ? pending.side : opposingSide(pending.side);
      const targetTeam = teamFor(state, targetSide);
      targetTeam.bar = clamp(
        targetTeam.bar + effect.amount * utilityMultiplier,
        0,
        100,
      );
      emit(state, events, {
        type: "barChanged",
        side: targetSide,
        amount: targetTeam.bar,
      });
      continue;
    }
    if (effect.kind === "modifyChargeRate") {
      if (effect.requiresHit && hitTargets.size === 0) {
        continue;
      }
      const targetSide =
        effect.target === "allies" ? pending.side : opposingSide(pending.side);
      appendTeamStatus(state, events, teamFor(state, targetSide), {
        kind: "chargeRate",
        multiplier: effect.multiplier,
        remainingMs: Math.round(effect.durationMs * utilityMultiplier),
      });
      continue;
    }

    const targets = lockedTargetsFor(state, pending, effect.target);
    const distributesPool =
      effect.target === "allEnemies" || effect.target === "allAllies";
    for (const target of targets) {
      if (!isAlive(source)) {
        break;
      }
      if (!isAlive(target)) {
        continue;
      }
      if (effect.requiresHit) {
        const requirementMet =
          target.side === pending.side
            ? hitTargets.size > 0
            : hitTargets.has(target.instanceId);
        if (!requirementMet) {
          continue;
        }
      }
      switch (effect.kind) {
        case "damage": {
          const hits = Math.max(1, effect.hits ?? 1);
          let totalDamage = 0;
          for (
            let hit = 0;
            hit < hits && isAlive(source) && isAlive(target);
            hit += 1
          ) {
            const result = damageOne(
              state,
              events,
              content,
              pending.side,
              source,
              target,
              action,
              distributesPool ? effect.power / targets.length : effect.power,
              reactionQueue,
              {
                shieldPiercing: effect.shieldPiercing ?? false,
                undodgeable: effect.undodgeable ?? false,
              },
            );
            if (result.landed) {
              hitTargets.add(target.instanceId);
              totalDamage += result.amount;
            }
          }
          if (
            (effect.lifeStealRatio ?? 0) > 0 &&
            totalDamage > 0 &&
            isAlive(source)
          ) {
            const before = source.currentHealth;
            source.currentHealth = Math.min(
              source.maxHealth,
              before + Math.round(totalDamage * effect.lifeStealRatio!),
            );
            emit(state, events, {
              type: "healingApplied",
              side: pending.side,
              sourceId: source.instanceId,
              targetId: source.instanceId,
              actionId: action.id,
              amount: source.currentHealth - before,
            });
          }
          break;
        }
        case "heal":
          healOne(
            state,
            events,
            pending.side,
            source,
            target,
            action,
            distributesPool ? effect.power / targets.length : effect.power,
          );
          break;
        case "damageOverTime":
        case "healOverTime": {
          appendStatus(state, events, sideForCombatant(target), target, {
            kind:
              effect.kind === "damageOverTime"
                ? "damageOverTime"
                : "regeneration",
            magnitude: periodicEffectMagnitude(
              source,
              action,
              distributesPool ? effect.power / targets.length : effect.power,
            ),
            remainingMs: effect.durationMs,
            intervalMs: effect.intervalMs,
            nextTickMs: effect.intervalMs,
            sourceId: source.instanceId,
            sourceSide: pending.side,
            actionId: action.id,
          });
          break;
        }
        case "stun": {
          const roll = nextRandom(state.rngState);
          state.rngState = roll.state;
          if (roll.value < effect.chance) {
            const targetSide = sideForCombatant(target);
            appendStatus(state, events, targetSide, target, {
              kind: "stun",
              magnitude: 1,
              remainingMs: Math.round(effect.durationMs * utilityMultiplier),
            });
            interruptPending(state, events, targetSide, target);
          }
          break;
        }
        case "modifyAttack":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "attack",
            magnitude: effect.magnitude * utilityMultiplier,
            remainingMs: effect.durationMs,
          });
          break;
        case "modifyDefence":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "defence",
            magnitude: effect.magnitude * utilityMultiplier,
            remainingMs: effect.durationMs,
          });
          break;
        case "modifyEvasion":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "evasion",
            magnitude: effect.magnitude * utilityMultiplier,
            remainingMs: effect.durationMs,
          });
          break;
        case "modifyFortune":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "fortune",
            magnitude: effect.magnitude * utilityMultiplier,
            remainingMs: effect.durationMs,
          });
          break;
        case "switchLock":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "switchLock",
            magnitude: 1,
            remainingMs: Math.round(effect.durationMs * utilityMultiplier),
          });
          break;
        case "reflectDamage":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "reflection",
            magnitude: clamp(effect.ratio * utilityMultiplier, 0, 1),
            remainingMs: effect.durationMs,
            sourceId: source.instanceId,
            sourceSide: pending.side,
            actionId: action.id,
          });
          break;
        case "counterOnDodge":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "dodgeCounter",
            magnitude: periodicEffectMagnitude(
              source,
              action,
              distributesPool ? effect.power / targets.length : effect.power,
            ),
            remainingMs: effect.durationMs,
            remainingTriggers: effect.uses ?? 1,
            sourceId: source.instanceId,
            sourceSide: pending.side,
            actionId: action.id,
          });
          break;
        case "shield":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "shield",
            magnitude: effect.amount * utilityMultiplier,
            remainingMs: effect.durationMs,
          });
          break;
        case "cleanse":
          target.statuses = target.statuses.filter((status) => {
            const retain =
              status.kind === "shield" ||
              status.kind === "regeneration" ||
              status.kind === "reflection" ||
              status.kind === "dodgeCounter" ||
              (status.kind === "attack" && status.magnitude > 0) ||
              (status.kind === "defence" && status.magnitude < 0) ||
              (status.kind === "evasion" && status.magnitude > 0) ||
              (status.kind === "fortune" && status.magnitude > 0);
            if (!retain) {
              emit(state, events, {
                type: "statusRemoved",
                side: sideForCombatant(target),
                targetId: target.instanceId,
                message: status.kind,
              });
            }
            return retain;
          });
          break;
      }
    }
  }

  const dealtDirectDamage = events
    .slice(firstResolutionEventIndex)
    .some(
      (event) =>
        event.type === "damageApplied" &&
        event.sourceId === source.instanceId &&
        event.actionId === action.id &&
        (event.amount ?? 0) > 0 &&
        !event.reactionKind,
    );
  if (dealtDirectDamage) {
    maybeDropPickup(state, events, pending.side);
  }

  for (const signal of reactionQueue) {
    applyReactionDamage(state, events, signal);
  }
  for (const combatant of [...state.player.squad, ...state.enemy.squad]) {
    if (livingBefore.has(combatant.instanceId) && !isAlive(combatant)) {
      emit(state, events, {
        type: "characterDefeated",
        side: combatant.side,
        targetId: combatant.instanceId,
      });
    }
  }
  selectNextActive(state, pending.side, events);
  selectNextActive(state, opposingSide(pending.side), events);
  checkOutcome(state, events);
}

function selectNextActive(
  state: BattleState,
  side: Side,
  events: BattleEvent[],
): void {
  const team = teamFor(state, side);
  const current = team.squad[team.activeIndex];
  if (current && isAlive(current)) {
    return;
  }
  const nextIndex = team.squad.findIndex(isAlive);
  if (nextIndex >= 0 && nextIndex !== team.activeIndex) {
    team.activeIndex = nextIndex;
    emit(state, events, {
      type: "characterSwitched",
      side,
      targetId: activeCombatant(team).instanceId,
    });
  }
}

function survivingHealthRatio(team: TeamState): number {
  const current = team.squad.reduce(
    (sum, combatant) => sum + combatant.currentHealth,
    0,
  );
  const maximum = team.squad.reduce(
    (sum, combatant) => sum + combatant.maxHealth,
    0,
  );
  return maximum > 0 ? current / maximum : 0;
}

function checkOutcome(state: BattleState, events: BattleEvent[]): void {
  if (state.outcome !== "active") {
    return;
  }
  const playerAlive = state.player.squad.some(isAlive);
  const enemyAlive = state.enemy.squad.some(isAlive);
  if (playerAlive && enemyAlive && state.elapsedMs < state.timeLimitMs) {
    return;
  }

  if (!playerAlive && !enemyAlive) {
    state.outcome =
      state.difficulty === "easy" || state.difficulty === "normal"
        ? "playerWon"
        : "enemyWon";
  } else if (!enemyAlive) {
    state.outcome = "playerWon";
  } else if (!playerAlive) {
    state.outcome = "enemyWon";
  } else {
    const playerRatio = survivingHealthRatio(state.player);
    const enemyRatio = survivingHealthRatio(state.enemy);
    if (playerRatio === enemyRatio) {
      state.outcome =
        state.difficulty === "easy" || state.difficulty === "normal"
          ? "playerWon"
          : "enemyWon";
    } else {
      state.outcome = playerRatio > enemyRatio ? "playerWon" : "enemyWon";
    }
  }

  state.pendingActions = {};
  emit(state, events, {
    type: "battleEnded",
    side: state.outcome === "playerWon" ? "player" : "enemy",
    message: state.outcome,
  });
}

export function requestAction(
  sourceState: BattleState,
  side: Side,
  actionId: string,
  content: CombatContent,
): Transition {
  const state = structuredClone(sourceState);
  if (state.outcome !== "active") {
    return reject(state, "The fight is already over.", side);
  }
  if (state.pendingActions[side]) {
    return reject(state, "That Character is already charging a Move.", side);
  }

  const team = teamFor(state, side);
  const source = activeCombatant(team);
  if (!isAlive(source) || hasStatus(source, "stun")) {
    return reject(state, "That Character cannot act right now.", side);
  }
  if (!source.actionIds.includes(actionId)) {
    return reject(
      state,
      "That Move does not belong to the active Character.",
      side,
    );
  }
  const actionSlotIndex = source.actionIds.indexOf(actionId);
  if (
    team.statuses.some(
      (status) =>
        status.kind === "moveBlock" &&
        status.slotIndex === actionSlotIndex &&
        status.remainingMs > 0,
    )
  ) {
    return reject(state, "That Move slot is temporarily blocked.", side);
  }
  const action = actionFor(content, actionId);
  const cost = POSITION_RULES[actionPositionForCombatant(source, action)].cost;
  if (team.bar < cost) {
    return reject(state, `This Move needs ${cost} Charge.`, side);
  }

  team.bar = clamp(team.bar - cost, 0, 100);
  const events: BattleEvent[] = [];
  emit(state, events, {
    type: "barChanged",
    side,
    amount: team.bar,
  });
  emit(state, events, {
    type: "actionStarted",
    side,
    sourceId: source.instanceId,
    actionId,
  });
  if (team.accessory) {
    const before = team.accessory.charge;
    team.accessory.charge = clamp(before + 18 + cost * 0.18, 0, 100);
    if (team.accessory.charge !== before) {
      emit(state, events, {
        type: "accessoryCharged",
        side,
        amount: team.accessory.charge,
        message: team.accessory.accessoryId,
      });
    }
  }
  const pending: PendingAction = {
    side,
    actionId,
    sourceInstanceId: source.instanceId,
    lockedTargetIds: captureLockedTargets(state, side, action),
    remainingMs: action.chargeMs,
  };

  if (action.chargeMs > 0) {
    state.pendingActions[side] = pending;
  } else {
    resolveAction(state, events, content, pending);
  }

  return { state, events };
}

export function requestSwitch(
  sourceState: BattleState,
  side: Side,
  targetIndex: number,
): Transition {
  const state = structuredClone(sourceState);
  const team = teamFor(state, side);
  const current = activeCombatant(team);
  const target = team.squad[targetIndex];
  if (state.outcome !== "active") {
    return reject(state, "The fight is already over.", side);
  }
  if (state.pendingActions[side]) {
    return reject(state, "Finish the current Move before switching.", side);
  }
  if (hasStatus(current, "stun") || hasStatus(current, "switchLock")) {
    return reject(state, "A status is preventing this switch.", side);
  }
  if (!target || !isAlive(target)) {
    return reject(state, "Choose a living Character from the Lineup.", side);
  }
  if (targetIndex === team.activeIndex) {
    return reject(state, "That Character is already active.", side);
  }
  team.activeIndex = targetIndex;
  const events: BattleEvent[] = [];
  emit(state, events, {
    type: "characterSwitched",
    side,
    sourceId: current.instanceId,
    targetId: target.instanceId,
  });
  return { state, events };
}

export function requestAccessory(
  sourceState: BattleState,
  side: Side,
  content: CombatContent,
): Transition {
  const state = structuredClone(sourceState);
  if (state.outcome !== "active") {
    return reject(state, "The fight is already over.", side);
  }
  if (state.pendingActions[side]) {
    return reject(state, "Finish the current Move first.", side);
  }
  const team = teamFor(state, side);
  const source = activeCombatant(team);
  if (!isAlive(source) || hasStatus(source, "stun")) {
    return reject(state, "That side cannot use an Accessory now.", side);
  }
  if (!team.accessory) {
    return reject(state, "No Accessory was selected.", side);
  }
  if (team.accessory.charge < 100) {
    return reject(
      state,
      `This Accessory needs ${Math.ceil(100 - team.accessory.charge)} more charge.`,
      side,
    );
  }

  const accessory = accessoryFor(content, team.accessory.accessoryId);
  team.accessory.charge = 0;
  team.accessory.activations += 1;
  const events: BattleEvent[] = [];
  emit(state, events, {
    type: "accessoryActivated",
    side,
    sourceId: source.instanceId,
    message: accessory.id,
  });
  for (const effect of accessory.effects) {
    const targetSide = effect.target === "allies" ? side : opposingSide(side);
    const targetTeam = teamFor(state, targetSide);
    if (effect.kind === "bar") {
      targetTeam.bar = clamp(targetTeam.bar + effect.amount, 0, 100);
      emit(state, events, {
        type: "barChanged",
        side: targetSide,
        amount: targetTeam.bar,
      });
    } else if (effect.kind === "modifyChargeRate") {
      appendTeamStatus(state, events, targetTeam, {
        kind: "chargeRate",
        multiplier: effect.multiplier,
        remainingMs: effect.durationMs,
      });
    } else if (effect.kind === "heal") {
      for (const target of targetTeam.squad.filter(isAlive)) {
        const before = target.currentHealth;
        target.currentHealth = Math.min(
          target.maxHealth,
          target.currentHealth + effect.amount,
        );
        const restored = target.currentHealth - before;
        if (restored > 0) {
          emit(state, events, {
            type: "healingApplied",
            side,
            sourceId: source.instanceId,
            targetId: target.instanceId,
            amount: restored,
            message: accessory.id,
          });
        }
      }
    } else if (effect.kind === "shield") {
      for (const target of targetTeam.squad.filter(isAlive)) {
        appendStatus(state, events, targetSide, target, {
          kind: "shield",
          magnitude: effect.amount,
          remainingMs: effect.durationMs,
          sourceId: source.instanceId,
          sourceSide: side,
        });
      }
    } else {
      appendTeamStatus(state, events, targetTeam, {
        kind: "moveBlock",
        slotIndex: effect.slotIndex,
        remainingMs: effect.durationMs,
      });
    }
  }
  return { state, events };
}

export function requestPickup(
  sourceState: BattleState,
  side: Side,
  pickupId: string,
): Transition {
  const state = structuredClone(sourceState);
  if (state.outcome !== "active") {
    return reject(state, "The fight is already over.", side);
  }
  const pickup = state.pickups.find(
    (candidate) => candidate.id === pickupId && candidate.side === side,
  );
  if (!pickup) {
    return reject(state, "That battle pickup is no longer available.", side);
  }
  const team = teamFor(state, side);
  const active = activeCombatant(team);
  const events: BattleEvent[] = [];
  state.pickups = state.pickups.filter(
    (candidate) => candidate.id !== pickup.id,
  );

  if (pickup.kind === "battery" && team.accessory) {
    team.accessory.charge = clamp(
      team.accessory.charge + pickup.amount,
      0,
      100,
    );
    emit(state, events, {
      type: "accessoryCharged",
      side,
      amount: team.accessory.charge,
      message: team.accessory.accessoryId,
    });
  } else if (pickup.kind === "repair") {
    const before = active.currentHealth;
    active.currentHealth = Math.min(
      active.maxHealth,
      active.currentHealth + pickup.amount,
    );
    if (active.currentHealth > before) {
      emit(state, events, {
        type: "healingApplied",
        side,
        sourceId: active.instanceId,
        targetId: active.instanceId,
        amount: active.currentHealth - before,
        message: pickup.kind,
      });
    }
  } else if (pickup.kind === "surge") {
    team.bar = clamp(team.bar + pickup.amount, 0, 100);
    emit(state, events, {
      type: "barChanged",
      side,
      amount: team.bar,
    });
  }

  emit(state, events, {
    type: "pickupCollected",
    side,
    sourceId: active.instanceId,
    amount: pickup.amount,
    message: pickup.kind,
  });
  return { state, events };
}

export function forfeitBattle(
  sourceState: BattleState,
  side: Side,
): Transition {
  const state = structuredClone(sourceState);
  if (state.outcome !== "active") {
    return reject(state, "The fight is already over.", side);
  }
  state.outcome = side === "player" ? "enemyWon" : "playerWon";
  state.pendingActions = {};
  const events: BattleEvent[] = [];
  emit(state, events, {
    type: "battleEnded",
    side: opposingSide(side),
    message: `${side}Forfeited`,
  });
  return { state, events };
}

function tickStatuses(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  deltaMs: number,
): void {
  for (const combatant of team.squad) {
    const retained: StatusState[] = [];
    for (const status of combatant.statuses) {
      let nextTickMs =
        status.nextTickMs === undefined
          ? undefined
          : status.nextTickMs - deltaMs;
      const activeDeltaMs = Math.min(deltaMs, status.remainingMs);
      if (nextTickMs !== undefined) {
        nextTickMs += deltaMs - activeDeltaMs;
      }
      while (
        nextTickMs !== undefined &&
        nextTickMs <= 0 &&
        status.intervalMs &&
        isAlive(combatant)
      ) {
        nextTickMs += status.intervalMs;
        if (status.kind === "damageOverTime") {
          const amount = Math.min(
            combatant.currentHealth,
            Math.max(
              1,
              Math.round(
                status.magnitude * monsterDamageMultiplier(team.traitBonuses),
              ),
            ),
          );
          combatant.currentHealth = Math.max(
            0,
            combatant.currentHealth - amount,
          );
          emit(state, events, {
            type: "damageApplied",
            side: status.sourceSide ?? opposingSide(team.side),
            sourceId: status.sourceId,
            targetId: combatant.instanceId,
            actionId: status.actionId,
            amount,
            periodic: true,
          });
          if (amount > 0) {
            interruptPending(state, events, team.side, combatant);
          }
          if (!isAlive(combatant)) {
            emit(state, events, {
              type: "characterDefeated",
              side: team.side,
              targetId: combatant.instanceId,
            });
          }
        }
        if (status.kind === "regeneration" && isAlive(combatant)) {
          const before = combatant.currentHealth;
          combatant.currentHealth = Math.min(
            combatant.maxHealth,
            before + Math.max(1, Math.round(status.magnitude)),
          );
          const amount = combatant.currentHealth - before;
          if (amount > 0) {
            emit(state, events, {
              type: "healingApplied",
              side: status.sourceSide ?? team.side,
              sourceId: status.sourceId,
              targetId: combatant.instanceId,
              actionId: status.actionId,
              amount,
              periodic: true,
            });
          }
        }
      }
      const remainingMs = status.remainingMs - deltaMs;
      if (remainingMs <= 0) {
        emit(state, events, {
          type: "statusRemoved",
          side: team.side,
          targetId: combatant.instanceId,
          message: status.kind,
        });
      } else {
        retained.push({ ...status, remainingMs, nextTickMs });
      }
    }
    combatant.statuses = retained;
  }
}

function tickTeamStatuses(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  deltaMs: number,
): void {
  const retained: TeamStatusState[] = [];
  for (const status of team.statuses) {
    const remainingMs = status.remainingMs - deltaMs;
    if (remainingMs <= 0) {
      emit(state, events, {
        type: "statusRemoved",
        side: team.side,
        message: status.kind,
      });
    } else {
      retained.push({ ...status, remainingMs });
    }
  }
  team.statuses = retained;
}

function tickPickups(
  state: BattleState,
  events: BattleEvent[],
  deltaMs: number,
): void {
  state.pickups = state.pickups.flatMap((pickup) => {
    const remainingMs = pickup.remainingMs - deltaMs;
    if (remainingMs > 0) {
      return [{ ...pickup, remainingMs }];
    }
    emit(state, events, {
      type: "pickupExpired",
      side: pickup.side,
      amount: pickup.amount,
      message: pickup.kind,
    });
    return [];
  });
}

function tickBar(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  deltaMs: number,
): void {
  const active = activeCombatant(team);
  if (hasStatus(active, "stun")) {
    return;
  }
  const chargeRateMultiplier = team.statuses
    .filter((status) => status.kind === "chargeRate")
    .reduce((multiplier, status) => multiplier * status.multiplier, 1);
  const perSecond =
    chargePerSecond(active.stats.tempo, team.echoChargeBonus) *
    (1 + team.traitBonuses.mythic) *
    chargeRateMultiplier;
  const before = team.bar;
  team.bar = clamp(team.bar + perSecond * (deltaMs / 1000), 0, 100);
  if (Math.floor(team.bar) !== Math.floor(before)) {
    emit(state, events, {
      type: "barChanged",
      side: team.side,
      amount: team.bar,
    });
  }
}

export function tickBattle(
  sourceState: BattleState,
  deltaMs: number,
  content: CombatContent,
): Transition {
  const state = structuredClone(sourceState);
  if (state.outcome !== "active") {
    return { state, events: [] };
  }
  const events: BattleEvent[] = [];
  const remainingBattleMs = Math.max(0, state.timeLimitMs - state.elapsedMs);
  const safeDelta = clamp(deltaMs, 0, Math.min(250, remainingBattleMs));
  if (safeDelta <= 0) {
    checkOutcome(state, events);
    return { state, events };
  }
  state.elapsedMs += safeDelta;
  tickBar(state, events, state.player, safeDelta);
  tickBar(state, events, state.enemy, safeDelta);
  tickStatuses(state, events, state.player, safeDelta);
  tickStatuses(state, events, state.enemy, safeDelta);
  selectNextActive(state, "player", events);
  selectNextActive(state, "enemy", events);
  checkOutcome(state, events);
  if (state.outcome !== "active") {
    return { state, events };
  }
  tickTeamStatuses(state, events, state.player, safeDelta);
  tickTeamStatuses(state, events, state.enemy, safeDelta);
  tickPickups(state, events, safeDelta);

  for (const side of ["player", "enemy"] as const) {
    const pending = state.pendingActions[side];
    if (!pending) {
      continue;
    }
    pending.remainingMs -= safeDelta;
    if (pending.remainingMs <= 0) {
      delete state.pendingActions[side];
      resolveAction(state, events, content, pending);
    }
  }

  checkOutcome(state, events);
  return { state, events };
}

export function chooseAiCommand(
  state: BattleState,
  content: CombatContent,
): BattleCommand | null {
  if (state.outcome !== "active" || state.pendingActions.enemy) {
    return null;
  }
  const team = state.enemy;
  const active = activeCombatant(team);
  if (!isAlive(active) || hasStatus(active, "stun")) {
    return null;
  }
  const usefulPickup = state.pickups.find((pickup) => {
    if (pickup.side !== "enemy") {
      return false;
    }
    if (pickup.kind === "battery") {
      return Boolean(team.accessory && team.accessory.charge < 100);
    }
    if (pickup.kind === "repair") {
      return active.currentHealth < active.maxHealth;
    }
    return team.bar < 100;
  });
  if (usefulPickup) {
    return { kind: "pickup", pickupId: usefulPickup.id };
  }
  if (team.accessory?.charge === 100) {
    const accessory = accessoryFor(content, team.accessory.accessoryId);
    const hasValue = accessory.effects.some((effect) => {
      const targetTeam = effect.target === "allies" ? team : state.player;
      if (effect.kind === "bar") {
        return effect.amount > 0 ? targetTeam.bar < 100 : targetTeam.bar > 0;
      }
      if (effect.kind === "modifyChargeRate") {
        return !targetTeam.statuses.some(
          (status) =>
            status.kind === "chargeRate" &&
            (effect.multiplier < 1
              ? status.multiplier <= effect.multiplier
              : status.multiplier >= effect.multiplier),
        );
      }
      if (effect.kind === "heal") {
        return targetTeam.squad.some(
          (combatant) =>
            isAlive(combatant) && combatant.currentHealth < combatant.maxHealth,
        );
      }
      if (effect.kind === "shield") {
        return targetTeam.squad.some(
          (combatant) =>
            isAlive(combatant) &&
            !combatant.statuses.some((status) => status.kind === "shield"),
        );
      }
      return !targetTeam.statuses.some(
        (status) =>
          status.kind === "moveBlock" && status.slotIndex === effect.slotIndex,
      );
    });
    if (hasValue) {
      return { kind: "accessory" };
    }
  }
  const alliesNeedHealing = team.squad.some(
    (combatant) =>
      isAlive(combatant) && combatant.currentHealth < combatant.maxHealth,
  );
  const missingHealthFor = (target: TargetKind) =>
    targetsFor(state, "enemy", target).reduce(
      (total, combatant) =>
        total +
        (isAlive(combatant)
          ? combatant.maxHealth - combatant.currentHealth
          : 0),
      0,
    );
  const actionScore = (action: ActionDefinition) =>
    action.effects.reduce((total, effect) => {
      if (effect.kind === "damage") {
        return total + effect.power * (effect.hits ?? 1);
      }
      if (effect.kind === "damageOverTime") {
        return (
          total +
          effect.power *
            Math.max(1, Math.floor(effect.durationMs / effect.intervalMs))
        );
      }
      if (effect.kind === "heal") {
        return missingHealthFor(effect.target) > 0
          ? total + effect.power * 0.65
          : total;
      }
      if (effect.kind === "healOverTime") {
        return missingHealthFor(effect.target) > 0
          ? total +
              effect.power *
                Math.max(1, Math.floor(effect.durationMs / effect.intervalMs)) *
                0.55
          : total;
      }
      if (effect.kind === "stun") {
        return total + effect.durationMs * effect.chance * 0.02;
      }
      return total + 3;
    }, 0);
  const affordableFor = (combatant: CombatantState) =>
    combatant.actionIds
      .map((id, slotIndex) => ({ action: actionFor(content, id), slotIndex }))
      .filter(
        ({ action, slotIndex }) =>
          POSITION_RULES[actionPositionForCombatant(combatant, action)].cost <=
            team.bar &&
          !team.statuses.some(
            (status) =>
              status.kind === "moveBlock" &&
              status.slotIndex === slotIndex &&
              status.remainingMs > 0,
          ),
      )
      .map(({ action }) => action);
  const available = affordableFor(active).filter(
    (action) => actionScore(action) > 0,
  );
  const activeCanPressure = available.some((action) =>
    action.effects.some(
      (effect) => effect.kind === "damage" || effect.kind === "damageOverTime",
    ),
  );
  if (
    !hasStatus(active, "switchLock") &&
    !activeCanPressure &&
    !alliesNeedHealing
  ) {
    const pressureIndex = team.squad.findIndex(
      (combatant, index) =>
        index !== team.activeIndex &&
        isAlive(combatant) &&
        affordableFor(combatant).some((action) =>
          action.effects.some(
            (effect) =>
              effect.kind === "damage" || effect.kind === "damageOverTime",
          ),
        ),
    );
    if (pressureIndex >= 0) {
      return { kind: "switch", targetIndex: pressureIndex };
    }
  }
  if (available.length === 0) {
    return null;
  }

  if (state.difficulty === "easy") {
    return {
      kind: "action",
      actionId: available[0]?.id ?? active.actionIds[0],
    };
  }

  const scored = available
    .map((action) => ({
      action,
      score: actionScore(action),
    }))
    .sort((left, right) => right.score - left.score);

  if (state.difficulty === "normal" && scored.length > 1) {
    const index = state.eventSequence % 3 === 0 ? 1 : 0;
    return {
      kind: "action",
      actionId: scored[index]?.action.id ?? scored[0]!.action.id,
    };
  }

  return { kind: "action", actionId: scored[0]!.action.id };
}

export function predictedDamage(
  state: BattleState,
  side: Side,
  actionId: string,
  content: CombatContent,
): number {
  const source = activeCombatant(teamFor(state, side));
  const target = activeCombatant(teamFor(state, opposingSide(side)));
  const sourceDefinition = characterFor(content, source);
  const targetDefinition = characterFor(content, target);
  const action = actionFor(content, actionId);
  const damage = action.effects.find((effect) => effect.kind === "damage");
  if (!damage || damage.kind !== "damage") {
    return 0;
  }
  const tier = source.actionTiers[action.id] ?? "stock";
  const targetCount =
    damage.target === "allEnemies"
      ? teamFor(state, opposingSide(side)).squad.filter(isAlive).length
      : 1;
  const distributedPower = damage.power / Math.max(1, targetCount);
  return Math.max(
    1,
    Math.round(
      distributedPower *
        (damage.hits ?? 1) *
        POSITION_RULES[actionPositionForCombatant(source, action)].multiplier *
        TIER_MULTIPLIERS[tier] *
        (1 + (source.level - 1) * 0.035) *
        (1 + source.stats.power * 0.035) *
        typeMultiplier(sourceDefinition.typeId, targetDefinition.typeId) *
        monsterDamageMultiplier(teamFor(state, target.side).traitBonuses),
    ),
  );
}
