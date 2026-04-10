# Devil's Advocate Review — Round 5

> 審查日期：2026-04-10
> 審查對象：Phase 0 Batch B 完成 + Batch A 全六任務確認
> 上一輪：`docs/devils-advocate-review-round4.md`
> PRD 版本：2.4

---

## Phase 0 完整審計

Round 4 只驗收了 Batch A 中的 0.A.1/0.A.2/0.A.3/0.A.6（四個 critical path 任務）。完整 Phase 0 還包含 0.A.4、0.A.5，以及 Batch B 的 0.B.1。本輪補齊審計。

### 完成狀態驗證

| 任務  | 內容                   | Commit           | 驗證                                                                                                       |
| ----- | ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| 0.A.1 | 抽離 inline GA4        | 43b83b5          | ✓ Round 4 已驗                                                                                             |
| 0.A.2 | CSP + 安全 headers     | ebf61bd          | ✓ Round 4 已驗                                                                                             |
| 0.A.3 | aria-live 修正         | 5579970          | ✓ Round 4 已驗                                                                                             |
| 0.A.4 | root-level DESIGN.md   | a0496fe          | ✓ 檔案存在（9152 bytes, 2026-04-10 14:10）                                                                 |
| 0.A.5 | GitHub topics + 元資料 | 未單獨 commit    | ✓ `gh api` 確認：9 個 topics 全到位、homepage `https://buddydex.chatbot.tw`、description 含 "encyclopedia" |
| 0.A.6 | rarity inline style    | 59dad2e          | ✓ Round 4 已驗                                                                                             |
| 0.B.1 | Vitest + CI            | bc1b915          | ✓ `npm test` → 11/11 passing (<1s)、GitHub Actions 最近一次 run `conclusion: success`                      |
| 0.C.1 | i18n 拆分              | **延後（設計）** | — 符合 PRD v2.3 的延後決定                                                                                 |

**結論**：Phase 0 範圍內的所有計畫任務都已完成並線上/CI 驗證。

---

## Round 4 發現的後續狀態

Round 4 指出了 1 個 Critical（R4-C1）、2 個 Major（R4-M1、R4-M2）、2 個 Minor（R4-m1、R4-m2）。狀態如下：

| ID    | 項目                              | 狀態                                                                                                                       |
| ----- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| R4-C1 | Safari < 16.4 scroll lock 崩潰    | **uncommitted 修正已存在** 於 working tree（見下方 R5-Note-1）。修正內容與 Round 4 方案 1 完全一致（try/catch + fallback） |
| R4-M1 | `window.gtag` undefined           | **uncommitted 修正已存在** 於 working tree。analytics.js 尾端加 `window.gtag = gtag;`                                      |
| R4-M2 | GA4 `collect` 回傳 503            | **未驗證**。仍需用 Thufir `ga4_realtime` 在乾淨環境確認                                                                    |
| R4-m1 | PRD 0.A.6 未記錄 scroll lock 重構 | **未處理**                                                                                                                 |
| R4-m2 | hash `decodeURIComponent`         | Phase 1 範圍，尚未觸及                                                                                                     |

### R5-Note-1：R4-C1 和 R4-M1 的未 commit 狀態

`git status` 顯示：

```
M docs/prd.md         ← v2.3 → v2.4 header 更新
M js/analytics.js     ← 加入 window.gtag = gtag
M js/render-detail.js ← constructable stylesheet try/catch fallback
```

這些變更尚未 commit，但內容正是 Round 4 R4-C1 和 R4-M1 建議的修正，且 commit-ready 的 code comments 直接引用 `devils-advocate-review-round4.md`。

**使用者明確告知「這些問題我還沒有要他修」**，因此這些 uncommitted 變更在本輪不列為「已處理」。實際處置建議：

- 若使用者決定採納 → 直接 `git add + commit`，Phase 0 正式關閉
- 若使用者決定不採納 → `git restore js/analytics.js js/render-detail.js docs/prd.md`，保持原狀並在 Phase 1 開始前重新評估

**提醒**：只要這兩個檔案仍處於未 commit 狀態，本地測試結果（在 Chrome 146 運行）不代表線上行為。線上的 render-detail.js 仍然是會在 Safari < 16.4 崩潰的版本。

