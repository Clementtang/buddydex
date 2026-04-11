import { RARITIES } from "../data/rarity.js";
import { EYES, HATS } from "../data/accessories.js";
import { STATS } from "../data/stats.js";
import { t } from "./i18n.js";

export function renderMechanics(container) {
  const rarityList = RARITIES.map(
    (r) => `${t(`rarity.${r.id}`)} (${r.probability * 100}%)`,
  ).join(", ");

  const statList = STATS.map((s) => t(`stats.${s.id}`)).join(" · ");

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
    {
      title: t("mechanics.stats.title"),
      body: t("mechanics.stats.description"),
      footer: statList,
    },
  ];

  // Clear and append nodes via textContent rather than innerHTML so the
  // localized strings (which may contain quotes or apostrophes in
  // future translations) never need HTML-escaping. Each card is an
  // h3 + p, with an optional mono-font footer line for the stats list.
  container.replaceChildren(
    ...cards.map((card) => {
      const wrapper = document.createElement("div");
      wrapper.className = "mechanic-card";
      const heading = document.createElement("h3");
      heading.textContent = card.title;
      const body = document.createElement("p");
      body.textContent = card.body;
      wrapper.append(heading, body);
      if (card.footer) {
        const footer = document.createElement("p");
        footer.className = "mechanic-card-footer";
        footer.textContent = card.footer;
        wrapper.appendChild(footer);
      }
      return wrapper;
    }),
  );
}
