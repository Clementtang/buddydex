# Devil's Advocate Review Response — Round 3

> 回應日期：2026-04-10
> 對應審查：`docs/devils-advocate-review-round3.md`
> 上一輪回應：`docs/devils-advocate-response-round2.md`
> 更新後 PRD 版本：`docs/prd.md` v2.3

---

## 總評

Round 3 的 8 項發現都是**實作細節級別**，沒有方向性問題。reviewer 的總評一致：Round 2 的回應品質已內化 reviewer 思路，Round 3 找到的主要是 PRD 與 response 的內部一致性問題（R3-M1）和 CSP 的細節漏洞（R3-M2 系列）。

全部 8 項接受並處理，無延後、無 scope 砍。大部分為 PRD 文件調整，唯一涉及未來程式碼改動的是 R3-M2 的 rarity inline style 重構 — 已新增 Phase 0 批次 A 任務 0.A.6。

---

## Major

### R3-M1. PRD v2.1 第 296 行仍將 M6 列在 Phase 1 附帶修正

**回應：接受，立即修正。**

Round 2 R2-m2 的決策是：M6 三幀動畫從 Phase 1 polish 移除，僅保留 `data/species.js` 頂部註解（commit `9653e5b` 已完成）。但 PRD v2.1 和 v2.2 的「Phase 1 附帶修正」表格仍留「三幀動畫實作」一列，造成實作 agent 可能照 PRD 字面意思去做 frame 2 動畫。

**處理方式**：

- 移除 PRD v2.3 Phase 1 附帶修正表格中的「三幀動畫實作」列
- 表格下方加註解：明示此條目依 Round 2 決策已降級為死代碼清理，指向 `data/species.js` 頂部註解和 commit `9653e5b`

**行動項目**：PRD 調整（已完成）。

---

### R3-M2. CSP `style-src 'unsafe-inline'` 可透過重構消除

**回應：完全接受。這是 Round 2 的盲點。**

Round 2 為了不阻擋 GA4 保留了 `'unsafe-inline'` in `style-src`，但其實這個 `'unsafe-inline'` 是因為 `js/render-detail.js` 的 rarity button inline style 寫入（`element.style.borderColor = rarity.color`），和 GA4 無關。透過 data attribute + CSS class 重構就能移除，完全不影響 GA4，且換來 CSP style 防禦完整。

**處理方式**：

1. **新增 Phase 0 批次 A 任務 0.A.6**：Rarity 按鈕 inline style 重構為 data attribute
   - `js/render-detail.js` 改為 `button.dataset.rarity = rarity.id` + `button.classList.add("rarity-btn")`
   - `css/components.css`（或 `detail-controls.css`）新增 `.rarity-btn[data-rarity="..."]` 五個 selectors，引用現有的 `--rarity-*` CSS 變數
   - 實作前 `grep -n "\.style\." js/` 檢查其他 inline style 寫入點
2. **0.A.6 block 0.A.2**：CSP 套用前必須先完成 rarity 重構
3. **PRD 0.A.2 CSP 規格更新**：移除 `style-src 'unsafe-inline'`
4. **驗收條件補上**：CSP header 中不包含任何 `'unsafe-inline'`、切換 rarity 時按鈕顏色正確

**行動項目**：PRD 調整（已完成）；程式碼重構待 Phase 0 批次 A 實作階段。

---

### R3-M3. PRD 描述製作 og-image.png 但忘了加 `<meta property="og:image">` tag

**回應：完全接受。低階疏漏。**

PRD v2.1/v2.2 規範了 `og-image.png` 的尺寸、設計、檔名，但忘了寫必須在 `index.html` `<head>` 加入對應 meta tags。結果就算 PNG 放在 repo 根目錄，社群平台仍然不會顯示預覽（HTML 沒引用到檔案）。

**處理方式**：

1. **PRD Feature 1 前置作業**從 1 項擴充為 2 項：
   - 製作通用 OG image
   - **在 `index.html` `<head>` 加入 og:image 相關 meta tags**
2. **新增「OG image meta tags 規格」section**：列出 5 個必要 tag（`og:image`、`og:image:width`、`og:image:height`、`og:image:alt`、`twitter:image`）
3. **驗收條件新增**：
   - Twitter Card Validator 通過
   - Facebook Sharing Debugger 通過
   - LINE 手動測試預覽顯示圖片
   - `index.html` `<head>` 確實包含 5 個 meta tag

**行動項目**：PRD 調整（已完成）。

---

## Minor

### R3-m1. 0.B.1 對 Feature 1 測試條件的描述易誤解

**回應：接受，立即澄清。**

PRD v2.1 0.B.1 寫「若 Phase 1 Feature 1 已實作，加入 hash validation 測試」。但執行順序是批次 B → Phase 1，Feature 1 絕不可能「已實作」，這個條件永遠 false，實作者可能以為要 stub 出 hash 邏輯。

