// Five-dimension stat system (Feature 4).
//
// The stat ids below are community-observed names, originally surfaced
// in buddyboard.xyz's DESIGN.md. They have NOT been verified against
// the actual Claude Code /buddy source, and should be treated as
// placeholder labels — see docs/prd.md Feature 4 "實作前置" note.
//
// When the real stat names are confirmed, only the i18n string
// entries in data/i18n.js need to change; this id list is a stable
// internal contract.

export const STATS = [
  { id: "debugging" },
  { id: "patience" },
  { id: "chaos" },
  { id: "wisdom" },
  { id: "snark" },
];

/**
 * Roll a fresh set of example stats for display in the detail modal.
 * Each stat rolls uniformly between the rarity's statFloor and 100.
 *
 * @param {number} floor - rarity statFloor (5 / 15 / 25 / 35 / 50)
 * @returns {Array<{ id: string, value: number }>} five rolled stats
 */
export function rollStats(floor) {
  const safeFloor =
    typeof floor === "number" && floor >= 0 && floor <= 100 ? floor : 0;
  return STATS.map((s) => ({
    id: s.id,
    value: Math.floor(Math.random() * (100 - safeFloor + 1)) + safeFloor,
  }));
}

/**
 * Render a fixed-width ASCII progress bar for a 0-100 stat value.
 * Uses the block element `█` for filled cells and `░` for empty,
 * so the bar renders purely as text content — no inline CSS width
 * is set, keeping the strict CSP contract intact.
 *
 * @param {number} value - 0..100
 * @param {number} [width=15] - number of cells
 */
export function renderStatBar(value, width = 15) {
  const clamped = Math.max(0, Math.min(100, value));
  const filled = Math.round((clamped / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
