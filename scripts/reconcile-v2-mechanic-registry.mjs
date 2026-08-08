import { readFile, writeFile } from "node:fs/promises";

const registryUrl = new URL(
  "../v2-brief/reference-game-mechanic-registry-v2.json",
  import.meta.url,
);

const dispositions = {
  ADOPT: [
    "combat.team_size",
    "combat.active_member",
    "combat.bench",
    "combat.victory_all_defeated",
    "combat.realtime",
    "combat.target_lock",
    "combat.simultaneous_resolution",
    "combat.seeded_rng",
    "combat.replay",
    "bar.independent",
    "bar.team_owned",
    "bar.visible_enemy",
    "bar.data_driven_costs",
    "bar.spend",
    "bar.haste",
    "bar.slow_curse",
    "bar.drain",
    "bar.gain",
    "bar.freeze_break",
    "bar.no_cost",
    "action.three",
    "action.order_level10",
    "action.instant",
    "action.charge",
    "action.multi_hit",
    "action.group",
    "action.counter",
    "action.transform",
    "action.disable",
    "action.self_damage",
    "action.life_steal",
    "action.cleanse",
    "action.team_cleanse",
    "action.shield_pierce",
    "action.undodgeable",
    "types.six_cycle",
    "types.visible",
    "hit.dodge_per_hit",
    "hit.lucky_per_hit",
    "status.stun",
    "status.root",
    "status.dot",
    "status.power_up",
    "status.power_down",
    "status.defence_up_down",
    "status.shield",
    "status.reflect",
    "status.regen",
    "accessory.one",
    "accessory.separate_meter",
    "accessory.attack_charge",
    "accessory.battery_charge",
    "accessory.manual_use",
    "accessory.tournament_once",
    "mod.one_slot",
    "mod.level5",
    "mod.triggers",
    "mod.type_restriction",
    "mod.reusable",
    "enhance.two_steps",
    "enhance.per_action",
    "team.named_combos",
    "team.two_three_bonus",
    "collection.duplicates",
    "collection.true_variants",
    "collection.sell_convert",
    "ui.management",
    "ui.combo_badge",
    "ui.enemy_preview",
    "ui.start_active",
    "mode.quick_sandbox",
    "mode.tournament_six",
    "mode.tournament_hp",
    "mode.tournament_defeat",
    "mode.tournament_recovery",
    "mode.tournament_modifiers",
    "mode.story_graph",
    "mode.mission_board",
    "mode.no_map",
    "economy.coins",
    "economy.shops",
    "economy.no_paid_random",
    "reward.xp",
    "reward.coins",
    "reward.unlocks",
  ],
  ADAPT: [
    "action.hack",
    "stats.health",
    "stats.power",
    "stats.dodge",
    "stats.luck",
    "pickup.battery",
    "pickup.heart",
    "hazard.waffle",
    "enhance.feed_figures",
    "enhance.affinity",
    "collection.100_plus",
    "mode.quick_profile",
    "reward.dance",
  ],
  REPLACE: [
    "stats.level_cap20",
    "stats.level_offer3",
    "pickup.tofu",
    "pickup.tofu_power",
    "pickup.power",
    "enhance.level5",
    "ui.squad_pedestals",
  ],
  DEFER: [
    "action.channel",
    "action.remote_mine",
    "action.summon",
    "action.multi_use",
    "action.flight",
    "status.electrocute",
    "status.power_steal",
    "status.heal_block",
    "collection.repaints",
    "mode.online_optional",
  ],
  REJECT: [],
  RESEARCH: ["team.priority", "economy.transparent_mystery"],
};

