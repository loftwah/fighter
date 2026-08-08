import { describe, expect, it } from "vitest";
import {
  addFightWorkflowFighter,
  advanceFightWorkflow,
  confirmFightWorkflow,
  createFightWorkflowDraft,
  openFightWorkflowSettings,
  removeFightWorkflowFighter,
  reorderFightWorkflowFighter,
  retreatFightWorkflow,
  setFightWorkflowLineupAccessory,
  setFightWorkflowStarter,
  validateFightWorkflowDraft,
  type FightWorkflowFighter,
  type FightWorkflowPolicy,
} from "./fight-workflow";

const fighters = {
  playerVikingOne: {
    instanceId: "quick.player.viking.1",
    characterId: "character.viking",
  },
  playerVikingTwo: {
    instanceId: "quick.player.viking.2",
    characterId: "character.viking",
  },
  playerTux: {
    instanceId: "quick.player.tux.1",
    characterId: "character.tux",
  },
  playerMoses: {
    instanceId: "quick.player.moses.1",
    characterId: "character.moses",
  },
  opponentGrim: {
    instanceId: "quick.opponent.grim.1",
    characterId: "character.grim-reaper",
  },
  opponentTux: {
    instanceId: "quick.opponent.tux.1",
    characterId: "character.tux",
  },
} as const satisfies Record<string, FightWorkflowFighter>;

function quickPolicy(
  settings: "required" | "locked" | "optional" = "optional",
): FightWorkflowPolicy {
  return {
    mode: "quick",
    player: {
      locked: false,
      eligibleFighters: [
        fighters.playerVikingOne,
        fighters.playerVikingTwo,
        fighters.playerTux,
        fighters.playerMoses,
      ],
    },
    opponent: {
      locked: false,
      eligibleFighters: [fighters.opponentGrim, fighters.opponentTux],
    },
    settings,
    editableSettings: ["difficulty", "builds"],
  };
}

function completeQuickDraft(settings: "required" | "optional" = "optional") {
  return createFightWorkflowDraft({
    id: "quick.draft.1",
    policy: quickPolicy(settings),
    player: {
      instanceIds: [fighters.playerVikingOne.instanceId],
      starterInstanceId: fighters.playerVikingOne.instanceId,
    },
    opponent: {
      instanceIds: [fighters.opponentGrim.instanceId],
      starterInstanceId: fighters.opponentGrim.instanceId,
    },
  });
}

