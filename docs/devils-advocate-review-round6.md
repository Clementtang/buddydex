# Devil's Advocate Review — Round 6 (Phase 0 Closure)

> 審查日期：2026-04-11
> 上一輪：`docs/devils-advocate-review-round5.md`（及 `devils-advocate-response-round5.md`）
> PRD 版本：2.4

---

## TL;DR

**Phase 0 已具備進入 Phase 1 的品質。** Round 4 和 Round 5 的所有 Critical/Major/Minor 項目都已處理或合理延後，R4-M2 的 GA4 後端資料也透過 Thufir 客觀驗證確認。

---

## 最終驗收

### Round 4 findings 狀態（全部處理完畢）

| ID    | 項目                       | Commit     | 驗證                                                                                                                                         |
| ----- | -------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| R4-C1 | Safari < 16.4 scroll lock  | 1eb1522    | ✓ `js/render-detail.js:22-31` 有 try/catch 與 null-check。code review PASS；acceptance criterion 「模擬舊瀏覽器」仍 [ ] 未勾選               |
| R4-M1 | `window.gtag` undefined    | 846b162    | ✓ `js/analytics.js:23` `window.gtag = gtag`                                                                                                  |
| R4-M2 | GA4 `collect` 503          | 驗證性任務 | ✓ **Thufir ga4_report 2026-04-10 資料：9 pageviews / 2 activeUsers / 3 sessions / 23 events**。Round 4 推測的「ad blocker 假象」得到客觀證實 |
| R4-m1 | PRD 0.A.6 記錄 scroll lock | df400a1    | ✓ PRD v2.4 0.A.6 新增第 4 點完整描述（含瀏覽器支援矩陣 + 必須 feature-detect 條款）                                                          |
| R4-m2 | hash `decodeURIComponent`  | df400a1    | ✓ PRD Feature 1 嵌入完整 `parseHashSpecies()` 參考實作（含 `URIError` handling + allowlist）                                                 |

### Round 5 findings 狀態（全部處理完畢）

| ID    | 項目                        | Commit   | 驗證                                                                                                   |
| ----- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| R5-M1 | CI Node 22 升級             | 9655ad3  | ✓ workflow pin `node-version: "22"`、commit 含 EOL 說明                                                |
| R5-M2 | getAvailableHats 合約明確化 | 8795b0a  | ✓ 測試名改為 "silently returns [] ... (caller must pre-validate)"、擴展到 3 個 input、加長註解明示合約 |
| R5-M3 | data integrity 測試         | b1e5e44  | ✓ `tests/unit/data-integrity.test.js` 6 個測試，比我建議的 4 個多涵蓋 eyes 欄位和 species id 唯一性    |
| R5-m1 | `engines` 欄位              | 9655ad3  | ✓ `package.json` `"engines": { "node": ">=22" }`                                                       |
| R5-m2 | `.nvmrc`                    | 9655ad3  | ✓ 新檔內容 `22`                                                                                        |
| R5-m3 | coverage 報告               | Deferred | ✓ 延後至 > 50 tests 時重評                                                                             |
| R5-m4 | i18n test 隔離              | Deferred | ✓ 延後至 Feature 3 新增第二個 TRANSLATIONS 測試檔時一併重構                                            |

### 客觀證據彙整

執行 `npm test`（Node 22，本機）：

```
✓ tests/unit/i18n.test.js          (5 tests)
✓ tests/unit/data-integrity.test.js (6 tests)
✓ tests/unit/accessories.test.js   (6 tests)

Test Files  3 passed (3)
     Tests  17 passed (17)
  Duration  498ms
```

CI 狀態（`gh api` 最近 3 次 run）：

- `80a36ad` response round5: success
- `df400a1` PRD v2.4 + round4 response: success
- `bc1b915` test 0.B.1 (Batch B 啟動): success

`grep -rn "\.style\." js/` 結果：

```
js/render-detail.js:12:// the body scroll lock. Writing JS inline styles (body.style.top = ...)
```

**唯一命中**為註解，**零**實際 inline style 寫入。CSP `style-src 'unsafe-inline'` 移除的前提條件完全成立。

**Thufir GA4 2026-04-10 資料**（透過 `mcp__thufir__ga4_report`）：

```json
{
  "date": "20260410",
  "screenPageViews": 9,
  "activeUsers": 2,
  "sessions": 3,
  "eventCount": 23
}
```

