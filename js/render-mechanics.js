import { RARITIES } from "../data/rarity.js";
import { EYES, HATS } from "../data/accessories.js";
import { t } from "./i18n.js";

export function renderMechanics(container) {
  const rarityList = RARITIES.map(
    (r) => `${t(`rarity.${r.id}`)} (${r.probability * 100}%)`,
  ).join(", ");

  const cards = [
    {
      title: t("mechanics.rarity.title"),
      body: t("mechanics.rarity.description").replace("{rarities}", rarityList),
    },
    {
      title: t("mechanics.shiny.title"),
      body: t("mechanics.shiny.description"),
    },
    {
      title: t("mechanics.accessories.title"),
      body: t("mechanics.accessories.description")
        .replace("{eyeCount}", EYES.length)
        .replace("{hatCount}", HATS.length - 1),
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
