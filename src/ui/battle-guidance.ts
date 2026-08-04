export type BattleDecisionState =
  | "standby"
  | "paused"
  | "watch"
  | "charging"
  | "blocked"
  | "ready"
  | "waiting"
  | "ended";

export interface BattleDecisionMove {
  key: number;
  name: string;
  cost: number;
  blocked: boolean;
}

export interface BattleDecisionGuidanceInput {
  battleReady: boolean;
  paused: boolean;
  presenting: boolean;
  outcomeActive: boolean;
  activeCharacterName: string;
  bar: number;
  pendingMoveName: string | null;
  stunned: boolean;
  moves: BattleDecisionMove[];
}

export interface BattleDecisionGuidance {
  state: BattleDecisionState;
  title: string;
  detail: string;
}

function readableKeyList(keys: number[]): string {
  if (keys.length <= 1) {
    return String(keys[0] ?? "");
  }
  if (keys.length === 2) {
    return `${keys[0]} or ${keys[1]}`;
  }
  return `${keys.slice(0, -1).join(", ")}, or ${keys.at(-1)}`;
}

export function battleDecisionGuidance(
  input: BattleDecisionGuidanceInput,
): BattleDecisionGuidance {
  if (!input.outcomeActive) {
    return {
      state: "ended",
      title: "FIGHT OVER",
      detail: "Review the result",
    };
  }
  if (!input.battleReady) {
    return {
      state: "standby",
      title: "GET READY",
      detail: "Charge starts after FIGHT",
    };
  }
  if (input.paused) {
    return {
      state: "paused",
      title: "PAUSED",
      detail: "Resume when you are ready",
    };
  }
  if (input.presenting) {
    return {
      state: "watch",
      title: "WATCH THE MOVE",
      detail: "Controls return after the hit",
    };
  }
  if (input.pendingMoveName) {
    return {
      state: "charging",
      title: "MOVE CHARGING",
      detail: `${input.pendingMoveName} is winding up`,
    };
  }
  if (input.stunned) {
    return {
      state: "blocked",
      title: "STUNNED",
      detail: `${input.activeCharacterName} must recover`,
    };
  }

  const usableMoves = input.moves.filter((move) => !move.blocked);
  const readyMoves = usableMoves.filter((move) => input.bar >= move.cost);
  if (readyMoves.length > 0) {
    return {
      state: "ready",
      title: "YOUR MOVE",
      detail: `Choose a green Move · press ${readableKeyList(
        readyMoves.map((move) => move.key),
      )}`,
    };
  }

  const nextMove = usableMoves
    .map((move) => ({
      ...move,
      remaining: Math.max(0, Math.ceil(move.cost - input.bar)),
    }))
    .sort((left, right) => left.remaining - right.remaining)[0];
  if (!nextMove) {
    return {
      state: "blocked",
      title: "MOVES BLOCKED",
      detail: "Wait for the effect to clear",
    };
  }
  return {
    state: "waiting",
    title: "CHARGING",
    detail: `${nextMove.name} ready in ${nextMove.remaining} Charge`,
  };
}

export function opponentDecisionGuidance(
  input: BattleDecisionGuidanceInput,
): BattleDecisionGuidance {
  if (!input.outcomeActive) {
    return {
      state: "ended",
      title: "FIGHT OVER",
      detail: "Result decided",
    };
  }
  if (!input.battleReady) {
    return {
      state: "standby",
      title: "OPPONENT",
      detail: "Waiting for FIGHT",
    };
  }
  if (input.paused) {
    return {
      state: "paused",
      title: "OPPONENT PAUSED",
      detail: "Simulation stopped",
    };
  }
  if (input.presenting) {
    return {
      state: "watch",
      title: "WATCH OPPONENT",
      detail: "Move resolving",
    };
  }
  if (input.pendingMoveName) {
    return {
      state: "charging",
      title: "OPPONENT MOVE",
      detail: `${input.pendingMoveName} winding up`,
    };
  }
  if (input.stunned) {
    return {
      state: "blocked",
      title: "OPPONENT STUNNED",
      detail: `${input.activeCharacterName} must recover`,
    };
  }

  const usableMoves = input.moves.filter((move) => !move.blocked);
  const readyMoves = usableMoves.filter((move) => input.bar >= move.cost);
  if (readyMoves.length > 0) {
    return {
      state: "ready",
      title: "OPPONENT READY",
      detail: `${readyMoves.length} ${readyMoves.length === 1 ? "Move" : "Moves"} available`,
    };
  }

  const nextMove = usableMoves
    .map((move) => ({
      ...move,
      remaining: Math.max(0, Math.ceil(move.cost - input.bar)),
    }))
    .sort((left, right) => left.remaining - right.remaining)[0];
  if (!nextMove) {
    return {
      state: "blocked",
      title: "OPPONENT BLOCKED",
      detail: "Effects prevent every Move",
    };
  }
  return {
    state: "waiting",
    title: "OPPONENT CHARGING",
    detail: `${nextMove.name} in ${nextMove.remaining} Charge`,
  };
}

export interface BattlePresentationGuidanceInput {
  side: "player" | "enemy" | "neutral";
  characterName: string;
  moveName: string;
  kind: "move" | "accessory";
}

export interface BattlePresentationGuidance {
  side: BattlePresentationGuidanceInput["side"];
  title: string;
  detail: string;
  instruction: string;
}

export function battlePresentationGuidance(
  input: BattlePresentationGuidanceInput,
): BattlePresentationGuidance {
  const title =
    input.side === "player"
      ? input.kind === "move"
        ? "YOUR MOVE"
        : "YOUR ACCESSORY"
      : input.side === "enemy"
        ? input.kind === "move"
          ? "OPPONENT MOVE"
          : "OPPONENT ACCESSORY"
        : input.kind === "move"
          ? "MOVE IN PROGRESS"
          : "ACCESSORY IN PROGRESS";
  return {
    side: input.side,
    title,
    detail:
      input.kind === "move"
        ? `${input.characterName} · ${input.moveName}`
        : input.moveName,
    instruction: "WATCH · controls return after the hit",
  };
}