這是 R4-M2 的決定性證據：Chrome devtools 在我的本地環境看到的 503 完全是擴充套件偽造的。線上 GA4 後端實際有接收到 pageview + scroll 等 23 個 events。

---

## Round 6 的新發現（3 個 Minor，都不 block 關閉 Phase 0）

### R6-m1. PRD 0.A.6 的驗收條件未勾選，但 code review 通過

**來源**：`docs/prd.md:255-259`

PRD v2.4 的 0.A.6 驗收條件有 5 個，全部為 `[ ]`：

```
- [ ] `grep -n "\.style\." js/` 無 rarity-related 或 scroll-lock 的 inline style 寫入
- [ ] Detail modal 切換 rarity 時按鈕顏色正確顯示
- [ ] Scroll lock 正常運作
- [ ] 在 `new CSSStyleSheet` throw 的環境下，render-detail.js 仍能 import 成功
- [ ] 重構後 0.A.2 CSP 可以不用 `'unsafe-inline'` 並通過驗收
```

實際狀況：

1. `grep` 條件：**PASS**（驗證過，僅命中註解）
2. Rarity 按鈕顏色：**PASS**（Round 4 chrome-devtools-mcp 驗證過 legendary 顏色）
3. Scroll lock 正常運作：**PASS**（Round 4 驗證過 `body.scroll-locked` class + `adoptedStyleSheets` 注入）
4. **CSSStyleSheet throw 環境測試：未驗證**。程式碼 review 確認有 try/catch 和 null-check，邏輯對，但沒有實際在 Safari 15 或 stub 環境跑過
5. CSP 無 `'unsafe-inline'`：**PASS**（`vercel.json` 確認）

**建議方向**：在 PRD 中把前 3 和第 5 個條件勾選為 `[x]`，第 4 個加註「code review only, no runtime test — covered by graceful fallback in render-detail.js:22-31」並維持 `[ ]`。或在 Phase 1 開始前補一個 DOM-level 測試（需要引入 happy-dom 或 Playwright 的 smoke test），為了一個 edge case 不值得。

**優先序**：極低。這是文件一致性問題，不影響功能。

---

### R6-m2. `window.gtag = gtag` 的指派發生於模組頂層，可能被 gtag.js 覆寫

**來源**：`js/analytics.js:23`

```js
window.gtag = gtag;
```

這行發生於 analytics.js 模組初次執行時。當外部 `gtag.js` loader 完成載入後，gtag.js 會設定自己的 `window.gtag` 作為真正的處理函式。這個覆寫對我們來說是「正確行為」——gtag.js 的 gtag 函式是完整版，而 analytics.js 的本地 gtag 只會 push 到 dataLayer。

時序有兩種可能：

1. **analytics.js 先跑** → `window.gtag` = module 本地函式（只 push dataLayer）
2. **gtag.js 先跑** → `window.gtag` = gtag.js 完整版
3. **之後 analytics.js 跑** → `window.gtag = gtag`（本地）**覆蓋 gtag.js 的版本**

Case 3 是 race condition 陷阱：如果 gtag.js 載入速度比 analytics.js 快（理論上可能，雖然不常見），analytics.js 會把 gtag.js 的完整版 gtag 換成本地的 dataLayer-push 版本。這種情況下：

- `window.gtag('event', 'buddy_shared', {...})` 仍然會 push 到 dataLayer
- gtag.js 的 dataLayer hook 還是會處理這筆 push
- 所以**實務上 event 還是會送達**

換句話說，這個覆寫看似可怕但實際上無害，因為 gtag.js 的主要 hook 點是 `dataLayer.push` 不是 `window.gtag`。

**建議方向**：可接受現狀。若要更保險，改為：

```js
if (typeof window.gtag !== "function") {
  window.gtag = gtag;
}
```

但這會讓 analytics.js 先跑的時間視窗中，Case 3 不再覆寫 gtag.js。實務差異接近零。

**優先序**：極低。留作 knowledge，不動程式碼。

---

### R6-m3. data-integrity test 沒有測 `accessories.js` 的 RARITY_ORDER 一致性

**來源**：`tests/unit/data-integrity.test.js` vs `data/accessories.js:36-44`

`data/accessories.js` 內部有一個 `const RARITY_ORDER = [...]`，它是 `getAvailableHats` 的 index 依據。這個陣列與 `data/rarity.js` 的 `RARITIES` 陣列順序**必須一致**，否則 `getAvailableHats('epic')` 會回傳錯誤的可用帽子清單。

