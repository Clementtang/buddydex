# Devil's Advocate Review Response

> 回應日期：2026-04-09
> 對應審查：`docs/devils-advocate-review.md`

---

## Critical

### C1. i18n 資料與程式碼耦合在單一巨型檔案中

**回應：接受，Phase 1 前處理。**

拆分方案：`data/i18n/en.js`、`data/i18n/zh-TW.js` 等獨立檔案。`js/i18n.js` 改為動態 `import()` 只載入當前語系。這同時解決了首次載入下載全部語系的效能問題。

**行動項目**：新增 Phase 0（技術債清理）任務，在 Phase 1 功能開發前完成。

---

### C2. 目標用戶定義模糊，用戶價值假設未驗證

**回應：接受。**

reviewer 說得對 — 18 隻物種的搜尋功能確實是過度工程。重新定義：

**目標用戶 Persona**：

1. **Claude Code 新手**：剛拿到 buddy，想了解自己拿到的是什麼物種、有多稀有
2. **社群分享者**：想展示自己的 buddy 配置（物種 + 配件組合）給朋友看
3. **路過的好奇者**：從社群連結進來，瀏覽一下就走

**功能優先序調整**：

- 搜尋功能從 Phase 1 移至 Phase 2（等物種數量增加或 GA4 數據顯示需求後再做）
- Phase 1 聚焦在分享（persona 2 的核心需求）和教學指南（persona 1 的核心需求）

**行動項目**：更新 PRD，加入 persona 定義，移除搜尋功能。

---

### C3. 沒有任何測試，也沒有測試策略

**回應：接受，Phase 0 處理。**

最小可行測試策略：

- 加入 `package.json` + Vitest
- data modules 的單元測試（`getAvailableHats`、i18n `t()` fallback 邏輯）
- GitHub Actions CI：push to main 時跑測試
- 不追求覆蓋率，只保護有邏輯的純函式

**行動項目**：新增 Phase 0 任務。

---

## Major

### M1. `innerHTML` 拼接存在 XSS 向量

**回應：接受，Phase 1 搜尋功能中注意。**

但 Phase 1 已移除搜尋功能（見 C2 回應），短期內不會引入使用者輸入文字。若未來加入搜尋，使用 `textContent` 處理使用者輸入，不經過 `innerHTML`。

現有的 `innerHTML` 使用場景（grid cards、mechanics cards）的資料來源皆為靜態 JS 物件，非使用者可控，風險可接受。

**行動項目**：在 PRD 技術限制中加入 XSS 防範規則。

---

### M2. Phase 1 PRD 缺少時程和驗收流程

**回應：部分接受。**

個人 side project 不需要 sprint 規劃，但 reviewer 指出的「沒有硬性截止日會導致 scope creep」是對的。

**調整**：

- Phase 1 Done 的最小條件：Feature 1（分享）+ Feature 4（隨機探索）上線
- 上線前在 Chrome DevTools mobile emulation（iPhone SE, Pixel 5）和至少一台實體手機上手動驗收
- 不設硬性日期，但設回顧檢查點：Phase 1 上線後用 GA4 觀察 7 天再決定 Phase 2

**行動項目**：更新 PRD。

---

### M3. 行動裝置語言切換器可用性

**回應：接受。**

5 個按鈕在 320px 螢幕上確實擠。改為下拉選單：

- 顯示當前語言名稱 + 地球圖示
- 點擊展開語言列表
- 桌面版可保留按鈕列，行動版改下拉

**行動項目**：加入 Phase 1 技術債清理。

---

### M4. 缺少安全性 HTTP headers

**回應：接受，立即處理。**

在 `vercel.json` 加入：

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

**行動項目**：Phase 0 立即處理。

---

### M5. 研究報告與 PRD 優先序不一致

**回應：接受，需要對齊。**

PRD 跳過「全息光效」的原因：全息光效是純視覺增強，不直接帶動流量或解決使用者痛點。URL hash（分享功能）對 SEO 和社群傳播有直接貢獻，所以優先。

**行動項目**：在 PRD 加入「與研究報告差異說明」section。

---

### M6. species.js 第三個 frame 未被使用

**回應：接受，保留但實作三幀動畫。**

