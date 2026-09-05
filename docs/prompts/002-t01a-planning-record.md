# T01a planning / implementation authorization — 2026-09-05

Source: this repository's continuing user/assistant conversation after T00.
This is not a pre-event research document. No secrets were supplied or copied.

## Human decisions

- User: 「那你計畫下一輪吧」.
- Scope selection: 「先做 T01a (Recommended)」 — security and SDK loading only.
- Dependency policy selection: 「僅原範圍內更新 (Recommended)」 — existing upstream
  dependency ranges only; no overrides or direct version-pin changes.
- User: 「我想確認我們commit msg 是用英文嗎？」. Confirmed English commit messages,
  type(scope): description; Chinese documentation remains allowed.
- User: 「Ok 繼續」. The assistant restated the implementation plan in Plan Mode.
- Execution authorization: **“Implement the proposed plan.”**

## Approved implementation brief

### T01a — 依賴安全與 ATS 載入驗證

完成依賴漏洞分類、相容修補，以及 ATS 8.0.0 在 dev／production preview 的
真實載入驗證。維持既定直接依賴與 Node/npm pins；只允許原上游版本範圍內的
間接依賴更新。不得使用 override、自動強制修補、新增套件或全面批准安裝腳本。
不連 MetaMask、不呼叫鏈上服務、不簽署 VC、不進入 T01b。

1. 重讀規則與 handoff，確認 Git HEAD、工作樹及既有驗證紀錄。
2. 重跑 audit，保留全部警示清單；逐項分類 critical/high 的依賴路徑、
   觸發條件與實際適用性，優先追查 protobufjs、tar。
3. 僅針對已確認漏洞更新符合上游範圍的間接依賴，避免無關 lockfile 變動。
   超出允許範圍即保存診斷、停止並交 Victor/mentor 決定。
4. 安全分類允許隔離測試後，在現有頁面加入 Load ATS SDK 按鈕與
   未載入／載入中／成功／失敗狀態。
5. 透過官方入口動態 import，確認 Management.resolveLatestConfigVersion
   為函式，但不呼叫、不初始化 Network。禁止 mock、私有 deep import
   或空模組代替真實載入。
6. 防止重複載入、禁止自動重試；重新整理回到未載入。錯誤僅顯示安全摘要。

驗收：npm ci/test/typecheck/build；Node 內建測試覆蓋載入狀態、失敗與
重複操作；dev/preview 真實載入、桌面/手機與鍵盤操作；無未處理錯誤、
wallet provider 呼叫或外部請求；保存 audit 前後比較、路徑與 bundle 大小。
未解風險標明適用性或阻塞，不宣稱整體安全。若需新增 polyfill、繞過
官方入口或超範圍修補，T01a 標 blocked，不前進。

允許檔案：src/App.tsx、src/ats.ts；tests/shell.test.mjs、tests/ats.test.mjs；
必要 tooling package.json、package-lock.json、tsconfig.json、vite.config.ts；
README.md、AI_USAGE.md、docs/HANDOFF.md、docs/plans/001-ats-first.md、
docs/evidence/**、docs/prompts/**。計畫只補記拆票與修補界線。

Commit message 統一英文，依實際成果命名；沒有完成修補就不使用修補成功
的描述。最終 commit 同時包含 evidence、AI attribution、handoff；push 後
確認 CI 與乾淨 Git 狀態。記錄 T01b 的精確範圍與未解門檻，本輪不執行它。

## Applied boundary

Exact upstream protobufjs pins triggered the approved stop condition before
any dependency change or SDK import. See [T01a triage](../evidence/001-t01a-triage.md).
This is a blocked ticket closeout, not a completed SDK integration.
