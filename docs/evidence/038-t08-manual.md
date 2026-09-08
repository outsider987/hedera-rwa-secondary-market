# T08 manual acceptance — four chain cases verified

September 8, 2026. [Spec](../plans/004-matched-settlement.md) ·
[Public proofs](038-t08-manual.json) · [Operator guide](../DEMO.md).

Victor manually approved the deployment and each operation in MetaMask on
Testnet296. The original NOVA asset and three accounts were retained. Deployment
`0xa90da61f67c37473f38000e70623a77ad277304c` is verified at40257294 with accepted-order
cutoff12. Only subsequent fresh orders formed these four matches.

| Case | Match | Verified result | Final transaction block | Actual capture |
| --- | --- | --- | --- | --- |
| Normal | 15-1 | 2 NOVA delivered, 0.20 HBAR paid | 40258355 | [Normal](038-t08-normal.png) |
| Reverse | 17-1 | Buyer account sold1 NOVA; Seller account paid0.09 HBAR | 40258794 | [Reverse](038-t08-reverse.png) |
| Cancel | 19-1 | Registered settlement cancelled;1 NOVA returned, no payment | 40259539 | [Cancel](038-t08-cancel.png) |
| Expiry | 21-1 | Expired Hold5 reclaimed;1 NOVA returned, no payment | 40263598 | [Reclaim](038-t08-reclaim.png) |

Hold5 preparation1788867615 and expiry1788869415 are exactly1800 seconds apart.
Victor's expiry review showed NOVA still locked and HBAR unpaid. Reclaim occurred
at1788875948, after expiry. Original operation
`aa3b4641e452a14e7b5f76778baed1c80a85cdc289fd88642c1a1dd220377942`
verified transaction
`0x96a5d7e4705a5372692ab2a11343429ba4dea8b88f14896ac1bfded2336e07de`.
Seller available82→83 and held1→0; Buyer17/0 unchanged. Reclaim fee0.22235090 HBAR,
principal0. Direct Mirror independently reports SUCCESS/value0/block40263598.

The production verifier checked saved terms/calldata, sender, value, receipt,
runtime/domain, ATS and settlement events, historical balance transitions and
Mirror evidence. JSON preserves all three operations per case, hashes, event
indices, fees and public terms. Balance field names follow match trading roles:
reverse-case seller means the Buyer account. The settlement terms contain the
actual Hold ID; non-lock operation evidence's holdId0 is not a separate Hold.

Observed **9 accepted order signatures and13 chain transactions**, including one
deployment. The original plan expected8 signatures; the extra Seller buy order
was cancelled by self-trade prevention. The mistaken Buyer0.20-price request
expired without an accepted order. JSON retains that correction. Pending hash
recoveries queried original operations without resending. A stopped preview was
restored; its termination and initial incomplete-request causes are undetermined.
Earlier dated observations remain available in Git history.

With no pending operation, `docker compose restart api` preserved the complete
market (excluding serverTime), all settlements and deployment with embedded
proofs: **18 orders and9 matches** remained identical. This includes existing
historical market records. Final verified account balances are Seller83/held0 and
Buyer17/held0. Original T05/T07 evidence was not altered.

**Remaining:** Victor's browser reload confirmation, final four-case static
snapshot and its validation/documentation. These chain results do not claim that
the entire T08 delivery is complete. No agent signer, private key, full VC
signature, push, merge or publication was used.
