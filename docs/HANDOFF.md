# HoldBook handoff

## Current objective / Git base

- Active ticket: **T01a — isolated SDK loading: BLOCKED**.
- 隔離診斷已實作並執行；真實 SDK 載入及 production build 均失敗。
  這是診斷邊界，不是 T01a 完成；T01b 未啟動。
- `based_on_commit: 20267d4667f829233174fe473a816ecf09a99fd2`。
- 本輪從乾淨的 `diagnostic/t01a-sdk-load` 開始，只研究及更新文件。
  隔離診斷原 base 為 `03d1a34`，已確認是 ancestor。Main 未改動。
  本分支 build 已知失敗，尚不可合併。Actual HEAD 請讀 Git，不自我引用。
- 已核對舊 base `10d69e7d2950f77e0aa4ee7a2842811fadf0f795` 與 T00 source
  `00a5dd1f0cda654167d4abe3a94f82559c30930e` 都在 Git 歷史中。
- 必讀：[active plan](plans/001-ats-first.md)、
  [原 T01a 授權](prompts/002-t01a-planning-record.md)、
  [Go 隔離診斷授權](prompts/003-t01a-isolated-load.md)、
  [B1/B2 triage](evidence/001-t01a-triage.md)、
  [B3/B4 診斷](evidence/002-t01a-sdk-load.md) 與其 browser JSON/script、audit comparison、
  [上網研究請求](prompts/004-t01a-research-request.md)、
  [具體修法與比較](evidence/003-t01a-remediation-research.md)。

## Completed / observed

- Public repo：`outsider987/hedera-rwa-secondary-market`；預設分支 main。
- T00-min 完成：guardrails `e162b24`、shell `00a5dd1`、closeout `10d69e7`。
- T01a triage `370cc0b`、CI closeout `03d1a34`；原 audit inventory 及靜態分類保留。
- Victor 已用 **“Go”** 核准具體隔離診斷，不需再次詢問相同範圍的核准。
  此決策不授權依賴修補、polyfill 或 wallet integration。
- 新增官方 package-root dynamic import、單次 promise、手動原生按鈕、
  idle/loading/loaded/failed、安全摘要；reload 不自動執行。
- Node loader tests 使用明示 doubles，測試成功形狀不代表 SDK 真實成功；
  browser 使用未修改的官方 SDK，觀察到失敗。
- 依賴版本、lockfile、SDK source、styles、CI 不變；package.json 只改 test flag。
- 沒有 account mapping、Equity、Hold、VC、鏈上識別或交易。
- 已查證官方 ATS browser polyfill／環境 adapter、Vite 8 相容 plugin，以及
  wallet-connect 2.1.3 的 dependency 修正。具體候選已記錄，尚未安裝或驗證。
  本輪沒有修改程式／依賴，也沒有重跑 runtime checks；舊失敗結果仍有效。

## Checks / blockers

- Node 24.19.0 / npm 11.17.0；npm ci exit 0：1165 installed / 1166 audited。
- npm test：5 passed；typecheck passed；Node module-mock experimental notice 保留。
- **npm run build：exit 1**，9182 modules transformed。產出的檔案不算有效 build。
- Dev desktop/mobile：真實 SDK import failed，診斷介面檢查 passed。
- Preview desktop/mobile：只檢查失敗 build 留下的輸出；import 同樣 failed。
  不得將這兩個 case 寫成 production acceptance passed。
- 四個案例驗證 idle/loading/failure/reload、disabled/duplicate guard、鍵盤焦點、
  無 overflow；0 external attempts、0 wallet trap accesses、0 unhandled errors。
- Detector `src/App.tsx`：`[]`；獨立 AI finish reviewer：**ship, diagnostic UI only**。
  Reviewer 沒有重新跑 browser，不是人類 review、SDK readiness 或 release approval。
- Screenshots 為 ignored artifacts；重現 script 與 whitelist JSON 已進 evidence。
- npm audit exit 1：78 entries（17 low / 32 moderate / 27 high / 2 critical）。
  78 advisory entries、98 安裝版本/presence 與先前一致；兩筆 moderate DFNS 的
  npm fixAvailable 建議改變，已保留 before/after；沒有新 high/critical findings。
- Lockfile SHA-256：`766b3d6d0850b8166ba5ab6c0fbfec3c2dbc6cd85ffaa93a6c37f08f172faaed`。
- **B1**：protobufjs 7.2.5 / 7.5.4 精確上游 pins，原範圍內不能修補。
- **B2**：Terminal3 optional native branch 的 tar ^6.1.11 限制仍在。
- **B3**：wallet-connect 2.1.2 將 `@hiero-ledger/proto` 只列為 devDependency；
  proto 2.25.0 只在 Hiero SDK 內層，production bundler 無法解析。
- **B4**：官方 browser import 最終拋出 `ReferenceError: process is not defined`；
  另有內部 caught require(buffer/long)、Buffer 問題及 Node built-in 警示。
- 沒有 alias、external workaround、polyfill、全域 stub、deep import、版本變更
  或安裝 script approval。B3 修好也不代表 B4 或安全風險解除。
