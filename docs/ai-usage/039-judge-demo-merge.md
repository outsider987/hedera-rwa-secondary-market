# Judge documentation integration — September 8, 2026

Base: `6a65097d8f2b6a3abd585e2eab56ef51421427b6`; branch `docs/judge-demo`.
Victor requested “合併推送吧”, superseding the previous local-only boundary for
this branch's integration into main.

Codex verified clean status, the documented base's ancestry, fetched main
`f50cc999402b6ec7e6dbe8a0888fe5bf2062d2e1` and absence of an existing PR.
Only this record, AI_USAGE, HANDOFF and the main plan change for integration.
[Evidence 030](../evidence/030-judge-demo.md) retains 24 link checks, npm ci,
87 app + 36 proto tests, typecheck/build and six console/gallery browser cases.
No source, dependency, original evidence or judge-facing document changes.

Push the branch, open a PR, require successful CI on the final head, use a merge
commit and verify remote main ancestry. The workflow repeats pinned installation,
npm ci, tests, typecheck and build; GitHub PR/check history records the actual
outcome and merge hash. No result is predicted in this pre-merge record.
No further implementation, transaction, signature or recording is activated.

## Additional request during integration

Victor requested “且你幫我畫出文字流程跟架構圖給我看下 存下來我晚點看”.
The same PR now includes `docs/ARCHITECTURE.md` and one README link, extending
the original integration-only scope. Codex traced actual Hold/credential/SDK/
provider/readback callers and saved the recorded sequence plus a Mermaid system
diagram. No application code, dependency, original screenshot or evidence changed.
The diagram identifies browser logic, MetaMask, Testnet RPC, Mirror and public
storage; it makes no application-server, payment or market-completion claim.
The previous “no judge-facing document changes” sentence describes the scope
before this explicit addition. Final-head CI must cover the added diagrams.

Local validation: git diff --check passed; all README/architecture local targets
exist; the flow contains exactly four transaction steps, one signature and
three read-only attempts. Module relationships were checked against source.
Mermaid markup was reviewed locally; no local Mermaid renderer was installed.
Existing tests/browser validation remain in evidence 030; PR CI will repeat the
mandatory install/test/typecheck/build gate on the final documentation head.
