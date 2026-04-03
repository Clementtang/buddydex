import { initI18n, setLang, getLang, getSupportedLangs, t } from "./i18n.js";
import { runHatchAnimation } from "./hatch-animation.js";
import { renderMechanics } from "./render-mechanics.js";
import { renderSpeciesGrid } from "./render-grid.js";
import { setupDetailOverlay, openDetail } from "./render-detail.js";

const LANG_LABELS = {
  en: "English",
  "zh-TW": "中文",
  ja: "日本語",
  ko: "한국어",
};

function updateStaticText() {
  document.getElementById("site-title").textContent = t("site.title");
  document.getElementById("site-subtitle").textContent = t("site.subtitle");
  document.getElementById("site-note").textContent = t("site.note");
  document.getElementById("section-title").textContent = t("sectionTitle");

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

  // Hatch animation (first visit only)
  runHatchAnimation();

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
});
