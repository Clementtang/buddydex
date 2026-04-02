import { runHatchAnimation } from "./hatch-animation.js";
import { renderMechanics } from "./render-mechanics.js";
import { renderSpeciesGrid } from "./render-grid.js";
import { setupDetailOverlay, openDetail } from "./render-detail.js";

document.addEventListener("DOMContentLoaded", () => {
  // Hatch animation (first visit only)
  runHatchAnimation();

  // Mechanics section
  const mechanicsGrid = document.getElementById("mechanics-grid");
  renderMechanics(mechanicsGrid);

  // Species grid
  const speciesGrid = document.getElementById("species-grid");
  renderSpeciesGrid(speciesGrid);

  // Detail overlay
  const detailRefs = setupDetailOverlay();

  speciesGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".species-card");
    if (!card) return;
    const speciesId = card.dataset.speciesId;
    openDetail(speciesId, detailRefs);
  });
});