const implemented = new Set([
  "combat.team_size",
  "combat.active_member",
  "combat.bench",
  "combat.victory_all_defeated",
  "combat.realtime",
  "combat.target_lock",
  "combat.simultaneous_resolution",
  "combat.seeded_rng",
  "combat.replay",
  "bar.independent",
  "bar.team_owned",
  "bar.visible_enemy",
  "bar.data_driven_costs",
  "bar.spend",
  "bar.haste",
  "bar.slow_curse",
  "bar.drain",
  "bar.gain",
  "action.three",
  "action.order_level10",
  "action.instant",
  "action.charge",
  "action.multi_hit",
  "action.group",
  "action.counter",
  "action.life_steal",
  "action.cleanse",
  "action.team_cleanse",
  "action.shield_pierce",
  "action.undodgeable",
  "stats.health",
  "stats.power",
  "stats.dodge",
  "stats.luck",
  "stats.level_cap20",
  "stats.level_offer3",
  "types.six_cycle",
  "types.visible",
  "hit.dodge_per_hit",
  "hit.lucky_per_hit",
  "status.stun",
  "status.root",
  "status.dot",
  "status.power_up",
  "status.power_down",
  "status.defence_up_down",
  "status.shield",
  "status.reflect",
  "status.regen",
  "pickup.battery",
  "pickup.heart",
  "pickup.tofu",
  "pickup.tofu_power",
  "pickup.power",
  "hazard.waffle",
  "accessory.one",
  "accessory.separate_meter",
  "accessory.attack_charge",
  "accessory.battery_charge",
  "accessory.manual_use",
  "accessory.tournament_once",
  "mod.one_slot",
  "mod.level5",
  "mod.type_restriction",
  "mod.reusable",
  "enhance.two_steps",
  "enhance.per_action",
  "enhance.feed_figures",
  "enhance.affinity",
  "enhance.level5",
  "collection.100_plus",
  "collection.duplicates",
  "collection.true_variants",
  "collection.sell_convert",
  "ui.management",
  "ui.squad_pedestals",
  "ui.enemy_preview",
  "ui.start_active",
  "mode.quick_sandbox",
  "mode.tournament_six",
  "mode.tournament_hp",
  "mode.tournament_defeat",
  "mode.tournament_recovery",
  "mode.story_graph",
  "mode.mission_board",
  "mode.no_map",
  "economy.coins",
  "economy.shops",
  "economy.no_paid_random",
  "reward.xp",
  "reward.coins",
  "reward.dance",
  "reward.unlocks",
]);

const partial = new Set([
  "bar.freeze_break",
  "action.hack",
  "action.disable",
  "mod.triggers",
  "mode.quick_profile",
  "mode.tournament_modifiers",
]);

const ruleReference = (mechanic) => {
  if (mechanic.id.startsWith("mode.online")) {
    return "docs/release-roadmap.md#v24--multiplayer-release";
  }
  if (mechanic.category === "Collection" || mechanic.category === "UI") {
    return "docs/game-design.md#7-character-progression";
  }
  if (mechanic.category === "Tournament") {
    return "docs/game-design.md#tournament-mode";
  }
  if (mechanic.category === "Story" || mechanic.category === "Modes") {
    return "docs/game-design.md#4-modes";
  }
  if (mechanic.category === "Economy" || mechanic.category === "Rewards") {
    return "docs/game-design.md#8-economy-store-and-rewards";
  }
  return "docs/game-design.md#5-combat-rules";
};

const proofColumns = [
  "authoritativeRule",
  "schemaContentVocabulary",
  "deterministicDomainImplementation",
  "aiUseAndCounterplay",
  "playerFacingUiAndExplanation",
  "saveMigrationImpact",
  "accessibility",
  "contentExample",
  "automatedTests",
  "fixedSeedPlayableScenario",
  "localDiagnosticEvidence",
];

