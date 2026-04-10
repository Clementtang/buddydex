import { describe, it, expect } from "vitest";
import { SPECIES } from "../../data/species.js";
import { TRANSLATIONS } from "../../data/i18n.js";
import { HATS, EYES } from "../../data/accessories.js";

// Guards against silent data drift — the kind that shows up as a
// missing description in ja, a half-filled new species, or a
// typoed hat minRarity. Runs in milliseconds and catches the whole
// class of mistakes that Phase 1 Feature 3 (teaching guide, +10-30
// new i18n keys) is especially prone to.

const LANGS = ["en", "zh-TW", "zh-CN", "ja", "ko"];
const VALID_RARITIES = new Set([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
]);

describe("data integrity", () => {
  it("every species has name + description in every supported language", () => {
    for (const species of SPECIES) {
      for (const lang of LANGS) {
        const entry = TRANSLATIONS[lang]?.species?.[species.id];
        expect(entry, `${lang}.species.${species.id} entry`).toBeDefined();
        expect(entry.name, `${lang}.species.${species.id}.name`).toBeTruthy();
        expect(
          entry.description,
          `${lang}.species.${species.id}.description`,
        ).toBeTruthy();
      }
    }
  });

  it("every species has exactly 3 frames of 5 lines", () => {
    for (const species of SPECIES) {
      expect(species.frames.length, `${species.id}.frames.length`).toBe(3);
      for (const [i, frame] of species.frames.entries()) {
        expect(
          Array.isArray(frame),
          `${species.id}.frames[${i}] is array`,
        ).toBe(true);
        expect(frame.length, `${species.id}.frames[${i}].length`).toBe(5);
      }
    }
  });

  it("every hat's minRarity is a known rarity id", () => {
    for (const hat of HATS) {
      expect(
        VALID_RARITIES.has(hat.minRarity),
        `hat ${hat.id} minRarity='${hat.minRarity}'`,
      ).toBe(true);
    }
  });

  it("every eye has id, name, and symbol", () => {
    for (const eye of EYES) {
      expect(eye.id, "eye.id").toBeTruthy();
      expect(eye.name, `eye ${eye.id}.name`).toBeTruthy();
      expect(eye.symbol, `eye ${eye.id}.symbol`).toBeTruthy();
    }
  });

  it("every language has the same top-level keys as English", () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    for (const lang of LANGS) {
      expect(
        Object.keys(TRANSLATIONS[lang]).sort(),
        `${lang} top-level keys`,
      ).toEqual(enKeys);
    }
  });

  it("every species id is unique", () => {
    const ids = SPECIES.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size, "duplicate species ids").toBe(ids.length);
  });
});
