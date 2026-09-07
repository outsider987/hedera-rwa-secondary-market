# User-approved T03 plan

## T03 activation — September 7, 2026 (current)

The user supplied and authorized the T03 implementation plan. Base is merged
main `daf7dcc8e443277f0a64e87bc283f48cc7456325`; branch `feat/t03-kyc-issue`.
This supersedes earlier T03 activation prohibitions only. T02 is complete.
Reuse NOVA 0.0.10402368 / 0x261ce349df182988fa25d00868cf6cf434220c24.
Real mutations are preview-only http://127.0.0.1:4173; Victor manually approves
every transaction and the Admin-to-Seller VC signature in MetaMask.

Exact allowed files: new `src/lifecycle.ts`, `tests/lifecycle.test.mjs`;
necessary existing `src/{App.tsx,styles.css,nova.ts,evidence.ts,wallet.ts,guards.ts,ats.ts,credentials.ts}`
and corresponding existing `tests/*.test.mjs`; new `docs/evidence/026-t03-*`,
`docs/prompts/024-t03-kyc-issue.md`, `docs/ai-usage/033-t03-kyc-issue.md`;
`docs/HANDOFF.md`, this plan, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.
No dependencies, lockfile, SDK/protobuf patches, asset parameters or other files.

Sequence: fresh asset/deployment/three-account/config/cap/restriction readback;
individually grant missing ISSUER, SSI_MANAGER, KYC roles to Admin; register
Admin issuer if absent; prepare/review/manually sign/verify synthetic Seller VC;
SDK grantKyc (UTF-8 JSON/Base64 copy, real internal verification); SDK issue
exactly 100 using default partition and empty data. All transactions require
fresh review, zero value, exact calldata and the existing wagmi/session lease.
Persist public intent before send and hash immediately; serialize all T03 tabs
with a preview Web Lock. Unknown/submitted operations permit recovery only.
Receipt/event/calldata/Mirror sender and state must agree. Existing KYC/issuance
without evidence requires an existing hash, never overwrite or resubmit.
Pre-issue supply, Seller/Buyer balance and held must all be zero; no top-up.
T02 uses creation-block getters; unavailable history stays incomplete. T03
shows current values independently. Full VC/signature stays in memory only.

TDD and npm ci/test/typecheck/build plus dev/preview desktop/mobile, keyboard,
request-boundary and race/recovery checks are mandatory. Never fabricate valid
VCs or use private keys. Existing native BBS, audit/peer/license limitations
remain. Code/automation commit may mark manual acceptance Pending; only a
second evidence commit after Victor's actual transactions and final readback
may complete T03. No push/merge, new asset, Buyer KYC, Hold or T04.

Final acceptance: Admin has three roles and issuer registration; Seller KYC
issuer/ID/dates match its grant; Seller available 100, held 0; Buyer not KYC,
balance 0; supply/cap 100/1000. Preserve historical evidence and failures.

This record preserves the operative requirements of the supplied Traditional Chinese plan.

## Supplied plan (verbatim)

# T03：Seller 鏈上 KYC 與發行 100 NOVA

## 1. 目標與執行界線

沿用既有 NOVA **`0.0.10402368`**，完成 Admin 必要角色、VC issuer 註冊、Seller KYC，以及一次發行 100 NOVA。

- 從已合併的 `main` 建立 `feat/t03-kyc-issue` 分支。
- 已確認：真實交易只在 **preview `http://127.0.0.1:4173`**；dev 用於 VC、介面與唯讀查詢。
- 已確認：缺少的角色**逐項授權**，每筆交易由 Victor 在 MetaMask 手動批准。
- 不建立新資產、不授予 Buyer KYC、不做 Hold、不改 cap、config 或既定資產參數。
- 分階段提交程式與證據；本計畫不包含自動推送或合併。

## 2. 操作流程與 SDK 接合

介面依序呈現「查核 → 審閱 → MetaMask 核准 → 交易確認 → 鏈上讀回」，每一步完成後才開放下一步。

| 步驟 | 實作與通過條件 |
|---|---|
| 查核既有資產 | 重新驗證 T02 建立交易、資產地址、三帳戶 Mirror 映射、chain 296、config 1、cap 1000、暫停／限制狀態及目前供應量 |
| 補足 Admin 角色 | 使用真正的 `Role.grantRole(RoleRequest)`，依序補足 `_ISSUER_ROLE`、`_SSI_MANAGER_ROLE`、`_KYC_ROLE`；已有角色直接顯示已具備，不重送 |
| 註冊 VC issuer | 使用 `SsiManagement.addIssuer(AddIssuerRequest)` 註冊 Admin；已註冊則跳過，讀回確認 |
| Seller VC | 沿用目前 Prepare／Review／Sign／Verify 流程，固定 Admin → Seller、合成 passed claim、七天效期與五分鐘回退 |
| Seller KYC | 將驗證通過的 VC 副本編成 UTF-8 JSON／Base64，交給真正的 `Kyc.grantKyc(GrantKycRequest)`；保留 SDK 內部再次驗證 |
| 發行 100 | 使用 `Security.issue(IssueRequest)`，固定 Seller、amount `"100"`；核對 SDK 產生的 `issueByPartition` 使用 default partition、數量 100、空 data |

