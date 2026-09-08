# Matching roadmap planning — September 8, 2026

Based on `b2e489b0881d4317880a0eb8fcc2d7a9632a4852`; branch docs/matching-plan.
[User request](../prompts/028-matching-planning.md) approves planning the matching
stage. Codex read AGENTS, effective HANDOFF, Git status/history, the applicable
original plan and supplied prompt, T05 contract and package settings. The supplied
record explicitly names Go CLOB/PostgreSQL; no unseen pre-event document was read.

Delivered [draft 003](../plans/003-matching-engine.md): Go core T06, durable
Go/PostgreSQL order service T07, matched ATS/HBAR integration T08. Proposed
price-time priority, partial fills, cancellation, self-trade, deterministic
replay, idempotency, integer boundaries and tests. T06 proposed files are exact;
T07/T08 need their own implementation specs. Core proposals do not claim funds
reservation, order authentication or settlement. The old fixed swap stays closed.

Changed only six planning/provenance files listed in the prompt. Verified local
links and diff formatting. No code changed, dependencies installed, test suite
rerun or new chain read/mutation performed. Go binary discovery is not a release
support check; supported exact toolchain selection precedes implementation.
No T06 implementation approval, public push/merge or next live trade is inferred.
