# T04 manual verification / recovery repair — September 8, 2026

- Active ticket remains T04; manual acceptance is Pending. The user supplied
  the pending/held-state/recovery-error screenshots during guided acceptance.
  The original creation hash and base block came from the user's screenshot.
  No full VC, wallet profile, secret or private signer was requested or used.
- Codex followed the existing Ponytail scope and traced the shared recovery
  guard. Public RPC/Mirror reads showed a successful transaction whose consensus
  second differs from the block-start second. A failing regression reproduced
  the guard's mistaken equality requirement. The repair matches exact Mirror
  block number while retaining all other transaction/state/identity checks;
  wrong-block evidence is explicitly rejected. No SDK or dependency repair.
- Files: `src/hold.ts`, `tests/hold.test.mjs`; evidence 029 manual summary/JSON
  and original creation-error screenshot; this entry, HANDOFF, main plan and
  AI_USAGE. Existing dated evidence 028 remains unchanged. The earlier fixture
  used matching timestamps and did not expose this deployed-data difference.
- Actual checks and public recovered record are in
  [evidence 029](../evidence/029-t04-manual.md). The live recovery uses actual
  application code and public endpoints with an in-memory journal and local
  lock stub; no wallet provider or signer. ci, 87 app + 36 proto tests,
  typecheck/build and four dev/preview smoke/cancel cases validate the repair.
- Creation is independently verified; the user must still observe corrected
  preview recovery and export its result. Buyer KYC/VC, negative checks,
  execute/release and final balances are unverified. No human final acceptance
  or additional model identity is inferred. No T04 push/merge or next ticket.

## Final acceptance — September 8, 2026

- The user continued the authorized preview sequence and supplied exports
  (13)–(20) plus stage screenshots. Code/repair base is actual Git commit
  `f3dfa0ba6e07a4d282fedcee770fb936ac5728f4`; the worktree was clean before
  this documentation-only acceptance. The earlier Pending text above describes
  the prior repair stage and is superseded by this completed verification.
- Codex independently replayed all four actual transactions through recovery:
  receipt/event/full calldata, original Hold/expiry, zero value, historical
  before/after state, Mirror signer mapping, exact block/result/timestamp and
  transaction ID. A fresh isolated browser replayed both saved simulations
  using live historical RPC and the genuine SDK KYC rejection. No wallet
  profile, signer, key, transaction or signature was used by the agent.
- Final RPC block 40241114 establishes Seller 94/held 0, Buyer 6/held 0,
  valid Buyer KYC, supply/cap 100/1000, config 1 and no active Holds. T02 supply
  0 and all six T03 transactions were also reverified. Buyer VC metadata agrees
  with the grant; its positive verification remains an observed application
  result, not an independent replay of the unretained full VC/proof.
- Evidence 029 now preserves all eight supplied public exports, eight selected
  original captures, exact source hashes, independent outputs and replay
  harnesses. Pending Buyer export (16) is retained alongside complete (17).
  The original creation-error screenshot and prior repair summary/checks remain
  in the report/JSON history. The last screenshot is a completion journal;
  final current balances are independently queried. Journal row order does not
  define transaction chronology. The VC panel's signature-stage wording does
  not override the separately verified subsequent on-chain grant.
- The standalone English HTML report reuses the existing T03 report layout,
  with no framework, dependency, remote assets or application change. Checks:
  npm ci, 87 app + 36 proto tests, typecheck/build, four dev/preview smoke/cancel
  cases, two offline report widths with eight images loaded, no overflow,
  visible keyboard focus and no external requests/page errors. Detailed logs
  and protected-file hashes are retained in evidence 029.
- Changed only 029 summary/JSON/new HTML/seven remaining named screenshots,
  this entry, AI_USAGE, HANDOFF and the main plan. The existing creation capture,
  application, tests, dependencies and retained patches are unchanged. Code
  provenance and historical failures were preserved; no model or human review
  identity is invented. Native BBS/audit/peer/license/eligibility limits remain.
- T04 manual acceptance is complete. Commit these records locally and stop;
  no further signatures/transactions, push/merge or next ticket is authorized.
