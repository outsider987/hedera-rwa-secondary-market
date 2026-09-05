# HoldBook

Hedera Testnet 上的 ATS-first 股權生命週期驗證。資產 **NOVA** 完全虛構，
不代表真實股權、真人 KYC 或法律合規。

## 目前狀態

T00-min：專案規則、交接文件與最小英文 React 驗證台。
目前沒有 wallet integration、已建立的 Equity 或鏈上交易。ATS SDK 已鎖版，
尚未 import；shell 能 build 不代表 ATS 已可於瀏覽器運作。

完整計畫見 [ATS-first plan](docs/plans/001-ats-first.md)，
接手請先讀 [AGENTS.md](AGENTS.md) 與 [HANDOFF](docs/HANDOFF.md)。

## 本機執行

需要 Node `24.19.0`、npm `11.17.0`。使用 nvm 時先執行 `nvm install`、
`nvm use`；若 npm 版本不符，執行 `npm install --global npm@11.17.0`。

```sh
npm ci
npm run dev
```

開啟 http://127.0.0.1:5173 。T00 不需要 `.env`、錢包或 HBAR，
也不會連接 RPC／Mirror Node。Dev server 僅綁定 localhost。

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

Production preview：http://127.0.0.1:4173 。`npm test` 使用 Node 內建 runner
與既有 Vite／React server renderer 驗證 shell 內容；它不是 MetaMask／ATS 測試。
GitHub Actions 在 main push／pull request 執行 clean install、test、typecheck、build，
不使用錢包、不部署網站、不發交易。

## 已知依賴風險

固定的 ATS 相依圖有 78 個 npm audit 警示（含 2 個 critical）；目前 T00 不載入
ATS，不代表未來 wallet integration 已獲安全驗證。詳細依賴路徑、測試與 CI
證據見 [T00 validation](docs/evidence/000-t00-validation.md)。不要執行
`npm audit fix --force` 偷換 ATS 版本；T01 必須先評估相容的處理方式。

## 第一階段

Admin（兼 Escrow／測試 VC issuer）、Seller、Buyer 三個獨立 MetaMask 帳戶，
由 Victor 逐筆核准簽署：建立 NOVA → Seller KYC → Issue 100 → Hold 10 →
未 KYC Buyer 被拒 → Buyer KYC → Execute 6 → Release 4。

只做 localhost 驗證台，不做 Go、資料庫、撮合、付款腿或公開網站部署。
預設資料不等於鏈上狀態；交易證據尚不存在。

## 來源與透明度

- 本地工作從空目錄開始；使用者提供過先前 agent 的規劃文字，來源與
  尚未確認的賽前研究問題記錄於 [planning record](docs/prompts/001-planning-record.md)。
- 第三方套件與 AI 協作記錄：[AI_USAGE.md](AI_USAGE.md)。
- 專案尚未選定授權；public repo 不等於對本專案授予開源使用授權。
- ETHOnline 資格仍依主辦審核；不因新建 repo 或省略賽前檔案而自動符合。

請勿將私鑰、助記詞、wallet 檔案、API tokens 或含秘密的 prompts 加入 repo。
