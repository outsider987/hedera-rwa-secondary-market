# HoldBook handoff

## Current objective / Git base

- Active product ticket: **T01a — browser loading fixed; dependency security BLOCKED**.
  T01b is inactive. The approved documentation maintenance is complete; no ATS work advanced.
- `based_on_commit: 09d8d3bda397da0810f144884f32dcbe5d779874`.
- Started clean on `diagnostic/t01a-sdk-load`; previous base `daed90b` is an ancestor.
  Main remains `03d1a34`; read actual HEAD from Git. Draft PR #1 is unmerged.

## Reading map

Read AGENTS and this file fully. Before implementation, read applicable sections
of the [ATS plan](plans/001-ats-first.md): shared scope/rules plus the active ticket's
parameters and acceptance. Read its effective authorization as well. Links below
are lookup routes, not a recursive startup reading list.

| Need | Read |
| --- | --- |
| Current T01a repair authority | [Approved bounded remediation](prompts/005-t01a-remediation-decision.md); plan section 3 retains earlier constraints and amendments |
| This documentation maintenance | [Decision/scope](prompts/006-docs-navigation.md), [checks](ai-usage/005-docs-navigation.md) |
| SDK load verification | [Remediation summary](evidence/004-t01a-remediation.md) |
| Investigate B1/B2 | [Original triage](evidence/001-t01a-triage.md), then relevant package paths in [audit comparison](evidence/004-t01a-audit-comparison.json) and [bundle membership](evidence/004-t01a-bundle.json) |
| Reproduce browser checks | [Browser script](evidence/002-t01a-browser.mjs), [results](evidence/004-t01a-browser.json) |
| Trace historical AI/human decisions | [AI usage index](../AI_USAGE.md), then the relevant record and linked prompt |
| Check third-party use/license | [Attribution](ATTRIBUTION.md) |

Search or extract needed JSON fields first. Load a complete inventory when the
task requires it; summaries do not replace evidence or applicable safety rules.

## Verified state / remaining blockers

- T00 is complete. Source commit `09d8d3b` fixed proto resolution and browser globals:
  direct proto 2.25.0, dev polyfill 0.28.0, limited dotenv/logging adapters.
  Framework/ATS/Node/npm pins and wallet-connect 2.1.2 remain unchanged.
- At that source: npm ci, 6 tests, typecheck, build and [CI](https://github.com/outsider987/hedera-rwa-secondary-market/actions/runs/33948243910)
  passed. Dev/valid preview × desktop/mobile loaded the real SDK with zero provider
  access/outbound attempts. This is import/export-presence verification, not API readiness.
- This maintenance only reorganizes documentation. No wallet binding, config read,
  VC signature, Equity, Hold or transaction evidence exists.
- **B1:** exact protobufjs 7.2.5/7.5.4 pins remain; both have rendered browser modules.
- **B2:** optional native Terminal3/tar ^6.1.11 remains in the lock. Its local final
  absence and lack of rendered modules do not waive other platforms' install risk.
- Last audit: 83 entries (22 low / 32 moderate / 27 high / 2 critical), 104 locations.
  Five low aggregate entries were added through polyfills; no vulnerability was waived.
  Fireblocks axios, Terminal3 BBS and elliptic also appear in the bundle.
- Large chunks, vm-browserify eval warnings and unapproved script notices remain.
  Caught feature probes and restricted logging adapters do not prove future APIs work.

## Next action / exact scope

The browser remediation is already approved and complete. Continue T01a records
and concrete security analysis; a further repair outside existing authority needs
its own specific decision. Do not start T01b, override pins, upgrade SDK, approve
scripts, waive risks or access wallets from this documentation approval.

Current record files: README.md, AI_USAGE.md, docs/ai-usage/*.md,
docs/ATTRIBUTION.md, docs/HANDOFF.md, docs/plans/001-ats-first.md (scope only),
docs/evidence/**, docs/prompts/**. The completed repair's exact code files and
checks are in its linked decision. The AGENTS reading/attribution edit was specific
to this maintenance, not general authority to change rules in a later ticket.

Remaining T01a acceptance: resolve applicable dependency/security risks and record
the effective decision. Changed code/graph requires the plan's install/test/typecheck/
build, audit/bundle and isolated browser checks. Do not repeat unchanged checks
without new evidence. Commit records with work and keep the ticket boundary clean.

T01b goal, exact allowed files and acceptance remain in the
[deferred plan section](plans/001-ats-first.md#deferred-next-ticket--t01b-not-activated).
Read that section when planning/activating T01b; its presence does not activate it.

Victor: review remaining risk evidence; no MetaMask action is needed now. Later
prepare distinct public accounts/Testnet HBAR without sharing secrets. Pre-event
eligibility and project-license decisions remain pending. Local run commands are
in [README](../README.md#本機執行); do not assume old server sessions are running.
