# HoldBook 第一階段：ATS／KYC／Hold 驗證

Status: 使用者於 2026-09-05 核准實作。進度以 `../HANDOFF.md` 為準。
本文件保存定案；bootstrap 第一張 active ticket 是 T00-min。

## 1. 目標與範圍

交付 Victor 操作、mentor／評審觀看的本機英文驗證台，在 Hedera Testnet
真實完成 NOVA 建立、KYC、發行與 Hold lifecycle，留下可由 Git 接手的證據。

- Public repo：`outsider987/hedera-rwa-secondary-market`，分支 `main`。
- React／React DOM `19.2.8`、Vite `8.2.2`、TypeScript `7.0.2`、ATS SDK `8.0.0`；提交 lockfile。
- Node `24.19.0`、npm `11.17.0`，本機與 CI 一致。
- 三帳戶：Admin 兼 Escrow／測試 VC issuer，另有 Seller、Buyer；三者地址不同。
- Victor 手動管理 MetaMask 與 Testnet HBAR；交易與 VC 簽署逐筆人工核准。
- 合成 KYC、不收個資、不宣稱真人 KYC 或真實證券合規。
- 不加入 Go、PostgreSQL、CLOB、付款腿、公開網站部署或自訂合約。

## 2. 固定設定

| 項目 | 設定 |
| --- | --- |
| Network | Hedera Testnet，chain ID `296`／`0x128` |
| RPC | `https://testnet.hashio.io/api` |
| Mirror Node | `https://testnet.mirrornode.hedera.com/api/v1/` |
| Resolver／Factory | `0.0.9212226`／`0.0.9213391` |
| Equity config ID | `0x0000000000000000000000000000000000000000000000000000000000000001` |
| Config version | 建立前讀最新版本，`payload` 必須是整數且 `>= 1`，使用該次結果 |
| Name／Symbol | `Nova Private Equity Common Shares`／`NOVA` |
| ISIN／Decimals | `USNOVA000016`／`0` |
| Authorized shares | `"1000"`；建立後總發行量為 `0` |
| Nominal value | `"1"`、decimals `0`、USD `0x555344` |
| Hold partition | `0x0000000000000000000000000000000000000000000000000000000000000001` |
| Hold target／escrow | EVM zero address／Admin |

地址來源：[ATS web configuration](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/.env.example)。
查到設定不等於鏈上可用；T01 必須驗證 bytecode 與 resolver。

### Equity 必填值

- `internalKycActivated`、`isControllable`＝`true`。
- `clearingActive`、`isMultiPartition`、`arePartitionsProtected`、`erc20VotesActivated`＝`false`。
- `isWhiteList`＝`false`，初始黑名單為空。
- voting／information／liquidation rights＝`true`。
- subscription／conversion／redemption／put rights＝`false`；dividend type＝`COMMON`（`2`）。
- Regulation＝`REG_S / NONE`（`1 / 0`），只是虛構測試 metadata，不表示法律資格。
- `isCountryControlListWhiteList=false`、`countries=""`。
- external pause／control／KYC lists＝`[]`；不設定 external compliance／identity registry。
- `info="Fictional Testnet asset. Synthetic KYC only; no real securities or legal compliance claims."`
- `diamondOwnerAccount`＝Admin；建立前顯示完整設定供 Victor 核對。

### 合成 VC

- T01 直接使用的相依套件 exact pin：`@terminal3/vc_core 0.0.19`、
  `@terminal3/verify_vc 0.0.20`、`ethers 6.15.0`，相容於 ATS 8.0.0 的相依鏈。
- 用 `prepareCredentialPayload`、公開 DID 建立 issuer＝Admin、subject＝Seller
  或 Buyer、合成 KYC passed claim；有效七天，起始時間回退五分鐘。
- 不接 external revocation registry；合成 VC 不是身分審核服務。
- 沿用 Terminal3 `ecdsa_vc 0.1.16` 的 ECDSA proof 格式，簽署改為 MetaMask
  signer。保留 hash 字串的 UTF-8 message 語意，不改成 raw bytes。
- 簽署前顯示 issuer、subject、claims、效期與摘要。驗證成功才交給 ATS
  `Kyc.grantKyc`。不得建立 `Wallet(privateKey)` 或使用 upstream 測試私鑰。
- Equity 建立前先完成 VC 簽署／驗證的手動預驗證；不相容就停 T01，
  不繞過 SDK、不偷換版本。
- 參考為已發布 npm package source；目前只有 source review，沒有 runtime 成功證據。

