# HoldBook

A compliance-gated secondary-market prototype for ATS-issued fictional equity on Hedera Testnet. Signed NOVA/HBAR orders meet in a price-time order book; separate ATS Holds and atomic delivery-versus-payment turn agreement into verifiable settlement.

**[Live demo](https://outsider987.github.io/hedera-rwa-secondary-market/)** · **[Submission overview](docs/SUBMISSION.md)** · [Demo guide](docs/DEMO.md) · [Architecture](docs/ARCHITECTURE.md)

Current overview: September 12, 2026. Earlier milestone summaries are superseded here; original acceptance reports and incremental Git history remain unchanged. This is submission preparation, not an ETHGlobal submission receipt.

## Review without a wallet

Overview is the default: explore recorded asset, eligibility, matching and settlement scenes, manually or with the optional three-minute Demo mode. Market shows public orders and settlement states; Activity contains public outcomes and historical evidence; Settings contains configuration.

The [standalone evidence portfolio](https://outsider987.github.io/hedera-rwa-secondary-market/showcase/) uses a dated snapshot without an API or transaction controls. Publication status is tracked in [readiness evidence](docs/evidence/057-submission-readiness.md).

The live API can cold-start. Unavailable or pending data is not proof of success. Reviewers need no wallet, private keys or repeated trades. New trading is restricted to the original demo accounts; this is not public onboarding or a production exchange.

## What works

| Stage | Implemented behavior | Actual evidence |
| --- | --- | --- |
| Asset setup | ATS NOVA creation, cap 1,000, zero initial supply | [T02](docs/evidence/024-vc-nova-manual.md) |
| Eligibility / issuance | Synthetic VC verification, on-chain KYC, issuance of 100 NOVA | [T03](docs/evidence/027-t03-manual.md) |
| Compliance / Holds | Non-KYC execution rejected; permitted execution and release verified | [T04](docs/evidence/029-t04-manual.md) |
| Signed matching | EIP-712 owner checks, price-time priority, partial fills, cancellation and durable recovery | [T07](docs/evidence/035-t07-manual.md) |
| Matched settlement | Seller locks NOVA and confirms terms; buyer pays for atomic delivery | [T08](docs/evidence/038-t08-manual.md) |
| Alternate paths | Reverse trade, registered cancellation, expired-Hold reclaim and reload/restart persistence | [Four T08 cases](docs/evidence/038-t08-manual.json) |

Matching alone reserves no funds. Each eligible match has its own settlement state. Expiry alone does not return a Hold. Unknown operations recover using original IDs/hashes, never automatic transaction resubmission.

The recorded T08 normal case delivered **2 NOVA for 0.20 HBAR** at block **40258355**. The earlier T05 fixed swap delivered 10 NOVA for 1 HBAR; it is not used to settle the order book. Dated balances and KYC are historical evidence, not current guarantees.

## Architecture

React / TypeScript and ATS SDK run in the browser, with manual MetaMask approvals. Go authenticates orders, matches and persists results in PostgreSQL, and independently verifies public settlement evidence; it has no transaction signer. The custom contract executes the ATS Hold and pays HBAR atomically.

Deployment: GitHub Pages → Cloud Run API → Neon PostgreSQL, with Hedera Testnet RPC and Mirror. See [diagrams](docs/ARCHITECTURE.md#component-and-interaction-diagrams), [deployment operations](deploy/README.md), and [contract verification](docs/SOURCE_VERIFICATION.md).

## Run locally

Use pinned **Node 24.19.0 / npm 11.17.0**:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. Recorded Overview needs no wallet or local API; Market reports unavailable data if the local API is absent. For production preview and the independent portfolio:

```sh
npm run build
npm run build:showcase
npm run preview
```

Open `http://127.0.0.1:4173/` or `/showcase/`. Vite does not load `.env` files. Public deployment origins are configured by the Pages workflow, not credentials.

For isolated backend setup see [deployment guidance](deploy/README.md). **Do not restart the original migrated local API as a second trading writer or reset its database.** A fresh database lacks the accepted market domain, deployment and operator wallet; use committed evidence for review.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm run build:showcase
npm run test:swap
node scripts/build-settlement.mjs --check
```

Contract checks use **Foundry 1.7.1 / Solidity 0.8.36**, Paris EVM, locally without transactions. [Go test commands](docs/ARCHITECTURE.md#engine-source-layout) require a dedicated test database. Actual current checks are in [evidence 057](docs/evidence/057-submission-readiness.md).

## Boundaries and provenance

Fictional NOVA, synthetic KYC and Testnet only: no real identity checks, securities, legal compliance or production-security claim. Desktop MetaMask ECDSA is supported; native BBS and existing dependency/peer/license limitations remain disclosed.

[AI usage](AI_USAGE.md), [attribution](docs/ATTRIBUTION.md), [actual planning inputs](docs/prompts/001-planning-record.md), and [video provenance](docs/VIDEO.md) distinguish AI assistance from human direction and manual approvals. Victor's September 12 clarification about earlier GPT topic discussion is recorded in [readiness evidence](docs/evidence/057-submission-readiness.md).

No project-wide reuse license has been selected. Public source availability is not itself a license or eligibility determination. Maintainers: [AGENTS](AGENTS.md), [HANDOFF](docs/HANDOFF.md).
