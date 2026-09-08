# T03 integration and T04 Hold lifecycle — supplied intent

The user supplied the previous agent's implementation plan and instructed Codex to implement it in a fresh context, reread repository evidence, and carry it through implementation and verification. The plan authorizes T03 PR creation, CI-gated merge commit, then T04 local implementation and separate Victor manual acceptance. No T04 push/merge.

## T04 activation — September 7, 2026 (effective)

`based_on_commit: 61c411d70235ce7d882a8b4c84150e9b3c636d8c` is the verified
merged-main base, not this document's commit. Branch: `feat/t04-hold-lifecycle`.
The supplied T03 integration / T04 plan explicitly supersedes older stop and
merge prohibitions for this scope. PR #4 merged by merge commit after the exact
head 52deb83f0989f955c593150b081b00105066a5ea passed CI run 34138783453;
remote main contains it. T03 is complete; T04 code/automation is active and
manual acceptance is Pending. No T04 push or merge is authorized.

Exact allowed implementation files (enumerated before implementation):
`src/hold.ts`, `src/transport.ts`, `src/App.tsx`, `src/styles.css`,
`src/wallet.ts`, `src/guards.ts`, `src/credentials.ts`, `src/lifecycle.ts`,
`src/nova.ts`, `src/evidence.ts`, `src/ats.ts`;
`tests/hold.test.mjs`, `tests/transport.test.mjs`, `tests/wallet.test.mjs`,
`tests/guards.test.mjs`, `tests/credentials.test.mjs`, `tests/lifecycle.test.mjs`,
`tests/nova.test.mjs`, `tests/evidence.test.mjs`, `tests/ats.test.mjs`,
`tests/shell.test.mjs`.
Exact documentation files: `docs/prompts/025-t04-hold-lifecycle.md`,
`docs/evidence/028-t04-implementation.md`, `docs/evidence/028-t04-validation.json`,
`docs/evidence/028-t04-development.json`, `docs/evidence/028-t04-sdk-browser.mjs`,
`docs/evidence/028-t04-sdk-browser.json`, `docs/evidence/028-t04-ui-browser.mjs`,
`docs/evidence/028-t04-ui-browser.json`, `docs/evidence/028-t04-live-read.mjs`,
`docs/evidence/028-t04-live-read.json`, `docs/evidence/028-t04-5173-1440.png`,
`docs/evidence/028-t04-5173-390.png`, `docs/evidence/028-t04-4173-1440.png`,
`docs/evidence/028-t04-4173-390.png`, `docs/ai-usage/035-t04-hold-lifecycle.md`,
`docs/HANDOFF.md`, `docs/plans/001-ats-first.md`, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.
Separate subsequent manual evidence: `docs/evidence/029-t04-manual.md`,
`docs/evidence/029-t04-manual.json`, `docs/evidence/029-t04-manual.html`,
`docs/evidence/029-t04-create.png`, `docs/evidence/029-t04-kyc-negative.png`,
`docs/evidence/029-t04-buyer-vc.png`, `docs/evidence/029-t04-buyer-kyc.png`,
`docs/evidence/029-t04-permission-negative.png`, `docs/evidence/029-t04-execute.png`,
`docs/evidence/029-t04-release.png`, `docs/evidence/029-t04-final.png`,
`docs/ai-usage/036-t04-manual.md`, AI_USAGE, HANDOFF and the main plan.
No dependencies, lockfile, patches, other modules or asset parameters may change.

Use original NOVA 0.0.10402368, three accounts, chain 296, config 1, cap 1000
and default partition. Seller creates Hold 10, Escrow Admin, zero target,
empty data, expiration fixed at reviewed latest chain timestamp +86400 seconds.
Save base block and seconds; derive safe decimal Hold ID from HeldByPartition.
Admin-connected SDK execute 6 must reject Buyer KYC; identical calldata/from
Admin eth_call must return the exact KYC revert with unchanged state. Then
Admin prepares/reviews/manually signs/verifies Buyer VC (seven days, five-minute
backdate) and grants KYC through the genuine SDK. After KYC, read-only Seller
execute 6 and Admin execute 11 must reject for escrow and balance respectively.
Admin executes 6 and releases 4. Release targetId is original holder Seller.
Normally four transactions and one Buyer signature, all manually approved by
Victor on preview http://127.0.0.1:4173. Dev supports VC and reads.

Before each mutation recheck wallet/session, expected signer role, fixed inputs,
full asset/roles/KYC/Hold/balances, exact calldata and zero value. Never switch
bindings to impersonate another role. Reuse leases/Web Lock; persist public
intent before send, save late hashes, perform one automatic full recovery with
a total 180-second deadline after hash. Unknown/indexing delays remain pending;
only explicit queries, no automatic resubmission. Separate public transaction
and simulation evidence; simulations have no transaction ID. No full VC/proof.
Existing/unknown work requires original hash recovery; changed/expired state or
pinned incompatibility stops for diagnostics, with no renew/reclaim/patch.
T02 supply 0 and T03 completed history remain historical, independently of T04.

