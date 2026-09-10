# HoldBook · operator and judge demo

## Three-minute recorded presentation — September 10, 2026

Open `http://127.0.0.1:4173/?demo=1#overview` after `npm run build` and
`npm run preview`. The new presentation is local; the published site retains
its earlier version until separately authorized deployment. No wallet is needed.

Manual advance is the default: Previous / Next, Replay scene, Restart demo.
Space or Right advances, Left goes back, Escape exits when focus is outside
interactive controls. Buttons, links and forms keep their normal keys. Start
“Play 3-minute sequence” explicitly for timed playback; Pause / Resume retains
elapsed time. Manual jumps stop the sequence. Backgrounding, leaving Overview
or exiting pauses it without catch-up. Market keeps its ordinary workbench;
returning preserves the scene, while reload begins at the opening.

| Time | Screen | English narration |
| --- | --- | --- |
| 00:00–00:15 | Overview | “HoldBook demonstrates tokenized equity trading with verifiable settlement on Hedera. NOVA is fictional equity; all credentials are synthetic and all records are on Testnet.” |
| 00:15–00:35 | Tokenization | “NOVA is fictional equity created with Hedera Asset Tokenization Studio. Creating the asset starts with zero supply. In the recorded issuance, one hundred whole shares reached the seller.” |
| 00:35–01:00 | Compliance | “A synthetic credential names Admin as issuer and Seller as subject. Verification alone does not open the gate. The separate on-chain KYC grant established eligibility at that historical point.” |
| 01:00–01:40 | Matching | “Orders match by price and time. Four shares match at point zero nine, then two at point one. Three shares remain on the ask. Matching itself moves no NOVA or HBAR.” |
| 01:40–02:15 | Atomic swap | “This is a separate recorded fixed swap, not settlement of those T07 matches. The seller locks ten NOVA. The buyer pays one HBAR. Delivery and payment complete atomically, in the same transaction.” |
| 02:15–02:35 | Proof | “The recorded transaction and historical balances provide inspectable evidence. Settlement occurred in block forty million, two hundred forty-seven thousand, one hundred thirty-four.” |
| 02:35–02:55 | Inspect evidence | “The later verification block is forty million, two hundred forty-seven thousand, three hundred fifty-two. Seller has eighty-four, Buyer sixteen, neither has held shares, and Seller received one HBAR principal. Network fees are separate.” |
| 02:55–03:00 | Ending | “HoldBook. Agreement, settlement, proof.” |

Hold on each cue for manual narration. The illustration is explanatory; it never
creates another asset, credential, match, Hold or payment. T02/T03 issuance,
T07 matching and T05 swap are separate records with different starting balances.
Proof links the original transaction, acceptance report and public snapshot.
“View T08 recorded cases” restores the detailed story below; select Trade NOVA
and the normal, reverse, cancelled or reclaimed case. Expiry alone does not
release held shares. Historical eligibility is not current KYC validity.

Victor's remaining presentation action is a narration trial and visual acceptance
on the actual recording device. Automated viewport checks are not physical mobile
performance measurements. [Implementation and browser evidence](evidence/050-demo-experience.md).

