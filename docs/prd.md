# BuddyDex Phase 0 + Phase 1 產品需求文件（PRD）

> 版本：2.4
> 日期：2026-04-10
> 狀態：已審查（round 1 + round 2 + round 3 + round 4）+ 競品分析（buddyboard.xyz）+ Phase 0 Batch A/B 上線驗證通過
> 依據：`docs/research/encyclopedia-benchmarks.md` + `docs/research/buddyboard-analysis.md` + `docs/devils-advocate-review.md` + `docs/devils-advocate-review-round2.md` + `docs/devils-advocate-review-round3.md` + `docs/devils-advocate-review-round4.md`

---

## 目標用戶

| Persona              | 描述                                           | 核心需求             |
| -------------------- | ---------------------------------------------- | -------------------- |
| **Claude Code 新手** | 剛拿到 buddy，想了解自己拿到的是什麼、有多稀有 | 物種資訊、自訂教學   |
| **社群分享者**       | 想展示自己的 buddy 配置給朋友看                | 分享連結、視覺吸引力 |
| **路過的好奇者**     | 從社群連結進來瀏覽                             | 快速載入、直覺導覽   |

## 概述

- **Phase 0**：技術債清理和基礎建設，Phase 1 開發的前置作業
- **Phase 1**：聚焦分享體驗和內容補強，以最小工時帶動自然流量

## 技術限制（全域）

- 純前端靜態網站，不引入後端或資料庫
- 使用者狀態僅存 localStorage
- 須支援 5 語系（en / zh-TW / zh-CN / ja / ko）
- 遵守現有無障礙標準（ARIA、focus 管理、`prefers-reduced-motion`）
- XSS 防範：使用者輸入不經過 `innerHTML`，一律用 `textContent` 或 DOM API
- 每個功能獨立 commit，不混合

## 與研究報告的差異說明

研究報告（`encyclopedia-benchmarks.md`）將「搜尋與篩選」和「卡片全息光效」列為 P0。本 PRD 做了以下調整：

| 研究報告建議       | PRD 決定       | 原因                                                  |
| ------------------ | -------------- | ----------------------------------------------------- |
| 搜尋與篩選（P0）   | 移至 Phase 2   | 18 隻物種一屏可覽，搜尋需求待 GA4 數據驗證（C2 回饋） |
| 卡片全息光效（P0） | 移至 Phase 2   | 純視覺增強，不直接帶動流量或解決使用者痛點            |
| 隨機探索（P2）     | 提升至 Phase 1 | 工時 S，搭配 URL hash 可提升探索趣味                  |
| 教學指南（P1）     | 維持 Phase 1   | persona 1 的核心需求，工時 S                          |

---

## 與 buddyboard.xyz 的差異化

2026-04-03 出現的競品 `buddyboard.xyz`（repo: `TanayK07/buddy-board`）同樣源自 Claude Code `/buddy` 機制。完整分析見 `docs/research/buddyboard-analysis.md`。

### 定位差異

| 面向     | Buddy Board                        | BuddyDex                |
| -------- | ---------------------------------- | ----------------------- |
| 核心     | 社交 leaderboard + 競技 + 卡片分享 | 圖鑑 / 參考 / 瀏覽      |
| 門檻     | 高（`npx buddy-board` 提交）       | 零（直接瀏覽）          |
| 技術     | Next.js + Supabase + CLI           | 純靜態                  |
| 法律姿態 | 「忠實重製 Claude Code 機制」      | 「原創 ASCII 同人藝術」 |
| 內容深度 | 子頁 `/dex` 只有 ASCII + 名稱      | 描述 / 稀有度 / try-on  |

### Non-goals（基於競品分析）

- **不做 leaderboard / 社交 / 提交機制**。純靜態是戰略優勢，不複製對手的後端路線
- **不做「未發現物種」disclosure**。提交量成長時會光速耗盡，機制撐不住
- **不改名**。buddyboard 提交動能停滯（5 stars、6 天未推），不構成命名生存威脅
- **不用 CLI 作為主要流程**。會限縮 persona 3（路過好奇者）

