# T08 manual acceptance — Pending

September 8, 2026. [Spec](../plans/004-matched-settlement.md) ·
[Operator sequence](../DEMO.md#t08--fresh-matched-settlement) ·
[Public record](038-t08-manual.json).

Admin deployment is verified at block **40257294**:
`0xa90da61f67c37473f38000e70623a77ad277304c`.
Transaction `0xf0448adc0a4d1f76777cec55f0151c8a86e7bcb6b8b58de7a94f9179dbc6d0d0`;
fee **1.60459090 HBAR**, transferred value zero. Accepted-order cutoff is **12**.
RPC sender/calldata/value/chain, receipt/block/runtime/Setup event/market salt and
Mirror execution/account/contract/fee evidence passed the existing verifier.

The first user screenshot after approval showed a locally pending hash and an
incomplete request; the backend still held a prepared operation without hash.
Querying and registering that exact original public hash completed verification.
No transaction was resent and no code or verification rule was changed. The cause
of the initial request failure is not established. Browser recovery confirmation
still belongs to Victor; click Query original operation before continuing.

Observed: **ten chain transactions, seven accepted order signatures**. All four settlement
cases remain pending. Expected total: eight order signatures and thirteen chain
transactions; record rejection/recovery extras separately. Next: Seller Sell2@0.10,
then Buyer Buy2@0.10, only using newly accepted orders after this deployment cutoff.

1. Open local production preview, bind the original three accounts on Testnet296.
   Admin deployment and saved cutoff are now verified; recover the original browser
   operation before placing new orders. Do not deploy again.
2. Seller sells 2 NOVA at 0.10 HBAR; Buyer places matching buy. Seller approves
   exact Hold, then separately registers terms. Buyer reviews/pays 0.20 HBAR.
3. Buyer account sells 1 at 0.09; Seller account places buy and pays 0.09 HBAR
   after the selling Buyer account locks/registers. Keep account labels and
   trading roles distinct.
4. A fresh 1 at 0.10 match is locked/registered, then manually cancelled by its
   seller. Verify the exact returned quantity and unpaid HBAR.
5. Another fresh 1 at 0.10 match is locked/registered; wait until its preparation
   timestamp +1800 seconds. Verify payment is disabled while NOVA remains locked;
   seller manually reclaims and waits for verified return.
6. Reload/restart the API, compare original orders/matches, Holds, settlement
   operations, token balances and payment evidence. Unknown hashes recover the
   original operation; never resubmit automatically. Update only public whitelist
   evidence and the snapshot after independent verification.

Every signature/transaction belongs to Victor in MetaMask. No CLI/server signer,
private key, full VC signature or arbitrary wallet object is an evidence source.
T05/T07 historical acceptance remains unchanged. T08 is not complete until these
observations and actual captures exist; no next ticket or publication is active.

## Normal-case order progress — unresolved Buyer request

Seller Sell2@0.10 was accepted as sequence13; remaining2, matched0. Another
Buy2@0.10 was submitted by Seller, sequence14, and automatically cancelled by
self-trade prevention (matched0/cancelled2). This is an extra accepted signature,
not the intended Buyer order. The original Sell2 remains open.

Buyer request `b87a2ddf47cb3f7bcf7105bc2d7ceb02a64aa5afa4268c2bbb75d34cd536bc16`
was prepared for **Buy2@0.20**, not the intended unit price0.10. At server timestamp
1788863158 it remains pending, digest empty, verifiedfalse, resultnull; no accepted
Buyer signature or new match is asserted. Deadline1788863421 (18:30:21 Taipei).
Query only until this original request is accepted or expired. If expired, create
Buyer Buy2@0.10; if accepted, inspect the actual match before any further order.
The initial incomplete submission cause is not established; direct public API
reads currently succeed. Expected signature totals will exceed the original eight
because of the extra Seller placement; rejected/unaccepted attempts remain separate.

### Recovery update: preview restored, Buyer request expired

A later Recovery unavailable screenshot was traced to no listener on local4173;
direct API8787 returned200 and expired for the original Buyer request. Restarting
`npm run preview` restored the page and proxied request query (both200). No source,
wallet storage or chain state was changed. The process termination cause is not
established. Buyer request has digest empty/resultnull and did not create an order.
Victor can query the original request, then New order: Buyer Buy2@0.10. This
supersedes the pending observation above, without claiming the new order exists.

### Normal match15-1: Hold3 verified; registration pending

Fresh Buyer Buy2@0.10 sequence15 matched Seller sequence13 for2 NOVA/0.20 HBAR.
Seller manually created Hold3 in transaction
`0x06458ff4b0600112ec0ba03977751e2651199d6d4a3e95eef53ed9b5b48e480b`,
block40258090, fee0.42090162 HBAR. Public proof verified exact saved calldata,
ATS HeldByPartition event/full Hold, runtime/domain, historical token balance
transition and Mirror execution/fee. Seller available84→82, held0→2; Buyer16/0
unchanged. Expiry1788865785 = 19:09:45 Taipei; exact quantity2, intended Buyer
and new settlement escrow agree. HBAR principal remains0.

User showed locally pending hash/incomplete request; backend still had prepared
without hash. Registering/querying the exact original hash through the preview
recovery API completed verification without resubmission or code changes. Initial
failure cause is undetermined. Victor next queries the original operation, then
reviews/confirms seller match terms (step2/2) before Buyer payment. Normal-case
acceptance remains incomplete; reverse/cancel/reclaim are still pending.

### Normal case settled — block40258355

Seller registration verified at40258234, fee0.40415468 HBAR, hash
`0x0f780ac0a393c2c5caa11df96dd5dbf460fa8a0edd1c70377fa891db5e547699`.
Buyer payment verified at40258355:
`0x9fdb7cb1d7bd665edcc3e3acc61b743e63a701cc0714107e76a72d2d6b064230`.
The existing independent verifier records Settled and both settlement/ATS events,
exact calldata/value/runtime/domain, balance transition and Mirror principal/fee.
Additional direct Mirror reads confirm SUCCESS, seller0.0.10389111 credit20,000,000
tinybars and buyer0.0.10389098 debit55,439,404, including fee35,439,404 tinybars.
Seller available82/held0; Buyer available18/held0. Exactly2 NOVA delivered for
0.20 HBAR; Buyer payment fee0.35439404 HBAR. [Actual user capture](038-t08-normal.png)
shows Settled, Delivered/Paid verified. Initial pending display resolved to verified;
no extra payment transaction is claimed. Raw public operation proofs are in JSON.

Next is reverse: Buyer account sells1@0.09; Seller account buys1@0.09, then the
selling Buyer account locks/registers and the buying Seller account pays0.09.
Reverse/cancel/reclaim and final reload/restart comparison remain pending. Static
showcase remains the earlier dated snapshot until the acceptance evidence update.

### Reverse case17-1 settled — block40258794

Buyer account sold1@0.09 (sequence16); Seller account bought it (sequence17).
Buyer-held Hold1 was locked/registered, then Seller paid0.09 HBAR in
`0x6b36f5c233252b4cf20bc38050daf71f8453e814030a0511c65c5e25d9789277`.
All three original operations are verified by the production proof pipeline;
full hashes, event indices, fees and balance transitions are in the public JSON.
Direct Mirror read confirms Buyer account0.0.10389098 credit9,000,000 tinybars,
Seller account0.0.10389111 debit44,105,070 including35,105,070 tinybar fee.
Final account balances: Seller83/held0, Buyer17/held0. JSON seller/buyer balance
field names follow this match's trading roles, so reverse-case seller means the
Buyer account. [Actual user capture](038-t08-reverse.png) shows delivery/payment
verified. No duplicate payment or extra chain transaction was observed.

Next cancellation case: fresh Seller Sell1@0.10 and Buyer Buy1@0.10, Seller
locks/registers, then Seller cancels before expiry; Buyer must not pay this case.
Final persistence comparison, cancellation and expired reclaim remain pending.

### Registered cancellation19-1 verified — block40259539

Fresh Seller18/Buyer19 orders matched1 NOVA@0.10. Seller locked and registered,
then cancelled in transaction
`0x4d048c904b49f8fd5aa0b0064446180465ea430d16e02e7bd708d99cf1f40b0c`.
All three original operations are verified; their calldata-bound public proofs,
Hold terms, event indices, fees and balance transitions are in JSON. Cancellation
fee0.22002750 HBAR; principal0. Seller available82→83, held1→0; Buyer17/0 unchanged.
Direct Mirror read confirms SUCCESS/value0/block40259539. [Actual capture](038-t08-cancel.png)
shows Cancelled, Returned verified and HBAR Not paid. Matched order history is
retained; the cancelled quantity is not automatically rebooked.

Next is a separate expiry/reclaim case: fresh Seller Sell1@0.10 and Buyer Buy1@0.10,
Seller locks/registers, Buyer does not pay and Seller does not cancel. Wait for
that new Hold's preparation timestamp+1800 deadline, then verify expiry still
leaves NOVA held and manually reclaim. Reclaim and final reload/restart checks
remain pending; no future operation is claimed here.
