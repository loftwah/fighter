import { nextRandom, randomBetween } from "./rng";
import {
  chargePerSecond,
  classMultiplier,
  hasStatus,
  isAlive,
  POSITION_RULES,
  statusMagnitude,
  TIER_MULTIPLIERS,
} from "./rules";
import type {
  ActionDefinition,
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
  TargetKind,
  TeamState,
  Transition,
} from "./types";

export interface CreateBattleInput {
  playerCharacterIds: string[];
  playerBuilds?: CombatantBuild[];
  enemyCharacterIds: string[];
  enemyBuilds?: CombatantBuild[];
  playerStartingBar?: number;
  enemyStartingBar?: number;
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
  vitalityBonus: number,
  build: CombatantBuild | undefined,
): CombatantState {
  const level = clamp(build?.level ?? definition.level, 1, 25);
  const stats = {
    health: definition.baseStats.health + (build?.statBonuses?.health ?? 0),
    power: definition.baseStats.power + (build?.statBonuses?.power ?? 0),
    evasion: definition.baseStats.evasion + (build?.statBonuses?.evasion ?? 0),
    fortune: definition.baseStats.fortune + (build?.statBonuses?.fortune ?? 0),
    tempo: definition.baseStats.tempo + (build?.statBonuses?.tempo ?? 0),
  };
  const actionIds = build?.actionIds ?? definition.actionIds;
  const maxHealth = Math.round(
    stats.health * (1 + (level - 1) * 0.035) * (1 + vitalityBonus * 0.02),
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

function factionSynergy(definitions: CharacterDefinition[]): number {
  const counts = new Map<string, number>();
  for (const definition of definitions) {
    counts.set(
      definition.factionId,
      (counts.get(definition.factionId) ?? 0) + 1,
    );
  }
  return Math.max(0, ...counts.values());
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
    throw new Error("A battle requires one to three Relics per side");
  }

  const buildTeam = (
    side: Side,
    ids: string[],
    builds: CombatantBuild[] | undefined,
    startingBar: number,
  ): TeamState => {
    if (builds && builds.length !== ids.length) {
      throw new Error(`Team ${side} build count must match its Relic count`);
    }
    const definitions = ids.map((id) => {
      const definition = content.characters[id];
      if (!definition) {
        throw new Error(`Missing character definition: ${id}`);
      }
      return definition;
    });
    const synergy = factionSynergy(definitions);
    const vitalityBonus = synergy >= 2 ? 2 : 0;
    const echoChargeBonus = ids.length === 3 && new Set(ids).size === 1;

    return {
      side,
      bar: clamp(startingBar, 0, 100),
      activeIndex: 0,
      squad: definitions.map((definition, index) =>
        createCombatant(
          definition,
          side,
          index,
          vitalityBonus,
          builds?.[index],
        ),
      ),
      factionSynergy: synergy,
      echoChargeBonus,
    };
  };

  const state: BattleState = {
    seed: input.seed,
    rngState: input.seed >>> 0,
    elapsedMs: 0,
    timeLimitMs: input.timeLimitMs ?? 90_000,
    outcome: "active",
    difficulty: input.difficulty,
    player: buildTeam(
      "player",
      input.playerCharacterIds,
      input.playerBuilds,
      input.playerStartingBar ?? 0,
    ),
    enemy: buildTeam(
      "enemy",
      input.enemyCharacterIds,
      input.enemyBuilds,
      input.enemyStartingBar ?? 0,
    ),
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
): void {
  events.push({ ...event, id: state.eventSequence });
  state.eventSequence += 1;
}

function reject(state: BattleState, message: string, side: Side): Transition {
  const events: BattleEvent[] = [];
  emit(state, events, { type: "commandRejected", side, message });
  return { state, events };
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

function damageOne(
  state: BattleState,
  events: BattleEvent[],
  content: CombatContent,
  side: Side,
  source: CombatantState,
  target: CombatantState,
  action: ActionDefinition,
  power: number,
): void {
  const sourceDefinition = characterFor(content, source);
  const targetDefinition = characterFor(content, target);
  const sourceStats = source.stats;
  const targetSide = opposingSide(side);

  const dodgeRoll = nextRandom(state.rngState);
  state.rngState = dodgeRoll.state;
  const defenceDown = statusMagnitude(target, "defence") > 0;
  const dodgeChance = defenceDown
    ? 0
    : clamp(target.stats.evasion * 0.012, 0, 0.28);
  if (dodgeRoll.value < dodgeChance) {
    emit(state, events, {
      type: "characterDodged",
      side: targetSide,
      sourceId: source.instanceId,
      targetId: target.instanceId,
      actionId: action.id,
    });
    return;
  }

  const criticalRoll = nextRandom(state.rngState);
  state.rngState = criticalRoll.state;
  const criticalChance = clamp(sourceStats.fortune * 0.02, 0, 0.35);
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
  const position = POSITION_RULES[action.position];
  const tier = source.actionTiers[action.id] ?? "stock";
  const levelGrowth = 1 + (source.level - 1) * 0.035;
  const synergyPower = teamFor(state, side).factionSynergy >= 3 ? 2 : 0;
  const powerGrowth = 1 + (sourceStats.power + synergyPower) * 0.035;
  const attackModifier = clamp(1 + statusMagnitude(source, "attack"), 0.25, 4);
  const defenceModifier = clamp(1 + statusMagnitude(target, "defence"), 0.4, 3);
  const classEffect = classMultiplier(
    sourceDefinition.classId,
    targetDefinition.classId,
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
        classEffect *
        varianceRoll.value *
        (critical ? 1.55 : 1),
    ),
  );

  const shield = statusMagnitude(target, "shield");
  if (shield > 0) {
    amount = Math.max(0, amount - shield);
  }

  target.currentHealth = Math.max(0, target.currentHealth - amount);
  emit(state, events, {
    type: "damageApplied",
    side,
    sourceId: source.instanceId,
    targetId: target.instanceId,
    actionId: action.id,
    amount,
  });

  if (amount > 0) {
    interruptPending(state, events, targetSide, target);
  }

  if (!isAlive(target)) {
    emit(state, events, {
      type: "characterDefeated",
      side: targetSide,
      targetId: target.instanceId,
    });
  }
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
        POSITION_RULES[action.position].multiplier *
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
  emit(state, events, {
    type: "actionCharged",
    side: pending.side,
    sourceId: source.instanceId,
    actionId: action.id,
  });

  for (const effect of action.effects) {
    if (effect.kind === "bar") {
      const targetSide =
        effect.target === "allies" ? pending.side : opposingSide(pending.side);
      const targetTeam = teamFor(state, targetSide);
      targetTeam.bar = clamp(targetTeam.bar + effect.amount, 0, 100);
      emit(state, events, {
        type: "barChanged",
        side: targetSide,
        amount: targetTeam.bar,
      });
      continue;
    }

    const targets = targetsFor(state, pending.side, effect.target);
    const distributesPool =
      effect.target === "allEnemies" || effect.target === "allAllies";
    for (const target of targets) {
      if (!isAlive(target)) {
        continue;
      }
      switch (effect.kind) {
        case "damage": {
          const hits = Math.max(1, effect.hits ?? 1);
          for (let hit = 0; hit < hits && isAlive(target); hit += 1) {
            damageOne(
              state,
              events,
              content,
              pending.side,
              source,
              target,
              action,
              distributesPool ? effect.power / targets.length : effect.power,
            );
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
        case "stun": {
          const roll = nextRandom(state.rngState);
          state.rngState = roll.state;
          if (roll.value < effect.chance) {
            const targetSide = sideForCombatant(target);
            appendStatus(state, events, targetSide, target, {
              kind: "stun",
              magnitude: 1,
              remainingMs: effect.durationMs,
            });
            interruptPending(state, events, targetSide, target);
          }
          break;
        }
        case "modifyAttack":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "attack",
            magnitude: effect.magnitude,
            remainingMs: effect.durationMs,
          });
          break;
        case "modifyDefence":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "defence",
            magnitude: effect.magnitude,
            remainingMs: effect.durationMs,
          });
          break;
        case "shield":
          appendStatus(state, events, sideForCombatant(target), target, {
            kind: "shield",
            magnitude: effect.amount,
            remainingMs: effect.durationMs,
          });
          break;
        case "cleanse":
          target.statuses = target.statuses.filter((status) => {
            const retain =
              status.kind === "shield" ||
              (status.kind === "attack" && status.magnitude > 0) ||
              (status.kind === "defence" && status.magnitude < 0);
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

  if (!enemyAlive) {
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
    return reject(state, "That Relic is already charging a Move.", side);
  }

  const team = teamFor(state, side);
  const source = activeCombatant(team);
  if (!isAlive(source) || hasStatus(source, "stun")) {
    return reject(state, "That Relic cannot act right now.", side);
  }
  if (!source.actionIds.includes(actionId)) {
    return reject(
      state,
      "That Move does not belong to the active Relic.",
      side,
    );
  }
  const action = actionFor(content, actionId);
  const cost = POSITION_RULES[action.position].cost;
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
  const pending: PendingAction = {
    side,
    actionId,
    sourceInstanceId: source.instanceId,
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
    return reject(state, "Choose a living Relic from the Lineup.", side);
  }
  if (targetIndex === team.activeIndex) {
    return reject(state, "That Relic is already active.", side);
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

function tickStatuses(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  deltaMs: number,
): void {
  for (const combatant of team.squad) {
    const retained: StatusState[] = [];
    for (const status of combatant.statuses) {
      const remainingMs = status.remainingMs - deltaMs;
      if (remainingMs <= 0) {
        emit(state, events, {
          type: "statusRemoved",
          side: team.side,
          targetId: combatant.instanceId,
          message: status.kind,
        });
      } else {
        retained.push({ ...status, remainingMs });
      }
    }
    combatant.statuses = retained;
  }
}

function tickBar(
  state: BattleState,
  events: BattleEvent[],
  team: TeamState,
  deltaMs: number,
): void {
  const active = activeCombatant(team);
  const perSecond = chargePerSecond(active.stats.tempo, team.echoChargeBonus);
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
  tickStatuses(state, events, state.player, safeDelta);
  tickStatuses(state, events, state.enemy, safeDelta);
  tickBar(state, events, state.player, safeDelta);
  tickBar(state, events, state.enemy, safeDelta);

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
  const available = active.actionIds
    .map((id) => actionFor(content, id))
    .filter((action) => POSITION_RULES[action.position].cost <= team.bar);
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
      score: action.effects.reduce((total, effect) => {
        if (effect.kind === "damage") {
          return total + effect.power * (effect.hits ?? 1);
        }
        if (effect.kind === "heal") {
          return total + effect.power * 0.65;
        }
        if (effect.kind === "stun") {
          return total + effect.durationMs * effect.chance * 0.02;
        }
        return total + 3;
      }, 0),
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
  const synergyPower = teamFor(state, side).factionSynergy >= 3 ? 2 : 0;
  return Math.max(
    1,
    Math.round(
      distributedPower *
        (damage.hits ?? 1) *
        POSITION_RULES[action.position].multiplier *
        TIER_MULTIPLIERS[tier] *
        (1 + (source.level - 1) * 0.035) *
        (1 + (source.stats.power + synergyPower) * 0.035) *
        classMultiplier(sourceDefinition.classId, targetDefinition.classId),
    ),
  );
}
