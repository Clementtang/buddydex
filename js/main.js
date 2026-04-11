import { initI18n, setLang, getLang, getSupportedLangs, t } from "./i18n.js";
import { runHatchAnimation } from "./hatch-animation.js";
import { renderMechanics } from "./render-mechanics.js";
import { renderSpeciesGrid } from "./render-grid.js";
import { setupDetailOverlay, openDetail } from "./render-detail.js";
import { parseHashSpecies, clearHash } from "./hash-router.js";

const LANG_LABELS = {
  en: "English",
  "zh-TW": "正體中文",
  "zh-CN": "简体中文",
  ja: "日本語",
  ko: "한국어",
};

function updateStaticText() {
  document.getElementById("site-title").textContent = t("site.title");
  document.getElementById("site-subtitle").textContent = t("site.subtitle");
  document.getElementById("site-note").textContent = t("site.note");
  document.getElementById("section-title").textContent = t("sectionTitle");

  const mechanicsTitle = document.getElementById("mechanics-title");
  if (mechanicsTitle)
    mechanicsTitle.textContent = t("mechanics.sectionTitle") || "";

  // Footer
  document.getElementById("footer-attribution").innerHTML =
    `${t("footer.attribution")} <a href="https://github.com/Clementtang" target="_blank" rel="noopener">Clement Tang</a>`;
  document.getElementById("footer-trademark").innerHTML =
    `${t("footer.trademark")} <a href="https://www.anthropic.com" target="_blank" rel="noopener">${t("footer.anthropic")}</a>${getLang() === "en" ? ". " : ""}${t("footer.notAffiliated")}`;
  document.getElementById("footer-source").innerHTML =
    `<a href="https://github.com/Clementtang/buddydex" target="_blank" rel="noopener">${t("footer.source")}</a> &middot; ${t("footer.license")}`;
}

function buildLangSwitcher() {
  const container = document.getElementById("lang-switcher");
  container.innerHTML = "";
  const currentLang = getLang();

  for (const lang of getSupportedLangs()) {
    const button = document.createElement("button");
    button.className = "lang-btn";
    button.textContent = LANG_LABELS[lang];
    if (lang === currentLang) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      if (lang === getLang()) return;
      setLang(lang);
      rerender();
    });
    container.appendChild(button);
  }
}

function rerender() {
  updateStaticText();
  buildLangSwitcher();

  const mechanicsGrid = document.getElementById("mechanics-grid");
  renderMechanics(mechanicsGrid);

  const speciesGrid = document.getElementById("species-grid");
  renderSpeciesGrid(speciesGrid);
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize i18n before anything else
  initI18n();

  // Feature 1 hash routing: check the URL before the hatch animation
  // so a direct /#duck link can skip the egg flash. An invalid hash
  // is cleared in place (preserving query string — R3-m4) so it
  // doesn't linger and break sharing.
  const initialSpeciesFromHash = parseHashSpecies();
  if (!initialSpeciesFromHash && window.location.hash) {
    clearHash();
  }

  // Hatch animation (first visit only; skipped when we're about to
  // auto-open a modal from a shared URL so the egg doesn't flash
  // in front of the thing the visitor came to see).
  runHatchAnimation({ skip: initialSpeciesFromHash !== null });

  // Initial render
  rerender();

  // Detail overlay
  const detailRefs = setupDetailOverlay();

  const speciesGrid = document.getElementById("species-grid");
  speciesGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".species-card");
    if (!card) return;
    const speciesId = card.dataset.speciesId;
    openDetail(speciesId, detailRefs);
  });

  speciesGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".species-card");
    if (!card) return;
    event.preventDefault();
    openDetail(card.dataset.speciesId, detailRefs);
  });

  // Open the modal now if we arrived with a valid deep-link hash.
  if (initialSpeciesFromHash) {
    openDetail(initialSpeciesFromHash, detailRefs);
  }

  // Keep modal state and URL hash in sync on real user navigation.
  // pushState / replaceState from within render-detail.js do NOT fire
  // hashchange, so this handler only runs for genuine back/forward or
  // manual URL edits. When the hash changes to an invalid value we
  // clear it and close any open modal.
  window.addEventListener("hashchange", () => {
    const id = parseHashSpecies();
    const modalOpen = detailRefs.overlay.classList.contains("visible");
    if (id) {
      openDetail(id, detailRefs);
    } else {
      if (window.location.hash) clearHash();
      if (modalOpen) detailRefs.close();
    }
  });
});
