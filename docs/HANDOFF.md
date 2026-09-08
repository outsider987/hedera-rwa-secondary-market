# HoldBook handoff

## Judge documentation integration authorized — September 8, 2026 (effective)

- `based_on_commit: 6a65097d8f2b6a3abd585e2eab56ef51421427b6` is the verified documentation
  base. Victor requested “合併推送吧”, authorizing push and CI-gated merge of
  `docs/judge-demo` into main. This supersedes its earlier local-only boundary.
- Retain a merge commit, require CI success on the final PR head and verify
  remote main contains it. GitHub PR/check history records the actual outcome.
- Integration edits only `docs/ai-usage/039-judge-demo-merge.md`, AI_USAGE,
  HANDOFF and the main plan. [Evidence 030](evidence/030-judge-demo.md) remains
  the documentation validation record; application and evidence are unchanged.
- Victor additionally requested a saved text flow and architecture diagram.
  Include `docs/ARCHITECTURE.md` and its README entry in the same PR; these two
  files extend the integration scope above. Cross-check against actual source
  and evidence; final-head CI must include this addition.
- Stop after integration. No new transaction, signature, recording or next
  implementation is activated; no next source files are allowed.

## Judge presentation documentation — September 8, 2026 (effective)

- `based_on_commit: f50cc999402b6ec7e6dbe8a0888fe5bf2062d2e1` is verified merged main;
  branch `docs/judge-demo`. T04 PR #5 merged as this commit after CI passed on
  cbc9e18 (run 34174595841). Earlier integration/local-only sections are history.
- Victor requested concise English operating instructions, a demo script and
  report entry points, using existing evidence with no repeated transactions.
  [README](../README.md) is the judge entry;
  [DEMO](DEMO.md) supplies the two-minute script, balances and three rejections.
  PRODUCT now reflects completed T02–T04 rather than the original T00 shell.
- Exact scope: README, PRODUCT, DEMO, prompt 026, evidence 030 MD/JSON,
  usage 038, AI_USAGE, HANDOFF and the main plan. Original evidence, source,
  tests, dependencies and patches stay unchanged. Validation is recorded in
  [evidence 030](evidence/030-judge-demo.md): 24 links, ci, 87 + 36 tests,
  typecheck/build, four console and two gallery browser cases passed. A wallet-
  free preview read at block 40241802 confirmed 94/6 and both held 0.
- The walkthrough opens existing reports/screenshots without a wallet; optional
  current reads use Check current T04 state. It performs no new transaction or
  VC signature. Acceptance remains the dated block 40241114, not a promise that
  current KYC or an empty browser journal will show the same status.
- Stop at this documentation task and commit locally. No push/merge or next
  implementation is activated. No next source files are allowed. Existing
  native BBS, audit/peer/license and event-eligibility limitations remain.

## T04 integration authorized — September 8, 2026 (effective)

- `based_on_commit: b1212e6b80b6f52f15be7e526aa6b3ddf0a3b994` is the verified
  completed-acceptance base. Victor explicitly requested “好推送合併吧”. This
  supersedes earlier T04 push/merge prohibitions for this integration only.
- Push `feat/t04-hold-lifecycle`, open a PR to main with evidence 028/029,
  require CI success on the final PR head, merge with a merge commit and verify
  remote main ancestry. GitHub PR/check history records the resulting hashes
  and outcome; do not infer completion from this authorization record.
- Only `docs/ai-usage/037-t04-merge.md`, AI_USAGE, HANDOFF and the main plan
  change for integration. Application and acceptance evidence remain unchanged.
  See [integration record](ai-usage/037-t04-merge.md).
- T04 acceptance remains complete at block 40241114. No further transaction,
  signature or next implementation ticket is activated; no next source files
  are allowed. Existing limitations remain in evidence 029.

## T04 manual acceptance complete — September 8, 2026 (effective)

- `based_on_commit: f3dfa0ba6e07a4d282fedcee770fb936ac5728f4` is the verified
  code/repair base for this acceptance. Read final HEAD from Git; branch remains
  `feat/t04-hold-lifecycle`. No T04 push or merge was performed.
- [Evidence 029](evidence/029-t04-manual.md), [public verification JSON](evidence/029-t04-manual.json)
  and [standalone screenshot report](evidence/029-t04-manual.html) retain eight
  supplied exports (13)–(20), eight original captures, the earlier repair and
  independent verification. Victor performed four preview MetaMask transactions
  and one Buyer VC signature; the agent only queried public services.
- Final independent block **40241114**: Seller **94 / held 0**, Buyer **6 / held
  0**, valid Buyer and Seller KYC, supply/cap **100/1000**, config **1**, no active
  Seller/Buyer Hold IDs. All four receipts/events/full calldata, expiry basis,
  historical transitions and Mirror identities/transaction IDs agree. Release
  proves held 0 and ID removal without a deleted-Hold getter. Original Hold 1
  expiry remained 1788886129, based on block 40227946 / 1788799729 +86400.