describe("Fight Workflow draft", () => {
  it("allows exact duplicate Characters through distinct instance IDs", () => {
    const first = addFightWorkflowFighter(
      createFightWorkflowDraft({ id: "quick.draft.1", policy: quickPolicy() }),
      "player",
      fighters.playerVikingOne.instanceId,
    );
    const second = addFightWorkflowFighter(
      first.draft,
      "player",
      fighters.playerVikingTwo.instanceId,
    );

    expect(second.issues).toEqual([]);
    expect(second.draft.selections.player).toEqual({
      instanceIds: [
        fighters.playerVikingOne.instanceId,
        fighters.playerVikingTwo.instanceId,
      ],
      starterInstanceId: fighters.playerVikingOne.instanceId,
      accessoryId: null,
    });
  });

  it("returns UI-ready issues without changing the draft", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [
          fighters.playerVikingOne.instanceId,
          fighters.playerTux.instanceId,
          fighters.playerMoses.instanceId,
        ],
        starterInstanceId: fighters.playerVikingOne.instanceId,
      },
    });
    const transition = addFightWorkflowFighter(
      draft,
      "player",
      fighters.playerVikingTwo.instanceId,
    );

    expect(transition.draft).toBe(draft);
    expect(transition.issues).toEqual([
      expect.objectContaining({
        code: "lineup-full",
        side: "player",
        message: "Your Lineup can contain up to three fighters.",
      }),
    ]);
  });

  it("rejects ineligible and already-selected fighter instances", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [fighters.playerVikingOne.instanceId],
        starterInstanceId: fighters.playerVikingOne.instanceId,
      },
    });

    expect(
      addFightWorkflowFighter(draft, "player", "quick.player.missing").issues[0]
        ?.code,
    ).toBe("ineligible-instance");
    expect(
      addFightWorkflowFighter(
        draft,
        "player",
        fighters.playerVikingOne.instanceId,
      ).issues[0]?.code,
    ).toBe("duplicate-instance");
  });

  it("keeps transitions immutable and promotes the next fighter after removing the starter", () => {
    const original = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [
          fighters.playerVikingOne.instanceId,
          fighters.playerTux.instanceId,
        ],
        starterInstanceId: fighters.playerVikingOne.instanceId,
      },
    });
    const transition = removeFightWorkflowFighter(
      original,
      "player",
      fighters.playerVikingOne.instanceId,
    );

    expect(original.selections.player.instanceIds).toEqual([
      fighters.playerVikingOne.instanceId,
      fighters.playerTux.instanceId,
    ]);
    expect(transition.draft).not.toBe(original);
    expect(transition.draft.selections.player).toEqual({
      instanceIds: [fighters.playerTux.instanceId],
      starterInstanceId: fighters.playerTux.instanceId,
      accessoryId: null,
    });
    expect(
      Object.isFrozen(transition.draft.selections.player.instanceIds),
    ).toBe(true);
  });

  it("sets only a selected fighter as starter", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [
          fighters.playerVikingOne.instanceId,
          fighters.playerTux.instanceId,
        ],
        starterInstanceId: fighters.playerVikingOne.instanceId,
      },
    });

    expect(
      setFightWorkflowStarter(draft, "player", fighters.playerTux.instanceId)
        .draft.selections.player.starterInstanceId,
    ).toBe(fighters.playerTux.instanceId);
    expect(
      setFightWorkflowStarter(draft, "player", fighters.playerMoses.instanceId)
        .issues[0]?.code,
    ).toBe("starter-not-selected");
  });

  it("reorders the Lineup and derives the starter from slot one", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [
          fighters.playerVikingOne.instanceId,
          fighters.playerTux.instanceId,
          fighters.playerMoses.instanceId,
        ],
        starterInstanceId: fighters.playerVikingOne.instanceId,
      },
    });

    const transition = reorderFightWorkflowFighter(
      draft,
      "player",
      fighters.playerMoses.instanceId,
      0,
    );

    expect(transition.issues).toEqual([]);
    expect(transition.draft.selections.player).toEqual({
      instanceIds: [
        fighters.playerMoses.instanceId,
        fighters.playerVikingOne.instanceId,
        fighters.playerTux.instanceId,
      ],
      starterInstanceId: fighters.playerMoses.instanceId,
      accessoryId: null,
    });
  });

  it("reports incomplete Lineups and missing starters for both sides", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [fighters.playerVikingOne.instanceId],
        starterInstanceId: null,
      },
      opponent: {
        instanceIds: [fighters.opponentGrim.instanceId],
        starterInstanceId: null,
      },
    });
    const issues = validateFightWorkflowDraft(draft);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "starter-required", side: "player" }),
        expect.objectContaining({ code: "starter-required", side: "opponent" }),
      ]),
    );
  });

  it("stores team equipment on the prepared Lineup", () => {
    const draft = completeQuickDraft("required");
    const transition = setFightWorkflowLineupAccessory(
      draft,
      "player",
      "accessory.field-kit",
    );

    expect(transition.issues).toEqual([]);
    expect(transition.draft.selections.player.accessoryId).toBe(
      "accessory.field-kit",
    );
    expect(transition.draft.settings).not.toHaveProperty("playerAccessoryId");
    expect(
      setFightWorkflowLineupAccessory(
        advanceFightWorkflow(draft).draft,
        "player",
        null,
      ).issues[0]?.code,
    ).toBe("fighters-step-required");
  });
});

