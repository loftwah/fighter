import type { Difficulty } from "../combat/types";

export interface BattleReward {
  stamps: number;
  xp: number;
  firstClearBonus: number;
}

export function calculateBattleReward(input: {
  won: boolean;
  firstClear: boolean;
  opponentLevel: number;
  difficulty: Difficulty;
}): BattleReward {
  const baseStamps = 32 + input.opponentLevel * 6;
  const baseXp = 20 + input.opponentLevel * 8;
  const lossFactor = input.won ? 1 : 0.3;
  const firstClearBonus = input.won && input.firstClear ? 70 : 0;

  // Difficulty is deliberately progression-neutral. The argument remains part
  // of the contract so a future accepted design change is explicit.
  void input.difficulty;
  return {
    stamps: Math.round(baseStamps * lossFactor) + firstClearBonus,
    xp: Math.round(baseXp * lossFactor),
    firstClearBonus,
  };
}
