# VC and NOVA consolidated report — September 7, 2026

**T02 is complete.** The [offline report](025-t02-followup.html) connects the
manual workflow, ten original screenshots, public JSON downloads and all
56 verified readback comparisons in one document. Base:
`ea66aa35299a33a877c31fbb112a65dd1460a827`.

| Evidence | Report reference | Source file / field |
| --- | --- | --- |
| Three active public accounts | S01–S03 | `024-vc-nova-manual.json` → `publicRoles` |
| Dev manual VC signing and acceptance | S04–S05 | `024-vc-nova-manual.json` → `humanAcceptance` |
| Preview VC acceptance | S06 | `024-vc-nova-manual.json` → `previewVcExport` |
| Fixed NOVA review | S07–S08 | `024-vc-nova-manual.json` → `verifiedNova.calldataDigest` |
| T01 attestations and manual preview creation | S09–S10 | `024-vc-nova-manual.json` → `initialNovaExport` |
| Latest supplied export (3), historical mismatch | JSON download; no new screenshot | `025-t02-followup.json` → `latestUserExport` |
| Repaired readback and four browser queries | 56-row comparison table; no post-repair human screenshot supplied | `024-vc-nova-manual.json` → `verifiedNova`, `checks.browserFinal` |

The latest supplied `(3).json` is **not a final successful export**: it reports
`mismatch` at block 40209380, with only the Mirror sender comparison failing.
It identifies the same transaction, calldata and VC digest as the repaired
`complete` result at block 40209603. The report preserves both outcomes and
explains the account mapping repair. It does not relabel the user's file.

Verified asset: **0.0.10402368**, cap 1000, supply 0, config 1. The full transaction
identifiers, event/current-getter source distinctions and original-image hashes
are in the report and its [structured manifest](025-t02-followup.json).
Four embedded public JSON downloads allow offline inspection. Repository links
provide implementation, dependency and detailed validation records.

This documentation-only work passed public schema/digest binding checks, ten
image hashes and local-link validation. Offline Chrome checks passed at 1440
and 390 px: all ten images decoded, 56 rows and four JSON downloads matched,
keyboard links received focus, and there was no page overflow, script error or
external request. The
application checks in evidence 024 remain the validation for unchanged source;
no npm install/build or chain operation is repeated. Human T01 boxes remain
operator attestations. Native BBS, audit/peer/license and eligibility limitations
are retained. A post-repair human export/screenshot is still not supplied;
independent live and browser recovery already passed.

Victor explicitly requested consolidation and push. Push the report and existing
local work on `diagnostic/t01b-4-sdk-config` to its configured origin without
force or merge. T03, further creation, KYC, issuance and Hold remain inactive.
