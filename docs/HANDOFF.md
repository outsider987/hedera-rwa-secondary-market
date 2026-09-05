# HoldBook handoff

## Current objective / Git base

- Active product ticket: **T01a — bounded decoder rebuild trial FAILED at the
  dependency-tree gate and restored; B1/B2 security BLOCKED**. Trial closed.
  Decoder generation did not run. T01b is inactive; no wallet/chain work advanced.
- `based_on_commit: b5640298d0839640d444135da1180f0d5461bd11`.
  This is the clean starting base, not the commit containing this handoff.
  Previous documented `fbe9b9f` is an ancestor; read actual HEAD from Git.
- Branch: `diagnostic/t01a-sdk-load`. Main remains `03d1a34`; no push, merge or
  draft PR update was performed. PR #1 remains unmerged.

## Reading map

Read AGENTS and this file fully, then the shared scope/rules and active
scope/effective authorization in the [ATS plan](plans/001-ats-first.md).
This is not a recursive startup reading list.

| Need | Read |
| --- | --- |
| Latest outcome / reproduction / mentor questions | [007 trial summary](evidence/007-t01a-protobuf-rebuild.md) |
| Latest user decision and stop boundary | [Accepted bounded rebuild](prompts/009-t01a-protobuf-rebuild.md); plan section 3's latest amendment/outcome |
| Why generation did not start | [Full tree conflict](evidence/007-t01a-protobuf-rebuild-tree-conflict.json), [rejected lock changes](evidence/007-t01a-protobuf-rebuild-lock-changes.json) |
| Original schemas / compiler graph | [Source inventory](evidence/007-t01a-protobuf-rebuild-source-inventory.json), [compiler audit](evidence/007-t01a-protobuf-rebuild-compiler-audit.json) |
| Current offline security failures | [Single Node test](evidence/007-t01a-protobuf-rebuild.test.mjs), [restored results](evidence/007-t01a-protobuf-rebuild-restored-tests.json) |
| Current audit / browser / bundle | [Restored audit](evidence/007-t01a-protobuf-rebuild-restored-audit.json), [browser](evidence/007-t01a-protobuf-rebuild-restored-browser.json), [bundle](evidence/007-t01a-protobuf-rebuild-restored-bundle.json) |
| Earlier proposed repair rationale | [006 upstream research](evidence/006-t01a-protobuf-research.md) |
| Earlier runtime-only failure | [005 trial](evidence/005-t01a-protobuf.md) |
| Browser behavior / harness | [004 remediation](evidence/004-t01a-remediation.md), [existing harness](evidence/002-t01a-browser.mjs) |
| Contributions / sources | [AI usage index](../AI_USAGE.md), [attribution](ATTRIBUTION.md); follow the relevant work item only |

Start with summaries, then query needed JSON fields/package paths. Read complete
inventories when completeness is needed. Selective reading does not waive
applicable rules, authorization, asset parameters or acceptance checks.

## Verified state / remaining blockers

- T00 and the earlier T01a browser loading repair remain complete. Pins are
  unchanged: ATS 8.0.0, React/DOM 19.2.8, Vite 8.2.2, TypeScript 7.0.2,
  Node 24.19.0, npm 11.17.0, direct Hiero proto 2.25.0 and polyfill 0.28.0.
  Application UI, adapters, transaction evidence format and original schemas
  remain unchanged. Neither package file retains the rejected changes.
- The latest trial accepted original-schema regeneration with CLI 1.3.3/runtime
  7.6.6 and version-qualified child overrides under the same four exact parents.
  Isolated compiler audit was zero. Published schemas/build flags were inspected;
  no generated decoder was changed or regenerated.
- **Install-tree gate failed:** npm ci exited 0, but both Hashgraph 7.2.5 runtime
  locations remained invalid against effective 7.6.6; a targeted protobufjs
  lock update left bytes unchanged. Both Hiero parents and gRPC used 7.6.6.
  npm ls exited 1. The earlier pure matcher checks were insufficient to prove
  full npm graph acceptance. No definitive npm internal root cause is established.
- The stop condition ended the trial before candidate decoder/build/browser
  acceptance. Package files were restored byte-for-byte to base and npm ci rerun.
  The rejected patch is reproduction evidence, not a retained repair.
- **B1 remains:** the earlier runtime-only trial left static decoders unsafe.
  The new before/restored diagnostic has 17 passes and 17 failures: old decoders
  accept 128 Key/KeyList and ThresholdKey nesting pairs, overflow at 8192, and
  accept both declared-length-overrun cases. Timeout, overflow or excessive-depth
  acceptance cannot pass. Sixteen synthetic wire/64-bit fixtures and public
  namespace snapshots match after rollback. This separate diagnostic must exit 1.
- **B2 remains:** Terminal3's optional native BBS/tar ^6.1.11 is still in the lock.
  Local absence/zero rendered modules do not waive another platform's install
  risk. Fireblocks axios, Terminal3 BBS and elliptic remain relevant bundle risks.
- Audit before/restored: 83 entries / 104 affected locations, with 22 low,
  32 moderate, 27 high and 2 critical. Rejected candidate: 82 / 102, still with
  protobufjs critical exposure. No new advisory ID or unrelated existing package
  version was introduced; no risk was waived. Detailed inventories are preserved.
- Restored npm ci, six npm tests, typecheck, build and npm ls passed.
  Dev/preview × desktop/mobile real SDK loading passed; duplicate/reload/focus
  checks passed, with zero provider access, outbound attempts or browser errors.
  All 352 rendered package locations and emitted asset hashes match 005 restored.
  Import/export presence proves no future SDK API or wallet/VC behavior.
- Existing large chunks, vm-browserify eval, deprecations, unapproved install
  scripts and experimental Node test-mock warnings remain. No scripts approved,
  CI run claimed, wallet/config/VC/asset/Hold/transaction evidence created.

## Next action / exact scope

The accepted bounded trial is closed after its stop condition. Continue **T01a
records and read-only supported-repair analysis**. Exact record files:
`AI_USAGE.md`, `docs/ai-usage/*.md`, `docs/ATTRIBUTION.md`, `docs/HANDOFF.md`,
`docs/plans/001-ats-first.md` (scope only), `docs/evidence/**`, `docs/prompts/**`.
Do not treat the rejected patch or this trial's accepted proposal as standing
permission to retry a broader repair. No active dependency/source repair remains.

Next decision must establish a reproducible valid npm graph for the four parents
before original-schema generation can be tested. No npm/SDK upgrade, broader
override, lock deletion/manual patch, decoder vendoring, script approval or risk
waiver was adopted. The summary includes concrete mentor questions; no message
has been sent. Terminal3/tar remains a separate gate. Changed code/graph requires
npm ci/test/typecheck/build, full audit/lock/bundle review, finite offline gates
and isolated dev/preview desktop/mobile checks. Do not repeat passing unchanged
checks without a change or new concern. Commit records with work; confirm clean
status at the ticket boundary.

T01b's exact allowed files and acceptance remain in the
[deferred plan section](plans/001-ats-first.md#deferred-next-ticket--t01b-not-activated);
read it when planning/activating that ticket. Its presence does not activate it.
Victor can review the diagnostics/mentor questions; no MetaMask action is needed.
Pre-event eligibility and project-license decisions remain pending. Local server
commands are in [README](../README.md#本機執行); do not assume previous servers run.
The browser harness requires an explicit new result path and external Playwright.
