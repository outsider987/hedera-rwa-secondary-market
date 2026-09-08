# HoldBook

A local Hedera Testnet console for one fixed atomic trade:
**10 NOVA × 0.1 HBAR = 1 HBAR**. Admin deploys the swap, Seller locks the shares,
and Buyer pays. Delivery and Seller payment succeed together or both revert.

**T05 manual acceptance completed September 8, 2026.** Victor approved the three
transactions; independent reads verified Seller **84**, Buyer **16**, both held
**0**, and Seller's **1 HBAR** principal. Final verification block: **40247352**.
See the [acceptance report](docs/evidence/032-t05-manual.md) and
[public JSON](docs/evidence/032-t05-manual.json). This recorded trade is complete;
do not repeat it. T02–T04 remain separately dated history.

## Run locally

Node **24.19.0**, npm **11.17.0**:

```sh
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. Trade shows the quote, required account and next
review; History contains dated evidence; Settings contains accounts and SDK
checks. **Check readiness** reads public chain state without a signature.
Only Victor approves transactions, individually, in MetaMask on preview 4173.
Development (`npm run dev`, port 5173) supports reads and reviews.

```sh
npm test
npm run typecheck
npm run test:swap
```

Contract tests require **Foundry 1.7.1** and **Solidity 0.8.36**, targeting Paris.
They run only in the local VM. `npm run build:swap` regenerates the committed
artifact; `test:swap` verifies it matches the pinned source and compiler.
Existing npm dependencies, lockfile and SDK patches remain fixed.

## Review the work

- [Operator and judge demo](docs/DEMO.md) — the three manual T05 transactions and historical walkthrough.
- [T05 implementation checks](docs/evidence/031-t05-implementation.md) — actual checks and remaining acceptance.
- [T05 specification](docs/plans/002-atomic-trade.md) and [architecture](docs/ARCHITECTURE.md).
- [Completed T04 report](docs/evidence/029-t04-manual.md), [public data](docs/evidence/029-t04-manual.json) and [offline screenshot gallery](docs/evidence/029-t04-manual.html).

NOVA and its KYC claims are synthetic. This is a single trade demonstration;
order matching, backend services, multiple devices and public deployment remain
out of scope. Desktop MetaMask ECDSA is supported; native BBS is excluded.
[Dependency and verification limits](docs/evidence/029-t04-manual.md),
[third-party attribution](docs/ATTRIBUTION.md) and [AI assistance](AI_USAGE.md)
remain disclosed. No project license has been selected. The unseen pre-event
draft and eligibility questions remain [unresolved for Victor](docs/prompts/001-planning-record.md).
Maintainers: read [AGENTS](AGENTS.md) and [HANDOFF](docs/HANDOFF.md).

T06 deterministic unfunded matching core: [verified Go checks](docs/evidence/033-t06-matching-core.md). T07 signed market implementation is authorized and pending; no funds are reserved or transferred by matching.