### 可借鑒項目（納入本 PRD）

| #   | 項目                        | 處置                                                         |
| --- | --------------------------- | ------------------------------------------------------------ |
| 1   | 五維 Stats 系統             | **Phase 1 Feature 4（新）** — Claude Code `/buddy` 原生屬性  |
| 2   | Root-level DESIGN.md        | **Phase 0 批次 A 新增任務** — 獨立 living design system      |
| 3   | Legendary holographic foil  | Phase 2 backlog 現有項，補 buddyboard DESIGN.md CSS 實作參考 |
| 4   | Decisions Log table         | 併入新建的 DESIGN.md                                         |
| 5   | Mulberry32 algorithm 文件化 | Phase 2 backlog（新項）— 將 BuddyDex 定位為 canonical ref    |
| 6   | GitHub repo topics          | **Phase 0 批次 A 新增任務** — 零成本 GitHub SEO              |

---

## Phase 0：技術債清理（分批交付）

> Round 2 回饋：避免把所有任務綁在一起變成「前置作業陷阱」。
> Phase 0 分為三個批次，批次 A + B 完成即可開始 Phase 1。
> 批次 C（i18n 拆分）延後至 Phase 1 之後再評估。

### 批次 A：立即交付

#### 0.A.1 抽離 inline GA4 script

**目標**：將 `index.html` 的 inline GA4 初始化代碼抽離為獨立模組，為 CSP 鋪路。

**規格**：

- 建立 `js/analytics.js`，包含 `window.dataLayer = ...; gtag('js', ...); gtag('config', ...)` 等初始化邏輯
- `index.html` 改用 `<script type="module" src="js/analytics.js"></script>`
- 外部 `gtag.js` 載入保持 `<script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>`

**驗收條件**：

- [ ] `index.html` 無 inline `<script>` 標籤（除了載入 analytics.js 和 main.js）
- [ ] DevTools Network tab 顯示 `gtag/js?id=...` 仍正常載入
- [ ] Thufir `ga4_realtime` 可看到測試流量

#### 0.A.2 套用 security headers（含 CSP）

**目標**：加入基本的 HTTP 安全性 headers，不依賴 `'unsafe-inline'`。**依賴 0.A.1 和 0.A.6 必須先完成**（0.A.6 移除 inline style，讓 CSP 可以不用 `'unsafe-inline'`）。

**規格**：
在 `vercel.json` 加入：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Round 3 強化說明**：

- **移除 `style-src 'unsafe-inline'`**（R3-M2）：依賴 0.A.6 將 `js/render-detail.js` 的 `element.style.x = y` 重構為 data attribute + CSS class。實作前用 `grep -n "\.style\." js/` 再次確認無其他 inline style 寫入點
- **`font-src 'self' https://fonts.gstatic.com`**（R3-m3）：預留 self-hosted 字體空間，零成本防呆
- **`base-uri 'self'`**（R3-m2）：防 `<base>` tag 注入攻擊
- **`form-action 'self'`**（R3-m2）：限制 form 提交目的地（目前無 form，但 defense in depth）
- **`frame-ancestors 'none'`**（R3-m2）：現代標準，與 `X-Frame-Options: DENY` 雙層防護（部分瀏覽器忽略 XFO）

**驗收條件**：

- [ ] Response headers 包含上述四項
- [ ] Console 無 CSP 違規警告（特別確認切換 rarity 時 rarity button 的樣式仍正確，代表 0.A.6 的重構有效）
- [ ] GA4 `collect?v=2&...` 請求正常送出（Network tab 確認）
- [ ] Thufir `ga4_realtime` 顯示即時數據正常
- [ ] Google Fonts 正常載入
- [ ] CSP header 中**不包含**任何 `'unsafe-inline'`

#### 0.A.3 修正 aria-live 過度觸發

**目標**：修正 detail modal 的 aria-live 每 800ms 過度觸發問題。

