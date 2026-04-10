# Devil's Advocate Review — Round 3

> 審查日期：2026-04-10
> 對應回應：`docs/devils-advocate-response-round2.md`
> 對應 PRD 版本：`docs/prd.md` v2.1

---

## 總評

Round 2 的回應品質很高，幾乎所有 critical 和 major 都被正確處理：

- **R2-C1（CSP + inline GA4）**：處理順序正確（0.A.1 抽離 → 0.A.2 套用 CSP），驗收流程包含 Thufir `ga4_realtime` 確認。這是最關鍵的修正
- **R2-M1（hash validation）**：PRD Feature 1 已加入 allowlist 規則和具體惡意 hash 測試案例
- **R2-M2（Phase 0 分批）**：A/B/C 三批次清晰，i18n 拆分務實延後
- **R2-m2（三幀動畫）**：採用較簡的「保留資料 + 加註解」方案，scope 不擴張

Round 3 的發現多為實作細節，沒有 critical blocker。主要是 PRD v2.1 內部一致性問題和 CSP 的細節漏洞。

---

## Major

### R3-M1. PRD v2.1 第 296 行仍將 M6 列在 Phase 1 附帶修正

**來源**：`docs/prd.md:294-298` vs `docs/devils-advocate-response-round2.md:131-135`

response round 2 的 R2-m2 結論：

> 採用 reviewer 的第二個建議：直接刪除第三幀（或保留但在設計文件註明「預留給未來特殊動作」）。這樣 M6 從「新功能實作」降級為「死代碼清理」，不增加 Phase 1 scope。
> **行動項目**：M6 從 Phase 1 polish 移除，加入 `data/species.js` 檔案頂部註解。

`data/species.js:5-7` 確實已加上註解（見 commit 9653e5b），但 PRD v2.1 的 `Phase 1 附帶修正` 表格中仍然寫：

```
| 三幀動畫實作（偶爾觸發 frame 2）               | M6   |
```

這與 response round 2 的決策矛盾。實作 agent 可能照 PRD 的字面意思去實作 frame 2 動畫，做了不該做的事。

**建議方向**：從 PRD v2.1 的 Phase 1 附帶修正表格中刪除「三幀動畫實作」這一列，並在表格下方加註：「frame 2 已標記為保留未使用，見 `data/species.js` 頂部註解。」

---

### R3-M2. CSP `style-src 'unsafe-inline'` 是因為 render-detail.js 使用 element.style，可以透過小重構消除

**來源**：`docs/prd.md:84` CSP 設定 vs `js/render-detail.js:111-112`

PRD v2.1 的 CSP 中 `style-src` 包含 `'unsafe-inline'`：

```
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
```

`'unsafe-inline'` 在 style-src 中存在的原因，是 `js/render-detail.js:111-112` 的 rarity selector 用 JS 設定 inline style：

```js
button.style.borderColor = rarity.color;
button.style.color = rarity.color;
```

`element.style.x = value` 會設定 `style="..."` 屬性，這需要 `'unsafe-inline'` 才能通過 CSP。

**問題**：`'unsafe-inline'` 在 style-src 中雖然比在 script-src 中風險小，但仍然削弱了 CSP 的防禦深度。最大的問題是這是不必要的——rarity 顏色已經在 `css/tokens.css:14-19` 定義為 CSS 變數。

**建議方向**：用 data attribute + CSS class 取代 inline style。

`render-detail.js` 改為：

```js
button.classList.add("rarity-btn");
button.dataset.rarity = rarity.id; // 'common' / 'uncommon' / ...
```

`css/components.css` 加入：

```css
.rarity-btn[data-rarity="common"] {
  color: var(--rarity-common);
  border-color: var(--rarity-common);
}
.rarity-btn[data-rarity="uncommon"] {
  color: var(--rarity-uncommon);
  border-color: var(--rarity-uncommon);
}
.rarity-btn[data-rarity="rare"] {
  color: var(--rarity-rare);
  border-color: var(--rarity-rare);
}
.rarity-btn[data-rarity="epic"] {
  color: var(--rarity-epic);
  border-color: var(--rarity-epic);
}
.rarity-btn[data-rarity="legendary"] {
  color: var(--rarity-legendary);
  border-color: var(--rarity-legendary);
}
```

