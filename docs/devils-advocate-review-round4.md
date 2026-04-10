# Devil's Advocate Review — Round 4

> 審查日期：2026-04-10
> 審查對象：Phase 0 Batch A 上線（commits 43b83b5, 59dad2e, ebf61bd, 5579970）
> 驗證方式：chrome-devtools-mcp 對 `https://buddydex.chatbot.tw/` 線上驗證

---

## 總評

Round 3 的三個 Major 項目（CSP inline script、URL hash XSS、OG image meta）中，**R3-M2（CSP hardening）和 R3-m2/m3（CSP 補強）已完美上線並線上驗證通過**。令人意外的是 coding agent 在實作過程中主動發現 `js/render-detail.js` 的 body scroll lock 也在寫 inline style（`body.style.top = ...`），這原本不在 R3-M2 的指定範圍內，但若不處理 CSP 就會破功。此類主動性是高品質工程的表現。

但這個未計畫中的重構引入了一個 **Critical** 級別的瀏覽器相容性問題。

---

## 線上驗證結果（chrome-devtools-mcp）

**已驗證 PASS：**

- `gtag.js` 載入成功（200）
- Google Fonts 載入成功
- 無 inline `<script>`（CSP script-src 不需 `'unsafe-inline'`）
- 嘗試透過 `document.createElement('script') + textContent` 注入 inline script **被 CSP 阻擋** — CSP 強制執行中
- Rarity 按鈕使用 `data-rarity` attribute，顏色透過 CSS 套用：common → `rgb(176,176,176)`、legendary → `rgb(251,191,36)`，對應 `--rarity-*` token
- Rarity 按鈕 `getAttribute('style')` 為 null — inline style 已完全清除
- Aria-live announcer 正確觸發：切換 Legendary 時 `#detail-announce` 文字為 `"稀有度: 傳說"`
- 關閉 modal 時 announcer 被清空
- Scroll lock 透過 `document.adoptedStyleSheets` 注入 `body.scroll-locked { top: 0px; }`，unlock 時清空
- Modal 開關流程無 JS 錯誤、無 CSP violation（`securitypolicyviolation` event listener 捕獲 0 筆）
- Hash routing 尚未實作（URL 設為 `#duck` 不開啟 modal）— 符合 Phase 0 範圍

**尚需人工驗證：**

- GA4 `collect` 請求返回 **503**（兩筆：scroll 和 page_view 事件）— 詳見 R4-M2

---

## Critical

### R4-C1. 新的 scroll lock 實作會在 Safari < 16.4 / iOS < 16.4 讓整個網站崩潰

**來源**：`js/render-detail.js:11-16`（commit 59dad2e 引入）

目前的實作在模組頂層：

```js
const scrollLockSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, scrollLockSheet];
```

這兩行在 `import` render-detail.js 時立即執行，若 `new CSSStyleSheet()` 丟出 exception，**整個模組載入失敗**，`main.js` 的 `import` 會同步失敗，首頁變成完全無法互動（卡片點擊沒反應、語言切換沒反應、整站 JS 初始化中斷）。

**Constructable CSSStyleSheets 瀏覽器支援**：

| 瀏覽器           | 最低版本  | 發布日期    |
| ---------------- | --------- | ----------- |
| Chrome           | 73+       | 2019-03     |
| Edge             | 79+       | 2020-01     |
| Firefox          | 101+      | 2022-05     |
| **Safari / iOS** | **16.4+** | **2023-03** |

**對目標受眾的影響**：

BuddyDex 支援 5 語系（en / zh-TW / zh-CN / ja / ko），四個為 CJK，iOS 在 台灣、日本、韓國、香港的市佔率都相當高。iOS 16.0、16.1、16.2、16.3 以及所有 iOS 15 以下版本的使用者會看到：

- 首頁卡片正常顯示（HTML + CSS 沒壞）
- 點擊卡片**完全無反應**
- 切換語言**完全無反應**
- 整站 JS 失效

這比 R3-M2 處理前的「CSP 會關掉 GA」還嚴重得多——至少 GA 失效使用者還能用網站，scroll lock 崩潰等同 site-wide outage。

**原本 R3-M2 的建議只針對 rarity 按鈕的 inline style**，沒有要求一起改 scroll lock。coding agent 的主動發現是對的（否則 CSP 套用後 modal 開啟會立即噴 CSP 警告），但選擇的實作路徑（constructable stylesheet）引入了新的 regression。

**建議方向（擇一）**：

**方案 1（推薦）：Feature detection + graceful fallback**

