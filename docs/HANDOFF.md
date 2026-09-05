# HoldBook handoff

## Current objective / Git base

- Active ticket: **T01a — dependency security and SDK loading: BLOCKED**.
- T00-min is complete. T01a static triage is recorded; no repair or loader was
  implemented because the approved upstream-range-only boundary was reached.
- `based_on_commit: 10d69e7d2950f77e0aa4ee7a2842811fadf0f795` — this ticket's base.
- `source_validated_commit: 00a5dd1f0cda654167d4abe3a94f82559c30930e`.
- Actual HEAD: read Git. Source, tests, manifest, lockfile and CI are unchanged
  from the validated source commit; the T01a changes are documentation only.
- Read [active plan](plans/001-ats-first.md),
  [T01a authorization](prompts/002-t01a-planning-record.md),
  [triage/stop evidence](evidence/001-t01a-triage.md) and its audit snapshot.

## Completed / observed

- Public repo: https://github.com/outsider987/hedera-rwa-secondary-market, main.
- T00 guardrails: `e162b247db651eca4ff2d6afa48d6b40711091d7`;
  shell: `00a5dd1f0cda654167d4abe3a94f82559c30930e`;
  T00 closeout: `10d69e7d2950f77e0aa4ee7a2842811fadf0f795`.
- T01a reran npm audit and preserved all 78 vulnerable package entries and
  98 affected locations, with dependency paths and initial static triage for
  every critical/high package entry. This is not exhaustive exploit testing.
- Confirmed exact protobufjs 7.2.5/7.5.4 parent/peer pins and optional tar
  ^6.1.11 constraint. Registry candidates 7.6.5 / 7.5.21 lie outside those
  constraints. No candidate was installed or compatibility-tested.
- T01a application source, dependency versions and lockfile did not change.
  No SDK import, loader UI, wallet connection, VC or Testnet transaction exists.
- T01a triage committed/pushed as
  `370cc0b0466665c2cc28e1b4936db9420c6a6ef4` (English documentation commit).
  The subsequent closeout records its observed CI result, not new integration.

## Locked decisions / public identifiers

- English commit messages using type(scope): description; truthful outcomes.
- T01 split approved: T01a first, then separately T01b (original wallet/config/VC
  requirements remain). Do not silently advance past the blocked T01a gate.
- All existing direct pins and Node/npm stay fixed; transitive repairs may
  satisfy existing upstream ranges only. No override, new package, force fix,
  source patch, fake polyfill or blanket lifecycle-script approval.
- Localhost English console; Traditional Chinese handoff.
- Admin also Escrow / synthetic VC issuer; Seller and Buyer must be distinct.
- Testnet 296; Resolver 0.0.9212226; Factory 0.0.9213391.
- NOVA fields, config ID and synthetic VC parameters remain in the active plan.
- No account mapping, Equity ID, Hold ID, transaction ID or chain evidence.
  Deployment addresses have NOT been checked live.

## Checks / blockers

- T01a npm ci: exit 0, 1165 installed / 1166 audited.
- npm audit: exit 1; 78 entries = 17 low, 32 moderate, 27 high, 2 critical.
- Existing 1 Node shell test / typecheck / production build: passed.
- Manifest and lockfile SHA-256 unchanged; audit snapshot version/presence
  observations checked against the final local install.
- Four dev/preview desktop/mobile Chrome checks: passed; zero page/console
  errors or external requests, no overflow, keyboard skip link works.
- Build: 16 modules; JS 193.81 kB / gzip 61.02 kB, unchanged. This is the static
  shell, not an ATS bundle. SDK loading and loader tests were NOT performed.
