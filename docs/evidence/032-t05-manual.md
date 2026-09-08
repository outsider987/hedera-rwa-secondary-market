# T05 manual acceptance — complete

September 8, 2026. Victor completed the fixed **10 NOVA for 1 Testnet HBAR**
trade on local preview 4173. Three manually approved transactions and three
read-only rejection cases were independently verified. No agent signed or
submitted a transaction. [Public JSON](032-t05-manual.json) retains whitelisted
inputs, hashes, historical snapshots, payment and verification provenance.

| Stage | Receipt block | Seller available / held | Buyer available / held |
| --- | --- | --- | --- |
| Admin deployment | 40245682 | 94 / 0 | 6 / 0 |
| Seller Hold ID 2 | 40246787 | 84 / 10 | 6 / 0 |
| Buyer settlement | 40247134 | **84 / 0** | **16 / 0** |
| Final rejection readback | 40247352 | **84 / 0** | **16 / 0** |

NOVA remains `0.0.10402368`, partition 1, config 1, supply **100**, cap **1000**,
chain **296**. Swap `0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158` is Settled (1).
The expiry remains review block 40245635 timestamp +86400; both KYC records
covered it. Hold ID **2** was derived from HeldByPartition, not assumed.

- [Deploy transaction](https://hashscan.io/testnet/transaction/0xd9d9f59e4b91e0f6483585e698f5325c8079ad4112a11807100708a61183faa4): constructor, receipt, runtime and Mirror identity verified.
- [Lock transaction](https://hashscan.io/testnet/transaction/0xd9c4059eae45ea0e322d6d79fdfc53c55385464c69012f745a83dad982236396): Seller signer, exact calldata, event, full Hold and historical balances verified.
- [Settlement transaction](https://hashscan.io/testnet/transaction/0x4713f2c140876484451fe3144e9c35339486c57abe37247bf78adb5e897cbf96): same-hash ATS delivery and Settled events, Buyer signer, exact payment units, runtime transition and Mirror payment verified.

Seller received **100,000,000 tinybars (1 HBAR)** principal. The transaction fee
was separately **33,893,288 tinybars (0.33893288 HBAR)**; it was not deducted from
that Seller credit. Wallet value was exactly **10^18 weibars**.

Original simulations were replayed with their recorded sender, value, calldata
and block: wrong Buyer → `WrongAccount` and wrong payment → `WrongPayment` at
**40246969** (unchanged readback 40246981); duplicate purchase → `Closed` at
**40247341** (unchanged readback 40247352). All three exact revert responses
matched. Simulations have no signature or transaction ID.

Victor's supplied captures: [deploy](032-t05-deploy.png), [lock](032-t05-lock.png),
[purchase](032-t05-purchase.png), [final](032-t05-final.png). The final capture's
static Pending label predates this completed report; its Complete stage and
84/16/held 0 snapshot match the independently verified records.

[Implementation checks](031-t05-implementation.md) passed: npm ci, 98 app + 36
protobuf tests, typecheck/build, 16 local VM contract tests, dev/preview desktop,
mobile and controlled SDK checks. A deployment-recovery stale snapshot defect
was repaired and verified in both browsers before subsequent manual stages.
This final evidence-only update replays public reads; it does not rerun unchanged
code suites. Cancellation, expiry and fault rollback remain local VM coverage.
[Existing attribution and limitations](../ATTRIBUTION.md) remain applicable.
T05 stops at local commits; no new trade, public deployment, push or merge.
