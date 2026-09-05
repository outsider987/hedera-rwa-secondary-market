# HoldBook handoff

## Current objective / Git base

- Active ticket: **T00-min** — guardrails, public repo, minimal React shell, CI.
- Status: guardrails authored; shell / install / tests / remote publication pending.
- `based_on_commit: unborn` — this bootstrap started from an empty non-Git directory.
- Actual HEAD: read with `git rev-parse HEAD`; never compare it to a self-written
  hash in this file. The first commit will contain this bootstrap record.
- Plan: [001-ats-first](plans/001-ats-first.md).
- Provenance: [planning record](prompts/001-planning-record.md), [AI usage](../AI_USAGE.md).

## Completed / observed

- Confirmed local cwd `/home/outsider/github/ETHGlobal_Victor` was empty.
- Confirmed Node 24.19.0 / npm 11.17.0 and Git identity were available.
- GitHub login is `outsider987`; authenticated lookup found no target repo.
- Read npm metadata for the pinned React / React DOM / Vite / TypeScript / ATS versions.
- Authored guardrails, approved plan, prompt/decision record, README and ignore rules.
- No commits, browser tests, transactions or remote publication are claimed yet.

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
- npm ci / test / typecheck / build / browser smoke: pending until shell exists.
- No secrets requested, wallet files read, or signatures attempted.
- Event eligibility: pre-event research draft was mentioned but not supplied;
  Victor must resolve project-specific prior design/asset questions with organizers.
- Project license is not selected; public availability is not a license grant.

## Resume T00-min only

Remaining work: initialize Git/main; commit guardrails; add static React shell,
exact manifest/lockfile and Node CI; verify dev/preview; publish public repo;
record real results and update AI usage before the final shell commit.

Allowed files: `AGENTS.md`, `AI_USAGE.md`, `README.md`, `.gitignore`, `docs/**`,
`PRODUCT.md`, `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc`,
`index.html`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`,
`tests/shell.test.mjs`, `.github/workflows/ci.yml`.

Acceptance: npm ci / npm test / typecheck / production build; actual page renders
in dev and production preview with honest unconnected / no-evidence states;
public repository on main; clean ticket-boundary commit.

## Next ticket (not authorized within T00)

**T01 — ATS readiness**, details to be made active at T00 completion. Actual SDK
import, MetaMask account/network guard, live config resolution and synthetic VC
sign/verify. No Equity creation until T01 manual acceptance passes.

Victor's next wallet work: prepare three distinct MetaMask public accounts and
Testnet HBAR; connect/sign only through the T01 UI when implemented. Never send
private keys, seed phrases or local wallet files to an agent.

## Forbidden early work

No chain mutation or SDK connection in T00. No Go, PostgreSQL, CLOB, payment leg,
matching, mainnet, custom contracts, real identity collection, public website
deployment, branding/animation project, or automatic signing/retries.