## 3. Tickets

| Ticket | 內容 | 完成門檻 |
| --- | --- | --- |
| T00-min | Repo、規則、AI attribution、正式計畫、handoff、README、ignore、React shell、CI | npm ci／test／typecheck／build；shell 能開；public repo／main 就緒 |
| T01 | SDK import、MetaMask、三帳戶綁定、guard、部署／config 驗證、合成 VC | dev 與 production preview 可執行；有效 config；VC 簽署驗證成功 |
| T02 | Admin 建立一次 NOVA；讀回 metadata、owner、cap、供應量與啟用狀態 | security ID、EVM address、receipt／Mirror evidence；設定一致 |
| T03 | 查核並補足 Admin issuer／SSI manager／KYC roles；註冊 VC issuer；Seller KYC；Issue 100 | Seller KYC 有效、可用 100、總供應 100、Buyer 未 KYC |
| T04 | Seller Hold 10；未 KYC Buyer 被拒；Buyer KYC；Admin execute 6／release 4；demo 與證據 | 所有主流程與負向驗收通過 |

### 2026-09-05 核准的 T01 拆分與修補界線

Victor 核准先執行 **T01a — 依賴安全整理與 ATS 載入驗證**，通過後才另輪
執行 **T01b — MetaMask／三帳戶綁定／部署與 config 唯讀驗證／合成 VC**。
原 T01 的帳戶、config、VC 與 evidence 驗收全部保留，不因拆票而省略。
本次實作 brief 與決策見 [T01a planning record](../prompts/002-t01a-planning-record.md)。

- T01a 保留所有既定直接依賴與 Node/npm pins，只允許符合所有相關上游宣告
  範圍的間接依賴更新；選可修補已確認漏洞的最低版本，避免無關 lockfile 變動。
- 禁止 force fix、override、新增套件、修改套件 source、全面批准安裝腳本。
  若修補需超出界線，保存依賴路徑與候選後停止，交 Victor／mentor 決定。
- 完成全部警示清單及 critical/high 的靜態分類後，安全門檻允許時才透過
  官方入口動態載入 SDK；只確認 Management export，不能呼叫它或初始化 Network。
  不准使用 mock、deep import、空模組或假 polyfill 冒充真實載入。
- T01a 不接錢包、不呼叫 RPC/Mirror、不簽 VC；瀏覽器使用無秘密、無錢包的
  獨立環境，驗證 dev/preview、載入狀態、重複操作防護與無外部請求。
- 停止條件發生時，保留已驗證診斷，標記 T01a blocked；不加尚未獲准的
  SDK 載入功能，也不開始 T01b。沒有 runtime 驗收就不能宣稱 SDK ready。
- Commit messages 統一英文，以 type(scope): description 描述實際成果。

### 2026-09-05 T01a 隔離診斷恢復授權

Victor 在具體範圍說明後以「Go」核准
[isolated load diagnostic](../prompts/003-t01a-isolated-load.md)：保留 B1/B2
未解風險及所有依賴版本，允許手動官方入口載入與 dev/preview 隔離驗證。
此授權取代上段「停止條件後不加載入功能」的診斷限制；其餘禁令仍適用。
若需要改版、override 或 polyfill，保存錯誤後停止；不接錢包或鏈上服務。
載入成功不代表漏洞修復，T01b 仍需另行解決依賴風險及啟動決策。

### 2026-09-05 T01a 瀏覽器修復授權

Victor 在閱讀具體研究與建議後回覆「go」，核准
[bounded remediation](../prompts/005-t01a-remediation-decision.md)。允許增加
exact `@hiero-ledger/proto 2.25.0`、`vite-plugin-node-polyfills 0.28.0`，以及
必要的 Vite 8 設定與 dotenv／Winston browser adapters。此範圍取代先前
對這些新增套件／polyfill 的禁止；既定 framework／ATS／Node/npm pins 不變。
官方 SDK／VC 邏輯不得替換；不用 host 環境資料或任意 SDK 日誌。
完成真實 dev／有效 production preview 載入與 audit 前後比較，仍停在 T01a。
此授權沒有放行 override、其他直接套件、漏洞豁免或 T01b。

### 2026-09-05 T01a protobufjs 限定試驗授權

