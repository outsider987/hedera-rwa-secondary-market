# HoldBook

Hedera Testnet 上的 ATS-first 股權生命週期驗證。資產 **NOVA** 完全虛構，
不代表真實股權、真人 KYC 或法律合規。

## 目前狀態

T00-min 已完成；**T01a 停在依賴修補界線（blocked）**。
已保存完整 audit 與 critical/high 分類，確認 ATS 的間接依賴精確鎖定受影響
的 protobufjs 版本，無法只靠上游允許範圍內更新修掉。尚未改動依賴或加入
SDK 載入按鈕；等待 Victor／mentor 的明確處理決策。
目前沒有 wallet integration、已建立的 Equity 或鏈上交易。ATS SDK 已鎖版、
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

2026-09-05 重查仍為 78 個 npm audit 警示（17 low／32 moderate／27 high／
2 critical）。完整清單、實際安裝路徑與處理門檻見
[T01a triage](docs/evidence/001-t01a-triage.md)。這是依賴警示數量，不是
78 個已證實可利用的網站漏洞；目前不載入 ATS 也不是未來錢包流程的安全豁免。

本輪僅允許原上游範圍內的間接依賴更新；protobufjs 的精確版本限制觸發了
停止條件。沒有執行 override、升降版或全面批准安裝腳本。
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
