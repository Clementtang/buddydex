import { vi, describe, it, expect, beforeAll, beforeEach } from "vitest";
import { TRANSLATIONS } from "../../data/i18n.js";
import { setLang, t, getLang } from "../../js/i18n.js";

// js/i18n.js reads localStorage / navigator / document from inside
// function bodies (setLang, initI18n). Node 20 exposes navigator as a
// read-only global, so we use vi.stubGlobal (which uses defineProperty
// under the hood) instead of direct assignment. Stubbing in beforeAll
// keeps the suite free of happy-dom / jsdom for a minimal dev dep
// surface.
const _store = {};

beforeAll(() => {
  vi.stubGlobal("localStorage", {
    getItem: (k) => (k in _store ? _store[k] : null),
    setItem: (k, v) => {
      _store[k] = String(v);
    },
    removeItem: (k) => {
      delete _store[k];
    },
    clear: () => {
      for (const k of Object.keys(_store)) delete _store[k];
    },
  });
  vi.stubGlobal("navigator", { language: "en" });
  vi.stubGlobal("document", { documentElement: { lang: "en" } });
});

describe("i18n t()", () => {
  beforeEach(() => {
    // Reset to English so each test starts from a known state.
    setLang("en");
  });

  it("returns the value for a known key in the current language", () => {
    expect(t("site.title")).toBe("BuddyDex");
  });

  it("returns the value for a known key in zh-TW", () => {
    setLang("zh-TW");
    expect(getLang()).toBe("zh-TW");
    expect(t("detail.on")).toBe("開");
    expect(t("detail.off")).toBe("關");
  });

  it("returns the key itself when not found in current or fallback", () => {
    expect(t("this.key.does.not.exist")).toBe("this.key.does.not.exist");
  });

  it("falls back to English when the key is missing in the current language", () => {
    setLang("ja");
    // Temporarily remove a key from ja and confirm fallback serves en.
    const savedTitle = TRANSLATIONS.ja.site.title;
    delete TRANSLATIONS.ja.site.title;
    try {
      expect(t("site.title")).toBe("BuddyDex");
    } finally {
      TRANSLATIONS.ja.site.title = savedTitle;
    }
  });

  it("ignores an unsupported lang code passed to setLang", () => {
    setLang("xx-YY"); // not in SUPPORTED_LANGS
    expect(getLang()).toBe("en");
  });
});
