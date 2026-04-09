# BuddyDex Phase 0 + Phase 1 產品需求文件（PRD）

> 版本：2.0
> 日期：2026-04-09
> 狀態：已審查（回應 `docs/devils-advocate-review.md`）
> 依據：`docs/research/encyclopedia-benchmarks.md` + devil's advocate review

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

## Phase 0：技術債清理

> 在 Phase 1 功能開發前完成。

### 0.1 i18n 檔案拆分

**目標**：將 `data/i18n.js`（755 行）拆分為獨立語系檔案，支援動態載入。

**規格**：

- 拆分為 `data/i18n/en.js`、`data/i18n/zh-TW.js`、`data/i18n/zh-CN.js`、`data/i18n/ja.js`、`data/i18n/ko.js`
- `js/i18n.js` 改用動態 `import()` 只載入當前語系
- 語系切換時動態載入新語系檔案

**驗收條件**：

- [ ] 每個語系一個獨立檔案
- [ ] 首次載入只下載一個語系的翻譯
- [ ] 語系切換後正確載入新翻譯
- [ ] 現有功能不受影響

### 0.2 基本測試 + CI

**目標**：建立最小可行的測試基礎建設。

**規格**：

- 建立 `package.json`，加入 Vitest
- 測試 `data/accessories.js`（`getAvailableHats` 邏輯）
- 測試 `js/i18n.js`（`t()` fallback 邏輯）
- GitHub Actions：push to main 時跑 `npm test`

**驗收條件**：

- [ ] `npm test` 可執行且通過
- [ ] GitHub Actions 綠燈
- [ ] 至少覆蓋 `getAvailableHats` 和 `t()` 函式

### 0.3 安全性 headers

**目標**：加入基本的 HTTP 安全性 headers。

**規格**：
在 `vercel.json` 加入：

- `Content-Security-Policy`：限制 `script-src` 為 `self` + `googletagmanager.com`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

**驗收條件**：

- [ ] Response headers 包含上述四項
- [ ] GA4 正常運作（不被 CSP 阻擋）
- [ ] Google Fonts 正常載入

### 0.4 aria-live 修正

**目標**：修正 detail modal 的 aria-live 每 800ms 過度觸發問題。

**規格**：

- 動畫循環不觸發 aria-live
- 僅在使用者主動切換配件時播報
- 使用獨立的 visually-hidden 元素播報狀態變更

**驗收條件**：

- [ ] 開啟 detail modal 後 screen reader 不會每 800ms 收到通知
- [ ] 切換眼睛/帽子/稀有度時 screen reader 播報變更

### 0.5 文件修正

- CHANGELOG 補上版本比較連結（m2）
- 設計文件加註被省略的設計決策（m8）
- README 加註 fork 使用者替換 GA ID（m1）

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

- 製作 1200x630 OG image（m7，分享連結需要預覽圖）

**功能規格**：

1. **URL hash 路由**
   - `buddydex.chatbot.tw/#duck` 自動打開 Duck 的 detail modal
   - 開啟 detail modal 時更新 URL hash
   - 關閉 modal 時清除 hash
   - 瀏覽器前進/後退支援
   - URL 包含 hash 時自動跳過 hatch animation（m3）

2. **複製連結按鈕**
   - detail modal 內，物種名稱旁
   - 點擊後複製 URL，短暫顯示「已複製」回饋

3. **Web Share API（行動裝置）**
   - 偵測 `navigator.share` 支援
   - 支援時顯示「分享」按鈕，fallback 到複製連結

**驗收條件**：

- [ ] `#duck` URL 開啟 Duck detail modal
- [ ] URL 帶 hash 時跳過 hatch animation
- [ ] 瀏覽器返回鍵關閉 modal
- [ ] 複製連結正確複製 URL 並顯示回饋
- [ ] Web Share API 在支援的行動裝置上觸發
- [ ] OG image 在社群平台分享時正確顯示
- [ ] Chrome DevTools mobile emulation（iPhone SE, Pixel 5）驗收通過

**預估工時**：S

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