const proofOverrides = {
  "bar.independent": {
    authoritativeRule: "docs/game-design.md#52-charge-strips",
    schemaContentVocabulary:
      "src/combat/types.ts#TeamState.bar; src/combat/types.ts#BattleState.player; src/combat/types.ts#BattleState.enemy",
    deterministicDomainImplementation:
      "src/combat/engine.ts#tickBattle; src/combat/rules.ts#teamChargePerSecond",
    aiUseAndCounterplay: "src/combat/engine.ts#chooseAiCommand",
    playerFacingUiAndExplanation:
      "src/ui/screens/battle-screen.ts; src/app/App.ts#updateChargeRails",
    saveMigrationImpact:
      "none — Charge is transient deterministic battle state recorded in reports",
    accessibility:
      "src/ui/screens/battle-screen.ts#Opponent Health and Charge; src/ui/screens/battle-screen.ts#Your Health, Moves and Charge",
    contentExample: "src/content/initial-content.ts#quickFightDefaults",
    automatedTests: "src/domain.test.ts; src/dev/v2-acceptance.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence:
      "src/combat/report.ts#BattleReport; output/playwright/gate1-browser-viking-report.json",
  },
  "bar.visible_enemy": {
    authoritativeRule: "docs/game-design.md#52-charge-strips",
    schemaContentVocabulary:
      "src/combat/types.ts#ActionDefinition.position; src/combat/types.ts#TeamState.bar",
    deterministicDomainImplementation:
      "src/combat/engine.ts#tickBattle; src/combat/rules.ts#teamChargePerSecond",
    aiUseAndCounterplay: "src/combat/engine.ts#chooseAiCommand",
    playerFacingUiAndExplanation:
      "src/ui/screens/battle-screen.ts; src/app/App.ts#updateEnemyActions; src/app/App.ts#updateChargeRails",
    saveMigrationImpact: "none — opponent thresholds are derived battle UI",
    accessibility:
      "src/ui/screens/battle-screen.ts#Opponent Health and Charge; src/app/App.ts#updateEnemyActions",
    contentExample: "src/content/launch-roster.ts#character.grim-reaper",
    automatedTests:
      "src/ui/screens/screens.test.ts; src/domain.test.ts; src/dev/v2-acceptance.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence:
      "output/playwright/gate1-comic-cutaway-iphone-portrait.png; output/playwright/gate1-victory-iphone-landscape.png",
  },
  "combat.seeded_rng": {
    schemaContentVocabulary: "src/combat/types.ts#BattleState.seed",
    deterministicDomainImplementation:
      "src/combat/engine.ts#createBattle; src/combat/rng.ts",
    aiUseAndCounterplay: "src/combat/engine.ts#chooseAiCommand",
    playerFacingUiAndExplanation: "src/app/App.ts#showBattleResult",
    saveMigrationImpact: "none — seeds live in versioned Battle Reports",
    accessibility: "src/ui/screens/battle-screen.ts",
    contentExample: "src/content/initial-content.ts#quickFightDefaults.seed",
    automatedTests: "src/domain.test.ts; src/dev/v2-acceptance.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence: "src/combat/report.ts#BattleReport.seed",
  },
  "combat.replay": {
    schemaContentVocabulary: "src/combat/report.ts#BattleReport",
    deterministicDomainImplementation:
      "src/combat/replay.ts#replayBattleReport",
    aiUseAndCounterplay: null,
    playerFacingUiAndExplanation: "src/app/App.ts#showBattleResult",
    saveMigrationImpact: "none — reports are exported separately from saves",
    accessibility: "src/ui/battle-result-explanation.ts",
    contentExample: null,
    automatedTests: "src/domain.test.ts; src/dev/v2-acceptance.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence: "src/combat/report.ts; src/combat/replay.ts",
  },
  "action.charge": {
    schemaContentVocabulary:
      "src/combat/types.ts#ActionDefinition.interruptionPolicy; src/content/schema.ts#actionSchema",
    deterministicDomainImplementation: "src/combat/engine.ts#requestAction",
    aiUseAndCounterplay: "src/combat/engine.ts#chooseAiCommand",
    playerFacingUiAndExplanation: "src/ui/screens/battle-screen.ts",
    saveMigrationImpact: "none — the policy is authored Move content",
    accessibility: "src/ui/screens/battle-screen.ts",
    contentExample: "src/content/launch-roster.ts",
    automatedTests: "src/content/content.test.ts; src/domain.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence: "src/combat/report.ts#BattleReport.events",
  },
  "status.power_up": {
    schemaContentVocabulary:
      "src/combat/types.ts#ActionEffect.empowerNextMove; src/combat/types.ts#StatusState.empower",
    deterministicDomainImplementation:
      "src/combat/engine.ts#resolveAction; src/combat/engine.ts#predictedDamage; src/combat/rules.ts#statusMagnitude",
    aiUseAndCounterplay: "src/combat/engine.ts#chooseAiCommand",
    playerFacingUiAndExplanation:
      "src/ui/combat-output.ts; src/app/App.ts#updateTeamReadout; src/app/App.ts#updateActions",
    saveMigrationImpact:
      "none — Power stacks are deterministic battle state and are not persisted in profiles",
    accessibility:
      "src/ui/combat-output.ts#empowerStatusSummary; src/app/App.ts#updateTeamReadout",
    contentExample: "src/content/launch-roster.ts#action.viking.shield-bash",
    automatedTests:
      "src/domain.test.ts; src/content/content.test.ts; src/ui/combat-output.test.ts; src/dev/v2-acceptance.test.ts",
    fixedSeedPlayableScenario: "src/dev/scenarios.ts#v2.viking-acceptance",
    localDiagnosticEvidence:
      "src/combat/report.ts#BattleReport.events; src/dev/v2-acceptance.ts",
  },
  "accessory.tournament_once": {
    authoritativeRule: "docs/game-design.md#tournament-mode",
    schemaContentVocabulary:
      "src/persistence/save.ts#TournamentRunData.exhaustedAccessoryIds",
    deterministicDomainImplementation:
      "src/tournaments/cheap-seats.ts#exhaustTournamentAccessoriesFromEvents; src/app/App.ts#handleBattleEnd",
    aiUseAndCounterplay: null,
    playerFacingUiAndExplanation: null,
    saveMigrationImpact:
      "src/persistence/save.ts#tournamentRunSchema.exhaustedAccessoryIds",
    accessibility: null,
    contentExample: "src/content/initial-content.ts#accessory.press-pass",
    automatedTests: "src/domain.test.ts#Tournament accessory exhaustion",
    fixedSeedPlayableScenario: null,
    localDiagnosticEvidence: null,
  },
  "mode.quick_profile": {
    authoritativeRule: "docs/game-design.md#quick-fight",
    schemaContentVocabulary:
      "src/persistence/save.ts#QuickFightRecord; src/persistence/save.ts#SaveData.quickFightRecord",
    deterministicDomainImplementation: "src/app/App.ts#handleBattleEnd",
    aiUseAndCounterplay: null,
    playerFacingUiAndExplanation: "src/ui/screens/profile-screen.ts",
    saveMigrationImpact:
      "src/persistence/save.ts#createDefaultSave; src/persistence/save.ts#loadSave",
    accessibility: "src/ui/screens/profile-screen.ts",
    contentExample: null,
    automatedTests: "src/domain.test.ts; src/ui/screens/screens.test.ts",
    fixedSeedPlayableScenario: null,
    localDiagnosticEvidence: null,
  },
};

