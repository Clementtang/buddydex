import { describe, it, expect } from "vitest";
import { STATS, rollStats, renderStatBar } from "../../data/stats.js";
import { RARITIES } from "../../data/rarity.js";

describe("STATS data", () => {
  it("exposes exactly five stat ids", () => {
    expect(STATS.length).toBe(5);
  });

  it("every stat id is unique", () => {
    const ids = STATS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("rollStats(floor)", () => {
  it("returns five rolls each time", () => {
    const out = rollStats(0);
    expect(out.length).toBe(5);
  });

  it("returns each stat as { id, value }", () => {
    const out = rollStats(25);
    for (const row of out) {
      expect(typeof row.id).toBe("string");
      expect(typeof row.value).toBe("number");
    }
  });

  it("every value is within [floor, 100] for every rarity", () => {
    for (const rarity of RARITIES) {
      for (let i = 0; i < 200; i++) {
        const rolled = rollStats(rarity.statFloor);
        for (const row of rolled) {
          expect(
            row.value,
            `${rarity.id} roll returned ${row.value}, expected >= ${rarity.statFloor}`,
          ).toBeGreaterThanOrEqual(rarity.statFloor);
          expect(row.value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("handles the legendary floor edge case (50)", () => {
    // 200 rolls at floor 50 should never undershoot
    for (let i = 0; i < 200; i++) {
      const rolled = rollStats(50);
      for (const row of rolled) {
        expect(row.value).toBeGreaterThanOrEqual(50);
      }
    }
  });

  it("returns integers", () => {
    for (const row of rollStats(25)) {
      expect(Number.isInteger(row.value)).toBe(true);
    }
  });

  it("coerces invalid floor input to 0", () => {
    const rolled = rollStats("not a number");
    for (const row of rolled) {
      expect(row.value).toBeGreaterThanOrEqual(0);
      expect(row.value).toBeLessThanOrEqual(100);
    }
  });
});

describe("renderStatBar(value, width)", () => {
  it("returns a fixed-width string", () => {
    expect(renderStatBar(0).length).toBe(15);
    expect(renderStatBar(50).length).toBe(15);
    expect(renderStatBar(100).length).toBe(15);
    expect(renderStatBar(75, 10).length).toBe(10);
  });

  it("fills nothing for 0 and everything for 100", () => {
    expect(renderStatBar(0)).toBe("░".repeat(15));
    expect(renderStatBar(100)).toBe("█".repeat(15));
  });

  it("is monotonic — higher value fills more cells", () => {
    const low = [...renderStatBar(20)].filter((c) => c === "█").length;
    const mid = [...renderStatBar(50)].filter((c) => c === "█").length;
    const high = [...renderStatBar(80)].filter((c) => c === "█").length;
    expect(mid).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(mid);
  });

  it("clamps out-of-range values", () => {
    expect(renderStatBar(-50)).toBe("░".repeat(15));
    expect(renderStatBar(999)).toBe("█".repeat(15));
  });
});
