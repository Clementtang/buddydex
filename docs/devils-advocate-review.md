# BuddyDex Devil's Advocate Review

> 審查日期：2026-04-09
> 審查版本：v1.4.0（main branch, commit aa70505）
> 專案階段：v1 已上線，Phase 1 PRD 已撰寫

---

## Critical

### C1. [架構師] i18n 資料與程式碼耦合在單一 750 行巨型檔案中

`data/i18n.js` 將 5 個語系的所有翻譯（UI 文字 + 18 隻物種描述）硬編碼在一個 755 行的 JS 物件裡。Phase 1 PRD 計畫新增教學指南內容（Feature 3），每新增一個 section 就要在 5 個語系分別加入翻譯，這個檔案會迅速膨脹至 1000+ 行。

**問題**：

- 單一翻譯 key 的修改需要在檔案中跳轉 5 個位置
- 無法對單一語系進行 lazy loading（目前所有語系在首次載入時一次下載）
- 非技術貢獻者（如翻譯志工）難以安全地修改此檔案

**建議方向**：拆分為 `data/i18n/en.js`、`data/i18n/zh-TW.js` 等獨立檔案，或改用 JSON 格式配合動態 `import()`。在 Phase 1 開始前處理，否則技術債會隨功能增加加速累積。

---

### C2. [產品經理] 目標用戶定義模糊，用戶價值假設未驗證

PRD 和研究文件中從未明確定義「誰是 BuddyDex 的目標用戶」。隱含假設是「Claude Code 使用者」，但：

- Claude Code buddy 功能目前僅在 CLI 環境中出現，用戶群相對小眾且技術背景強
- 研究報告對標的都是大型遊戲百科（Bulbapedia 10M+ 月訪問、Scryfall 百萬級），但 Claude Buddy 只有 18 隻物種，內容深度完全不同量級
- Phase 1 的「搜尋功能」在 18 隻物種的情境下，用戶真的需要搜尋嗎？一屏就能看完所有卡片

**問題**：功能優先序可能建立在錯誤的類比之上。把遊戲百科的功能矩陣套用在 18 物種的微型圖鑑上，存在過度工程的風險。

**建議方向**：

- 明確定義 2-3 個 persona（如：Claude Code 新手想了解 buddy、社群分享者想展示自己的 buddy、路過的好奇者）
- 用 GA4 現有數據驗證假設：平均停留時間、跳出率、使用者流程
- 重新評估搜尋功能的優先序——18 隻物種下，排序和篩選可能比搜尋更有價值

---

### C3. [架構師] 沒有任何測試，也沒有測試策略

整個專案零測試。沒有單元測試、沒有 E2E 測試、沒有 linter 設定、沒有 CI pipeline。`package.json` 不存在。

**問題**：

- Phase 1 將新增 URL hash 路由、搜尋邏輯、隨機選取等有狀態的邏輯，沒有測試保護下容易引入回歸
- `getAvailableHats()` 等純函式非常適合單元測試但完全沒有覆蓋
- 沒有 CI 意味著每次部署都是手動信任

**建議方向**：在 Phase 1 之前至少建立：(1) 一個 test runner（Vitest 或 Playwright），(2) data module 的基本單元測試，(3) GitHub Actions CI 跑測試。不需要追求高覆蓋率，但需要有回歸防線。

---

## Major

### M1. [架構師] `innerHTML` 直接拼接使用者可見內容，存在 XSS 向量

`render-grid.js:12-19` 和 `render-mechanics.js:27-36` 使用 `innerHTML` 直接插入內容。雖然目前資料來源是靜態 JS 物件（非使用者輸入），但：

- Phase 1 Feature 1（搜尋）會引入使用者輸入文字，如果搜尋邏輯與 `innerHTML` 有交集，就可能產生 XSS
- `main.js:27` footer 的 `innerHTML` 拼接包含 `t()` 函式的回傳值，若未來允許使用者提供的內容（如社群功能），這是攻擊面

**建議方向**：對於包含使用者輸入的路徑，改用 `textContent` 或 DOM API 建構。至少在 Phase 1 搜尋功能中確保搜尋關鍵字不經過 `innerHTML`。

---

### M2. [專案經理] Phase 1 PRD 缺少時程、里程碑和驗收流程

PRD 有功能規格和驗收條件，但完全沒有：

- 預計交付日期或 sprint 規劃
- 各功能之間的里程碑檢查點
- 上線前的驗收流程（誰來測？在哪些裝置/瀏覽器測？）
- 回滾計畫（如果 Feature 2 分享功能的 hash 路由破壞了現有連結怎麼辦？）

**問題**：對個人專案來說時程壓力較低，但沒有里程碑會導致範圍蔓延——研究報告列了 P0/P1/P2 加上 7 個創意功能，Phase 1 PRD 已經從「快速見效」擴展到 4 個功能，最容易的路徑是持續增加而非交付。

**建議方向**：為 Phase 1 設定一個硬性截止日，並定義「Phase 1 Done」的最小條件。建議先交付 Feature 1+2（分享 + 隨機），觀察 GA4 數據後再決定是否追加。

