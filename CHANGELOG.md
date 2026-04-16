# Changelog

All notable changes to BuddyDex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.5.1] - 2026-04-15

### Changed

- Project archived: Claude Code's `/buddy` feature was retired on 2026-04-09. BuddyDex is preserved as a historical record of the buddy species, mechanics, and community knowledge
- ASCII art restored from the original Claude Code buddy system (`sprites.ts`) for historical accuracy. The fan-art replacements (introduced in v1.0 to avoid IP risk while `/buddy` was active) are no longer needed now that the feature has been retired
- Site subtitle note updated from "original fan-art" to "preserved for historical reference"
- Added archive banner to site header (localized in all 5 languages)
- README updated with archive notice; removed buddyboard.xyz cross-link (both projects affected by the feature removal)
- Phase 2 backlog cancelled in PRD; no further feature development planned

## [1.5.0] - 2026-04-12

### Added

- **Share functionality (Feature 1)**
  - URL hash routing: `buddydex.chatbot.tw/#duck` deep-links directly to a species detail modal
  - Hash validation with `decodeURIComponent` + allowlist (XSS-safe, never enters `innerHTML`)
  - Hatch animation auto-skipped when arriving via a shared hash link
  - Copy link button in detail modal (clipboard API with "Copied!" feedback + screen reader announcement)
  - Web Share API button on supported mobile browsers (falls back to copy link)
  - `og:image` meta tags (`og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`) — PNG asset pending
  - Browser back/forward navigation syncs modal open/close state via `hashchange` listener
- **Random explorer button (Feature 2)**
  - "Surprise me" button next to the Species section title
  - Consecutive clicks guaranteed not to repeat the same species
  - Localized label + aria-label in all 5 languages
- **Buddy customization teaching guide (Feature 3)**
  - Collapsible accordion section (native `<details>`/`<summary>`) below the species grid
  - Three topics: change name, change personality, change response language
  - Illustrative JSON examples in monospace code blocks
  - Disclaimer framing content as community-discovered tips, not official documentation
  - Full 5-language support
- **Five-stat display system (Feature 4)**
  - New "Stats" mechanics card listing Debugging, Patience, Chaos, Wisdom, Snark (community-observed names)
  - Detail modal stats block with ASCII progress bars (`█`/`░`) coloured by rarity
  - Stats roll randomly between rarity floor and 100, reroll on rarity/species switch
  - Stat names localized in all 5 languages
- **Data integrity test suite**: structural invariants for species, i18n keys, frames, hats, eyes, rarity order, and stat labels across all languages
- **Stats unit tests**: `rollStats()` range/floor correctness, `renderStatBar()` output shape and clamping
- **Hash router unit tests**: 16 cases covering happy path, empty/missing input, unknown species, and the full R2-M1 malicious hash menagerie
- `CLAUDE.md` agent guide encoding Phase 0 constraints (CSP, hash handling, aria-live, i18n, testing conventions)
- `DESIGN.md` living design system reference (colours, typography, rarity treatments, decisions log)
- Root-level `.mcp.json` with `chrome-devtools-mcp` at project scope
- `.nvmrc` pinned to Node 22
- Buddyboard.xyz competitive analysis (`docs/research/buddyboard-analysis.md`)
- Devil's advocate review rounds 1-6 with responses

### Changed

- Hatch animation now skippable by clicking anywhere on the overlay (fast-forwards to reveal)
- Language switcher on mobile (≤600px) renders as a native `<select>` dropdown instead of 5 squeezed buttons
- Mechanics section rendering switched from `innerHTML` to DOM API (`replaceChildren`) for XSS hygiene
- Species section title wrapped in `.section-header` flex row to accommodate the random button
- `render-detail.js` scroll lock refactored from inline `body.style.*` writes to constructable `CSSStyleSheet` + `document.adoptedStyleSheets` (CSP-safe, feature-detected for Safari < 16.4 fallback)
- Rarity button colours driven by `data-rarity` CSS attribute selectors instead of JS inline styles
- `package.json` engines field set to `>=22`
- GitHub Actions upgraded from `actions/checkout@v4` + `actions/setup-node@v4` to `@v5` (Node 24 internal runtime)
- CI Node version upgraded from 20 to 22 LTS (Node 20 EOL 2026-04-30)

