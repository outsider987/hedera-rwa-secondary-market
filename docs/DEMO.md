# HoldBook · two-minute demo

## T05 operator flow — manual acceptance Pending

Open http://127.0.0.1:4173. Connect the original accounts in Settings, then use
Trade. Start only with Seller 94, Buyer 6, both held 0, supply/cap 100/1000,
config 1, KYC covering the reviewed 24-hour expiry, and no unknown MetaMask
operation. The interface rechecks these conditions before each submission.

1. **Admin:** Check readiness → Review deployment. Inspect the fixed contract,
   accounts and expiry; check the review box and manually approve in MetaMask.
   Save the exported public result after receipt/runtime/Mirror verification.
2. **Seller:** Check readiness → Review Hold. Lock 10 NOVA with the new swap as
   escrow and Buyer as target. Manually approve; verify **84 / 6 / held 10**.
   The Hold ID comes from the event. Export the result.
3. **Buyer:** Check readiness → Review checks → Run read-only checks. Wrong
   Buyer and wrong payment must revert. Then Check readiness → Review purchase,
   review **1 HBAR plus the network fee**, and manually approve. Verify
   **Seller 84 / Buyer 16 / held 0** and Seller's **1 HBAR principal** separately
   from fees. Export the result. Finally run the displayed duplicate-purchase
   rejection check and export it.

These are three transactions. Read-only checks have no signature or transaction
ID. If a result is unknown or indexing is pending, open **Recover an existing
operation**, select the saved action and query the original hash. Restore the
original public intent JSON if needed. Never clear the journal to submit again.
Cancellation starts a separate Seller review; after expiry the next action is
reclaim. Those alternate paths are locally tested; normal human acceptance
performs only this trade. Do not renew expired KYC or change pinned deployments.

[Implementation report](evidence/031-t05-implementation.md) ·
[Fixed specification](plans/002-atomic-trade.md).
No T05 on-chain result or successful human acceptance is claimed yet.

## Completed T04 walkthrough

**Show the completed run. No new transactions or signatures.**
Open the [acceptance report](evidence/029-t04-manual.md) and
[screenshot gallery](evidence/029-t04-manual.html). Open the gallery locally
from the cloned repository; GitHub displays its HTML source.

## Show and say

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:15 | [Recorded final result](evidence/029-t04-manual.md) | “HoldBook demonstrates a fictional equity lifecycle on Hedera Testnet. Seller holds the shares; Admin acts as escrow and issues synthetic KYC credentials.” |
| 0:15–0:35 | [Hold 10 and KYC rejection](evidence/029-t04-kyc-negative.png) | “Seller reserved 10 of 100 NOVA shares. Execution to Buyer was rejected while Buyer had no KYC.” |
| 0:35–0:55 | [Buyer credential](evidence/029-t04-buyer-vc.png), then [KYC grant](evidence/029-t04-buyer-kyc.png) | “Admin signed a synthetic Buyer credential and granted KYC. We also checked that Seller could not execute as escrow, and Admin could not execute more than the held amount.” |
| 0:55–1:15 | [Execute 6](evidence/029-t04-execute.png) | “Admin executed 6 to Buyer. Four shares remained held.” |
| 1:15–1:35 | [Release complete](evidence/029-t04-final.png) and balance table below | “Admin released the remaining 4 to Seller. Seller finished with 94, Buyer with 6, and no shares remained held.” |
| 1:35–2:00 | [Transaction links and verification](evidence/029-t04-manual.md) | “Four transactions were manually approved in MetaMask. Receipts, events and historical balances were independently checked. This recorded run demonstrates the asset lifecycle; T05 payment acceptance is pending.” |

## Follow the shares

| Recorded stage | Seller available | Buyer available | Seller held |
| --- | ---: | ---: | ---: |
| Start | 100 | 0 | 0 |
| Hold 10 | 90 | 0 | 10 |
| Buyer KYC granted | 90 | 0 | 10 |
| Execute 6 | 90 | 6 | 4 |
| Release 4 | **94** | **6** | **0** |

Supply stayed **100**, cap **1000**, Buyer held **0**. Final acceptance at block
**40241114** on September 8, 2026 verified valid Buyer KYC and no active Holds.
The final screenshot shows the journal; balances come from independent RPC reads.

## Three expected rejections

| Read-only attempt | Recorded rejection |
| --- | --- |
| Admin executes 6 before Buyer KYC | SDK `AccountNotKycd`; contract `InvalidKycStatus` |
| Seller executes 6 after Buyer KYC | `IsNotEscrow` |
| Admin executes 11 while 10 are held | `InsufficientHoldBalance(10,11)` |

All three left state unchanged. They are recorded in **two simulation records**
with **no transaction ID or signature**. [Evidence and historical replay](evidence/029-t04-manual.json).

## Optional live view

1. [Start the local console](../README.md#run-locally).
2. Open **Trade** and click **Check readiness**.
3. Read the current balance snapshot and its block. **Cancel check** stops a slow query.

This query needs internet, but no wallet connection or signature. Current KYC
can expire; saved journal status does not prove a current result. Use **History**
and the dated report for T04 acceptance and its rejection checks. All T04
transaction/signature entry points are closed. This historical walkthrough
does not perform the separately authorized T05 flow above.