- Both negative records were independently replayed against their historical
  blocks, including genuine SDK AccountNotKycd, exact KYC revert, non-Escrow and
  excessive-amount reverts with unchanged full state. They have no transaction
  ID/signature. Buyer public digest, issuer, subject and Unix dates agree with
  grant metadata; the VC ID agrees with calldata and the getter. Full VC/proof
  was not retained or cryptographically replayed; positive application
  verification is observed in the screenshot/export.
- T02 supply 0 at 40209377 and all six T03 historical transactions reverify
  independently of current Buyer KYC. Latest supplied screenshot is the
  completion journal, not a balance table; final values above are live RPC reads.
- Documentation-only acceptance: npm ci, **87 app + 36 proto tests**,
  typecheck/build, four dev/preview smoke/cancel cases and two offline report
  viewport checks pass. Application, tests, dependencies and patches are
  unchanged. Native BBS, audit/peer/dfns license and pre-event eligibility limits
  remain. No payment settlement or completed secondary market is claimed.
- **Stop at T04. No further transactions, signatures, push/merge or next ticket.**
  No next implementation is activated; no source files are allowed for a next
  ticket. Additional T04 evidence is limited to existing 029 report/JSON/HTML
  and its eight explicitly named captures, usage 036, AI_USAGE, HANDOFF and the
  main plan. Any new work requires separate explicit activation.

Earlier Pending/current-boundary sections below are dated history superseded
by this completed acceptance; the recovery defect and repair remain preserved.

## T04 creation verified / recovery repair — September 8, 2026 (current)

- `based_on_commit: 0c45b8994fdc151702d348ab37233b08d1ca47b6` is this repair's
  implementation base; read actual HEAD from Git. T04 branch remains local.
- User screenshots supplied Create Hold 10 hash
  `0x9c3fe919cd41945554fa5677eefb8f1730c8b9a404d0766b50a9638f26b2611e`
  and reviewed base block 40227946. [Evidence 029](evidence/029-t04-manual.md)
  records partial acceptance and the original recovery-error screenshot.
- Root cause: recovery incorrectly equated transaction consensus seconds with
  block-start seconds. The narrow repair matches Mirror block_number to the
  receipt block and keeps exact hash/calldata/result/sender/state checks.
  Regression fails before repair, passes afterward, and rejects wrong blocks.
  ci, 87 app + 36 proto tests, typecheck/build and four smoke/cancel cases pass;
  actual original-hash recovery independently verifies Hold 1 at block 40227994,
  Seller 90 / held 10, Buyer 0 / held 0, supply 100. No agent mutation/signature.
- **Next Victor action:** reload preview 4173, use Select T04 query then Query
  T04 transaction for the saved creation, and export its complete public result.
  Keep original Admin selected for Review next T04 action / un-KYC negative
  check. Do not create another Hold or prepare Buyer VC before that check passes.
- Manual acceptance remains Pending for all subsequent stages and final 94/6/
  held 0. Continue only the exact manual files listed below (029 report/JSON/
  HTML/named captures, usage 036, AI_USAGE, HANDOFF and main plan). Concrete
  repairs remain limited to the already authorized source/tests with failing
  evidence. No T04 push/merge or next ticket. Prior no-T04-transaction statements
  describe the implementation stage and are superseded by this actual creation.

## T04 code delivered / manual acceptance Pending — September 8, 2026 (current)

- `based_on_commit: 61c411d70235ce7d882a8b4c84150e9b3c636d8c` is the verified
  merged-main base; actual implementation HEAD is available from Git. Branch
  `feat/t04-hold-lifecycle`. T03 PR #4 is merged; T04 remains local only.
- [Evidence 028](evidence/028-t04-implementation.md) records delivered fixed
  Hold/KYC/execute/release controls, 87 app + 36 proto tests, ci/typecheck/build,
  18 genuine SDK boundary cases plus two unsigned Buyer VC rejections, four
  live UI cases/captures and four final smoke/cancel cases. Dependencies and
  retained patches are unchanged. Separate UI review ships the captured
  create-Hold reviews only; later real stages remain unobserved.
- Public readback at block 40226582: Seller available 100 / held 0, Buyer
  available 0 / held 0 and not KYC, supply/cap 100/1000, config 1. T02 creation
  supply 0 and all six T03 historical transactions were reverified. No T04
  transaction or VC signature was performed. Manual acceptance is Pending.
- **Victor's next action:** open preview http://127.0.0.1:4173, select original
  Seller, and use Review next T04 action for Create Hold 10. Review the expiry
  seconds, fixed inputs and checkbox before manually approving MetaMask.
  Hash receipt triggers one full readback (180-second deadline). Export the
  public result. Then select original Admin for the displayed negative KYC
  check, Buyer VC preparation/sign/verify, Buyer KYC, permission/amount checks,
  execute 6 and release 4. Each next review and approval remains manual.
- Unknown/submitted/indexing-pending results require the original hash query;
  never rebuild or resubmit. Lost creation intent requires its reviewed base
  block; missing Buyer VC digest requires its original public JSON export.
  Restore does not accept imported completion as chain proof. Cancel only stops
  reads; it cannot cancel an existing transaction. Expired Hold/KYC or unexpected
  state stops without renewal, reclaim, new issuance or dependency repair.
