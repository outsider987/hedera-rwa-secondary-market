# T08 — matched settlement and portfolio snapshot

September 8, 2026. User-supplied implementation plan activates T08 from
`based_on_commit: 3088cb9e19abffdc3c6ed58e698c62a11d88f79e`. This supersedes earlier no-T08/payment/custom-contract
and no-animation boundaries only for this ticket. Local commits only; no push,
merge or publication. Victor approves every signature and transaction in MetaMask.

## Deliverable and immutable scope

Complete place → match → prepare → pay/deliver → verify/recover. Reuse NOVA,
Testnet 296, original Admin/Seller/Buyer, SDK 8.0.0 and existing pins/repairs.
Preserve T05 contract/artifact/raw evidence and T07 orders/matches. Eight new
order signatures and normally thirteen chain transactions (including deployment)
cover Seller Sell2@0.10, Buyer Sell1@0.09, cancel1@0.10 and reclaim1@0.10.
These counts are expectations, never acceptance evidence. Expiry is preparation
chain timestamp +1800 seconds; equality stops payment and permits reclaim.

One Admin-deployed, non-upgradeable settlement contract serves fresh matches.
Seller SDK Hold and seller registration are separate manual transactions;
buyer confirms the identical terms digest through exact payment calldata.
Registration binds domain/contract/chain/asset, both order IDs, match identity,
parties, amount, tinybar unit price, expiry and Hold ID. Backend rebuilds from
saved matching records. T07 signatures remain unfunded intent, not settlement
authority. Match and holder/Hold identity can each be consumed once. Verify the
full ATS Hold (partition, holder, escrow, destination, amount, expiry, empty
user/operator data and NULL third-party type). Execute NOVA then HBAR in one
transaction, reverting both legs on failure. Standard OZ ReentrancyGuard covers
all mutations and cross-match reentry. Seller may cancel before expiry or reclaim
at/after expiry; unregistered orphan Holds have equivalent holder-only recovery.
No automatic rebooking. ATS is authoritative for KYC, Hold and expiry checks.

Backend PostgreSQL transactions/unique constraints persist deployment cutoff,
settlements, operations and verified events. Capture acceptance sequence under
the existing market lock on verified deployment activation; both matched orders
must have sequence greater than cutoff. GET /api/settlements and /{id}, POST
/api/settlements/prepare, POST /api/settlement-operations/{id}/transaction, GET
/api/settlement-operations/{id}, GET/POST /api/settlement-deployment. All numeric
JSON fields are decimal strings, with bounded inputs, strict whitelist and
existing preview Origin/Host limits. Public receipts, sender, runtime, calldata,
RPC value, ATS/settlement events and Mirror evidence must agree before accounting.
Duplicate observation/lost response/restart cannot double account. Unknown stays
pending and queries original operation; bad/late hash cannot silently replace it.

Frontend reuses session invalidation, leases/Web Lock and persist-before-prompt.
Recheck account/network/KYC/asset/balances/expiry immediately before each action.
Wallet RPC uses weibars, contract uses tinybars; checked integer multiplication.
Review expiry never expires a submitted-unknown transaction. Retain last data on
read failure, show freshness and disable operations requiring current data.

## Interface and snapshot

Navy/light/system fonts. Book left, action panel right; My orders/Matches 3:2
below. Lower panels stack at 1000px, upper at 850px. Match selection focuses action
heading. Open/All orders show original/matched/remaining/cancelled quantities.
Active/Needs your action/Completed/All matches include counterparty/verification
waits. Admin sees all, only the actual trading party gets mutation actions.
Distinguish account label from match role. Short IDs/times/amounts in the primary
view; raw identifiers, Hold/calldata/requests/downloads in native details.
Success persists until New order. Account changes clear draft and review consent.
Differentiate cancellation of remainder from cancellation of settlement.

States explicitly explain next actor/action: Waiting for seller; Prepare
settlement (1/2 lock, 2/2 confirm terms); Waiting for buyer/Review payment;
Submitted/verification pending; Settled (actual amounts/fee/links); Expired ·
Reclaim required; Cancelled/Reclaimed with verified return. Book is unfunded;
each match separately reports locked NOVA and paid HBAR.

