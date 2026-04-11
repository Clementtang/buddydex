import { SPECIES } from "../data/species.js";
import { t } from "./i18n.js";

const EGG_FRAMES = [
  ["   ___  ", "  /   \\ ", " |     |", " |     |", "  \\___/ "],
  ["   ___  ", "  / | \\ ", " |  |  |", " | /  | ", "  \\___/ "],
  ["   _*_  ", "  / | \\ ", " |  /  |", " \\  | / ", "  \\_|_/ "],
];

const STORAGE_KEY = "buddydex-hatched";

/**
 * @param {{ skip?: boolean }} [opts] — when `skip` is true (used by
 * Feature 1 hash routing so a direct /#duck link doesn't flash the
 * egg on arrival), the overlay is removed immediately and the
 * localStorage flag is NOT set, so a subsequent plain visit still
 * sees the hatch once.
 */
export async function runHatchAnimation({ skip = false } = {}) {
  if (skip || localStorage.getItem(STORAGE_KEY)) {
    const overlay = document.getElementById("hatch-overlay");
    overlay?.remove();
    return;
  }

  const overlay = document.getElementById("hatch-overlay");
  const asciiEl = document.getElementById("hatch-ascii");
  const messageEl = document.getElementById("hatch-message");

  overlay.classList.add("visible");

  // Typewriter: "> Hatching..."
  await typewriter(messageEl, t("hatch.hatching"));

  // Show egg frames
  for (const frame of EGG_FRAMES) {
    asciiEl.textContent = frame.join("\n");
    await delay(600);
  }

  // Pick random species and reveal
  const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
  const buddyArt = species.frames[0]
    .map((line) => line.replaceAll("{E}", "\u00b7"))
    .join("\n");

  asciiEl.textContent = buddyArt;
  messageEl.textContent = "";

  const speciesName = t(`species.${species.id}.name`);
  const revealText = t("hatch.reveal").replace("{name}", speciesName);
  await typewriter(messageEl, revealText);

  // Wait then fade out
  await delay(1500);
  overlay.classList.remove("visible");

  // Wait for CSS transition to complete before removing
  await delay(500);
  overlay.remove();

  localStorage.setItem(STORAGE_KEY, "1");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typewriter(element, text) {
  element.textContent = "";
  for (const char of text) {
    element.textContent += char;
    await delay(40);
  }
}