```js
let scrollLockSheet = null;
try {
  scrollLockSheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [
    ...document.adoptedStyleSheets,
    scrollLockSheet,
  ];
} catch {
  // Older browser — accept scroll jump on modal open as trade-off
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

效果：舊瀏覽器 fallback 為 `body.scroll-locked { position: fixed; width: 100% }`（不帶 dynamic top），modal 開啟時畫面跳到頂部，關閉時 `window.scrollTo(0, scrollY)` 恢復。有可見的 UX 瑕疵但網站可用。

**方案 2：改用 `html { overflow: hidden }` 完全避開 position: fixed**

```css
html.scroll-locked {
  overflow: hidden;
}
```

```js
function lockBodyScroll() {
  document.body.dataset.scrollY = String(window.scrollY);
  document.documentElement.classList.add("scroll-locked");
}

function unlockBodyScroll() {
  const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
  document.documentElement.classList.remove("scroll-locked");
  delete document.body.dataset.scrollY;
  window.scrollTo(0, scrollY);
}
```

效果：完全不需要動態 top，沒有任何 JS inline style。相容性優（`overflow: hidden` 在所有現代瀏覽器都支援）。需要人工驗證 iOS Safari 的 rubber-band scrolling 不會穿透 modal —— 這正是原本採用 `position: fixed` 方案的原因，必須測試。

**驗收條件**：

- [ ] 在 Safari 15 / iOS 15 上測試 modal 開啟、關閉、捲動
- [ ] 或在 Chrome DevTools 設定 User-Agent 為 iOS 15 並透過 `Object.defineProperty(window, 'CSSStyleSheet', { value: undefined })` 模擬舊瀏覽器，確認 fallback 路徑執行
- [ ] 加入單元測試：`new CSSStyleSheet` 失敗時，`openDetail()` 仍可正常呼叫

**優先序**：**最高**。這是 site-wide regression，建議在今天內修正並重新部署。

---

## Major

### R4-M1. `window.gtag` 在 module 版本中沒有被設為全域，未來的 custom event tracking 會失效

**來源**：`js/analytics.js:12-14` vs `window.gtag` 的實際值

線上驗證：

```js
typeof window.gtag; // "undefined"
```

原因：module 內的 `function gtag()` 是 module-scoped，不會自動掛到 `window`。

**影響**：

- 目前的 `config` 和 `js` 事件**正常運作**，因為 gtag.js loader 會 hook `window.dataLayer.push()`，凡是 push 到 dataLayer 的事件都會被處理
- 線上 `dataLayer.length === 5`，其中包含 `["js", ...]` 和 `["config", ...]`，以及 gtag.js 自己 push 的內部事件
- **但是**：Phase 1 Feature 1 的分享功能若需要 track「buddy_shared」custom event，按標準寫法會呼叫 `gtag('event', 'buddy_shared', {...})`。這個 `gtag` 是哪個？
  - 從 analytics.js 外部呼叫 → `window.gtag` → `undefined` → ReferenceError
  - 從 analytics.js 內部呼叫 → module 內的 `gtag` → 可以
- 結果：未來寫 custom event tracking 時會踩雷，debug 困難（事件靜默失敗）

**建議方向**：

在 `js/analytics.js` 末尾加一行：

```js
window.gtag = gtag;
```

或者改用 `dataLayer` 直接 push 作為 convention：

```js
window.dataLayer.push(["event", "buddy_shared", { species: "duck" }]);
```

前者符合 GA4 官方文件所有範例，後者較 module-friendly。擇一即可，但要在 README 或 analytics.js 註解中說明團隊選擇哪一種，避免將來混用。

**優先序**：中。現在不修不會壞事，但 Phase 1 Feature 1 實作時若沒注意會踩雷。建議現在就加 `window.gtag = gtag;` 一行，零成本防呆。

---

### R4-M2. GA4 `collect` 端點回傳 503，需要乾淨環境驗證

**來源**：chrome-devtools-mcp network 紀錄

兩筆 POST 到 `https://www.google-analytics.com/g/collect?...` 均回傳 **503 Service Unavailable**：

```
POST .../collect?...en=scroll&epn.percent_scrolled=90  → 503
POST .../collect?...en=page_view                        → 503
```

然而 console 沒有任何 CSP violation，`connect-src 'self' https://www.google-analytics.com` 設定正確，所以不是 CSP 阻擋。

**可能原因**：

1. **瀏覽器擴充套件攔截**（最可能）：測試環境的 Chrome 有 `chrome-extension://elbkchakmaiinadjpnmdgpflpjogpgmb/content_script.js` 持續活動，這類內容 script 通常來自廣告攔截器或隱私保護擴充套件，攔截 tracking requests 時常用 503 讓 client 快速 fail
2. Google 後端暫時故障（較不可能，全球性）
3. 區域限流（較不可能）

**建議驗收步驟**（對應 PRD 0.A.2 的「Thufir `ga4_realtime` 顯示即時數據正常」驗收條件）：