- Recorded T01a remote CI: **success**, run
  [33944789582](https://github.com/outsider987/hedera-rwa-secondary-market/actions/runs/33944789582)
  on `370cc0b0466665c2cc28e1b4936db9420c6a6ef4`; web job 101248814984,
  1m4s. npm ci/test/typecheck/build passed; the Actions runtime notice remains.
  This is the observed triage commit's result, not a predicted result for the
  documentation closeout containing this note. The underlying source is unchanged.
- Lifecycle-script/deprecation warnings remain, separately documented.
  The prior Actions Node-runtime notice is not an npm critical vulnerability.
- **B1:** exact protobufjs pins preclude in-range remediation. Static generated
  schemas limit one code-generation precondition, not separate binary-decoding
  recursion findings. Do not waive the entire package.
- **B2:** optional native Terminal3/BBS branch requires tar ^6.1.11. Final local
  absence is not proof that all installations/platforms exclude the branch.
- No secrets requested/read, no signatures attempted, no external outreach.
- Event eligibility and project license remain unresolved human decisions,
  independently of the technical blocker.

## Next action — resolve T01a, not T01b

Victor/mentor must decide how to handle the fixed dependency graph before
implementation resumes: a specifically authorized transitive compatibility
trial, an upstream-supported dependency-plan change, or a narrowly recorded
risk decision permitting isolated load diagnostics. No option is preapproved.
Do not interpret ordinary “continue” as permission for overrides or SDK upgrades.

Until then, the exact next task is documentation-only blocker clarification:
record the decision and revised allowed files/acceptance tests. Do not
repeatedly reinstall or re-audit an unchanged graph expecting pins to move.

### T01a allowed files after an explicit resume decision

- Existing planned loader scope: `src/App.tsx`, `src/ats.ts`;
  `tests/shell.test.mjs`, `tests/ats.test.mjs`.
- Necessary tooling: `package.json`, `package-lock.json`, `tsconfig.json`,
  `vite.config.ts`, still subject to the approved dependency boundary unless
  a new decision explicitly changes it.
- Records: `README.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
  `docs/plans/001-ats-first.md` (ticket/policy amendment only),
  `docs/evidence/**`, `docs/prompts/**`.
- No changes to AGENTS, services, CI actions, unrelated source or styling.

### Remaining T01a acceptance

1. Resolve/document the dependency gate under explicit authorization; retain
   complete before/after findings and justify new high/critical findings.
2. Official SDK dynamic import in dev AND preview; verify the Management
   function exists without calling it, initializing Network or accessing wallets.
3. Honest idle/loading/loaded/failed UI; serialized load, no automatic retry,
   reload resets; safe error summary. No mock/deep import/stub success claims.
4. npm ci/test/typecheck/build; Node loader/state tests and isolated browser
   checks, without provider calls or outbound network requests.
5. Save evidence/AI usage and clean English ticket-boundary commit. If blocked
   again, record it and stop; no T01b until these gates are resolved.

## Deferred next ticket — T01b (not activated)

Exact goal: real MetaMask guards, three public EVM/Hedera account bindings,
live deployment/config reads and one synthetic Seller VC manually signed by
Admin and accepted by the pinned Terminal3 verifier. No Equity or other chain
mutation. Original T01 account/network invalidation, serialized operations,
evidence whitelist and rejection/invalid credential checks remain required.

Proposed allowed files when activated: `src/main.tsx`, `src/App.tsx`,
`src/styles.css`, `src/ats.ts`, `src/guards.ts`, `src/credentials.ts`,
`src/evidence.ts`; `tests/shell.test.mjs`, `tests/ats.test.mjs`;
`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`;
`README.md`, `PRODUCT.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
`docs/evidence/**`, `docs/prompts/**`.
The previously approved exact Terminal3/ethers direct pins belong to T01b,
not T01a; dependency risk must be rechecked when activating that graph.

Acceptance: observed distinct public accounts on chain 296; missing wallet,
rejection, duplicate account, wrong chain and account/network change guards;
live Resolver/Factory bytecode; config integer payload >= 1 with no fallback;
manual Admin VC signature accepted, tampered/expired/wrong-subject rejected;
whitelisted persisted/exportable evidence with no full VC/signature or invented
transaction IDs. Manual checks stay pending until Victor actually performs them.
Then document exact T02 allowed files; do not start T02 in that ticket.

## Victor's pending actions

- Review B1/B2 mentor packet in the triage report and explicitly choose the
  permitted remediation/diagnostic path. No message has been sent to a mentor.
- No MetaMask action is needed now. Prepare three distinct public accounts and
  Testnet HBAR for T01b only; never share keys, seeds or wallet/profile files.
- Resolve pre-event planning eligibility with organizers and choose a project
  license before claiming an open-source submission.

## Run / handoff boundary

`npm ci`, then `npm run dev` at http://127.0.0.1:5173 .
`npm run build`, then `npm run preview` at http://127.0.0.1:4173 .
No .env or wallet is required for the unchanged shell. Do not assume old server
processes or ignored browser artifacts survive context handoff.

No Go, PostgreSQL, CLOB, matching, payment leg, mainnet, custom contracts, real
identity collection, public web deployment, branding/animation or automated
signing/retries. No SDK runtime integration until T01a's gate is resolved.
