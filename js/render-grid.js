import { SPECIES } from "../data/species.js";

const DEFAULT_EYE = "\u00b7";

function renderAsciiFrame(species, eyeSymbol = DEFAULT_EYE) {
  const frame = species.frames[0];
  return frame.map((line) => line.replaceAll("{E}", eyeSymbol)).join("\n");
}

export function renderSpeciesGrid(container) {
  container.innerHTML = SPECIES.map(
    (sp) => `
    <div class="species-card" data-species-id="${sp.id}">
      <div class="ascii-art">${renderAsciiFrame(sp)}</div>
      <div class="species-name">${sp.name}</div>
    </div>
  `,
  ).join("");
}