第三幀設計為「特殊動作」（冒煙、天線閃爍等），有意義。改為偶爾觸發：idle 循環 0→1→0→1... 每隔 5 次循環插入一次 frame 2。

**行動項目**：加入 Phase 1 polish。

---

### M7. aria-live 過度觸發

**回應：接受，立即修正。**

改為：動畫循環不觸發 aria-live，僅在使用者主動切換配件（眼睛、帽子、稀有度、shiny）時，用獨立的 visually-hidden 元素播報變更。

**行動項目**：Phase 0 修正。

---

## Minor

### m1. GA4 ID 硬編碼

**回應：接受現狀。** GA ID 非 secret，但在 README 加註提醒 fork 使用者替換。

### m2. CHANGELOG 缺少比較連結

**回應：接受，補上。**

### m3. Hatch animation 無法跳過

**回應：接受。** Phase 1 實作 URL hash 路由時，若 URL 包含 hash 則自動跳過動畫。另加「點擊任意處跳過」。

### m4. sitemap 靜態維護

**回應：接受現狀。** Hash fragment 不適合放 sitemap，目前單頁站只需要一個 URL。

### m5. Feature 3 法律風險

**回應：接受。** 將教學內容定位為「社群發現的技巧」，不宣稱為官方功能。在教學 section 加入 disclaimer。另：Anthropic ToS 閱讀列入行動項目。

### m6. Cache-Control

**回應：接受現狀。** Vercel 部署時會 purge CDN，`max-age=3600` 在實務上不會造成嚴重的版本不一致。

### m7. 缺少 OG image

**回應：接受，Phase 1 Feature 2 前處理。** 製作 1200x630 的 OG image。

### m8. 設計文件與現狀不一致

**回應：接受。** 在設計文件中加註被省略的設計決策。

---

## 整體風險回應

### 1. 過度工程 vs 內容不足

同意。Phase 1 從 4 個功能精簡為 2 個核心功能（分享 + 隨機探索），加上內容補強（風味文字、教學指南）。先豐富內容，再堆功能。

### 2. 非官方同人專案的生存風險

事實如此。但 BuddyDex 的投入主要是技術練習和 portfolio 展示，即使 Anthropic 推出官方圖鑑，已學到的技術和建立的 practice 仍有價值。不額外做風險緩解，但不投入超過 side project 合理範圍的時間。

### 3. 單人維護可持續性

同意自動化基礎建設優先。Phase 0（CI、測試、i18n 拆分）在 Phase 1 前完成。

---

## 行動項目匯總

### Phase 0（技術債，Phase 1 前完成）

| #   | 項目                                              | 來源 |
| --- | ------------------------------------------------- | ---- |
| 0.1 | i18n 拆分為獨立語系檔案 + 動態 import             | C1   |
| 0.2 | 加入 package.json + Vitest + data module 基本測試 | C3   |
| 0.3 | GitHub Actions CI                                 | C3   |
| 0.4 | vercel.json 加入安全性 headers                    | M4   |
| 0.5 | 修正 aria-live 過度觸發                           | M7   |
| 0.6 | CHANGELOG 補上版本比較連結                        | m2   |
| 0.7 | 設計文件加註被省略的設計決策                      | m8   |

### Phase 1（精簡後）

| #   | 項目                                        | 來源          |
| --- | ------------------------------------------- | ------------- |
| 1.1 | OG image 製作                               | m7            |
| 1.2 | 分享功能（URL hash + 複製連結 + Web Share） | PRD Feature 2 |
| 1.3 | Hatch animation 可跳過（含 hash 自動跳過）  | m3            |
| 1.4 | 隨機探索按鈕                                | PRD Feature 4 |
| 1.5 | 三幀動畫實作                                | M6            |
| 1.6 | Buddy 自訂教學指南                          | PRD Feature 3 |
| 1.7 | 行動版語言切換器改為下拉選單                | M3            |

### 移至 Phase 2

| 項目         | 原因                                                   |
| ------------ | ------------------------------------------------------ |
| 搜尋與篩選   | 18 隻不需要搜尋，等物種增加或 GA4 數據驗證後再做（C2） |
| 卡片全息光效 | 純視覺增強，不直接帶動流量（M5）                       |
