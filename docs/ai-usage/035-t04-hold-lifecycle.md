# T03 integration / T04 implementation — September 7–8, 2026

- The user supplied the [T03 integration and T04 plan](../prompts/025-t04-hold-lifecycle.md),
  authorizing the T03 PR/CI/merge sequence, T04 local implementation and a later
  separate Victor acceptance record. Original tree was clean at `52deb83`.
  Codex created PR #4, checked successful CI on its exact head and merged with
  a merge commit. Remote main contained that head; T04 branch was created from
  actual merge `61c411d70235ce7d882a8b4c84150e9b3c636d8c`.
  No T04 push/merge is authorized or performed.
- Codex used Ponytail and Impeccable for this existing-console extension.
  Impeccable required a separate read-only UI reviewer, which inspected the
  four captures/source and returned ship within the create-Hold review scope.
  No human UI review, successful T04 transaction or additional model identity
  is inferred. Later screens and real MetaMask behavior remain unobserved.
- Changed source: new `src/hold.ts` and `src/transport.ts`; existing App,
  credentials, evidence, lifecycle and wallet. Changed tests: new hold/transport;
  existing lifecycle, wallet and shell. Documentation: prompt 025, evidence 028
  summary/harnesses/public JSON/four captures, this entry, HANDOFF, main plan,
  ATTRIBUTION and AI_USAGE. Exact inventories/hashes are in the validation
  manifest. No other source, dependencies, lockfile, styles or patches changed.
- The shared provider is the necessary extraction of existing T03 transport.
  Public SDK Hold/KYC requests, installed contract ABI/event exports, native
  storage/locks and genuine Terminal3 verification are reused. No private key,
  signer fixture, valid VC substitute or cryptographic bypass was introduced.
  Full credentials/proofs are memory-only; public exports are whitelisted.
- [Evidence 028](../evidence/028-t04-implementation.md) records 87 app + 36 proto
  tests, npm ci/typecheck/build, 18 SDK boundary cases plus two unsigned Buyer
  rejections, four live UI cases, four final smoke/cancel cases, live T02/T03
  historical and T04 start-state queries, and the scoped reviewer result.
  Development failures and harness corrections are preserved separately,
  including a failing lease-leak test fixed before final checks. SDK message
  strings were removed from public harness results; only selected codes and
  classifications remain. No arbitrary SDK error objects are published.
- Actual T04 starting state: block 40226582, Seller 100/held 0, Buyer 0/held 0
  and not KYC, supply/cap 100/1000. Expected final 94/6/held 0 is fixture-only.
  Native BBS, audit/peer/license and event eligibility limitations persist.
- Code and documentation form one local commit. Manual acceptance stays Pending
  until Victor performs the preview operations and each actual hash/simulation,
  public VC input and final value is independently verified in separate evidence
  029 / usage 036. Stop at T04; HANDOFF retains the exact allowed manual files.
