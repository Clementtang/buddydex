import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES, HATS, getAvailableHats } from "../data/accessories.js";
import { t } from "./i18n.js";

const DEFAULT_EYE = EYES[0];
const DEFAULT_RARITY = RARITIES[0];

let animationInterval = null;

// Constructable stylesheet used to inject the dynamic `top` offset for the
// body scroll lock. Writing JS inline styles (body.style.top = ...) would
// require CSP `style-src 'unsafe-inline'`; mutating an adopted stylesheet
// does not. See docs/prd.md Phase 0 task 0.A.6.
const scrollLockSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, scrollLockSheet];

function lockBodyScroll() {
  const scrollY = window.scrollY;
  scrollLockSheet.replaceSync(`body.scroll-locked { top: -${scrollY}px; }`);
  document.body.dataset.scrollY = String(scrollY);
  document.body.classList.add("scroll-locked");
}

function unlockBodyScroll() {
  const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
  document.body.classList.remove("scroll-locked");
  delete document.body.dataset.scrollY;
  scrollLockSheet.replaceSync("");
  window.scrollTo(0, scrollY);
}

function renderAscii(species, frameIndex, eyeSymbol, hatAscii) {
  const frame = species.frames[frameIndex];
  return frame
    .map((line, i) => {
      let result = line.replaceAll("{E}", eyeSymbol);
      if (i === 0 && hatAscii) {
        result = hatAscii;
      }
      return result;
    })
    .join("\n");
}

export function setupDetailOverlay() {
  const overlay = document.getElementById("detail-overlay");
  const panel = document.getElementById("detail-panel");
  const preview = document.getElementById("detail-preview");
  const info = document.getElementById("detail-info");
  const closeButton = document.getElementById("detail-close");

  function close() {
    overlay.classList.remove("visible");
    unlockBodyScroll();
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    if (refs.focusTrapHandler) {
      document.removeEventListener("keydown", refs.focusTrapHandler);
      refs.focusTrapHandler = null;
    }
  }

  const refs = { overlay, panel, preview, info, close, focusTrapHandler: null };

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("visible")) {
      close();
    }
  });

  return refs;
}

export function openDetail(speciesId, detailRefs) {
  const { overlay, panel, preview, info } = detailRefs;
  const species = SPECIES.find((s) => s.id === speciesId);
  if (!species) return;

  // State
  let currentEye = DEFAULT_EYE;
  let currentRarity = DEFAULT_RARITY;
  let currentHat = HATS[0]; // 'none'
  let isShiny = false;
  let frameIndex = 0;

  function updatePreview() {
    const hatAscii = currentHat.ascii;
    const ascii = renderAscii(species, frameIndex, currentEye.symbol, hatAscii);
    preview.textContent = ascii;
    if (isShiny) {
      preview.classList.add("shiny-text");
    } else {
      preview.classList.remove("shiny-text");
    }
  }

  function buildControls() {
    info.innerHTML = "";

    // Name
    const name = document.createElement("h2");
    name.textContent = t(`species.${species.id}.name`);
    info.appendChild(name);

    // Description
    const desc = document.createElement("p");
    desc.textContent = t(`species.${species.id}.description`);
    info.appendChild(desc);

    // Rarity selector
    info.appendChild(
      buildControlGroup(t("detail.rarity"), () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const rarity of RARITIES) {
          const button = document.createElement("button");
          button.className = "control-btn rarity-btn";
          button.dataset.rarity = rarity.id;
          button.textContent = t(`rarity.${rarity.id}`);
          if (rarity.id === currentRarity.id) {
            button.classList.add("selected");
          }
          button.addEventListener("click", () => {
            currentRarity = rarity;
            const available = getAvailableHats(rarity.id);
            if (!available.find((h) => h.id === currentHat.id)) {
              currentHat = HATS[0];
            }
            buildControls();
            updatePreview();
          });
          wrapper.appendChild(button);
        }
        return wrapper;
      }),
    );

    // Shiny toggle
    info.appendChild(
      buildControlGroup(t("detail.shiny"), () => {
        const label = document.createElement("label");
        label.className = "shiny-toggle";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isShiny;
        checkbox.addEventListener("change", () => {
          isShiny = checkbox.checked;
          updatePreview();
        });
        const slider = document.createElement("span");
        slider.className = "toggle-slider";
        label.appendChild(checkbox);
        label.appendChild(slider);
        return label;
      }),
    );

    // Eye picker
    info.appendChild(
      buildControlGroup(t("detail.eyes"), () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const eye of EYES) {
          const button = document.createElement("button");
          button.className = "control-btn eye-btn";
          button.textContent = eye.symbol;
          button.title = t(`eyes.${eye.id}`);
          if (eye.id === currentEye.id) {
            button.classList.add("selected");
          }
          button.addEventListener("click", () => {
            currentEye = eye;
            buildControls();
            updatePreview();
          });
          wrapper.appendChild(button);
        }
        return wrapper;
      }),
    );

    // Hat picker
    const availableHats = getAvailableHats(currentRarity.id);
    info.appendChild(
      buildControlGroup(t("detail.hats"), () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const hat of HATS) {
          const button = document.createElement("button");
          button.className = "control-btn hat-btn";
          button.textContent = t(`hats.${hat.id}`);
          const isAvailable = availableHats.find((h) => h.id === hat.id);
          if (!isAvailable) {
            button.classList.add("unavailable");
            button.disabled = true;
          }
          if (hat.id === currentHat.id) {
            button.classList.add("selected");
          }
          button.addEventListener("click", () => {
            currentHat = hat;
            buildControls();
            updatePreview();
          });
          wrapper.appendChild(button);
        }
        return wrapper;
      }),
    );
  }

  // Animation
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  animationInterval = setInterval(() => {
    frameIndex = frameIndex === 0 ? 1 : 0;
    updatePreview();
  }, 800);

  // aria-live on preview for screen readers
  preview.setAttribute("aria-live", "polite");
  preview.setAttribute("aria-label", t(`species.${species.id}.name`));

  buildControls();
  updatePreview();

  overlay.classList.add("visible");

  // iOS Safari scroll lock fix — freeze body at current scroll position
  lockBodyScroll();

  // Focus trap — move focus to close button and constrain Tab within panel
  const closeButton = document.getElementById("detail-close");
  closeButton.focus();

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const focusable = panel.querySelectorAll(
      'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (detailRefs.focusTrapHandler) {
    document.removeEventListener("keydown", detailRefs.focusTrapHandler);
  }
  detailRefs.focusTrapHandler = trapFocus;
  document.addEventListener("keydown", trapFocus);
}

function buildControlGroup(label, buildContent) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("span");
  labelEl.className = "control-label";
  labelEl.textContent = label;
  group.appendChild(labelEl);

  group.appendChild(buildContent());
  return group;
}
