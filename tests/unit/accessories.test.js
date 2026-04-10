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

  // Deliberate silent-failure contract (R5-M2): unknown rarity ids
  // return [] rather than throwing. Callers must validate their
  // rarity input BEFORE calling getAvailableHats — we never accept
  // unknown rarity as a user-facing signal. Phase 1 Feature 1 hash
  // routing and any future URL/localStorage-sourced rarity must go
  // through an allowlist (see data/rarity.js) before this function
  // is called. Do NOT tighten this test to rely on the empty array
  // as a validation mechanism.
  it("silently returns [] for unknown rarity (caller must pre-validate)", () => {
    expect(getAvailableHats("mythic")).toEqual([]);
    expect(getAvailableHats("")).toEqual([]);
    expect(getAvailableHats(undefined)).toEqual([]);
  });
});
