# T01b-1：MetaMask 三帳戶操作台

已完成本機錢包切片；**真實 MetaMask 驗收待 Victor 完成，T01a 安全問題仍未解決。**

## 可以做什麼

- 手動連接 MetaMask，顯示實際地址與網路；只有 Hedera Testnet 296 可綁定。
- 經 Mirror 查詢驗證後設定 Admin／Seller／Buyer；地址與 Hedera ID 必須不同。
- 切換帳戶／網路即重新驗證；查詢逾時或失敗可手動 Retry。
- 只保存公開角色地址；重載須手動連線再驗證，儲存失敗時提示並使用記憶體。

角色設定不代表鏈上權限。本輪沒有合約讀取、簽署或交易，沒有交易 ID。

## 驗證結果

| 檢查 | 結果 |
| --- | --- |
| npm ci／typecheck／build | 通過 |
| Node 測試 | 9 通過 |
| 真實 wagmi＋模擬 provider | 20 案例通過；包含拒絕、重複點擊、切換、斷線、逾時、舊回應、儲存異常 |
| dev／preview × 桌面／手機尺寸 | 通過；鍵盤焦點、排版、重載無自動連線；無非預期外部請求 |
| 瀏覽器產物 | 無 ATS／protobuf／Terminal3；JS 約 304 kB |
| 依賴差異 | 新增 8 個套件位置；既有套件版本未變，無新 advisory ID |

自動化使用合成帳戶及 Mirror 回應；手機只驗排版，沒有真人或真實錢包通過的宣稱。

## 尚未完成

- Victor：以桌面 MetaMask 驗證三個不同帳戶、拒絕連線、切網、斷線及重載。
- 安全：audit 仍有原有 83 項／104 個位置（含 2 critical）。protobuf 在 ATS 解碼接回前處理；Terminal3／BBS／tar 在 VC 或相關安裝變更前處理。
- 完整依賴樹：`npm ls --all` 失敗；40 個既有 TypeScript peer 不符，另增 1 個未使用的可選 Base wallet peer 不符（2.4.0／要求 ^2.5.1）。未擅自改版。

## 查核與重現

[測試與差異摘要](008-t01b-1-verification.json) · [瀏覽器結果](008-t01b-1-browser.json) ·
[套件差異](008-t01b-1-lock-diff.json) · [peer 比較](008-t01b-1-peer-comparison.json) ·
[audit 前](008-t01b-1-before-audit.json)／[後](008-t01b-1-after-audit.json) · [產物清單](008-t01b-1-bundle.json)

執行 `npm ci`、`npm test`、`npm run typecheck`、`npm run build`。
另開 dev／preview，再以外部 Playwright 執行：

```sh
node docs/evidence/008-t01b-1-browser.mjs /absolute/path/to/playwright/package.json NEW-result.json
```

基準 `25bc5de9a6e54ae3f4a8a257055f8cb07c319d3e`；[使用者授權](../prompts/010-t01b-1-wallet.md)。
