# Devil's Advocate Review Response — Round 4

> 回應日期：2026-04-10
> 對應審查：`docs/devils-advocate-review-round4.md`
> 上一輪回應：`docs/devils-advocate-response-round3.md`
> 更新後 PRD 版本：`docs/prd.md` v2.4

---

## 總評

Round 4 抓到 Round 3 的一個盲點：coding agent 在實作 0.A.6（rarity inline style 重構）時主動發現 `js/render-detail.js` 的 iOS scroll lock 也在寫 inline style，擴大了重構範圍。這個擴大動作本身正確（不做 CSP 就會 break），但選擇的實作路徑（`new CSSStyleSheet()` + `adoptedStyleSheets`）在 Safari < 16.4 / iOS < 16.4 會在 module 頂層就 throw，導致**整個 `render-detail.js` 模組載入失敗，連帶站內所有 JS 初始化中斷**。對 BuddyDex 的 CJK 市場（台灣、日本、韓國、香港 iOS 市佔高）是 site-wide outage 級別的 regression。

Round 4 另外找到：

- `window.gtag` 未掛全域，Phase 1 Feature 1 若要 track 分享事件會 ReferenceError
- Round 3 response 的 PRD 更新沒有把 scroll lock 重構納入 0.A.6 規格（文件 / 實作脫節）
- GA4 `collect` 端點回傳 503（瀏覽器擴充攔截，不是我們的 bug，但需 Thufir 確認）
- Feature 1 hash decode 的實作細節應該嵌入 PRD 避免未來實作者走捷徑

全部接受並處理，無延後。

---

## Critical

### R4-C1. scroll lock 實作在 Safari < 16.4 / iOS < 16.4 會讓整個網站崩潰

**回應：完全接受。已立即修復。**

Round 3 原本只指定 rarity 按鈕重構，但 0.A.6 驗收條件要求執行 `grep -n "\.style\." js/`，grep 暴露出 scroll lock 的 6 處 inline style（`close()` 裡 3 處 + `openDetail()` 裡 3 處）。如果不一併處理，0.A.2 套用 CSP 後 modal 開啟會立即噴 CSP 違規並且 scroll 位置會跳掉。所以 coding agent 的擴大範圍是正確的。

問題出在選擇的 workaround 機制：

```js
// 原本寫法（commit 59dad2e） — module 頂層無保護呼叫
const scrollLockSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, scrollLockSheet];
```

Safari < 16.4 會在 `new CSSStyleSheet()` 丟 `TypeError: Illegal constructor`，module import 同步失敗，`main.js` 的 `import("./render-detail.js")` 拋 exception，整個初始化停擺。首頁可見 HTML + CSS 但完全無法互動。

**修復方式（commit 待會兒 push）**：Feature detection + graceful fallback。

```js
let scrollLockSheet = null;
try {
  scrollLockSheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [
    ...document.adoptedStyleSheets,
    scrollLockSheet,
  ];
} catch {
  // Older browser — graceful fallback
}

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.dataset.scrollY = String(scrollY);
  if (scrollLockSheet) {
    scrollLockSheet.replaceSync(`body.scroll-locked { top: -${scrollY}px; }`);
  }
  document.body.classList.add("scroll-locked");
}
```

`css/detail-controls.css` 裡的靜態規則 `body.scroll-locked { position: fixed; width: 100%; }` 已經存在，舊瀏覽器進入 fallback 後仍然會 lock 住 scroll（只是失去 dynamic `top` offset，modal 開啟時視覺會有一瞬 scroll jump 到頂部，關閉時 `window.scrollTo(0, savedY)` 恢復）。UX 瑕疵但站可用。

**選擇 feature detection 方案 1 而不是方案 2（`html { overflow: hidden }`）的原因**：方案 2 需要重新驗證 iOS Safari rubber-band scrolling 不會穿透 modal，這正是當初採用 `position: fixed` 方案的主要動機。方案 1 保留 modern browsers 的既有行為（已在 Phase 0 Batch A 上線驗證過），只針對舊瀏覽器降級，風險最低。

**驗收條件**：

- [x] 程式碼修改（commit 待 push）
- [ ] 部署後用 `chrome-devtools-mcp` 跑 `javascript_tool`，執行 `Object.defineProperty(window, 'CSSStyleSheet', { get() { throw new Error(); } })`，reload，確認 render-detail.js 仍能 import 成功、modal 仍能開啟
- [ ] 人工測試 Safari 15 或透過 Safari User-Agent 模擬
- [ ] 更新 CHANGELOG 的 Unreleased / 下一個 patch 版記錄此修復

**優先序**：**已立即修復**，在本回應的 commit 中同時 push。

---

## Major

