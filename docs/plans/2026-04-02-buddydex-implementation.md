# BuddyDex Implementation Plan [COMPLETED]

> Status: All 7 tasks completed and deployed as v1.0.0 on 2026-04-02.
> This plan is historical reference only. For future work, see `docs/prd.md`.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page Claude Buddy encyclopedia website with species grid, detail overlays with try-on feature, and opening hatch animation.

**Architecture:** Pure static HTML + CSS + JS, no framework. Data embedded as JS objects. CSS custom properties for design tokens. Event delegation for card interactions.

**Tech Stack:** HTML, CSS (custom properties, grid, animations), vanilla JS (ES modules), JetBrains Mono (Google Fonts), Vercel for deploy.

**Parallelization:** Tasks 1-3 are independent and can run in parallel. Task 4 depends on 1-3. Tasks 5-6 depend on 4. Task 7 depends on all.

---

### Task 1: Data Module — Species, Rarity, Accessories

**Files:**

- Create: `data/species.js`
- Create: `data/rarity.js`
- Create: `data/accessories.js`

**Step 1: Create rarity data**

```js
// data/rarity.js
export const RARITIES = [
  {
    id: "common",
    name: "Common",
    probability: 0.6,
    stars: 1,
    statFloor: 5,
    color: "#b0b0b0",
  },
  {
    id: "uncommon",
    name: "Uncommon",
    probability: 0.25,
    stars: 2,
    statFloor: 15,
    color: "#4ade80",
  },
  {
    id: "rare",
    name: "Rare",
    probability: 0.1,
    stars: 3,
    statFloor: 25,
    color: "#60a5fa",
  },
  {
    id: "epic",
    name: "Epic",
    probability: 0.04,
    stars: 4,
    statFloor: 35,
    color: "#c084fc",
  },
  {
    id: "legendary",
    name: "Legendary",
    probability: 0.01,
    stars: 5,
    statFloor: 50,
    color: "#fbbf24",
  },
];
```

**Step 2: Create accessories data**

```js
// data/accessories.js
export const EYES = [
  { id: "dot", name: "Dot", symbol: "·" },
  { id: "star", name: "Star", symbol: "✦" },
  { id: "cross", name: "Cross", symbol: "×" },
  { id: "bullseye", name: "Bullseye", symbol: "◉" },
  { id: "at", name: "At", symbol: "@" },
  { id: "circle", name: "Circle", symbol: "°" },
];

export const HATS = [
  { id: "none", name: "None", ascii: null, minRarity: "common" },
  { id: "crown", name: "Crown", ascii: "  👑", minRarity: "uncommon" },
  { id: "tophat", name: "Top Hat", ascii: "  🎩", minRarity: "uncommon" },
  { id: "propeller", name: "Propeller", ascii: "  🧢", minRarity: "uncommon" },
  { id: "halo", name: "Halo", ascii: "  😇", minRarity: "rare" },
  { id: "wizard", name: "Wizard", ascii: "  🧙", minRarity: "rare" },
  { id: "beanie", name: "Beanie", ascii: "  🎿", minRarity: "epic" },
  { id: "tinyduck", name: "Tiny Duck", ascii: "  🐤", minRarity: "legendary" },
];

// Rarity hierarchy for hat availability check
const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

export function getAvailableHats(rarityId) {
  const rarityIndex = RARITY_ORDER.indexOf(rarityId);
  return HATS.filter((hat) => {
    const hatIndex = RARITY_ORDER.indexOf(hat.minRarity);
    return rarityIndex >= hatIndex;
  });
}
```

**Step 3: Create species data with ASCII art**

Each species needs: id, name, description, ASCII art template with `{eye}` placeholder.
Research actual Claude Buddy ASCII art from source code / community repos. Create `data/species.js` with all 18 species.

```js
// data/species.js
// ASCII art uses {eye} as placeholder for eye symbol, {hat} for hat line
export const SPECIES = [
  {
    id: "duck",
    name: "Duck",
    description: "A friendly duck who waddles through your terminal.",
    ascii: ["{hat}", "  __", " ({eye})<", "/|  |\\", " |__|", "  ||"],
  },
  // ... all 18 species
];
```

