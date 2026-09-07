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
