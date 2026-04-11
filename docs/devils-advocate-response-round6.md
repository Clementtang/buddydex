# Devil's Advocate Review Response — Round 6 (Phase 0 Closure)

> 回應日期：2026-04-11
> 對應審查：`docs/devils-advocate-review-round6.md`
> 上一輪回應：`docs/devils-advocate-response-round5.md`
> PRD 版本：`docs/prd.md` v2.4

---

## 總評

Round 6 確認 Phase 0 可以正式關閉。所有 Round 4 + Round 5 的 Critical / Major / Minor 項目都被客觀驗證處理完畢，特別是 R4-M2（GA4 collect 503）透過 Thufir `ga4_report` 得到**最終證據**：2026-04-10 後端收到 9 pageviews / 2 users / 3 sessions / 23 events，證實 Chrome 本地看到的 503 完全是擴充套件假造。

Round 6 新發現 3 個 Minor：R6-m1（PRD 驗收條件未勾選）、R6-m2（`window.gtag = gtag` race condition）、R6-m3（缺 RARITY_ORDER 一致性測試）。處理方針：

- **R6-m1**：勾選
- **R6-m2**：留作 knowledge，**不動程式碼**（實務無害）
- **R6-m3**：補測試

---

## Minor

### R6-m1. PRD 0.A.6 的 5 個驗收條件全為 `[ ]`

**回應：接受，全部更新。**

PRD v2.4 的 0.A.6 驗收條件原本 5 個全未勾選。實際狀況依 Round 4 + Round 5 的 chrome-devtools-mcp 驗證：

| #   | 條件                             | 驗證方式                                                                                                                             | 狀態    |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | `grep -n "\.style\." js/` 無寫入 | Round 5 自行驗證 + Round 6 reviewer 獨立驗證                                                                                         | ✅ 勾選 |
| 2   | Rarity 按鈕顏色正確              | Round 4 chrome-devtools-mcp 實測 `computedColor` 全對                                                                                | ✅ 勾選 |
| 3   | Scroll lock 正常運作             | Round 4 chrome-devtools-mcp 實測 scrollY 187.5 → lock → unlock → 187                                                                 | ✅ 勾選 |
| 4   | CSSStyleSheet throw 環境         | Round 4 chrome-devtools-mcp 用 `Object.defineProperty(window, 'CSSStyleSheet', { get() { throw ... } })` + dynamic import 端到端實測 | ✅ 勾選 |
| 5   | CSP 無 `'unsafe-inline'`         | `vercel.json` 確認 + 線上無 CSP violation                                                                                            | ✅ 勾選 |

第 4 條原本 Round 6 建議標為「code review only」並保持 `[ ]`，但實際上 Round 4 已經在瀏覽器裡用 `defineProperty` patch 模擬了 throw 並重新 import render-detail.js，驗證 `importSucceeded: true` + `fallbackSheetNotAdded: true` + `moduleHasSetupDetailOverlay / moduleHasOpenDetail: true`。這是端到端 runtime 驗證，不只是 code review。所以條件 4 也實質完成，一併勾選並在註腳中記錄實測方法。

**行動項目**：PRD v2.4 0.A.6 驗收條件全部勾選 + 實測紀錄嵌入（同 commit）。

---

### R6-m2. `window.gtag = gtag` 在 module 頂層指派，可能覆寫 gtag.js 的版本

**回應：留作 knowledge，不動程式碼。**

Round 6 自己的分析結論就是「實務上無害」：即使 analytics.js 覆寫了 gtag.js 的 `window.gtag`，本地 gtag() 函式仍然 push 到 `window.dataLayer`，而 gtag.js 的主要 hook 點是 `dataLayer.push` 不是 `window.gtag`。所以 event 仍會被送達。

如果加上 `if (typeof window.gtag !== "function")` 檢查，會讓 analytics.js 先跑的時間視窗中失去 R4-M1 原本想解決的防呆（window.gtag 是我們的本地函式而不是 undefined）。實務差異接近零，但增加一層條件分支的 cognitive cost。

**行動項目**：無。在本回應文件記錄為「已評估，刻意保留現狀」。

---

### R6-m3. data-integrity 測試沒有檢查 `RARITY_ORDER` 與 `RARITIES` 順序一致性

**回應：接受，補測試。**

Phase 2 若新增 rarity 而忘了更新 `accessories.js` 內部的 `RARITY_ORDER`，`getAvailableHats()` 會回傳錯誤的可用帽子清單，現況測試不會擋下。

**處理方式**：`tests/unit/data-integrity.test.js` 新增第 7 個測試，採 Round 6 建議的 observational 方案（不改 `accessories.js` 的 export 結構）：

1. 依 `RARITIES` 順序對每個 rarity 呼叫 `getAvailableHats()`
2. Cumulative hat count 必須 monotonically non-decreasing
3. 最高 rarity 必須解鎖所有 hat

任一條件失敗代表 `RARITY_ORDER` 與 `RARITIES` 脫鉤。

`npm test` 結果：34/34 passing（原 33 + 1 新增）。

**行動項目**：已完成（commit `f4b8f29`）。

---

## 行動項目匯總

### 已完成

- [x] R6-m1 PRD v2.4 0.A.6 驗收條件 5 個全部勾選 + 實測方法紀錄
- [x] R6-m3 `tests/unit/data-integrity.test.js` 新增第 7 個測試
- [x] 本回應文件

### 刻意不做

- R6-m2 `window.gtag = gtag` race condition — 已評估為實務無害

---

## Phase 0 正式關閉

六輪 review 完成，所有項目狀態收斂：

| 輪次    | Critical | Major | Minor | 關閉方式                      |
| ------- | -------- | ----- | ----- | ----------------------------- |
| Round 1 | 3        | 7     | 8     | Phase 0 規劃                  |
| Round 2 | 1        | 3     | 3     | Phase 0 批次化                |
| Round 3 | 0        | 3     | 5     | CSP 硬化 + hash validation    |
| Round 4 | 1        | 2     | 2     | Safari fallback + window.gtag |
| Round 5 | 0        | 3     | 4     | Node 22 + data integrity      |
| Round 6 | 0        | 0     | 3     | 最終清理                      |

六輪加總：5 Critical、18 Major、25 Minor — 全部處理或合理延後，延後項目都有明確 trigger 條件。

Phase 0 7 個任務（0.A.1~6 + 0.B.1）全部上線驗證通過。Phase 1 Feature 1 已在本批次開工（4 個 commit 已推：`a81c623 / 90c80bd / 557f11f / bf65cf0`），與 Round 6 回應的 3 個 Minor 清理並行。

## Round 7？

Round 6 reviewer 說「如果 Phase 1 能維持這個節奏，應該不需要那麼多輪 review 了」。

對 Phase 1 的期待設定：每個 Feature 完成上線後做一次 review，不必像 Phase 0 這樣高頻（Phase 0 大量 review 是因為同時要處理安全性、相容性、測試建置、競品分析）。Phase 1 的 review 焦點應該是：

- Feature 1：hash 路由是否有漏洞、share API 行為、OG image 實際視覺效果
- Feature 2：隨機探索的 UX 是否有價值
- Feature 3：教學指南的法律定位、i18n 漏翻
- Feature 4：Stats 是否與 Claude Code 原始碼一致

一輪 review / Feature 應該足夠。
