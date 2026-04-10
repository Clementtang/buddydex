# Buddy Board 競品分析

> 調查日期：2026-04-10
> 競品：https://buddyboard.xyz/（repo: https://github.com/TanayK07/buddy-board）
> 作者：TanayK07
> 首次發現：2026-04-03（repo 建立日），在 BuddyDex 之後約一天

## TL;DR

Buddy Board 與 BuddyDex 都源自 Claude Code 的 `/buddy` 機制，但定位互補：

| 面向     | Buddy Board                           | BuddyDex                |
| -------- | ------------------------------------- | ----------------------- |
| 核心功能 | 社交 leaderboard + 競技 + 卡片分享    | 圖鑑 / 參考 / 瀏覽      |
| 使用門檻 | 高（需 `npx buddy-board` 提交、驗證） | 零（直接瀏覽）          |
| 技術棧   | Next.js + Supabase + Vercel + CLI     | 純靜態 HTML/CSS/JS      |
| 法律姿態 | 「忠實重製 Claude Code 機制」         | 「原創 ASCII 同人藝術」 |
| 命名     | 自稱 Buddy Board，dex 子頁叫 BuddyDex | 主站 BuddyDex           |

**結論**：兩站不構成競爭，但共享 "buddydex" 關鍵字的 Google SERP。短期 SEO 會互相干擾，長期互補。

---

## 關鍵事實

### 專案狀態（2026-04-10）

- Repo 建立：2026-04-03
- 最後推送：2026-04-04（6 天未動）
- Stars：5，Forks：0，Issues：1 open
- 無 LICENSE 檔（README 宣稱 MIT 但檔案不存在）
- Leaderboard 實際提交數：**32**（非用戶最初觀察的 100+）
- 物種發現進度：**14/18**（Goose 後一個 mystery、Penguin、Axolotl、Chonk 仍為 "???"）

### 功能盤點

1. **CLI-first 提交流程**
   - `npx buddy-board` 讀 `~/.claude.json`
   - 用 Mulberry32 PRNG hash 出 species/rarity/stats（宣稱「same algorithm as Claude Code itself」）
   - Supabase RPC 提交，bcrypt token 認證
   - 選配 GitHub 驗證 + org 隸屬

2. **五維 Stats 系統**
   - Debugging / Patience / Chaos / Wisdom / Snark
   - 每項 0–100
   - Total Stats 為五項總和（例：DeDuck legendary = 361，Vexcap epic = 282）
   - **關鍵**：Stats 是 Claude Code `/buddy` 本身就有的屬性，BuddyDex 目前完全沒做

3. **Leaderboard**
   - 32 筆提交，以 total stats 排序
   - 可依單項 stat、rarity、age 排序
   - species/rarity 篩選
   - Organization grouping（`originautonomy` 是目前唯一有人用的 org）

4. **per-user / per-card 分享頁**
   - `/u/{username}` — 個人頁
   - `/card/{username}` — 卡片頁
   - `/org/{orgname}` — 團隊頁
   - 使用 `@vercel/og`（Satori）生成 1200x675 PNG

5. **BuddyDex 子頁（`/dex`）**
   - 18 格 grid，每格 ASCII + 名稱 + discovery count
   - **無描述、無稀有度、無篩選**
   - 未發現物種顯示為 "???" 並 grayed out
   - CTA 導向 leaderboard 首頁

6. **視覺系統**
   - 深色（#0c0c0c）+ 終端綠（#4ade80）
   - Legendary holographic shimmer（rainbow gradient sweep，4s loop）
   - Scanlines overlay 全卡
   - Rarity glow（rare+）
   - 字體：Satoshi（display）+ Instrument Sans（body）+ JetBrains Mono（stats/ASCII）

### 設計文件

- `DESIGN.md` 位於 repo root（非 docs 子目錄）
- 完整 design system：colors / typography / spacing / motion / rarity visual treatments
- Decisions Log table（date / decision / rationale）
- 承認靈感來源：poke-holo.simey.me、github-readme-stats、githubcard.com