- The next work item is **T04 manual verification only**, using the exact 029
  evidence / 036 usage files listed in the activation below, plus HANDOFF,
  AI_USAGE and the main plan. No manual report has been fabricated. Concrete
  defects may be repaired only in the already enumerated source/test scope with
  failing evidence. Do not start another ticket or push/merge T04.
- Acceptance requires every actual receipt/event/full calldata/Mirror identity,
  historical transition and simulation to agree with screenshots and public
  JSON. Final Seller 94 / Buyer 6 / both held 0, Buyer valid KYC, supply/cap
  100/1000 and active Seller Hold removal remain unverified. Native BBS,
  audit/peer/dfns license and unresolved pre-event eligibility limits remain.

## T04 activation — September 7, 2026 (effective)

`based_on_commit: 61c411d70235ce7d882a8b4c84150e9b3c636d8c` is the verified
merged-main base, not this document's commit. Branch: `feat/t04-hold-lifecycle`.
The supplied T03 integration / T04 plan explicitly supersedes older stop and
merge prohibitions for this scope. PR #4 merged by merge commit after the exact
head 52deb83f0989f955c593150b081b00105066a5ea passed CI run 34138783453;
remote main contains it. T03 is complete; T04 code/automation is active and
manual acceptance is Pending. No T04 push or merge is authorized.

Exact allowed implementation files (enumerated before implementation):
`src/hold.ts`, `src/transport.ts`, `src/App.tsx`, `src/styles.css`,
`src/wallet.ts`, `src/guards.ts`, `src/credentials.ts`, `src/lifecycle.ts`,
`src/nova.ts`, `src/evidence.ts`, `src/ats.ts`;
`tests/hold.test.mjs`, `tests/transport.test.mjs`, `tests/wallet.test.mjs`,
`tests/guards.test.mjs`, `tests/credentials.test.mjs`, `tests/lifecycle.test.mjs`,
`tests/nova.test.mjs`, `tests/evidence.test.mjs`, `tests/ats.test.mjs`,
`tests/shell.test.mjs`.
Exact documentation files: `docs/prompts/025-t04-hold-lifecycle.md`,
`docs/evidence/028-t04-implementation.md`, `docs/evidence/028-t04-validation.json`,
`docs/evidence/028-t04-development.json`, `docs/evidence/028-t04-sdk-browser.mjs`,
`docs/evidence/028-t04-sdk-browser.json`, `docs/evidence/028-t04-ui-browser.mjs`,
`docs/evidence/028-t04-ui-browser.json`, `docs/evidence/028-t04-live-read.mjs`,
`docs/evidence/028-t04-live-read.json`, `docs/evidence/028-t04-5173-1440.png`,
`docs/evidence/028-t04-5173-390.png`, `docs/evidence/028-t04-4173-1440.png`,
`docs/evidence/028-t04-4173-390.png`, `docs/ai-usage/035-t04-hold-lifecycle.md`,
`docs/HANDOFF.md`, `docs/plans/001-ats-first.md`, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.
Separate subsequent manual evidence: `docs/evidence/029-t04-manual.md`,
`docs/evidence/029-t04-manual.json`, `docs/evidence/029-t04-manual.html`,
`docs/evidence/029-t04-create.png`, `docs/evidence/029-t04-kyc-negative.png`,
`docs/evidence/029-t04-buyer-vc.png`, `docs/evidence/029-t04-buyer-kyc.png`,
`docs/evidence/029-t04-permission-negative.png`, `docs/evidence/029-t04-execute.png`,
`docs/evidence/029-t04-release.png`, `docs/evidence/029-t04-final.png`,
`docs/ai-usage/036-t04-manual.md`, AI_USAGE, HANDOFF and the main plan.
No dependencies, lockfile, patches, other modules or asset parameters may change.

Use original NOVA 0.0.10402368, three accounts, chain 296, config 1, cap 1000
and default partition. Seller creates Hold 10, Escrow Admin, zero target,
empty data, expiration fixed at reviewed latest chain timestamp +86400 seconds.
Save base block and seconds; derive safe decimal Hold ID from HeldByPartition.
Admin-connected SDK execute 6 must reject Buyer KYC; identical calldata/from
Admin eth_call must return the exact KYC revert with unchanged state. Then
Admin prepares/reviews/manually signs/verifies Buyer VC (seven days, five-minute
backdate) and grants KYC through the genuine SDK. After KYC, read-only Seller
execute 6 and Admin execute 11 must reject for escrow and balance respectively.
Admin executes 6 and releases 4. Release targetId is original holder Seller.
Normally four transactions and one Buyer signature, all manually approved by
Victor on preview http://127.0.0.1:4173. Dev supports VC and reads.

