# T06–T07 approved unfunded market

Final acceptance: T07 passed with documented recovery on September 8, 2026; see [035](../evidence/035-t07-manual.md). The original six-command scenario required additional commands; actual history is retained. No T08 implementation activated.

September 8, 2026. Implementation authorized by the user-supplied T06–T07 plan,
based on `cbf0c2240533dbe3e53db42913d4a6f162c7dac3`. This specification supersedes
the planning-only/core-only scope below. Deliver T06 as an independent local
commit, then continue T07 under this same authorization. No push, merge or T08.

Implementation update: T06 is independent commit `a485afb`; T07 code and automated
checks are delivered in [evidence 034](../evidence/034-t07-implementation.md).
[Manual acceptance 035](../evidence/035-t07-manual.md) passed with documented recovery.

## Effective specification

One NOVA/HBAR limit market on Testnet 296, original Seller and Buyer each able
to buy or sell; Admin reads only. No reservation, payment or ATS Hold. Always
label the book “Funds are not reserved” and fills “Matched · Not settled”.
Preserve all T05 contracts, original evidence, npm lock and SDK patches.

Price-time priority uses server acceptance sequence and resting price. Support
partial/multiple fills and owner-only remainder cancellation. At a crossing
self-order cancel incoming remainder without skipping; keep earlier valid fills.
Quantity is 1–1000 whole shares; positive canonical tinybar price and notional
fit int64, checked before multiplication. HBAR inputs allow at most eight decimal
places, no exponent syntax. Expiry is preparation time +86400, inclusive boundary;
signature submission deadline is preparation time +300. Server supplies time.

EIP-712 domain: HoldBook Unfunded Orders / 1 / chainId 296 / permanent random
32-byte database salt. OrderCommand fields in order: purpose (string), action
(string Place/Cancel), owner (address), requestId (string), orderId (string),
market (string NOVA/HBAR), side (string Buy/Sell; Cancel empty), quantity (uint256),
price (uint256), expiresAt (uint256), deadline (uint256). Purpose is
“Unfunded intent only. No assets reserved or transferred.” Cancel quantity,
price and expiresAt are zero. Server prepares and stores the exact command,
reconstructs typed data and recovers owner on submission. Request IDs execute
once; exact repeats return original results, conflicting repeats reject.
Raw signatures stay only in the local database; public export whitelists command,
digest, verification and result fields. No test creates a private-key signer.

Go 1.27.1, PostgreSQL 18.6, pgx v5.11.0, go-ethereum v1.17.5. Compose uses a
project-specific volume, API loopback 8787, no host database port. Four tables:
markets, commands, orders, matches. Every mutation locks the same market row,
updates sequence/time/order/matches/command result in one transaction and replies
only after commit. Reconstruct from persisted state; never replay accepted commands
as new work. Expire each second and before matching. JSON integers are decimal
strings. Strict bounded HTTP parsing, preview Origin 127.0.0.1:4173 for signing
submission, reject wrong market/domain and unknown fields. Endpoints:
GET /api/market, /api/health, /api/orders?owner=, /api/matches,
/api/commands/{id}; POST /api/commands/prepare and /api/commands.

Market is default tab, retaining Trade/History/Settings. Native responsive form,
review with expiry/notional and acknowledgement, book, My orders and Matches.
Use existing wallet session/lease/Web Lock. Persist public intent before signing;
account/network change or late/rejected signature never sends. Unknown submission
and reload query the same ID only; unblock only on confirmed terminal outcome.
Poll visible Market every two seconds; stale data remains labelled offline and
blocks new commands. No UI packages, images or animation.

## Exact allowed files

T06: `engine/go.mod`, `engine/book.go`, `engine/book_test.go`,
`.github/workflows/ci.yml`, `docs/prompts/029-t06-matching-core.md`,
`docs/ai-usage/042-t06-matching-core.md`,
`docs/evidence/033-t06-matching-core.md`, `docs/evidence/033-t06-matching-core.json`.
T07: `engine/go.mod`, `engine/go.sum`, `engine/auth.go`, `engine/auth_test.go`,
`engine/store.go`, `engine/store_test.go`, `engine/http.go`, `engine/http_test.go`,
`engine/migrations/001-market.sql`, `engine/cmd/api/main.go`, `engine/Dockerfile`,
`compose.yaml`, `.github/workflows/ci.yml`, `src/market.ts`, `src/MarketPanel.tsx`,
`src/App.tsx`, `src/styles.css`, `src/evidence.ts`, `vite.config.ts`,
`tests/market.test.mjs`, `tests/shell.test.mjs`, `tests/evidence.test.mjs`,
`docs/prompts/030-t07-signed-market.md`, `docs/ai-usage/043-t07-signed-market.md`,
`docs/evidence/034-t07-implementation.md`, `docs/evidence/034-t07-validation.json`,
`docs/evidence/034-t07-browser.mjs`, `docs/evidence/034-t07-browser.json`,
`docs/evidence/034-t07-5173-1440.png`, `docs/evidence/034-t07-5173-390.png`,
`docs/evidence/034-t07-4173-1440.png`, `docs/evidence/034-t07-4173-390.png`,
`docs/evidence/035-t07-manual.md`, `docs/evidence/035-t07-manual.json`,
`docs/evidence/035-t07-orders.png`, `docs/evidence/035-t07-matches.png`.
Shared documentation: this file, `docs/HANDOFF.md`, `docs/plans/001-ats-first.md`,
`AI_USAGE.md`, `README.md`, `PRODUCT.md`, `DESIGN.md`, `docs/DEMO.md`,
`docs/ARCHITECTURE.md`, `docs/ATTRIBUTION.md`.

