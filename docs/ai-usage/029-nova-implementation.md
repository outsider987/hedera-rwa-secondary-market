# NOVA creation and recovery implementation — September 7, 2026

- Prompt 023 authorized T02 implementation, the bounded managed SDK patch and
  one eventual preview deployment. Victor must personally complete the retained
  T01 observations and approve every signature/transaction in MetaMask. Human
  VC/T01/NOVA results remain Pending; automation does not establish them.
- Codex applied Ponytail and the existing Impeccable console guidance, using
  native Web Locks/storage and the installed wagmi/Terminal3/ATS/ethers/viem
  stack. No new dependency or framework. A separate read-only UI reviewer found
  stale live-status copy across operation/session/storage transitions; it was
  fixed, then scored resolved after reviewing all four gate captures.
- Files: src/nova.ts, App/styles, credential memory handoff and evidence whitelist;
  scripts/patch-ats-wallet.mjs, package.json postinstall; nova/ats/shell tests;
  evidence 023 harnesses, JSON and offline gallery; HANDOFF, plan, ATTRIBUTION,
  AI_USAGE and this entry. Existing proto/read-only patch scripts, installed
  Terminal3 verifier and SDK Equity.create are unchanged.
- TDD first failed the new feature checks, then exposed missing receipt block
  binding and simultaneous provider requests crossing the guard. Both were
  repaired. Source tracing found ethers' indefinite post-send lookup retry;
  the owned provider converts a bounded lookup failure into cancellation while
  preserving its hash. Genuine SDK rejection/timeout probes verify this path.
- See evidence 023 for actual clean-install, tests, typecheck/build, managed SDK,
  UI, VC/wallet/config regression and bundle checks. ABI readback fixtures are
  explicitly synthetic; no valid VC, SDK success, chain ID or transaction result
  is fabricated as human/chain acceptance. A fixture hash is not a real transaction.
- Stop at the T02 boundary. The next action is human acceptance and recording the
  single verified NOVA result, with exact record-only files in HANDOFF. No T03,
  KYC grant, issuance, Hold, public deployment, automatic push or merge.
- Final result: 101 Node tests and 84 browser cases passed; clean install retained
  the exact lock and reproduced all three patches. Four live config reads
  returned 1. The 152-asset comparison and initial SDK/Terminal3 deferral gate
  passed. A concurrent harness shared Vite's optimizer cache and caused a dev
  HTTP 504; isolated cache/restart and full app reruns passed. Historical evidence
  remains unchanged. Current attribution table descriptions were corrected to
  describe implemented VC/NOVA uses, with human acceptance still Pending.

- Before commit, source review found unbounded SDK Mirror HTTP reads. A genuine
  SDK test first failed at its 20-second harness deadline. Within the authorized
  managed RPC adapter patch, the configured Mirror instance now uses a 10-second
  request timeout. Dev/production stalled-Mirror probes then failed safely at
  about 10 seconds with no wallet request. Mirror adapter and Equity.create
  source remain unchanged. Final verification is in evidence 023's separate
  final JSON, preserving earlier raw runs and their original hashes.
