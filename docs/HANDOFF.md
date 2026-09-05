# HoldBook handoff

## Current boundary / Git base

**T01b-1 錢包切片已實作、自動化通過；Victor 真實桌面 MetaMask 驗收待完成。**
T01a 安全仍 blocked，ATS config／VC／T02 未啟動。

- `based_on_commit: a675c893c442ec1ca2c979669bfd005eb7d18785`（本次推送起點，非包含此 handoff 的 commit）。
- 分支 `diagnostic/t01a-sdk-load`；前次文件的 5740227 已驗為祖先。實際 HEAD 由 Git 讀取。
- 評審文件英文、證據摘要約一頁的要求已寫入 [AGENTS](../AGENTS.md)。本次推送及文件紀錄的遠端／連結／差異已檢查，未重跑未變動的程式測試。
- 使用者核准推送目前分支：六筆既有提交已推送至 a675c89，並以 ls-remote 核對；本輪同步紀錄另與文件一起提交。未 merge／部署或宣稱 CI 通過。

## Reading map

完整讀 AGENTS／本檔，再讀 [ATS plan](plans/001-ats-first.md) 共用規則與最新 T01b-1 授權。

| 需要 | 讀取 |
| --- | --- |
| 本輪成果、檢查、限制 | [精簡證據](evidence/008-t01b-1-wallet.md)；原始結果按其中連結查閱 |
| 使用者計畫與後續要求 | [Prompt 010](prompts/010-t01b-1-wallet.md) |
| T01a blocker／mentor 問題 | [007 失敗試驗摘要](evidence/007-t01a-protobuf-rebuild.md) |
| 協作與第三方來源 | [AI_USAGE](../AI_USAGE.md)、[ATTRIBUTION](ATTRIBUTION.md) |

## Verified / blocked

- 手動 wagmi injected 連線；停用 discovery／wagmi storage／載入重連，不自動切網。顯示實際帳戶及 chain，只允許 296。
- 三角色經固定 Testnet Mirror endpoint 驗證，EVM／Hedera ID 都須不同；替換先 Clear。切換即取消舊查詢並清除驗證，含快速 A→B→A；10 秒逾時、手動 Retry、無背景刷新。
- 只保存公開地址；重載待驗證，儲存失敗採記憶體並提示。角色標籤不證明鏈上權限。
- App ATS import／按鈕已移除，既有 ATS 診斷、adapters、tests、Vite 設定及 NOVA 參數保留。
- exact 新增 wagmi 3.7.7／Query 5.102.8，viem 2.56.3 升為直接依賴；其餘所有套件記錄不變，無 override／script 核准。
- npm ci／9 Node tests／typecheck／build／直接 npm ls 通過；20 browser cases 通過（真 wagmi、模擬 provider／Mirror），dev／preview × desktop／mobile 無溢出、非預期請求或 browser errors。UI AI review 通過；非真人驗收。
- 產物 14 個套件位置，無 ATS／protobuf／Terminal3；JS 303,643 bytes。原有 polyfill 僅 process shim 留在產物，不會修復解碼／安裝風險。
- Audit 仍 83 項／104 個位置（22 low、32 moderate、27 high、2 critical），無新 advisory。兩項 effects-only metadata 差異留在原始結果。
- 完整 npm ls --all 仍 exit 1：40 既有 Solana TypeScript ^5 peer 不符，新增 1 可選 Base peer 不符（connectors 8.2.0 要 ^2.5.1；既有 2.4.0）。未使用／未打包 Base 或 Solana；未宣稱全樹有效，未授權擴大修補。
- B1：protobuf 在接回 ATS 解碼前處理；前次重建試驗已停止還原。B2：Terminal3／BBS／tar 在 VC 或相關安裝變更前處理。歷史失敗未因無關改動重跑。
- 沒有真實帳戶／live Mirror 證據、合約讀取、簽署或交易 ID。未見賽前研究稿仍未檢視；活動資格及專案 license 仍由 Victor 處理。

## Next action / exact allowed files

停在 T01b-1；下一步僅為 **Victor 手動驗收及紀錄**：桌面 Chrome 只安裝 MetaMask，
Connect 到 296，綁定三個不同帳戶並核對 Mirror ID；測拒絕／Retry、切網／切帳戶、
Disconnect、Clear／替換、重載後待驗證與手動重連。Mirror 未索引就維持未驗證、手動重查。
只記公開 EVM／Hedera ID 與觀察，不需要簽署、交易或 profile 匯出；手機只驗排版。
Victor 已表示 MetaMask 稍後驗收；T01b-2 部署唯讀檢查目前僅為建議，尚未啟動。

下輪 record-only exact files：`docs/HANDOFF.md`、`AI_USAGE.md`、新增
`docs/ai-usage/013-t01b-1-manual.md`、`docs/prompts/011-t01b-1-manual.md`、
`docs/evidence/009-t01b-1-manual.md`、`docs/evidence/009-t01b-1-manual.json`、
`docs/plans/001-ats-first.md`（status／scope only）。保留本輪 dated records。
若發現程式缺陷，先依證據界定修補票；不自動展開套件修補、ATS config／VC 或下一票。
舊 [deferred T01b scope](plans/001-ats-first.md#deferred-next-ticket--t01b-not-activated) 除本輪切片外仍未啟動。

本機：`npm run dev` → http://127.0.0.1:5173；build 後 `npm run preview` → 4173。
不要假設舊 server 存活。Browser harness 需外部 Playwright 與新結果路徑，使用隔離合成環境。
文件與成果一起 commit，確認 clean boundary；後續仍不自動 push／merge，本輪推送依使用者明確要求。
