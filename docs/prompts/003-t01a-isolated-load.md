# T01a isolated SDK loading authorization — 2026-09-05

Source: the continuing user/assistant conversation after the blocked T01a
triage. The re-imported ATS-first plan retains the T00–T04 specification;
repository evidence confirms T00 is already complete. This record changes
only the T01a diagnostic gate, not asset parameters or later ticket scope.

## Decision and exact approval

User: 「那接下來要做什麼？」

The assistant proposed:

> 建議下一步先做 **T01a 的隔離 SDK 載入診斷**：
>
> 1. 保持所有依賴版本，加入手動「Load ATS SDK」按鈕及載入狀態。
> 2. 在 dev、production preview 驗證官方 SDK 能否載入，全程不接錢包、不呼叫鏈上服務。
> 3. 保存成功結果或具體錯誤；需要改版、override 或 polyfill 時停下，整理給 mentor。
>
> **載入成功不代表漏洞已修復**；依賴風險的處理決策完成後，才能進 T01b 的 MetaMask／config／VC 驗證。
>
> 目前需要你核准上述隔離診斷範圍，因為現有 handoff 明確要求先取得這項決策。暫時不用操作 MetaMask。

User approval, verbatim: **“Go”**.

This explicitly permits the described isolated diagnostic despite unresolved
B1/B2. It does not approve a dependency repair, vulnerability waiver for wallet
use, package changes, polyfills, deep imports, SDK stubs, signatures or T01b.
No mentor or human code review is claimed.

## Implementation / acceptance boundary

- Base: `03d1a34e4faa13e6a93e0ac2365efabee4c6a3ee`; clean main.
- Allowed source: `src/App.tsx`, `src/ats.ts`, `tests/shell.test.mjs`,
  `tests/ats.test.mjs`.
- Necessary tooling only: `package.json`, `package-lock.json`, `tsconfig.json`,
  `vite.config.ts`; all dependency and runtime versions remain unchanged.
- Records: `README.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
  `docs/plans/001-ats-first.md` (this policy amendment only),
  `docs/evidence/**`, `docs/prompts/**`.
- No styling, design-system files, AGENTS, CI or unrelated source changes.
- Manual official package-root dynamic import; verify the Management function
  exists without calling it or initializing Network. Idle/loading/loaded/failed
  states, one attempt per page load, safe failure text, reload resets to idle.
- Node unit doubles may exercise state logic only; they are explicitly not SDK
  readiness evidence. Real browser checks must use the official unmodified SDK.
- Run npm ci/test/typecheck/build and isolated dev/preview checks, desktop and
  mobile, with outbound traffic blocked and no real wallet/profile. Record
  attempted external traffic/provider access as a failed isolation check.
- Preserve diagnostics if compilation or import fails. Do not work around a
  required polyfill, change versions, or start T01b. Publish only curated public
  error fields; do not expose complete SDK/error objects or environment data.
- Save evidence and AI attribution with the work in an English boundary commit.
  SDK load success alone cannot close the outstanding dependency-risk gate.