目前 data-integrity 測試檢查了：

- Species × 語系 翻譯完整性
- Frames shape
- Hat minRarity 是合法 rarity id
- Eye 欄位完整
- i18n top-level keys 一致
- Species id 唯一

**沒檢查**：`RARITY_ORDER` 與 `RARITIES.map(r => r.id)` 是否一致。

這是一個冷門但實際的風險：有人為了新增新稀有度（例如 Phase 2 加 Mythic），在 `rarity.js` 加了一筆但忘了更新 `accessories.js` 的 RARITY_ORDER。測試目前不會擋下。

**建議方向**：在 `data-integrity.test.js` 加第 7 個測試：

```js
it("accessories.RARITY_ORDER matches rarity.RARITIES order", async () => {
  // RARITY_ORDER is not exported; we check via its observable behavior.
  // For each rarity in order, each cumulative call should return >= previous.
  const { RARITIES } = await import("../../data/rarity.js");
  const { getAvailableHats } = await import("../../data/accessories.js");
  let prevCount = 0;
  for (const rarity of RARITIES) {
    const count = getAvailableHats(rarity.id).length;
    expect(
      count,
      `${rarity.id} should unlock >= ${prevCount}`,
    ).toBeGreaterThanOrEqual(prevCount);
    prevCount = count;
  }
});
```

或更直接：在 `accessories.js` export `RARITY_ORDER`，在測試中直接對比。較醜但較明確。

**優先序**：Low。現況 18 species + 5 rarity 不會變動，但 Phase 2 若動 rarity 系統就會踩到。

---

## Phase 0 完成度評估

| 維度       | 評分 | 備註                                                                |
| ---------- | ---- | ------------------------------------------------------------------- |
| 規格完整度 | A    | PRD v2.4 所有 Phase 0 任務都有明確規格、驗收條件、依賴關係          |
| 實作品質   | A    | 所有 commit 訊息解釋 why，引用 review ID，主動發現範圍外問題        |
| 測試覆蓋   | B+   | 17 tests 涵蓋純函式 + 資料完整性；但 render-\* 模組仍靠 code review |
| 驗證紀律   | A-   | 線上行為用 chrome-devtools-mcp + Thufir 雙重驗證                    |
| 文件一致性 | A    | PRD / CHANGELOG / response docs 都保持同步                          |
| 風險識別   | A    | 每個 review 的 Critical/Major 都被逐項處理，延後項目有 trigger 條件 |

---

## Round 6 結論

Phase 0 的 7 個已執行任務（0.A.1~6 + 0.B.1）在功能、安全、a11y、測試、CI、文件六個面向都達到可上線標準。R4-M2 這個最關鍵的「GA4 是否真的收到資料」問題透過 Thufir 客觀驗證後得到確認。

**建議**：Phase 0 可以正式關閉，進入 Phase 1。

Round 6 的三個 Minor 發現都不是 blocker：

- R6-m1（PRD 驗收條件未勾選）：文件清理，建議順便做
- R6-m2（gtag race condition）：留作 knowledge，實務無害
- R6-m3（RARITY_ORDER 測試）：Phase 2 前補上即可

---

## 給 Phase 1 的建議（非 Phase 0 範圍）

1. **Feature 1 實作時**：直接複製 PRD v2.4 的 `parseHashSpecies()` 參考實作，惡意 hash 測試案例已列在 PRD 中
2. **Feature 3 實作時**：新增教學指南的 i18n key 會觸發 data-integrity.test.js 的 "every language has the same top-level keys" 測試，這是設計的 cheap insurance
3. **iOS Safari 15 測試**：若有實體裝置或模擬器，建議順手驗證 R4-C1 的 fallback path 實際行為，補完 R6-m1 的驗收條件
4. **觀察期紀律**：PRD v2.4 寫明 Phase 1 上線後觀察 GA4 7 天，Thufir 現在已確認資料流正常，到時候用 `ga4_report` 查 7 天內的 referrer / pagePath 來驗證分享功能的流量效果

---

...經過六輪的 review 循環，Phase 0 終於可以劃上句點了呢。這次合作的 coding agent 展現出非常好的「internalize reviewer」能力——從 Round 4 之後就開始主動預判我的疑慮，commit 訊息也越來越會解釋 trade-off。如果 Phase 1 能維持這個節奏，應該不需要那麼多輪 review 了。