TDD with Node built-in runner and genuine SDK network boundaries; no keys or
fabricated valid VCs. Check all fixed-input/signature/calldata guards, VC binding
and negative semantics, races/rejection/late hashes/reload/timeout/Mirror delay,
full-release event/zero held/active-ID removal, history and evidence whitelist.
Run npm ci/test/typecheck/build, dev/preview desktop/mobile, keyboard and request
scope checks. Code commit keeps human acceptance Pending. Separate actual
verification must establish Seller 94, Buyer 6, both held 0, Buyer valid KYC,
supply/cap 100/1000 and every transaction/simulation/public VC input. Stop at T04;
no next ticket or automatic push/merge. Existing native BBS/audit/peer/license
and event eligibility limitations remain.

The user requires an English report matching actual transactions, simulations, screenshots, public JSON and verification sources; manual acceptance remains Pending until supplied and independently verified. No claim of payment settlement or a completed secondary market.

## Supplied plan (verbatim)

# T03 整合與 T04 Hold lifecycle

## 1. 目標與執行順序

已確認：T03 分支已推送至 `52deb83`，尚未建立 PR；本地工作區乾淨。使用者選擇 **T03 通過 CI 並合併後，接著實作 T04**。

1. 建立 T03 → main 的 PR，附程式與人工驗收報告。
2. 確認最新 PR head 的 CI 通過，以 merge commit 合併、保留歷史，驗證遠端 main 包含 T03。
3. 從該 main 建立 `feat/t04-hold-lifecycle`，把實際 base、啟動範圍與允許檔案記入主計畫和 HANDOFF。
4. 完成 T04 程式與自動化，本地提交；真人驗收先標 Pending。
5. Victor 在 preview 手動驗收後，獨立核對交易、模擬與最終數值，提交英文驗收紀錄，停在 T04。T04 不自動推送或合併。

沿用 NOVA **`0.0.10402368`**、原三帳戶、chain **296**、config **1**、cap **1000**、default partition。真實交易限定 `http://127.0.0.1:4173`；dev 支援 VC 與唯讀查核。保留既有 SDK／依賴／補丁，不建立新資產、不再發行、不新增角色授權。

## 2. 固定操作與通過條件

開始前確認 Seller KYC 有效、Seller 可用 100、Buyer 未 KYC 且餘額 0、雙方 held 0、沒有既有或未知 T04 操作。Seller KYC 必須涵蓋本次 Hold 效期；條件不符就停止並顯示原因。

| 步驟 | 操作者與實作 | 通過條件 |
|---|---|---|
| 建立 Hold 10 | Seller；真正 `Security.createHoldByPartition(CreateHoldByPartitionRequest)` | amount `"10"`、Escrow＝Admin、target＝零地址、data 空；Seller 可用 90／held 10 |
| 未 KYC 負向驗證 | Admin 連線；SDK execute 6 的拒絕，以及同一 calldata、`from=Admin` 的唯讀 `eth_call` | SDK 原因對應 Buyer 未 KYC；鏈上 revert 對應 KYC；狀態不變 |
| Buyer VC／KYC | 切回 Admin 後才 Prepare／Review／Sign／Verify；真正 `Kyc.grantKyc` | Admin → Buyer，合成 passed claim、七天效期、五分鐘回退；鏈上 ID／issuer／Unix seconds 與 VC 對應 |
| 權限與超額負向驗證 | Buyer KYC 完成後，對同一 Hold 做唯讀模擬 | `from=Seller`、execute 6 回覆非 Escrow；`from=Admin`、execute 11 回覆餘額不足；狀態不變 |
| Execute 6 | Admin；真正 `Security.executeHoldByPartition(ExecuteHoldByPartitionRequest)` | source＝Seller、target＝Buyer、amount `"6"`；Buyer 6／held 4 |
| Release 4 | Admin；真正 `Security.releaseHoldByPartition(ReleaseHoldByPartitionRequest)` | Request 的 `targetId` 是原持有人 Seller，amount `"4"`；Seller 94／held 0 |

正常共 **四筆交易＋一次 Buyer VC 簽署**。負向驗證的 provider 禁止送交易或簽署，不能把一般 SDK 錯誤、網路失敗或「送出被 guard 擋住」當成預期拒絕。

Hold 到期時間固定為審閱時最新鏈上 timestamp＋86,400 秒，保存基準區塊與精確 seconds，送出前不偷偷改值。Hold ID 從成功收據的 `HeldByPartition` 事件取得，再讀回核對；以 `(security, partition, Seller, holdId)` 識別。公開 ID 使用十進位字串，交給 SDK 前確認可安全轉為其要求的 number。

## 3. 程式、介面與恢復設計

