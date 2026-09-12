# Submission readiness — September 12, 2026

Base: `7f5eb8ecd97aebd8a5a90edd27c7d660cd38b82f`, verified Git HEAD.

Victor requested “還沒好的先幫我處理” after the submission audit. He then
explicitly authorized pushing/merging the completed version into main and
publishing existing contract sources to Sourcify/HashScan for verification:
“可以，兩項都處理”. This activates this bounded submission-preparation ticket;
older local-only/no-merge boundaries do not prohibit these approved actions.

## Scope

- Replace stale judge-facing summaries with the completed T08 and deployed
  application, preserving original dated evidence and Git history.
- Prepare English submission fields, Hedera integration/feedback and accurate
  AI/video disclosures. Do not invent submitted URLs or dashboard completion.
- Reproduce existing compiler artifacts; prepare only their declared public
  source files/metadata. Verify existing Testnet contracts through Sourcify,
  preserving compiler settings, notices and exact on-chain identities.
- Include the already implemented static showcase in the Pages artifact.
- Run pinned validation, push the existing feature branch, open a PR, require
  final-head CI success, then merge with history preserved and verify main/Pages.

Exact implementation/documentation files: README.md, docs/SUBMISSION.md,
docs/SUBMISSION_FIELDS.md, docs/DEMO.md, docs/ARCHITECTURE.md,
docs/SOURCE_VERIFICATION.md, docs/VIDEO.md, docs/ATTRIBUTION.md,
docs/HANDOFF.md, AI_USAGE.md, this plan, docs/ai-usage/073-submission-readiness.md,
docs/evidence/057-submission-readiness.md/.json,
docs/evidence/057-contract-verification.json,
docs/evidence/057-submission-browser.json,
scripts/verify-public-contracts.mjs, tests/source-verification.test.mjs,
.github/workflows/pages.yml. Scratch compiler requests and browser checks stay
in the current Codex task's work/ directory, outside the repository.
User-facing video/checklist deliverables stay in that task's outputs/ directory.

No application trading, SDK, contract, dependency, account, database, cloud API,
asset, wallet or chain mutation is authorized. No new contract deployment,
private signer, credential access, retrospective evidence rewrite, destructive
history operation or automatic transaction retry. No ETHGlobal final submission.

## Human decisions

Project license remains a human choice. Victor subsequently clarified that no
pre-event draft existed: he discussed topics with GPT and generated a draft
later. Record this dated correction without erasing earlier history or claiming
independent eligibility review. Do not select a license. The retained video
accelerates only waits and labels them; this is not organizer confirmation of
an exception to the published video rules.

## Acceptance

- Current documents agree with T08 evidence and live deployment. Local links
  resolve and historical/fixture/manual claims are clearly distinguished.
- npm ci, npm test, typecheck, main/showcase builds and pinned contract artifact
  checks pass. Browser checks cover dev/preview and published read-only entry
  points; no wallet or simulated test transaction is used as live acceptance.
- Source publication is gated on locally checked source hashes, compiler
  settings and deployment runtime; retain exact service responses and disclose
  anything not verified. No guessed “verified” state or altered bytecode.
- Merge only the reviewed final branch SHA after required CI; no bypass or
  force push. Verify the deployed main revision and public URLs afterward.
- Update handoff and AI usage with actual outcomes before final commits.
  Next ticket and allowed implementation files: none until separately requested.

## Completion

Local validation and all three source-verification jobs passed. PR9 merged the
CI-passing head with history preserved; main `f411075` then passed CI and Pages,
followed by three public-browser cases. Evidence057 records actual IDs and
HashScan observations. The final documentation-only closeout is based on that
verified main revision. Licensing and the authenticated event submission remain
human decisions outside this completed implementation ticket.
