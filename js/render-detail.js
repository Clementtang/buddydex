import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES, HATS, getAvailableHats } from "../data/accessories.js";
import { t } from "./i18n.js";

const DEFAULT_EYE = EYES[0];
const DEFAULT_RARITY = RARITIES[0];

let animationInterval = null;

// Constructable stylesheet used to inject the dynamic `top` offset for
// the body scroll lock. Writing JS inline styles (body.style.top = ...)
// would require CSP `style-src 'unsafe-inline'`; mutating an adopted
// stylesheet does not. See docs/prd.md Phase 0 task 0.A.6.
//
// Feature-detected to keep this module loadable on Safari < 16.4 /
// iOS < 16.4 where `new CSSStyleSheet()` throws. On those browsers we
// fall back to the static `body.scroll-locked { position: fixed;
// width: 100%; }` rule in detail-controls.css, which keeps the site
// usable at the cost of a one-frame scroll jump on modal open/close.
// See docs/devils-advocate-review-round4.md R4-C1.
let scrollLockSheet = null;
try {
  scrollLockSheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [
    ...document.adoptedStyleSheets,
    scrollLockSheet,
  ];
} catch {
  // Older browser — graceful fallback, see block comment above.
}

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.dataset.scrollY = String(scrollY);
  if (scrollLockSheet) {
    scrollLockSheet.replaceSync(`body.scroll-locked { top: -${scrollY}px; }`);
  }
  document.body.classList.add("scroll-locked");
}

function unlockBodyScroll() {
  const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
  document.body.classList.remove("scroll-locked");
  delete document.body.dataset.scrollY;
  if (scrollLockSheet) {
    scrollLockSheet.replaceSync("");
  }
  window.scrollTo(0, scrollY);
}

// Writes a one-off message to the detail modal's aria-live region.
// Only called from user-initiated accessory changes — never from the
// 800ms animation loop (0.A.3 fix).
function announce(message) {
  const el = document.getElementById("detail-announce");
  if (!el) return;
  // Clearing first forces some screen readers to re-read the same text
  // when the user toggles back to a previous value.
  el.textContent = "";
  el.textContent = message;
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
    const announcer = document.getElementById("detail-announce");
    if (announcer) announcer.textContent = "";
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
            announce(`${t("detail.rarity")}: ${t(`rarity.${rarity.id}`)}`);
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
          announce(
            `${t("detail.shiny")}: ${isShiny ? t("detail.on") : t("detail.off")}`,
          );
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
            announce(`${t("detail.eyes")}: ${t(`eyes.${eye.id}`)}`);
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
            announce(`${t("detail.hats")}: ${t(`hats.${hat.id}`)}`);
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

  // aria-label only — the preview text changes every 800ms for the idle
  // animation; an aria-live region here would spam screen readers (0.A.3).
  // User-initiated changes are announced via the dedicated #detail-announce
  // element using the announce() helper.
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