---

## 原始觀察核對（BuddyDex 專案發起人）

| #   | 原始觀察                    | 驗證結果                                                                                   |
| --- | --------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Reddit 搶先發佈、專屬域名   | 確認                                                                                       |
| 2   | GitHub 佈置比 BuddyDex 完整 | 部分成立。有 DESIGN.md、CLAUDE.md、proper topics，但無 LICENSE 檔（宣稱 MIT），已 6 天未動 |
| 3   | 沒用 "buddydex" 這個名字    | **錯**。他們的物種目錄子頁就在 `/dex`，nav 內稱為 BuddyDex                                 |
| 4   | 100 多個上傳                | **錯**。實際 32 筆。14/18 物種發現是正常進度                                               |
| 5   | Org 機制沒用                | 確認。只有一個 org 有人用                                                                  |

---

## 可借鑒項目（評估）

| #   | 項目                        | 評估                                                                                            | 納入                     |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | 五維 Stats 系統             | Claude Code 本身就有，BuddyDex 缺了這塊內容。補上可強化 mechanics section 完整性                | PRD Feature 4            |
| 2   | Root-level DESIGN.md        | 獨立 design system 文件對外部閱讀友善，BuddyDex 的 plan doc 定位是歷史紀錄不適合當 living ref   | 直接執行（新檔）         |
| 3   | Legendary holographic foil  | 已在 Phase 2 backlog，buddyboard 的 CSS 實作可作參考（`::before` scanline + `::after` shimmer） | Phase 2 backlog 補註記   |
| 4   | Decisions Log table         | 可併入 DESIGN.md 或 CHANGELOG，低成本高價值                                                     | DESIGN.md 底部           |
| 5   | Mulberry32 algorithm 文件化 | 若 BuddyDex 定位為 canonical reference，應記錄 Claude Code 實際演算法                           | Phase 2 backlog（新項）  |
| 6   | GitHub repo topics          | 純 GitHub SEO，零成本                                                                           | 直接執行（gh repo edit） |

### 應刻意避開

| 項目                     | 原因                                                        |
| ------------------------ | ----------------------------------------------------------- |
| Supabase / 後端          | BuddyDex 純靜態是戰略優勢（零營運成本、零密鑰、零 RLS bug） |
| CLI 提交流程             | 提高使用門檻，限縮 persona 3（路過好奇者）                  |
| Org / Leaderboard / 社交 | PRD v2 已明確排除                                           |
| "未發現物種" disclosure  | 提交量成長時會光速耗盡，機制撐不住                          |

---

## 差異化策略

### 定位

- **Buddy Board** = 社交 / 競技 / 要提交（高摩擦、低瀏覽、活躍度未證實）
- **BuddyDex** = 參考 / 瀏覽 / 不用帳號（低摩擦、高發現、內容深度）

### SEO / 品牌

1. **不改名**。buddyboard 提交動能停滯（5 stars、6 天未推），不構成命名生存威脅
2. **強化 "field guide / encyclopedia / 圖鑑" 語意**在 H1、meta description、og:description。避開 "leaderboard / trading cards / competitive" 字眼
3. **友善互補連結**：README 首段加上「complementary to buddyboard.xyz」，可換取對方 backlink 的機會（長期互惠）

### 內容深度作為護城河

Buddy Board 的 `/dex` 只有 ASCII + 名稱 + count。BuddyDex 的 detail modal 有：

- 描述 / 風味文字
- 5 種稀有度 + 對應 stat floor
- 6 種眼睛 + 8 種帽子 + shiny
- 即時 try-on
- 5 語系 i18n
- Accessibility（ARIA、focus trap、prefers-reduced-motion）

這些都是 buddyboard 短期不會做的方向（他們往社交走）。**內容深度就是差異化**，不需要刻意防守。

---

## 後續行動

詳見 `docs/prd.md` v2.2 更新。
