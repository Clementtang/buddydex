import { TRANSLATIONS } from "../data/i18n.js";

const SUPPORTED_LANGS = ["en", "zh-TW", "zh-CN", "ja", "ko"];
const DEFAULT_LANG = "en";
const STORAGE_KEY = "buddydex-lang";

let currentLang = DEFAULT_LANG;

export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) {
    currentLang = saved;
  } else {
    const browserLang = navigator.language;
    if (SUPPORTED_LANGS.includes(browserLang)) {
      currentLang = browserLang;
    } else {
      const prefix = browserLang.split("-")[0];
      const match = SUPPORTED_LANGS.find(
        (lang) => lang === prefix || lang.startsWith(prefix + "-"),
      );
      if (match) {
        currentLang = match;
      }
    }
  }
  document.documentElement.lang = currentLang;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function t(key) {
  const keys = key.split(".");
  let value = TRANSLATIONS[currentLang];
  for (const k of keys) {
    if (value === undefined) break;
    value = value[k];
  }
  if (value !== undefined) return value;

  // Fallback to English
  let fallback = TRANSLATIONS[DEFAULT_LANG];
  for (const k of keys) {
    if (fallback === undefined) break;
    fallback = fallback[k];
  }
  return fallback ?? key;
}

export function getLang() {
  return currentLang;
}

export function getSupportedLangs() {
  return SUPPORTED_LANGS;
}
