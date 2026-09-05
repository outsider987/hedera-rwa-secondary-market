# HoldBook handoff

## Current objective / Git base

- Active product ticket: **T01a — protobufjs trial FAILED and rolled back;
  dependency security BLOCKED**. T01b is inactive. The bounded trial is complete;
  subsequent upstream research is complete. No further repair is active and no
  ATS wallet/chain work advanced.
- `based_on_commit: fbe9b9f3ca4d5982049c4ddec0fdb7b1606d644e`.
- Started clean on `diagnostic/t01a-sdk-load`; previous base `ecf219c` is an
  ancestor. Main remains `03d1a34`; read actual HEAD from Git. No merge/push or
  draft PR update was performed in this trial; PR #1 remains unmerged.

## Reading map

Read AGENTS and this file fully. Before implementation, read applicable sections
of the [ATS plan](plans/001-ats-first.md): shared scope/rules plus the active
scope and effective authorization. This is not a recursive startup reading list.

| Need | Read |
| --- | --- |
| Latest research / concrete repair options | [Upstream findings](evidence/006-t01a-protobuf-research.md), [public package/source/matcher evidence](evidence/006-t01a-protobuf-research.json), [user request](prompts/008-t01a-protobuf-research.md) |
| Latest T01a decision / stop boundary | [Bounded protobufjs trial](prompts/007-t01a-protobuf-trial.md); plan section 3 records the exact exception |
| Trial outcome / mentor questions | [Trial summary and reproduction](evidence/005-t01a-protobuf.md) |
| Reproduce the failed decoder gate | [Single Node test](evidence/005-t01a-protobuf.test.mjs), [candidate results](evidence/005-t01a-protobuf-candidate-tests.json) |
| Audit or dependency edge details | [Full restored audit](evidence/005-t01a-protobuf-restored-audit.json), [rejected lock diff](evidence/005-t01a-protobuf-lock-changes.json), [npm tree conflict](evidence/005-t01a-protobuf-tree-conflict.json) |
| Current browser behavior / membership | [Restored browser](evidence/005-t01a-protobuf-restored-browser.json), [restored bundle](evidence/005-t01a-protobuf-restored-bundle.json), [harness](evidence/002-t01a-browser.mjs) |
| Earlier browser remediation | [Approved remedy](prompts/005-t01a-remediation-decision.md), [historical result](evidence/004-t01a-remediation.md) |
| Historical decisions / sources | [AI usage index](../AI_USAGE.md), [attribution](ATTRIBUTION.md); follow the relevant work item only |

Extract needed JSON fields/package paths first. Complete inventories remain
available and must be read when completeness is needed; summaries do not waive
applicable rules, safety constraints or acceptance checks.

## Verified state / remaining blockers

- T00 and the earlier T01a browser loading repair remain complete. Runtime and
  framework pins are unchanged: ATS 8.0.0, React/DOM 19.2.8, Vite 8.2.2,
  TypeScript 7.0.2, Node 24.19.0, npm 11.17.0. Proto 2.25.0, polyfill 0.28.0,
  existing adapters, application UI and transaction evidence format are unchanged.
- The trial tried only protobufjs 7.6.5 under the four approved exact parents.
  All four resolved to 7.6.5, with gRPC's 7.6.6 preserved. It passed 16 synthetic
  serialization/precision fixtures, truncated-input checks, unknown-group depth
  rejection and option EOF parsing; real isolated SDK loading also passed.
- **B1 remains:** both pinned static Key/KeyList decoders still accept 128 pairs
  and overflow the stack at 8192 pairs. Runtime source replacement does not
  regenerate these functions. The diagnostic gate must still exit 1; it is
  separate from the existing six-test npm regression suite.
- **Additional trial blocker:** npm ci succeeded, but npm ls marked gRPC 7.6.6
  invalid against the inherited 7.6.5 ancestor override. No descendant exemption
  was added. Both package files were restored byte-for-byte to the starting
  commit, followed by npm ci and final checks. No override remains.
- Post-trial research: latest ATS is still 8.0.0. The inspected published Hiero
  proto 2.31.0 also lacks Key/KeyList depth checks; no supported drop-in fix was
  established. Patched compiler/runtime regeneration of both original schemas
  is a proposed repair, not implemented. Version-qualified child overrides
  passed eight pure npm 11.17.0 matcher assertions excluding gRPC's ^7.5.5 range;
  full npm graph validation remains untested. No dependencies or tests changed.
- **B2:** Terminal3's optional native BBS/tar ^6.1.11 remains in the lock.
  Local absence and zero rendered modules do not waive other platforms' install
  risk. Fireblocks axios, Terminal3 BBS and elliptic remain relevant bundle risks.
- Candidate audit was 80 entries / 99 locations; restored audit returns to
  83 / 104 (22 low / 32 moderate / 27 high / 2 critical). No advisory or risk
  was waived. The rejected candidate removing protobufjs from audit did not
  prove the static decoders safe.
- Complete before/candidate/restored records are indexed in the trial summary.
  Final npm ci, 6 npm tests, typecheck and build passed; restored npm ls passed.
  Dev/valid preview × desktop/mobile passed with zero provider access/outbound
  attempts, duplicate/reload/focus checks and real SDK export presence only.
- Large chunks, vm-browserify eval, deprecated packages, unapproved install
  scripts and experimental Node module-mock notices remain. No scripts approved.
  No CI run is claimed for this local diagnostic commit.
- No wallet binding, config read, VC signature, Equity, Hold or transaction
  evidence exists. Successful import does not prove future SDK APIs ready.

## Next action / exact scope

This failed trial is closed. Continue **T01a records and read-only supported
repair analysis**. The completed research is not repair authorization. Exact
current record files: `AI_USAGE.md`,
`docs/ai-usage/*.md`, `docs/ATTRIBUTION.md`, `docs/HANDOFF.md`,
`docs/plans/001-ats-first.md` (scope only), `docs/evidence/**`, `docs/prompts/**`.
The rejected patch is reproducibility evidence, not a standing approved repair.
Do not retry a broader override, regenerate/vendor a decoder, upgrade parents,
approve install scripts, waive dependency risks or activate T01b without a
specific supported decision. No further code repair is authorized by the outcome.

Next decision must address the static decoder limit and npm override conflict;
Terminal3/tar and other applicable security risks remain separate gates. The
mentor packet is in the trial summary; no mentor message has been sent. Changed
code/graph still requires npm ci/test/typecheck/build, full audit/bundle review,
finite offline security gates and isolated dev/preview desktop/mobile checks.
Do not repeat passing unchanged checks without a change or new concern.
Commit records with work and confirm a clean ticket boundary.

T01b's goal, exact allowed files and acceptance remain in the
[deferred plan section](plans/001-ats-first.md#deferred-next-ticket--t01b-not-activated).
Read it when planning/activating T01b; its presence does not activate it.

Victor: review the failed trial and mentor questions; no MetaMask action is
needed now. Pre-event eligibility and project-license decisions remain pending.
Local commands are in [README](../README.md#本機執行); do not assume prior server
sessions are running. Browser harness now requires an explicit new result path;
use the updated command in the trial summary rather than historical invocations.