describe("mode-owned Fight Workflow policy", () => {
  it("locks authored Story opponents against UI transitions", () => {
    const draft = createFightWorkflowDraft({
      id: "story.first-run.02",
      policy: {
        mode: "story",
        player: {
          locked: false,
          eligibleFighters: [fighters.playerVikingOne],
        },
        opponent: {
          locked: true,
          eligibleFighters: [fighters.opponentGrim],
          requiredSelection: {
            instanceIds: [fighters.opponentGrim.instanceId],
            starterInstanceId: fighters.opponentGrim.instanceId,
            accessoryId: "accessory.dead-air",
          },
        },
        settings: "locked",
      },
      opponent: {
        instanceIds: [fighters.opponentGrim.instanceId],
        starterInstanceId: fighters.opponentGrim.instanceId,
        accessoryId: "accessory.dead-air",
      },
    });

    const transition = removeFightWorkflowFighter(
      draft,
      "opponent",
      fighters.opponentGrim.instanceId,
    );
    expect(transition.draft).toBe(draft);
    expect(transition.issues[0]).toEqual(
      expect.objectContaining({ code: "locked-side", side: "opponent" }),
    );
    expect(
      setFightWorkflowLineupAccessory(draft, "opponent", "accessory.field-kit")
        .issues[0],
    ).toEqual(
      expect.objectContaining({ code: "locked-side", side: "opponent" }),
    );
  });

  it("auto-seeds and enforces the exact authored composition", () => {
    const policy = {
      mode: "story" as const,
      player: {
        locked: false as const,
        eligibleFighters: [fighters.playerVikingOne],
      },
      opponent: {
        locked: true as const,
        eligibleFighters: [fighters.opponentGrim, fighters.opponentTux],
        requiredSelection: {
          instanceIds: [fighters.opponentGrim.instanceId],
          starterInstanceId: fighters.opponentGrim.instanceId,
          accessoryId: "accessory.dead-air",
        },
      },
      settings: "locked" as const,
    };

    expect(
      createFightWorkflowDraft({ id: "story.first-run.02", policy }).selections
        .opponent,
    ).toEqual(policy.opponent.requiredSelection);
    expect(() =>
      createFightWorkflowDraft({
        id: "story.first-run.02",
        policy,
        opponent: {
          instanceIds: [fighters.opponentTux.instanceId],
          starterInstanceId: fighters.opponentTux.instanceId,
          accessoryId: "accessory.dead-air",
        },
      }),
    ).toThrow("does not match its locked composition");
  });

  it("fails fast when authored mode policy tries to unlock the opponent", () => {
    expect(() =>
      createFightWorkflowDraft({
        id: "story.first-run.02",
        policy: {
          mode: "story",
          player: {
            locked: false,
            eligibleFighters: [fighters.playerVikingOne],
          },
          opponent: {
            locked: false,
            eligibleFighters: [fighters.opponentGrim],
          },
          settings: "locked",
        } as unknown as FightWorkflowPolicy,
      }),
    ).toThrow("Story and Tournament own the opponent");
  });

  it("rejects non-canonical stable IDs in an eligible pool", () => {
    const policy = quickPolicy();
    expect(() =>
      createFightWorkflowDraft({
        id: "quick.draft.1",
        policy: {
          ...policy,
          player: {
            locked: false,
            eligibleFighters: [
              { instanceId: " quick.player.1", characterId: "character.tux" },
            ],
          },
        },
      }),
    ).toThrow("requires stable IDs");
  });

  it("does not expose Match Settings when the mode owns them", () => {
    const draft = createFightWorkflowDraft({
      id: "story.first-run.02",
      policy: {
        mode: "story",
        player: {
          locked: false,
          eligibleFighters: [fighters.playerVikingOne],
        },
        opponent: {
          locked: true,
          eligibleFighters: [fighters.opponentGrim],
          requiredSelection: {
            instanceIds: [fighters.opponentGrim.instanceId],
            starterInstanceId: fighters.opponentGrim.instanceId,
            accessoryId: "accessory.dead-air",
          },
        },
        settings: "locked",
      },
    });

    expect(openFightWorkflowSettings(draft).issues[0]?.code).toBe(
      "settings-step-unavailable",
    );
  });
});

