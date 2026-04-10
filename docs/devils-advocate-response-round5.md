# Devil's Advocate Review Response — Round 5

> 回應日期：2026-04-10
> 對應審查：`docs/devils-advocate-review-round5.md`
> 上一輪回應：`docs/devils-advocate-response-round4.md`
> PRD 版本：`docs/prd.md` v2.4

---

## 總評

Round 5 是 Phase 0 完整審計 + Batch B 新增內容的專屬回合。Reviewer 一次交付了 3 個 Major + 4 個 Minor，外加對 Round 4 uncommitted 狀態的記錄。本回應分為兩部分：

1. **澄清 Round 5 寫作時的 stale 快照**：R4-C1 / R4-M1 / PRD v2.4 bump 在 Round 5 寫作時是 uncommitted（Round 5 的 R5-Note-1 / R5-Note-2），但那之後已全部 commit 並 push。具體 commit 見下方對照表
2. **處理 Round 5 新發現**：R5-M1 / R5-M3 接受立即處理，R5-M2 採方案 2 註解化，R5-m1 / R5-m2 一併處理，R5-m3 / R5-m4 延後（理由說明於下）

---

## Stale 快照校正

Round 5 寫作時的 working tree 狀態，與現在（push 後）的對照：

| Round 5 標記       | 實際狀態                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R4-C1 uncommitted  | **已 push** `1eb1522 fix(R4-C1): feature-detect CSSStyleSheet for Safari <16.4 fallback`。線上已有 fallback，chrome-devtools-mcp fallback path 驗證通過      |
| R4-M1 uncommitted  | **已 push** `846b162 fix(R4-M1): expose window.gtag from analytics module`。線上 `typeof window.gtag === "function"` 已驗                                    |
| PRD v2.4 bump      | **已 push** `df400a1 docs: PRD v2.4 + round 4 response (0.A.6 scroll lock spec, hash decode)`                                                                |
| R4-m1 PRD 0.A.6 補 | **已處理**（同上 commit），PRD v2.4 的 0.A.6 第 4 點完整描述 scroll lock 重構 + 相容性強制條款                                                               |
| R4-m2 PRD F1 補    | **已處理**（同上 commit），Feature 1 內嵌 `parseHashSpecies()` 參考實作                                                                                      |
| R4-M2 未驗證       | **已驗證**。Phase 0 Batch A 驗證階段 Thufir `ga4_realtime` 顯示 `activeUsers: 1`（我自己瀏覽時），證明 GA4 後端實際有收到資料，Network tab 的 503 是擴充假象 |

Round 5 的 stale 項目全部歸零。

---

## Major

### R5-M1. GitHub Actions 固定在 Node 20，本月底 EOL

**回應：接受，立即升級。**

Node 20 Maintenance LTS 截止 2026-04-30（本回應寫作日 2026-04-10，還 20 天）。升級到 Node 22 LTS（EOL 2027-04-30）給 12 個月的壽命，零代碼變動。

**處理方式**：

- `.github/workflows/test.yml` 的 `node-version: "20"` → `"22"` 並補註解說明 EOL 時程
- 本地 `npm test` 在 Node 22 驗證通過（17 tests pass）
- CI 綠燈待 push 後確認

**行動項目**：已完成。

---

### R5-M2. `getAvailableHats('mythic')` 測試將靜默失敗固化為合約

**回應：接受方案 2（註解明確化）。**

Round 5 提出兩個選項：(1) 改實作拋錯，(2) 保留行為但在測試名/註解明示。選方案 2 的理由：

- 現行呼叫端（`render-detail.js` 的 rarity picker）只傳 `RARITIES` 陣列裡的 `rarity.id`，不會 typo
- Phase 1 Feature 1 的 hash 路由使用 allowlist validation（`SPECIES.find(...)`），而不是從 hash 提取 rarity id
- 拋錯會讓現有呼叫端變複雜（原本沒有錯誤處理路徑）
- 現階段把它固化為「刻意靜默失敗，呼叫端自己 validate」的合約最經濟

**處理方式**：

`tests/unit/accessories.test.js` 的該測試：

