# T04 manual acceptance — September 8, 2026

**Pending: only the original Create Hold 10 transaction has been independently
verified.** Buyer VC/KYC, both negative-check stages, execute and release are
not accepted yet. Implementation base: `0c45b8994fdc151702d348ab37233b08d1ca47b6`.
[Public evidence and repair validation](029-t04-manual.json).

The user supplied screenshots showing Seller connected, a pending contract
interaction, and subsequent Seller available 90 / held 10, Buyer 0 / held 0,
active Hold ID 1 and remaining 10. The latest [creation screenshot](029-t04-create.png)
records the recovery error before repair, not a successful final acceptance UI.
It supplies original hash
`0x9c3fe919cd41945554fa5677eefb8f1730c8b9a404d0766b50a9638f26b2611e`
and reviewed base block **40227946**. No original public intent JSON was supplied;
recovery reconstructs fixed creation inputs from calldata and checks that base.

The real transaction receipt and Mirror both report success. The recovery guard
incorrectly required its consensus seconds to equal its block's starting seconds:
block **40227994** starts at **1788799832**, while this transaction's consensus
timestamp is **1788799834.713395188**. Mirror's block interval contains that time.
The repair binds the exact Mirror `block_number` to the verified receipt block;
hash, full calldata, zero value, sender account mapping, result and exact
timestamp-filtered transaction identity checks remain. No SDK/dependency change.

A regression fixture now uses different block-start and consensus seconds for
all four recoveries and rejects an incorrect Mirror block number. It failed on
the original code and passes with the repair. Mandatory ci/tests/typecheck/build
and dev/preview browser smoke results are recorded in the JSON. Independent
read-only recovery of this actual hash checks the event, historical before/after
state, original expiry basis and Mirror identity. It establishes Hold **1**,
Seller **90 / held 10**, Buyer **0 / held 0**, supply **100**, and complete creation
evidence. The agent performed no transaction or signature.

The rebuilt preview's actual Query T04 transaction button also recovers this
hash to complete using live public endpoints (85 RPC reads, no page errors).
That browser check preloads the public confirmed record into an isolated context;
it does not access the user's browser storage or wallet.

Next: reload preview, query this saved Create Hold 10 hash, and preserve the
public export. Once complete, original Admin reviews the un-KYC Buyer negative
check. Never recreate the Hold. The separate remaining stages must establish
valid Buyer KYC, Seller 94 / Buyer 6 / both held 0, supply/cap 100/1000 and active
Hold removal before T04 closes. No T04 push/merge. Existing native BBS,
audit/peer/license and event eligibility limitations remain.
