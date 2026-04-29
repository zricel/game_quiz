# 故事遊戲書 Story Game Book

一個可以建立互動式分支故事書的網站。使用者用 Google 帳號登入後，可以從預設版型開始，或從零建立自己的故事，編輯場景與選項，並即時試玩。

## 功能

- **Google 帳號登入**：使用 Google Identity Services。
- **多使用者支援**：每位登入者的故事獨立儲存（以 Google `sub` 為 key）。
- **預設版型**：附四個版型（奇幻冒險、懸疑推理、校園日常、科幻太空站），可一鍵套用後再修改。
- **分支故事編輯器**：
  - 場景、文字、選項、跳轉目標、起始場景設定
  - 場景重新排序（▲▼）、未連結場景警示
  - 封面樣式選擇、Ctrl/⌘+S 快捷儲存、未儲存指示與離站提示
- **書庫**：搜尋、複製、刪除、顯示更新時間。
- **匯出 / 匯入 JSON**：每本書可下載成 JSON，也可從檔案匯入。
- **即時試玩器**：可在編輯時直接試玩，或從書庫播放任何故事。
- **體驗模式**：未設定 Google Client ID 時，可用體驗模式在本機試用所有功能。
- **行動版**：支援漢堡選單與小螢幕排版。

> 資料儲存於瀏覽器 `localStorage`，目前沒有後端同步。匯出 / 匯入 JSON 可用於跨裝置備份。

## 快速開始

### 1. 取得 Google OAuth Client ID

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立或選擇一個專案。
3. 進入「API 和服務 → 憑證」。
4. 建立「OAuth 用戶端 ID」，類型選「網頁應用程式」。
5. 在「已授權的 JavaScript 來源」加入你部署網站的網域（本機開發可用 `http://localhost:8000`）。
6. 複製產生的 Client ID。

### 2. 設定 Client ID

打開 `index.html`，將以下兩個地方都換成你的 Client ID：

```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
     ...>
```

### 3. 本機啟動

這是純前端靜態網站，需要透過 HTTP 伺服器（不能用 `file://`）：

```bash
# Python 3
python3 -m http.server 8000

# 或 Node.js
npx serve .
```

開啟 <http://localhost:8000>。

## 部署到 Vercel

這是一個純靜態網站，沒有 build step，Vercel 會直接以根目錄上傳檔案。

### 方法 A：用 Vercel 網頁

1. 把這個 repo 推到 GitHub / GitLab / Bitbucket。
2. 到 <https://vercel.com/new> 點 **Import Project** 選你的 repo。
3. **Framework Preset** 選 `Other`，**Build Command** 留空，**Output Directory** 留空（根目錄）。
4. 按 **Deploy**。Vercel 會給你一個 `*.vercel.app` 網域。
5. 把那個網域加到 Google OAuth 的「已授權的 JavaScript 來源」（見下方）。

### 方法 B：用 Vercel CLI

```bash
npm i -g vercel
vercel        # 第一次：選帳號 / 建立 project，Framework 選 Other
vercel --prod # 推到 production
```

### Google OAuth 設定（部署後一定要做）

部署完成後，把 Vercel 給的網域加進 Google Cloud Console：

1. 進入「API 和服務 → 憑證 → 你的 OAuth Client」。
2. 在「已授權的 JavaScript 來源」加入：
   - `https://<your-project>.vercel.app`
   - 還有自訂網域（如果你綁了的話）
3. 把 `index.html` 裡的 `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` 換成你的 Client ID，commit 後 Vercel 會自動重新部署。

> 小提示：Google Sign-In 不允許 `localhost` 以外的 HTTP，必須是 HTTPS。Vercel 預設就有 HTTPS，不需要額外設定。

### Vercel 設定檔

`vercel.json` 已包含：
- `cleanUrls`：去掉 `.html` 後綴。
- 安全標頭：`X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`。
- CSS / JS 設為每次重新驗證快取，避免使用者載到舊版。

如果你要綁自訂網域，在 Vercel 專案的 **Settings → Domains** 設定即可。

## 檔案結構

```
.
├── index.html          頁面與視圖（登入 / 書庫 / 編輯器 / 試玩）
├── css/styles.css      樣式
├── js/
│   ├── auth.js         Google Sign-In 與使用者 session
│   ├── storage.js      localStorage 持久化（依使用者 ID 分組）
│   ├── templates.js    預設故事版型
│   ├── editor.js       分支編輯器
│   ├── player.js       試玩器
│   └── app.js          主控制器（路由 / 事件）
├── vercel.json         Vercel 部署設定（clean URLs、安全標頭）
├── .vercelignore       排除不上傳的檔案
└── README.md
```

## 資料模型

每本書的 JSON 形式：

```json
{
  "id": "book-xxxx",
  "title": "書名",
  "author": "作者",
  "cover": "t1",
  "startScene": "start",
  "scenes": {
    "start": {
      "id": "start",
      "title": "場景標題",
      "text": "場景內文…",
      "choices": [
        { "text": "選項文字", "next": "next-scene-id" }
      ]
    }
  }
}
```

選項的 `next` 留空（或指到不存在的場景）會被視為結局。

## 之後可以擴充

- 後端儲存（Firebase / Supabase / 自架 API）以跨裝置同步。
- 圖片 / 音樂 / 變數與條件分支。
- 公開分享連結與多人協作。
- 匯入 / 匯出 JSON。
