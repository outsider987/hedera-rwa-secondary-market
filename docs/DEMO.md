# HoldBook · two-minute demo

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
| 1:35–2:00 | [Transaction links and verification](evidence/029-t04-manual.md) | “Four transactions were manually approved in MetaMask. Receipts, events and historical balances were independently checked. This demonstrates the asset lifecycle; payment settlement remains future work.” |

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

1. [Start the local console](../README.md#run-the-console-locally).
2. Under **T04 · Hold lifecycle**, click **Check current T04 state**.
3. Read the balances below the buttons. **Cancel T04 read** stops a slow query.

This query needs internet, but no wallet connection or signature. Current KYC
can expire; a fresh browser may show **Recovery required** without the saved
journal. Use the dated report for acceptance and the earlier rejection checks.
Do not use **Review next T04 action**, prepare another VC or approve a transaction
for this walkthrough.