---

### M3. [設計師] 行動裝置上的語言切換器可用性問題

`components.css:476-487` 在行動裝置上將 5 個語言按鈕水平排列，每個 `min-height: 40px`，但 5 個按鈕（English / 正體中文 / 简体中文 / 日本語 / 한국어）的文字寬度差異大。

**問題**：

- 在 320px 寬度的裝置上，5 個按鈕可能需要換行甚至溢出
- 5 個語言按鈕同時顯示佔據了寶貴的首屏空間
- 語言切換是低頻操作，不值得佔據 header 的永久位置

**建議方向**：改為下拉選單或底部 sheet，僅顯示當前語言 + 切換圖示。節省空間，也更符合 i18n 最佳實踐（語言數量增加時可擴展）。

---

### M4. [架構師] 缺少安全性 HTTP headers

`vercel.json` 只設定了 `Cache-Control`，缺少基本的安全性 headers：

- 沒有 `Content-Security-Policy`（CSP）
- 沒有 `X-Content-Type-Options: nosniff`
- 沒有 `X-Frame-Options` 或 `frame-ancestors`
- 沒有 `Referrer-Policy`

**問題**：雖然是純靜態站，但引入了 Google Analytics 的外部 script，且未來可能引入 Web Share API。缺少 CSP 意味著如果 GA script 被劫持（supply chain attack），沒有防線。

**建議方向**：在 `vercel.json` 加入基本 security headers。CSP 至少限制 `script-src` 為 `self` + `googletagmanager.com`。

---

### M5. [產品經理] 研究報告的優先序與 PRD 不一致

研究報告 `encyclopedia-benchmarks.md` 將「卡片稀有度視覺強化（全息光效）」列為 P0 核心體驗，但 Phase 1 PRD 完全沒有包含此功能。而 PRD 包含了研究報告列為 P2 的「隨機探索按鈕」和 P2 的「Buddy 自訂教學指南」（研究報告原標為 P1 但 PRD 實際排序為第 4）。

**問題**：如果研究報告的優先序評估是對的，Phase 1 跳過了一個 P0 功能。如果 PRD 的判斷更好，那研究報告的分級標準需要更新，否則兩份文件會持續產生歧義。

**建議方向**：統一兩份文件的優先序，或在 PRD 中明確說明為何偏離研究報告的建議（例如：「全息光效雖為 P0 但純視覺提升，不如 URL hash 對 SEO/分享的直接貢獻」）。

---

### M6. [架構師] species.js 每個物種有 3 個 frames 但只使用了 2 個

`data/species.js` 定義了 3 個動畫 frames（註解第 2 行寫 "3 animation frames"），但 `render-detail.js:210-213` 的動畫只在 frame 0 和 1 之間切換（`frameIndex = frameIndex === 0 ? 1 : 0`），`render-grid.js:7` 只使用 frame 0。

**問題**：第 3 個 frame 是死代碼——佔用空間但從未被渲染。18 隻物種 x 5 行 x 12 字元 = 約 1KB 的無用資料。

**建議方向**：要麼實作三幀動畫循環，要麼移除第三幀以減少檔案大小。

---

### M7. [設計師] Detail modal 的 aria-live="polite" 過度觸發

`render-detail.js:216` 在 preview 元素設定 `aria-live="polite"`，但動畫每 800ms 切換一次 frame，意味著 screen reader 每 800ms 就會收到一次通知。

**問題**：對 screen reader 使用者來說這是噪音攻擊。idle animation 的文字變化對無障礙使用者沒有意義。

**建議方向**：將 `aria-live` 改為僅在使用者主動切換配件時觸發（例如切換眼睛或帽子後更新），而非綁在動畫循環上。可以用一個獨立的 visually-hidden 元素來播報狀態變更。

---

## Minor

### m1. [架構師] Google Analytics ID 硬編碼在 HTML 中

`index.html:8` 的 GA4 ID `G-1CTR65SW2P` 直接寫在原始碼中。雖然 GA ID 本身不是 secret，但硬編碼意味著：

- 無法在不同環境（staging/production）使用不同 tracking ID
- Fork 此專案的人會不小心把流量發到你的 GA property

**建議方向**：可接受現狀，但在 README 中提醒 fork 使用者替換 GA ID，或用環境變數在部署時注入。

---

### m2. [專案經理] CHANGELOG 缺少連結定義

CHANGELOG 使用了 `[Unreleased]`、`[1.4.0]` 等版本標記，但檔案末尾沒有對應的比較連結定義（Keep a Changelog 格式要求 `[1.4.0]: https://github.com/.../compare/v1.3.0...v1.4.0`）。

**建議方向**：補上版本比較連結，讓 CHANGELOG 符合其聲稱遵守的格式標準。

---

### m3. [設計師] 首次訪問的 hatch animation 無法跳過

`hatch-animation.js` 的孵化動畫約需 4-5 秒完成，期間沒有任何跳過按鈕。對於從搜尋引擎進來、只想看特定 buddy 的使用者來說，這是強制等待。

