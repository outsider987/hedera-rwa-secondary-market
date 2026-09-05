# HoldBook handoff

## Current objective / Git base

- Active ticket: **T01a — browser loading fixed; dependency security BLOCKED**.
- Victor 的第二次「go」核准具體 browser remediation；已完成該實驗。
  T01a 的安全門檻尚未解除，T01b 未啟動。
- `based_on_commit: daed90b3353094f003b487a053cfa119fcefc11a`。
- 本輪從乾淨的 `diagnostic/t01a-sdk-load` 開始；舊 base `20267d4` 已核對
  為 ancestor。Main 仍是 `03d1a34`，actual HEAD 由 Git 讀取。
- 必讀：[active plan](plans/001-ats-first.md)、
  [最新 go 授權](prompts/005-t01a-remediation-decision.md)、
  [本輪驗收](evidence/004-t01a-remediation.md)、
  [audit/lock 比較](evidence/004-t01a-audit-comparison.json)、
  [bundle membership](evidence/004-t01a-bundle.json)、
  [browser 結果](evidence/004-t01a-browser.json)、
  [原安全 triage](evidence/001-t01a-triage.md)。
- 歷史來源：[研究](evidence/003-t01a-remediation-research.md)、
  [原載入失敗](evidence/002-t01a-sdk-load.md)、
  [原隔離診斷授權](prompts/003-t01a-isolated-load.md)、
  [T01a 初始決策](prompts/002-t01a-planning-record.md)。

## Completed / verified

- Public repo `outsider987/hedera-rwa-secondary-market`；預設 main。
- T00 完成：guardrails `e162b24`、shell `00a5dd1`、closeout `10d69e7`。
  T01a triage `370cc0b`／`03d1a34`、失敗診斷 `20267d4`、研究 `daed90b`。
- 新增 direct proto 2.25.0 與 dev polyfill plugin 0.28.0；原 framework／ATS／
  Node/npm pins、wallet-connect 2.1.2 不變，沒有 override。
- 新增 Vite 8 設定與 dotenv／Winston browser adapters。Vite 不讀 env 檔；
  logger 只輸出固定 level 摘要，不讀取 SDK payload／formatter；檔案 transport
  明確拒絕。這些不是完整 Winston API，後續不得假設支援檔案 logging。
- `src/ats.ts`／`src/App.tsx`、styles 與 CI 未改。仍是手動官方 root import，
  只確認 Management function 存在、不呼叫，單次 promise、不自動重試。
- Node 24.19.0 / npm 11.17.0；npm ci 成功，1242 installed / 1243 audited。
- npm test：6 passed；typecheck passed（含新 Vite config）；build passed，
  9246 modules transformed。另一次 build 的所有 asset hashes 完全相同。
- Dev／有效 production preview 的桌面與手機四案例真實 SDK 載入成功；
  idle/loading/success/reload、duplicate guard、鍵盤/focus、無 overflow 通過。
  每案 0 wallet accesses、0 external HTTP/WebSocket attempts、0 unhandled errors。
- 新 browser JSON 保存在 004；舊 002 失敗 JSON 不覆寫。既有 harness 已改驗收
  真實成功。最初 matcher 標點錯誤已修正，沒有為測試改 app 的成功條件。
- 開啟 dev desktop／preview mobile 兩張截圖。無本輪額外 agent／人類 review。
- 沒有 MetaMask、帳戶綁定、config 讀取、VC、Equity、Hold 或交易識別。

## Remaining risks / limits

- **B3 resolved**：proto 2.25.0 現在可由 wallet-connect 正常解析。
- **B4 resolved for isolated import**：process／Buffer 等 browser 需求已補足。
  某些 dependency 的 caught feature probes 仍存在；載入不驗證未來 SDK API。
- **B1 unresolved**：protobufjs 7.2.5／7.5.4 的上游 exact pins 仍在；兩版本
  都有 rendered bundle modules。Root 版本變動是 peer placement，不是安全修復。
- **B2 unresolved**：Terminal3 optional native branch 的 tar ^6.1.11 仍在 lock。
  本機最終未安裝、bundle 無該 native/tar module，不代表所有平台安裝安全。
- Audit：78 → 83 套件項、98 → 104 affected locations；17 → 22 low，
  32 moderate / 27 high / 2 critical 不變。5 個新增 low 為 polyfill 路徑的
  elliptic 聚合項，沒有任何漏洞被修復或豁免。
- Bundle 亦含 Fireblocks axios 0.27.2、Terminal3 BBS、elliptic 6.6.1。
  靜態 inclusion 不等於已執行／可利用，但不能宣稱未進 browser bundle。
- 主 SDK chunk 8,759,902 bytes／1,643,345 gzip；所有 JS chunks 15,738,454 bytes。
  大型 chunk 與 vm-browserify direct-eval warnings 保留。
- 七個未批准 install-script notices、Node module-mock experimental notice 保留。
  沒有批准 script、暴露 host environment、秘密／wallet profile 或任意 SDK 日誌。
- Remote CI 以目前 Git HEAD 的 GitHub Checks 為準；本節記錄本機實際驗收，
  不沿用歷史綠燈。Draft PR #1 保留，沒有合併 main 或部署網站。

## Next action — T01a security decision, not T01b

已授權的 browser remediation 已實作，不需再次詢問同一項核准。下一步只針對
剩餘安全風險提出具體且有依據的修補／風險決策；bundle 證據已可供 Victor／
mentor 評估。沒有向 mentor 發送訊息。Go 沒有放行其他直接依賴、override、
SDK 升降版、漏洞豁免或 wallet integration。

目前可整理 records；有具體新修法決策才實作，不重跑不變的 graph 期待不同結果。
保持 T01a blocked，不能以載入成功代替安全門檻或完整 ATS readiness。

### T01a exact files / remaining acceptance

- 本輪實作 files：`package.json`、`package-lock.json`、`vite.config.ts`、
  `tsconfig.json`、`src/compat/dotenv.ts`、`src/compat/winston.ts`、
  `tests/ats.test.mjs`、`docs/evidence/002-t01a-browser.mjs`。
- Records：`README.md`、`AI_USAGE.md`、`docs/HANDOFF.md`、
  `docs/plans/001-ats-first.md`（scope only）、`docs/evidence/**`、`docs/prompts/**`。
- 修復驗收已完成；剩餘 acceptance 為適用 dependency/security 風險處理及決策。
  若決策改 package／source，先記 exact 範圍，重驗 ci/test/typecheck/build、
  isolated dev/preview、audit diff、bundle membership 及原有安全防護。
- 不改 AGENTS、CI、styles、design-system、unrelated source，不開始 T01b。
- 英文 boundary commit 同時含 handoff／AI usage／證據；保持乾淨工作樹。

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

## Victor actions / running locally

- Review remaining B1/B2 and bundle-exposed risks with the concrete evidence.
  No MetaMask action is needed for the current slice.
- Later prepare three distinct public accounts and Testnet HBAR. Never share
  private keys, seeds or wallet/profile files.
- Resolve pre-event design eligibility with organizers; select a project
  license before claiming an open-source submission.

Run `npm ci`, then `npm run dev` at http://127.0.0.1:5173 . For production,
`npm run build` then `npm run preview` at http://127.0.0.1:4173 . Use an isolated
browser without secrets/wallets; click Load ATS SDK manually. No .env needed.
Read servers from actual processes; do not assume old sessions are running.

No Go, database, CLOB, matching, payment leg, mainnet, custom contracts, real
identity collection, public deployment, branding/animation or automated signing.