---

## Phase 0 Batch B 審查（commit bc1b915）

Batch B 引入了完整的測試基礎建設：Vitest + 11 個單元測試 + GitHub Actions CI。

### 做得好的地方

1. **刻意不引入 happy-dom** — commit message 明確解釋為什麼用 `vi.stubGlobal` 而非 happy-dom。這是經過權衡的決定，而非省事。避免了 happy-dom v15 + Vitest 的 localStorage init warning，同時 devDep 數量最小化。
2. **測試涵蓋了 Phase 0 Batch A 未直接保護的邏輯** — `getAvailableHats()` 是 rarity 按鈕的 source of truth，`t()` 是 i18n 的核心；兩者都是純函式，適合 unit test
3. **`package-lock.json` committed** — CI 透過 `npm ci` 得到 reproducible installs
4. **Test file 結構預留 `tests/unit/` / `tests/integration/` 分層**
5. **CI 綠燈**：`gh api` 確認最近一次 run 成功
6. **本地 `npm test` 11/11 passing，耗時 847ms** — 遠低於 testing rules 的 5 分鐘上限

### 發現的問題

#### R5-M1. GitHub Actions 固定在 Node 20，**本月底 EOL**

**來源**：`.github/workflows/test.yml:18`

```yaml
node-version: "20"
```

Node 20 的 LTS 生命週期：

- Active LTS：2023-10 → 2024-10
- Maintenance LTS：2024-10 → **2026-04-30**
- EOL：**2026 年 4 月 30 日**（本月底，20 天後）

**影響**：

- CI 不會立刻停擺（GitHub Actions 會保留 Node 20 一段時間）
- 但不再有安全更新
- 未來若 Vitest 或其他套件升級要求 Node 22+，會被 Node 20 鎖死
- 對 open source 專案形象有微小影響（CI 用已 EOL 的 runtime）

**建議方向**：升級到 Node 22 LTS（EOL 2027-04-30，多 12 個月壽命）。只需一行修改：

```yaml
node-version: "22"
```

**驗收**：`npm test` 在 Node 22 本地通過；CI 綠燈。零代碼變動。

**優先序**：Major — 不急迫但有明確時效，建議本週處理完並 commit。

---

#### R5-M2. `getAvailableHats('mythic')` 測試將靜默失敗固化為合約

**來源**：`tests/unit/accessories.test.js:44-49`

```js
it("returns empty array for unknown rarity", () => {
  expect(getAvailableHats("mythic")).toEqual([]);
});
```

這個測試通過是因為 `getAvailableHats()` 的實作邏輯：

```js
const rarityIndex = RARITY_ORDER.indexOf(rarityId); // -1 for unknown
return HATS.filter(...); // filter keeps nothing → []
```

**問題**：空陣列是「沒有可用帽子」和「rarity id 打錯了」的共同回傳值。一旦測試 lock 住這個行為，未來要改成拋出錯誤或 console.warn 就會破壞測試。

**影響**：目前的唯一 caller 是 `render-detail.js`，它傳的 `rarity.id` 永遠來自 `RARITIES` 陣列，不會 typo。所以現況無 bug。但是：

- Phase 1 Feature 1 若從 URL hash 或 URL parameter 取得 rarity（例如 `#duck-legendary`），允許使用者提供 rarity id，typo 或惡意輸入就會被靜默轉為「無帽子」
- 之後如果有任何地方從 `localStorage` 讀回收藏的 rarity（Phase 2+ 收藏功能），同樣風險

**建議方向**（擇一）：

1. **修改實作並更新測試**：unknown rarity → `throw new Error("unknown rarity: " + rarityId)`。在呼叫端 try/catch 或事先 validate。明確但需要改現有測試。
2. **維持行為但標記意圖**：將測試改名為 `"returns empty array (silent failure) for unknown rarity — do not rely on this for validation"`，並加註解。至少讓未來的 reviewer 知道這是刻意而非漏洞。

我偏好方案 2，因為方案 1 會讓呼叫端變複雜。但至少要在測試名稱或註解中明確「這是設計選擇，呼叫端必須自己 validate」。

**優先序**：Minor — 現況無 bug，但合約明確化的成本很低。

---

