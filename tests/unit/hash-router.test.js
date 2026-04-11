import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { parseHashSpecies } from "../../js/hash-router.js";

// Silence the intentional console.warn calls for invalid hashes so
// the test output stays readable. Each test restores the original.
let warnSpy;
beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
});

describe("parseHashSpecies — happy path", () => {
  it("returns species id for a known buddy", () => {
    expect(parseHashSpecies("#duck")).toBe("duck");
    expect(parseHashSpecies("#dragon")).toBe("dragon");
    expect(parseHashSpecies("#capybara")).toBe("capybara");
  });

  it("accepts hash without the leading #", () => {
    expect(parseHashSpecies("cat")).toBe("cat");
  });

  it("decodes percent-encoded ASCII (no-op round trip)", () => {
    // '#' encoded is %23 but leading # is stripped first anyway;
    // here we decode "duck" which has no special chars
    expect(parseHashSpecies("#%64%75%63%6b")).toBe("duck");
  });
});

describe("parseHashSpecies — rejects empty / missing", () => {
  it("returns null for empty string", () => {
    expect(parseHashSpecies("")).toBe(null);
  });

  it("returns null for just '#'", () => {
    expect(parseHashSpecies("#")).toBe(null);
  });

  it("returns null for non-string input", () => {
    expect(parseHashSpecies(null)).toBe(null);
    expect(parseHashSpecies(undefined)).toBe(null);
    expect(parseHashSpecies(42)).toBe(null);
    expect(parseHashSpecies({})).toBe(null);
  });
});

describe("parseHashSpecies — unknown species", () => {
  it("returns null and warns for unknown species id", () => {
    expect(parseHashSpecies("#nosuchbuddy")).toBe(null);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("is case-sensitive (species ids are lowercase)", () => {
    expect(parseHashSpecies("#DUCK")).toBe(null);
    expect(parseHashSpecies("#Duck")).toBe(null);
  });
});

describe("parseHashSpecies — malicious input (R2-M1, R3-m5)", () => {
  it("rejects XSS-style script tag", () => {
    expect(parseHashSpecies("#<script>alert(1)</script>")).toBe(null);
    expect(parseHashSpecies("#%3Cscript%3Ealert(1)%3C/script%3E")).toBe(null);
  });

  it("rejects attribute-breakout attempt", () => {
    expect(parseHashSpecies('#duck"><img src=x>')).toBe(null);
  });

  it("rejects quote/semicolon injection", () => {
    expect(parseHashSpecies("#'; alert(1); //")).toBe(null);
  });

  it("rejects path traversal", () => {
    expect(parseHashSpecies("#../../etc/passwd")).toBe(null);
  });

  it("rejects malformed percent encoding without throwing", () => {
    // decodeURIComponent('%E0%A4%A') throws URIError — our handler
    // must catch it and return null, not propagate the exception.
    expect(() => parseHashSpecies("#%E0%A4%A")).not.toThrow();
    expect(parseHashSpecies("#%E0%A4%A")).toBe(null);
    expect(warnSpy).toHaveBeenCalledWith(
      "[buddydex] invalid hash encoding, ignoring",
    );
  });

  it("rejects orphaned percent", () => {
    expect(() => parseHashSpecies("#%")).not.toThrow();
    expect(parseHashSpecies("#%")).toBe(null);
  });
});

describe("parseHashSpecies — does not execute content", () => {
  it("never returns a value that contains < or >", () => {
    const result = parseHashSpecies("#<img>");
    expect(result).toBe(null);
    // And even if it somehow returned a string, it wouldn't match
    // any species id (which are all [a-z]+).
  });

  it("never returns a value containing whitespace", () => {
    expect(parseHashSpecies("#duck cat")).toBe(null);
    expect(parseHashSpecies("# duck")).toBe(null);
  });
});
