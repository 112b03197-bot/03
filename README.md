# 遠距醫療掛號與線上看診管理系統 (Telehealth Link)

本系統是一套基於 **React 19**、**Vite**、**Tailwind CSS**、以及 **Express / Node.js** 伺服器並整合 **Gemini AI 健保卡 OCR 辨識**與 **Firebase** 架構設計的完整遠距通訊診療管理系統。

---

## 🚀 系統功能特點

### 1. 病患端 (Patient Portal)
* **智慧註冊登錄**：提供健保卡相片拖曳/點選上傳，並透過伺服器端 **Gemini 3.5-flash 多模態 AI 模組**，自動安全辨識健保卡上的 **姓名** 與 **身分證字號** 並自動填寫。
* **線上掛號預約**：依據科別（家醫科、小兒科、內科、皮膚科）選擇對應醫師，查看並預約時段（上午、下午、晚間診）完成掛號。
* **預約管理**：查詢預約看診，並隨時取消未看診之預約。
* **視訊看診診間**：當天一鍵進入高強度端對端視訊會議室，包含即時視訊/音訊狀態切換、病患即時心率偵測、資安加密通道、以及系統即時對話視窗。
* **歷程與病歷追蹤**：看診完畢後，隨時點閱查看主治醫師開立之電子病歷、處方箋明細。

### 2. 醫護端 (Clinician Portal)
* **就診看板佇列**：即時查看今日預約掛號的所有病患。
* **過卡複查**：醫師可直接調閱由病患上傳的健保卡高解析度影像，進行姓名和身分對應。
* **看診與病歷存取**：醫師可在視訊診療中點選「撰寫病歷」，記錄主訴、專業診斷、衛教、並線上開立健保給付處方箋儲存歸檔。

### 3. 最高管理員端 (Admin Console)
* **就診用戶管理**：全局檢索所有病患與醫護人員，並可彈性切換其權限角色（病患、醫師、管理員）或登銷帳戶。
* **執配醫師管理**：線上新增執業醫師、配置科別、職銜、專業簡歷，自動配置看診時段。
* **統計數據儀表板**：直觀的數據卡顯示（累積人次、完診率），附帶精心刻畫的 **SVG 圓餅圖** 與 **每日掛號預約折線趨勢線**。

---

## 🔑 預設測試帳號一覽 (測試用)

為方便一鍵體驗，系統內建提供三種身份之測試帳號捷徑。您可於登入畫面直接點選，或手動輸入以下電子郵箱登入：

1. **病患測試帳號 (Patient)**
   * 電子郵箱：`patient@telehealth.com`
   * 真實姓名：王小明 (已預先登錄健保卡 OCR 身分)
2. **醫護端測試帳號 (Doctor)**
   * 電子郵箱：`doctor@telehealth.com`
   * 醫師姓名：林志豪 主任醫師 (家醫科)
3. **系統管理員帳號 (Administrator)**
   * 電子郵箱：`admin@telehealth.com`
   * 名稱：醫療系統管理員

---

## 📂 系統資料夾架構 (Folder Tree)

```text
/
├── .env.example            # 環境變數設定範例
├── netlify.toml            # Netlify 部署重定向規則
├── firestore.rules         # Hardened Firestore 安全存取控制規則
├── firebase-blueprint.json # 雲端資料庫資料模型結構描述
├── package.json            # 依賴模組與啟動 lifecycle scripts
├── server.ts               # Express.js + Vite 中間件 + Gemini OCR 影像處理伺服器
├── tsconfig.json           # TypeScript 編譯器選項
├── vite.config.ts          # Vite 綁定器設定 (停用 HMR 避免抖動)
├── index.html              # 單頁面核心 HTML 模板
└── src/
    ├── main.tsx            # 全局 React Entry Point
    ├── App.tsx             # 核心路由調度與權限層
    ├── index.css           # Tailwind + 客製 Inter / Mono 字型與動畫
    ├── types.ts            # 全局 TypeScript 類型聲明字庫
    ├── services/
    │   ├── mockData.ts     # 預設臨床資料與測試帳號
    │   └── dataService.ts  # 結合持久化儲存 LocalStorage / Firebase 控制層
    └── components/
        ├── PatientRegister.tsx   # 病患註冊、健保卡 Drag-drop 與 Gemini OCR 辨識
        ├── PatientDashboard.tsx  # 病患掛號、診表預約、電子病歷處方單查看
        ├── DoctorDashboard.tsx   # 醫師門診清單、身分複查、診斷與處方開立
        ├── AdminDashboard.tsx    # 全局看盤、權限升降、護理師與新醫師登錄、SVG 計量儀
        └── VirtualConsultation.tsx # Immersive 端對端視訊看診診間、對話與信號狀態機
```

---

## 🛠️ 本地開發安裝與執行 (Local Setup)

### 步驟一：安裝專案依賴

```bash
npm install
```

### 步驟二：配置環境變數

在根目錄建立 `.env` 檔案，或確保您的雲端 Secrets 中包含：

```env
# GEMINI_API_KEY: 用於處理健保卡照片 OCR 自動填表
GEMINI_API_KEY="您的_GEMINI_API_KEY"
```

### 步驟三：啟動開發伺服器

```bash
npm run dev
```
啟動後，瀏覽器開啟 `http://localhost:3000` 即可登入使用！

### 步驟四：生產編譯與啟動

```bash
# 編譯 React 靜態資源並以 Esbuild 綁定單一 server.cjs 檔
npm run build

# 啟動生產伺服器
npm start
```

---

## ☁️ Firebase 與 Netlify 部署指南

### 1. 雲端 Firebase 設定
本專案已精確編寫安全規則為 `firestore.rules`。
當您要在 Firebase Console 啟用該專案時：
1. 在 Firebase Console 建立專案並加入 Firestore Database。
2. 啟用 Authentication（支援 Email 登入。可快速將 Email 改為預設測試信箱）。
3. 前往 `firestore.rules` 將本專案的 Fortress 規則貼入。
4. 當前系統使用 `localStorage` 作為高流暢一秒體驗數據庫。要啟用真實 Firebase Cloud：可以直接在 `src/services/dataService.ts` 下連接您的 Firebase SDK Config 貼入。

### 2. 部署至 Netlify
專案根目錄附帶有 `netlify.toml`。
1. 前往 [Netlify 平台](https://www.netlify.com/) 新增 Site 並與 GitHub 關聯。
2. 系統會自動檢測並採用 `netlify.toml`：
   * Build 指令：`npm run build`
   * 釋出路徑：`dist`
3. 在 Netlify Site Settings -> Environment Variables 內加入 `GEMINI_API_KEY` 環境變數。
4. 部署成功後即可完成自動多重跳頁防範及重導向！