Note: The exact ASCII art needs to be sourced from Claude Code's actual buddy rendering. The agent implementing this task should research `claude-buddy` repos on GitHub (e.g., claude-buddy.vercel.app source, any-buddy) to get accurate ASCII art for all 18 species.

**Step 4: Commit**

```bash
git add data/
git commit -m "feat: add buddy data modules (species, rarity, accessories)"
```

---

### Task 2: Project Scaffolding — HTML + CSS Design System

**Files:**

- Create: `index.html`
- Create: `css/reset.css`
- Create: `css/tokens.css`
- Create: `css/layout.css`
- Create: `css/components.css`
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }]
    }
  ]
}
```

**Step 2: Create CSS reset**

```css
/* css/reset.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}
body {
  min-height: 100vh;
}
img,
svg {
  display: block;
  max-width: 100%;
}
button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
}
```

**Step 3: Create design tokens**

```css
/* css/tokens.css */
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap");

:root {
  /* Colors */
  --bg-primary: #0d0d0d;
  --bg-card: #1a1a1a;
  --bg-card-hover: #222222;
  --accent: #da7756;
  --accent-dim: #a85a3e;
  --text-primary: #f0e6d3;
  --text-secondary: #8a7d72;
  --border: #2a2a2a;

  /* Rarity colors */
  --rarity-common: #b0b0b0;
  --rarity-uncommon: #4ade80;
  --rarity-rare: #60a5fa;
  --rarity-epic: #c084fc;
  --rarity-legendary: #fbbf24;

  /* Typography */
  --font-ui: system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;

  /* Layout */
  --max-width: 1200px;
  --card-radius: 8px;
  --grid-gap: 1rem;
}
```

**Step 4: Create layout CSS**

```css
/* css/layout.css */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-ui);
  line-height: 1.6;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

section {
  padding: var(--space-3xl) 0;
}

/* Will be extended per section in components.css */
```

**Step 5: Create index.html skeleton**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BuddyDex — Claude Buddy Encyclopedia</title>
    <meta
      name="description"
      content="Complete encyclopedia of all 18 Claude Code buddy species, rarities, accessories, and shiny variants."
    />
    <link rel="stylesheet" href="css/reset.css" />
    <link rel="stylesheet" href="css/tokens.css" />
    <link rel="stylesheet" href="css/layout.css" />
    <link rel="stylesheet" href="css/components.css" />
  </head>
  <body>
    <!-- Opening Hatch Animation -->
    <div id="hatch-overlay" class="hatch-overlay">
      <pre id="hatch-terminal" class="hatch-terminal"></pre>
    </div>

    <!-- Header -->
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">BuddyDex</h1>
        <p class="site-subtitle">Claude Buddy Encyclopedia</p>
      </div>
    </header>

    <!-- Mechanics Section -->
    <section id="mechanics" class="mechanics-section">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <div class="mechanics-grid">
          <!-- 3 mechanic cards: Rarity, Shiny, Accessories -->
        </div>
      </div>
    </section>

    <!-- Species Grid -->
    <section id="species" class="species-section">
      <div class="container">
        <div class="species-header">
          <h2 class="section-title">Species</h2>
          <div id="rarity-filter" class="rarity-filter">
            <!-- Filter buttons generated by JS -->
          </div>
        </div>
        <div id="species-grid" class="species-grid">
          <!-- Cards generated by JS -->
        </div>
      </div>
    </section>

    <!-- Detail Overlay -->
    <div id="detail-overlay" class="detail-overlay" hidden>
      <div class="detail-panel">
        <button class="detail-close" aria-label="Close">&times;</button>
        <div class="detail-content">
          <div class="detail-preview">
            <pre id="detail-ascii" class="detail-ascii"></pre>
          </div>
          <div class="detail-info">
            <h3 id="detail-name" class="detail-name"></h3>
            <p id="detail-description" class="detail-description"></p>
            <div id="detail-controls" class="detail-controls">
              <!-- Rarity selector, shiny toggle, eye picker, hat picker -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container">
        <p>
          Data sourced from Claude Code community research. Not affiliated with
          Anthropic.
        </p>
      </div>
    </footer>

    <script type="module" src="js/main.js"></script>
  </body>
</html>
```