const proofFor = (mechanic, disposition) => {
  if (disposition !== "ADOPT" && disposition !== "ADAPT") return undefined;
  return {
    authoritativeRule: ruleReference(mechanic),
    ...Object.fromEntries(
      proofColumns.slice(1).map((column) => [column, null]),
    ),
    ...(proofOverrides[mechanic.id] ?? {}),
  };
};

const rationaleFor = (mechanic, disposition) => {
  if (disposition === "ADOPT") {
    return "Retain the capability using LOFTWAH FIGHTER terminology and data-driven rules; proof remains incomplete wherever the recorded implementation state is not implemented.";
  }
  if (disposition === "ADAPT") {
    return "Retain the player decision while using the repository's original vocabulary, balance, presentation, or local-first progression model.";
  }
  if (disposition === "REPLACE") {
    return "Replace the researched source expression with the authoritative repository rule recorded in docs/specification-alignment.md.";
  }
  if (disposition === "DEFER") {
    return mechanic.id === "mode.online_optional"
      ? "Leave online play unscheduled; it is outside the committed local-first V2–V2.3 programme."
      : "Not required by the six launch-kit calibration or the V2 proof content; reconsider for V2.1 content breadth after the reusable V2 grammar is stable.";
  }
  if (disposition === "REJECT") {
    return "Deliberately excluded by the authoritative product guardrails.";
  }
  return "The capability direction is relevant, but its exact player value or conflict policy is not established strongly enough to author a V2 rule without further evidence.";
};

