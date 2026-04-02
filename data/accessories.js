export const EYES = [
  { id: "dot", name: "Dot", symbol: "\u00b7" },
  { id: "star", name: "Star", symbol: "\u2726" },
  { id: "cross", name: "Cross", symbol: "\u00d7" },
  { id: "bullseye", name: "Bullseye", symbol: "\u25c9" },
  { id: "at", name: "At", symbol: "@" },
  { id: "circle", name: "Circle", symbol: "\u00b0" },
];

export const HATS = [
  { id: "none", name: "None", ascii: null, minRarity: "common" },
  { id: "crown", name: "Crown", ascii: "   \\^^^/    ", minRarity: "uncommon" },
  {
    id: "tophat",
    name: "Top Hat",
    ascii: "   [___]    ",
    minRarity: "uncommon",
  },
  {
    id: "propeller",
    name: "Propeller",
    ascii: "    -+-     ",
    minRarity: "uncommon",
  },
  { id: "halo", name: "Halo", ascii: "   (   )    ", minRarity: "rare" },
  { id: "wizard", name: "Wizard", ascii: "    /^\\     ", minRarity: "rare" },
  { id: "beanie", name: "Beanie", ascii: "   (___)    ", minRarity: "epic" },
  {
    id: "tinyduck",
    name: "Tiny Duck",
    ascii: "    ,>      ",
    minRarity: "legendary",
  },
];

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

export function getAvailableHats(rarityId) {
  const rarityIndex = RARITY_ORDER.indexOf(rarityId);
  return HATS.filter((hat) => {
    const hatIndex = RARITY_ORDER.indexOf(hat.minRarity);
    return rarityIndex >= hatIndex;
  });
}
