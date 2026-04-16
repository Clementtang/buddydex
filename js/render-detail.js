import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES, HATS, getAvailableHats } from "../data/accessories.js";
import { STATS, rollStats, renderStatBar } from "../data/stats.js";
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
  // Re-entry guard: if a second openDetail() fires while the modal is
  // already open (e.g. a hashchange event triggered by the user
  // typing #cat while #duck is showing), the `window.scrollY` we see
  // here is already 0 because the body is locked. Overwriting
  // dataset.scrollY with 0 would lose the real restore target.
  if (document.body.classList.contains("scroll-locked")) return;

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

// Feature 1 hash routing helpers. Keep the URL hash in sync with
// modal state so users can share deep links and use browser
// back/forward to navigate in and out of the detail view. We use
// pushState on open (so the back button becomes "close") and
// replaceState on close (so the modal's history entry doesn't
// linger after it's dismissed). Neither history API call fires
// a hashchange event, so the main.js hashchange listener is only
// ever triggered by real user navigation, not our own writes.
function pushHashForSpecies(speciesId) {
  const newHash = "#" + speciesId;
  if (window.location.hash === newHash) return;
  const newUrl = window.location.pathname + window.location.search + newHash;
  history.pushState(null, "", newUrl);
}

function clearHashPreservingSearch() {
  if (!window.location.hash) return;
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
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

/**
 * Render the current buddy as a PNG blob suitable for copying to the
 * clipboard. Draws species name, ASCII art (rarity-coloured), and
 * a small site URL footer onto a 1280×800 backing canvas (640×400
 * logical, 2× for retina) over the dark theme background.
 *
 * Returns a Promise<Blob> on success, or null when blob conversion
 * fails. Caller is responsible for clipboard write + error handling.
 */
async function renderBuddyImage({
  species,
  rarityId,
  rarityColor,
  asciiText,
  speciesName,
}) {
  // Wait for JetBrains Mono to load so the canvas matches the on-page
  // rendering. Fonts API is available everywhere ClipboardItem is.
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const W = 640;
  const H = 400;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // Background — site bg-primary
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  // Species name in accent (Claude orange)
  ctx.fillStyle = "#da7756";
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(speciesName, W / 2, 40);

  // Rarity label below species name
  ctx.fillStyle = rarityColor;
  ctx.font = "500 14px 'JetBrains Mono', monospace";
  ctx.fillText(rarityId.toUpperCase(), W / 2, 80);

  // ASCII art — rarity-coloured, monospace
  const asciiLines = asciiText.split("\n");
  ctx.fillStyle = rarityColor;
  ctx.font = "32px 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  const lineHeight = 38;
  const blockHeight = asciiLines.length * lineHeight;
  const blockTop = (H - blockHeight) / 2 + 20; // shift down to balance footer
  for (let i = 0; i < asciiLines.length; i++) {
    ctx.fillText(asciiLines[i], W / 2, blockTop + i * lineHeight);
  }

  // Footer — site URL in muted secondary
  ctx.fillStyle = "#8a7d72";
  ctx.font = "13px 'JetBrains Mono', monospace";
  ctx.textBaseline = "bottom";
  ctx.fillText("buddydex.chatbot.tw", W / 2, H - 32);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
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
    // Only act if we were actually open — protects against repeat
    // calls from hashchange listeners after a programmatic close.
    if (!overlay.classList.contains("visible")) return;
    overlay.classList.remove("visible");
    unlockBodyScroll();
    clearHashPreservingSearch();
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

  // Sync the URL hash so this modal state is shareable and the
  // browser back button closes the modal (see Feature 1 hash
  // routing). No-op when the hash is already correct (e.g. when
  // the user arrived via /#duck directly).
  pushHashForSpecies(speciesId);

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

    // Name row: heading + share/copy action buttons
    const nameRow = document.createElement("div");
    nameRow.className = "detail-name-row";

    const name = document.createElement("h2");
    name.textContent = t(`species.${species.id}.name`);
    nameRow.appendChild(name);

    const actionGroup = document.createElement("div");
    actionGroup.className = "detail-share-actions";

    // Copy link — always shown. Uses navigator.clipboard which is
    // available on all CSP-safe modern browsers (requires HTTPS,
    // which BuddyDex has). Briefly swaps button text to "Copied!"
    // and also announces through the sr-only live region.
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "detail-action-btn copy-link-btn";
    const copyLabel = t("detail.copyLink");
    copyBtn.textContent = copyLabel;
    copyBtn.setAttribute("aria-label", copyLabel);
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // Clipboard permission denied or API missing — treat as no-op.
        return;
      }
      const copiedLabel = t("detail.copied");
      copyBtn.textContent = copiedLabel;
      announce(copiedLabel);
      setTimeout(() => {
        copyBtn.textContent = copyLabel;
      }, 1500);
    });
    actionGroup.appendChild(copyBtn);

    // Copy Image — renders the current buddy state as a PNG and writes
    // it to the clipboard via ClipboardItem. Hidden on browsers that
    // don't support clipboard image writes (Firefox <127, older Safari).
    if (
      typeof window.ClipboardItem === "function" &&
      typeof navigator.clipboard?.write === "function"
    ) {
      const copyImgBtn = document.createElement("button");
      copyImgBtn.type = "button";
      copyImgBtn.className = "detail-action-btn copy-image-btn";
      const copyImgLabel = t("detail.copyImage");
      copyImgBtn.textContent = copyImgLabel;
      copyImgBtn.setAttribute("aria-label", copyImgLabel);
      copyImgBtn.addEventListener("click", async () => {
        try {
          const blob = await renderBuddyImage({
            species,
            rarityId: currentRarity.id,
            rarityColor: currentRarity.color,
            asciiText: renderAscii(
              species,
              0,
              currentEye.symbol,
              currentHat.ascii,
            ),
            speciesName: t(`species.${species.id}.name`),
          });
          if (!blob) return;
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch {
          // Clipboard permission denied, blob conversion failed, or
          // the user dismissed a permission prompt — silent no-op.
          return;
        }
        const copiedLabel = t("detail.imageCopied");
        copyImgBtn.textContent = copiedLabel;
        announce(copiedLabel);
        setTimeout(() => {
          copyImgBtn.textContent = copyImgLabel;
        }, 1500);
      });
      actionGroup.appendChild(copyImgBtn);
    }

    // Web Share API — only shown when supported (typical on mobile).
    // On unsupported browsers we silently omit the button so users
    // still see Copy link as the primary share affordance.
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.className = "detail-action-btn share-btn";
      const shareLabel = t("detail.share");
      shareBtn.textContent = shareLabel;
      shareBtn.setAttribute("aria-label", shareLabel);
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: t(`species.${species.id}.name`),
            text: t(`species.${species.id}.description`),
            url: window.location.href,
          });
        } catch {
          // User cancelled the share sheet, or share failed — no-op.
        }
      });
      actionGroup.appendChild(shareBtn);
    }

    nameRow.appendChild(actionGroup);
    info.appendChild(nameRow);

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

    // Stats block — rerolls every time buildControls runs, which
    // happens on rarity change and species switch. Each stat renders
    // as <label><bar><value> in a monospace row. Bars are ASCII text
    // (renderStatBar) so no inline width is set, keeping the strict
    // CSP contract; the rarity-coloured fill comes from the
    // data-rarity attribute on .stat-bar matching selectors in
    // css/detail-controls.css.
    info.appendChild(
      buildControlGroup(t("detail.stats"), () => {
        const wrapper = document.createElement("div");
        wrapper.className = "stats-grid";
        const rolled = rollStats(currentRarity.statFloor);
        for (const stat of rolled) {
          const row = document.createElement("div");
          row.className = "stat-row";

          const label = document.createElement("span");
          label.className = "stat-label";
          label.textContent = t(`stats.${stat.id}`);

          const bar = document.createElement("span");
          bar.className = "stat-bar";
          bar.dataset.rarity = currentRarity.id;
          bar.textContent = renderStatBar(stat.value);

          const value = document.createElement("span");
          value.className = "stat-value";
          value.textContent = String(stat.value);

          row.append(label, bar, value);
          wrapper.appendChild(row);
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
