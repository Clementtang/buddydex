# Devil's Advocate Review — Round 2

> 審查日期：2026-04-10
> 對應回應：`docs/devils-advocate-response.md`（2026-04-09）
> 對應 PRD 版本：`docs/prd.md` v2.0

---

## 總評

整體回應誠實且有判斷力，不是敷衍式的「全部接受」。以下幾個決策品質良好：

- 搜尋功能移至 Phase 2（C2 回應）— 正確判斷
- Phase 0 的概念：技術債先清再堆功能
- PRD v2.0 加入 persona 和研究報告差異說明
- Phase 1 Done 定義 + GA4 觀察期的紀律

但下列問題需要在實作前處理。

---

## Critical

### R2-C1. CSP 會阻擋 index.html 的 inline GA4 script，部署後 GA 會失效

**來源**：response.md M4 的處理方案

response.md 中的 CSP 設定為：

```
script-src 'self' https://www.googletagmanager.com
```

但 `index.html:9-17` 有一段 inline `<script>` 用來初始化 `dataLayer` 和 `gtag()`：

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-1CTR65SW2P");
</script>
```

這段 inline script 既沒有 `nonce` 也沒有 hash，CSP 會直接阻擋。結果：部署後 GA4 完全停止運作，但表面上沒有錯誤訊息（只有 console warning）。

**建議方向（擇一）**：

1. **推薦**：將 GA 初始化代碼抽到 `js/analytics.js`，在 `index.html` 用 `<script type="module" src="js/analytics.js">` 載入。CSP 只需要 `script-src 'self' https://www.googletagmanager.com`。
2. 或在 CSP 中使用 nonce：`script-src 'self' 'nonce-{random}' https://www.googletagmanager.com`，每次部署生成新的 nonce。Vercel 靜態站較難做到。
3. **不建議**：使用 `'unsafe-inline'`，這會讓 CSP 對 script 失去主要保護作用。

**驗收**：Phase 0 完成後，開啟 DevTools Network tab 確認 `collect?v=2&...` 請求仍然正常送出到 google-analytics.com。

---

## Major

### R2-M1. Phase 1 Feature 1 的 URL hash 是未受信任輸入，response 低估了 XSS 風險

**來源**：response.md M1 回應

response.md M1 寫：「Phase 1 已移除搜尋功能（見 C2 回應），短期內不會引入使用者輸入文字，風險可接受。」

但 Phase 1 Feature 1 的 URL hash 路由就是使用者可控的輸入。`window.location.hash` 的值完全由使用者決定。攻擊情境範例：

```
https://buddydex.chatbot.tw/#<img src=x onerror=alert(1)>
```

如果 Feature 1 的實作中有類似 `info.innerHTML = \`<h2>${hash}</h2>\`` 的路徑（例如顯示「正在載入 ${id}」的 loading state），就會觸發 XSS。

雖然 PRD v2.0 在技術限制中加了「使用者輸入不經過 innerHTML」的規則，但回應本身沒有意識到 URL hash 就是使用者輸入，實作者可能會忽略這個面向。

**建議方向**：在 PRD Feature 1 的功能規格中明確加入：

- `window.location.hash` 視為不受信任的輸入
- 從 hash 讀取的 species id 必須用 allowlist 驗證（僅接受 `SPECIES.find(s => s.id === hashValue)` 存在的值）
- 驗證失敗時：清除 hash，關閉 modal，記錄 console warning（不顯示錯誤給使用者）
- 任何從 hash 衍生的字串都不得直接進入 `innerHTML`

**驗收**：在測試中加入惡意 hash 測試案例（`#<script>`、`#duck"><img src=x>` 等）。

---

### R2-M2. Phase 0 範圍過大，有「前置作業陷阱」風險

**來源**：response.md 行動項目匯總

Phase 0 目前包含 7 個項目：

| 項目                             | 工時評估 | 複雜度 |
| -------------------------------- | -------- | ------ |
| 0.1 i18n 拆分 + 動態 import      | L        | 高     |
| 0.2 package.json + Vitest + 測試 | M        | 中     |
| 0.3 GitHub Actions CI            | S        | 低     |
| 0.4 security headers             | S        | 低     |
| 0.5 aria-live 修正               | S        | 中     |
| 0.6 CHANGELOG 修正               | XS       | 低     |
| 0.7 設計文件修正                 | XS       | 低     |

0.1（i18n 拆分）是最大的一塊，涉及：

- 修改 `js/i18n.js` 的核心載入邏輯
- 所有同步呼叫 `t()` 的地方可能需要處理非同步
- 語系切換時的 loading state（目前切換是瞬時的，改用動態 import 後會有 network latency）
- rerender 時機需要重新設計（目前 `main.js:55-64` 的 `rerender()` 假設翻譯資料已就緒）

風險：Phase 0 變成一個無法交付的大 task，Phase 1 永遠不開始。

**建議方向**：

1. **立即交付批次**（今天就可做完）：0.3 security headers（注意 R2-C1）、0.6 CHANGELOG、0.7 設計文件修正
2. **小批次**：0.4 aria-live、0.5 CI（單純加 workflow 檔）
3. **獨立 task**：0.2 測試基礎建設（先加 package.json + Vitest + 1-2 個測試，不追求覆蓋率）
4. **最大塊**：0.1 i18n 拆分 — 評估是否真的要在 Phase 1 前做。若 Phase 1 不會大量新增翻譯 key，可延後到 Phase 1 後處理。

