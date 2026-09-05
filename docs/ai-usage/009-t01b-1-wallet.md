# T01b-1 wallet slice — 2026-09-05

- 使用者核准[具體計畫](../prompts/010-t01b-1-wallet.md)：獨立 wagmi 錢包切片、固定依賴、移除頁面 ATS 入口、自動化通過可提交，真實 MetaMask 待驗。後續詢問 polyfill 並要求證據精簡，已納入。
- 起始：乾淨 `25bc5de9a6e54ae3f4a8a257055f8cb07c319d3e`，沿用 `diagnostic/t01a-sdk-load`；核對 handoff 的 b5640298 為祖先。
- Codex 依 repository evidence 與官方 wagmi 文件實作連線、Mirror guards、角色儲存及測試；套用 ponytail／impeccable。依技能要求，一個獨立 AI reviewer 檢視 UI／截圖及相關程式，結論 ship local UI；並非人工驗收。
- 程式：package.json／lock、src/main.tsx、App.tsx、styles.css、新增 wallet.ts／guards.ts、tests/shell.test.mjs／wallet.test.mjs。本輪 browser harness／evidence 為 docs/evidence/008-t01b-1-*；文件為本紀錄、AI_USAGE、HANDOFF、plan 授權、ATTRIBUTION、prompt 010。既有 ATS 程式／測試、Vite 設定及歷史證據未改。
- 實際結果：[證據摘要](../evidence/008-t01b-1-wallet.md)。npm ci／typecheck／build、9 Node tests、20 browser cases 通過；產物無 ATS／protobuf／Terminal3。真實 MetaMask／live Mirror 待 Victor。
- 既有依賴版本未改；audit 仍 83 項。完整 npm ls 有 40 既有 TypeScript peer 不符及 1 新增可選 Base peer 不符，未宣稱全樹通過或豁免風險。第一次 18 案例通過後補上同時點擊 guards，最終 20 案例已覆蓋。
- 沒有簽署、交易、秘密／錢包 profile 存取、override、scripts 核准、新 polyfill、外部訊息、公開部署、CI／真人通過宣稱、push 或 merge。T01a 仍 blocked，ATS config／VC 未啟動；未推定模型身分、專案授權或活動資格。未見賽前研究稿仍未檢視。
