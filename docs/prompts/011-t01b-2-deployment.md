# T01b-2 planning and implementation prompt — 2026-09-05

Based on Git HEAD `66dea387a64ef385e5e84d3f7eb0f62699ed69cf`.
The following is the plan used for this work. User messages are preserved in their original language; this is a provenance record, not the judge-facing evidence summary.

## User requests

- 「T01b-2：Testnet 部署唯讀檢查 你要怎麼做呢？」
- 「你規劃下，真人驗證我要明天了，但對應的需求也不要少做，我明天可以驗證，還有我們是可以TDD的」
- After the proposed plan: “Implement the proposed plan.”

## Accepted plan

### T01b-2：Testnet 部署唯讀檢查與完整驗收交接

#### 目標與完成條件

交付不需連接 MetaMask 的英文 **Check deployment** 操作區，確認固定 Testnet RPC、Resolver 與 Factory 的部署存在。

目前 T01b-1 已合併，自動化通過；真人驗收安排 **2026-09-06（台北時間）**。延期不刪減需求，也不提前標記通過。T01a 仍 blocked；ATS config 與 VC 驗收繼續保留為後續必要工作。

#### 實作方式

- 沿用既有 viem、TanStack Query，不新增依賴或修改 lockfile。
- 使用者點擊後，先向 `https://testnet.hashio.io/api` 呼叫 `eth_chainId`；只有實際回傳 `296` 才繼續。
- 平行查詢 Testnet Mirror 的 `/api/v1/contracts/0.0.9212226`（Resolver）及 `/api/v1/contracts/0.0.9213391`（Factory）。驗證 ID 完全相符、`deleted === false`、地址為有效非零 EVM 地址；接受有／無 `0x` 的回應並正規化，兩個部署地址不得相同。不從數字 ID 推導地址。
- 使用查得地址呼叫 `eth_getCode(address, "latest")`。只有有效、非空的完整位元組 hex 才通過；`0x`／undefined 顯示沒有程式碼。HTTP、RPC 或格式錯誤顯示查詢失敗，不宣稱合約不存在。
- 顯示 RPC chain ID、兩個合約的 ID／地址／結果、程式碼位元組數及檢查時間。各合約保留獨立結果，全部成功才顯示整體通過；這是檢查當下的觀察，不是 ATS 相容性證明。
- 每次完整檢查限時 10 秒；Query 與 viem 都停用自動重試。禁止重複點擊，手動 Retry 重新檢查全部項目；開始新檢查即撤下舊成功狀態。取消或過期結果不得回寫。
- 部署查詢獨立於錢包狀態；不要求連線、不使用 injected provider。載入、重載、重新聚焦或網路恢復都不自動查詢；結果不存入 localStorage。
- 維持英文、鍵盤操作、可見焦點及狀態通知。更新現有「合約讀取尚不可用」文案，保留「No transactions yet」。

#### TDD 與自動化驗收

採 **Red → Green → Refactor**，先確認測試因尚未具備目標行為而失敗，再寫最小實作；不以事後補測試冒充 TDD。

1. **Node 測試先行：**涵蓋正確部署、錯誤 chain 阻止後續請求、ID 不符、已刪除、無效／重複地址、空或無效 bytecode、HTTP／RPC 錯誤、逾時及取消。使用 Node 內建測試與模擬 HTTP，保留真實 viem 呼叫流程。
2. **瀏覽器測試先行：**涵蓋初始零查詢、無 MetaMask 仍可檢查、重複點擊、部分失敗、Retry、重載、取消後晚到回應，以及成功結果不冒充 ATS ready。
3. **回歸檢查：**保留並執行既有錢包案例；dev／preview 都驗證桌面與手機尺寸。外部請求只允許既有帳戶 Mirror 查詢，以及本票指定的合約 Mirror、RPC 方法；不得出現簽署、交易或自動切網。
4. **最終檢查：**執行 `npm ci`、`npm test`、typecheck、build，確認 lockfile 未變、產物仍不包含 ATS／protobuf／Terminal3。
5. **真實公開端點：**在 dev／preview 實際執行部署檢查，與模擬測試分開記錄。端點不可用時記為 blocked，不能用模擬成功替代。

#### 明天的真人驗收：完整保留

將以下清單寫入 handoff；每項記錄 `Pending / Passed / Failed / Blocked`、實際日期及簡短觀察。

| 項目 | Victor 的操作與預期 |
| --- | --- |
| 手動連線 | 桌面 Chrome 只安裝 MetaMask；載入不跳連線要求，Connect 才請求；拒絕後可再次操作 |
| 三個角色 | Admin／Seller／Buyer 使用不同帳戶，逐一核對真實 Mirror EVM 地址與 Hedera ID |
| 綁定限制 | 重複帳戶不能綁定；已綁角色必須先 Clear 才能替換 |
| 狀態切換 | 切帳戶、切錯網、切回 296、Disconnect 都不沿用過期驗證；符合條件後重新查詢 |
| 重載與 Retry | 重載只恢復公開地址並顯示待驗證；手動連線後重新驗證。Mirror 尚未索引時保持未驗證，可手動 Retry |
| 部署檢查 | 不連錢包也能查詢；核對兩個固定部署結果，確認沒有簽署、交易或切網提示 |
| 排版 | 手機僅驗收排版，不宣稱手機 MetaMask 相容 |

無錢包、儲存異常、逾時與競態等可控故障由自動化覆蓋；不要求 Victor 為驗收修改真實錢包環境。真人操作發現的缺陷必須記錄、修正後重驗，不能改寫預期結果來通過。

#### 修改範圍與交接

- 從實作時實際 Git HEAD 建立 `feat/t01b-2-deployment-check` 分支；目前基準為乾淨的 `main`／`66dea38`。
- 程式限新增 `src/deployment.ts`，修改 `src/App.tsx`、`src/styles.css`；測試限新增 `tests/deployment.test.mjs`、修改 `tests/shell.test.mjs`，以及本輪新的 browser harness。既有 ATS 診斷與歷史 evidence 保留。
- 更新 `docs/plans/001-ats-first.md` 的獨立唯讀切片授權、`docs/HANDOFF.md`、`docs/ATTRIBUTION.md` 與 `AI_USAGE.md`；新增一份 `014-t01b-2-deployment` 工作紀錄、`011-t01b-2-deployment` prompt，以及 `009-t01b-2-*` evidence／驗證腳本。
- 英文 evidence 摘要約一頁，只列成果、實際檢查、未完成事項與原始結果連結；TDD 僅保留精簡 red／green 結果，不寫操作日記。handoff 明列明天驗收紀錄的允許檔案。
- 自動化通過可以提交程式與文件，但真人驗收保持 pending；不自動 push／merge。
- **不省略後續門檻：**protobuf 修復、ATS config 整數 payload ≥ 1、Terminal3／BBS／tar 問題處理及合成 VC 正反向驗證仍必須完成。本票通過不代表 T01 完成，也不啟動 NOVA 建立。
