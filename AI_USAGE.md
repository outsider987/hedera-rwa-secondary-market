# AI usage / attribution

## 2026-09-05 — authorized T01a isolated SDK load diagnostic

- Human direction: Victor replied **“Go”** to a concrete isolated-load scope;
  `docs/prompts/003-t01a-isolated-load.md`. No dependency changes, polyfills,
  wallet use or T01b were approved.
- Codex authored the official-root loader, native UI states, Node tests, browser
  reproduction script/whitelisted JSON, audit comparison and blocker handoff.
  Ponytail guided the single cached promise; Impeccable guided the bounded UI
  checks. No branding, animation, styling or design-document work.
- Files: `src/App.tsx`, `src/ats.ts`, `tests/shell.test.mjs`, `tests/ats.test.mjs`,
  `package.json` (test flag only), README, handoff, this file, plan policy amendment,
  `docs/prompts/003-t01a-isolated-load.md`, `docs/evidence/002-t01a-*`.
- npm ci / 5 Node tests / typecheck passed. Build **failed** resolving
  `@hiero-ledger/proto`; real browser SDK loading **failed** on undefined process.
  Four dev/failed-build-preview desktop/mobile scenarios passed failure handling,
  keyboard/focus, duplicate/reload and isolation assertions. Preview is not a
  valid production build. Unit doubles are explicitly not SDK readiness proof.
- The browser harness first mistook a different dependency chunk for a repeated
  primary SDK request; its matcher was corrected, all four final cases passed.
  App code was unchanged. Detector returned `[]`; six captures were opened.
- A separate read-only AI Impeccable finish reviewer opened all six captures
  and inspected code/evidence: **ship, diagnostic UI only**, no material findings.
  This is not human review, a successful SDK load or release approval.
- npm audit remained at 78 advisory entries / 98 affected locations; two npm
  fixAvailable suggestions changed and were preserved. No new high/critical
  findings. No vulnerability was repaired or waived.
- Playwright 1.63.0 remains an external diagnostic tool (Apache-2.0,
  https://github.com/microsoft/playwright), not a project dependency.
- No dependency/lockfile/SDK source change, script approval, .env/secrets/wallet
  profile access, provider calls, signatures, chain calls or mentor outreach.
  `diagnostic/t01a-sdk-load` preserves the known failing diagnostic without
  changing main. T01a remains blocked; T01b is inactive.

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

## 2026-09-05 — T00-min guardrails

- Tool: Codex coding assistant. The exact runtime model identifier is not
  recorded here; model names discussed during planning are not proof of it.
- Human direction: Victor supplied the earlier ATS-first handoff, requested
  review and replanning, selected an ATS-only first slice, three accounts,
  a localhost English console, synthetic MetaMask-signed VCs, and then requested
  implementation of the approved plan.
- AI assistance: reviewed public npm package metadata and ATS/Terminal3 source;
  authored repository rules, README, the approved plan, prompt/decision record,
  and handoff. No chain calls were signed or submitted.
- Files: `AGENTS.md`, `.gitignore`, `README.md`, `AI_USAGE.md`,
  `docs/plans/001-ats-first.md`, `docs/prompts/001-planning-record.md`,
  `docs/HANDOFF.md`.
- Checks: confirmed the local directory had no Git repository or source files;
  confirmed the GitHub login is `outsider987` and the target repository was not
  yet present; queried npm for the pinned versions. Build/browser checks are
  not applicable until the shell is added.
- Human code review, event eligibility approval, MetaMask testing, and Testnet
  execution have not been evidenced. Do not infer them from this entry.

## Third-party sources

| Material | Use / license |
| --- | --- |
| React / React DOM 19.2.8 | UI library; MIT; https://github.com/facebook/react |
| Vite 8.2.2 | Dev/build tooling; MIT; https://github.com/vitejs/vite |
| TypeScript 7.0.2 | Type checking; Apache-2.0; https://github.com/microsoft/TypeScript |
| ATS SDK 8.0.0 | Official-root diagnostic import attempted; browser integration blocked; Apache-2.0; https://github.com/hashgraph/asset-tokenization-studio |
| DefinitelyTyped React types | Type declarations; MIT; https://github.com/DefinitelyTyped/DefinitelyTyped |
| Node.js / npm | Runtime/package manager; their upstream licenses apply |
| GitHub checkout / setup-node actions | CI tooling; MIT; https://github.com/actions |
| Terminal3 published package sources | Planning reference only in T00; no VC code copied into the app |
| Ponytail / Impeccable skills | AI workflow guidance, not application code or bundled assets; the approved minimal-shell scope overrides branding/animation workflows |

No logos, stock images, starter application, or pre-event master-plan file were
copied into this repository. The prior user-supplied planning text was used and
is disclosed separately; it must not be presented as newly discovered work.

## 2026-09-05 — T00-min shell / validation

- AI authored the static English React shell, native CSS, HTML entry, exact npm
  manifest/runtime pins, TypeScript configuration, Node built-in smoke test,
  read-only-permission GitHub CI, PRODUCT record, setup instructions and evidence.
- Files: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `index.html`,
  `package.json`, `package-lock.json` (npm-generated), `.npmrc`, `.nvmrc`,
  `tsconfig.json`, `tests/shell.test.mjs`, `.github/workflows/ci.yml`,
  `PRODUCT.md`, `README.md`, `docs/evidence/000-t00-validation.md`, handoff,
  this file and the appended original imported planning text.
- Checks: clean npm ci, 1 Node smoke test, typecheck, production build;
  four isolated Chrome dev/preview desktop/mobile scenarios. Fixed a favicon
  404 discovered by browser validation. The static detector returned no findings.
- A separately spawned read-only Impeccable finish reviewer inspected source
  and all four captures and returned **ship** for the minimal T00 shell. No
  branding, generated imagery, animation or design-system work was introduced.
- Playwright 1.63.0 was an ephemeral diagnostic tool only (Apache-2.0,
  https://github.com/microsoft/playwright), not a new project dependency.
- npm audit warnings are preserved in the evidence; they were NOT fixed or
  waived. ATS was pinned but never imported or connected.
- GitHub repo creation and incremental commits/pushes follow the user's
  explicit approved plan. No private keys, wallet profiles or signatures used.
- Human code review, event eligibility approval and MetaMask/chain testing
  remain unevidenced.

## 2026-09-05 — T00 documentation closeout

- Observed successful GitHub CI run 33943246837 for source commit
  `00a5dd1f0cda654167d4abe3a94f82559c30930e`; install/test/typecheck/build passed.
- Updated `docs/HANDOFF.md`, `docs/evidence/000-t00-validation.md`, `README.md`
  and this file with actual results, remaining warnings and exact T01 scope.
- This closeout does not change app code, dependencies or CI; no T01 code was
  implemented. T00 is complete, T01 and all MetaMask/chain checks remain pending.