**關鍵問題**：Phase 1 Feature 3（教學指南）會新增多少翻譯 key？若只有 10-20 個，直接加到現有 `data/i18n.js` 也不會讓檔案從 755 行變成 2000 行。i18n 拆分的急迫性可能沒有想像中高。

---

### R2-M3. 設計文件頂部措辭與實際內容矛盾

**來源**：response.md m8 處理方案

`docs/plans/2026-04-02-buddydex-design.md:4` 仍然寫：

> All design decisions in this document have been implemented.

但第 42-43 行已經用刪除線標注了兩個被省略的設計（rarity badge、filter by rarity）。「全部已實作」與「部分已省略」直接矛盾。

**建議方向**：將第 4 行改為：

> Most design decisions have been implemented. Items marked with ~~strikethrough~~ were omitted during implementation — see inline notes for reasons.

---

### R2-M4. response.md 與 PRD v2.0 的 Feature 編號不一致

**來源**：response.md 行動項目匯總 vs PRD v2.0

- PRD v2.0 將功能重新編號為 Feature 1（分享）、Feature 2（隨機探索）、Feature 3（教學指南）
- response.md 第 78 行仍寫：「Phase 1 Done 的最小條件：Feature 1（分享）+ Feature 4（隨機探索）上線」
- response.md 第 220 行行動項目匯總中將隨機探索標為「PRD Feature 4」

Feature 4 是舊 PRD v1.0 的編號。雖然是同一個功能，但編號不一致會在未來溝通中造成混淆（特別是給 coding agent 下指令時）。

**建議方向**：更新 response.md 中所有「Feature 4」為「Feature 2」，與 PRD v2.0 對齊。或者在 response.md 頂部加註：「功能編號以 PRD v2.0 為準，本文件保留原 round 1 編號作為歷史紀錄。」

---

## Minor

### R2-m1. Feature 1 的 OG image 規格未定義

**來源**：PRD v2.0 Feature 1 前置作業

PRD 提到「製作 1200x630 OG image」但沒有定義：

- 設計內容是什麼？（logo + 幾隻代表性 buddy？純 ASCII 風格？還是圖像風格？）
- 製作工具？（手動設計還是程式生成？）
- 是否需要 per-species 的動態 OG image（例如 `#duck` 分享時顯示 Duck 的 OG image）？

**建議方向**：將 OG image 製作獨立為一個子 task，明確規格。若決定做 per-species OG image，需要額外評估：

- Vercel 支援 `@vercel/og` 動態生成，但純靜態站可能需要預先生成 18 張
- 預先生成 18 張的維護成本：新增 species 時要手動補 OG image

目前建議先做一張通用 OG image（BuddyDex logo + 3-4 隻代表性 buddy），per-species OG image 放 Phase 2。

---

### R2-m2. 三幀動畫的觸發頻率沒有 UX 根據

**來源**：response.md M6 處理方案

response.md M6 寫：「idle 循環 0→1→0→1... 每隔 5 次循環插入一次 frame 2。」

目前動畫間隔是 800ms，5 次循環 ≈ 4 秒觸發一次特殊動作。這個節奏是否合理沒有任何 UX 根據。過於頻繁會打擾，過於稀疏看不到。

**建議方向**：這是小事，實作時 A/B 比較（3 次 vs 5 次 vs 8 次）後再定案。但建議移出 Phase 1 polish，改為 Phase 2 或 backlog。M6 原本就是「死代碼清理」等級的問題，不需要在 Phase 1 塞新動畫邏輯。

另一個選項：直接刪除第三幀，在設計文件中註明為「預留給未來特殊動作，目前不使用」。這樣就回到「刪除死代碼」的簡單方案。

---

### R2-m3. Phase 1 沒有回滾計畫

**來源**：PRD v2.0 Phase 1 Done 定義

PRD 有 Phase 1 Done 的定義，但沒有提到若 Feature 1（分享功能）上線後發現問題如何回滾。URL hash 路由是一個破壞性變更——若實作有 bug，現有使用者的書籤可能失效。

**建議方向**：在 PRD Feature 1 加入回滾條件：

- 若上線後 24 小時內 GA4 bounce rate 飆升超過基準值 20%，立即 revert commit
- 回滾操作：`git revert <commit>` + `vercel --prod`
- 不要修改 branch history，保留 revert 紀錄

這是保守建議，個人專案可以不做到這個程度，但 URL 結構變更值得一個明確的 rollback plan。

---

## Round 2 整體評估

Round 1 的 critical 和 major 絕大多數已經被接受並排入行動項目。Round 2 主要是補洞：

1. **CSP + inline script 的互動是最急迫的 blocker**（R2-C1）— 若不處理，Phase 0 的 security headers 部署後會立即破壞 GA
2. **URL hash 是使用者輸入**（R2-M1）— 實作 Feature 1 前必須在規格中明確標注
3. **Phase 0 需要分批交付**（R2-M2）— 避免 i18n 拆分變成前置作業陷阱
4. 其餘是措辭、編號、規格細節的補強

若 Phase 0 能分批、CSP 問題在部署前解決、Feature 1 規格中加入 hash validation，Round 3 就不太需要了。
