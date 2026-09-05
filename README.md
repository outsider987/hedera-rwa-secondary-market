# HoldBook

Hedera Testnet 上的 ATS-first 股權生命週期驗證。資產 **NOVA** 完全虛構，
不代表真實股權、真人 KYC 或法律合規。

## 目前狀態

T00-min 已完成；**T01a 真實 SDK 載入已通過，依賴安全門檻仍 blocked**。
診斷分支 `diagnostic/t01a-sdk-load` 補上 proto 2.25.0、Vite 8 browser polyfills
與受限環境／日誌 adapters，保留既定 framework／ATS／Node/npm pins。
Production build、dev／有效 preview 的桌面與手機載入均通過。
Main 保留先前 shell；Draft PR 的存在不表示安全風險已解除或 T01b 已啟動。
完整結果見 [remediation evidence](docs/evidence/004-t01a-remediation.md)；
[先前失敗診斷](docs/evidence/002-t01a-sdk-load.md) 保留作歷史證據。
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
「Load ATS SDK」。預期顯示 loaded 與尚未驗證 network／wallet 的提示。
一次只載入一次，reload 回到 idle 且不自動重送。
不需要 `.env` 或 HBAR；不連接 RPC／Mirror Node。Dev server 僅綁定 localhost。

```sh
npm test
npm run typecheck
npm run build
```

成功 build 後執行 `npm run preview`，於 http://127.0.0.1:4173 檢查正式輸出。
`npm test` 使用 Node 內建 runner、明示 module doubles 與 Vite／React server
renderer 檢查 loader/shell；unit success 不代表 SDK 真實載入成功。
GitHub Actions 在 main push／pull request 執行 clean install、test、typecheck、build，
不使用錢包、不部署網站、不發交易。

## 已知依賴風險

2026-09-05 本輪 audit 為 83 個套件警示（22 low／32 moderate／27 high／
2 critical），原為 78 個。新增 5 個 low 是 polyfill 路徑上的 elliptic
風險聚合項；high／critical 數量不變，不代表已修復。
[前後完整清單](docs/evidence/004-t01a-audit-comparison.json)、
[原風險分類](docs/evidence/001-t01a-triage.md) 與
[bundle membership](docs/evidence/004-t01a-bundle.json) 均保留。
這是套件警示數量，不是已證實可利用的網站漏洞數量。

Victor 已核准上述兩個 exact 新依賴與必要 browser adapters；沒有執行
override、SDK 升降版或批准安裝腳本。載入成功不構成漏洞豁免。
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