使用者要求實作 [protobufjs 限定計畫](../prompts/007-t01a-protobuf-trial.md)，
以實作起始 HEAD `ecf219c4690072757da8d165e3af36903cc43ee9` 為基準。
唯一 override 例外：`@hashgraph/sdk@2.64.5`、`@hashgraph/proto@2.18.5`、
`@hiero-ledger/sdk@2.79.0`、`@hiero-ledger/proto@2.25.0` 的 protobufjs
固定為 `7.6.5`；既有 gRPC `7.6.6` 不降版。其他 pins／資產設定不變。
程式限 package.json、package-lock.json、既有隔離 browser harness，
新增單一 Node 測試檔與結果於 `docs/evidence/005-t01a-protobuf*`；文件限
本輪 prompt、handoff、此授權、attribution、AI usage work item／索引。
保存完整 audit、lock 差異、bundle 清單，測兩套公開 proto 的合成資料／
64 位元精度、截斷／過深群組／Key 遞迴（獨立子程序、固定逾時），以及
npm ci／test／typecheck／build 與 dev/preview × desktop/mobile 隔離載入。
安裝衝突、不相容、安全失敗或候選未涵蓋的新漏洞均停止並還原本輪依賴，
只提交可重現診斷／mentor 問題；通過才保留修補。不得修改上游 source／
重生解碼器、擴大 override、批准 scripts、操作錢包或啟動 T01b。
Terminal3／tar 等其餘風險仍是 blockers；文件與成果一起提交，不合併 draft PR。

T00 自然拆為 `chore: initialize HoldBook guardrails` 與
`feat(web): add HoldBook testnet shell`。其後按實際完成工作提交，
沒有手動鏈上驗收時不使用已證明 lifecycle 的敘述。

### 操作介面與安全入口

單頁：上方 network／active account／required role，中間按順序操作，
下方鏈上狀態與 evidence。英文、原生表單、清楚文字狀態、鍵盤可操作；
不建品牌視覺系統、行情圖或交易 UI。T00 僅顯示規劃／未連線狀態。

- 所有 mutation 經同一安全入口，送出前重查 chain、account、role、asset、inputs。
- 帳戶／網路切換即令舊連線失效；只允許一個待簽署／待確認操作。
- 拒簽不算失敗交易，不自動重試。重載後讀鏈上狀態，不按本機勾選重送。
- 未完成手動驗收的 ticket 保持 pending，不開後續階段。
- 不新增後端 API。Evidence JSON 的穩定介面帶 schema version、操作種類、
  chain／account／security／hold 識別、輸入、結果、前後狀態；
  transaction 與 read-only simulation 分開標記。

## 4. 驗收與證據

所有數值都指 default partition；可用 balance 與 held amount 分開查。

| 完成操作 | Seller 可用 | Buyer 可用 | Seller held | Total supply |
| --- | ---: | ---: | ---: | ---: |
| Issue 100 | 100 | 0 | 0 | 100 |
| Hold 10 | 90 | 0 | 10 | 100 |
| 未 KYC execute 被拒 | 90 | 0 | 10 | 100 |
| Buyer KYC 後 execute 6 | 90 | 6 | 4 | 100 |
| Release 4 | 94 | 6 | 0 | 100 |

- Hold expiry＝建立時鏈上時間 +24 小時，傳 Unix seconds。
- Hold key＝`(security, partition, Seller, holdId)`，不假設第一筆 ID。
- 未 KYC 時同時保存 SDK rejection 與帶 Escrow `from` 的相同 calldata
  唯讀 `eth_call`；確認為 KYC revert，不把 transport error 當成功。
- Buyer KYC 後，以唯讀模擬補測非 Escrow、超額 execute 被拒，狀態不變。
- 若過期，不以 reclaim 冒充 release；停止該驗收，後續動作另由 Victor 核准。

### Checks

- CI：`npm ci`、`npm test`（Node built-in）、typecheck、production build；沒有 CI wallet。
- T00 check 是 static shell smoke test，不冒充 ATS integration test。
- T01 起測共用 guard：錯誤 chain/account、無效 config、非整數／超額數量、
  evidence whitelist；不新增測試框架。
- 手動：無 MetaMask、拒連線／簽署、account/network 變更、reload、SDK load、VC、完整主流程。
- Build 成功不替代 browser／MetaMask 驗收；尚未執行的檢查標 pending。

每次操作即時保留本機 evidence，JSON 匯出後整理進 Git。交易保存 hash、
Hedera transaction ID、consensus timestamp、HashScan link、讀回狀態。
Mirror 尚未索引標 pending，只重查、不重送。模擬／拒簽沒有 tx ID。
只保存公開欄位，不公開完整 VC、簽章、wallet objects、秘密或任意 error objects。

