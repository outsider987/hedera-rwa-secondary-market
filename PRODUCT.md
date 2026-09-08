# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React / Vite / TypeScript, local Go API / PostgreSQL and ATS / Solidity;
exact pins live in package.json and engine/go.mod. T08 adds prefixed Tailwind
without Preflight, limited Motion transitions and OpenZeppelin ReentrancyGuard.

## Users

Victor operates the local console with MetaMask. Mentors, judges and prospective
employers inspect the full-stack workflow and public evidence. The separate
static showcase needs neither a wallet nor the local API.

## Product Purpose

Demonstrate NOVA/HBAR order intent, price-time matching and per-match atomic
settlement on Hedera Testnet 296. NOVA and KYC are synthetic. An order reserves
no funds; a match proves neither payment nor delivery. T08 implementation is
under verification; its deployment and four manual acceptance cases are pending.

## Operating Context

English localhost console, Traditional Chinese handoff, three distinct accounts:
Admin (test VC issuer), Seller and Buyer. Victor manually approves every
signature and transaction on production preview 4173. Seller and Buyer can each
buy or sell; labels distinguish the bound account from its role in a match.
Admin views all matches and prepares the settlement deployment. No agent signer,
automatic account switch, push, merge or public deployment is authorized.

Market is the default tab, followed by Trade / History / Settings. Trade is now
a read-only T05 historical view at block 40247352. The standalone showcase is a
separate build suitable for later publication review, with no trading controls.

## Capabilities and Constraints

T02–T04 creation, synthetic KYC, issuance and Hold lifecycle are complete and
closed to new mutations. T05 completed a fixed atomic exchange of 10 NOVA for
1 HBAR: historical Seller 84 / Buyer 16 / both held 0. Its contract, fixed
parameters and original evidence remain preserved.

T06–T07 provide deterministic matching and durable signed order intent. T07
manual acceptance passed with documented recovery: twelve accepted commands,
nine orders and five unfunded matches. Those historical matches remain readable
and cannot enter T08 settlement. Deployment activation establishes the cutoff
for eligible new orders.

T08 adds a selected-match action panel, settlement operation persistence,
original-operation recovery and public evidence queries. Preparation separates
seller Hold creation from registration; the buyer then reviews exact HBAR
payment and NOVA delivery. Expiry is 30 minutes from preparation and does not
itself unlock shares. Cancellation and expired Hold recovery require separate
manual transactions and verified return. Pending or unknown outcomes retain the
original operation rather than automatically resubmitting.

The static showcase currently verifies only the original T05 trade. Normal
2 @ 0.10, reverse 1 @ 0.09, cancellation 1 @ 0.10 and expiry reclaim 1 @ 0.10
are explicitly **Pending manual acceptance**, with no T08 transaction timelines.
No T08 deployment, owner signatures or chain transactions have been recorded.

## Evidence on Hand

[T04 acceptance](docs/evidence/029-t04-manual.md),
[T05 acceptance](docs/evidence/032-t05-manual.md) and
[T07 acceptance](docs/evidence/035-t07-manual.md) remain dated historical records.
[T08 browser checks](docs/evidence/037-t08-browser.json) use explicit public
fixtures for dev/preview desktop/mobile behavior and separate API-free,
wallet-free showcase checks. They do not establish real MetaMask execution,
live settlement or completion of the full acceptance matrix. Effective scope
and remaining requirements are in [T08 spec](docs/plans/004-matched-settlement.md).

## Product Principles

- State the current outcome, required account and next action visibly.
- Keep unfunded intent, locked shares, payment and verified return distinct.
- Preserve unknown operations and historical evidence through recovery.
- Label verified snapshots with their dates and blocks, never as current balances.
- Prefer native accessible controls; disclose synthetic Testnet scope honestly.
