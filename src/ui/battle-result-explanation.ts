import { type BattleReport } from "../combat/report";
import {
  type BattleEvent,
  type CombatContent,
  type Side,
} from "../combat/types";
import { typeMultiplier } from "../combat/rules";
import { escapeHtml, formatLabel } from "./format";

export interface BattleResultExplanation {
  heading: string;
  decisiveMoment: string;
  evidence: BattleResultEvidence[];
}

export interface BattleResultEvidence {
  kind: "player-damage" | "opponent-damage" | "matchup" | "luck" | "choices";
  label: string;
  value: string;
  detail?: string;
}

function participantName(
  report: BattleReport,
  content: CombatContent,
  instanceId: string | undefined,
): string {
  const participant = report.participants.find(
    (candidate) => candidate.instanceId === instanceId,
  );
  return participant
    ? (content.characters[participant.characterId]?.name ??
        participant.characterId)
    : "Character";
}

function actionName(content: CombatContent, event: BattleEvent): string {
  if (event.actionId) {
    return content.actions[event.actionId]?.name ?? event.actionId;
  }
  if (event.reactionKind === "counter") return "counter";
  if (event.reactionKind === "reflection") return "reflection";
  return "the final hit";
}

function damageByAction(
  report: BattleReport,
  side: Side,
): Array<{ actionId: string; amount: number }> {
  const totals = new Map<string, number>();
  for (const event of report.events) {
    if (event.type !== "damageApplied" || event.side !== side) continue;
    const actionId =
      event.actionId ?? event.reactionId ?? event.reactionKind ?? "other";
    totals.set(actionId, (totals.get(actionId) ?? 0) + (event.amount ?? 0));
  }
  return [...totals.entries()]
    .map(([actionId, amount]) => ({ actionId, amount }))
    .sort((left, right) => right.amount - left.amount);
}

function decisiveDamage(
  report: BattleReport,
  winner: Side,
  loser: Side,
): BattleEvent | null {
  let finalDefeatIndex = -1;
  for (let index = report.events.length - 1; index >= 0; index -= 1) {
    const event = report.events[index];
    if (event?.type === "characterDefeated" && event.side === loser) {
      finalDefeatIndex = index;
      break;
    }
  }
  if (finalDefeatIndex < 0) return null;

  const defeated = report.events[finalDefeatIndex];
  for (let index = finalDefeatIndex - 1; index >= 0; index -= 1) {
    const event = report.events[index];
    if (
      event?.type === "damageApplied" &&
      event.side === winner &&
      event.targetId === defeated?.targetId
    ) {
      return event;
    }
  }
  return null;
}

function luckEvidence(report: BattleReport): BattleResultEvidence {
  const criticals = report.events.filter(
    (event) => event.type === "criticalHit",
  ).length;
  const dodges = report.events.filter(
    (event) => event.type === "characterDodged",
  ).length;
  return {
    kind: "luck",
    label: "Luck on the night",
    value: `${criticals === 0 ? "No critical hits" : `${criticals} critical hit${criticals === 1 ? "" : "s"}`} · ${dodges === 0 ? "No dodges" : `${dodges} dodge${dodges === 1 ? "" : "s"}`}`,
    detail: "Counted across both Lineups.",
  };
}