最多需要 **六筆交易加一次 VC 簽署**：三筆角色、一筆 issuer、一筆 KYC、一筆發行。已符合條件的角色與 issuer 註冊不重做。

KYC calldata 必須精確對應本次 VC 的 ID、Admin issuer、Seller 與 Unix seconds 效期。完整 VC／簽章只留記憶體，不寫入操作紀錄或公開報告。

## 3. 交易防護、恢復與狀態介面

- 以 `src/lifecycle.ts` 集中 T03 流程；沿用 wagmi 唯一連線、既有 session／操作鎖及 managed SDK provider。只抽出必要的共用傳送與確認邏輯，不建立通用交易框架。
- 每次送出前重新核對 Admin、chain、資產、角色、前置狀態與完整 calldata；目標固定為既有 NOVA，value 固定為零。
- 只允許本次已審閱的 `grantRole`、`addIssuer`、`grantKyc` 或 `issueByPartition`。禁止其他交易、簽署方法與自動切網。
- 審閱後若帳戶、設定、必要狀態或 VC 改變，回到審閱；不得沿用舊核准內容。
- 所有 T03 操作共用 preview Web Lock，送出前保存公開 intent，取得 hash 立即保存。記錄操作種類、資產、輸入摘要、前後狀態及交易識別，透過 `src/evidence.ts` 白名單匯出。
- 已送出、逾時或結果未知時，只能查詢／恢復。拒絕或確認失敗後也不自動重送；必須重新查核並由使用者明確重試。
- 發行前要求 supply、Seller／Buyer balance 與 held 均為 0。發現供應量已變更，或已有未知／已送出發行操作，立即停用發行；禁止「補差額」或再發 100。
- 恢復必須核對成功收據、資產事件、完整 calldata、Mirror sender 映射與鏈上狀態。已有 KYC／發行但缺少對應證據時，要求查詢既有 hash，不覆寫或重做。

**T02 與 T03 狀態分開呈現：**調整 `src/nova.ts`，T02 初始化設定改在建立交易的區塊讀回，保留 supply=0 的歷史意義；T03 顯示目前狀態。已唯讀確認該建立區塊可查得 supply=0。歷史查詢不可用時標示未完成，不以最新狀態代替。

## 4. 測試與人工驗收

先寫會失敗的 Node 測試，再實作：

- 角色已存在／缺少、issuer 已註冊、錯誤資產或帳戶、錯誤角色、非零 value、改動 calldata。
- VC 過期、竄改、錯誤 subject，以及 KYC 效期與 VC ID 的精確對應；不繞過真正 Terminal3／SDK 驗證。
- 拒簽、重複點擊、跨分頁、簽署途中切帳戶／網路、晚到 hash、送出後逾時、重載恢復與 Mirror 延遲。
- 供應量已是 100、未知發行操作、餘額異常時，無法再次發行。
- T02 歷史 supply=0 與 T03 現況 supply=100 能同時正確顯示。
- 公開 evidence 不含完整 VC、簽章或任意 wallet／SDK 物件。

執行 `npm ci`、`npm test`、typecheck、build，並驗證 dev／preview 桌面與手機尺寸、鍵盤操作及外部請求範圍。自動化使用真實函式與明確標示的網路邊界；不生成私鑰或偽造有效 VC。

Victor 在 preview 逐筆操作，最後須讀回：

| 項目 | 完成標準 |
|---|---|
| Admin | 三項必要角色具備，且為已註冊 VC issuer |
| Seller KYC | 有效；issuer、VC ID、效期符合本次授予紀錄 |
| Seller 可用餘額 | 100 NOVA |
| Seller held | 0 |
| Buyer | 未 KYC，餘額 0 |
| Total supply／Cap | 100／1000 |

## 5. 文件與交付

實作前將 T03 啟動範圍與允許檔案寫入主計畫及 HANDOFF。變更限上述核心邏輯、必要的既有 UI／wallet／guard／ATS 接合、相應測試與文件；不新增依賴、不改既有 SDK／protobuf 補丁，若發現相容性缺陷則先記錄具體原因與修補範圍。

分兩個交付階段：

1. **程式與自動化完成**：提交實作、測試及英文 evidence；人工操作仍標 Pending。
2. **人工鏈上驗收完成**：整理一份英文報告，對照每筆交易、截圖、公開 JSON、前後數值與驗證來源，再提交驗收紀錄。

歷史失敗與 T02 證據不覆寫；保留目前 audit、peer、授權文件及 native BBS 限制。**只有最終鏈上數值與交易證據全部核對完成，才將 T03 標示完成；完成後停在 T03。**
