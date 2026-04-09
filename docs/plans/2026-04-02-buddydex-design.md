# BuddyDex Design [COMPLETED]

> Status: Completed and deployed as v1.0.0 on 2026-04-02.
> All design decisions in this document have been implemented. Subsequent changes (i18n, a11y, SEO) are tracked in CHANGELOG.md.

## Overview

Claude Buddy 圖鑑網站，單頁式靜態網站，深色終端風格搭配 Claude 品牌配色。

## Data Source

18 species, 5 rarity tiers, 6 eye styles, 8 hats, shiny variant (1% independent chance).

| Rarity    | Probability | Star | Stat Floor | Available Hats            |
| --------- | ----------- | ---- | ---------- | ------------------------- |
| Common    | 60%         | 1    | 5          | None                      |
| Uncommon  | 25%         | 2    | 15         | Crown, Top Hat, Propeller |
| Rare      | 10%         | 3    | 25         | + Halo, Wizard            |
| Epic      | 4%          | 4    | 35         | + Beanie                  |
| Legendary | 1%          | 5    | 50         | + Tiny Duck               |

Species: Duck, Goose, Cat, Rabbit, Owl, Penguin, Turtle, Snail, Dragon, Octopus, Axolotl, Ghost, Robot, Blob, Cactus, Mushroom, Chonk, Capybara

Eyes: Dot `·`, Star `✦`, Cross `×`, Bullseye `◉`, At `@`, Circle `°`

## Page Structure (single page, top to bottom)

### 1. Opening Hatch Animation

- Auto-plays on first visit (ASCII egg → crack → reveal random buddy)
- ~3-4 seconds, terminal-style character-by-character printing
- Fades/collapses into page header decoration after completion
- localStorage skip for return visitors

### 2. System Mechanics Section

- Horizontal blocks with icons + short text
- Three mechanics: Rarity (5 tiers + probabilities), Shiny (1% independent), Accessories (6 eyes + 8 hats)

### 3. Species Grid (18 cards)

- ~~Pixel art buddy + name + rarity badge on each card~~ → Implemented as ASCII art + name only. Rarity badge omitted because species and rarity are independent in the buddy system (rarity is rolled separately, not tied to species).
- ~~Filter by rarity~~ → Removed during implementation. Species don't have inherent rarities, so filtering by rarity on the grid is not meaningful.
- Click to expand overlay with detail view

### 4. Footer

- Data source attribution, GitHub link

## Card Detail Overlay (with try-on feature)

**Desktop: left-right layout / Mobile: top-bottom**

**Left — ASCII Live Preview**

- Monospace rendered ASCII art with idle animation (subtle float)
- Shiny: CSS gradient shimmer effect
- Updates in real-time as user toggles accessories

**Right — Info + Accessory Switcher**

- Species name, description
- Rarity selector (switching updates available hats)
- Shiny toggle
- Eye picker (6 options)
- Hat picker (shows available hats for selected rarity, grays out unavailable)

## Visual Design

**Colors:**

- Background: near-black `#0d0d0d`
- Cards/panels: dark gray `#1a1a1a`
- Primary accent: Claude orange-brown `#da7756`
- Text: warm white `#f0e6d3`
- Secondary text: warm gray `#8a7d72`

**Rarity colors:**
| Rarity | Color |
|--------|-------|
| Common | Gray-white |
| Uncommon | Green |
| Rare | Blue |
| Epic | Purple |
| Legendary | Gold |

**Typography:**

- UI/headings: system sans-serif
- ASCII rendering: JetBrains Mono or Fira Code (monospace)

**Animation principles:**

- Restrained micro-interactions (hover lift, rarity badge glow)
- Shiny effect: CSS gradient animation, no particle library
- Opening animation: typewriter terminal output simulation

## Tech Stack

- Pure frontend: HTML + CSS + JS (no framework)
- Deploy to Vercel
- Responsive design (mobile-friendly)
- Project directory: ~/buddydex
