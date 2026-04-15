import { initI18n, setLang, getLang, getSupportedLangs, t } from "./i18n.js";
import { runHatchAnimation } from "./hatch-animation.js";
import { renderMechanics } from "./render-mechanics.js";
import { renderSpeciesGrid } from "./render-grid.js";
import { setupDetailOverlay, openDetail } from "./render-detail.js";
import { parseHashSpecies, clearHash } from "./hash-router.js";
import { SPECIES } from "../data/species.js";

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

  // Archive banner — /buddy retired 2026-04-09
  const archiveBanner = document.getElementById("archive-banner");
  if (archiveBanner) archiveBanner.textContent = t("site.archiveBanner");

  // Feature 2 random button — label + aria-label both localized.
  const randomBtn = document.getElementById("random-btn");
  if (randomBtn) {
    randomBtn.textContent = t("site.randomButton");
    randomBtn.setAttribute("aria-label", t("site.randomButtonAria"));
  }

  // Feature 3 teaching section — static text. textContent only,
  // never innerHTML; the static HTML holds the JSON code blocks
  // that should remain untranslated (code is code).
  const teachingMap = {
    "teaching-title": "teaching.title",
    "teaching-disclaimer": "teaching.disclaimer",
    "teaching-name-title": "teaching.name.title",
    "teaching-name-body": "teaching.name.body",
    "teaching-personality-title": "teaching.personality.title",
    "teaching-personality-body": "teaching.personality.body",
    "teaching-language-title": "teaching.language.title",
    "teaching-language-body": "teaching.language.body",
    "teaching-closing": "teaching.closingNote",
  };
  for (const [id, key] of Object.entries(teachingMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

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
  container.replaceChildren();
  const currentLang = getLang();

  // Desktop: button row (hidden on mobile via CSS media query).
  const btnRow = document.createElement("div");
  btnRow.className = "lang-btn-row";
  for (const lang of getSupportedLangs()) {
    const button = document.createElement("button");
    button.className = "lang-btn";
    button.textContent = LANG_LABELS[lang];
    if (lang === currentLang) button.classList.add("active");
    button.addEventListener("click", () => {
      if (lang === getLang()) return;
      setLang(lang);
      rerender();
    });
    btnRow.appendChild(button);
  }
  container.appendChild(btnRow);

  // Mobile: native <select> dropdown (hidden on desktop via CSS).
  // 5 buttons at 320px is too tight for reliable touch targets
  // (PRD M3). A native select gets the OS picker for free and
  // meets the 44px minimum without squeezing.
  const select = document.createElement("select");
  select.className = "lang-select";
  select.setAttribute("aria-label", "Language");
  for (const lang of getSupportedLangs()) {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = LANG_LABELS[lang];
    if (lang === currentLang) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener("change", () => {
    setLang(select.value);
    rerender();
  });
  container.appendChild(select);
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

  // Feature 2 random explorer — surprise-me button next to the
  // Species section title. Picks a uniform-random species id,
  // avoiding an immediate repeat of the previous pick, and opens
  // the detail modal (which also pushes the hash so the user can
  // share the result). Works via pointer and via keyboard
  // Enter/Space for a11y.
  let lastRandomSpeciesId = null;
  function pickRandomSpecies() {
    if (SPECIES.length === 0) return null;
    if (SPECIES.length === 1) return SPECIES[0].id;
    let candidate;
    do {
      candidate = SPECIES[Math.floor(Math.random() * SPECIES.length)].id;
    } while (candidate === lastRandomSpeciesId);
    lastRandomSpeciesId = candidate;
    return candidate;
  }
  const randomBtn = document.getElementById("random-btn");
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const id = pickRandomSpecies();
      if (id) openDetail(id, detailRefs);
    });
  }

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
