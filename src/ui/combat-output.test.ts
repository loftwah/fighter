import { describe, expect, it } from "vitest";
import type { ActionDefinition, StatusState } from "../combat/types";
import {
  actionResolutionFeedback,
  actionOutputSummary,
  empowerStatusSummary,
  moveSealOutput,
} from "./combat-output";

const battleBoast: ActionDefinition = {
  id: "action.viking.shield-bash",
  name: "Battle Boast",
  description: "Bank Power.",
  category: "support",
  position: "1L",
  chargeMs: 0,
  effects: [{ kind: "empowerNextMove", target: "self", magnitude: 0.4 }],
  presentationId: "presentation.viking.shield-bash",
  audioId: "sfx.action.guard",
};

const berserkerOath: ActionDefinition = {
  id: "action.viking.berserker-oath",
  name: "Berserker Oath",
  description: "Hit and stun.",
  category: "attack",
  position: "3L",
  chargeMs: 700,
  effects: [
    { kind: "damage", target: "activeEnemy", power: 29 },
    {
      kind: "stun",
      target: "activeEnemy",
      durationMs: 650,
      chance: 0.72,
    },
  ],
  presentationId: "presentation.viking.berserker-oath",
  audioId: "sfx.action.finisher",
};

function empower(id: string, magnitude: number): StatusState {
  return {
    id,
    kind: "empower",
    remainingMs: 60_000,
    magnitude,
  };
}

describe("player-readable combat output", () => {
  it("says that Viking's Power Move stacks", () => {
    expect(actionOutputSummary(battleBoast, 0, 0.7)).toBe(
      "Power +28% · stacks",
    );
  });

  it("presents a damaging stun Move as an attack with scaled stun duration", () => {
    expect(actionOutputSummary(berserkerOath, 58, 1.5)).toBe(
      "Attack · Hit 58 + Stun 72% · 1.0s",
    );
    expect(actionOutputSummary(berserkerOath, 67, 1.5 * 1.16)).toBe(
      "Attack · Hit 67 + Stun 72% · 1.1s",
    );
  });

  it("combines separately stored Power stacks into one readable total", () => {
    expect(empowerStatusSummary([empower("one", 0.28)])).toEqual({
      label: "Power ×1 · +28% next attack",
      description:
        "1 Power stack banked. The next attack gains 28 percent Power.",
    });
    expect(
      empowerStatusSummary([empower("one", 0.28), empower("two", 0.28)]),
    ).toEqual({
      label: "Power ×2 · +56% next attack",
      description:
        "2 Power stacks banked. The next attack gains 56 percent Power.",
    });
  });

  it("puts the live boosted or reduced attack points on the Move seal", () => {
    expect(moveSealOutput(berserkerOath, 58, 45, 70, 1.5)).toEqual({
      value: "58",
      label: "Hit ↑ · 70C",
      tone: "boosted",
      delta: "+13",
    });
    expect(moveSealOutput(berserkerOath, 34, 45, 70, 1.5)).toEqual({
      value: "34",
      label: "Hit ↓ · 70C",
      tone: "reduced",
      delta: "−11",
    });
    expect(moveSealOutput(berserkerOath, 45, 45, 70, 1.5)).toEqual({
      value: "45",
      label: "Hit · 70C",
      tone: "neutral",
      delta: null,
    });
  });

  it("keeps support output and exact Charge cost visible on the Move seal", () => {
    expect(moveSealOutput(battleBoast, 0, 0, 18, 0.7)).toEqual({
      value: "+28%",
      label: "Power · 18C",
      tone: "neutral",
      delta: null,
    });
  });

  it("makes hit, critical hit, miss and Power resolutions explicit", () => {
    expect(
      actionResolutionFeedback(berserkerOath, [
        {
          id: 1,
          type: "damageApplied",
          actionId: berserkerOath.id,
          amount: 58,
        },
      ]),
    ).toEqual({ label: "HIT", detail: "58 DAMAGE", tone: "hit" });
    expect(
      actionResolutionFeedback(berserkerOath, [
        { id: 1, type: "criticalHit", actionId: berserkerOath.id },
        {
          id: 2,
          type: "damageApplied",
          actionId: berserkerOath.id,
          amount: 91,
        },
      ]),
    ).toEqual({
      label: "CRITICAL HIT",
      detail: "91 DAMAGE",
      tone: "critical",
    });
    expect(
      actionResolutionFeedback(berserkerOath, [
        { id: 1, type: "characterDodged", actionId: berserkerOath.id },
      ]),
    ).toEqual({ label: "MISS", detail: "DODGED", tone: "miss" });
    expect(
      actionResolutionFeedback(berserkerOath, [
        { id: 1, type: "actionStarted", actionId: berserkerOath.id },
      ]),
    ).toBeNull();
    expect(actionResolutionFeedback(battleBoast, [])).toEqual({
      label: "POWER UP",
      detail: "NEXT ATTACK",
      tone: "support",
    });
  });
});
