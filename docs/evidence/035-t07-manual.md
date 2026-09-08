# T07 manual acceptance — Pending

September 8, 2026. **1 of 6 manual signatures observed.** Victor supplied the
first Seller order export and [preview/MetaMask capture](035-t07-orders.png).
Original request `7751288d45ad4142ebcae4a6485de6ac45627e0cc9ab60e6868879fa0df621a2`
is accepted, sequence 1: **Sell 4 NOVA at 0.09 HBAR**, remaining 4, matched 0,
cancelled/expired 0. Maximum intent is 0.36 HBAR; the live book has one ask and
no matches. This supersedes the implementation-stage empty-book observation.

The public API's original command and current order exactly match the export.
Independent viem EIP-712 hashing reproduces digest
`0x4e4921b889db5111e78d9b77bd427fbe82113701e9bcaa338ffeffc253c17e1b`.
Preparation 1788850036, acceptance 1788850043, submission deadline 1788850336,
order expiry 1788936436: accepted before the five-minute deadline, with exactly
24-hour order expiry. Domain salt matches the original deployment. Backend reports
signature verified; no raw signature was read/exported or independently recovered.
The screenshot's older wallet contract activities are not T07 transactions.

Evidence-only checks: public-field whitelist, exact API/export comparison,
independent digest, owner/side/amount, time boundaries and quantity conservation
passed. Existing implementation test results remain in report034; unchanged
application suites were not rerun for this evidence-only update.
Next: keep Seller and place **5 NOVA at 0.10 HBAR**. Five signatures and final
reload/restart observations remain Pending. Earlier zero-signature status is
retained in the JSON as the initial checkpoint.

Follow the six-signature [demo](../DEMO.md#t07--unfunded-matching-acceptance-pending):
Seller sell 4@0.09, sell 5@0.10; Buyer buy 6@0.10; Seller cancel remaining 3;
Buyer sell 1@0.10; Seller buy 1@0.10. Initial matches must total 0.56 HBAR intent,
with the reverse match adding 0.10 HBAR. Verify reload and API restart preserve
five orders, three matches and no remaining quantity. Export public evidence and
retain actual screenshots only after these observations exist.

[Public acceptance status](035-t07-manual.json) is explicitly pending.
No funds are reserved, no NOVA/HBAR moves and no chain transaction ID exists.
No T08, public push or merge is authorized. Original T05 evidence is unchanged.