**Step 6: Commit**

```bash
git add index.html css/ vercel.json
git commit -m "feat: project scaffolding with HTML skeleton and CSS design system"
```

---

### Task 3: ASCII Art Research

**Files:**

- Update: `data/species.js` (populated with real ASCII art)

**Step 1: Research ASCII art sources**

Search GitHub for Claude Buddy ASCII art:

- `claude-buddy.vercel.app` source repo
- `any-buddy` repo (cpaczek/any-buddy)
- Claude Code source (if accessible)
- Community galleries / screenshots

**Step 2: Create accurate ASCII art for all 18 species**

Each species ASCII art must:

- Use `{eye}` placeholder where eyes should go
- Have a `{hat}` line at the top for hat rendering
- Be no wider than 20 characters for card display
- Look recognizable at terminal font sizes

**Step 3: Commit**

```bash
git add data/species.js
git commit -m "feat: add accurate ASCII art for all 18 buddy species"
```

---

### Task 4: Species Grid + Card Rendering

**Depends on: Tasks 1, 2, 3**

**Files:**

- Create: `js/main.js`
- Create: `js/render-grid.js`
- Create: `js/render-mechanics.js`
- Update: `css/components.css`

**Step 1: Create components CSS for cards**

```css
/* Species grid */
.species-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--grid-gap);
}

.species-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--space-lg);
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s,
    background 0.2s;
}

.species-card:hover {
  transform: translateY(-4px);
  background: var(--bg-card-hover);
}

.species-card__ascii {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  line-height: 1.2;
  white-space: pre;
  margin-bottom: var(--space-sm);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.species-card__name {
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.rarity-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* Rarity filter */
.rarity-filter {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.filter-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}

/* Mechanics cards */
.mechanics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.mechanic-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--space-xl);
}

.mechanic-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  color: var(--accent);
}
```

**Step 2: Create render-grid.js**

```js
// js/render-grid.js
import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES } from "../data/accessories.js";

export function renderSpeciesGrid(container, filterRarity = "all") {
  container.innerHTML = "";
  const defaultEye = EYES[0].symbol;

  SPECIES.forEach((species) => {
    if (filterRarity !== "all" && species.defaultRarity !== filterRarity)
      return;

    const card = document.createElement("div");
    card.className = "species-card";
    card.dataset.speciesId = species.id;

    const asciiLines = species.ascii
      .map((line) =>
        line.replace(/\{eye\}/g, defaultEye).replace(/\{hat\}/g, ""),
      )
      .join("\n");

    card.innerHTML = `
      <div class="species-card__ascii">${asciiLines}</div>
      <div class="species-card__name">${species.name}</div>
    `;

    container.appendChild(card);
  });
}

export function renderRarityFilter(container, onFilter) {
  const allBtn = createFilterBtn("All", "all", true);
  container.appendChild(allBtn);

  RARITIES.forEach((r) => {
    const btn = createFilterBtn(r.name, r.id, false);
    btn.style.setProperty("--filter-color", r.color);
    container.appendChild(btn);
  });

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    container
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    onFilter(btn.dataset.rarity);
  });
}

function createFilterBtn(label, rarity, active) {
  const btn = document.createElement("button");
  btn.className = `filter-btn${active ? " active" : ""}`;
  btn.dataset.rarity = rarity;
  btn.textContent = label;
  return btn;
}
```

**Step 3: Create render-mechanics.js**

Renders the 3 mechanic info cards (Rarity, Shiny, Accessories) with data from the data modules.

**Step 4: Create main.js to wire everything together**

```js
// js/main.js
import { renderSpeciesGrid, renderRarityFilter } from "./render-grid.js";
import { renderMechanics } from "./render-mechanics.js";
import { openDetail } from "./render-detail.js";

// Init mechanics section
renderMechanics(document.querySelector(".mechanics-grid"));

// Init species grid
const grid = document.getElementById("species-grid");
const filter = document.getElementById("rarity-filter");

renderSpeciesGrid(grid);
renderRarityFilter(filter, (rarity) => renderSpeciesGrid(grid, rarity));

// Card click → open detail
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".species-card");
  if (!card) return;
  openDetail(card.dataset.speciesId);
});
```

