# BuddyDex Phase 1 產品需求文件（PRD）

> 版本：1.0
> 日期：2026-04-09
> 狀態：草稿
> 依據：`docs/research/encyclopedia-benchmarks.md` Phase 1 路線圖

---

## 概述

Phase 1 聚焦於「快速見效」的功能，以最小工時提升核心體驗並帶動自然流量。

## 技術限制（全域）

- 純前端靜態網站，不引入後端或資料庫
- 使用者狀態僅存 localStorage
- 須支援 5 語系（en / zh-TW / zh-CN / ja / ko）
- 遵守現有無障礙標準（ARIA、focus 管理、`prefers-reduced-motion`）
- 每個功能獨立 commit，不混合

---

## Feature 1：搜尋與篩選系統

### 目標

讓使用者能快速定位特定物種，並依條件探索物種庫。

### 使用者故事

- 身為使用者，我想透過輸入名稱來快速找到特定 buddy，這樣我不用從 18 張卡片中逐一尋找。
- 身為使用者，我想按物種名稱排序，這樣我可以用字母順序瀏覽。

### 功能規格

1. **即時搜尋框**
   - 放在 Species section title 旁邊
   - 輸入文字即時篩選卡片（模糊匹配物種名稱，支援當前語系）
   - 空白時顯示全部
   - placeholder 文字隨語系切換

2. **排序**
   - 預設：依 species data 原始順序（即編號）
   - 可切換：名稱字母序（依當前語系排序）

### 驗收條件

- [ ] 搜尋框輸入「cat」顯示 Cat，輸入「貓」顯示貓（zh-TW 模式下）
- [ ] 搜尋無結果時顯示空狀態提示文字
- [ ] 排序切換後卡片動態重排
- [ ] 搜尋框有 `aria-label`，結果區有 `aria-live="polite"` 通知篩選結果數量
- [ ] 語系切換後搜尋框 placeholder 更新

### 預估工時

M（中）

---

## Feature 2：分享功能

### 目標

讓使用者能分享特定 buddy 給朋友或社群，帶動自然流量。

### 使用者故事

- 身為使用者，我想複製一個連結直接開啟某隻 buddy 的詳細頁，這樣我可以分享給朋友。
- 身為行動裝置使用者，我想用系統原生分享選單分享 buddy。

### 功能規格

1. **URL hash 路由**
   - 開啟 `buddydex.chatbot.tw/#duck` 自動打開 Duck 的 detail modal
   - 開啟 detail modal 時自動更新 URL hash
   - 關閉 modal 時清除 hash
   - 支援瀏覽器前進/後退

2. **複製連結按鈕**
   - 在 detail modal 內，物種名稱旁加一個鏈結圖示按鈕
   - 點擊後複製完整 URL 到剪貼簿
   - 顯示短暫的「已複製」回饋（tooltip 或 toast）

3. **Web Share API（行動裝置）**
   - 偵測 `navigator.share` 支援
   - 支援時顯示「分享」按鈕，觸發原生分享選單
   - 不支援時 fallback 到複製連結

### 驗收條件

- [ ] 直接造訪 `#duck` URL 可開啟 Duck detail modal
- [ ] 瀏覽器返回鍵可關閉 modal
- [ ] 複製連結按鈕正確複製 URL 並顯示回饋
- [ ] 行動裝置上 Web Share API 正常觸發
- [ ] 所有按鈕有適當的 `aria-label`

### 預估工時

S（小）

---

## Feature 3：Buddy 自訂教學指南

### 目標

教使用者如何自訂 Claude Buddy 的名稱、人格描述和回覆語言。

### 使用者故事

- 身為 Claude Code 使用者，我想知道如何改變 buddy 的名字，這樣我可以給牠一個有意義的名稱。
- 身為非英語使用者，我想讓 buddy 用我的母語回覆，這樣互動體驗更好。

### 功能規格

1. **教學內容 section**
   - 放在 mechanics section 下方，Species grid 上方
   - 或作為獨立的摺疊區塊（accordion），預設收合
   - 三個主題：
     - 修改名稱：編輯 `~/.claude.json` 中 companion `name` 欄位
     - 修改人格：編輯 `personality` / `description` 欄位
     - 修改語言：在 personality 加入語言偏好指示

2. **內容限制**
   - 僅說明使用者可編輯的 soul layer 欄位
   - 不涉及 bones layer 內部機制（hash、PRNG 等）
   - 附上脫敏的 JSON 結構範例
   - 提醒：外觀（species、rarity）每次 session 重算，不可手動修改

3. **多語系**
   - 教學文字需翻譯至 5 語系
   - JSON 範例保持英文

### 驗收條件

- [ ] 教學內容在 5 個語系下正確顯示
- [ ] 教學區塊可收合/展開
- [ ] JSON 範例使用 `<code>` 區塊且等寬字體
- [ ] 不洩漏系統敏感資訊（hash salt、PRNG 種子等）

### 預估工時

S（小）

---

## Feature 4：隨機探索按鈕

### 目標

增加探索趣味性，讓使用者發現意想不到的 buddy。

### 使用者故事

- 身為使用者，我想按一個按鈕就隨機看到一隻 buddy 的詳細資訊，這樣我可以無目的地探索。

### 功能規格

1. **按鈕位置**
   - 放在 Species section title 旁邊（與搜尋框同行）
   - 骰子圖示 🎲 或文字按鈕

2. **行為**
   - 點擊後隨機選一隻 buddy，打開其 detail modal
   - 更新 URL hash
   - 連續點擊不重複上一隻（除非只剩一隻符合篩選條件）

### 驗收條件

- [ ] 按鈕點擊打開隨機 buddy 的 detail modal
- [ ] 連續兩次點擊不會出現同一隻
- [ ] 按鈕有 `aria-label` 和鍵盤可操作
- [ ] 按鈕文字隨語系切換

### 預估工時

S（小）

---

## 優先順序

| 順序 | 功能                 | 工時 | 依賴          |
| ---- | -------------------- | ---- | ------------- |
| 1    | 分享功能（URL hash） | S    | 無            |
| 2    | 隨機探索按鈕         | S    | 依賴 URL hash |
| 3    | 搜尋與篩選           | M    | 無            |
| 4    | Buddy 自訂教學指南   | S    | 無            |

分享功能優先，因為 URL hash 路由是其他功能（隨機探索）的基礎，且能直接帶動自然流量。
