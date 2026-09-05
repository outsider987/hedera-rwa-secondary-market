# T01a protobufjs bounded trial — user instruction, 2026-09-05

The user asked Codex to implement the supplied previous agent's plan in a fresh
context, treating it as user intent and carrying it through verification.
The plan named current HEAD `ecf219c`; Git confirmed the actual clean start as
`ecf219c4690072757da8d165e3af36903cc43ee9` on `diagnostic/t01a-sdk-load`.
This is direct authorization for the experiment, without another approval or
MetaMask action. No model identity or earlier review is inferred.

## Supplied plan, preserved

### T01a：protobufjs 限定修補試驗

確認修補版能否安全替換 SDK 使用的舊版資料編解碼套件。交付可重跑的測試、
修補結果與明確結論。先保存目前版本與测试基準，只調整指定 protobufjs，
檢查資料相容性、異常輸入與瀏覽器載入；通過則保留修補並列出其他阻礙，
失敗則還原本輪依賴修改並留下重現方式與診斷。本輪仍屬 T01a。

- 候選固定 **protobufjs 7.6.5**，目前完整漏洞清單的最低修補版本，含
  [選項解析無限迴圈修補](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-j3f2-48v5-ccww)。
- 只 override `@hashgraph/sdk@2.64.5`、`@hashgraph/proto@2.18.5`、
  `@hiero-ledger/sdk@2.79.0`、`@hiero-ledger/proto@2.25.0` 的 protobufjs。
  此為唯一 override 例外；既定 ATS／框架／執行環境 pins 不變，既有 gRPC
  protobufjs 7.6.6 不降版。UI、應用介面與交易 evidence 格式不變，不修改
  上游套件 source 或重新產生解碼器。
- 保存前後完整 audit、lockfile 差異、瀏覽器套件清單；確認三個受影響安裝
  位置已修補，沒有未解釋的無關版本變動。
- 分別測兩套 proto 公開入口，以合成 AccountID、ContractID、Timestamp、
  Key 比較編碼；含超過 JS 安全整數範圍數值，確認精度与解碼一致。
- 截斷、過深未知群組、巢狀 Key／KeyList 使用獨立子程序與固定逾時；
  逾時、stack overflow、接受超深資料不能算通過。
- npm ci／test／typecheck／build；沿用無錢包的隔離 browser 檢查 dev／preview、
  桌面／手機、真實 SDK 載入、重複操作防護、reload、零錢包存取／外部請求。
- 特別以測試檢查 SDK 內建舊解碼程式；runtime 更新不一定補上其巢狀限制。
  參考 [上游 decoder](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.6/src/decoder.js)。
- 程式修改限 package.json、package-lock.json、既有 browser harness；新增單一
  Node 內建測試檔及結果於 `docs/evidence/005-t01a-protobuf*`，不覆寫歷史 evidence。
  同步更新 HANDOFF、plan 本輪授權、來源揭露、AI_USAGE 索引及獨立 work item。
- 安裝衝突、不相容、安全失敗或候選未涵蓋的新漏洞時停止；還原本輪依賴，
  保留診斷／mentor 問題，不擴大修補。通過提交修補，失敗提交診斷；文件與成果
  一起 commit，乾淨交接，不自動合併 draft PR。
- B1 通過也不代表 T01a 完成；Terminal3／tar 等阻礙保留，T01b 未啟動。

The text above preserves the supplied requirements in a compact transcription;
the original user message is the authority. The unseen pre-event master plan
was neither supplied nor inspected in this work.