Before each mutation recheck wallet/session, expected signer role, fixed inputs,
full asset/roles/KYC/Hold/balances, exact calldata and zero value. Never switch
bindings to impersonate another role. Reuse leases/Web Lock; persist public
intent before send, save late hashes, perform one automatic full recovery with
a total 180-second deadline after hash. Unknown/indexing delays remain pending;
only explicit queries, no automatic resubmission. Separate public transaction
and simulation evidence; simulations have no transaction ID. No full VC/proof.
Existing/unknown work requires original hash recovery; changed/expired state or
pinned incompatibility stops for diagnostics, with no renew/reclaim/patch.
T02 supply 0 and T03 completed history remain historical, independently of T04.

TDD with Node built-in runner and genuine SDK network boundaries; no keys or
fabricated valid VCs. Check all fixed-input/signature/calldata guards, VC binding
and negative semantics, races/rejection/late hashes/reload/timeout/Mirror delay,
full-release event/zero held/active-ID removal, history and evidence whitelist.
Run npm ci/test/typecheck/build, dev/preview desktop/mobile, keyboard and request
scope checks. Code commit keeps human acceptance Pending. Separate actual
verification must establish Seller 94, Buyer 6, both held 0, Buyer valid KYC,
supply/cap 100/1000 and every transaction/simulation/public VC input. Stop at T04;
no next ticket or automatic push/merge. Existing native BBS/audit/peer/license
and event eligibility limitations remain.


## T03 manual acceptance complete — September 7, 2026

- `based_on_commit: b099e01` is the implementation base; actual HEAD remains available in Git. Branch `feat/t03-kyc-issue`.
- [Evidence 027](evidence/027-t03-manual.md), [public verification JSON](evidence/027-t03-manual.json) and [standalone screenshot report](evidence/027-t03-manual.html) retain eight user screenshots, exports (5)–(12), and independent live verification of all six actual transactions. Victor performed the preview MetaMask operations; the agent queried only.
- Final block **40224162**: three Admin roles present and issuer registered; Seller KYC valid, available **100**, held **0**; Buyer not KYC, balance/held **0**; supply/cap **100/1000**, config **1**. T02 history remains supply **0** at creation block **40209377**. Receipt/calldata/events, historical transitions, Mirror sender mappings/results/IDs and public VC digest/dates agree.
- VC signature and full credential were not retained or independently replayed. The original screenshot/export establish observed application verification. The latest screenshot is a journal, not a current balance capture; final values are independently queried. SSI role was recovered from the screenshot hash because no separate SSI export was supplied in (5)–(12).
- Documentation-only acceptance: npm ci, 75 app + 36 proto tests, typecheck/build and four dev/preview smoke cases. No application, dependencies or patches changed. Existing native BBS/audit/peer/license/eligibility limits remain; details and harness correction are in evidence 027.
- **Stop at T03. No further signatures or issuance; no push/merge or T04.** No next implementation ticket is activated and no source files are allowed for a next ticket. Any additional T03 evidence is limited to existing 027 report/JSON/HTML, `docs/evidence/027-t03-*.png`, `docs/ai-usage/034-t03-manual.md`, AI_USAGE, HANDOFF and the main plan. T04 requires separate explicit activation with exact files and acceptance checks.

The code-stage Pending sections below are historical and superseded by this acceptance.

## T03 code delivered / manual acceptance Pending

- `based_on_commit: daf7dcc8e443277f0a64e87bc283f48cc7456325` is the verified merged-main base; read actual HEAD from Git. Branch: `feat/t03-kyc-issue`.
- [Evidence 026](evidence/026-t03-implementation.md) records implementation, 75 app + 36 proto tests, ci/typecheck/build, 20 SDK boundary cases, four live UI cases, 28 VC regressions, four final smoke cases and scoped UI reviewer ship. Dependencies/patches are unchanged.
- T02 creation is closed and its getters now read creation block 40209377 (historical supply 0). T03 current block 40214540 has supply/balances/held 0, missing three roles and issuer, no Seller/Buyer KYC. No T03 transaction or signature was performed.
- The console offers sequential fixed Admin roles, issuer, verified Seller KYC and issue 100 with exact calldata/state checks, a shared signature/transaction Web Lock, public intent/hash persistence and historical receipt/Mirror recovery. Changed or unknown supply never enables another issue.
- **Next action remains T03:** Victor connects original Admin on preview 4173, checks/reviews/approves one action, queries its hash, then checks again. After issuer registration, prepare/review/sign/verify Seller VC. Export each public operation; retain screenshots. Never sign through CLI.
- Exact manual-record files: new `docs/evidence/027-t03-manual.md`, `.json`, `.html`, screenshot files `docs/evidence/027-t03-*.png`, new `docs/ai-usage/034-t03-manual.md`; `AI_USAGE.md`, `docs/HANDOFF.md`, `docs/plans/001-ats-first.md`. Concrete T03 defects may be repaired only within the already-authorized source/test scope below, with failing evidence; no dependency/patch changes.
- T03 closes only after every actual hash/receipt/event/Mirror record and final Seller 100/held 0, Buyer not KYC/balance 0, supply/cap 100/1000 and exact KYC inputs agree. No push/merge or T04. Native BBS, 62 audit findings, peer/license/eligibility limits persist.

## T03 activation — September 7, 2026 (current)

