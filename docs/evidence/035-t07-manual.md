# T07 manual acceptance — Passed with documented recovery

September 8, 2026. Victor completed **12 accepted, backend-verified commands**:
nine placements and three cancellations. The final book contains **nine orders,
five matches, no remaining quantity**, totaling **1.16 HBAR of unfunded intent**.
All matches are **Matched · Not settled**. No funds were reserved or transferred.

| Acceptance behavior | Actual observation |
| --- | --- |
| Price priority / resting prices | Initial Buyer6 matched Seller4@0.09 + Seller2@0.10, total 0.56 HBAR |
| Partial cancellation | Buyer cancelled remaining3 after matching3; supplementary Seller5 matched2 and cancelled remaining3 |
| Reverse account roles | Buyer Sell1 / Seller Buy1 matched at 0.10 |
| Signature rejection recovery | Operator-reported cancelled prompt stayed pending, then backend confirmed expired without an order |
| Persistence | Final export12 equals export11 and post-restart API orders, matches, domain and version |

The original six-signature sequence was **not** executed without deviations.
An extra Seller4@0.09 was cancelled. An extra Buyer6 consumed Seller's initial
remaining3, then Buyer cancelled its own remaining3. After the reverse match,
Seller5 / Buyer2 / Seller cancel3 supplemented the missing Seller partial-cancel
case. These explain the actual twelve commands and 1.16 HBAR total instead of
the original six commands and 0.66 HBAR. No history was erased or reset.

Final verification independently recomputed all twelve accepted EIP-712 digests,
checked submission deadlines and backend verification reports, compared exported
commands to the original API results, and checked public-field whitelists.
Exports9–12 and full public command results are retained in the
[acceptance JSON](035-t07-manual.json), alongside earlier checkpoints. The final
Seller order `2a362bc4488fb1a570a21b964bd232876207b84a1b258d0ab40f81eb2ba3e500`
has matched2, cancelled3, remaining0. The actual API restart occurred after
export11; the subsequent operator reload export12 still matches exactly.

[Final cancellation](035-t07-final-cancel.png) · [Final reload](035-t07-final-reload.png).
Earlier captures and checkpoints remain retained. Wallet contract activities in
screenshots are not T07 transactions. Raw signatures were never read or exported;
independent digest checks do not independently recover the signer.

This evidence-only closeout did not rerun unchanged application suites. Actual
Go/PostgreSQL/Foundry checks remain in [034](034-t07-implementation.md); latest
104 app +36 protobuf tests, typecheck/build and six UI cases are in
[036](036-t07-layout.md). No chain receipt or transaction ID exists for these
unfunded commands. T07 is complete at the local boundary; T08, push and merge
remain outside authorization.