**規格**：

- `aria-live` 屬性從 preview 元素移除
- 動畫循環不觸發 aria-live
- 新增獨立的 visually-hidden 元素（`<div aria-live="polite" class="sr-only" id="detail-announce"></div>`）
- 僅在使用者主動切換配件（眼睛、帽子、稀有度、shiny）時更新 announce 元素文字

**驗收條件**：

- [ ] 開啟 detail modal 後 screen reader 不會每 800ms 收到通知
- [ ] 切換眼睛/帽子/稀有度時 screen reader 播報變更（如「Rarity changed to Legendary」）

#### 0.A.4 建立 root-level DESIGN.md

**目標**：提供 living design system 文件，方便外部閱讀者（貢獻者、設計參考者）理解 BuddyDex 設計決策。

**規格**：

- 於 repo 根目錄新建 `DESIGN.md`
- 內容衍生自 `docs/plans/2026-04-02-buddydex-design.md`，但定位為 **current state**（非歷史紀錄）
- Sections：Colors、Typography、Spacing、Rarity Visual Treatments、Motion、Accessibility Principles、Decisions Log
- Decisions Log table：`date / decision / rationale` 三欄，列出 v1.0 → v1.4 的重要決策
- 不刪除原 `docs/plans/2026-04-02-buddydex-design.md`（保留為歷史）

**驗收條件**：

- [ ] `DESIGN.md` 存在於 repo root
- [ ] 內容涵蓋 v1.4 現狀，與 `index.html`/`styles.css` 一致
- [ ] Decisions Log 至少列出 5 個關鍵決策（配色、字體、rarity color mapping、ASCII 同人重繪、i18n 架構）
- [ ] README 加上指向 DESIGN.md 的連結

#### 0.A.5 GitHub repo topics + 元資料

**目標**：零成本 GitHub SEO，提升 repo 被發現的機會。

**規格**：

- 執行 `gh repo edit clementtang/buddydex --add-topic <topic>`
- Topics：`claude-code`、`claude-buddy`、`ascii-art`、`pokedex`、`encyclopedia`、`field-guide`、`static-site`、`i18n`、`accessibility`
- 同時檢查 repo description、homepage URL 是否正確

**驗收條件**：

- [ ] `gh repo view clementtang/buddydex --json repositoryTopics` 顯示上述 topics
- [ ] Homepage 設為 `https://buddydex.chatbot.tw`
- [ ] Description 包含「field guide」或「encyclopedia」關鍵字

#### 0.A.6 Rarity 按鈕 inline style 重構為 data attribute

**目標**：將 `js/render-detail.js` 的 rarity button 樣式從 inline style（`element.style.borderColor = ...`）改為 CSS data attribute + class，為 0.A.2 移除 CSP `style-src 'unsafe-inline'` 鋪路（R3-M2）。**block 0.A.2**。

**規格**：

1. **`js/render-detail.js`**：
   - 找到現有寫入 rarity color 的位置（約 line 111–112）
     ```js
     button.style.borderColor = rarity.color;
     button.style.color = rarity.color;
     ```
   - 改為：
     ```js
     button.classList.add("rarity-btn");
     button.dataset.rarity = rarity.id; // common / uncommon / rare / epic / legendary
     ```

2. **`css/components.css`**（或 `css/detail-controls.css`，視既有位置）新增：

   ```css
   .rarity-btn[data-rarity="common"] {
     color: var(--rarity-common);
     border-color: var(--rarity-common);
   }
   .rarity-btn[data-rarity="uncommon"] {
     color: var(--rarity-uncommon);
     border-color: var(--rarity-uncommon);
   }
   .rarity-btn[data-rarity="rare"] {
     color: var(--rarity-rare);
     border-color: var(--rarity-rare);
   }
   .rarity-btn[data-rarity="epic"] {
     color: var(--rarity-epic);
     border-color: var(--rarity-epic);
   }
   .rarity-btn[data-rarity="legendary"] {
     color: var(--rarity-legendary);
     border-color: var(--rarity-legendary);
   }
   ```