The user supplied and authorized the T03 implementation plan. Base is merged
main `daf7dcc8e443277f0a64e87bc283f48cc7456325`; branch `feat/t03-kyc-issue`.
This supersedes earlier T03 activation prohibitions only. T02 is complete.
Reuse NOVA 0.0.10402368 / 0x261ce349df182988fa25d00868cf6cf434220c24.
Real mutations are preview-only http://127.0.0.1:4173; Victor manually approves
every transaction and the Admin-to-Seller VC signature in MetaMask.

Exact allowed files: new `src/lifecycle.ts`, `tests/lifecycle.test.mjs`;
necessary existing `src/{App.tsx,styles.css,nova.ts,evidence.ts,wallet.ts,guards.ts,ats.ts,credentials.ts}`
and corresponding existing `tests/*.test.mjs`; new `docs/evidence/026-t03-*`,
`docs/prompts/024-t03-kyc-issue.md`, `docs/ai-usage/033-t03-kyc-issue.md`;
`docs/HANDOFF.md`, this plan, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.
No dependencies, lockfile, SDK/protobuf patches, asset parameters or other files.

Sequence: fresh asset/deployment/three-account/config/cap/restriction readback;
individually grant missing ISSUER, SSI_MANAGER, KYC roles to Admin; register
Admin issuer if absent; prepare/review/manually sign/verify synthetic Seller VC;
SDK grantKyc (UTF-8 JSON/Base64 copy, real internal verification); SDK issue
exactly 100 using default partition and empty data. All transactions require
fresh review, zero value, exact calldata and the existing wagmi/session lease.
Persist public intent before send and hash immediately; serialize all T03 tabs
with a preview Web Lock. Unknown/submitted operations permit recovery only.
Receipt/event/calldata/Mirror sender and state must agree. Existing KYC/issuance
without evidence requires an existing hash, never overwrite or resubmit.
Pre-issue supply, Seller/Buyer balance and held must all be zero; no top-up.
T02 uses creation-block getters; unavailable history stays incomplete. T03
shows current values independently. Full VC/signature stays in memory only.

TDD and npm ci/test/typecheck/build plus dev/preview desktop/mobile, keyboard,
request-boundary and race/recovery checks are mandatory. Never fabricate valid
VCs or use private keys. Existing native BBS, audit/peer/license limitations
remain. Code/automation commit may mark manual acceptance Pending; only a
second evidence commit after Victor's actual transactions and final readback
may complete T03. No push/merge, new asset, Buyer KYC, Hold or T04.

Final acceptance: Admin has three roles and issuer registration; Seller KYC
issuer/ID/dates match its grant; Seller available 100, held 0; Buyer not KYC,
balance 0; supply/cap 100/1000. Preserve historical evidence and failures.

The following current-boundary text is historical and superseded for T03 activation.

## Current boundary / Git base

**T02 complete: Victor manually signed accepted Seller VCs on dev and preview,
attested to all retained T01 checks, and approved one preview NOVA deployment.
Independent receipt/event/current-getter/Mirror verification passed 56 checks.
Do not create another NOVA or advance to T03.**