## 5. Context／Git 交接

三層記憶：root `AGENTS.md`、本計畫、`../HANDOFF.md`。
Handoff 記錄 objective、active ticket、based_on_commit、完成項目、測試、
公開地址／交易證據、blockers、Victor 待辦、下一票 exact allowed files／acceptance tests
的精確連結。未啟動票的完整範圍留在計畫，避免每次接手重讀。

2026-09-05 Victor 以「go」核准
[文件導覽整理](../prompts/006-docs-navigation.md)：`AI_USAGE.md` 保留為短索引，
歷史原文移至 `docs/ai-usage/`，目前第三方來源集中在 `docs/ATTRIBUTION.md`。
先完整讀 AGENTS／HANDOFF，再讀本次適用的 plan／spec／有效授權；歷史與大型
evidence 按任務查閱，不因出現連結就遞迴全部讀取。需要完整 audit 時仍查完整清單。
AI usage 記協作與決策，HANDOFF 記現況，evidence 記驗證；摘要不取代原始證據。
此文件整理不變更資產參數、安全門檻、授權範圍或後續 ticket 的啟動條件。

- `based_on_commit`＝本輪起始 commit；首次是 `unborn`，不填入包含自己的 commit hash。
- Handoff／AI_USAGE 和工作一起提交；actual HEAD 由 Git 讀取。
- 接手：讀規則／handoff → status／log／tree → 核對文件 → 只執行 active ticket →
  更新 evidence／attribution → tests → clean ticket boundary commit。
- Resolver／Factory／config／SDK／VC 不相容：保存診斷找 mentor；不回退或繞過。
- 等待 MetaMask 核准、HBAR 或未知交易確認：列出 Victor 的具體待辦，不假裝完成。
- 賽前設計／資產資格如實揭露，找主辦確認；保存實際用過的 specs/prompts 並去秘密。
  [ETHOnline rules](https://ethglobal.com/events/ethonline2026/info/details)
- 活動影片要求 2–4 分鐘；本階段只準備操作說明，不憑空宣稱已錄製或已送件。
- T04 後才另規劃 CLOB／付款結算。這是 ATS lifecycle，不是完成的二級市場。

## Bootstrap acceptance scope

T00 只允許：`AGENTS.md`、`AI_USAGE.md`、`README.md`、`.gitignore`、
`docs/**`、`PRODUCT.md`、`package.json`、`package-lock.json`、`.npmrc`、
`.nvmrc`、`index.html`、`tsconfig.json`、`src/main.tsx`、`src/App.tsx`、
`src/styles.css`、`tests/shell.test.mjs`、`.github/workflows/ci.yml`。
Node/npm、Git、remote 設定與被忽略的 build/test artifacts 可作正常工具操作。
只 pin ATS，T00 不 import／connect SDK 或存取 MetaMask。

## Deferred next ticket — T01b (not activated)

Goal: real MetaMask guards; distinct Admin/Seller/Buyer public EVM/Hedera
bindings; deployment/config reads; a synthetic Seller VC manually signed by
Admin and accepted by the pinned Terminal3 verifier. No Equity/chain mutation.
All account/network invalidation, serialization, rejection and evidence rules
remain. Existing browser adapters must not replace SDK or VC verification.

Proposed exact files when activated: `src/main.tsx`, `src/App.tsx`,
`src/styles.css`, `src/ats.ts`, `src/guards.ts`, `src/credentials.ts`,
`src/evidence.ts`; `tests/shell.test.mjs`, `tests/ats.test.mjs`;
`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`;
`README.md`, `PRODUCT.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
`docs/evidence/**`, `docs/prompts/**`.
Direct Terminal3/ethers exact pins belong to T01b and need graph risk review.

Acceptance: real distinct accounts on chain 296; missing/rejected wallet,
duplicate/wrong accounts, wrong chain and switches; live Resolver/Factory
bytecode; config integer payload >= 1; manual Admin VC accepted with
expired/tampered/wrong-subject credentials rejected; persisted/exportable
whitelist evidence without full VC/signature or invented transaction IDs.
Manual checks remain pending until actually performed. Then document exact
T02 allowed files; do not start T02 in T01b.

Documentation routing amendment only: the above documentation allowance also
covers `docs/ai-usage/**` and `docs/ATTRIBUTION.md`; `AI_USAGE.md` stays the index.
The goal, code-file scope and acceptance remain unchanged. This section was
moved from the handoff during the approved documentation maintenance.
