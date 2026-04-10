# BuddyDex Phase 0 + Phase 1 產品需求文件（PRD）

> 版本：2.1
> 日期：2026-04-10
> 狀態：已審查（round 1 + round 2）
> 依據：`docs/research/encyclopedia-benchmarks.md` + `docs/devils-advocate-review.md` + `docs/devils-advocate-review-round2.md`

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

**目標**：加入基本的 HTTP 安全性 headers。**依賴 0.A.1 必須先完成**。

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
          "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:;"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**驗收條件**：

- [ ] Response headers 包含上述四項
- [ ] Console 無 CSP 違規警告
- [ ] GA4 `collect?v=2&...` 請求正常送出（Network tab 確認）
- [ ] Thufir `ga4_realtime` 顯示即時數據正常
- [ ] Google Fonts 正常載入

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

### 批次 B：小批次

#### 0.B.1 測試基礎建設 + CI

**目標**：建立最小可行的測試基礎建設。

**規格**：

- 建立 `package.json`，加入 Vitest 作為 devDependency
- 單元測試：`data/accessories.js` 的 `getAvailableHats()`
- 單元測試：`js/i18n.js` 的 `t()` fallback 邏輯（當前語系缺 key 時回退到 en）
- 若 Phase 1 Feature 1 已實作，加入 hash validation 的測試案例
- GitHub Actions workflow：push to main 時跑 `npm test`

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

- 製作通用 OG image（詳見下方 OG image 規格）

**OG image 規格**：

- 尺寸：1200x630 pixels
- 格式：PNG
- 檔名：`og-image.png`（放在 repo 根目錄）
- 設計內容：深色背景（`#0d0d0d`）+ BuddyDex logo（Claude 橘色 `#da7756`）+ 標語「A field guide to Claude Buddies」+ 3-4 隻代表性 buddy ASCII art（建議 Duck、Cat、Dragon、Capybara 各一，展示不同類型）
- 製作方式：以 HTML/CSS 寫 1200x630 的單頁（參考既有 design tokens），用 Playwright 或 Puppeteer 截圖；或直接用 Figma 手動設計後匯出
- Per-species 動態 OG image：**不納入 Phase 1**，若 Phase 1 數據顯示分享流量可觀再做（需要 `@vercel/og` 或預先生成 18 張）

**功能規格**：

1. **URL hash 路由（含 hash validation）**
   - `buddydex.chatbot.tw/#duck` 自動打開 Duck 的 detail modal
   - 開啟 detail modal 時更新 URL hash
   - 關閉 modal 時清除 hash
   - 瀏覽器前進/後退支援（使用 `hashchange` 事件）
   - URL 包含 hash 時自動跳過 hatch animation（m3）
   - **安全性規則（R2-M1）**：
     - `window.location.hash` 視為**不受信任的輸入**
     - 從 hash 讀取的 species id 必須用 allowlist 驗證：`SPECIES.find(s => s.id === hashValue)`
     - 驗證失敗時：清除 hash（`history.replaceState(null, '', location.pathname)`）、不開啟 modal、console.warn 記錄
     - 任何從 hash 衍生的字串**不得直接進入 `innerHTML`**，一律使用 `textContent` 或 DOM API
     - 在 Phase 0 批次 B 的測試中加入惡意 hash 測試案例：`#<script>alert(1)</script>`、`#duck"><img src=x>`、`#'; alert(1); //`、`#../../etc/passwd`

2. **複製連結按鈕**
   - detail modal 內，物種名稱旁
   - 點擊後複製 URL，短暫顯示「已複製」回饋

3. **Web Share API（行動裝置）**
   - 偵測 `navigator.share` 支援
   - 支援時顯示「分享」按鈕，fallback 到複製連結

**驗收條件**：

- [ ] `#duck` URL 開啟 Duck detail modal
- [ ] `#<script>` 等惡意 hash 不會執行任何 JS，不顯示錯誤給使用者，console 有 warning
- [ ] 不存在的 species id（如 `#nosuchbuddy`）被拒絕
- [ ] URL 帶 hash 時跳過 hatch animation
- [ ] 瀏覽器返回鍵關閉 modal
- [ ] 複製連結正確複製 URL 並顯示回饋
- [ ] Web Share API 在支援的行動裝置上觸發
- [ ] OG image 在社群平台分享時正確顯示（Twitter、Facebook、LINE 各測一次）
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

### Phase 1 附帶修正

| 項目                                           | 來源 |
| ---------------------------------------------- | ---- |
| Hatch animation 可跳過（點擊 + hash 自動跳過） | m3   |
| 三幀動畫實作（偶爾觸發 frame 2）               | M6   |
| 行動版語言切換器改為下拉選單                   | M3   |

---

## Phase 1 Done 定義

Phase 1 完成 = Feature 1（分享）+ Feature 2（隨機探索）已上線。Feature 3（教學指南）和附帶修正為加分項。

上線後用 GA4 觀察 7 天：

- 分享連結帶來的流量（referrer 分析）
- 使用者停留時間和跳出率
- 根據數據決定 Phase 2 方向

---

## Phase 2 Backlog（待 GA4 數據驗證後決定）

| 功能                  | 條件                                              |
| --------------------- | ------------------------------------------------- |
| 搜尋與篩選            | 物種數量增加，或 GA4 顯示使用者在 grid 上大量滾動 |
| 卡片全息光效          | 分享功能上線後，需要更強的視覺吸引力              |
| 收藏追蹤 + 抽卡模擬器 | Phase 1 數據顯示使用者有回訪意願                  |