- `based_on_commit: 526de706a9fc4290d18e50011cbbe7c8060016a9` is the PR integration
  base, verified in Git history; read actual HEAD from Git.
  Branch remains `diagnostic/t01b-4-sdk-config`. Victor explicitly authorized
  report consolidation/push, then explicitly requested merge on September 7.
  [PR #3](https://github.com/outsider987/hedera-rwa-secondary-market/pull/3)
  integrates this branch into main after CI passes, preserving commit history.
- [Evidence 024](evidence/024-vc-nova-manual.md), its public JSON and offline
  screenshot gallery preserve actual acceptance, original export/mismatch,
  repair and independent live results. T01 checkbox selections are operator
  attestations, not independent reproductions of every temporal behavior.
- Security ID **0.0.10402368**, address
  `0x261ce349df182988fa25d00868cf6cf434220c24`.
  Transaction hash
  `0xe1af1387ee185773e012a0e77b5c90ccffc5906ff46a1ac1dbb575b58c1ca05e`.
  Hedera transaction ID `0.0.7314364-1788760174-678049391`;
  consensus `1788760179.255892685`. Cap 1000, supply 0, config 1 and Admin's
  default management role match; rights are verified from the deployment event.
- Chrome 152.0.7977.76 / MetaMask 13.46.1 were operator-entered. Positive VC
  screenshots/public export establish observed application verification;
  full credentials/signatures were neither retained nor independently replayed.
- A real T02 readback defect was repaired within Prompt 023 authorization:
  Mirror reports the sender's numeric EVM form. Both that exact lookup and
  Admin's alias resolve to active account 0.0.10389090. `src/nova.ts` now reuses
  strict account validation after lookup; `tests/nova.test.mjs` covers wrong,
  deleted, missing and matching mappings. No local alias derivation or weakened
  transaction guard. Original mismatch remains in evidence 024.
- Clean npm ci, 65 app + 36 proto tests, typecheck/build and four live browser
  recovery cases (dev/preview at 1440/390 px) pass. After ci, dev was restarted
  to clear stale optimizer imports; failed and successful checks are in 024. Dependency lock and retained patch
  scripts are unchanged. Preserve evidence 021–023 and their historical results.
- Desktop ECDSA only; native BBS excluded. Remaining 62 audit findings, peer
  incompatibilities, dfns license omissions and event eligibility questions are
  not waived. No KYC grant, issuance or Hold was performed.

## Consolidated report / latest supplied export

[Report 025](evidence/025-t02-followup.md) links a standalone HTML report with
10 original screenshots, public downloads and all 56 verified comparisons.
Victor's latest `(3).json` still reports the historical sender mismatch at block
40209380; it is preserved separately and is not called a successful final export.
The repaired independent result at block 40209603 and four browser recoveries
remain the completed verification. No post-repair human export/screenshot was
supplied. Current report checks and source hashes are in evidence 025.

## Next action / exact allowed files (current)

Victor may reload preview 4173 and press **Query NOVA transaction** for the
saved hash, then export the complete public result. Reload invalidates the VC
but does not erase the transaction; querying does not need another VC signature.
Never clear the operation to create again. Dev can query the same asset.

The integration ticket finishes by merging PR #3 after CI passes and verifying
remote main contains its merge commit. No source changes are part of integration.
The implementation/acceptance ticket stays closed. Optional additional user
captures may be recorded in `docs/evidence/026-t02-followup.{md,json,html}`,
`docs/ai-usage/033-t02-followup.md`, `AI_USAGE.md`, `docs/HANDOFF.md` and
`docs/plans/001-ats-first.md` only. No additional implementation files are
activated. T03 requires a new explicit activation and exact scope first.

The sections below are historical. Their Pending states and older activation
prohibitions are superseded by Prompt 023 and evidence 024; their evidence and
acceptance requirements remain preserved.

## Historical boundary / Git base

The following records are historical; Prompt 023 and the current section above
control activation and support scope. The manual acceptance checklist remains
current and mandatory.


**The isolated B2 candidate passed 15 security/caller checks, 89 existing tests, 20 SDK browser cases and four unsigned VC browser cases. Its audit falls from 80 to 62, with zero affected Terminal3-closure entries. No dependency repair is retained; full B2 remains open because native binary compatibility is unverified. VC/NOVA and remaining human acceptance are unfinished.**

- `based_on_commit: 9d9f62f8fd1a4aa2b24069937540a8f5da4579fa` (trial base, not the commit containing this handoff). Previous base `6a331f32404f07c977a0aecc14a41bcd9fc59797` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`. Victor's “開始吧” activated the isolated trial in Prompt 022. His later push request was completed first: origin was verified at `9d9f62f`. Commit trial records locally; no automatic additional push/merge or next-ticket implementation. Read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). No acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest activation/outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current isolated B2 trial | [Trial evidence](evidence/020-b2-dependency-trial.md), [Prompt 022](prompts/022-b2-dependency-trial.md) |
| Prior B2 research | [Readiness evidence](evidence/019-b2-vc-readiness.md), [Prompt 021](prompts/021-b2-vc-readiness.md) |
| Current main-app SDK controls and checks | [Integration evidence](evidence/018-t01b-4-sdk-integration.md), [Prompt 020](prompts/020-t01b-4-sdk-integration.md) |
| Retained patch, isolated transport checks and limits | [Trial evidence](evidence/017-sdk-readonly-trial.md), [Prompt 019](prompts/019-sdk-readonly-trial.md) |
| Original public API gaps / repair rationale | [Read-only options](evidence/016-sdk-readonly-options.md) |
| Historical SDK failure / mentor questions | [Prerequisite evidence](evidence/015-t01b-4-sdk-config.md) |
| Retained decoder repair | [Decoder evidence](evidence/014-t01a-decoder-rebuild.md) |
| npm lock-resolution decisions | [npm resolution evidence](evidence/013-t01a-npm-resolution.md) |
| Delivered application and accepted config scope | [Config evidence](evidence/010-t01b-3-config.md), [Prompt 012](prompts/012-t01b-3-config.md) |
| Wallet behavior and prior dependency findings | [Wallet evidence](evidence/008-t01b-1-wallet.md) |
| Original schema hashes / compatibility oracle | Evidence 007 inventories and restored tests, referenced directly by the generator/test scripts; the stopped trial remains historical |
| Provenance / current sources | [AI_USAGE](../AI_USAGE.md), [ATTRIBUTION](ATTRIBUTION.md) |

## Verified / remaining requirements

- The original **deployment-only action** retains its viem check verifies RPC chain 296, fixed Testnet Mirror contract IDs and runtime bytecode. Resolver `0.0.9212226` resolves to `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` (2,115 bytes); Factory `0.0.9213391` to `0xd1f118a40f3b02883d35909ef2517e7edd78379d` (390 bytes). The four live trial-017 preflights confirmed these values. They are observations, not broader ABI/SDK compatibility guarantees.
- The app uses viem to read `getLatestVersionByConfiguration(bytes32)` from the verified Resolver for Equity config ID `0x0000000000000000000000000000000000000000000000000000000000000001`. The result must be bigint in 1..Number.MAX_SAFE_INTEGER and is recorded as a decimal string, not an SDK payload. Latest trial preflights returned version `1`; requery before creating NOVA.
- Existing app reads are wallet-independent, manually triggered, cancellable and never automatically retried/refreshed. One 10-second deadline covers the complete operation. Each attempt hides prior verification; stale/error results cannot restore it, and reload clears it. CCIP Read is disabled. Factory failure does not hide an independently verified config, but overall deployment success requires all three results. Reads use latest state, not a shared block snapshot.
- **Local SDK trial passed:** twelve published ESM/CJS/type files across four logical targets are protected by original/patched SHA-256 and ATS version 8.0.0. All files are checked before writes; clean installation reapplies the patch and reapplication changes zero. The genuine `SetNetworkRequest` is now exported, and optional `rpcNode.queryProvider` reaches `RPCQueryAdapter`. Original request validation and default provider construction remain intact. This is a disclosed local adaptation, not an upstream-supported API.
- **Main-app SDK controls:** press `Prepare ATS SDK`, then `Check SDK config`. Preparation imports the actual patched public SDK/ethers and validates a genuine request without initializing Network or requesting a wallet. Each check repeats the fixed viem preflight and feeds its fresh Resolver EVM address to `Management.resolveLatestConfigVersion`. Only a safe integer payload >= 1 is displayed. Viem version and SDK payload have separate labels/statuses; SDK failure never becomes an SDK success through the viem result.
- One 10-second deadline is passed into the existing preflight and shared through SDK fetch/body consumption. An owned provider allows only the expected config eth_call, disables HTTP/network retries, redirects and CCIP, and is aborted/destroyed when settled. The app and SDK singleton serialize pending reads. Cancel, wallet transitions and reload invalidate prior SDK results; late transport replies cannot restore them. Preparation and retries are explicit. No `Network.init`, deep import, fabricated validator, global transport override, signer, VC or transaction is used.
- Latest checks: clean `npm ci`, **53 app/adapter + 36 proto tests**, typecheck/build and **20 unchanged wagmi browser regression cases** pass. **112 controlled + 4 live main-app SDK browser cases** pass across dev/preview desktop/mobile sizes. Every live SDK payload was `1`; no forbidden requests or page errors occurred. The new real MetaMask human check remains pending. Controlled errors/races are not live outages; mobile checks use desktop Chrome viewport emulation. CJS patch hashes/syntax remain verified by trial 017 without a CJS runtime acceptance claim.
- App SDK/Terminal3/protobuf modules are now present in lazy production chunks, deferred until manual SDK preparation. All 359 rendered package locations are recorded in [evidence 018](evidence/018-t01b-4-sdk-integration.json); the initial static chunk graph excludes them. All 146 main production assets match the tested preview. Initial static JS is 562,314 bytes; the larger SDK chunks remain deferred. Both regenerated decoders still match evidence 014. The SDK includes broad upstream dependencies: membership does not prove every module executed or establish B2/VC compatibility. Two existing dfns packages omit license metadata; no license is inferred.
- Dependencies remain pinned. Root postinstall runs the existing proto generator then `scripts/patch-ats-readonly.mjs`. Exact ethers **6.17.0**, already installed transitively, is now direct. Removing that one root dependency field yields the exact previous parsed lockfile; no resolved package, override or install-script approval changed. No manifest, lock, retained patch or install-script approval changed during app integration. The earlier VC proposal named ethers 6.15.0: reconcile that scope before VC work; the current 6.17.0 read path does not prove VC compatibility.
- T01b-1 retains manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, storage memory fallback and address-only persistence. Real desktop observations remain in [manual evidence](evidence/011-t01-manual.md); remaining checks below are not waived.
- **B1 bounded repair remains passed:** both original published schema inventories/hashes are checked before generation. Public APIs, wire/64-bit fixtures, malformed/recursive/length boundaries and both package load orders pass. Deterministic generated output survives clean installation. `npm test` includes the gate; skipping postinstall fails it. This is not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
- **Historical research is preserved:** unpatched ATS lacked the public request export and caller-controlled transport. `Network.init` discovers wallet providers and registers listeners even with pairing disabled. Evidence 016 found no qualifying official alternative; the new local patch resolves only the isolated read path. Mentor questions remain drafted in evidence 015, not sent. The current integration adds the verified local SDK read path while retaining the separate viem action.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. Audit remains 80 findings (23 low, 32 moderate, 24 high, 1 critical), with unchanged advisory IDs, severity, ranges and affected paths. Six entries' effects/fix suggestions differ from evidence 017; none were applied. Full `npm ls --all` still exits 1 for TypeScript 7.0.2 and optional Base 2.4.0 peer incompatibilities. Neither the read trial nor absence from the app bundle waives these findings.
- **Still required for T01:** remaining manual checks below and B2 resolution; synthetic Admin-signed VC accepted and expired/tampered/wrong-subject credentials rejected. Victor approves every future VC signature and transaction manually in MetaMask. No T02/NOVA creation is activated.
- The unseen pre-event research draft remains uninspected; Victor must resolve event eligibility and project-license questions. No real KYC or legal-compliance claims.

The isolated B2 trial applied six overrides to five dependency targets in a disposable copy. A lock-only install with nested placement changed 22 scoped locations, avoiding the unrelated UUID drift of an initial update command. The candidate's 192-location Terminal3 closure has no matching audit entries; the unchanged repository still has its original 80 findings. Full candidate audit is 62 (21 low, 25 moderate, 16 high), with no new advisory IDs. All 15 security/caller tests passed after seven baseline failures; normal ci kept the candidate lock stable and reproduced the retained repairs. All 89 existing tests, typecheck/build, 20 SDK browser cases (four live payloads 1) and four public-verifier browser cases passed. The VC cases only rejected unsigned malformed/missing-proof/expired fixtures; no valid credential was accepted. See evidence 020 for the full graph, licenses and limits.

After normal ci, the native package and 94 other optional closure locations are absent. Their source/API tests used a separate scripts-disabled installation and do not prove native binary compatibility. Iniparser's README supplies the previously missing MIT text; native BBS and both neon license texts are recorded. B2 is not cleared, and remaining non-VC audit/dfns/peer findings are not waived.

## Victor acceptance — scheduled 2026-09-06 (Asia/Taipei)

Use desktop Chrome with only MetaMask installed. Start `npm run dev` (5173); after build, `npm run preview` (4173). Run the desktop flow on both. Use only public EVM/Hedera IDs and short observations; never export a browser profile, wallet object, secrets or signatures. Local role labels do not establish on-chain permissions.

Core desktop results on dev/preview are recorded in [manual evidence](evidence/011-t01-manual.md) and its [structured observations](evidence/011-t01-manual.json), dated 2026-09-06. Screenshots establish three-role verification, duplicate prevention and deployment/config version 1. Victor confirmed manual reload connection, automatic network recovery, and normal disconnect/reconnect and rejection/retry. Preview interactions beyond screenshots are operator-reported.

| Remaining human check | Status |
| --- | --- |
| Duplicate clicks while connection is pending | Pending |
| Independent comparison of all three raw Mirror account records | Pending |
| Deployment check while disconnected; reload resets result; no signing/transaction/automatic switch prompt | Pending |
| Mobile layout, focus and overflow (no mobile-wallet claim) | Pending |
| New SDK controls on dev/preview: manual preparation, payload, cancellation and reload without a wallet prompt | Partial: screenshot shows prepared/verified and payload 1; mode, cancellation, reload and prompt absence remain Pending |

Browser/MetaMask versions and the single-wallet environment are not independently recorded. Do not require repeat screenshots for already confirmed behaviors.

Record each outcome as Pending / Passed / Failed / Blocked with the actual date and observation. Do not force a live Mirror outage: timeout, storage denial, missing-provider and race cases already have controlled automated coverage. Record defects and define the evidence-backed repair scope; fix and revalidate before marking the affected requirement Passed.

## Next action / exact allowed files

The isolated trial is complete. Commit records together and stop. Existing
committed work through `9d9f62f` was pushed as requested; this trial's new
records are local until a later push instruction. No merge, VC or NOVA creation.
Scratch copies and harness servers were removed/closed; existing 5173/4173
remain available. Repository manifest/lock/source/retained patches are unchanged.

Next proposed ticket: **retain the scoped dependency repair and explicitly
record the native support boundary**, not activated. Before clearing B2 for VC,
obtain a concrete support decision: is browser ECDSA using the published WASM
fallback the supported environment, with native BBS excluded, or must native
binary compatibility be demonstrated? Ask the mentor which supported path
satisfies ATS 8.0.0/Terminal3 pins without enabling unreviewed native scripts.
These questions are drafted, not sent. Absent optional modules do not establish
native compatibility.

Exact allowed files if that retained-repair ticket is activated:

- `package.json`, `package-lock.json`: only the six override entries in evidence
  020 and their verified 22-location lock delta; all existing pins/repairs remain.
- New `tests/dependencies.test.mjs`: verify the six resolved dependency edges
  even when optional modules are absent; no new testing framework.
- New `docs/evidence/021-b2-retained-repair.mjs`, `.md`, `.json`;
  `docs/prompts/023-b2-retained-repair.md`,
  `docs/ai-usage/027-b2-retained-repair.md`; HANDOFF, plan, ATTRIBUTION, AI_USAGE.
- No application, signer, credential UI, retained SDK/proto patch or install-script
  approval changes. No new Terminal3 direct pins in this dependency-only ticket.

Acceptance: reproduce evidence 020 security/caller, normal clean-install,
full lock/audit/peer/license/bundle and existing app checks; preserve upstream
notices, including tar's ISC → BlueOak-1.0.0 change. State the native support
boundary and remaining 62 audit findings explicitly. Do not label B2 complete
or start VC/NOVA until its outstanding support/verification requirements are
resolved. Every future VC signature and transaction remains manual in MetaMask.