Completed with documented recovery: [T07 unfunded market acceptance](#t07--unfunded-matching-acceptance-pending). The T05 walkthrough below is completed history.

## T05 recorded operator flow — acceptance complete

The following flow was completed September 8, 2026. Present the saved History
and [acceptance evidence](evidence/032-t05-manual.md); do not repeat this trade.
Final block 40247352: Seller 84, Buyer 16, both held 0; Seller received 1 HBAR.

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
All three transactions and three read-only rejection cases are independently
verified in [public evidence 032](evidence/032-t05-manual.json).

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
| 1:35–2:00 | [Transaction links and verification](evidence/029-t04-manual.md) | “Four transactions were manually approved in MetaMask. Receipts, events and historical balances were independently checked. T05 subsequently completed one atomic trade; its separate report verifies delivery and payment.” |

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

<a id="t07--unfunded-matching-acceptance-pending"></a>

## T07 — unfunded matching acceptance (Passed with recovery)

Actual acceptance: twelve accepted commands, nine orders, five matches,
1.16 HBAR intent, zero remaining. Supplementary Seller partial cancellation
and final reload/API restart passed. See [035](evidence/035-t07-manual.md) for
actual deviations. The six-signature sequence below is the original scenario,
not a claim that the observed run followed it without recovery.

Open production preview http://127.0.0.1:4173 after `docker compose up -d --build`
and `npm run build` / `npm run preview`. Market is the default tab. Keep the
original three account bindings. The new book must have no orders or matches;
do not clear an existing book to reproduce this example.

Victor approves exactly six EIP-712 signatures in MetaMask; no chain transaction
or gas payment is requested. Check the original account, Testnet 296, side,
quantity, limit, 24-hour order expiry and five-minute signature deadline in each
review. Check the acknowledgement and use **Sign in MetaMask**.

| Signature | Account | Action | Expected observation |
| --- | --- | --- | --- |
| 1 | Seller | Sell 4 NOVA at 0.09 HBAR | Open ask: 4 |
| 2 | Seller | Sell 5 NOVA at 0.10 HBAR | Open asks: 4 at 0.09, 5 at 0.10 |
| 3 | Buyer | Buy 6 NOVA at 0.10 HBAR | 4 at 0.09 + 2 at 0.10; intent total 0.56 HBAR |
| 4 | Seller | My orders: Cancel remaining 3 | Matched 2 retained; Cancelled 3; Remaining 0 |
| 5 | Buyer | Sell 1 NOVA at 0.10 HBAR | Buyer account can act as seller |
| 6 | Seller | Buy 1 NOVA at 0.10 HBAR | Seller account can act as buyer; third match 0.10 HBAR |

After each signature wait for **Request accepted** and export public market
evidence. Reload, reconnect manually, and verify the same orders and matches.
Restart only this project's API (`docker compose restart api`) and recheck.
Expected final: five orders, three matches, all remaining quantities zero;
first two matches total 0.56 HBAR, all three total 0.66 HBAR of unfunded intent.
No NOVA/HBAR transfer, reservation, ATS Hold, receipt or chain transaction ID
exists for this flow. Human observations and captures go to [manual report 035](evidence/035-t07-manual.md).

If a response is lost, retain the original request ID and use **Query original
request**. Do not sign another order to replace an unknown one. Rejected/late
wallet prompts remain pending until the server confirms deadline expiry.


## T08 — fresh matched settlement

The following sequence is completed acceptance history; do not replay it to view
the result. Manual038 records all four cases and reload/restart agreement.
Use preview http://127.0.0.1:4173 and the original three accounts. Each wallet
prompt is a separate Victor action. Admin deploys once; it does not sign orders
or execute either trading account's actions. Do not repeat T05/T07 transactions.

1. Select Admin, open **Settlement setup**, review the fresh contract and approve
   deployment in MetaMask. Query the original operation until verified, then
   download its public evidence. The activation cutoff excludes all older orders.
2. Seller places **Sell 2 @ 0.10**; Buyer places **Buy 2 @ 0.10**. These are two
   reviewed unfunded-order signatures. Select the new match. Seller reviews and
   approves **Lock NOVA (1/2)**, queries its receipt, then separately reviews and
   approves **Confirm match terms (2/2)**. Buyer selects **Review payment**, checks
   **0.2 HBAR plus network fee**, and approves. Verify and export the result.
3. Click **New order**. Buyer places **Sell 1 @ 0.09**; Seller places **Buy 1 @
   0.09**. Buyer account is now selling: it locks and registers. Seller account
   is buying: it pays **0.09 HBAR plus network fee**. Verify and export.
4. New Seller **Sell 1 @ 0.10** / Buyer **Buy 1 @ 0.10**. Seller locks, registers,
   then manually chooses **Cancel settlement** before payment. Verify the NOVA
   return. **Cancel remaining** in My orders is a different unfunded-book action.
5. Another fresh pair **1 @ 0.10**. Seller locks and registers, then waits until
   the exact displayed UTC expiry (30 minutes from preparation). Expiry alone
   returns nothing. Seller manually chooses **Reclaim expired NOVA**; verify and
   export its return. An unregistered Hold instead uses **Return unregistered Hold**.
6. Reload the page and restart only the API, preserving the database volume.
   Compare original orders, matches, Holds, operation hashes, payment and fee
   evidence. Preserve actual screenshots and whitelisted JSON in report 038.

Observed total: nine accepted order signatures and thirteen transactions,
including deployment and one extra self-trade-prevented order. Extra rejection or
recovery actions must be recorded honestly. Unknown operations query the original
hash; no automatic resubmission or deadline-based declaration of failure. If the
wallet prompt was rejected, re-review is explicit. Stop on pinned configuration
or KYC incompatibility rather than renewing or changing asset parameters.

All four portfolio cases are independently verified in manual038. No push, merge or publication is authorized by the local implementation.