Add exact Tailwind/Vite plugin 4.3.3 (prefix, no Preflight), Motion 13.2.0
(review/progress/results only, disabled for reduced motion), OZ Contracts 5.6.1.
Reuse TanStack Query 5.102.8; no Animate UI. Record sources/licenses/lock changes.
Separate static entry/build requires no API/wallet and has no trading controls.
Whitelist JSON, dated Verified Testnet snapshot only for actually verified data,
four case timelines/evidence/amount changes and full-stack architecture. Pending
cases must stay explicitly pending until actual manual evidence exists.
T05 becomes historical read-only at recorded blocks, preserving original params.

## Exact allowed files

Contract/service milestone: contracts/NovaSettlement.sol,
contracts/test/NovaSettlement.t.sol, foundry.toml, scripts/build-settlement.mjs,
src/settlement-artifact.json, engine/settlement.go, engine/settlement_test.go,
engine/settlement-artifact.json, engine/settlement_rpc.go, engine/settlement_rpc_test.go,
engine/settlement_http.go, engine/migrations/002-settlement.sql,
engine/store_test.go, engine/store.go, engine/http.go, engine/cmd/api/main.go, engine/Dockerfile,
engine/go.mod, engine/go.sum, compose.yaml, package.json, package-lock.json,
.github/workflows/ci.yml, src/settlement.ts, tests/settlement.test.mjs,
tests/fixtures/settlement-vector.json.

UI/snapshot milestone: src/MarketPanel.tsx, src/SettlementPanel.tsx, src/market.ts,
src/App.tsx, src/styles.css, src/TradePanel.tsx, src/trade.ts, src/hold.ts,
src/transport.ts, src/evidence.ts, src/ats.ts, src/wallet.ts, src/guards.ts,
src/showcase.tsx, src/showcase.json, showcase.html, vite.config.ts,
vite.showcase.config.ts, tests/market.test.mjs, tests/trade.test.mjs,
tests/hold.test.mjs, tests/transport.test.mjs, tests/evidence.test.mjs,
tests/ats.test.mjs, tests/wallet.test.mjs, tests/guards.test.mjs,
tests/shell.test.mjs, tests/showcase.test.mjs.

Documentation/evidence: this spec, docs/prompts/031-t08-settlement.md,
docs/HANDOFF.md, docs/plans/001-ats-first.md, docs/plans/003-matching-engine.md,
AI_USAGE.md, docs/ai-usage/046-t08-settlement.md, docs/ATTRIBUTION.md,
README.md, PRODUCT.md, DESIGN.md, docs/DEMO.md, docs/ARCHITECTURE.md,
docs/SUBMISSION.md, docs/evidence/037-t08-implementation.md,
docs/evidence/037-t08-validation.json, docs/evidence/037-t08-browser.mjs,
docs/evidence/037-t08-browser.json, docs/evidence/037-t08-sdk-browser.mjs,
docs/evidence/037-t08-sdk-browser.json, docs/evidence/037-t08-dev-desktop.png,
docs/evidence/037-t08-dev-mobile.png, docs/evidence/037-t08-preview-desktop.png,
docs/evidence/037-t08-preview-mobile.png, docs/evidence/037-t08-showcase.png,
docs/evidence/038-t08-manual.md, docs/evidence/038-t08-manual.json,
docs/evidence/038-t08-normal.png, docs/evidence/038-t08-reverse.png,
docs/evidence/038-t08-cancel.png, docs/evidence/038-t08-reclaim.png.
Create actual capture files only after observing them. No next ticket authorized.

## Acceptance / milestone boundaries

1. Contract/service independent commit: public Go/TS/Solidity digest vectors;
wrong account/Hold/amount/expiry, duplicate, cancel race, orphan, KYC failure,
delivery/payment rollback and cross-match reentry. Real PostgreSQL concurrency,
before/after commit faults, lost response, duplicate events, DB/RPC offline and
restart. No signer in any tests.
2. UI/snapshot: desktop/mobile/keyboard/reduced motion, account/network changes,
cross-tab exclusion, rejection/late reply/reload/original operation recovery;
offline static entry, T05/T07 historical readability. npm ci/test/typecheck/build,
Go test/race/vet/existing fuzz, Foundry and dev/preview browser validation.
3. Actual human acceptance: four fresh matches, actual whitelisted receipts,
Mirror/ATS/HBAR/fees, captures, reload/API restart agreement. Code and evidence
committed together; never call manual acceptance passed from doubles. Stop at
reviewable local version; no automatic signing, push, merge or deployment.
