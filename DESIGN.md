# BuddyDex Design System

> Living design reference. For the original planning document, see [`docs/plans/2026-04-02-buddydex-design.md`](docs/plans/2026-04-02-buddydex-design.md).
> Last updated: 2026-04-10 (v1.4.0)

## Product Context

- **What this is**: A browsable field guide / encyclopedia for Claude Code `/buddy` companions
- **Who it's for**: Claude Code users curious about buddies (new), community members sharing buddy configurations, casual visitors arriving from social links
- **Positioning**: Browse-first, content-deep, zero-friction. Complementary to [buddyboard.xyz](https://buddyboard.xyz), which focuses on leaderboard / social submission
- **Tech posture**: Pure static HTML + CSS + vanilla JS. No build step. No framework. Deployed on Vercel

## Aesthetic Direction

- **Mood**: Dark terminal nostalgia, warm earthy accents, minimal decoration
- **Inspired by**: Claude brand identity (orange-brown `#da7756`), Pokémon field guide layouts, terminal aesthetics
- **Restraint**: No holographic foil in v1. No particle effects. No heavy animations. Micro-interactions only

## Color Tokens

Source of truth: [`css/tokens.css`](css/tokens.css).

### Base

| Token             | Value     | Usage                         |
| ----------------- | --------- | ----------------------------- |
| `--bg-primary`    | `#0d0d0d` | Page background, near-black   |
| `--bg-card`       | `#1a1a1a` | Cards, panels, modal backdrop |
| `--bg-card-hover` | `#222222` | Hover states                  |
| `--border`        | `#2a2a2a` | Primary borders, dividers     |

### Brand & Text

| Token              | Value     | Usage                              |
| ------------------ | --------- | ---------------------------------- |
| `--accent`         | `#da7756` | Claude orange-brown, CTAs, accents |
| `--accent-dim`     | `#a85a3e` | Accent hover / pressed state       |
| `--text-primary`   | `#f0e6d3` | Headings, body text, warm white    |
| `--text-secondary` | `#8a7d72` | Labels, descriptions, warm gray    |

### Rarity Palette

| Rarity    | Token                | Value     |
| --------- | -------------------- | --------- |
| Common    | `--rarity-common`    | `#b0b0b0` |
| Uncommon  | `--rarity-uncommon`  | `#4ade80` |
| Rare      | `--rarity-rare`      | `#60a5fa` |
| Epic      | `--rarity-epic`      | `#c084fc` |
| Legendary | `--rarity-legendary` | `#fbbf24` |

### Dark mode only

This is the only mode. No light mode planned — the terminal aesthetic requires dark, and the audience is developer-leaning.

## Typography

- **UI / headings**: `system-ui, -apple-system, sans-serif` via `--font-ui`
- **ASCII art / code / data**: `"JetBrains Mono", monospace` via `--font-mono`, loaded from Google Fonts
- **No custom display font**. System sans keeps the page small and fast-loading

## Spacing Scale

4px-derived, custom property driven:

| Token         | Value     |
| ------------- | --------- |
| `--space-xs`  | `0.25rem` |
| `--space-sm`  | `0.5rem`  |
| `--space-md`  | `1rem`    |
| `--space-lg`  | `1.5rem`  |
| `--space-xl`  | `2rem`    |
| `--space-2xl` | `3rem`    |
| `--space-3xl` | `4rem`    |

Max content width: `--max-width: 1200px`. Card radius: `--card-radius: 8px`.

## Rarity Visual Treatments (current)

| Rarity    | Current implementation                            |
| --------- | ------------------------------------------------- |
| Common    | Border uses rarity color, no glow                 |
| Uncommon  | Border uses rarity color, no glow                 |
| Rare      | Border uses rarity color, no glow                 |
| Epic      | Border uses rarity color, no glow                 |
| Legendary | Border uses rarity color, no glow                 |
| Shiny     | CSS gradient shimmer effect on ASCII preview only |

Holographic foil / outer glow / pulse animation are **Phase 2 backlog**, not yet implemented. See `docs/prd.md` Phase 2 backlog for reference implementation notes.

## Motion Principles

- **Respect `prefers-reduced-motion`**: All animations disabled via media query when the user requests reduced motion
- **Idle float** on species cards: subtle, pauses when modal is closed (performance)
- **Hatch animation**: typewriter-style terminal output on first visit, localStorage skip for return visitors
- **Shiny shimmer**: CSS gradient animation, no JS, no particles
- **No entrance/exit animations** on modals — fade only
- **Duration**: 150–300ms for micro-interactions, up to 800ms for idle loops

## Accessibility Principles

- **Keyboard-first**: all interactive elements reachable via Tab, activatable via Enter/Space
- **Focus trap** in detail modal: Tab cycles within the modal while open
- **ARIA**: `role="dialog"` + `aria-modal="true"` on detail overlay; `aria-live="polite"` on user-triggered announcements only (not animation loops)
- **Touch targets**: minimum 44x44px on mobile (language switcher, hat buttons)
- **`prefers-reduced-motion`**: disables all non-essential animations
- **Color contrast**: body text `#f0e6d3` on `#0d0d0d` meets WCAG AA
- **No color-only meaning**: rarity is conveyed via text label, not color alone
- **5 languages**: `en / zh-TW / zh-CN / ja / ko` — full UI translation, no mixed-language fragments

## Layout Approach

- **Single-page, vertical scroll**: hatch → mechanics → species grid → footer
- **Responsive**: mobile-first breakpoints via `clamp()` for fluid sizing
- **Grid**: species cards in CSS Grid, auto-fill with `minmax()`, 1–4 columns depending on viewport
- **Detail modal**: fixed overlay, desktop uses left-right split, mobile uses top-bottom stack

## Decisions Log

| Date       | Decision                                                                  | Rationale                                                                                                                     |
| ---------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-02 | Claude orange-brown `#da7756` as sole accent                              | Ties visually to Claude brand without copying logo; restrained usage avoids IP concerns                                       |
| 2026-04-02 | ASCII-only visuals, no pixel art or custom illustrations                  | Zero asset pipeline, aligns with terminal aesthetic, faster ship                                                              |
| 2026-04-02 | Hatch → toast simplification (removed roll-retry loop)                    | Interaction had no clear purpose; simplified to a one-time opening animation                                                  |
| 2026-04-02 | Rarity badge on species cards removed                                     | Species and rarity are independent in the buddy system — rarity rolls separately, not tied to species                         |
| 2026-04-02 | Rarity filter on grid removed                                             | Same reason — grid-level rarity filtering is not meaningful                                                                   |
| 2026-04-03 | Original fan-art ASCII replaces direct Claude Code `/buddy` transcription | Reduces IP risk; BuddyDex is explicitly positioned as original fan-art with disclaimer                                        |
| 2026-04-05 | 5-language i18n (en / zh-TW / zh-CN / ja / ko)                            | Top Claude Code markets by usage; translations live in `data/i18n.js` as a single module for now                              |
| 2026-04-06 | Accessibility pass: focus trap, iOS scroll lock, ARIA live                | Reviewed against WCAG; fixed mobile modal UX issues                                                                           |
| 2026-04-08 | Custom domain `buddydex.chatbot.tw` + SEO meta                            | Off `vercel.app` subdomain for brand independence; added sitemap, robots.txt, canonical URL                                   |
| 2026-04-10 | Phase 0 split into batches A / B / C                                      | Round 2 review: avoid "prerequisite trap"; unblock Phase 1 faster                                                             |
| 2026-04-10 | URL hash treated as untrusted input                                       | Round 2 review: hash is user-controllable, XSS risk; allowlist via `SPECIES.find(s => s.id === hash)`, never into `innerHTML` |
| 2026-04-10 | Buddy Board competitive analysis → Feature 4 (Stats), DESIGN.md split     | Same-mechanic competitor surfaced gaps (Stats) and docs layout opportunities (root-level DESIGN.md)                           |

## References

- Original planning doc: [`docs/plans/2026-04-02-buddydex-design.md`](docs/plans/2026-04-02-buddydex-design.md)
- Current PRD: [`docs/prd.md`](docs/prd.md)
- Competitive analysis: [`docs/research/buddyboard-analysis.md`](docs/research/buddyboard-analysis.md)
- Encyclopedia benchmarks: [`docs/research/encyclopedia-benchmarks.md`](docs/research/encyclopedia-benchmarks.md)
- CSS source of truth: [`css/tokens.css`](css/tokens.css)