3. **實作前檢查**：`grep -n "\.style\." js/` 確認沒有其他 inline style 寫入點。若有，一併重構或在 PRD 建新子任務

4. **額外重構（實作中發現，記錄於 R4-m1）**：`js/render-detail.js` 的 body scroll lock 也在寫 inline style（`body.style.position / .top / .width`），同樣會觸發 CSP `style-src 'unsafe-inline'` 需求。改用 constructable `CSSStyleSheet` + `document.adoptedStyleSheets` 動態注入 `body.scroll-locked { top: -${scrollY}px; }`。`detail-controls.css` 補上靜態部分：

   ```css
   body.scroll-locked {
     position: fixed;
     width: 100%;
   }
   ```

   **瀏覽器相容性（R4-C1）**：`new CSSStyleSheet()` 需要 Chrome 73+ / Firefox 101+ / **Safari 16.4+ / iOS 16.4+**。舊 Safari 會 throw，若不 feature-detect 會讓整個 `render-detail.js` 模組 import 失敗，造成站內所有 JS 初始化中斷。**必須** 用 try/catch 包覆 module 頂層的 `new CSSStyleSheet()`，失敗時 `scrollLockSheet = null`，`lockBodyScroll()` / `unlockBodyScroll()` 透過 null-check 跳過 `replaceSync`。舊瀏覽器會有 modal 開啟時一瞬 scroll jump 的 UX 瑕疵（`position: fixed` 無動態 top offset），但站仍可使用。

**驗收條件**：

- [ ] `grep -n "\.style\." js/` 無 rarity-related 或 scroll-lock 的 inline style 寫入
- [ ] Detail modal 切換 rarity 時按鈕顏色正確顯示（視覺上與重構前相同）
- [ ] Scroll lock 正常運作（modal 開啟不 scroll jump，關閉時 scroll 位置恢復）於支援的瀏覽器
- [ ] 在 `new CSSStyleSheet` throw 的環境（Safari 15 模擬 或 `Object.defineProperty(window, 'CSSStyleSheet', { get() { throw Error(); } })`）下，`render-detail.js` 仍能 import 成功，卡片點擊仍能開啟 modal
- [ ] 重構後 0.A.2 CSP 可以不用 `'unsafe-inline'` 並通過驗收

### 批次 B：小批次

#### 0.B.1 測試基礎建設 + CI

**目標**：建立最小可行的測試基礎建設。

**規格**：

- 建立 `package.json`，加入 Vitest 作為 devDependency
- 單元測試：`data/accessories.js` 的 `getAvailableHats()`
- 單元測試：`js/i18n.js` 的 `t()` fallback 邏輯（當前語系缺 key 時回退到 en）
- GitHub Actions workflow：push to main 時跑 `npm test`

> **R3-m1 澄清**：批次 B 的範圍僅限 `getAvailableHats()` + `t()` 兩項，不包含 hash validation 測試。hash validation 測試屬於 Feature 1 的一部分，應於 Feature 1 實作時與程式碼一起加入（包含 Round 2 R2-M1 列出的惡意 hash 測試案例：`#<script>alert(1)</script>`、`#duck"><img src=x>`、`#'; alert(1); //`、`#../../etc/passwd` 以及 Round 3 R3-m5 的 decode 失敗測試）。Feature 1 完成後 `npm test` 應包含並通過這些案例

**驗收條件**：

- [ ] `npm test` 可執行且通過
- [ ] GitHub Actions 綠燈
- [ ] 至少覆蓋 `getAvailableHats` 和 `t()` 函式

### 批次 C：延後

#### 0.C.1 ~~i18n 檔案拆分~~（移至 Phase 1 之後評估）

**延後原因**：