## Required acceptance

T06: standard Go test/race/vet/fuzz and deterministic replay: priority/FIFO,
resting price, noncrossing, partial/multiple/remainder, cancel, self prevention,
expiry equality, wrong owner, conservation, integer parsing and overflow.
T07: public signature vector recovery plus wrong signer/domain/chain/market/field/
deadline/request tests; explicit verifier doubles for HTTP/database integration.
Real PostgreSQL concurrency, duplicate requests, commit interruption/lost response,
restart and offline cases cannot duplicate matches. Retain npm ci/test/typecheck/
build and Foundry. Browser dev/preview desktop/mobile/keyboard/tab locks, stale
wallet/signature, reload, external requests and request scope checks.
Manual fresh-book sequence (six Victor MetaMask signatures): Seller sells 4@0.09
and 5@0.10; Buyer buys 6@0.10 → 4@0.09 + 2@0.10, 0.56 HBAR intent; Seller cancels
remaining 3; Buyer sells 1 and Seller buys 1. Verify reload and service restart.
English report, public JSON, actual captures and architecture diagram. Manual
acceptance remains Pending until observed; no chain transaction IDs for matching.

---

## Historical planning draft (superseded where inconsistent)

# Go matching engine and settlement roadmap

Planning draft, September 8, 2026. Based on merged main
`b2e489b0881d4317880a0eb8fcc2d7a9632a4852` (T05 PR #7).
Victor approved revisiting the original matching scope and defining the next
specification. This is planning authorization, not permission for a new trade,
server deployment, dependency installation or implementation of all stages.

## Source of intent and existing evidence

The supplied [original planning record](../prompts/001-planning-record.md)
explicitly sequences ATS lifecycle before **Go CLOB**, and names Go and
PostgreSQL after that gate. It does not provide a detailed matching algorithm,
order protocol or database schema. The decisions below are proposed now;
they are not attributed to the unseen pre-event master plan.

T04 completed the asset lifecycle. [T05](../evidence/032-t05-manual.md)
verified one atomic exchange: final Seller 84, Buyer 16, both held 0, supply/cap
100/1000 at block 40247352; Seller received 1 HBAR. These are historical balances,
not a budget for new orders. The original NOVA, partition, accounts and chain
296 remain fixed unless a later user-approved specification changes them.

NovaHbarSwap is fixed to those parties, 10 shares, 1 HBAR and one terminal
settlement. It cannot accept variable matched quantities/prices or be reopened.
Reuse its verification patterns and failure tests, not its deployed address for
new fills. Matching runs off chain; matching does not prove delivery or payment.

## Delivery sequence

| Ticket | Deliverable | Completion evidence |
| --- | --- | --- |
| T06 | Go deterministic limit-order matching core | Executable tests and recorded command/output cases; no simulated result presented as a chain trade |
| T07 | Local Go order service, PostgreSQL persistence and React order book | Authenticated commands, durable sequence/idempotency, crash/replay tests, visible orders/cancels/match proposals |
| T08 | Matched-order ATS/HBAR settlement integration | New bounded settlement spec/contract, funding and cancellation-race tests, then separately reviewed manual Testnet acceptance |

T06 is the next proposed implementation ticket. T07/T08 are roadmap entries;
their complete file lists and acceptance specs must be written before activation.
A durable service and integrated settlement are required before calling this an
end-to-end exchange. T06 alone is a matching engine, not a funded exchange.

## T06 rules

One market: NOVA/HBAR. Limit orders only. Quantity is whole NOVA; price is
integer tinybars per NOVA. Wire/test values use canonical positive decimal
strings; reject floats, exponent notation, leading signs, zero and overflow.
Price, quantity and notional must fit positive int64; check multiplication before
performing it. Cap an order at 1000 shares. That bound is not a balance check.
No market orders, leverage, amendments, fees or alternative assets in this core.
Cancel and place a new order to change quantity or price; priority is then new.

Commands enter one sequential processor. It assigns increasing sequence numbers;
client timestamps never establish priority. Buy ranks highest price first; sell
ranks lowest first; equal prices use accepted sequence (FIFO). Cross when best
bid >= best ask. Each match uses the resting order's price and the smaller
remaining quantity. An incoming order may consume several resting orders in
that order, leaving its unmatched remainder resting. No silent rounding.

Order fields: unique order ID, owner public address, market, side, limit price,
original quantity, remaining quantity, accepted sequence and optional expiry.
Only the original Seller/Buyer are eligible owner identities in fixtures; Admin
has no trading privilege. Owner identity is caller-supplied test data in T06,
not authenticated by this pure module. T07 must authenticate it before admission.

Self-trade prevention: when the next crossing resting order has the same owner,
cancel the incoming remainder, retaining earlier valid matches from this command.
Do not skip that resting order to reach a worse price. Record the reason.
Cancellation affects only the owner's remaining quantity, never prior matches.
Expired remainder is removed before matching each command. The caller supplies
nondecreasing logical time; tests use explicit times, not wall-clock sleeps.
Expiry at or before current time is inactive. T07 must supply trusted server time.

An accepted command emits ordered public events and deterministic match IDs
(command sequence plus match index). Preserve each match's maker/taker IDs,
parties, quantity, price and notional. Order quantity always equals remaining +
matched + cancelled/expired quantity. Reject malformed commands before any state
change. Stable request IDs make identical retries return their original result;
reuse with different payload is rejected without effects. T06 keeps that record
in memory; T07 makes it durable. Identical command logs reproduce identical state,
sequence and events. No external I/O, goroutine races or wallet access in the core.

"Matched" means allocated by the algorithm, not settled on chain. Matched
quantity leaves the available order book immediately and cannot match twice.
T06 emits proposals only; it has no real balance, collateral or signing authority.
The later settlement service tracks reserved/awaiting-approval/submitted-unknown/
settled/failed outcomes separately. A failed or abandoned proposal is not silently
reinserted; a new owner-authorized order is required after funds are reconciled.

## T06 acceptance and exact proposed files

Use Go's standard library and testing package, with sorted price/FIFO slices
for this small single-market book. No database, HTTP server, third-party Go
module, React change, npm change or contract change in T06. The installed Go
binary was found under go1.24.12; this is not a claim of current support. Before
implementation, check official supported releases and record an exact toolchain
pin in go.mod/CI. Do not silently depend on a workstation default.

Proposed implementation files only:
`engine/go.mod`, `engine/book.go`, `engine/book_test.go`,
`.github/workflows/ci.yml`. Documentation:
`docs/plans/003-matching-engine.md`, `docs/prompts/029-t06-matching-core.md`,
`docs/ai-usage/042-t06-matching-core.md`, `docs/evidence/033-t06-matching-core.md`,
`docs/evidence/033-t06-matching-core.json`, `docs/HANDOFF.md`,
`docs/plans/001-ats-first.md`, `AI_USAGE.md`, `README.md`, `docs/ATTRIBUTION.md`.
No other implementation file is activated by this draft.

Required checks: Go test/race/vet, deterministic replay, and Go-native fuzz seeds
for quantity conservation and price constraints. Explicit cases: noncrossing
orders, best price before FIFO, same-price FIFO, resting-price execution,
partial/multiple fills, remainder, owner cancellation, self-trade policy,
expiry equality, duplicate request, conflicting retry, invalid integers and
notional overflow. Example: sell A 4@9, sell B 5@10, buy C 6@10 produces
4@9 then 2@10 and leaves B with 3; values are synthetic tinybar test inputs.

CI retains npm ci/test/typecheck/build and existing contract checks; add the
pinned Go checks. No live transaction or KYC renewal is needed. Record actual
results and limitations; stop at the T06 boundary. The core should be reviewable
without a UI or a running chain.

## Settlement decisions that T07/T08 must resolve

PostgreSQL will own command sequence, idempotency, orders, allocated quantities
and pending matches in transactional updates. A single authoritative processor
per market is sufficient initially. Acknowledgement must follow durable commit;
restart reconstructs the same book without duplicating fills. Browser storage
alone cannot serve as the authoritative order book. Backend authentication must
bind owner, command, chain/market, nonce and expiry; never trust an address field.
Every wallet signature remains Victor-approved.

Sell quantities must be backed by verified ATS Holds assigned to the authorized
settlement path; buy notional needs either approved escrow funding or an explicit
non-guaranteed quote workflow. Choose and test that model before live orders:
an HBAR balance read is not reserved buying power. Local reservations also cannot
prevent an owner spending elsewhere. Unfunded proposals must be labelled as such.

Partial fill accounting must reconcile ATS remaining Hold amounts, price
improvement, reserved HBAR and returned remainder. New settlement calls must bind
both orders, fill ID, parties, quantity, price, expiry and one-time execution.
Cancellation and settlement must have an authoritative on-chain race outcome;
a database cancellation cannot promise that funds have already been released.
Use receipt/event/Mirror recovery for submitted-unknown outcomes, never resend.

Retain exact tinybar/weibar conversion, KYC and pinned-asset checks, integer
arithmetic, atomic failure rollback and no automatic signer. A server may produce
a proposal; it cannot spend for Victor. Automatic matching can coexist with
manual settlement, but unattended exchange execution is outside current authority.
