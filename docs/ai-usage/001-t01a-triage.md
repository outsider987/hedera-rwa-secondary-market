# T01a dependency triage — historical AI usage

[AI usage index](../../AI_USAGE.md) · [Current handoff](../HANDOFF.md)

Sections below were moved verbatim from AI_USAGE.md at
`09d8d3bda397da0810f144884f32dcbe5d779874`. Paths and “this file” retain
their original repository context; dated results are historical.

## 2026-09-05 — T01a blocked dependency triage

- Human direction: Victor selected T01a only, upstream-range-compatible
  transitive updates only, and English commit messages, then explicitly
  requested implementation. See `docs/prompts/002-t01a-planning-record.md`.
- AI assistance: Codex inspected current Git/lockfile/package source, refreshed
  npm audit, traced dependency/peer/optional branches, projected all 78 findings
  and 98 locations into public evidence, and statically classified all 29
  critical/high package entries. No claim of exhaustive exploit testing.
- Ponytail influenced the stop boundary: no speculative loader/UI/framework
  was added after the approved exact-version constraint blocked remediation.
  No additional agent or human review was performed in this ticket.
- Files: README, this file, `docs/HANDOFF.md`, the T01 split addition in the
  existing plan, the T01a prompt record, and `docs/evidence/001-t01a-*`.
  Application source, tests, dependency manifest/lockfile and CI were unchanged.
- Evidence: registry-confirmed candidate versions; local dependency range
  assertions; maintainer advisories for protobufjs schema-code execution and
  binary recursion, plus tar archive advisories. Candidates were NOT installed,
  approved overrides, or compatibility-tested replacements.
- Checks: npm ci, existing Node shell test, typecheck, build, snapshot/lockfile
  consistency and four isolated dev/preview desktop/mobile browser scenarios
  passed. npm audit exited 1 with the same 78 findings; this is not a clean audit.
- No SDK import, private-key signer, wallet/profile/.env access, VC signature,
  RPC/Mirror call, chain mutation, package update or script approval occurred.
  T01a remains blocked; T01b and all real SDK/MetaMask checks remain pending.

### T01a CI documentation closeout

- Observed successful remote CI run 33944789582 for triage commit
  `370cc0b0466665c2cc28e1b4936db9420c6a6ef4`; all four checks passed.
- Updated this file, handoff and T01a triage evidence with the actual commit,
  run/job identifiers and remaining Actions runtime notice. Documentation only;
  no source/dependency change and no additional security or SDK clearance.

<!-- End of preserved historical sections. -->
