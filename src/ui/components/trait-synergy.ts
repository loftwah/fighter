import { CHARACTER_TRAITS, traitSynergy } from "../../combat/rules";
import type {
  CharacterDefinition,
  CharacterTrait,
  TraitBonusRecord,
} from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import { formatLabel } from "../format";

export const traitBonusLabel = (
  trait: CharacterTrait,
  bonuses: TraitBonusRecord,
): string => {
  const bonus = bonuses[trait];
  if (bonus === 0) {
    return "No bonus";
  }
  const display = (value: number): string =>
    Number.isInteger(value) ? String(value) : value.toFixed(1);
  return {
    hero: `+${display(bonus)} maximum Health`,
    villain: `+${display(bonus)} Power`,
    monster: `${display(bonus * 2.5)}% damage resistance`,
    mythic: `+${display(bonus * 100)}% Charge speed`,
    historic: `+${display(bonus)} opening Charge`,
    icon: `+${display(bonus)} Fortune`,
  }[trait];
};

export function renderCharacterTraits(character: CharacterDefinition): string {
  if (character.traitIds.length === 0) {
    return '<span class="trait-chip is-muted">No traits</span>';
  }
  return character.traitIds
    .map(
      (trait) =>
        `<span class="trait-chip is-${trait}">${formatLabel(trait)}</span>`,
    )
    .join("");
}

export function renderTraitSynergy(characterIds: string[]): string {
  const definitions = characterIds
    .map((id) => combatContent.characters[id])
    .filter(
      (character): character is CharacterDefinition => character !== undefined,
    );
  const synergy = traitSynergy(definitions);
  const representedTraits = CHARACTER_TRAITS.filter(
    (trait) => synergy.scores[trait] > 0,
  );
  if (representedTraits.length === 0) {
    return `
      <aside class="trait-synergy" aria-label="Team Traits">
        <strong>Team Traits</strong>
        <span>No Trait progress</span>
      </aside>
    `;
  }
  return `
    <aside class="trait-synergy" aria-label="Team Trait progress">
      <strong>Team Traits</strong>
      <ul>
        ${representedTraits
          .map((trait) => {
            const score = synergy.scores[trait];
            return `
              <li class="is-active">
                <span>${formatLabel(trait)} ${score} point${score === 1 ? "" : "s"}</span>
                <b>${traitBonusLabel(trait, synergy.bonuses)}</b>
              </li>
            `;
          })
          .join("")}
      </ul>
    </aside>
  `;
}