完成後，CSP 可以改為：

```
style-src 'self' https://fonts.googleapis.com;
```

**效益**：CSP 的 style 防禦完整，不再依賴 `'unsafe-inline'`。同時這也是更乾淨的 CSS 寫法，rarity 樣式集中在 CSS 而非散在 JS。

**位置**：可加入 Phase 0 批次 A，與其他 CSP 工作一起。或維持現狀並在 PRD 中註記為「已知 trade-off」，後續再優化。

**檢查其他 inline style 來源**：實作前用 `grep -n "\.style\." js/` 確認沒有其他 inline style 寫入點。從目前已讀的程式碼中，render-detail.js 是唯一一處。

---

### R3-M3. PRD 描述製作 og-image.png 但忘了在 index.html 加入 `<meta property="og:image">` tag

**來源**：`docs/prd.md:171-178` OG image 規格 vs `index.html` 現狀

PRD v2.1 詳細規範了 OG image 的尺寸、檔名、設計內容，但驗收條件只有：

> [ ] OG image 在社群平台分享時正確顯示（Twitter、Facebook、LINE 各測一次）

目前 `index.html:25-42` 有 `og:title`、`og:description`、`og:url`、`twitter:card` 等 meta tag，但**沒有 `og:image` 也沒有 `twitter:image`**。製作了 `og-image.png` 檔案但沒有在 HTML 中引用它，社群平台仍然不會顯示預覽圖。

**建議方向**：在 PRD Feature 1 前置作業加入第二個 sub-task：「在 `index.html` `<head>` 加入 og:image 相關 meta tags」。

具體規格：

```html
<meta property="og:image" content="https://buddydex.chatbot.tw/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta
  property="og:image:alt"
  content="BuddyDex — A field guide to Claude Buddies"
/>
<meta name="twitter:image" content="https://buddydex.chatbot.tw/og-image.png" />
```

驗收條件加上：