- [ ] 用無擴充套件的瀏覽器（Chrome incognito with extensions disabled）重新測試
- [ ] 在 Thufir `ga4_realtime` 觀察 2026-04-10 的 active users 數字是否非零
- [ ] 若乾淨環境仍 503，進一步排查（可能是 Vercel 的 response 被某層攔截）

**優先序**：中。若只是擴充套件問題，GA4 對真實訪客是正常運作的，無需修正。但**必須用 Thufir 確認**，不能假設。

---

## Minor

### R4-m1. PRD v2.3 的 0.A.6 只提到 rarity 按鈕，未納入 scroll lock 重構

**來源**：commit 59dad2e message vs PRD `0.A.6` 描述

commit 訊息明確說：

> R3-M2 only called out the rarity writes; the scroll-lock writes were uncovered by `grep -n "\.style\." js/` during implementation, and had to be refactored too

這是很棒的主動發現（而且 R3-M2 的驗收條件正好要求執行 `grep`），但 PRD v2.3 的 0.A.6 spec 只描述了 rarity 按鈕的重構，沒有記錄 scroll lock 的變更。導致：

- 文件和實作脫節
- 未來 reviewer 看 PRD 不會知道為什麼 scroll lock 突然用 `adoptedStyleSheets`
- R4-C1 的 Safari 相容性問題沒有在任何 PRD 的風險評估中出現

**建議方向**：

更新 PRD v2.3 的 0.A.6，加入 sub-section：

> **額外重構（實作中發現）**：`body.style.top / .position / .width` 寫入也會觸發 CSP `style-src 'unsafe-inline'` 需求。改用 constructable CSSStyleSheet + `document.adoptedStyleSheets` 動態注入 `body.scroll-locked { top: -${scrollY}px; }`。已知限制：需要 Chrome 73+ / Firefox 101+ / Safari 16.4+，舊瀏覽器需 feature detection fallback（見 R4-C1）。

同時在 CHANGELOG 的 Unreleased 加註：

> **Known issue**: Detail modal requires Safari 16.4+ / iOS 16.4+ due to constructable CSSStyleSheet usage in scroll lock. Fallback to be added in next release.

---

### R4-m2. Phase 1 Feature 1 的 hash decode 確認需要 `decodeURIComponent`

**來源**：線上測試結果

設定 `location.hash = '#<script>alert(1)</script>'` 後：

- `window.location.hash` 回傳 `"#%3Cscript%3Ealert(1)%3C/script%3E"`（瀏覽器自動 percent-encode）
- `decodeURIComponent(window.location.hash)` 回傳 `"#<script>alert(1)</script>"`

這確認了 R3-m5 的擔憂。Feature 1 實作時必須：

```js
const raw = location.hash.slice(1); // "duck" or "%3Cscript%3E..."
let decoded;
try {
  decoded = decodeURIComponent(raw);
} catch {
  // Malformed percent-encoding (e.g. '%E0%A4%A') — reject
  console.warn("[buddydex] invalid hash encoding, ignoring");
  return;
}
const matched = SPECIES.find((s) => s.id === decoded);
if (!matched) {
  console.warn("[buddydex] unknown species id in hash:", decoded);
  return;
}
// allowlist passed, safe to use matched.id
```

PRD v2.3 的 Feature 1 規格應該把這段 pseudo-code 直接嵌入，避免實作者走捷徑。

**優先序**：低。這是 Phase 1 才會遇到的問題，Phase 0 尚無影響。但現在寫進 PRD 不用等到 Feature 1 實作時才 review。

---

## Round 4 整體評估

Phase 0 Batch A 的實作品質整體**高於預期**，coding agent 展現了三個良好習慣：

1. **主動發現範圍外的問題**（scroll lock inline style），而不是機械地執行 reviewer 指定的清單
2. **嚴格的執行順序**（0.A.1 → 0.A.6 → 0.A.2），避免中間態 CSP 把 GA 或 modal 弄壞
3. **commit 訊息引用 review ID**（R3-M2、R3-m2、R3-m3）讓變更可追溯

但也出現了一個典型的主動發現副作用：**選擇的解法（constructable stylesheet）比 reviewer 指定的範圍更激進，引入了新的瀏覽器相容性 regression**。這不是 coding agent 的錯（它解決了正確的問題），而是 review-then-implement 循環中典型的盲點——reviewer 沒預見 scroll lock 也需要改，所以沒在 R3 討論過解法。

**最急迫**：R4-C1 的 Safari fallback 必須今天修復，否則 iOS 16.3 以下使用者看到 site-wide outage。

**次急迫**：R4-M2 用 Thufir `ga4_realtime` 確認 GA4 真的有在收資料，避免悄無聲息地失效一週才發現。

其他都是小事，可以併入下一個 commit 批次一起處理。若 R4-C1 修好、R4-M2 驗證 GA 正常，Phase 0 Batch A 就可以正式劃為「完成」，安心進入 Batch B（測試 + CI）。
