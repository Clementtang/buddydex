import { SPECIES } from "../data/species.js";
import { t } from "./i18n.js";

const DEFAULT_EYE = "\u00b7";

function renderAsciiFrame(species, eyeSymbol = DEFAULT_EYE) {
  const frame = species.frames[0];
  return frame.map((line) => line.replaceAll("{E}", eyeSymbol)).join("\n");
}

export function renderSpeciesGrid(container) {
  container.innerHTML = SPECIES.map(
    (sp) => `
    <div class="species-card" data-species-id="${sp.id}" tabindex="0" role="button" aria-label="${t(`species.${sp.id}.name`)}">
      <div class="ascii-art">${renderAsciiFrame(sp)}</div>
      <div class="species-name">${t(`species.${sp.id}.name`)}</div>
    </div>
  `,
  ).join("");
}
