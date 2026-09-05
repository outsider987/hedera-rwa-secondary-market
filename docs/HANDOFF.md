# HoldBook handoff

## Current objective / Git base

- Active ticket for the next implementation turn: **T01 — ATS readiness** (not started).
- Status: **T00-min complete** — public repo, shell, local/browser checks and remote CI passed.
- `based_on_commit: 00a5dd1f0cda654167d4abe3a94f82559c30930e` — verified shell commit.
- `source_validated_commit: 00a5dd1f0cda654167d4abe3a94f82559c30930e`.
- Actual HEAD: read with `git rev-parse HEAD`; never compare it to a self-written
  hash in this file. This closeout changes documentation only; the source and
  lockfile remain those of the validated commit above.
- Plan: [001-ats-first](plans/001-ats-first.md).
- Provenance: [planning record](prompts/001-planning-record.md), [AI usage](../AI_USAGE.md).

## Completed / observed

- Confirmed local cwd `/home/outsider/github/ETHGlobal_Victor` was empty.
- Confirmed Node 24.19.0 / npm 11.17.0 and Git identity were available.
- Created public repo https://github.com/outsider987/hedera-rwa-secondary-market;
  default branch main. Guardrails committed/pushed as `e162b247db651eca4ff2d6afa48d6b40711091d7`.
- Read npm metadata for the pinned React / React DOM / Vite / TypeScript / ATS versions.
- Added static React shell, exact dependencies/lockfile, runtime pins, Node smoke
  test, CI and setup instructions; archived the original imported task text.
- Shell committed/pushed as `00a5dd1f0cda654167d4abe3a94f82559c30930e`.
- Local checks and independent shell review passed; see [T00 evidence](evidence/000-t00-validation.md).
- No wallet, SDK runtime integration, VC signatures or Testnet transactions.

## Locked decisions / public identifiers

- Public repo target `outsider987/hedera-rwa-secondary-market`, `main`.
- Localhost English console; Traditional Chinese handoff; three distinct wallets.
- Admin also Escrow / synthetic VC issuer; Seller and Buyer separate.
- Testnet 296; Resolver 0.0.9212226; Factory 0.0.9213391.
- All NOVA fields, config ID and VC parameters are frozen in the active plan.
- No actual account mapping, Equity ID, Hold ID, transaction ID or chain evidence exists.
- Addresses were found in upstream configuration, NOT checked live on-chain.

## Checks and blockers

- Environment / npm metadata / GitHub lookup: passed as described above.
- npm ci / 1 Node test / typecheck / build: passed.
- Dev/preview at desktop 1440 and mobile 390 widths: passed, zero page/console
  errors, zero external requests, no overflow, working keyboard skip link.