function readableList(values: readonly string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function playerChoiceEvidence(
  report: BattleReport,
  content: CombatContent,
): BattleResultEvidence {
  const moveCounts = new Map<string, number>();
  const switchDestinations = new Map<string, number>();
  for (const decision of report.decisions) {
    if (decision.side !== "player") continue;
    if (decision.command.kind === "action") {
      moveCounts.set(
        decision.command.actionId,
        (moveCounts.get(decision.command.actionId) ?? 0) + 1,
      );
    }
    if (decision.command.kind === "switch") {
      const target =
        report.initialState.player.squad[decision.command.targetIndex];
      const destination = participantName(report, content, target?.instanceId);
      switchDestinations.set(
        destination,
        (switchDestinations.get(destination) ?? 0) + 1,
      );
    }
  }
  const moveCount = [...moveCounts.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const namedMoves = [...moveCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(
      ([actionId, count]) =>
        `${content.actions[actionId]?.name ?? actionId} ×${count}`,
    );
  const namedSwitches = [...switchDestinations.entries()]
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .map(([name, count]) => `${name} ×${count}`);
  const switchCount = [...switchDestinations.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const moveSummary =
    moveCount === 0
      ? "No Moves"
      : `${moveCount} Move${moveCount === 1 ? "" : "s"}`;
  const switchSummary =
    switchCount === 0
      ? "No switches"
      : `${switchCount} switch${switchCount === 1 ? "" : "es"}`;
  const details = [
    namedMoves.length > 0 ? `Moves: ${readableList(namedMoves)}.` : "",
    namedSwitches.length > 0
      ? `Switched to ${readableList(namedSwitches)}.`
      : "",
  ].filter(Boolean);
  return {
    kind: "choices",
    label: "Your corner",
    value: `${moveSummary} · ${switchSummary}`,
    detail: details.join(" ") || "No player commands were recorded.",
  };
}

export function explainBattleResult(
  report: BattleReport,
  content: CombatContent,
): BattleResultExplanation {
  const playerWon = report.outcome === "playerWon";
  const winner: Side = playerWon ? "player" : "enemy";
  const loser: Side = playerWon ? "enemy" : "player";
  const winningDamage = damageByAction(report, winner);
  const losingDamage = damageByAction(report, loser);
  const finalDamage = decisiveDamage(report, winner, loser);
  const finalTarget = participantName(report, content, finalDamage?.targetId);
  const finalAction = finalDamage ? actionName(content, finalDamage) : null;
  const battleEnd = [...report.events]
    .reverse()
    .find((event) => event.type === "battleEnded");
  const decisiveMoment = finalAction
    ? `${finalAction} finished ${finalTarget} with ${finalDamage?.amount ?? 0} damage.`
    : battleEnd?.message?.endsWith("Forfeited")
      ? "The fight ended by forfeit."
      : report.elapsedMs >= report.initialState.timeLimitMs
        ? "The clock ran out; remaining Health settled it."
        : "There was no single finishing blow.";

  const evidence: BattleResultEvidence[] = [];
  const topWinningMove = winningDamage[0];
  const topLosingMove = losingDamage[0];
  if (topWinningMove) {
    const winningMoveName =
      content.actions[topWinningMove.actionId]?.name ?? topWinningMove.actionId;
    evidence.push({
      kind: playerWon ? "player-damage" : "opponent-damage",
      label: playerWon ? "Your top Move" : "Their top Move",
      value: `${winningMoveName} · ${topWinningMove.amount} damage`,
      detail: `Most damage for ${playerWon ? "your" : "the opposing"} Lineup.`,
    });
  }
  if (topLosingMove) {
    const losingMoveName =
      content.actions[topLosingMove.actionId]?.name ?? topLosingMove.actionId;
    evidence.push({
      kind: playerWon ? "opponent-damage" : "player-damage",
      label: playerWon ? "Their top Move" : "Your top Move",
      value: `${losingMoveName} · ${topLosingMove.amount} damage`,
      detail: `Most damage for ${playerWon ? "the opposing" : "your"} Lineup.`,
    });
  }

  const player = report.participants.find(
    (participant) => participant.instanceId === finalDamage?.sourceId,
  );
  const enemy = report.participants.find(
    (participant) => participant.instanceId === finalDamage?.targetId,
  );
  if (player && enemy) {
    const playerDefinition = content.characters[player.characterId];
    const enemyDefinition = content.characters[enemy.characterId];
    if (playerDefinition && enemyDefinition) {
      const multiplier = typeMultiplier(
        playerDefinition.typeId,
        enemyDefinition.typeId,
      );
      if (multiplier > 1) {
        evidence.push({
          kind: "matchup",
          label: "Final matchup",
          value: `${formatLabel(playerDefinition.typeId)} was strong into ${formatLabel(enemyDefinition.typeId)}`,
          detail: `${playerDefinition.name} had the Type edge over ${enemyDefinition.name} on the finish.`,
        });
      } else if (multiplier < 1) {
        evidence.push({
          kind: "matchup",
          label: "Final matchup",
          value: `${formatLabel(playerDefinition.typeId)} was weak into ${formatLabel(enemyDefinition.typeId)}`,
          detail: `${playerDefinition.name} fought through a Type disadvantage against ${enemyDefinition.name} on the finish.`,
        });
      }
    }
  }

  evidence.push(luckEvidence(report));
  evidence.push(playerChoiceEvidence(report, content));

  return {
    heading: "How the fight turned",
    decisiveMoment,
    evidence: evidence.slice(0, 5),
  };
}

export function renderBattleResultExplanation(
  report: BattleReport,
  content: CombatContent,
): string {
  const explanation = explainBattleResult(report, content);
  return `
    <section class="result-explanation" aria-labelledby="result-explanation-title">
      <h3 id="result-explanation-title">${escapeHtml(explanation.heading)}</h3>
      <p>${escapeHtml(explanation.decisiveMoment)}</p>
      <ul>
        ${explanation.evidence.map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span>${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ""}</li>`).join("")}
      </ul>
    </section>
  `;
}