- 歷史 triage CI run 33944789582 在 `370cc0b` 成功，驗證的是舊 shell。
  已查證 diagnostic CI run 33946158634／`20267d4`：ci/test/typecheck 成功，
  build 失敗。本輪只有研究文件，沒有修復該失敗；新 HEAD 結果另讀 GitHub。

## Next action — resolve T01a

研究已提出最小候選：保留 ATS 8.0.0／wallet-connect 2.1.2，直接補 proto
2.25.0，使用支援 Vite 8 的 polyfill plugin 0.28.0 與必要 browser adapters。
這是可供決策的實驗，尚非已驗證修法；wallet-connect 2.1.3 還有 adapter
行為變更，故不是優先升級方案。Exact proposed files／驗收見
[research proposal](evidence/003-t01a-remediation-research.md)。

由 Victor／mentor 決定是否採用該具體 T01a 實驗，以及 B1/B2 風險處理。
沒有向 mentor 發送訊息，沒有驗證或批准候選 override、package change、polyfill。
已核准的隔離診斷不需重複核准；跨出這個範圍才需要新決策。

在決策前只整理既有診斷與決策文件；不要反覆安裝同一 graph 期待改變，
不要開始 T01b。若新決策更改 scope，先記錄 exact allowed files／acceptance。

### T01a exact allowed files / remaining acceptance

- Source：`src/App.tsx`、`src/ats.ts`。
- Tests：`tests/shell.test.mjs`、`tests/ats.test.mjs`。
- Necessary tooling：`package.json`、`package-lock.json`、`tsconfig.json`、
  `vite.config.ts`；既定 pins 與禁止新 package／polyfill 的邊界仍適用。
- Records：`README.md`、`AI_USAGE.md`、`docs/HANDOFF.md`、
  `docs/plans/001-ats-first.md`（ticket/policy only）、`docs/evidence/**`、`docs/prompts/**`。
- 不改 AGENTS、CI、styles、design-system files、services 或 unrelated source。
- 尚未通過：dependency/security 決策與 B3/B4 處理；成功 production build；
  dev 與有效 preview 的真實官方 import，確認 Management function 存在且不呼叫。
- 修法獲准後才實作；重驗 npm ci/test/typecheck/build、無 outbound/provider 的
  browser cases，保留 before/after audit、runtime、bundle 證據。
- 更新 handoff／AI usage，英文 ticket-boundary commit 並確認乾淨工作樹。
  未通過就繼續標 blocked，不能以診斷 UI 的 ship 判定代替 SDK readiness。

## Deferred next ticket — T01b (not activated)

Exact goal: real MetaMask guards, three public EVM/Hedera account bindings,
live deployment/config reads and one synthetic Seller VC manually signed by
Admin and accepted by the pinned Terminal3 verifier. No Equity or other chain
mutation. Original T01 account/network invalidation, serialized operations,
evidence whitelist and rejection/invalid credential checks remain required.

Proposed allowed files when activated: `src/main.tsx`, `src/App.tsx`,
`src/styles.css`, `src/ats.ts`, `src/guards.ts`, `src/credentials.ts`,
`src/evidence.ts`; `tests/shell.test.mjs`, `tests/ats.test.mjs`;
`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`;
`README.md`, `PRODUCT.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
`docs/evidence/**`, `docs/prompts/**`.
The previously approved exact Terminal3/ethers direct pins belong to T01b,
not T01a; dependency risk must be rechecked when activating that graph.

Acceptance: observed distinct public accounts on chain 296; missing wallet,
rejection, duplicate account, wrong chain and account/network change guards;
live Resolver/Factory bytecode; config integer payload >= 1 with no fallback;
manual Admin VC signature accepted, tampered/expired/wrong-subject rejected;
whitelisted persisted/exportable evidence with no full VC/signature or invented
transaction IDs. Manual checks stay pending until Victor actually performs them.
Then document exact T02 allowed files; do not start T02 in that ticket.

## Victor's pending actions

- Review the concrete candidate and alternatives in the remediation research.
  Research is complete; implementation is not approved or verified.
  Isolated diagnostics are already authorized;
  overrides, package changes and polyfills are not. No mentor message was sent.
- No MetaMask action is needed now. Prepare three distinct public accounts and
  Testnet HBAR for T01b only; never share keys, seeds or wallet/profile files.
- Resolve pre-event planning eligibility with organizers and choose a project
  license before claiming an open-source submission.

## Run / handoff boundary

`npm ci`, then `npm run dev` at http://127.0.0.1:5173 .
`npm run build` currently fails. Preview at http://127.0.0.1:4173 can inspect
only files emitted by that failed build; it is not production acceptance.
Use an isolated browser without secrets or wallets. Do not assume old server
processes or ignored browser artifacts survive context handoff.

No Go, PostgreSQL, CLOB, matching, payment leg, mainnet, custom contracts, real
identity collection, public web deployment, branding/animation or automated
signing/retries. No T01b integration until T01a's compatibility/security gates are resolved.
