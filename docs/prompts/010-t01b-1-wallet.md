# T01b-1 accepted implementation plan — 2026-09-05

The user requested implementation in a fresh context, treating the supplied plan
as intent and completing implementation and verification. Starting Git HEAD:
`25bc5de9a6e54ae3f4a8a257055f8cb07c319d3e`; clean branch
`diagnostic/t01a-sdk-load`. Supplied plan preserved below. No unseen pre-event
draft was supplied or inspected.

## User-supplied plan

# T01b-1：使用 wagmi 完成 MetaMask 與三帳戶操作台

## 目標

先交付能實際連接 MetaMask、辨識 Hedera Testnet、設定 Admin／Seller／Buyer 的本機頁面。

採用 **wagmi 管理錢包連線與帳戶／網路狀態**，搭配 viem、TanStack Query，符合其[官方整合方式](https://wagmi.sh/react/getting-started)。wagmi 不會修復 ATS 的 protobuf 問題；本輪移除頁面的 ATS 載入入口，讓這部分功能可以獨立完成。

## 實作

- 固定新增 `wagmi 3.7.7`、`@tanstack/react-query 5.102.8`，將既有 `viem 2.56.3` 列為直接依賴。保留其餘既定版本，不新增 override。
- 使用 wagmi 的 `injected({ shimDisconnect: false })`，預設驗收環境是只安裝 MetaMask 的桌面 Chrome。關閉多錢包探索、wagmi 儲存及載入時自動重連；使用者按下 Connect 才請求連線。[自動重連設定](https://wagmi.sh/react/api/WagmiProvider)
- 使用 `useConnect`／`useConnection` 顯示實際地址及 chain ID。只接受 `296 / 0x128`；錯誤網路提示使用者自行切換，連線呼叫不附帶自動切網要求。
- 移除現有 Load ATS SDK 按鈕及 App 的 ATS import，保留 NOVA 計畫資訊與「尚無交易」狀態。本輪不讀合約、不簽署、不送交易，也不載入 Terminal3。

## 三帳戶與查詢行為

- 每個角色提供 **Use current account** 與 **Clear**。只有目前帳戶在正確網路且通過 Mirror 查詢時才能綁定；三個角色的 EVM 地址及 Hedera ID 都須不同，替換前先清除。
- 固定向 Testnet Mirror 的 `/api/v1/accounts/{evmAddress}?limit=1` 查詢；驗證回傳地址相符、Hedera ID 格式正確且未刪除，不從數字 ID 推導地址。
- TanStack Query 管理查詢；使用取消訊號與 10 秒逾時，關閉自動重試、背景輪詢及視窗重新聚焦／網路恢復時刷新。錯誤提供手動 Retry。
- 帳戶、網路或連線改變時取消舊查詢並清除驗證狀態，過期結果不得覆蓋新狀態；符合條件後重新驗證。
- `holdbook.testnet.roles.v1` 只保存三個角色的公開 EVM 地址。重載顯示「已保存、待驗證」，手動連線後重新查詢；儲存不可用時維持記憶體操作並提示。角色設定不宣稱擁有鏈上權限。

## 驗收

- 執行 `npm ci`、`npm test`、typecheck、build；檢查新增依賴、audit 差異及 lockfile，避免無關版本變動。
- Node 內建測試涵蓋 Mirror 回應驗證、重複角色、儲存異常；瀏覽器使用真實 wagmi 搭配模擬 provider，涵蓋未安裝、拒絕、重複點擊、帳戶／網路切換、斷線、逾時及過期回應。
- 驗證 dev／preview 的桌面與手機尺寸。確認重載不自動請求錢包、沒有簽署／交易／自動切網，以及除指定 Mirror 查詢外沒有外部請求。
- 檢查產物不包含 ATS、protobuf 或 Terminal3 模組。
- Victor 最後以真實桌面 MetaMask 驗證三個不同帳戶、切網及重載；手機僅驗收排版。自動化通過可以提交成果，真人驗收未做須明確標記待完成。

## 範圍、TODO 與交接

- 程式變更限套件 manifest／lock、`src/{main.tsx,App.tsx,styles.css,wallet.ts,guards.ts}`、`tests/{shell,wallet}.test.mjs`，以及本輪瀏覽器驗證腳本與 evidence；保留既有 ATS 診斷程式。
- 更新計畫授權，明確允許這個獨立錢包切片。**T01a 仍未通過**：protobuf 在重新接入 ATS 解碼前處理；Terminal3／BBS／tar 在 VC 接入或相關安裝變更前處理，本輪不再嘗試修補。
- AI_USAGE 維持短索引，本輪只新增一份工作紀錄，記載修改、人工決策及實際檢查；保存使用的計畫與 prompts，歷史 evidence 不覆寫。
- 實作從當時 Git HEAD 開始，沿用目前分支；文件與成果一起提交，保持乾淨交接，不自動 push／merge，也不接著實作 ATS config 或 VC。

## In-flight user question

User: 「Browser polyfills 這對我們有沒有幫助」

Codex explained that the existing browser polyfills helped earlier ATS loading
by supplying Node APIs, but do not repair protobuf decoding or Terminal3/tar
installation risks. The current slice adds no polyfill and retains the approved
configuration. Final bundle evidence identifies the remaining process shim.
The question did not cancel or expand the active T01b-1 implementation.

User: 「這個證據是不是太長了,總覺得評審不會看而且廢話太多」

Codex shortened this round's evidence summary, handoff and AI usage entry;
kept implementation results, actual checks and outstanding gates prominent,
with raw machine evidence linked for inspection. Historical records unchanged.