**Step 5: Open in browser, verify grid renders 18 cards with filter working**

**Step 6: Commit**

```bash
git add js/ css/components.css
git commit -m "feat: species grid with rarity filter and mechanics section"
```

---

### Task 5: Detail Overlay + Try-On Feature

**Depends on: Task 4**

**Files:**

- Create: `js/render-detail.js`
- Create: `css/detail.css`
- Update: `index.html` (link detail.css)

**Step 1: Create detail overlay CSS**

Styles for: overlay backdrop, detail panel (left-right layout), ASCII preview area, control widgets (rarity selector, shiny toggle, eye/hat pickers). Mobile: stack top-bottom.

**Step 2: Create render-detail.js**

```js
// js/render-detail.js
import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES, HATS, getAvailableHats } from "../data/accessories.js";

let currentState = {
  speciesId: null,
  rarity: "common",
  shiny: false,
  eye: "dot",
  hat: "none",
};

export function openDetail(speciesId) {
  currentState = {
    speciesId,
    rarity: "common",
    shiny: false,
    eye: "dot",
    hat: "none",
  };
  const overlay = document.getElementById("detail-overlay");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  renderDetail();
}

export function closeDetail() {
  const overlay = document.getElementById("detail-overlay");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

function renderDetail() {
  const species = SPECIES.find((s) => s.id === currentState.speciesId);
  if (!species) return;

  // Update name & description
  document.getElementById("detail-name").textContent = species.name;
  document.getElementById("detail-description").textContent =
    species.description;

  // Render ASCII preview with current accessories
  renderAsciiPreview(species);

  // Render control widgets
  renderControls();
}

function renderAsciiPreview(species) {
  const eye = EYES.find((e) => e.id === currentState.eye);
  const hat = HATS.find((h) => h.id === currentState.hat);

  const lines = species.ascii
    .map((line) =>
      line
        .replace(/\{eye\}/g, eye.symbol)
        .replace(/\{hat\}/g, hat?.ascii || ""),
    )
    .join("\n");

  const el = document.getElementById("detail-ascii");
  el.textContent = lines;
  el.classList.toggle("shiny", currentState.shiny);
}

function renderControls() {
  const container = document.getElementById("detail-controls");
  container.innerHTML = "";

  // Rarity selector
  container.appendChild(createRaritySelector());

  // Shiny toggle
  container.appendChild(createShinyToggle());

  // Eye picker
  container.appendChild(createEyePicker());

  // Hat picker
  container.appendChild(createHatPicker());
}

function createRaritySelector() {
  /* dropdown/buttons for 5 rarities */
}
function createShinyToggle() {
  /* toggle switch */
}
function createEyePicker() {
  /* 6 eye buttons showing symbols */
}
function createHatPicker() {
  /* available hats based on selected rarity, grayed out unavailable */
}

// Close handlers
document.getElementById("detail-overlay").addEventListener("click", (e) => {
  if (e.target.classList.contains("detail-overlay")) closeDetail();
});
document.querySelector(".detail-close").addEventListener("click", closeDetail);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetail();
});
```

**Step 3: Implement all control widget functions**

Each widget:

- Renders its UI
- Attaches event listener
- On change: updates `currentState`, calls `renderAsciiPreview()`
- Hat picker: re-renders when rarity changes (grays out unavailable hats)

**Step 4: Add shiny CSS effect**

```css
.detail-ascii.shiny {
  background: linear-gradient(
    135deg,
    #ff6b6b,
    #feca57,
    #48dbfb,
    #ff9ff3,
    #54a0ff
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shiny-shimmer 3s ease infinite;
}

@keyframes shiny-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

**Step 5: Verify overlay opens, try-on works, Escape closes, mobile layout stacks**

**Step 6: Commit**

```bash
git add js/render-detail.js css/detail.css index.html
git commit -m "feat: detail overlay with live try-on accessory switching"
```

---

### Task 6: Opening Hatch Animation

**Depends on: Task 2**

**Files:**

- Create: `js/hatch-animation.js`
- Create: `css/hatch.css`
- Update: `index.html` (link hatch.css)

**Step 1: Create hatch CSS**

```css
.hatch-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s;
}

