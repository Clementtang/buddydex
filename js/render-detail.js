import { SPECIES } from "../data/species.js";
import { RARITIES } from "../data/rarity.js";
import { EYES, HATS, getAvailableHats } from "../data/accessories.js";

const DEFAULT_EYE = EYES[0];
const DEFAULT_RARITY = RARITIES[0];

let animationInterval = null;

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
    document.body.style.overflow = "";
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("visible")) {
      close();
    }
  });

  return { overlay, panel, preview, info, close };
}

export function openDetail(speciesId, detailRefs) {
  const { overlay, preview, info, close } = detailRefs;
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
    name.textContent = species.name;
    info.appendChild(name);

    // Description
    const desc = document.createElement("p");
    desc.textContent = species.description;
    info.appendChild(desc);

    // Rarity selector
    info.appendChild(
      buildControlGroup("Rarity", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const rarity of RARITIES) {
          const button = document.createElement("button");
          button.className = "control-btn rarity-btn";
          button.textContent = rarity.name;
          button.style.borderColor = rarity.color;
          button.style.color = rarity.color;
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
      buildControlGroup("Shiny", () => {
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
      buildControlGroup("Eyes", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const eye of EYES) {
          const button = document.createElement("button");
          button.className = "control-btn eye-btn";
          button.textContent = eye.symbol;
          button.title = eye.name;
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
      buildControlGroup("Hats", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "control-options";
        for (const hat of HATS) {
          const button = document.createElement("button");
          button.className = "control-btn hat-btn";
          button.textContent = hat.name;
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
  if (animationInterval) clearInterval(animationInterval);
  animationInterval = setInterval(() => {
    frameIndex = frameIndex === 0 ? 1 : 0;
    updatePreview();
  }, 800);

  buildControls();
  updatePreview();

  overlay.classList.add("visible");
  document.body.style.overflow = "hidden";
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
