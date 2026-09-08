# T08 manual acceptance — Pending

September 8, 2026. [Spec](../plans/004-matched-settlement.md) ·
[Operator sequence](../DEMO.md#t08--fresh-matched-settlement) ·
[Public record](038-t08-manual.json).

No T08 deployment, order signature or settlement transaction has been observed.
There are no T08 hashes, fees, Hold IDs or screenshots to report yet. Expected
counts are eight order signatures and thirteen chain transactions, including one
Admin deployment; rejection/recovery extras must be recorded separately.

1. Open local production preview, bind the original three accounts on Testnet296.
   Admin reviews and manually deploys the new contract; wait for independent
   verification and saved acceptance cutoff before placing new orders.
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
