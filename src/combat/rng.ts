export interface RandomResult {
  value: number;
  state: number;
}

export function nextRandom(state: number): RandomResult {
  const nextState = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return {
    state: nextState,
    value: nextState / 4294967296,
  };
}

export function randomBetween(
  state: number,
  minimum: number,
  maximum: number,
): RandomResult {
  const next = nextRandom(state);
  return {
    state: next.state,
    value: minimum + (maximum - minimum) * next.value,
  };
}