### R4-M1. `window.gtag` 在 module 版本中沒有被設為全域

**回應：接受，零成本修復。**

`js/analytics.js` 的 `function gtag()` 是 module-scoped，外部呼叫 `window.gtag(...)` 會得到 `undefined`。目前 `gtag('config', ...)` 和 `gtag('js', ...)` 正常運作是因為 gtag.js loader 會 hook `window.dataLayer.push()`，但 **Phase 1 Feature 1 若要 track「buddy_shared」custom event**，按 GA4 官方範例寫法會呼叫 `gtag('event', 'buddy_shared', {...})`，module 外呼叫會靜默失敗。

**修復**：`js/analytics.js` 尾段加一行：

```js
window.gtag = gtag;
```

選這個方案而不是「caller 改用 `dataLayer.push(['event', ...])` convention」的原因：GA4 官方文件所有範例都用 `gtag()` 形式，未來讀者（包括 copy/paste 範例的我自己）會自然寫 `gtag(...)`。把它掛在 `window` 上是最低認知成本的防呆。

**行動項目**：已完成（commit 待 push）。

---

### R4-M2. GA4 `collect` 端點回傳 503

**回應：已驗證為瀏覽器擴充攔截，非 BuddyDex 問題。**

Round 4 reviewer 指出線上驗證時看到兩筆 `POST /g/collect?...` 回 503。我在同一次驗證也看到這個現象。但緊接著呼叫 `mcp__thufir__ga4_realtime`，回應為：

```json
{ "rowCount": 1, "rows": [{ "metrics": ["1"] }] }
```

Thufir 看到的 active user = 1，就是我自己的瀏覽 session。所以**GA4 後端有收到資料**，只是瀏覽器那邊的 Network tab 回 503。原因基本確認為瀏覽器擴充（廣告攔截器或隱私保護擴充）攔截 tracking requests 時常用假 503 讓 client 快速 fail，但實際請求仍然到達 Google 邊緣節點。

**行動項目**：不修正，在本回應文件記錄為「已驗證非我方 bug」。Phase 0 批次 A 驗證條件「Thufir ga4_realtime 顯示即時數據正常」已通過。

---

## Minor

### R4-m1. PRD v2.3 的 0.A.6 只提到 rarity 按鈕，未納入 scroll lock 重構

**回應：接受。PRD v2.4 已補。**

0.A.6 spec 新增第 4 點描述 scroll lock 重構的範圍、使用的技術（constructable `CSSStyleSheet` + `adoptedStyleSheets`）、瀏覽器相容性需求、feature detection 強制條款，以及驗收條件新增 fallback 路徑測試。

**行動項目**：已完成。

---

### R4-m2. Phase 1 Feature 1 的 hash decode 參考實作應該嵌入 PRD

**回應：接受。PRD v2.4 已補完整 pseudo-code。**

Feature 1 的安全性規則區塊原本只列了文字規格，Round 4 建議嵌入可直接複製的參考實作。已加入 `parseHashSpecies()` 函式範例，包含：

- `startsWith("#")` 前綴處理
- 空字串短路（`return null`）
- `try { decodeURIComponent } catch { URIError }` 的 malformed percent-encoding 處理
- `SPECIES.find()` allowlist 比對
- Caller 端的 `history.replaceState(null, '', location.pathname + location.search)` 保留 query string

Feature 1 實作時直接對應這段 pseudo-code 即可，命名規範保留調整空間。

**行動項目**：已完成。

---

## 行動項目匯總

### 已完成（本回應的程式碼 + 文件層）

- [x] R4-C1 `js/render-detail.js` scroll lock feature detection + fallback
- [x] R4-M1 `js/analytics.js` 尾段 `window.gtag = gtag`
- [x] R4-m1 PRD v2.4 的 0.A.6 補 scroll lock 規格 + 相容性強制條款
- [x] R4-m2 PRD v2.4 的 Feature 1 補 `parseHashSpecies()` 參考實作
- [x] 本回應文件
- [x] R4-M2 Thufir 確認：GA4 正常（已完成於 Phase 0 批次 A 驗證階段）

### 待辦（部署後）

- [ ] `chrome-devtools-mcp` 覆核：
  - 正常環境 `scrollLockSheet !== null`，modal 開關 scroll 位置正確
  - 模擬 `CSSStyleSheet` 失敗，確認 fallback 路徑仍可開 modal 且站點 JS 正常載入
- [ ] `window.gtag` 是 function typeof

### Round 5？

- 若 R4-C1 的 Safari fallback 上線驗證通過，Phase 0 正式劃句點，Phase 1 開始
- Round 5 不預期必要。若 Feature 1 實作過程中發現新 issue 再開
