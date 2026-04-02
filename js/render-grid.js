import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";

const DEFAULT_EYE = "\u00b7";

function renderAsciiFrame(species, eyeSymbol = DEFAULT_EYE) {
  const frame = species.frames[0];
  return frame.map((line) => line.replaceAll("{E}", eyeSymbol)).join("\n");
}

export function renderSpeciesGrid(container, filterRarity = "all") {
  const species =
    filterRarity === "all"
      ? SPECIES
      : SPECIES.filter((_, i) => getRarityForIndex(i) === filterRarity);

  container.innerHTML = species
    .map(
      (sp) => `
    <div class="species-card" data-species-id="${sp.id}">
      <div class="ascii-art">${renderAsciiFrame(sp)}</div>
      <div class="species-name">${sp.name}</div>
    </div>
  `,
    )
    .join("");
}

export function renderRarityFilter(container, onFilter) {
  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.classList.add("active");
  allButton.dataset.rarity = "all";
  container.appendChild(allButton);

  for (const rarity of RARITIES) {
    const button = document.createElement("button");
    button.textContent = rarity.name;
    button.dataset.rarity = rarity.id;
    container.appendChild(button);
  }

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    container
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    onFilter(button.dataset.rarity);
  });
}

/**
 * Assigns a rarity to a species index in a deterministic way for display.
 * This is just for the filter demo — the actual game would roll randomly.
 */
function getRarityForIndex(index) {
  const mapping = [
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "common",
    "uncommon",
    "uncommon",
    "uncommon",
    "uncommon",
    "rare",
    "rare",
    "epic",
  ];
  return mapping[index] || "common";
}