const internalRequirementFor = (mechanic) => {
  const explicit = {
    "pickup.tofu": "Provide a beneficial, activatable battle Drop",
    "pickup.tofu_power":
      "Support data-authored damage, heal, cleanse, haste, shield, and Charge-break Drop families",
    "pickup.battery": "Battery Drop adds Accessory charge",
    "pickup.heart": "Repair Drop restores Health",
    "pickup.power": "Provide an authored offensive or Charge-pressure Drop",
    "hazard.waffle": "Temporarily block or disrupt a Move slot",
    "economy.coins": "Use Stamps as battle and mission soft currency",
    "reward.coins": "Award Stamps after authored victories",
    "mod.one_slot": "Provide one Modification slot per Character",
    "mod.level5": "Unlock the Modification slot at level 5",
  };
  if (explicit[mechanic.id]) return explicit[mechanic.id];
  return mechanic.requirement
    .replace(/\bfigures\b/gi, "Characters")
    .replace(/\bfigure\b/gi, "Character")
    .replace(/\bactions\b/gi, "Moves")
    .replace(/\baction\b/gi, "Move")
    .replace(/\bHP\b/gi, "Health")
    .replace(/\bbars\b/gi, "Charge Strips")
    .replace(/\bbar\b/gi, "Charge Strip")
    .replace(/\bchips\b/gi, "Modifications")
    .replace(/\bchip\b/gi, "Modification")
    .replace(/\bmods\b/gi, "Modifications")
    .replace(/\bmod\b/gi, "Modification")
    .replace(/\brepaints\b/gi, "cosmetic variants")
    .replace(/\brepaint\b/gi, "cosmetic variant")
    .replace(/\bcoins\b/gi, "Stamps")
    .replace(/\bcoin\b/gi, "Stamp");
};

const registry = JSON.parse(await readFile(registryUrl, "utf8"));
const statusById = new Map();
for (const [disposition, ids] of Object.entries(dispositions)) {
  for (const id of ids) {
    if (statusById.has(id)) throw new Error(`Duplicate disposition for ${id}`);
    statusById.set(id, disposition);
  }
}

const sourceIds = new Set(registry.mechanics.map((mechanic) => mechanic.id));
const missing = [...sourceIds].filter((id) => !statusById.has(id));
const unknown = [...statusById.keys()].filter((id) => !sourceIds.has(id));
if (missing.length || unknown.length) {
  throw new Error(
    `Registry mapping mismatch. Missing: ${missing.join(", ") || "none"}. Unknown: ${unknown.join(", ") || "none"}.`,
  );
}

registry.reconciledLocal = "2026-07-31";
registry.reconciliationAuthority =
  "docs/v2-release-spec.md; docs/game-design.md; docs/specification-alignment.md";
registry.dispositionValues = Object.keys(dispositions);
registry.proofColumns = proofColumns;
registry.mechanics = registry.mechanics.map((mechanic) => {
  const disposition = statusById.get(mechanic.id);
  const implementationState = implemented.has(mechanic.id)
    ? "implemented"
    : partial.has(mechanic.id)
      ? "partial"
      : disposition === "DEFER"
        ? "deferred"
        : disposition === "RESEARCH"
          ? "research"
          : "planned";
  const proof = proofFor(mechanic, disposition);
  return {
    ...mechanic,
    internalRequirement: internalRequirementFor(mechanic),
    disposition,
    targetMilestone:
      mechanic.id === "mode.online_optional"
        ? "Unscheduled"
        : disposition === "DEFER"
          ? "V2.1 or later"
          : "V2",
    implementationState,
    rationale: rationaleFor(mechanic, disposition),
    ...(proof ? { proof } : {}),
  };
});

await writeFile(registryUrl, `${JSON.stringify(registry, null, 2)}\n`);