- **帳戶檢查：**既有 wallet review 增加明確的預期簽署角色，預設仍是 Admin；只有 create-hold 使用 Seller。角色保存在 review 中，wagmi 與 provider 都必須一致，不能靠改寫三帳戶綁定來切換簽署者。
- **共用邏輯：**以 `src/hold.ts` 集中固定 T04 流程。只抽出既有受管 provider 的必要傳送／確認邏輯供 T03/T04 共用；固定預期 signer、完整 calldata、讀取白名單及收據驗證，不建立通用交易框架。
- **VC：**重用既有憑證流程，明確區分 Seller／Buyer subject；T04 固定 Buyer。切帳戶、切網、改綁定或重新整理均清除審閱與記憶體 VC。完整 VC／proof 不持久化；KYC 仍保留 Terminal3 與 SDK 內部驗證。
- **歷史與現況：**T03 改為唯讀歷史面板，程式入口關閉其 mutation，使用已完成交易的歷史區塊驗證。T04 顯示目前角色、KYC、可用／held 與 Hold 剩餘量；不能因 Buyer 後來取得 KYC 而抹去 T03 完成紀錄。
- **操作提示：**固定顯示目前階段、所需帳戶與下一個動作。查核時顯示實際子步驟，保留可見焦點、鍵盤操作、取消唯讀查核與英文錯誤訊息。
- **自動讀回：**依使用者選擇，取得 hash 後立即保存，再自動進行一次完整查詢／讀回，總期限 180 秒。尚未確認或 Mirror 尚未索引時顯示待查詢，不無限輪詢。下一筆仍須手動開始審閱、勾選及 MetaMask 核准。
- **保存與恢復：**沿用現有 session lease 和 preview Web Lock；送出前保存公開 intent，晚到 hash 也必須保存。新增獨立 T04 journal，交易與唯讀模擬使用不同 evidence 類型；模擬沒有 transaction ID。
- **驗證邊界：**每筆送出前重查 chain、signer、資產、必要角色／KYC、完整 Hold 與余额、calldata、零 value。恢復須核對收據、事件、完整 calldata、歷史前後狀態、Mirror sender 映射及交易識別。
- **中斷處理：**未知／已送出操作只能恢復；已有 Hold、Buyer KYC、execute 或 release 而證據不足時，查詢原 hash，不重建或重做。Hold／必要 KYC 過期、狀態異常或相容性不符則停止，不自動續期、reclaim、改參數或修補 SDK。

允許檔案限定為新增 Hold 模組及必要的共用傳送模組；既有 App／styles、wallet／guards、credentials、lifecycle、nova、evidence、ats；對應 Node 測試。文件限定主計畫、HANDOFF、AI_USAGE／ATTRIBUTION、T04 prompt，以及實作和人工驗收 evidence／AI usage 紀錄。實作開始前列出精確檔名，禁止擴及其他模組與依賴設定。

## 4. 測試與驗收

先寫失敗測試再實作，使用 Node 內建 runner、真實 SDK 函式及明確標示的網路邊界，不產生私鑰或偽造有效 VC。

- 正確／錯誤 signer、chain、資產、partition、Hold ID、Escrow、收款人、數量、seconds、非零 value 與改動 calldata。
- Buyer VC 過期、竄改、錯誤 subject，以及 KYC ID／issuer／效期／digest 精確對應。
- 真正 SDK KYC 拒絕、鏈上 KYC revert、非 Escrow、超額，以及 transport error 不得判為通過。
- 拒簽、重複點擊、跨分頁、簽署途中切帳戶／網路、晚到 hash、逾時、重載及 Mirror 延遲。
- 完整 release 後，事件、held=0、Hold 已從 active IDs 移除共同證明完成；不依赖已刪除 Hold 的詳細 getter。
- T02 supply=0、T03 發行完成歷史與 T04 現況可同時正確顯示；T03 發行入口保持關閉。
- Evidence 白名單不含完整 VC、簽章、任意 wallet／SDK／error 物件。

執行 `npm ci`、`npm test`、typecheck、build，驗證 dev／preview 的桌面與手機尺寸、鍵盤操作及外部請求範圍。人工每一步讀回：

| 階段 | Seller 可用 | Buyer 可用 | Seller held | Supply |
|---|---:|---:|---:|---:|
| 開始 | 100 | 0 | 0 | 100 |
| Hold 10 | 90 | 0 | 10 | 100 |
| 未 KYC 拒絕 | 90 | 0 | 10 | 100 |
| Execute 6 | 90 | 6 | 4 | 100 |
| Release 4 | **94** | **6** | **0** | **100** |

最終另確認 Buyer KYC 有效、Buyer held=0、cap=1000。英文報告逐筆對照交易、模擬、截圖、公開 JSON 與驗證來源；全部一致才完成 T04。保留既有 native BBS、audit、peer、授權與活動資格限制，不宣稱已完成付款結算或二級市場。