### Fixed

- Inline GA4 initialization script extracted to `js/analytics.js` module, removing the last inline `<script>` from `index.html` (enables strict CSP)
- `window.gtag` exposed globally from analytics module so future custom event tracking works
- `aria-live` removed from the ASCII preview element that changes every 800ms; replaced with a dedicated `#detail-announce` visually-hidden announcer that fires only on user-initiated accessory changes
- Constructable `CSSStyleSheet` wrapped in `try/catch` for Safari < 16.4 graceful fallback (prevents site-wide JS crash on older WebKit)

### Security

- `vercel.json` now ships strict Content-Security-Policy without `style-src 'unsafe-inline'`
- Added `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` to CSP
- Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- `font-src` includes `'self'` for future self-hosted font readiness
- `vercel.json` tracked in git (previously `.gitignore`d)

## [1.4.0] - 2026-04-08

### Added

- Custom domain: `buddydex.chatbot.tw`
- `sitemap.xml` and `robots.txt` for search engine indexing
- Canonical URL, OG locale tags, and Twitter card meta tags for SEO
- Google Search Console property with sitemap submitted
- Phase 1 PRD and encyclopedia benchmark research document

## [1.3.0] - 2026-04-06

### Added

- Comprehensive accessibility improvements
  - Focus trap in detail modal (keyboard users stay within panel)
  - `role="dialog"` and `aria-modal="true"` on detail overlay
  - `aria-live="polite"` on ASCII preview for screen reader feedback
  - `tabindex="0"` and `role="button"` on species cards for keyboard navigation
  - Enter/Space key support to open species detail
  - Focus-visible indicators on shiny toggle, footer links
  - `prefers-reduced-motion` media query disables all animations

### Fixed

- Mobile detail modal: close button now sticky (visible after scrolling)
- iOS Safari background scroll leak when modal is open
- ASCII preview overflow on narrow screens (now uses `clamp()` sizing)
- Language switcher touch targets enlarged to meet 44px minimum
- Hat button touch targets enlarged on mobile

### Changed

- Section titles upgraded to uppercase with improved visual hierarchy
- Species cards show border highlight on hover
- Detail modal columns separated by a subtle divider line
- Custom scrollbar styling on detail panel
- Idle float animation only runs when modal is visible (performance)
- Species card heights standardized to prevent uneven grid rows
- Mechanics section now has its own heading ("How It Works" / localized)

## [1.2.0] - 2026-04-05

### Added

- Simplified Chinese (zh-CN) locale

## [1.1.0] - 2026-04-03

### Added

- Internationalization (i18n) support with 4 languages: English, Traditional Chinese (zh-TW), Japanese (ja), Korean (ko)
- Language switcher in header with auto-detection of browser language
- Language preference persisted in localStorage
- Google Analytics 4 integration

### Changed

- ASCII art replaced with original fan-art designs to avoid copyright concerns
- Fan-art disclaimer added to header and README
- Footer expanded with attribution, Anthropic trademark notice, and GitHub links

## [1.0.0] - 2026-04-02

### Added

- Species gallery displaying all 18 Claude Buddy species as ASCII art cards
- Detail overlay with live ASCII preview and try-on feature
  - Rarity selector (Common, Uncommon, Rare, Epic, Legendary)
  - Shiny toggle with rainbow gradient shimmer effect
  - Eye picker (6 styles: Dot, Star, Cross, Bullseye, At, Circle)
  - Hat picker (8 hats with rarity-gated availability)
- Dual-frame idle animation (800ms cycle) in detail preview
- System mechanics section explaining rarity, shiny, and accessory systems
- First-visit hatch animation (typewriter terminal effect with egg cracking sequence)
- Dark terminal theme with Claude brand color palette
- Responsive layout for mobile devices
- Deployed to Vercel

[unreleased]: https://github.com/Clementtang/buddydex/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/Clementtang/buddydex/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/Clementtang/buddydex/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Clementtang/buddydex/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Clementtang/buddydex/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Clementtang/buddydex/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Clementtang/buddydex/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Clementtang/buddydex/releases/tag/v1.0.0
