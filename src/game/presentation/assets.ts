import type {
  BattleState,
  CharacterDefinition,
  CombatContent,
  Side,
} from "../../combat/types";

export interface BattleTexturePlan {
  baseImageIds: string[];
  richImageIds: string[];
  presentationIds: string[];
}

export function battleIdleTextureId(
  character: CharacterDefinition,
  frame: 0 | 1,
): string {
  return character.idleAssetIds[frame] ?? character.portraitAssetId;
}

export function activeBattleCharacterIds(snapshot: BattleState): string[] {
  return (["player", "enemy"] as const)
    .map(
      (side) => snapshot[side].squad[snapshot[side].activeIndex]?.characterId,
    )
    .filter((id): id is string => Boolean(id));
}

export function richBattleAssetIds(
  character: CharacterDefinition,
  content: CombatContent,
): { imageIds: string[]; presentationIds: string[] } {
  return {
    imageIds: character.reactionAssetId ? [character.reactionAssetId] : [],
    presentationIds: character.actionIds
      .map((actionId) => content.actions[actionId]?.presentationId)
      .filter((id): id is string => Boolean(id)),
  };
}

export function battleTexturePlan(
  snapshot: BattleState,
  content: CombatContent,
): BattleTexturePlan {
  const encounterCharacterIds = (["player", "enemy"] as const).flatMap(
    (side: Side) =>
      snapshot[side].squad.map((combatant) => combatant.characterId),
  );
  const activeCharacterIds = new Set(activeBattleCharacterIds(snapshot));
  const baseImageIds: string[] = [];
  const richImageIds: string[] = [];
  const presentationIds: string[] = [];

  for (const characterId of new Set(encounterCharacterIds)) {
    const character = content.characters[characterId];
    if (!character) continue;
    baseImageIds.push(
      battleIdleTextureId(character, 0),
      battleIdleTextureId(character, 1),
    );
    if (!activeCharacterIds.has(characterId)) continue;
    const richAssets = richBattleAssetIds(character, content);
    richImageIds.push(...richAssets.imageIds);
    presentationIds.push(...richAssets.presentationIds);
  }

  return {
    baseImageIds: [...new Set(baseImageIds)],
    richImageIds: [...new Set(richImageIds)],
    presentationIds: [...new Set(presentationIds)],
  };
}
