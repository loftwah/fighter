export interface HudRect {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface EnemyHudPresentationInput {
  focused: boolean;
  forceCompact: boolean;
  nearby: boolean;
  pinned: boolean;
}

export interface EnemyHudPresentation {
  action: "Keep open" | "Reduce" | "View";
  ariaLabel:
    "Expand opponent HUD" | "Keep opponent HUD open" | "Reduce opponent HUD";
  expanded: boolean;
}

export interface EnemyHudForceCompactReleaseInput {
  forceCompact: boolean;
  pointerHasLeft: boolean;
  toggleFocused: boolean;
}

export function enemyHudPresentation(
  input: EnemyHudPresentationInput,
): EnemyHudPresentation {
  if (input.forceCompact) {
    return {
      action: "View",
      ariaLabel: "Expand opponent HUD",
      expanded: false,
    };
  }
  if (input.pinned) {
    return {
      action: "Reduce",
      ariaLabel: "Reduce opponent HUD",
      expanded: true,
    };
  }
  if (input.nearby || input.focused) {
    return {
      action: "Keep open",
      ariaLabel: "Keep opponent HUD open",
      expanded: true,
    };
  }
  return {
    action: "View",
    ariaLabel: "Expand opponent HUD",
    expanded: false,
  };
}

export function isPointNearRect(
  x: number,
  y: number,
  rect: HudRect,
  distance: number,
): boolean {
  return (
    x >= rect.left - distance &&
    x <= rect.right + distance &&
    y >= rect.top - distance &&
    y <= rect.bottom + distance
  );
}

export function shouldReleaseEnemyHudForceCompact(
  input: EnemyHudForceCompactReleaseInput,
): boolean {
  return input.forceCompact && input.pointerHasLeft && !input.toggleFocused;
}