**處理方式**：

- 0.B.1 規格移除該條件列
- 下方加 quote block 澄清：批次 B 範圍僅限 `getAvailableHats()` + `t()`；hash validation 測試屬 Feature 1，應與程式碼一起加入；並列出完整的測試案例清單（含 Round 3 R3-m5 的 decode 失敗案例）

**行動項目**：PRD 調整（已完成）。

---

### R3-m2. CSP 缺少 `base-uri` / `form-action` / `frame-ancestors`

**回應：接受，同一個 commit 順便加。**

Defense in depth，零額外成本。

**處理方式**：0.A.2 CSP 規格加上：

- `base-uri 'self'` — 防 `<base>` tag 注入
- `form-action 'self'` — 雖然目前無 form，但防未來誤用
- `frame-ancestors 'none'` — 現代標準，與 `X-Frame-Options: DENY` 雙層防護（部分瀏覽器忽略 XFO）

**行動項目**：PRD 調整（已完成）。

---

### R3-m3. CSP `font-src` 缺少 `'self'`

**回應：接受。零風險防呆。**

目前所有字體來自 Google Fonts，但若未來改用 self-hosted 字體會被 CSP 阻擋。

**處理方式**：0.A.2 CSP `font-src` 改為 `'self' https://fonts.gstatic.com`。

**行動項目**：PRD 調整（已完成）。

---

### R3-m4. `history.replaceState` 清除 hash 時應保留 query string

**回應：接受。**

原規格 `history.replaceState(null, '', location.pathname)` 會把 UTM 參數一起清掉，影響 GA4 流量歸因。

**處理方式**：Feature 1 安全性規則改為 `history.replaceState(null, '', location.pathname + location.search)`。驗收條件新增：從 `/?utm_source=twitter#malicious` 進入時 hash 被清但 `?utm_source=twitter` 保留。

**行動項目**：PRD 調整（已完成）。

---

### R3-m5. Feature 1 未指定 hash decode 行為

**回應：接受。**

原規格沒明確 decode 流程。雖然現行 SPECIES id 都是 ASCII 小寫，實務上不會遇到 encoding 問題，但攻擊者可能用 `#%3Cscript%3E`（decoded 後是 `#<script>`）嘗試繞過 allowlist，且 malformed percent sequence 會讓 `decodeURIComponent()` throw `URIError`。

**處理方式**：

- Feature 1 安全性規則加入明確 decode 流程：`location.hash` 去 `#` → `decodeURIComponent()` → allowlist 比對
- decode 失敗視同驗證失敗（try/catch `URIError`）
- 測試案例加上 `#%3Cscript%3E` 和 `#%E0%A4%A`（malformed sequence）
- 驗收條件新增：`#%E0%A4%A` 觸發 `URIError` 但被接住，不開啟 modal

**行動項目**：PRD 調整（已完成）。

---

## 行動項目匯總

### 已完成（本回應的文件層）

- [x] PRD v2.2 → v2.3，依據加入 round3 review
- [x] 移除 M6 三幀動畫條目（R3-M1）
- [x] 0.A.2 CSP 規格更新：移除 `'unsafe-inline'`、補 `'self'` 到 font-src、加 `base-uri` / `form-action` / `frame-ancestors`（R3-M2 + R3-m2 + R3-m3）
- [x] 新增 0.A.6 rarity 按鈕 inline style 重構任務，block 0.A.2（R3-M2）
- [x] Feature 1 前置作業加 og:image meta tags 子項 + 規格區塊（R3-M3）
- [x] Feature 1 安全性規則加入 decodeURIComponent + 保留 query string（R3-m4 + R3-m5）
- [x] Feature 1 驗收條件加入對應測試點（R3-M3 + R3-m4 + R3-m5）
- [x] 0.B.1 澄清測試範圍（R3-m1）
- [x] 本回應文件

### 待辦（Phase 0 批次 A 實作階段）

- [ ] 0.A.1 抽離 inline GA4
- [ ] 0.A.6 Rarity inline style 重構（**必須在 0.A.2 之前**）
- [ ] 0.A.2 套用 security headers（含更新後的 CSP）
- [ ] 0.A.3 aria-live 修正
- [ ] 0.A.4 建立 root-level DESIGN.md（已完成於 buddyboard 分析回合）
- [ ] 0.A.5 GitHub repo topics（已完成於 buddyboard 分析回合）

### Round 4？

Round 3 reviewer 評估：若以上三個 Major + 五個 Minor 處理完，BuddyDex 具備開始 Phase 0 實作的條件；Round 4 不必要，除非實作過程中發現新 issue。本回應同意這個判斷。
