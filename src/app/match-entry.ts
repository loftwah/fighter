import { tournamentDefinitions } from "../tournaments/catalog";
import { combatContent } from "../content/initial-content";
import {
  createResolvedMatchConfiguration,
  type ResolvedMatchConfiguration,
} from "./match-configuration";

export interface LineupConfirmation {
  id: string;
  playerInstanceIds: string[];
  playerStarterInstanceId: string;
  opponentInstanceIds: string[];
  playerAccessoryId: string | null;
  opponentAccessoryId: string | null;
}

interface ConfirmedPlayerEntry {
  lineup: LineupConfirmation;
  match: ResolvedMatchConfiguration;
}

export type BattleLaunchRequest =
  | (ConfirmedPlayerEntry & {
      kind: "story";
      storyId: string;
      encounterId: string;
    })
  | (ConfirmedPlayerEntry & {
      kind: "quick";
      draftId: string;
    })
  | (ConfirmedPlayerEntry & {
      kind: "tournament";
      tournamentId: string;
      origin: "story" | "standalone";
      nodeId: string;
    })
  | {
      kind: "development";
      scenarioId: string;
      bypass: "validated-dev-scenario";
    };

export interface ValidatedBattleLaunch {
  request: BattleLaunchRequest;
  reportMode: "story" | "quick" | "tournament" | "dev";
  progressionScope: "story" | "profile-history" | "tournament" | "none";
  encounterId: string;
}

function requireId(value: string, label: string): string {
  const id = value.trim();
  if (!id) {
    throw new Error(`${label} is required before a Battle can start`);
  }
  return id;
}

export function validateLineupConfirmation(
  sourceConfirmation: LineupConfirmation,
): LineupConfirmation {
  const confirmation = structuredClone(sourceConfirmation);
  requireId(confirmation.id, "A validated Lineup confirmation");
  for (const [label, instanceIds] of [
    ["Player Lineup", confirmation.playerInstanceIds],
    ["Opponent Lineup", confirmation.opponentInstanceIds],
  ] as const) {
    if (instanceIds.length < 1 || instanceIds.length > 3) {
      throw new Error(`${label} must contain one to three instances`);
    }
    if (
      instanceIds.some((instanceId) => !instanceId.trim()) ||
      new Set(instanceIds).size !== instanceIds.length
    ) {
      throw new Error(`${label} instance IDs must be non-empty and unique`);
    }
  }
  requireId(
    confirmation.playerStarterInstanceId,
    "Player Lineup starter instance ID",
  );
  if (
    !confirmation.playerInstanceIds.includes(
      confirmation.playerStarterInstanceId,
    )
  ) {
    throw new Error(
      "Player Lineup starter must belong to the confirmed Lineup",
    );
  }
  confirmation.playerInstanceIds = [
    confirmation.playerStarterInstanceId,
    ...confirmation.playerInstanceIds.filter(
      (instanceId) => instanceId !== confirmation.playerStarterInstanceId,
    ),
  ];
  return confirmation;
}

export function validateBattleLaunchRequest(
  sourceRequest: BattleLaunchRequest,
): ValidatedBattleLaunch {
  const request = structuredClone(sourceRequest);
  if (request.kind === "development") {
    requireId(request.scenarioId, "Development scenario ID");
    if (request.bypass !== "validated-dev-scenario") {
      throw new Error(
        "Development Battle bypass must use a validated scenario",
      );
    }
    return {
      request,
      reportMode: "dev",
      progressionScope: "none",
      encounterId: request.scenarioId,
    };
  }

  request.lineup = validateLineupConfirmation(request.lineup);
  request.match = createResolvedMatchConfiguration(
    request.match,
    combatContent,
  );
  if (request.match.mode !== request.kind) {
    throw new Error(
      `Resolved ${request.match.mode} match cannot launch as ${request.kind}`,
    );
  }
  const playerInstanceIds = request.match.player.fighters.map(
    (fighter) => fighter.instanceId,
  );
  const opponentInstanceIds = request.match.opponent.fighters.map(
    (fighter) => fighter.instanceId,
  );
  if (
    playerInstanceIds.join("|") !==
      request.lineup.playerInstanceIds.join("|") ||
    opponentInstanceIds.join("|") !==
      request.lineup.opponentInstanceIds.join("|") ||
    request.match.player.accessoryId !== request.lineup.playerAccessoryId ||
    request.match.opponent.accessoryId !== request.lineup.opponentAccessoryId
  ) {
    throw new Error("Resolved match does not match the confirmed Lineup");
  }
  if (request.kind === "story") {
    const storyId = requireId(request.storyId, "Story ID");
    const encounterId = requireId(request.encounterId, "Story encounter ID");
    if (!encounterId.startsWith(`${storyId}.`)) {
      throw new Error("Story encounter does not belong to the active Story");
    }
    return {
      request,
      reportMode: "story",
      progressionScope: "story",
      encounterId,
    };
  }
  if (request.kind === "quick") {
    return {
      request,
      reportMode: "quick",
      progressionScope: "profile-history",
      encounterId: requireId(request.draftId, "Quick Fight draft ID"),
    };
  }

  const tournamentId = requireId(request.tournamentId, "Tournament ID");
  const registeredDefinition = tournamentDefinitions[tournamentId];
  const baseTournamentId = request.match.presetId;
  const isRegisteredVariant =
    !registeredDefinition &&
    !!baseTournamentId &&
    !!tournamentDefinitions[baseTournamentId] &&
    tournamentId.startsWith(`${baseTournamentId}.variant.`);
  if (!registeredDefinition && !isRegisteredVariant) {
    throw new Error(`Tournament ${tournamentId} is not registered`);
  }
  const nodeId = requireId(request.nodeId, "Tournament node ID");
  if (request.match.id !== `match.${tournamentId}.${nodeId}`) {
    throw new Error(
      "Resolved match does not belong to the active Tournament node",
    );
  }
  return {
    request,
    reportMode: "tournament",
    progressionScope: "tournament",
    encounterId: `${tournamentId}.${nodeId}`,
  };
}
