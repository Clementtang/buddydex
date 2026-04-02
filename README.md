# BuddyDex

A fan-made encyclopedia of [Claude Buddy](https://docs.anthropic.com/en/docs/claude-code/buddy) species — the virtual ASCII pet companions in [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview).

**Live site:** [buddydex.vercel.app](https://buddydex.vercel.app) (or your deployed URL)

## Features

- **Species Gallery** — All 18 buddy species displayed as ASCII art cards with idle animations
- **Detail View with Try-On** — Click any species to open a detail panel where you can:
  - Switch between 5 rarity tiers (Common, Uncommon, Rare, Epic, Legendary)
  - Toggle shiny mode (rainbow shimmer effect)
  - Swap between 6 eye styles
  - Preview 8 hat accessories (availability depends on rarity)
- **System Mechanics** — Overview of rarity probabilities, shiny mechanics, and accessory system
- **Hatch Animation** — First-time visitors see a terminal-style egg hatching sequence

## Tech Stack

- Pure HTML + CSS + JavaScript (no framework, no build step)
- ES modules
- CSS custom properties for theming
- Deployed on Vercel

## Development

```bash
# Serve locally
npx serve .

# Or any static file server
python3 -m http.server 8090
```

Open `http://localhost:8090` (or your chosen port).

## Data Sources

Buddy species data (ASCII art, rarity tiers, accessories) was sourced from community research of the Claude Code buddy system, including:

- Community-maintained sprite references
- Claude Buddy system documentation compiled by users

## Disclaimer

This is an **unofficial fan project**. It is not affiliated with, endorsed by, or sponsored by Anthropic, PBC.

"Claude", "Claude Code", and "Claude Buddy" are trademarks or product names of Anthropic, PBC. All rights to those names and the underlying buddy system belong to Anthropic.

The ASCII art representations in this project are based on community-sourced references of the Claude Buddy system. If Anthropic believes any content in this project infringes on their intellectual property, please open an issue and it will be promptly addressed.

## License

This project's **source code** (HTML, CSS, JavaScript logic) is released under the [MIT License](LICENSE).

The **buddy character designs, names, and ASCII art** originate from Anthropic's Claude Code product. Those creative assets remain the intellectual property of Anthropic, PBC and are reproduced here under fair use for fan/educational purposes. This license does not grant rights to Anthropic's intellectual property.

## Author

Built by [Clement Tang](https://github.com/Clementtang) as a fan project.
