import { describe, it, expect } from "vitest";
import { HATS, getAvailableHats } from "../../data/accessories.js";

describe("getAvailableHats", () => {
  it("returns only 'none' for common rarity", () => {
    const hats = getAvailableHats("common");
    expect(hats.map((h) => h.id)).toEqual(["none"]);
  });

  it("unlocks crown, tophat, propeller at uncommon", () => {
    const hats = getAvailableHats("uncommon");
    expect(hats.map((h) => h.id)).toEqual([
      "none",
      "crown",
      "tophat",
      "propeller",
    ]);
  });

  it("unlocks halo and wizard at rare (cumulative with uncommon)", () => {
    const hats = getAvailableHats("rare");
    expect(hats.map((h) => h.id)).toEqual([
      "none",
      "crown",
      "tophat",
      "propeller",
      "halo",
      "wizard",
    ]);
  });

  it("unlocks beanie at epic", () => {
    const hats = getAvailableHats("epic");
    expect(hats.map((h) => h.id)).toContain("beanie");
    expect(hats.map((h) => h.id)).not.toContain("tinyduck");
  });

  it("unlocks tinyduck at legendary — all 8 hats available", () => {
    const hats = getAvailableHats("legendary");
    expect(hats.length).toBe(HATS.length);
    expect(hats.map((h) => h.id)).toContain("tinyduck");
  });

  it("returns empty array for unknown rarity", () => {
    // RARITY_ORDER.indexOf returns -1, filter keeps nothing except hats
    // whose minRarity also has index -1, but every defined hat has a
    // valid minRarity, so the result should be empty.
    expect(getAvailableHats("mythic")).toEqual([]);
  });
});