.hatch-overlay.fade-out {
  opacity: 0;
  pointer-events: none;
}

.hatch-terminal {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--accent);
  white-space: pre;
  line-height: 1.4;
}
```

**Step 2: Create hatch-animation.js**

```js
// js/hatch-animation.js
import { SPECIES } from "../data/species.js";
import { EYES } from "../data/accessories.js";

const EGG_FRAMES = [
  // Frame 1: intact egg
  "    ___\n   /   \\\n  |     |\n  |     |\n   \\___/",
  // Frame 2: crack
  "    ___\n   / | \\\n  |  |  |\n  | /  |\n   \\___/",
  // Frame 3: breaking
  "    _*_\n   / | \\\n  |  /  |\n  \\  | /\n   \\_|_/",
];

export async function playHatchAnimation() {
  if (localStorage.getItem("buddydex-hatched")) {
    document.getElementById("hatch-overlay").remove();
    return;
  }

  const terminal = document.getElementById("hatch-terminal");
  const overlay = document.getElementById("hatch-overlay");

  // Type out "Hatching..." text
  await typeText(terminal, "> Hatching your buddy...\n\n");
  await sleep(500);

  // Show egg animation frames
  for (const frame of EGG_FRAMES) {
    terminal.textContent = frame;
    await sleep(600);
  }

  // Reveal random buddy
  const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
  const eye = EYES[0].symbol;
  const ascii = species.ascii
    .map((l) => l.replace(/\{eye\}/g, eye).replace(/\{hat\}/g, ""))
    .join("\n");

  terminal.textContent = "";
  await typeText(terminal, ascii + "\n\n");
  await typeText(terminal, `  It's a ${species.name}!\n`);
  await sleep(1500);

  // Fade out
  overlay.classList.add("fade-out");
  setTimeout(() => overlay.remove(), 500);
  localStorage.setItem("buddydex-hatched", "1");
}

function typeText(el, text, speed = 30) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
```

**Step 3: Import and call from main.js**

```js
import { playHatchAnimation } from "./hatch-animation.js";
playHatchAnimation();
```

**Step 4: Verify animation plays on first visit, skips on reload**

**Step 5: Commit**

```bash
git add js/hatch-animation.js css/hatch.css index.html
git commit -m "feat: opening hatch animation with typewriter effect"
```

---

### Task 7: Responsive Design, Polish, Deploy

**Depends on: Tasks 4, 5, 6**

**Files:**

- Update: `css/layout.css` (media queries)
- Update: `css/components.css` (responsive grid)
- Update: `css/detail.css` (mobile overlay)

**Step 1: Add responsive breakpoints**

```css
/* Mobile: stack to single column */
@media (max-width: 768px) {
  .species-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  .mechanics-grid {
    grid-template-columns: 1fr;
  }
  .detail-content {
    flex-direction: column;
  }
  .detail-preview {
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  .species-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .rarity-filter {
    justify-content: center;
  }
}
```

**Step 2: Add idle animation to ASCII preview**

```css
.detail-ascii {
  animation: idle-float 3s ease-in-out infinite;
}

@keyframes idle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
```

**Step 3: Add hover effects, focus states, keyboard navigation**

**Step 4: Cross-browser test (Chrome, Safari, Firefox)**

**Step 5: Deploy to Vercel**

```bash
cd ~/buddydex
npx vercel --prod
```

**Step 6: Commit final polish**

```bash
git add -A
git commit -m "feat: responsive design, animations, polish"
```

---

## Parallelization Map

```
Task 1 (Data)  ──┐
Task 2 (HTML/CSS)─┼──→ Task 4 (Grid) ──→ Task 5 (Detail/Try-on)──→ Task 7 (Polish/Deploy)
Task 3 (ASCII) ──┘          │
                             └──→ Task 6 (Hatch Animation) ────────→ Task 7
```

**Parallel Group A (independent):** Tasks 1 + 2 + 3
**Sequential after A:** Task 4 → Task 5 + Task 6 (parallel) → Task 7