- [ ] 用 [Twitter Card Validator](https://cards-dev.twitter.com/validator) 驗證通過
- [ ] 用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 驗證通過
- [ ] LINE 分享預覽顯示圖片（手動測試或用 LINE Sharing Debugger）

---

## Minor

### R3-m1. Phase 0 批次 B 的測試規格中對 Feature 1 的條件描述容易誤解

**來源**：`docs/prd.md:128-130`

PRD v2.1 的 0.B.1 寫：

> - 單元測試：`js/i18n.js` 的 `t()` fallback 邏輯（當前語系缺 key 時回退到 en）
> - 若 Phase 1 Feature 1 已實作，加入 hash validation 的測試案例

執行順序定義：批次 A → 批次 B → Phase 1。所以 0.B.1 執行時 Feature 1 **絕不會**已實作。「若 Feature 1 已實作」這個條件永遠為 false，造成誤解：實作者可能以為要在 0.B.1 中先 stub 出 hash validation 邏輯。

**建議方向**：明確分離測試的歸屬：

```
- Phase 0 批次 B 包含：getAvailableHats() 測試 + t() fallback 測試
- hash validation 測試屬於 Feature 1，應該在 Feature 1 的實作中與功能一起加入
- Feature 1 完成後跑 `npm test`，新增的 hash 惡意測試案例應該全部通過
```

---

### R3-m2. CSP 缺少 `base-uri` 和 `form-action`（defense in depth）

**來源**：`docs/prd.md:84` CSP 設定

目前 CSP 涵蓋 default/script/style/font/img/connect 等常見指令，但缺少：

- `base-uri 'self'` — 防止 `<base>` tag 注入攻擊（透過注入 `<base href="evil.com">` 重導所有相對 URL）
- `form-action 'self'` — 限制 form 提交目的地（雖然網站目前無 form，但 defense in depth）
- `frame-ancestors 'none'` — 雖然 `X-Frame-Options: DENY` 已經防護，但 CSP 的 `frame-ancestors` 是現代標準，部分瀏覽器忽略 X-Frame-Options 而看 CSP

**建議方向**：在 PRD v2.1 的 0.A.2 CSP 中追加：

```
base-uri 'self'; form-action 'self'; frame-ancestors 'none';
```

完整 CSP 變為：

```
default-src 'self';
script-src 'self' https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com;
style-src 'self' https://fonts.googleapis.com;  // 移除 'unsafe-inline' 配合 R3-M2
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

優先序：低，但同一個 commit 一起加沒有額外成本。

---

### R3-m3. CSP `font-src` 缺少 `'self'`

**來源**：`docs/prd.md:84`

目前 `font-src https://fonts.gstatic.com` 沒有包含 `'self'`。雖然目前所有字體都來自 Google Fonts，但若未來加入 self-hosted 字體（例如為了效能或隱私將 JetBrains Mono 自己 host），字體會被 CSP 阻擋。

**建議方向**：改為 `font-src 'self' https://fonts.gstatic.com;`。零風險的防呆。

---

### R3-m4. `history.replaceState` 清除 hash 時應保留 query string

**來源**：`docs/prd.md:191`

PRD Feature 1 寫：

> 驗證失敗時：清除 hash（`history.replaceState(null, '', location.pathname)`）

`location.pathname` 不包含 query string。若使用者從帶 UTM 參數的連結進來（例如 `buddydex.chatbot.tw/?utm_source=twitter#malicious`），清除 hash 時會把 UTM 參數一起清掉，影響 GA4 流量歸因。

**建議方向**：改為 `history.replaceState(null, '', location.pathname + location.search)`，只清 hash，保留 path 和 query。

---

### R3-m5. Feature 1 未指定 hash decode 行為

**來源**：`docs/prd.md:182-194`

URL hash 中的字元若包含特殊字元，瀏覽器會自動 percent-encode。例如 `#中文` 會變成 `#%E4%B8%AD%E6%96%87`。從 `window.location.hash` 讀出來會是 `#%E4%B8%AD%E6%96%87` 還是 `#中文`，取決於瀏覽器。

目前 SPECIES id 都是英文小寫（duck、cat、dragon...），所以實務上不會遇到 encoding 問題。但若未來新增物種 id 用了非 ASCII 字元，或攻擊者故意傳入 `#%3Cscript%3E` 試圖繞過 allowlist 驗證（decoded 後是 `#<script>`），就需要明確的 decode 行為。

**建議方向**：在 Feature 1 的 hash validation 規則中加一句：

> - 從 `location.hash` 讀取後，先 `decodeURIComponent()` 再進入 allowlist 比對。decode 失敗（如 `decodeURIComponent('#%E0%A4%A')`）視同驗證失敗。

優先序：低。目前 SPECIES id 都是 ASCII，攻擊面有限，但寫清楚可省下未來的 debugging。

---

## Round 3 整體評估

Round 2 的回應品質明顯比 Round 1 高，已經內化了 reviewer 的思路，能主動考慮 sequencing、驗收方式、回滾。Round 3 的發現都是實作細節級別，沒有方向性問題。

**最重要的三個項目**：

1. **R3-M1**：PRD v2.1 移除 M6 三幀動畫的條目，避免 PRD 與 response 不一致導致實作偏差
2. **R3-M2**：透過 CSS data attribute 重構，從 CSP 中移除 `style-src 'unsafe-inline'`，這是一個小重構換顯著的安全性提升
3. **R3-M3**：補上 `og:image` meta tag，否則做了 OG image 也沒人看得到

若以上三項處理完，BuddyDex 就具備可以開始 Phase 0 實作的條件了。Round 4 應該不需要——除非實作過程中發現新的 issue。

---

## 沒有問題、做得好的地方

- Phase 0 批次 A 的順序設計（0.A.1 抽 GA → 0.A.2 套 CSP → 0.A.3 aria-live）邏輯清楚
- 0.A.2 驗收條件中要求用 Thufir `ga4_realtime` 確認，這是務實的端對端驗證
- Feature 1 的回滾條件具體可執行（5 個已知 hash 逐一測），不流於形式
- response round 2 行動項目匯總用 checkbox 標記進度，便於追蹤
- `data/species.js` 的 frames[2] 註解明確標示「currently unused」並引用 review 編號
