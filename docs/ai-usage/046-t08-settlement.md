# T08 matched settlement — implementation, manual pending

Date: September 8, 2026. Base: `3088cb9e19abffdc3c6ed58e698c62a11d88f79e`.
User supplied the T08 plan and authorized implementation, verification and local
commits; [prompt record](../prompts/031-t08-settlement.md), [effective spec](../plans/004-matched-settlement.md).
No push, merge, public deployment or agent signing is authorized.

## Assistance and decisions

Codex assisted with the contract, Go/PostgreSQL service, TypeScript/React UI,
artifact builder, checks and documentation. Ponytail and impeccable skills were
used; impeccable-directed documenter and finish-review agents updated product/design
context and reviewed focused visual fixes. No human code review is asserted.
Victor's plan fixes the original asset/accounts, 30-minute expiry, fresh matched
orders, per-operation MetaMask approval, package versions and pending-case labels.
No unseen pre-event planning file was imported or claimed to be inspected.

Affected files are the exact paths in spec 004: new NovaSettlement contract/tests,
Go settlement/migration/artifact and service wiring, build/dependency/CI files,
Market/Settlement/Trade/SDK transport and tests, static showcase and configuration,
public vectors, evidence 037/038, product/design/demo/architecture/attribution,
planning/handoff and this index entry. Original T05 contract/artifact/raw evidence
and T07 recorded orders/matches are preserved. Third-party versions/licenses and
CA certificate notice retention are in [attribution](../ATTRIBUTION.md).

## Checks and corrections

[Evidence 037](../evidence/037-t08-implementation.md) and its linked JSON/harnesses
record actual checks. Automated tests use local VM doubles, genuine SDK with
controlled HTTP/wallet boundaries and dedicated real PostgreSQL; no private-key
signer is created. Runtime/Mirror verification remains dependent on manual T08
acceptance. The independently read historical T05 block still verifies.

Corrections during development: permit the SDK's omitted zero-value/chain fields
only for the exact reviewed lock path after live wallet recheck; use the shared
production guard in the SDK harness; serialize preparation with the existing lease
and Web Lock; extend only operation recovery to a bounded 180-second read budget;
retain runtime CA notices; fix selected showcase hover contrast. Initial harness
readiness/guard assertions and an import overlapping npm ci were corrected and
rerun; they are not represented as successful initial runs. Pinned SDK repairs
were not changed or bypassed. One mechanical design scan returned no findings;
focused finish review accepted the corrected contrast and current docs.

## Boundary

Contract/service commit: `3fe9b95ca47fef4dc74558872196695cd93670ee`, independently staged and typechecked.
Interface/snapshot and final evidence are committed separately. The third
milestone is pending Victor's actual deployment and four-case manual acceptance,
not completed by automated evidence. [Manual 038](../evidence/038-t08-manual.md)
contains expected counts only. Stop at a reviewable local version; retain original
operations for unknown outcomes, never automatically retry a transaction. Update
actual public evidence and the snapshot after Victor's approvals and verification.

## Manual deployment recovery — September 8, 2026

Based on `41432152d411d7f1200405154ca1bd87d1536010`. Victor supplied review and pending-hash
screenshots. Codex read only the saved public operation and public Mirror/RPC,
matched the deployment hash to exact saved calldata/account/chain/value, then
registered that original hash through the recovery API. Existing verification
completed (runtime, Setup, domain, receipt and Mirror fee); no chain resubmission,
private wallet read, code edit or bypass. Initial incomplete-request cause remains
undetermined. Affected: evidence038 MD/JSON, HANDOFF, AI_USAGE and this appended
entry. Public JSON consistency and diff checks passed; no implementation tests
rerun for this evidence-only update. Browser refresh and all four trading cases
remain Victor actions. This supersedes the initial zero-deployment observation.

## Manual order discrepancy — September 8, 2026

Based on `6d075b4b4fb3020cf73ca42e4794d9eebcc8cf9a`. User screenshot showed pending Buyer Buy2@0.20.
Read-only public API checks confirmed original Seller Sell2 open, an extra
Seller-owned Buy2 prevented from self-trading, and Buyer request still pending
without verified signature/result. Recorded actual public fields in manual038
MD/JSON and updated HANDOFF/index/this entry. No resend, signing, wallet access,
code change or test rerun; JSON state assertions and diff check passed. Query
original until accepted/expired, then choose the next action from that result.

## Preview outage recovery — September 8, 2026

Read-only socket/HTTP checks found no4173 listener and healthy8787 API. Codex
restarted the existing preview command as an independent process; page and
proxied original-request GET return200/expired. Termination cause is unproven.
Updated manual038 MD/JSON, HANDOFF, index and this entry; no implementation edits,
signatures, resubmission or storage clearing. Public expiry assertion/diff passed.

## Manual Hold3 recovery — September 8, 2026

Based on `8979d07a5b6e61ebc489c0037e5efd7222450923`. User showed matched15-1 then a pending lock hash.
Public API/Mirror reads identified the original lock; recovery API verified
calldata/event/full Hold/runtime/domain/balances/Mirror fee. No signing, resubmit,
code edit or bypass. Updated manual038 MD/JSON, HANDOFF/index/this entry with
Buyer sequence15, Hold3, actual fee/balance transition and next seller registration.
Public state assertions/diff passed. Normal payment and other cases remain pending;
initial incomplete request cause remains undetermined.

## Normal settlement observed — September 8, 2026

Based on `73eabc1dbb907ef8f01c2402b8be55eb76ba707d`. User supplied registration/payment/Settled
screens and public payment hash. Codex read the verified original operations and
settlement plus direct public Mirror payment results; exact2 NOVA/0.20 HBAR and
fee/balances agree. No write API or wallet call was needed. Added actual supplied
normal screenshot (unchanged), manual038 MD/JSON, HANDOFF/index/this entry.
Public proof assertions and diff checks passed; evidence-only, no code tests rerun.
Reverse/cancel/reclaim and final persistence checks remain pending; dated static
snapshot will be refreshed with final acceptance evidence.

## Reverse settlement observed — September 8, 2026

Based on `8637f24ab0f8015d2ffe3d7e93e2a85bc0cf14b9`. User supplied reverse locked/registered/settled
screens. Codex queried public original operations/market/settlement and direct
Mirror payment. A read-only settlement_operations ID lookup located the lock
operation; no signatures or wallet files accessed. Verified1 NOVA/0.09 HBAR,
actual fees and role-reversed balances. Updated manual038 MD/JSON/reverse capture,
HANDOFF/index/this entry; public assertions/diff passed, no implementation tests
rerun. Cancellation/reclaim/final persistence remain pending. No chain resubmission.
