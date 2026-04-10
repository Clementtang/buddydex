# BuddyDex

A fan-made encyclopedia of Claude Buddy species — the virtual ASCII pet companions in Claude Code.

**Live site:** [buddydex.chatbot.tw](https://buddydex.chatbot.tw)

> **Looking for a leaderboard instead?** Check out [buddyboard.xyz](https://buddyboard.xyz) — a competitive leaderboard and shareable trading cards for Claude Code `/buddy` companions. BuddyDex focuses on browsing and content depth (descriptions, try-on, 5 languages); Buddy Board focuses on social submission and ranking. The two projects are complementary.

## Features

- **Species Gallery** — All 18 buddy species displayed as ASCII art cards with idle animations
- **Detail View with Try-On** — Click any species to open a detail panel where you can:
  - Switch between 5 rarity tiers (Common, Uncommon, Rare, Epic, Legendary)
  - Toggle shiny mode (rainbow shimmer effect)
  - Swap between 6 eye styles
  - Preview 8 hat accessories (availability depends on rarity)
- **System Mechanics** — Overview of rarity probabilities, shiny mechanics, and accessory system
- **Hatch Animation** — First-time visitors see a terminal-style egg hatching sequence
- **Multilingual** — English, 正體中文, 简体中文, 日本語, 한국어 with auto-detection
- **Accessible** — Keyboard navigation, focus traps, ARIA roles, `prefers-reduced-motion` support

## Tech Stack

- Pure HTML + CSS + JavaScript (no framework, no build step)
- ES modules
- CSS custom properties for theming
- Deployed on Vercel

## Documentation

- [`DESIGN.md`](DESIGN.md) — Living design system reference (colors, typography, rarity treatments, accessibility, decisions log)
- [`CHANGELOG.md`](CHANGELOG.md) — Release history
- [`docs/prd.md`](docs/prd.md) — Current product requirements (Phase 0 + Phase 1)
- [`docs/research/`](docs/research/) — Benchmarks and competitive analysis

## Data Sources

- **Species names, rarity tiers, and accessory system**: Based on publicly available community documentation of the Claude Code buddy feature
- **ASCII art**: Original fan-art designs created for this project. These do **not** represent the actual in-game appearance — the real buddy sprites may look different in Claude Code

## Disclaimer

This is an **unofficial fan project**. It is not affiliated with, endorsed by, or sponsored by Anthropic, PBC.

"Claude", "Claude Code", and "Claude Buddy" are trademarks or product names of Anthropic, PBC. All rights to those names and the underlying buddy system belong to Anthropic.

If Anthropic believes any content in this project infringes on their intellectual property, please open an issue and it will be promptly addressed.

## License

This project's **source code** (HTML, CSS, JavaScript logic) is released under the [MIT License](LICENSE).

The **buddy species names and game mechanics** originate from Anthropic's Claude Code product and remain the intellectual property of Anthropic, PBC. The ASCII art in this project is original fan-art and does not represent official Anthropic assets.

## Forking

If you fork this project, remember to replace the Google Analytics ID in `index.html` (`G-1CTR65SW2P`) with your own, or remove the GA script entirely.

## Author

Built by [Clement Tang](https://github.com/Clementtang) as a fan project.
