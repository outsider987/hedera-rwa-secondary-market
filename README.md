# HoldBook

**[Submission review version](docs/SUBMISSION.md)** — project summary, actual results, screenshots, architecture and verification boundaries.

A local Hedera Testnet console with an unfunded NOVA/HBAR limit-order market.
Review and sign orders in MetaMask, match by price/time priority, and cancel
remaining quantities. **Funds are not reserved. Matched · Not settled.**
T06 core and T07 implementation are verified; human acceptance
[passed with documented recovery](docs/evidence/035-t07-manual.md): nine orders, five unfunded matches, no remaining quantity.

**T05 manual acceptance completed September 8, 2026.** Victor approved the three
transactions; independent reads verified Seller **84**, Buyer **16**, both held
**0**, and Seller's **1 HBAR** principal. Final verification block: **40247352**.
See the [acceptance report](docs/evidence/032-t05-manual.md) and
[public JSON](docs/evidence/032-t05-manual.json). This recorded trade is complete;
do not repeat it. T02–T04 remain separately dated history.

## Run locally

Node **24.19.0**, npm **11.17.0**:

```sh
docker compose up -d --build
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. Market is the default; Trade retains the historical
fixed swap, History contains dated evidence, and Settings contains accounts and
SDK checks. Victor alone approves signatures and transactions in MetaMask.
Development (`npm run dev`, port 5173) reads the market; order preparation/signing
requires preview. Follow the [six-signature demo](docs/DEMO.md#t07--unfunded-matching-acceptance-pending).

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

- [T07 implementation checks](docs/evidence/034-t07-implementation.md) and [public validation](docs/evidence/034-t07-validation.json).
- [Operator and judge demo](docs/DEMO.md) — original T07 scenario, actual recovery results and the historical T05 walkthrough.
- [T05 implementation checks](docs/evidence/031-t05-implementation.md) — actual checks and remaining acceptance.
- [T05 specification](docs/plans/002-atomic-trade.md) and [architecture](docs/ARCHITECTURE.md).
- [Completed T04 report](docs/evidence/029-t04-manual.md), [public data](docs/evidence/029-t04-manual.json) and [offline screenshot gallery](docs/evidence/029-t04-manual.html).

NOVA and its KYC claims are synthetic. Matching is unfunded; T08 settlement,
multiple-device operation and public deployment remain out of scope. Desktop MetaMask ECDSA is supported; native BBS is excluded.
[Dependency and verification limits](docs/evidence/029-t04-manual.md),
[third-party attribution](docs/ATTRIBUTION.md) and [AI assistance](AI_USAGE.md)
remain disclosed. No project license has been selected. The unseen pre-event
draft and eligibility questions remain [unresolved for Victor](docs/prompts/001-planning-record.md).
Maintainers: read [AGENTS](AGENTS.md) and [HANDOFF](docs/HANDOFF.md).

T06 remains an independent [verified core milestone](docs/evidence/033-t06-matching-core.md).

## Local unfunded Market (T07)

Market is now the default page. Seller and Buyer can place signed NOVA/HBAR
limit intents and cancel their remaining quantities. **Funds are not reserved**;
**Matched · Not settled** records do not transfer NOVA or HBAR. Admin is view-only.
T05's completed fixed swap stays historical and is never reused for these matches.

The Go API binds host loopback 8787; PostgreSQL has
no host port. `holdbook-market_market-data` retains the permanent signing domain,
commands, orders and matches. Keep that volume; do not use `down -v` or reset it.
The isolated internal database network uses trust authentication with a dedicated
local user; it must never be attached to an untrusted container or public network.
The API's separate edge network allows only its published loopback port.

The dev page (5173) reads Market but cannot prepare/sign commands. Review each
order, check the acknowledgement, then approve MetaMask manually. Rejection,
late response or reload never resends; **Query original request** recovers status.
A rejected wallet prompt remains pending until the server confirms expiry,
up to five minutes. No raw signature is exported or stored in browser storage.

[Implementation and checks](docs/evidence/034-t07-implementation.md) ·
[Completed manual acceptance with recovery](docs/evidence/035-t07-manual.md) ·
[Demo](docs/DEMO.md). T07 human acceptance **passed with documented recovery**; see [actual results](docs/evidence/035-t07-manual.md).
