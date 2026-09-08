# T05 user-supplied implementation plan — September 8, 2026

The user asked to implement the previous agent's plan in a fresh context,
re-reading evidence and carrying it through implementation and verification.
The following is the supplied plan, preserved as the source of intent.

## T05：一筆原子買賣與介面整理

### 1. 目標與流程

固定 **10 NOVA × 0.1 Testnet HBAR＝1 HBAR**，由 Victor 在同一台電腦切換帳戶操作。

```text
Admin 部署結算合約
        ↓
Seller 鎖定 10 NOVA
        ↓
Buyer 審閱並支付 1 HBAR
        ↓ 同一筆交易
合約交付 10 NOVA ＋ 將 1 HBAR 付給 Seller
        ↓
查核收據、資產變化與付款證據
```

正常共 **三筆人工核准交易**。付款或交付失敗時整筆回滾；網路費另計。未成交前 Seller 可取消，到期後可手動取回。

沿用原 NOVA、三帳戶、chain 296、config 1、cap 1000。開始前重新確認 Seller 94、Buyer 6、双方 held 0、KYC 有效且沒有未知操作。條件不符就停止。

### 2. UI／UX

採 **Trade／History／Settings** 三個頁籤，預設進入 Trade。

```text
HoldBook                         Hedera Testnet · Buyer
Trade       History       Settings

10 NOVA                              Total
0.1 HBAR per NOVA                     1 HBAR

Setup ✓ ── Lock ✓ ── Buy ── Complete

Pay 1 HBAR and receive 10 NOVA
[ Review purchase ]

Transaction details ▾
```

- **Trade：**報價、目前進度、所需帳戶、一個主要動作。依階段切換為部署、鎖定、購買或查看成交結果。
- **History：**T02–T04 已完成紀錄、三種既有拒絕及 T05 證據。歷史標示驗證區塊，與目前餘額分開呈現。
- **Settings：**帳戶綁定、SDK、網路與合約部署資訊。交易頁只顯示是否準備完成及缺少的項目。
- 沿用深藍、淺底和系統字體；正文 16px、主要數字 36px，統一間距與細分隔線。桌面採交易主區加摘要側欄，手機改單欄。
- 完整地址、calldata、時間戳與恢復工具收合；待確認、錯誤及取消操作保持可見。送出前另顯示必要審閱與確認勾選。
- 使用英文短句，保留鍵盤操作、可見焦點及至少 44px 點擊區域。採原生導覽與收合元件，不新增 UI 套件、圖片或動畫。

### 3. 合約與應用程式

- 新增不可升級的單筆 `NovaHbarSwap` 合約，固定資產、partition、Seller、Buyer、數量與價格；建構時固定到期時間。
- 到期時間使用審閱區塊 timestamp＋86,400 秒，保留基準區塊；部署、建立 Hold 前均確認雙方 KYC 涵蓋效期。
- Seller 使用真正 ATS SDK 建立新 Hold：Escrow＝結算合約、target＝Buyer、amount＝10、data 空。Hold ID 從事件取得，不假設為 2。
- 公開方法限定 `settle(holdId)`、`cancel(holdId)`、`reclaim(holdId)`。購買限 Buyer；取消及取回限 Seller；結束後不可再次成交。
- `settle` 核對完整 Hold，先標記成交，再執行 ATS 交付及 HBAR 付款；任一步失敗皆回滾。Admin 沒有代購或提領權限。
- HBAR 使用整數計算：錢包交易 value 為 `10^18` weibars，合約收到 `10^8` tinybars；禁止浮點與隱性四捨五入。[Hedera 單位說明](https://docs.hedera.com/native/smart-contracts/ethereum-transaction)
- 重用 wallet review、session lease、Web Lock 和現有讀取能力。新增合約交易檢查，保留既有 ATS 傳送路徑的零 value 限制。
- T05 使用獨立公開 journal。送出前存 intent、取得 hash 立即保存，再做一次最長 180 秒查核；未知結果只能恢復，不自動重送。
- 部署需核對建構參數、收據及 runtime code；成交需核對同一 hash 的 ATS 事件、結算事件、Mirror 身分及 HBAR 付款。T04 入口改為唯讀歷史。

### 4. 驗收

| 階段 | Seller 可用 | Buyer 可用 | Seller held |
| --- | ---: | ---: | ---: |
| 開始 | 94 | 6 | 0 |
| 鎖定 10 | 84 | 6 | 10 |
| 成交 | **84** | **16** | **0** |

Supply 保持 100、cap 1000、Buyer held 0；Seller 收到交易本金 1 HBAR。付款證明與網路費分開核對。

- **合約測試：**成功交換、錯誤 Buyer、少付／多付、重複成交、錯誤 Hold、到期邊界、取消與購買競爭、取回、重入，以及交付或收款失敗時完整回滾。
- **應用測試：**錯誤 signer／chain／bytecode／calldata／金額單位，以及拒簽、切帳戶、跨分頁、重載、晚到 hash、逾時與 Mirror 延遲。
- **Testnet 唯讀拒絕：**成交前驗證錯誤 Buyer、錯誤付款；成交後驗證重複購買。保留原區塊與 calldata，模擬不列交易 ID。
- 執行 `npm ci`、Node 測試、typecheck、build；新增 Foundry 1.7.1／Solidity 0.8.36、Paris target 的合約測試，僅用本機 VM，無 CLI signer。
- 在 dev／preview 檢查桌面、手機、鍵盤、導覽、待確認狀態與外部請求。真人交易只在 `127.0.0.1:4173`，由 Victor 核准。
- 取消、到期與故障回滾先以本機測試驗證；真人正常流程只完成這一筆，不為補測重做 T04。

### 5. 執行與交付

從已合併 main `d85d19c` 建立 `feat/t05-atomic-trade`。先保存規格及 UI 方向，再完成合約測試、介面、自動化，最後進行真人驗收。驗收完成前標示 Pending，完成後提交英文報告、公開 JSON、截圖與更新後的架構圖；停在本地提交。

允許檔案固定如下，開始時完整記入 HANDOFF：

- 合約與建置：`contracts/NovaHbarSwap.sol`、`contracts/test/NovaHbarSwap.t.sol`、`foundry.toml`、`scripts/build-swap.mjs`、`src/swap-artifact.json`、`package.json`、`.github/workflows/ci.yml`。
- 應用與測試：新增 `src/trade.ts`、`src/TradePanel.tsx`、`tests/trade.test.mjs`；修改 `src/App.tsx`、`src/styles.css`、`src/hold.ts`、`src/transport.ts`、`src/evidence.ts`，及既有 hold、transport、evidence、shell 的 `.test.mjs`。
- 文件：新增 `docs/plans/002-atomic-trade.md`、`DESIGN.md`、T05 prompt、AI usage 與 evidence；更新主計畫、HANDOFF、PRODUCT、README、DEMO、ARCHITECTURE、ATTRIBUTION、AI_USAGE 入口。

本票僅新增這一筆買賣所需的付款合約與合約測試。既有 npm 依賴與補丁維持固定；不加入撮合、後端、多裝置同步、新資產、重新發行或公開網站部署。KYC 過期或 ATS 不相容時停止並記錄原因。
