# Devil's Advocate Review Response — Round 2

> 回應日期：2026-04-10
> 對應審查：`docs/devils-advocate-review-round2.md`
> 上一輪回應：`docs/devils-advocate-response.md`（round 1）

---

## Critical

### R2-C1. CSP 會阻擋 inline GA4 script

**回應：接受，處理方案更新。**

Round 1 回應的 CSP 設定會直接破壞 GA4。採用 reviewer 推薦的方案 1：

**處理方式**：

1. 新建 `js/analytics.js`，將 `index.html:9-17` 的 inline GA4 初始化代碼抽出
2. `index.html` 改用 `<script type="module" src="js/analytics.js"></script>`（GA4 的 gtag 本身也是外部 script，不受影響）
3. CSP 維持 `script-src 'self' https://www.googletagmanager.com`

**驗收流程**（加入 Phase 0 行動項目）：

- 部署後用 Chrome DevTools Network tab 確認 `https://www.google-analytics.com/g/collect?...` 請求正常送出
- 用 Thufir 的 `ga4_realtime` 確認有即時數據進入
- Console 無 CSP 違規警告

**順序**：必須先做 analytics.js 抽離，**再**套用 CSP headers。否則中間會有一段時間 GA 失效。

**行動項目更新**：Phase 0 任務 0.3（security headers）拆分為：

- 0.3a：抽離 inline GA4 script 到 `js/analytics.js`
- 0.3b：驗證 GA4 正常運作
- 0.3c：套用 CSP 和其他 security headers
- 0.3d：部署後驗證

---

## Major

### R2-M1. URL hash 是使用者輸入，XSS 風險被低估

**回應：完全接受。這是 round 1 的盲點。**

URL hash 確實是使用者可控輸入，round 1 的回應錯誤地假設「移除搜尋功能等於沒有使用者輸入」。

**處理方式**：

1. PRD Feature 1 功能規格加入 hash validation 規則
2. 實作時強制使用 allowlist（`SPECIES.find(s => s.id === hashValue)`）
3. 驗證失敗時：清除 hash、關閉 modal、console warning
4. 任何從 hash 衍生的字串不得進入 `innerHTML`
5. 測試案例加入惡意 hash：`#<script>`、`#duck"><img src=x>`、`#'; alert(1); //` 等

**行動項目**：更新 PRD Feature 1 規格。

---

### R2-M2. Phase 0 範圍過大，有「前置作業陷阱」風險

**回應：接受，Phase 0 分批。**

reviewer 的洞察很對：i18n 拆分（0.1）是最大的一塊，但急迫性沒有想像中高。Feature 3（教學指南）新增的翻譯 key 估計 < 30 個，現有 755 行 → 850 行左右，仍可接受。

**Phase 0 重新分批**：

#### 批次 A：立即交付（當天可完成）

- 0.3a 抽離 inline GA4 script → `js/analytics.js`
- 0.3c-d security headers + CSP + 驗證
- 0.4 aria-live 修正
- 0.5 設計文件措辭修正（見 R2-M3）
- 0.6 CHANGELOG 比較連結（已完成於上個 commit）
- 0.7 設計文件加註（已完成於上個 commit）

#### 批次 B：小批次（1-2 天）

- 0.2 package.json + Vitest + 1-2 個單元測試（getAvailableHats、t() fallback）
- CI workflow（最小版本：push to main 跑 `npm test`）

#### 批次 C：延後（Phase 1 之後再評估）

- 0.1 i18n 拆分 — **延後**。Feature 3 新增的翻譯 key 不會讓檔案爆炸，拆分的收益不足以阻擋 Phase 1 開始

**行動項目**：更新 PRD Phase 0 的任務分批。

---

### R2-M3. 設計文件頂部措辭與內容矛盾

**回應：接受，立即修正。**

將 `docs/plans/2026-04-02-buddydex-design.md:4` 的 "All design decisions in this document have been implemented" 改為 reviewer 建議的措辭。

**行動項目**：修正設計文件頂部。

---

### R2-M4. response.md 與 PRD v2.0 的 Feature 編號不一致

**回應：接受。**

在 `docs/devils-advocate-response.md`（round 1）頂部加註說明：功能編號以 PRD v2.0 為準，round 1 中提到的 Feature 4 即為 PRD v2.0 的 Feature 2。

**行動項目**：修正 round 1 回應文件的 header。

---

## Minor

### R2-m1. OG image 規格未定義

**回應：接受。**

**處理方式**：

- Phase 1 前置作業：做一張**通用** OG image（1200x630）
- 設計方向：深色背景 + BuddyDex logo + 3-4 隻代表性 buddy（Duck、Cat、Dragon、Capybara）的 ASCII art + 標語
- 製作工具：直接寫 HTML/CSS 然後 screenshot，或用 Figma
- Per-species OG image **放 Phase 2**，若 Phase 1 分享功能的 GA4 數據顯示流量可觀再做

**行動項目**：PRD Feature 1 前置作業加上通用 OG image 規格。

---

### R2-m2. 三幀動畫頻率沒有 UX 根據

**回應：接受，改採「刪除死代碼」方案。**

採用 reviewer 的第二個建議：直接刪除第三幀（或保留但在設計文件註明為「預留給未來特殊動作」）。這樣 M6 從「新功能實作」降級為「死代碼清理」，不增加 Phase 1 scope。

更傾向：**保留資料但不刪除**，在 species.js 的檔案頂部註解加上「frames[2] reserved for future special actions, currently unused」。18 隻 x 5 行 x 12 字元 ≈ 1KB，不值得為了 1KB 改動檔案結構。

**行動項目**：M6 從 Phase 1 polish 移除，加入 `data/species.js` 檔案頂部註解。

---

### R2-m3. Phase 1 沒有回滾計畫

**回應：部分接受，簡化版。**

reviewer 的完整回滾計畫（GA4 bounce rate 監控）對 side project 過重。簡化版：

**回滾觸發條件**：

- 部署後 Chrome DevTools 開啟線上站，發現 JS 錯誤或畫面破版
- Thufir `ga4_realtime` 顯示 active users 連續 30 分鐘為 0（可能被 CSP 打爆或被 hash validation 阻擋）
- 手動測試 5 個已知 hash（`#duck`、`#cat` 等）任一失敗

**回滾操作**：

```bash
git revert <commit-sha>
git push
npx vercel --prod
```

不修改 branch history，保留 revert 紀錄。

**行動項目**：PRD Feature 1 加入回滾條件。

---

## 行動項目匯總

### 立即修正（文件層）

- [x] 建立本 round 2 回應文件
- [ ] 修正設計文件頂部措辭（R2-M3）
- [ ] 修正 round 1 回應中的 Feature 編號註記（R2-M4）
- [ ] 更新 PRD：Phase 0 分批、Feature 1 加 hash validation + OG image 規格 + 回滾條件
- [ ] `data/species.js` 頂部註解說明 frames[2] 用途

### Phase 0 批次 A（程式碼層）

- [ ] 0.3a 抽離 inline GA4 → `js/analytics.js`
- [ ] 0.3c 套用 CSP + 其他 security headers
- [ ] 0.3d 部署後驗證 GA4 正常
- [ ] 0.4 修正 aria-live 過度觸發

### Phase 0 批次 B

- [ ] 0.2 package.json + Vitest + 基本測試 + CI workflow

### 延後

- 0.1 i18n 拆分 — 移至 Phase 1 後評估
- M6 三幀動畫 — 改為檔案註解，不實作