- Feature 3（教學指南）預估新增翻譯 key < 30 個，現有檔案從 755 → ~850 行，仍可接受
- 拆分涉及動態 `import()`，會牽動 `t()` 同步/非同步行為、rerender 時機、語系切換 loading state
- 拆分工時 L，風險高，急迫性不足以阻擋 Phase 1 開始
- 重新評估時機：Phase 1 完成後，若 i18n 檔案超過 1000 行或維護成本顯著上升再處理

---

## Phase 1：分享體驗 + 內容補強

> Phase 0 完成後開始。
> Done 的最小條件：Feature 1 + Feature 2 上線。
> 上線後觀察 GA4 數據 7 天再決定 Phase 2。

### Feature 1：分享功能

**目標**：讓使用者能分享特定 buddy，帶動自然流量。服務 persona 2（社群分享者）和 persona 3（路過好奇者）。

**使用者故事**：

- 身為使用者，我想複製一個連結直接開啟某隻 buddy 的詳細頁，分享給朋友。
- 身為行動裝置使用者，我想用系統原生分享選單分享 buddy。

**前置作業**：

1. 製作通用 OG image（詳見下方 OG image 規格）
2. 在 `index.html` `<head>` 加入 og:image 相關 meta tags（R3-M3）— 沒有這步，即使 og-image.png 放在 repo 根目錄社群平台也不會顯示預覽

**OG image 規格**：

- 尺寸：1200x630 pixels
- 格式：PNG
- 檔名：`og-image.png`（放在 repo 根目錄）
- 設計內容：深色背景（`#0d0d0d`）+ BuddyDex logo（Claude 橘色 `#da7756`）+ 標語「A field guide to Claude Buddies」+ 3-4 隻代表性 buddy ASCII art（建議 Duck、Cat、Dragon、Capybara 各一，展示不同類型）
- 製作方式：以 HTML/CSS 寫 1200x630 的單頁（參考既有 design tokens），用 Playwright 或 Puppeteer 截圖；或直接用 Figma 手動設計後匯出
- Per-species 動態 OG image：**不納入 Phase 1**，若 Phase 1 數據顯示分享流量可觀再做（需要 `@vercel/og` 或預先生成 18 張）

**OG image meta tags 規格**（R3-M3）：

在 `index.html` 的 `<head>` 加入：

```html
<meta property="og:image" content="https://buddydex.chatbot.tw/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta
  property="og:image:alt"
  content="BuddyDex — A field guide to Claude Buddies"
/>
<meta name="twitter:image" content="https://buddydex.chatbot.tw/og-image.png" />
```

**功能規格**：

1. **URL hash 路由（含 hash validation）**
   - `buddydex.chatbot.tw/#duck` 自動打開 Duck 的 detail modal
   - 開啟 detail modal 時更新 URL hash
   - 關閉 modal 時清除 hash
   - 瀏覽器前進/後退支援（使用 `hashchange` 事件）
   - URL 包含 hash 時自動跳過 hatch animation（m3）
   - **安全性規則（R2-M1 + R3-m4 + R3-m5 + R4-m2）**：
     - `window.location.hash` 視為**不受信任的輸入**
     - 讀取順序：`location.hash` 去掉前綴 `#` → `decodeURIComponent()` → allowlist 比對
     - **decode 失敗**（如 `decodeURIComponent('%E0%A4%A')` 會 throw `URIError`）視同驗證失敗，不開啟 modal（R3-m5）
     - allowlist 驗證：`SPECIES.find(s => s.id === decodedValue)`
     - 驗證失敗時：清除 hash 同時**保留 query string**，用 `history.replaceState(null, '', location.pathname + location.search)`，避免誤清 UTM 參數（R3-m4）。後續不開啟 modal、`console.warn` 記錄
     - 任何從 hash 衍生的字串**不得直接進入 `innerHTML`**，一律使用 `textContent` 或 DOM API
     - Feature 1 實作時須包含惡意 hash 測試案例（併入 Vitest）：`#<script>alert(1)</script>`、`#duck"><img src=x>`、`#'; alert(1); //`、`#../../etc/passwd`、`#%3Cscript%3E`（percent-encoded `<script>`）、`#%E0%A4%A`（malformed percent sequence，預期 `URIError`）

   **參考實作（R4-m2，實作者直接複製可，但須對應命名規範）**：

   ```js
   import { SPECIES } from "../data/species.js";

   /**
    * Validate and decode a URL hash, returning the matched species id
    * or `null` if the hash is missing, malformed, or unknown.
    * Never throws — all error paths console.warn and return null.
    */
   export function parseHashSpecies(hashValue = window.location.hash) {
     const raw = hashValue.startsWith("#") ? hashValue.slice(1) : hashValue;
     if (!raw) return null;

     let decoded;
     try {
       decoded = decodeURIComponent(raw);
     } catch {
       // Malformed percent-encoding (e.g. '%E0%A4%A')
       console.warn("[buddydex] invalid hash encoding, ignoring");
       return null;
     }

     const matched = SPECIES.find((s) => s.id === decoded);
     if (!matched) {
       console.warn("[buddydex] unknown species id in hash:", decoded);
       return null;
     }
     return matched.id;
   }

   // Caller usage at boot:
   const speciesId = parseHashSpecies();
   if (speciesId) {
     openDetail(speciesId, detailRefs);
   } else if (window.location.hash) {
     // Invalid hash present — clear it but preserve the query string
     history.replaceState(null, "", location.pathname + location.search);
   }
   ```

