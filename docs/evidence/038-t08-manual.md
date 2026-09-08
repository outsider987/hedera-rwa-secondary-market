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

Observed: **one chain transaction, zero new order signatures**. All four settlement
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
