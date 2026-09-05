# T01b-3 plan and prompts — 2026-09-05

Implementation base: `0828d797c403e13f150edc5b2d63170cb76a8689`.
Original-language planning is retained here; public evidence is English.

## User decisions

- 「ATS config 查詢 我們研究下要做什麼」
- 「規劃下吧」
- Selected **併入部署檢查**: one action checks deployment and config, with separate results.
- After the following plan: “Implement the proposed plan.”
- Existing requirements retained: TDD; human MetaMask acceptance on September 6 without removing requirements; concise English evidence.

## Accepted plan

# T01b-3：部署檢查加入 Equity config 查詢

## 目標與範圍

依選定方式，將 config 查詢**併入現有部署檢查**，按鈕改為 **Check deployment and config**。一次操作顯示 Resolver、Factory 與 Equity config 的獨立結果。

使用現有 viem 呼叫官方合約的唯讀函式，不載入 ATS SDK、protobuf 或 Terminal3，不需要 MetaMask。這張票驗證鏈上 config；ATS SDK 官方入口整合仍為未完成項目。

## 實作變更

- 擴充 `src/deployment.ts` 的既有流程與結果型別，保留 chain 296、固定 Mirror ID、地址及 runtime bytecode 驗證。
- 在 Resolver 驗證通過後，透過現有 viem client 的 `readContract` action 執行 `eth_call`：
  - Resolver：`0.0.9212226`，EVM 地址每次由 Testnet Mirror 查得。
  - Configuration ID：`0x0000000000000000000000000000000000000000000000000000000000000001`。
  - 函式：`getLatestVersionByConfiguration(bytes32)`，回傳 `uint256`，使用 `latest`。
- 只加入上述函式的最小 ABI，依已安裝 contracts 8.0.0 的官方 artifact 核對並記錄來源；不匯入整套合約或 SDK 模組。
- 以 `bigint` 驗證結果，接受 `1` 至 `Number.MAX_SAFE_INTEGER`。`0` 顯示沒有已登記版本；超出範圍顯示無法安全供 SDK 使用；revert、無效回應及逾時均不得通過。
- 結果新增 `config` 欄位，包含固定 ID、狀態、訊息與十進位字串版本；不偽造 SDK `{ payload }` 回應。
- Resolver 未通過就不送 `eth_call`。Factory 單獨失敗時仍可查已驗證的 Resolver，但整體結果保持失敗。兩個部署及 config 全部通過才顯示整體成功。
- 在 `src/App.tsx` 分別呈現部署與 config 狀態、版本及檢查時間，明示「鏈上 config 已驗證；ATS SDK 整合待驗證」。重用現有樣式。
- 整個操作共用原有 **10 秒期限**，不另加一輪期限。保留取消、重複點擊防護、手動 Retry、無背景刷新及重載清空；開始重查或遇到錯誤時不顯示舊成功資料。
- 未來建立 NOVA 前必須重新查詢版本；本票不實作建立資產，也不永久保存版本。

## TDD 與驗收

先新增測試並確認預期失敗，再實作，最後重構及回歸。

- **Node：**有效版本、`0`、安全整數邊界、超大值、空／截斷 ABI 回應、RPC revert、錯網、Resolver 驗證失敗、Factory 單獨失敗、逾時與取消後晚到回應。核對 `eth_call` 的目標、函式、固定參數，並確認失敗前置條件不會觸發它。
- **瀏覽器：**更新本輪 harness，保留原部署案例並加入 config 成功／失敗、整體與個別狀態、Retry、重複點擊、過期結果及重載；在 dev／preview 驗證桌面與手機排版。另跑既有錢包回歸。
- **請求邊界：**只有手動操作才讀取；新 RPC 方法只增加指定的 `eth_call`。不得出現錢包連線、簽署、交易、自動切網或其他外部請求。
- **實際驗證：**dev／preview 都查詢一次真實 Testnet config，記錄實際回傳值。若回傳 `0`、revert 或端點不可用，如實標記失敗／blocked，不改部署、不寫死版本、不用 mock 取代。
- 執行 `npm ci`、`npm test`、typecheck、build；核對 manifest／lockfile 未變、產物不含 ATS／protobuf／Terminal3。

## 文件、Git 與待辦

- 從實作時實際 HEAD（目前 `0828d79`）建立 `feat/t01b-3-config-check`，承接尚未合併的 T01b-2。
- 程式修改限 `src/deployment.ts`、`src/App.tsx`；測試限既有 deployment／shell Node 測試，以及本輪 `docs/evidence/010-t01b-3-*` harness／evidence。舊診斷及歷史 evidence 不改。
- 更新計畫的獨立 config 查詢授權、handoff、attribution 與 AI_USAGE；新增單一 `015-t01b-3-config` 工作紀錄及 `012-t01b-3-config` prompt。
- 英文 evidence 摘要約一頁，保留必要 red／最終 green 結果及真實查詢證據，避免提交重複的中間成功紀錄。
- **2026-09-06 真人驗收清單完整保留**，部署項目加上 config 查詢觀察；未實際操作仍為 Pending。下一輪人工紀錄檔名順延為 evidence `011-t01-manual`、prompt `013-t01-manual`、AI usage `016-t01-manual`，同步寫入 handoff。
- 程式與文件一起提交，保持乾淨交接，不自動 push／merge。protobuf、Terminal3、SDK 整合與 VC 驗收均不因本票通過而取消。

## Research used

The installed ATS SDK/contracts 8.0.0 were read as files, not imported for execution.
Management.resolveLatestConfigVersion delegates through ContractService to RPCQueryAdapter.getLatestVersionByConfiguration; the adapter calls the same view method and converts its result to Number. Network.setNetwork initializes the RPC/Mirror query adapters; Network.init additionally initializes registered transaction adapters. The independent viem path does not execute either SDK initialization path.

Sources: [pinned RPC adapter](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/out/rpc/RPCQueryAdapter.ts#L719-L729), [DiamondCutManager](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/contracts/contracts/infrastructure/diamond/DiamondCutManager.sol#L118-L122), and the installed 8.0.0 artifact. No live config value was claimed during planning.