- Static detector: no findings. Independent minimal-shell review: ship.
- Remote CI **success**, run [33943246837](https://github.com/outsider987/hedera-rwa-secondary-market/actions/runs/33943246837),
  on source commit `00a5dd1f0cda654167d4abe3a94f82559c30930e`:
  npm ci / test / typecheck / build all passed. Job duration 1m4s.
- CI emitted an action-runtime deprecation notice for pinned v4 actions;
  GitHub ran them on Node 24 successfully. Project runtime is pinned to 24.19.0.
- Dependency audit: 78 vulnerable entries, including 2 critical (`protobufjs`
  and optional lockfile `tar`). No dependency overrides/fixes/blanket lifecycle
  script approvals. Details/reproduction are in the evidence. T01 must triage
  this before importing ATS into a wallet flow; do not downgrade to npm's suggested 1.13.0.
- No secrets requested, wallet files read, or signatures attempted.
- Event eligibility: pre-event research draft was mentioned but not supplied;
  Victor must resolve project-specific prior design/asset questions with organizers.
- Project license is not selected; public availability is not a license grant.

## Next ticket — T01 only

**T01 — ATS readiness**. First triage the dependency/script warnings recorded
above; do not silently downgrade ATS or change the approved pins. If compatible
remediation needs a plan change, report the exact dependency path and ask Victor
and a Hedera mentor before introducing it into the wallet flow.

Implement actual SDK import, MetaMask account/network guards, public account
binding through Mirror Node, live config resolution and synthetic VC sign/verify.
Use the frozen configuration from the plan, not the historical imported prompt.
This ticket has no Equity creation, role grant, KYC grant, issuance or Hold mutation.

### T01 exact allowed files

- Existing UI: `src/main.tsx`, `src/App.tsx`, `src/styles.css`.
- New integration helpers: `src/ats.ts`, `src/guards.ts`, `src/credentials.ts`,
  `src/evidence.ts`. Do not create an adapter framework or generalized workflow engine.
- Tests: `tests/shell.test.mjs`, `tests/ats.test.mjs` (Node built-in; no new framework).
- Tooling if required by verified browser imports: `package.json`,
  `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.github/workflows/ci.yml`.
- Records: `README.md`, `PRODUCT.md`, `AI_USAGE.md`, `docs/HANDOFF.md`,
  `docs/evidence/**`, `docs/prompts/**`.
- No root rule/spec changes or new services without an explicitly recorded
  user decision. Ignored local test/build artifacts remain allowed.

### T01 acceptance

1. npm ci / test / typecheck / build pass; real SDK import loads in dev AND
   production preview. Do not count a mock or unused dependency as integration.
2. Victor connects MetaMask on chain 296; binds three distinct accounts with
   observed public EVM/Hedera IDs. Missing wallet / rejection / duplicate
   accounts / wrong chain are handled without any mutation.
3. Network/account changes invalidate stale signer state; every requested
   signature rechecks the current network/account. Reload does not trigger signing.
4. Resolver/Factory resolve to live contract bytecode. Call
   `Management.resolveLatestConfigVersion` with a validated request containing
   the approved resolver and bytes32 config ID; require integer `payload >= 1`.
   Failure is blocking, not an invitation to change addresses.
5. Admin manually signs one synthetic Seller VC via MetaMask; exact Terminal3
   verifier accepts it. Tampered/expired/wrong-subject credentials are rejected
   by the verification/target guard path. Never instantiate a private-key signer.
6. Whitelisted read/off-chain evidence can be exported and survives reload;
   no keys, whole wallet/error objects or full VC signatures are exported.
   No transaction ID is claimed for a read or off-chain signature.
7. Save actual outcomes, pending manual checks, public identifiers, and the
   next T02 allowed files before the ticket-boundary commit. No T02 execution
   until the above manual gates pass.

## Victor's pending actions

- Prepare three distinct MetaMask public accounts and Testnet HBAR; public
  EVM/Hedera mapping is still unknown. Connect/sign only through the T01 UI
  when implemented. Never send private keys, seed phrases or wallet files.
- Review dependency-risk triage with a Hedera mentor before live wallet/VC
  integration if resolution changes the approved dependency assumptions.
- Resolve the disclosed pre-event planning eligibility question with organizers
  and choose a project license before claiming an open-source submission.

## Run / handoff boundary

`npm ci`, then `npm run dev` at http://127.0.0.1:5173 . For production smoke,
`npm run build` then `npm run preview` at http://127.0.0.1:4173 . No environment
file or wallet is needed to view T00. Server processes/artifacts are disposable;
the new context must not assume they are still running.

The final T00 closeout is documentation-only. Read actual HEAD/status/log;
verify the source_validated_commit is its ancestor and that no later source
change invalidates the recorded checks. Do not resume completed T00 work or
start T02 just because its future acceptance table is in the plan.

## Forbidden early work

No chain mutation or SDK connection in T00. No Go, PostgreSQL, CLOB, payment leg,
matching, mainnet, custom contracts, real identity collection, public website
deployment, branding/animation project, or automatic signing/retries.
