import { RARITIES } from "../data/rarity.js";
import { EYES, HATS } from "../data/accessories.js";

export function renderMechanics(container) {
  const cards = [
    {
      title: "Rarity",
      body:
        `Every buddy has a rarity tier that affects its stats and accessories. ` +
        RARITIES.map((r) => `${r.name} (${r.probability * 100}%)`).join(", ") +
        ".",
    },
    {
      title: "Shiny",
      body:
        "Any buddy has an independent 1% chance of being shiny. " +
        "Shiny buddies get a rainbow shimmer effect on their ASCII art.",
    },
    {
      title: "Accessories",
      body:
        `${EYES.length} eye styles and ${HATS.length - 1} hats to customize your buddy. ` +
        "Higher rarity unlocks more hat options.",
    },
  ];

  container.innerHTML = cards
    .map(
      (card) => `
    <div class="mechanic-card">
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </div>
  `,
    )
    .join("");
}