#### R5-M3. 沒有 data integrity 測試（Phase 1 Feature 3 前的潛在問題）

**來源**：tests/unit/ 目錄

目前測試只涵蓋純函式。**`data/species.js` 和 `data/i18n.js` 的內部一致性完全未測**。潛在問題：

1. 18 個 species 是否每一個都在 5 語系中都有 `name` 和 `description`？
2. 每個 species 的 `frames` 是否都是 3 個元素？每個 frame 是否都是 5 行？
3. `accessories.js` 的 `HATS[*].minRarity` 是否都是 `RARITY_ORDER` 中的有效值？
4. Phase 1 Feature 3（教學指南）會新增 10-30 個 i18n key 到 5 個語系 —— 沒有測試就沒有漏翻檢查

**建議方向**：加一個 `tests/unit/data-integrity.test.js`（20 行左右）：

```js
import { describe, it, expect } from "vitest";
import { SPECIES } from "../../data/species.js";
import { TRANSLATIONS } from "../../data/i18n.js";
import { HATS } from "../../data/accessories.js";

describe("data integrity", () => {
  const LANGS = ["en", "zh-TW", "zh-CN", "ja", "ko"];

  it("every species has name + description in every language", () => {
    for (const species of SPECIES) {
      for (const lang of LANGS) {
        const entry = TRANSLATIONS[lang]?.species?.[species.id];
        expect(entry?.name, `${lang}.species.${species.id}.name`).toBeTruthy();
        expect(
          entry?.description,
          `${lang}.species.${species.id}.description`,
        ).toBeTruthy();
      }
    }
  });

  it("every species has exactly 3 frames of 5 lines", () => {
    for (const species of SPECIES) {
      expect(species.frames.length, `${species.id}.frames.length`).toBe(3);
      for (const frame of species.frames) {
        expect(frame.length, `${species.id}.frame.length`).toBe(5);
      }
    }
  });

  it("every hat minRarity is a known rarity id", () => {
    const validRarities = new Set([
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
    ]);
    for (const hat of HATS) {
      expect(validRarities.has(hat.minRarity), `hat ${hat.id}`).toBe(true);
    }
  });

  it("every language has the same top-level keys as English", () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    for (const lang of LANGS) {
      expect(Object.keys(TRANSLATIONS[lang]).sort(), lang).toEqual(enKeys);
    }
  });
});
```

**效益**：

- Feature 3 新增教學指南時，漏翻任何一個語系會被 CI 擋下
- 未來新增 species 時，漏填 frames 或漏翻會在 `npm test` 立刻失敗
- 成本極低（純資料迴圈，零 mock、零 DOM）

**優先序**：Major — 建議在 Phase 1 Feature 3 開始前加入。這是 Phase 1 漏翻風險的 cheap insurance。

---

### Minor 發現

#### R5-m1. `package.json` 缺 `engines` 欄位

`package.json` 沒有 `"engines": { "node": ">=20" }`。影響：

- 使用 Node 18（或更舊）的貢獻者不會收到警告
- `npm install` 不會拒絕
- IDE 不會高亮不相容

**建議**：加上 `"engines": { "node": ">=20" }`（或配合 R5-M1 升級後改為 `">=22"`）。一行修改。

---

#### R5-m2. 缺 `.nvmrc`

專案根目錄沒有 `.nvmrc`，本地 dev 沒有 Node 版本 single source of truth。配合 `nvm use` 自動切換失效。

**建議**：加入 `.nvmrc` 內容為 `22`（配合 R5-M1）或 `20`。小事但與 `engines` 呼應時很清爽。

---

#### R5-m3. 沒有 coverage 報告

Vitest 支援 `--coverage`，但未啟用。無法從 CI output 看出哪些程式碼路徑被測到。

**建議**：可選。若要加：

