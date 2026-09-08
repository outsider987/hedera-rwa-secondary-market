# T05 atomic trade — September 8, 2026

Base: `d85d19ca95fef467abf327a0620372c9b9f9ea88`, verified merged main;
branch `feat/t05-atomic-trade`. Victor supplied the full
[T05 plan](../prompts/027-t05-atomic-trade.md), authorizing the single fixed
payment contract, contract tooling, UI reorganization and tests. The scope
supersedes previous payment/custom-contract deferrals only for this ticket.
He fixed the three accounts, original NOVA, 10 shares / 1 HBAR, 24-hour expiry,
manual MetaMask approvals, pinned dependencies and local-commit boundary.

Codex read repository status/history, effective handoff, applicable shared
plan rules and the T02–T04 evidence/source summaries before implementing.
It saved the supplied prompt, T05 specification, UI direction and exact allowed
files before code changes. No unseen pre-event file was imported or verified.
Ponytail guided reuse of existing reads, providers, locks and journals;
Impeccable guided the native Trade / History / Settings surface within Victor's
fixed navy/light/system-font brief. No branding exercise, generated image,
motion, UI package, dependency upgrade or upstream patch change was made.

AI assistance produced the new Solidity swap and local VM suite, reproducible
artifact build/check, guarded T05 orchestration/recovery, whitelist evidence,
the three-page interface and Node/browser checks. It inspected installed ATS
8.0.0 Hold semantics and genuine SDK requests and consulted primary Hedera unit
and Mirror documentation. Human approval is not inferred from automated tests.
No real T05 transaction, VC signature or human acceptance occurred in this work.

Changed implementation files: `contracts/NovaHbarSwap.sol`,
`contracts/test/NovaHbarSwap.t.sol`, `foundry.toml`, `scripts/build-swap.mjs`,
`src/swap-artifact.json`, `package.json`, `.github/workflows/ci.yml`,
`src/trade.ts`, `src/TradePanel.tsx`, `src/App.tsx`, `src/styles.css`,
`src/hold.ts`, `src/transport.ts`, `src/evidence.ts`, `tests/trade.test.mjs`,
`tests/hold.test.mjs`, `tests/transport.test.mjs`, `tests/shell.test.mjs`.
Changed documentation: T05 plan/prompt, DESIGN, PRODUCT, README, DEMO,
ARCHITECTURE, ATTRIBUTION, HANDOFF, main plan, this record and AI_USAGE;
evidence 031 report, validation JSON, three runnable browser/read harnesses,
their JSON outputs and six page screenshots. The validation inventory records
exact paths and protected-file comparisons.

[Evidence 031](../evidence/031-t05-implementation.md) distinguishes actual
local checks, live public preflight, controlled SDK responses and outstanding
human acceptance. It retains development corrections for the relay log range,
the SDK KYC probe assumption, stale shell expectations and browser capture
timing. No test response or simulation is represented as an actual transaction.
A fresh Impeccable finish reviewer found a cancellation-review account indicator
comparing against the normal Buyer stage instead of the reviewed Seller role.
Codex corrected the shared role selection and added an actual-component render
regression. The reviewer's final `ship` disposition covers that correction;
it does not assert manual acceptance or contract security. The subsequent
documenter is restricted to DESIGN.md by the user's exact file scope.

Victor's next action is the Admin review on preview 4173, followed only after
verified recovery by Seller's new Hold and Buyer's payment, with the required
read-only rejections. Unknown outcomes, changed state, expired KYC or pinned
incompatibility stop progress. Manual evidence 032 remains uncreated until
observed. Stop at local T05 commits; no push, merge or next ticket.

## Deployment recovery correction — September 8

Base `2c7146ca76e5d16e664cf7f02609eb2314db2f61`. Victor supplied
`holdbook-public-evidence (21).json` and screenshots of a successful recovery
with a conflicting closed-swap message. Codex inspected only that public
export, source and public chain data. It confirmed successful deployment and
Open (0), traced the false message to an old component snapshot surviving
manual recovery, and cleared that snapshot before journal updates. The fresh
readiness requirement and all transaction guards remain. No new transaction,
signature, contract, dependency or SDK change occurred.

Changes: TradePanel, the existing browser harness/results, evidence 031's
report/validation additions, manual evidence 032 MD/JSON and Victor's supplied
deployment capture, HANDOFF, main plan, this entry and AI_USAGE. The live
browser regression replays the public hash with no wallet and verifies the
stale-state sequence. Actual checks are appended to evidence 031; historical
implementation results above remain dated history. Next manual stage is Seller
Hold creation; complete T05 acceptance remains Pending.
