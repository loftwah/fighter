export type ExperimentEffectClass =
  | "interaction-critical"
  | "presentation-active"
  | "cosmetic"
  | "gameplay-active";

export type BattlePresentationStyle = "kinetic-print" | "comic-panels";

export interface DevExperimentSelections {
  battlePresentationStyle: BattlePresentationStyle;
}

export interface ExperimentDefinition {
  id: string;
  label: string;
  effectClass: ExperimentEffectClass;
  affectsBattleReport: boolean;
  settingsVisible: boolean;
  description: string;
}

const STORAGE_KEY = "loftwah.fighter.dev-experiments.v1";

export const defaultDevExperiments: DevExperimentSelections = {
  battlePresentationStyle: "kinetic-print",
};

export const experimentRegistry: readonly ExperimentDefinition[] = [
  {
    id: "battle.interaction-shell",
    label: "Battle interaction shell",
    effectClass: "interaction-critical",
    affectsBattleReport: false,
    settingsVisible: false,
    description:
      "Owns Health, Charge, Moves, Lineups, readiness and touch geometry. It may change layout but never combat state.",
  },
  {
    id: "battle.presentation-style",
    label: "Battle visual style",
    effectClass: "cosmetic",
    affectsBattleReport: false,
    settingsVisible: true,
    description:
      "Changes fighter framing, cut-ins, crops and panel choreography without moving controls or changing combat outcomes.",
  },
  {
    id: "battle.presentation-lock",
    label: "Battle presentation lock",
    effectClass: "presentation-active",
    affectsBattleReport: true,
    settingsVisible: false,
    description:
      "Freezes simulation while a Move is explained. Its duration changes feel and wall-clock time, so it is tested separately from cosmetics.",
  },
  {
    id: "battle.rules",
    label: "Battle rules and tuning",
    effectClass: "gameplay-active",
    affectsBattleReport: true,
    settingsVisible: false,
    description:
      "Owns costs, damage, statuses, AI and legal commands. Rule experiments belong in deterministic Developer Lab scenarios.",
  },
] as const;

function isBattlePresentationStyle(
  value: unknown,
): value is BattlePresentationStyle {
  return value === "kinetic-print" || value === "comic-panels";
}

export function loadDevExperiments(
  storage: Pick<Storage, "getItem">,
  search = "",
): DevExperimentSelections {
  let stored: Partial<DevExperimentSelections> = {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as Partial<DevExperimentSelections>) : {};
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(search);
  const queryStyle = params.get("experiment.battlePresentationStyle");
  const storedStyle = stored.battlePresentationStyle;
  return {
    battlePresentationStyle: isBattlePresentationStyle(queryStyle)
      ? queryStyle
      : isBattlePresentationStyle(storedStyle)
        ? storedStyle
        : defaultDevExperiments.battlePresentationStyle,
  };
}

export function saveDevExperiments(
  storage: Pick<Storage, "setItem">,
  selections: DevExperimentSelections,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(selections));
}
