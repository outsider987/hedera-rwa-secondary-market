# T05 manual acceptance — in progress

September 8, 2026. **Atomic settlement verified; final acceptance checks Pending.**
Victor supplied the public deployment intent and screenshots showing
`deploy · complete`. The agent has performed only public receipt/runtime reads.

- Transaction: `0xd9d9f59e4b91e0f6483585e698f5325c8079ad4112a11807100708a61183faa4`.
- Swap: `0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158`.
- Successful deployment receipt at block **40245682**. At block **40246275**,
  runtime matched the pinned artifact/expiry and swap state was **Open (0)**.
- [Victor's supplied capture](032-t05-deploy.png) is a cropped application view
  showing the recovered deployment, not an automated capture or a complete trade.

The first screenshot also showed “Swap already closed without recovered
evidence.” This was a client-state defect: manual recovery updated the journal
while retaining a pre-recovery balance snapshot and undefined swap state.
The page now clears that pair before recovery and requires a new readiness
read afterward. The contract was open; no redeployment or contract change was
needed. Validation and recovered public fields are recorded in
[evidence 031](031-t05-browser.json) and [manual JSON](032-t05-manual.json).

Victor subsequently supplied `holdbook-public-evidence (22).json` and a
[lock-complete capture](032-t05-lock.png). Independent, read-only recovery
verified transaction `0xd9c4059eae45ea0e322d6d79fdfc53c55385464c69012f745a83dad982236396`
at block **40246787**, including receipt, calldata, HeldByPartition event,
historical state, runtime and Mirror identity. The event derives **Hold ID 2**:
10 NOVA, this swap as escrow, Buyer as target, empty data, original expiry.
Seller changed from **94/0** to **84/10** available/held; Buyer remains **6/0**.
Supply remains 100; the swap remains Open (0). Raw verified fields and check
provenance are appended to the manual JSON. This evidence-only update changes
no application or contract code; prior automated checks remain dated evidence.

Victor then supplied export (23) and a [settlement capture](032-t05-purchase.png).
Independent read-only recovery verified settlement hash
`0x4713f2c140876484451fe3144e9c35339486c57abe37247bf78adb5e897cbf96`
at block **40247134**: same-hash ATS delivery and Settled events, Buyer signer,
exact payment units, historical state, pinned runtime and Mirror identity.
Seller is **84/0**, Buyer **16/0** available/held; swap state is Settled (1).
Seller's principal credit is **100,000,000 tinybars (1 HBAR)**. The separately
reported transaction fee is **33,893,288 tinybars (0.33893288 HBAR)**; it is not
deducted from that Seller principal credit. Supply remains 100.

Next: Buyer runs the post-settlement duplicate rejection check, exports both
pre-purchase and duplicate simulation records from History, and supplies the
final page capture. Original simulation evidence and final acceptance remain
Pending; no additional purchase is needed. Raw settlement fields and verification
provenance are appended to the manual JSON. No application code changed.