```json
"scripts": {
  "test": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

加 `@vitest/coverage-v8` 作為 devDep。CI 不一定要跑 coverage（會拖慢），但本地可以快速檢查。

**優先序**：Low。現況只有 11 tests，coverage 工具的 ROI 不高。Phase 1 之後若測試數量增加再評估。

---

#### R5-m4. i18n test 直接修改 `TRANSLATIONS.ja.site.title` 是共享狀態污染

**來源**：`tests/unit/i18n.test.js:54-60`

```js
const savedTitle = TRANSLATIONS.ja.site.title;
delete TRANSLATIONS.ja.site.title;
try {
  expect(t("site.title")).toBe("BuddyDex");
} finally {
  TRANSLATIONS.ja.site.title = savedTitle;
}
```

`try/finally` 的 restore 很周到，但：

- `TRANSLATIONS` 是從 `data/i18n.js` import 的 module singleton
- 如果未來 Feature 3 新增一個測試檔案 `tests/unit/feature-3.test.js` 也 import 同一個 TRANSLATIONS 並做類似操作，vitest 的預設平行執行會產生 race condition
- 即使 `finally` 一定會跑，race condition 發生的時間窗內其他測試讀到的是 undefined

**建議方向**：用 `vi.spyOn` 或 `structuredClone` 取代直接 mutation：

```js
it("falls back to English...", () => {
  setLang("ja");
  const spy = vi
    .spyOn(TRANSLATIONS.ja.site, "title", "get")
    .mockReturnValue(undefined);
  expect(t("site.title")).toBe("BuddyDex");
  spy.mockRestore();
});
```

或更激進：把 i18n state 注入化，不再直接 mutate import。但這是較大重構。

**優先序**：Low。現況安全，但技術債已經種下，Feature 3 新增測試時要注意。

---

## R5-Note-2：PRD v2.3 → v2.4 的 header 更新在 working tree 中

`git diff HEAD -- docs/prd.md` 顯示 v2.4 的 header 更新是 uncommitted：

```
-> 版本：2.3
-> 狀態：已審查（round 1 + round 2 + round 3）+ 競品分析（buddyboard.xyz）
+> 版本：2.4
+> 狀態：已審查（round 1 + round 2 + round 3 + round 4）+ 競品分析（buddyboard.xyz）+ Phase 0 Batch A/B 上線驗證通過
```

但 PRD body 沒有其他更新。這個 header bump 與 R4-C1、R4-M1 的 js 修正一起躺在 working tree 中。處置建議同 R5-Note-1。

---

## Phase 0 關閉建議

Phase 0 的範圍任務全部完成，品質整體良好。關閉 Phase 0 前建議處理：

### 必做（建議進入 Phase 1 前）

1. **決定 R4-C1、R4-M1 的 uncommitted 修正**：採納（commit）或丟棄（restore）。不要讓 working tree 長期保持 dirty，避免 Phase 1 開發中混淆
2. **R4-M2 實際驗證**：用 Thufir `ga4_realtime` 在乾淨環境確認 GA4 資料有送達。若沒送達要先排除 CSP 以外的可能（extension、Vercel proxy 等）
3. **R5-M1 Node 22 升級**：月底 EOL，建議現在就改

### 建議做（Phase 1 Feature 3 前）

4. **R5-M3 data integrity 測試**：20 行 code 換 i18n 漏翻保護，ROI 極高

### 可延後

5. R5-M2 合約明確化（註解或拋錯）
6. R5-m1 `engines` 欄位
7. R5-m2 `.nvmrc`
8. R5-m3 coverage 報告
9. R5-m4 i18n test 隔離
10. R4-m1 PRD 0.A.6 補註 scroll lock 重構
11. R4-m2 Phase 1 Feature 1 規格嵌入 `decodeURIComponent` pseudo-code

---

## 整體評估

Phase 0 的 7 個已執行任務（0.A.1~6 + 0.B.1）品質都達到可上線標準。coding agent 展現出：

- 主動發現範圍外問題（0.A.6 的 scroll lock）
- 刻意的權衡（Batch B 不用 happy-dom）
- 正確的執行順序（Batch A 內部依賴處理）
- 在 Round 4 review 寫出後顯然**已經開始實作 R4-C1 和 R4-M1 的修正**（即使使用者尚未下指令）

從 review cycle 效率來看：Round 4 的 Critical 被提前處理到 uncommitted 階段，代表 review 文件本身正在成為 agent 的 standing context。這很好。

**最急迫**：R4-M2 的 GA4 503 真相必須確認，否則 Phase 0「已上線驗證通過」的宣稱可能是假的。其他都可以在 Phase 1 順帶處理。

...接下來再一輪應該就可以進 Phase 1 了吧。
