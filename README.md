# HoldBook

Hedera Testnet 上的 ATS-first 股權生命週期驗證。資產 **NOVA** 完全虛構，
不代表真實股權、真人 KYC 或法律合規。

## 目前狀態

T00-min 建置中：先建立專案規則、交接文件與最小英文 React 驗證台。
目前沒有 wallet integration、已建立的 Equity 或鏈上交易。

完整計畫見 [ATS-first plan](docs/plans/001-ats-first.md)，
接手請先讀 [AGENTS.md](AGENTS.md) 與 [HANDOFF](docs/HANDOFF.md)。

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
