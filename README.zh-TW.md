<!-- 語言：[English](README.md) | 正體中文 -->

> [!CAUTION]
> **已封存專案。** Anthropic 於 2026 年 4 月 9 日的更新中將 `/buddy` 功能從 Claude Code 移除。本站記錄的物種、機制和 ASCII 圖像已不存在於產品中。網站保留作為歷史紀錄，不再進行功能開發。

<div align="center">

# BuddyDex

**Claude Code buddy 同伴的歷史圖鑑**

記錄了全部 18 種 ASCII 寵物物種、稀有度等級、配件與屬性 — 保留自 `/buddy` 仍是 Claude Code 一部分的時期。

<a href="https://buddydex.chatbot.tw"><img src="https://img.shields.io/badge/%E7%B7%9A%E4%B8%8A%E7%AB%99%E9%BB%9E-buddydex.chatbot.tw-da7756?style=flat-square" alt="線上站點"></a>
<a href="https://github.com/Clementtang/buddydex/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/Clementtang/buddydex/test.yml?style=flat-square&label=%E6%B8%AC%E8%A9%A6" alt="測試"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/%E6%8E%88%E6%AC%8A-MIT-blue?style=flat-square" alt="授權：MIT"></a>
<img src="https://img.shields.io/badge/node-%3E%3D22-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node >=22">
<img src="https://img.shields.io/badge/%E8%AA%9E%E7%B3%BB-5-da7756?style=flat-square" alt="5 語系">
<img src="https://img.shields.io/badge/JavaScript-ES_modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/%E6%B8%AC%E8%A9%A6%E6%A1%86%E6%9E%B6-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest">
<img src="https://img.shields.io/badge/%E9%83%A8%E7%BD%B2%E6%96%BC-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">

<br>

<img src="og-image.png" alt="BuddyDex — Claude Buddy 圖鑑，展示 Duck、Cat、Dragon、Capybara 的 ASCII 圖像" width="600">

</div>

---

## 這是什麼？

BuddyDex 是一個同人製作的百科圖鑑，記錄 Claude Code `/buddy` 指令中 18 種 ASCII 寵物同伴。使用者可以孵化一隻 buddy，獲得隨機的物種、稀有度、屬性和配件。本站記錄了每一種物種，讓訪客即時試穿不同配置，並提供社群發現的自訂技巧。

Anthropic 於 2026 年 4 月 9 日停止提供 `/buddy` 功能後，本站已封存，並還原了 Claude Code 原版 ASCII 圖像以忠實保留歷史紀錄。

## 功能

- **物種圖鑑** — 全部 18 種 buddy 物種，附雙幀閒置動畫
- **試穿詳細頁** — 即時切換稀有度、閃光模式、眼睛和帽子
- **五維屬性** — 除錯、耐心、混亂、智慧、嘴砲，以 ASCII 進度條呈現
- **分享連結** — URL hash 深層連結（`#duck`、`#dragon`）附複製連結和 Web Share API
- **隨機探索** — 「隨機看一隻」按鈕，保證連續不重複
- **自訂教學** — 社群發現的 buddy 名字、人格、語言修改技巧
- **多語系** — English、正體中文、简体中文、日本語、한국어，自動偵測
- **無障礙** — 鍵盤導覽、焦點陷阱、ARIA 即時區域、`prefers-reduced-motion`

## 技術亮點

本專案作為嚴格 Web 安全性和無障礙實踐的實驗場，全程不使用框架：

| 面向                        | 實作方式                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Content Security Policy** | 嚴格 CSP，`style-src` 無 `'unsafe-inline'`。動態 CSS 值使用 constructable `CSSStyleSheet`，搭配 Safari < 16.4 feature-detect fallback |
| **XSS 防護**                | URL hash 視為不受信任的輸入：`decodeURIComponent` + allowlist + 絕不進入 `innerHTML`                                                  |
| **無障礙**                  | Modal 焦點陷阱、`aria-live` announcer pattern（不放在動畫元素上）、44px 觸控目標、`prefers-reduced-motion`                            |
| **i18n 完整性**             | 5 語系對稱性由 CI 強制 — data-integrity 測試會在任何翻譯 key 缺失時失敗                                                               |
| **測試**                    | 47 個 Vitest 測試，涵蓋 hash 驗證、屬性生成、配件邏輯和結構不變式                                                                     |
| **審查流程**                | 6 輪 devil's advocate review（5 Critical、18 Major — 全部解決）。完整 review 鏈在 `docs/`                                             |

## 文件

| 文件                                             | 說明                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| [`DESIGN.md`](DESIGN.md)                         | 設計系統（配色、字體、稀有度視覺處理、決策紀錄） |
| [`CHANGELOG.md`](CHANGELOG.md)                   | 完整版本歷史（v1.0.0 至 v1.5.1）                 |
| [`CLAUDE.md`](CLAUDE.md)                         | Agent 指南，編碼了 6 輪 review 的約束條件        |
| [`docs/prd.md`](docs/prd.md)                     | 產品需求文件（封存於 v2.5）                      |
| [`docs/research/`](docs/research/)               | 百科圖鑑 benchmark 與競品分析                    |
| [`docs/devils-advocate-review-round*.md`](docs/) | 完整的 review-response 文件鏈                    |

## 資料來源

- **物種、稀有度、配件、屬性**：基於 Claude Code buddy 功能的公開社群文件
- **ASCII 圖像**：還原自 Claude Code 原版 buddy 系統（`sprites.ts`），為求歷史準確性。在 `/buddy` 活躍期間曾以原創同人圖替代（避免 IP 疑慮），功能於 2026-04-09 停止後還原

## 技術棧

- 純 HTML + CSS + JavaScript（ES modules，無框架、無建置步驟）
- CSS custom properties 主題化
- Vitest 單元測試（47 個測試，約 500ms）
- GitHub Actions CI，Node 22 LTS
- 部署於 Vercel，搭配嚴格安全 headers

## Fork 本專案

歡迎在 MIT 授權下 fork 使用。請記得將 `js/analytics.js` 中的 Google Analytics ID（`G-1CTR65SW2P`）替換為你自己的，或直接移除。

## 聲明

本站為**非官方同人專案**，與 Anthropic, PBC 無任何關聯、背書或贊助關係。

「Claude」、「Claude Code」、「Claude Buddy」為 Anthropic, PBC 的商標或產品名稱。所有相關名稱及 buddy 系統的權利歸屬 Anthropic。

若 Anthropic 認為本專案有任何侵權內容，請[提出 issue](https://github.com/Clementtang/buddydex/issues)，我們會立即處理。

## 授權

原始碼（HTML、CSS、JavaScript）採用 [MIT License](LICENSE) 釋出。Buddy 物種名稱和遊戲機制來自 Anthropic 的 Claude Code，其智慧財產權歸屬 Anthropic。ASCII 圖像取自 Claude Code 原版 buddy 系統，用於歷史紀錄目的。

---

<div align="center">

由 [Clement Tang](https://github.com/Clementtang) 製作 | 以 [Claude Code](https://claude.ai/code) 驅動

</div>
