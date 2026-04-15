# BuddyDex — Agent Guide

Fan-made encyclopedia of Claude Buddy species. Pure static site (HTML + CSS + ES modules), deployed on Vercel at [buddydex.chatbot.tw](https://buddydex.chatbot.tw). Single maintainer, no backend, localStorage only.

**Before touching code, read this file. It encodes constraints learned the hard way through six rounds of devil's advocate review (Phase 0).**

---

## Hard constraints

### Strict CSP — no inline style, ever

`vercel.json` ships a strict Content-Security-Policy without `'unsafe-inline'` in `style-src` or `script-src`. Any inline style write will silently break the UI on production while working locally.

**Never do:**

```js
element.style.color = ...;            // blocked by CSP
element.style.setProperty(...);       // blocked by CSP
element.setAttribute("style", ...);   // blocked by CSP
document.head.appendChild(<style>);   // blocked by CSP (dynamic <style>)
```

**Do instead:**

- **Static-ish styling**: use a `data-*` attribute + CSS selector. See `css/detail-controls.css:66-85` (`.rarity-btn[data-rarity="..."]`) and the caller in `js/render-detail.js:140-142`.
- **Dynamic values that need runtime computation** (e.g., scroll lock top offset): use constructable `CSSStyleSheet` + `document.adoptedStyleSheets`. See `js/render-detail.js:22-50`.
- **Constructable CSSStyleSheet MUST be wrapped in try/catch** — Safari < 16.4 and iOS < 16.4 throw on `new CSSStyleSheet()`. A top-level throw in a module cascades into the entire site becoming non-interactive. The feature-detect fallback at `js/render-detail.js:22-31` is required, not optional.

**Before any CSS-related commit**, run:

```bash
grep -n "\.style\." js/
```

Expect **zero** matches on actual `.style.` property writes. Only comments should match (see `js/render-detail.js:12` for the one current hit, which is explanatory).

### Script loading — no inline `<script>`

`index.html` must not contain inline `<script>` blocks with JS content. The GA4 initialization lives in `js/analytics.js` as an ES module. Only two `<script>` tags are allowed in `<head>`:

1. `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` (external loader)
2. `<script type="module" src="js/analytics.js">` (our init, extracted for CSP)

### URL hash is untrusted input

`window.location.hash` is attacker-controlled. Phase 1 Feature 1 (share links like `#duck`) must:

1. Strip the `#` prefix
2. `decodeURIComponent()` inside try/catch (malformed percent-encoding throws `URIError`)
3. Match against the `SPECIES` allowlist (`SPECIES.find(s => s.id === decoded)`)
4. Never let hash-derived strings enter `innerHTML`

Shipped implementation: `js/hash-router.js` (`parseHashSpecies()` + `clearHash()`), covered by `tests/unit/hash-router.test.js` with the full malicious-input test matrix (16 cases). Use these as the pattern for any new URL-sourced inputs — do not reinvent hash decoding.

Malicious hash test cases in the suite:
`#<script>alert(1)</script>`, `#duck"><img src=x>`, `#'; alert(1); //`, `#%3Cscript%3E`, `#%E0%A4%A` (malformed — expect `URIError`).

### Accessibility — `aria-live` never on animating elements

The detail modal's ASCII preview changes every 800ms for idle animation. **Do not** put `aria-live` on it — screen readers will announce the re-rendered text every 800ms, making the modal hostile to assistive tech.

The correct pattern: a dedicated visually-hidden announcer (`#detail-announce`, `.sr-only` class in `css/reset.css`), updated only on user-initiated accessory changes via the `announce()` helper in `js/render-detail.js`. See the 0.A.3 commit (`5579970`) for the complete pattern.

### i18n — all 5 languages, always in sync

Supported languages: `en / zh-TW / zh-CN / ja / ko`. Top-level keys in `data/i18n.js` **must** be identical across all five — `tests/unit/data-integrity.test.js` will fail the build otherwise.

**When adding any new i18n key**: add it to all 5 languages in the same commit. Do not commit with "will translate later" — the test will block the push.

Species name + description is also covered: every species id in `data/species.js` must have `species.<id>.name` and `species.<id>.description` in all 5 languages.

---

## Testing conventions

- **Vitest** with `environment: "node"` (see `vitest.config.js`). **We deliberately do not use happy-dom** — it adds dependency surface and has quirks with Vitest's localStorage init. The one exception is i18n tests, which use `vi.stubGlobal` to mock `localStorage` / `navigator` / `document` (see `tests/unit/i18n.test.js:13-28`).
- **DOM-heavy modules are not unit-tested**. `render-grid.js`, `render-detail.js`, `hatch-animation.js` rely on code review + chrome-devtools-mcp for verification. If you need to add a test that opens the detail modal, either add happy-dom (with justification) or write a Playwright smoke test.
- **Silent-failure contracts are explicit**. `getAvailableHats("unknown")` returns `[]` on purpose — the test at `tests/unit/accessories.test.js:44-56` documents this as a deliberate contract. Callers must pre-validate their rarity input via the `RARITIES` allowlist. Do NOT tighten the test to rely on the empty array as a validation signal.

```bash
npm test   # expect 47/47 passing, ~500ms
```

CI runs on push to `main` and PRs to `main` via `.github/workflows/test.yml`. Node 22 LTS, pinned in `.nvmrc` + `package.json` `engines`.

---

## Verification discipline

### GA4 ground truth — use Thufir, not DevTools

**Do not trust the Chrome DevTools Network tab for GA4 verification.** Local ad-blockers and privacy extensions commonly fake 503/blocked responses on `https://www.google-analytics.com/g/collect` to make client code fail fast. You will see 503s in DevTools while the server is actually receiving the data just fine.

The correct way to verify GA4 is working:

```
mcp__thufir__ga4_realtime            # is traffic flowing right now?
mcp__thufir__ga4_report               # is yesterday's data there?
  startDate: "yesterday"
  metrics: ["screenPageViews", "activeUsers", "sessions", "eventCount"]
```

This cost the Phase 0 review two rounds (R4-M2) until Thufir provided objective confirmation. Don't repeat the mistake.

### CSP changes — use chrome-devtools-mcp

Before a commit that touches `vercel.json` CSP or any styling/scripting pattern that could trigger CSP, open the live site with chrome-devtools-mcp and run a page-context test that hooks `securitypolicyviolation`:

```js
const violations = [];
document.addEventListener("securitypolicyviolation", (e) => violations.push(e));
// ... exercise the code path
```

Zero violations is the bar.

### Browser compatibility floor

- Chrome / Edge: 73+ (2019)
- Firefox: 101+ (May 2022)
- **Safari / iOS: 16.4+ (March 2023)** — this is the binding constraint, driven by constructable CSSStyleSheet

Older Safari falls through to a degraded path (one-frame scroll jump on modal open) rather than a broken site — see `js/render-detail.js` fallback. If you introduce any other modern API that throws on older Safari, either use feature detection or bump the floor explicitly in this file.

---

## Project geography

```
/
├── index.html              # single-page shell, head meta, footer
├── vercel.json             # CSP + security headers + cleanUrls
├── DESIGN.md               # living design system (current state)
├── CHANGELOG.md            # Keep a Changelog format
├── css/
│   ├── reset.css           # + .sr-only utility
│   ├── tokens.css          # CSS variables (colors, spacing, fonts)
│   ├── layout.css          # body/container/section
│   ├── components.css      # header, species grid, detail overlay, footer, shiny, teaching, random btn
│   └── detail-controls.css # rarity/eye/hat pickers, shiny toggle, scroll-lock, stats block, share actions
├── js/
│   ├── main.js             # boot, hash routing, random pick, lang switcher, teaching wire-up
│   ├── analytics.js        # GA4 init (CSP-compliant ES module, exposes window.gtag)
│   ├── i18n.js              # t(), setLang, initI18n with browser lang detection
│   ├── hash-router.js      # parseHashSpecies + clearHash (F1 URL deep links)
│   ├── render-grid.js       # species grid card rendering
│   ├── render-mechanics.js  # mechanics section (4 cards incl Stats)
│   ├── render-detail.js     # detail overlay + try-on + scroll lock + share + stats
│   └── hatch-animation.js   # first-visit egg cracking animation (click-to-skip + hash-skip)
├── data/
│   ├── species.js           # 18 species, frames[0..2] (frames[2] reserved, unused)
│   ├── rarity.js            # 5 rarities with probability/color/statFloor
│   ├── accessories.js       # EYES, HATS, getAvailableHats
│   ├── stats.js             # STATS (5 ids), rollStats, renderStatBar (F4)
│   └── i18n.js              # TRANSLATIONS[lang][section][key] — 5 languages
├── tests/unit/
│   ├── accessories.test.js        # getAvailableHats + silent-failure contract
│   ├── i18n.test.js               # t() with vi.stubGlobal
│   ├── hash-router.test.js        # parseHashSpecies allowlist + malicious input (16 cases)
│   ├── stats.test.js              # rollStats range + renderStatBar shape (12 cases)
│   └── data-integrity.test.js     # structural invariants (species/i18n/hats/eyes/rarity/stats)
├── .github/workflows/test.yml     # Node 22 + npm ci + npm test
└── docs/
    ├── prd.md                      # current PRD (v2.4)
    ├── plans/2026-04-02-buddydex-design.md       # historical design doc
    ├── plans/2026-04-02-buddydex-implementation.md # historical impl plan
    ├── research/encyclopedia-benchmarks.md        # competitive research
    ├── research/buddyboard-analysis.md            # competitor (buddyboard.xyz) analysis
    ├── devils-advocate-review-round{1..6}.md      # review findings
    └── devils-advocate-response-round{2..6}.md    # implementation responses (round 1 has none)
```

---

## Review history — how to read it

Phase 0 went through six rounds of "devil's advocate" review. Each round is in `docs/devils-advocate-review-round{N}.md` with a corresponding `devils-advocate-response-round{N}.md` (round 1 has no response; rounds 2-6 all do).

Review IDs follow the format `R{round}-{severity}{num}` where severity is `C` (critical), `M` (major), lowercase `m` (minor). Example: `R4-C1` = Round 4 Critical finding #1. When implementing a fix, reference the ID in the commit message — e.g., `fix(R4-C1): feature-detect CSSStyleSheet for Safari <16.4 fallback`.

**Round 6 is the Phase 0 closure review.** Read it for the current state-of-the-world assessment.

Phase 1 is in progress. Feature 1 (share functionality) shipped and verified. See `docs/prd.md` v2.4 for remaining scope.

---

## Phase status

- Phase 0 (technical debt + infrastructure): **complete**, closed 2026-04-11
- Phase 1 (share + random + teaching guide + stats): **complete**, shipped 2026-04-12
- **Project archived 2026-04-15**: Claude Code's `/buddy` feature was retired by Anthropic on 2026-04-09. The subject matter no longer exists. Site preserved as historical record and technical portfolio.
- Phase 2: **cancelled** — all backlog items lost their foundation with the feature removal

No further feature development is planned. The codebase, tests, CI, and deployment remain intact for portfolio reference.
