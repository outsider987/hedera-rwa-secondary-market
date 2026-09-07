# T03 manual acceptance — September 7, 2026

- Implementation base: `b099e01` (verified in Git), branch `feat/t03-kyc-issue`.
  The original user plan authorizes the manual acceptance report and local
  commit, with no push/merge or T04. Initial worktree was clean.
- Victor supplied incremental MetaMask/application screenshots and public
  export paths (5)–(12). Six actual transactions and one VC signing operation
  were performed by Victor through preview. Codex supplied navigation guidance
  and later queried public RPC/Mirror only; it never signed or submitted.
- Codex reused production lifecycle recovery, transition, evidence whitelist,
  final-state and historical NOVA checks. The scratch harness used Node native
  Web Locks and an isolated in-memory journal, not a wallet/browser profile.
  All six receipts/calldata/events/historical transitions/Mirror mappings and
  IDs passed; supplied complete exports agree. SSI-only export was absent, so
  its screenshot hash was recovered. Full harness source is in evidence JSON.
- Harness's first whitelist equality assertion failed because credentialEvidence
  generates a fresh checkedAt. It now validates and preserves the supplied
  timestamp. This was a harness-only correction, before live verification;
  no app defect or chain failure is claimed.
- Final live block 40224162 passed all fixed invariants; original creation
  block 40209377 has supply 0. Public VC digest/issuer/subject/Unix dates agree
  with KYC. Full VC/proof was never retained or independently replayed.
- Files: evidence 027 Markdown/JSON/standalone HTML/eight original PNGs; this
  entry, AI_USAGE, HANDOFF and main plan. No code/dependency/patch changes.
  Ponytail guidance applied by reusing existing functions; no new framework,
  dependency, delegation or invented human review/model identity.
- Checks: npm ci, 75 app + 36 proto tests, typecheck/build, four clean headless
  dev/preview 1440/390 viewport smoke cases, public-field whitelist and report
  link/image integrity. Actual logs and original hashes are in evidence 027.
- T03 complete; stop here. Existing native BBS, 62 audit findings, peer/dfns
  license omissions and eligibility questions remain. No push/merge or T04.