**問題**：Phase 1 Feature 2 加入 URL hash 路由後，使用者可能從 `#duck` 連結進入，卻被迫先看完孵蛋動畫才能看到 Duck 的詳細頁。

**建議方向**：加入「點擊任意處跳過」的機制，或在 URL 包含 hash 時自動跳過動畫。

---

### m4. [架構師] `sitemap.xml` 是手動維護的靜態檔案

目前 sitemap 只有一個 URL（首頁），`lastmod` 寫死為 `2026-04-07`。Phase 1 加入 hash 路由後，每隻 buddy 理論上有獨立的可分享 URL（如 `#duck`），但 sitemap 不會自動更新。

**建議方向**：hash fragment 不適合放在 sitemap 中（搜尋引擎通常忽略 hash），但如果未來改用 path-based routing（如 `/species/duck`），需要自動生成 sitemap 的機制。目前可維持現狀但需注意此限制。

---

### m5. [產品經理] Phase 1 Feature 3（自訂教學）的法律風險未量化

PRD 和研究報告都提到「需確認揭露 `~/.claude.json` 結構不違反 Anthropic ToS」，但：

- 沒有人實際去確認過
- README disclaimer 僅涵蓋商標使用，未涵蓋技術文件的揭露
- 如果 Anthropic 更新 buddy 系統的內部結構，教學內容可能立刻過時或造成誤導

**建議方向**：在實作 Feature 3 之前，至少閱讀一次 Anthropic 的 Terms of Service 相關條款。考慮將教學內容定位為「社群發現的技巧」而非「官方功能說明」。

---

### m6. [架構師] Cache-Control 設定可能導致部署後使用者看到舊版本

`vercel.json` 對所有檔案設定 `max-age=3600`（1 小時）。由於沒有 build step、沒有檔名 hash，使用者的瀏覽器可能在部署後最多 1 小時內仍使用舊版的 JS/CSS。

**問題**：如果 Phase 1 修改了 `data/species.js` 的結構但 `js/render-grid.js` 也同時修改，兩個檔案的快取失效時間可能不一致，導致短暫的 JS 錯誤。

**建議方向**：對 HTML 設定 `no-cache`（每次驗證），對 JS/CSS 設定較長快取 + 檔名 hash。或者接受現況，因為 Vercel 的 CDN purge 通常會在部署後立即生效。

---

### m7. [設計師] 缺少 OG image

`index.html` 有完整的 `og:title`、`og:description`、`og:url`，但沒有 `og:image`。在社群平台分享時會顯示為純文字卡片，沒有視覺吸引力。

**問題**：Phase 1 Feature 2 的核心目標是「帶動自然流量」，但分享出去的連結沒有預覽圖，點擊率會顯著低於有圖的連結。

**建議方向**：製作一張 1200x630 的 OG image（可以是幾隻代表性 buddy 的 ASCII art 截圖）。這應該在 Feature 2 之前或同時處理。

---

### m8. [專案經理] 設計文件和實作計畫標記為 COMPLETED 但與現狀有差異

`docs/plans/2026-04-02-buddydex-design.md` 標記為 COMPLETED，但其中描述的 Species Grid 有「Filter by rarity」功能（第 43 行），而實際上線版本的 grid 沒有稀有度篩選。同樣，設計文件提到 species card 上應有 rarity badge，但實際實作中卡片只有 ASCII art + 名稱。

**問題**：已完成標記的文件與實際產品不一致，會誤導後續開發者對現有功能的理解。

**建議方向**：在設計文件中加註哪些設計決策在實作過程中被省略或調整，或將未實作的部分移至 Phase 1/2 backlog。

---

## 整體評估

### 三大風險

1. **過度工程 vs 內容不足的矛盾**：BuddyDex 的技術架構（i18n 5 語系、a11y、SEO、GA4）已經相當完善，但核心內容只有 18 隻物種。Phase 1 繼續堆疊功能（搜尋、篩選、教學）而非深化內容（風味文字、社群互動、更新頻率），可能把一個「精美的小品」工程化成一個「功能齊全但空洞的框架」。建議在追加功能前，先問：「這 18 隻的內容夠豐富到支撐這些功能嗎？」

2. **作為非官方同人專案的生存風險**：BuddyDex 100% 依賴 Anthropic 的 Claude Buddy 系統。如果 Anthropic (a) 修改/移除 buddy 功能、(b) 發函要求下架、或 (c) 推出官方圖鑑，BuddyDex 的所有投入歸零。PRD 和研究報告都沒有討論這個存在性風險。建議在規劃長期功能（收藏系統、抽卡模擬器）前評估：投入產出比是否值得？是否有方式降低依賴（如將技術框架泛化為通用 ASCII pet 平台）？

3. **單人維護的可持續性**：5 語系的翻譯品質維護、buddy 系統變更的追蹤更新、SEO 持續優化——這些都需要持續投入。目前沒有 CI、沒有自動化測試、沒有內容更新 pipeline，所有工作靠單一維護者手動完成。Phase 1-4 的功能路線圖如果全部實作，維護負擔會顯著增加。建議優先投資自動化基礎建設（CI、測試、sitemap 生成），再追加功能。