describe("Fight Workflow steps and confirmation", () => {
  it("visits editable Match Settings but skips inherited settings", () => {
    const custom = advanceFightWorkflow(completeQuickDraft("required"));
    expect(custom.issues).toEqual([]);
    expect(custom.draft.step).toBe("settings");
    expect(advanceFightWorkflow(custom.draft).draft.step).toBe("confirm");
    expect(retreatFightWorkflow(custom.draft).draft.step).toBe("fighters");

    const standard = advanceFightWorkflow(completeQuickDraft("optional"));
    expect(standard.issues).toEqual([]);
    expect(standard.draft.step).toBe("confirm");
    expect(retreatFightWorkflow(standard.draft).draft.step).toBe("fighters");
  });

  it("cannot leave Fighter Select with an invalid draft", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
    });
    const transition = advanceFightWorkflow(draft);

    expect(transition.draft).toBe(draft);
    expect(transition.issues.map(({ code }) => code)).toContain("lineup-empty");
  });

  it("cannot open Settings or construct confirmation with an incomplete match", () => {
    const draft = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy("required"),
    });

    expect(openFightWorkflowSettings(draft).draft).toBe(draft);
    expect(openFightWorkflowSettings(draft).issues[0]?.code).toBe(
      "lineup-empty",
    );
    expect(() =>
      createFightWorkflowDraft({
        id: "quick.draft.1",
        policy: quickPolicy(),
        step: "confirm",
      }),
    ).toThrow("must contain a complete match");
  });

  it("rejects a Settings step for modes that do not expose it", () => {
    expect(() =>
      createFightWorkflowDraft({
        id: "quick.draft.1",
        policy: quickPolicy("locked"),
        player: completeQuickDraft().selections.player,
        opponent: completeQuickDraft().selections.opponent,
        step: "settings",
      }),
    ).toThrow("does not expose editable Match Settings");
  });

  it("creates a deeply frozen match-entry snapshot", () => {
    const initial = createFightWorkflowDraft({
      id: "quick.draft.1",
      policy: quickPolicy(),
      player: {
        instanceIds: [
          fighters.playerVikingOne.instanceId,
          fighters.playerTux.instanceId,
        ],
        starterInstanceId: fighters.playerTux.instanceId,
      },
      opponent: {
        instanceIds: [fighters.opponentGrim.instanceId],
        starterInstanceId: fighters.opponentGrim.instanceId,
      },
    });
    const confirmingDraft = advanceFightWorkflow(initial).draft;
    const result = confirmFightWorkflow(
      confirmingDraft,
      "lineup.confirmed.quick.1",
    );

    expect(result.issues).toEqual([]);
    expect(result.snapshot?.lineup).toEqual({
      id: "lineup.confirmed.quick.1",
      playerInstanceIds: [
        fighters.playerTux.instanceId,
        fighters.playerVikingOne.instanceId,
      ],
      playerStarterInstanceId: fighters.playerTux.instanceId,
      opponentInstanceIds: [fighters.opponentGrim.instanceId],
      playerAccessoryId: null,
      opponentAccessoryId: null,
    });
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot?.lineup.playerInstanceIds)).toBe(
      true,
    );
  });

  it("keeps a confirmed snapshot unchanged when a later draft is edited", () => {
    const initial = completeQuickDraft();
    const confirmingDraft = advanceFightWorkflow(initial).draft;
    const snapshot = confirmFightWorkflow(
      confirmingDraft,
      "lineup.confirmed.quick.1",
    ).snapshot!;
    const editableAgain = retreatFightWorkflow(confirmingDraft).draft;
    const laterDraft = addFightWorkflowFighter(
      editableAgain,
      "player",
      fighters.playerVikingTwo.instanceId,
    ).draft;

    expect(laterDraft.selections.player.instanceIds).toHaveLength(2);
    expect(snapshot.player.instanceIds).toEqual([
      fighters.playerVikingOne.instanceId,
    ]);
    expect(snapshot.lineup.playerInstanceIds).toEqual([
      fighters.playerVikingOne.instanceId,
    ]);
  });

  it("rejects confirmation before the read-only confirmation step", () => {
    const result = confirmFightWorkflow(
      completeQuickDraft(),
      "lineup.confirmed.quick.1",
    );

    expect(result.snapshot).toBeNull();
    expect(result.issues.map(({ code }) => code)).toContain(
      "confirmation-step-required",
    );
  });
});
