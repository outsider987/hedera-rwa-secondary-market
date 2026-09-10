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
no funds; a match proves neither payment nor delivery. T08 deployment and all four manual acceptance cases are verified; browser reload
and API restart retained the results.

## Operating Context

English localhost console, Traditional Chinese handoff, three distinct accounts:
Admin (test VC issuer), Seller and Buyer. Victor manually approves every
signature and transaction on production preview 4173. Seller and Buyer can each
buy or sell; labels distinguish the bound account from its role in a match.
Admin views all matches and prepares the settlement deployment. No agent signer,
automatic account switch, push, merge or public deployment is authorized.

Overview is the default tab, followed by Market / Activity / Settings. Overview
explains fictional NOVA equity, NOVA versus HBAR, account responsibilities and
the lifecycle through verified settlement or return. Its generated demo certificate
is illustrative; asset facts remain HTML text. Activity shows current orders and
matches alongside dated T02–T05 evidence, including read-only Trade at block
40247352. Legacy Trade/History links resolve to Activity. Market retains order
and match history access; Activity actions return there. Settings contains
account, network and SDK setup. One mounted Market controller preserves drafts,
intents and selected settlement across tabs with existing wallet guards.
The extension uses installed Tailwind, with no new dependency or shadcn.
The standalone showcase is a
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

The static showcase includes the original T05 trade and verified normal2 @0.10,
reverse1 @0.09, cancellation1 @0.10 and expiry reclaim1 @0.10 cases. Recorded
proofs bind every timeline entry;9 accepted order signatures and13 transactions
include deployment and one extra self-trade-prevented order. See manual038.

## Evidence on Hand

[T04 acceptance](docs/evidence/029-t04-manual.md),
[T05 acceptance](docs/evidence/032-t05-manual.md) and
[T07 acceptance](docs/evidence/035-t07-manual.md) remain dated historical records.
[T08 browser checks](docs/evidence/037-t08-browser.json) use explicit public
fixtures for dev/preview desktop/mobile behavior and separate API-free,
wallet-free showcase checks. They do not establish real MetaMask execution,
live settlement or completion of the full acceptance matrix. Effective scope
and remaining requirements are in [T08 spec](docs/plans/004-matched-settlement.md).

The [NOVA design record](docs/design/nova-overview.md) and
[presentation evidence 042](docs/evidence/042-nova-overview.json) record the
Overview/navigation extension. Dev/preview desktop/mobile checks and eight tab
captures passed using public fixtures and no wallet mutations. This presentation
review adds no new chain acceptance; the four actual T08 cases remain complete.

## Product Principles

- State the current outcome, required account and next action visibly.
- Keep unfunded intent, locked shares, payment and verified return distinct.
- Preserve unknown operations and historical evidence through recovery.
- Label verified snapshots with their dates and blocks, never as current balances.
- Prefer native accessible controls; disclose synthetic Testnet scope honestly.

Current-account NOVA ownership is visible above the Market book: available,
locked in Holds and their combined total, read from one public Testnet block.
Account changes isolate cached values; failures retain the last successful read
with its block/time. Manual refresh is available. Active contract work shows an
inline spinner and status text; idle pending outcomes do not imply active progress.

## NOVA recorded story — September 10, 2026

Overview provides two manually stepped, wallet-free explanatory chapters.
Create NOVA shows dated T02/T03 setup, synthetic VC signing, KYC grant and100-share
issuance. Trade NOVA reads the existing four T08 cases and binds steps to saved
transaction hashes, blocks and balances. Cancel and reclaim are separate cases;
expiry alone does not return NOVA. Every stage is labeled as an animated
explanation of a recorded Testnet run; no current eligibility/balance claim or
new transaction results from these controls. This replaces the earlier generic
six-button illustration and duplicate lifecycle list.

## Recorded 3D presentation — September 10, 2026

Overview now leads with the Tokenize → Verify → Match → Settle → Prove story.
Four lazy Three.js/R3F scenes explain separate T02/T03, T07 and T05 records;
HTML proof remains usable without WebGL. Demo Mode offers manual cues and an
explicit three-minute sequence. The actual Market adds read-only top-five depth
and server-match feedback from the existing polling data, with real settlement
labels. No trading controller, wallet, contract, API or asset parameter changes.
The established detailed story, four T08 cases and legacy navigation remain.
This presentation is local and awaits Victor's narration/visual trial; no new
publication is authorized. See plan011 and evidence050 for its exact boundary.