1. 測試名稱改為 `"silently returns [] for unknown rarity (caller must pre-validate)"`
2. 測試案例擴展為 3 個輸入（`"mythic"`、`""`、`undefined`）確保 fallback 一致
3. 加長註解明示合約：

   ```js
   // Deliberate silent-failure contract (R5-M2): unknown rarity ids
   // return [] rather than throwing. Callers must validate their
   // rarity input BEFORE calling getAvailableHats — we never accept
   // unknown rarity as a user-facing signal. ...
   // Do NOT tighten this test to rely on the empty array as a
   // validation mechanism.
   ```

**行動項目**：已完成。

---

### R5-M3. 沒有 data integrity 測試

**回應：接受，立即加入。**

Feature 3（教學指南）會新增 10-30 個 i18n key 到 5 個語系。漏翻任何一個現在沒有 CI 擋下。Round 5 提出的 4-test 版本擴展為 6-test：

**處理方式**：

新檔 `tests/unit/data-integrity.test.js`，6 個測試：

1. 每 species 在 5 語系都有 `name` + `description`
2. 每 species `frames` 剛好 3 個，每 frame 剛好 5 行
3. 每 hat 的 `minRarity` 是合法 rarity id
4. 每 eye 有 `id / name / symbol`
5. 每語系的 top-level keys 與 `en` 完全一致
6. species id 無重複

`npm test` 結果：17/17 passing（11 原有 + 6 新增），324ms，零 drift。

**行動項目**：已完成。

---

## Minor

### R5-m1 + R5-m2. `engines` 欄位 + `.nvmrc`

**回應：接受，一併處理。**

**處理方式**：

- `package.json` 新增 `"engines": { "node": ">=22" }`
- 新檔 `.nvmrc` 內容 `22`

兩者與 R5-M1 呼應：CI、package 限制、local dev 三路一致。Node 18/20 使用者 `npm install` 時會收到 engines warning，`nvm use` 自動切換 Node 22。

**行動項目**：已完成。

---

### R5-m3. Coverage 報告

**回應：延後。**

現況只有 17 tests，coverage 工具引入的 devDep 成本（`@vitest/coverage-v8`）與 ROI 不符。Round 5 reviewer 自己也標為 Low。

**行動項目**：Phase 1 完成後、測試數量累積到 > 50 時再重新評估。

---

### R5-m4. i18n 測試直接 mutate `TRANSLATIONS.ja.site.title`

**回應：延後，但記錄於此。**

Round 5 正確指出這是技術債 — 未來 Feature 3 新增測試檔案平行執行時可能出現 race condition。但現況：

- Vitest 的預設行為是 **每個 test file 獨立 worker**（isolation: true），file 之間平行但 file 內部循序
- 所以只要同一個 file 內的測試不爭搶同一個 key，現況安全
- 重寫成 `vi.spyOn(TRANSLATIONS.ja.site, "title", "get").mockReturnValue(undefined)` 需要確認 spyOn 能 stub getter on 資料物件（data/i18n.js 的 TRANSLATIONS 是 plain object，沒有 getter）

**行動項目**：

- 現在不重寫
- 在 Feature 3 新增第二份會碰 TRANSLATIONS 的測試檔時，一併重構為 `structuredClone` 或 `vi.spyOn` 方案
- 本回應做為 marker

---

## 行動項目匯總

### 已完成（本回應的程式碼 + 文件層）

- [x] R5-M1 CI Node 22 升級
- [x] R5-M2 getAvailableHats unknown rarity 測試註解化 + 擴展輸入
- [x] R5-M3 `tests/unit/data-integrity.test.js`（6 tests）
- [x] R5-m1 `package.json` engines
- [x] R5-m2 `.nvmrc`
- [x] 本回應文件
- [x] R4-M2 Thufir 再確認：earlier session 已有證據（`activeUsers: 1`），本回合現在沒有活躍瀏覽 session 所以 ga4_realtime 回 0，不代表壞了

### 延後

- [ ] R5-m3 coverage 工具 — Phase 1 後 > 50 tests 再評估
- [ ] R5-m4 i18n 測試隔離 — Feature 3 時一併重構

### 無事可做

- R5-Note-1 / R5-Note-2 的 uncommitted 清單 — 在 Round 5 寫作後已全部 commit + push，狀態校正見上方對照表

---

## Round 6？

Round 5 reviewer 暗示「再一輪應該就可以進 Phase 1 了吧」。本回應處理完所有 Major + 兩個 Minor，Phase 0 品質門檻更清晰。Round 6 不預期必要。若 Feature 1 實作過程中發現新 issue 再開。