2. **複製連結按鈕**
   - detail modal 內，物種名稱旁
   - 點擊後複製 URL，短暫顯示「已複製」回饋

3. **Web Share API（行動裝置）**
   - 偵測 `navigator.share` 支援
   - 支援時顯示「分享」按鈕，fallback 到複製連結

**驗收條件**：

- [ ] `#duck` URL 開啟 Duck detail modal
- [ ] `#<script>` 等惡意 hash 不會執行任何 JS，不顯示錯誤給使用者，console 有 warning
- [ ] `#%E0%A4%A`（malformed percent sequence）觸發 `URIError` 並被 try/catch 接住，不開啟 modal（R3-m5）
- [ ] 從 `/?utm_source=twitter#malicious` 進入時，hash 被清除但 `?utm_source=twitter` 保留（R3-m4）
- [ ] 不存在的 species id（如 `#nosuchbuddy`）被拒絕
- [ ] URL 帶 hash 時跳過 hatch animation
- [ ] 瀏覽器返回鍵關閉 modal
- [ ] 複製連結正確複製 URL 並顯示回饋
- [ ] Web Share API 在支援的行動裝置上觸發
- [ ] OG image 在社群平台分享時正確顯示（[Twitter Card Validator](https://cards-dev.twitter.com/validator)、[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)、LINE 手動分享各測一次）（R3-M3）
- [ ] `index.html` `<head>` 包含 `og:image`、`og:image:width`、`og:image:height`、`og:image:alt`、`twitter:image` 共 5 個 tag（R3-M3）
- [ ] Chrome DevTools mobile emulation（iPhone SE, Pixel 5）驗收通過

**回滾條件（R2-m3 簡化版）**：

部署後立即執行以下檢查，任一項失敗就回滾：

- [ ] 線上站以 `buddydex.chatbot.tw/#duck`、`#cat`、`#dragon`、`#capybara`、`#ghost` 逐一開啟，確認 detail modal 正常
- [ ] Chrome DevTools Console 無 JS 錯誤、無 CSP 違規
- [ ] Thufir `ga4_realtime` 顯示即時數據非 0（自行測試的流量）

**回滾操作**：

```bash
git revert <commit-sha>
git push
npx vercel --prod
```

不修改 branch history，保留 revert 紀錄。

**預估工時**：S（不含 OG image 製作，OG image 另計 S）

---

### Feature 2：隨機探索按鈕

**目標**：增加探索趣味，服務 persona 3（路過好奇者）。

**使用者故事**：

- 身為使用者，我想按一個按鈕隨機看到一隻 buddy。

**功能規格**：

- 按鈕放在 Species section title 旁邊
- 點擊隨機選一隻 buddy，開啟 detail modal，更新 URL hash
- 連續點擊不重複上一隻

**驗收條件**：

- [ ] 按鈕點擊開啟隨機 buddy 的 detail modal
- [ ] 連續兩次不出現同一隻
- [ ] 按鈕有 `aria-label`，鍵盤可操作
- [ ] 文字隨語系切換

**預估工時**：S

---

### Feature 3：Buddy 自訂教學指南

**目標**：教使用者自訂 buddy，服務 persona 1（Claude Code 新手）。

**使用者故事**：

- 身為 Claude Code 使用者，我想知道如何改 buddy 名字和人格。
- 身為非英語使用者，我想讓 buddy 用我的母語回覆。

**功能規格**：

- 摺疊區塊（accordion），預設收合
- 三個主題：修改名稱、修改人格、修改語言
- 定位為「社群發現的技巧」，非官方功能說明（m5）
- 教學 section 頂部加 disclaimer
- JSON 範例脫敏，不涉及 bones layer

**驗收條件**：

- [ ] 5 語系正確顯示
- [ ] 可收合/展開
- [ ] JSON 範例等寬字體
- [ ] 不洩漏系統敏感資訊
- [ ] 有 disclaimer 聲明

**預估工時**：S

---

### Feature 4：五維 Stats 顯示系統

**目標**：補上 Claude Code `/buddy` 原生的五維 stats 屬性，強化 mechanics section 的完整性。來源：`docs/research/buddyboard-analysis.md`。

**使用者故事**：

- 身為 Claude Code 使用者，我想知道 `/buddy` 的 stats 代表什麼、每一項的範圍。
- 身為瀏覽者，我想在 detail modal 看到一隻 buddy 的 stats 長什麼樣子。

**功能規格**：

1. **Mechanics section 新增第 4 張卡片：Stats**
   - 列出五項 stat：Debugging、Patience、Chaos、Wisdom、Snark
   - 說明各 stat 的 0–100 範圍與 rarity 對應的 floor（common 5 / uncommon 15 / rare 25 / epic 35 / legendary 50）
   - 簡述每項 stat 的含義（待內容撰寫，不捏造 Anthropic 官方定義）

2. **Detail modal 新增 Stats 區塊**
   - 位於 info 區（稀有度選擇器下方）
   - 顯示一組「範例 stats」— 以選中的 rarity 為 floor、上限 100 之間隨機生成
   - 每次切換 rarity / 物種時重新生成
   - 以水平 bar 呈現（類似 buddyboard），等寬字體顯示數值
   - Bar 顏色使用 rarity color

3. **i18n**
   - 新增 5 個 stat 名稱 key + 5 個描述 key + 1 個區塊標題 key
   - 5 語系（en / zh-TW / zh-CN / ja / ko）完整翻譯

**實作前置**：

- **需驗證**：Stat 名稱（Debugging / Patience / Chaos / Wisdom / Snark）與範圍定義來自 buddyboard 的 README 與 DESIGN.md，**應交叉驗證 Claude Code 實際原始碼或官方文件**再實作，避免引用他人發明的命名
- 若驗證發現名稱不同，以 Claude Code 原生定義為準

**驗收條件**：

- [ ] Mechanics 第 4 張卡片顯示五項 stat 與說明
- [ ] Detail modal Stats 區塊與 rarity 切換連動
- [ ] 5 語系正確顯示
- [ ] 不捏造 Anthropic 官方定義（描述措辭以「社群觀察」或「範例」呈現）
- [ ] Stat 名稱經 Claude Code 原始碼驗證

**預估工時**：M（含驗證 + i18n 翻譯）

---

### Phase 1 附帶修正

| 項目                                           | 來源              |
| ---------------------------------------------- | ----------------- |
| Hatch animation 可跳過（點擊 + hash 自動跳過） | m3                |
| 行動版語言切換器改為下拉選單                   | M3                |
| H1 + meta description 強化圖鑑語意             | buddyboard 差異化 |
| README 首段加 buddyboard.xyz 互補連結          | buddyboard 差異化 |

> **已移除**：M6「三幀動畫實作」條目。依 Round 2 R2-m2 決策已降級為死代碼清理 — `data/species.js` 頂部註解（commit `9653e5b`）說明 `frames[2]` 為未來特殊動作保留、目前不實作。此處保留說明是為了避免實作 agent 誤讀 PRD 字面意思而重新觸發三幀動畫開發（R3-M1）。

#### SEO 差異化細節

**目標**：避開 buddyboard 的 SEO 陣地（"leaderboard / trading cards / competitive"），強化 BuddyDex 的「圖鑑 / 參考 / 百科」語意。

**規格**：

- `index.html` H1：現行「BuddyDex」維持，但 subtitle/tagline 改為強調 "field guide" / "encyclopedia" / "圖鑑"
- `<meta name="description">`：明確包含 "field guide to Claude Code buddies"、"encyclopedia"、"圖鑑" 等字眼
- `<meta property="og:description">`：同步
- `<meta property="og:title">`：包含 "field guide" 或 "encyclopedia"
- 避開字眼：`leaderboard`、`trading cards`、`competitive`、`ranking`

#### buddyboard 互補連結細節

**目標**：長期 SEO 互惠，同時向使用者揭露「想玩 leaderboard 的人應該去哪裡」，展現 BuddyDex 定位清晰。

**規格**：

- `README.md` 首段（Overview 之後、Tech 之前）加一段：
  > **Looking for a leaderboard instead?** Check out [buddyboard.xyz](https://buddyboard.xyz) — a competitive leaderboard and shareable trading cards for Claude Code `/buddy` companions. BuddyDex focuses on browsing and content depth; Buddy Board focuses on social submission and ranking.
- 網站 footer 新增 "Related projects" 區塊，放 buddyboard.xyz 連結
- **不要** 使用 `rel="nofollow"`，允許 SEO 權重傳遞
- **不要** 發送 PR 或主動求連結，僅單向友善揭露

---

## Phase 1 Done 定義

Phase 1 完成 = Feature 1（分享）+ Feature 2（隨機探索）已上線。Feature 3（教學指南）、Feature 4（Stats）和附帶修正為加分項。

上線後用 GA4 觀察 7 天：

- 分享連結帶來的流量（referrer 分析）
- 使用者停留時間和跳出率
- 根據數據決定 Phase 2 方向

---

## Phase 2 Backlog（待 GA4 數據驗證後決定）

| 功能                        | 條件                                              |
| --------------------------- | ------------------------------------------------- |
| 搜尋與篩選                  | 物種數量增加，或 GA4 顯示使用者在 grid 上大量滾動 |
| 卡片全息光效                | 分享功能上線後，需要更強的視覺吸引力              |
| Per-species 動態 OG image   | Phase 1 分享數據顯示流量可觀                      |
| Mulberry32 algorithm 文件頁 | 將 BuddyDex 定位為 canonical reference            |
| 收藏追蹤 + 抽卡模擬器       | Phase 1 數據顯示使用者有回訪意願                  |

### 實作參考

- **全息光效**：buddyboard 的 `DESIGN.md` 有具體 CSS 實作（`::before` scanline overlay + `::after` rainbow gradient sweep + `box-shadow` pulse glow）。Phase 2 實作時可作為起點，但需重寫成 BuddyDex 的 design token 系統
- **Per-species OG image**：若走動態路線需 `@vercel/og`（Satori），會打破純靜態承諾；替代方案為預先生成 18 張 PNG 存 repo
- **Mulberry32 文件**：需讀 Claude Code 原始碼確認 PRNG 實作、seed 來源、species/rarity/stats roll 邏輯。產出為一頁文件（非互動工具），放 `docs/reference/buddy-algorithm.md`
