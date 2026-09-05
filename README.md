# HoldBook

Hedera Testnet 上的 ATS-first 股權生命週期驗證。資產 **NOVA** 完全虛構，
不代表真實股權、真人 KYC 或法律合規。

## 目前狀態

T00-min 已完成；**T01a 隔離診斷已執行，SDK readiness 仍 blocked**。
診斷分支 `diagnostic/t01a-sdk-load` 加入手動載入按鈕、安全狀態與測試，
保留依賴版本。Main 保留先前 shell；本分支尚不具備合併條件。
Production build 無法解析 `@hiero-ledger/proto`，瀏覽器載入遇到
`process is not defined`；原有 protobufjs／tar 風險也未解除。
完整結果見 [load diagnostic](docs/evidence/002-t01a-sdk-load.md)。
目前沒有 wallet integration、已建立的 Equity 或鏈上交易。

完整計畫見 [ATS-first plan](docs/plans/001-ats-first.md)，
接手請先讀 [AGENTS.md](AGENTS.md) 與 [HANDOFF](docs/HANDOFF.md)。

## 本機執行

需要 Node `24.19.0`、npm `11.17.0`。使用 nvm 時先執行 `nvm install`、
`nvm use`；若 npm 版本不符，執行 `npm install --global npm@11.17.0`。

```sh
npm ci
npm run dev
```

開啟 http://127.0.0.1:5173 ，在無秘密、無錢包的隔離瀏覽器手動按
「Load ATS SDK」。目前預期顯示失敗；不重試，reload 回到 idle。
不需要 `.env` 或 HBAR；不連接 RPC／Mirror Node。Dev server 僅綁定 localhost。

```sh
npm test
npm run typecheck
npm run build
```

本分支的 `npm run build` **目前失敗**。單獨執行 `npm run preview` 可於
http://127.0.0.1:4173 檢查失敗 build 留下的輸出，不算 production 驗收通過。
`npm test` 使用 Node 內建 runner、明示 module doubles 與 Vite／React server
renderer 檢查 loader/shell；unit success 不代表 SDK 真實載入成功。
GitHub Actions 在 main push／pull request 執行 clean install、test、typecheck、build，
不使用錢包、不部署網站、不發交易。

## 已知依賴風險

2026-09-05 重查仍為 78 個 npm audit 警示（17 low／32 moderate／27 high／
2 critical）。完整清單、實際安裝路徑與處理門檻見
[T01a triage](docs/evidence/001-t01a-triage.md)。這是依賴警示數量，不是
78 個已證實可利用的網站漏洞；目前不載入 ATS 也不是未來錢包流程的安全豁免。

Victor 已核准在風險未解時執行上述隔離診斷；依賴精確版本限制仍在。
沒有執行 override、升降版、polyfill 或全面批准安裝腳本。
不要執行 `npm audit fix --force`：其 ATS 1.13.0 建議會偏離固定的 8.0.0。
先解決 T01a，再另輪進行 T01b 的 MetaMask／config／VC 驗收。

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
