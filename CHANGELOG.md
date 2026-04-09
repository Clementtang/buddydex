# Changelog

All notable changes to BuddyDex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

[unreleased]: https://github.com/Clementtang/buddydex/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/Clementtang/buddydex/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Clementtang/buddydex/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Clementtang/buddydex/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Clementtang/buddydex/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Clementtang/buddydex/releases/tag/v1.0.0
