export interface StoreOffer {
  id: string;
  kind: "character" | "patch";
  itemId: string;
  name: string;
  price: number;
  level?: number;
  rarity: "common" | "uncommon" | "rare";
}

export const baseOffers: StoreOffer[] = [
  {
    id: "offer.tux",
    kind: "character",
    itemId: "character.tux",
    name: "Tux",
    price: 150,
    level: 4,
    rarity: "common",
  },
  {
    id: "offer.moses",
    kind: "character",
    itemId: "character.moses",
    name: "Moses",
    price: 220,
    level: 5,
    rarity: "uncommon",
  },
  {
    id: "offer.hot-start",
    kind: "patch",
    itemId: "patch.hot-start",
    name: "Hot Start",
    price: 95,
    rarity: "common",
  },
  {
    id: "offer.no-flinch",
    kind: "patch",
    itemId: "patch.no-flinch",
    name: "No Flinch",
    price: 180,
    rarity: "rare",
  },
  {
    id: "offer.heavy-ink",
    kind: "patch",
    itemId: "patch.heavy-ink",
    name: "Power Band",
    price: 140,
    rarity: "uncommon",
  },
  {
    id: "offer.lucky-misprint",
    kind: "patch",
    itemId: "patch.lucky-misprint",
    name: "Lucky Charm",
    price: 170,
    rarity: "rare",
  },
];

function hashRotationKey(key: string): number {
  let hash = 2166136261;
  for (const character of key) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function rotatingOffers(rotationKey: string): StoreOffer[] {
  const offset = hashRotationKey(rotationKey) % baseOffers.length;
  return Array.from(
    { length: Math.min(4, baseOffers.length) },
    (_, index) => baseOffers[(index + offset) % baseOffers.length]!,
  );
}
