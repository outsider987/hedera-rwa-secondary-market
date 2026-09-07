# T04 implementation — September 8, 2026

**T03 is merged; T04 code and automated verification are delivered locally.
Manual T04 acceptance is Pending. This work performed no T04 transaction or VC
signature.** [PR #4](https://github.com/outsider987/hedera-rwa-secondary-market/pull/4)
merged after CI passed on head `52deb83f0989f955c593150b081b00105066a5ea`.
The T04 base is merge commit `61c411d70235ce7d882a8b4c84150e9b3c636d8c`;
branch `feat/t04-hold-lifecycle`. [Supplied intent](../prompts/025-t04-hold-lifecycle.md)
· [Validation and raw check logs](028-t04-validation.json)
· [Development corrections](028-t04-development.json).

The fixed flow uses original NOVA **0.0.10402368**, chain **296**, config **1**,
cap **1000** and the original three accounts. Seller reviews Hold **10**, Escrow
Admin, zero target, empty data and an immutable expiry of reviewed block seconds
+86400. The successful HeldByPartition event supplies the decimal Hold ID.
Admin then checks the genuine SDK's Buyer KYC rejection and matching read-only
contract revert, prepares/reviews/manually signs/verifies Buyer VC, and grants
KYC. After read-only non-Escrow execute 6 and excessive execute 11 checks,
Admin executes **6** to Buyer and releases **4** to the original Seller.
The real SDK public requests and Terminal3 verification remain in use.

The existing wallet review now binds the expected signer role; only Hold creation
uses Seller. Each mutation rechecks accounts, chain, asset, roles/KYC, full Hold,
balances, exact calldata and zero value. Shared Web Lock/session guards serialize
prompts. Intent precedes submission; late hashes persist and trigger one full
recovery with a 180-second deadline. Receipt, exact event/calldata, historical
transition, Mirror sender mapping and transaction identity must agree. Indexing
delay remains pending. Full release uses its event, zero held and active-ID
removal without querying a deleted Hold. Public JSON separates transactions
from simulations; full VC/proof stays in memory. Missing intent requires the
original hash/base block; missing Buyer digest requires the original public
export. Imported completion is reverified. Unknown work cannot authorize replay.
T03 mutations are closed and its history remains independent of T04 current data.

## Actual checks

- `npm ci`, **87 application + 36 protobuf tests**, typecheck and build pass.
  Tests include fixed signer/calldata/input guards, exact reverts versus transport
  errors, genuine unsigned/invalid Buyer VC rejection, all four historical
  transaction recoveries, Mirror delay, late hashes, journal restoration and
  lease release after invalid storage. Final shell and four browser smoke/cancel
  cases pass. No dependency, lockfile, framework or retained patch changed.
- [18 genuine SDK browser cases](028-t04-sdk-browser.json) pass across dev and
  production builds with explicitly synthetic network/wallet boundaries:
  create/execute/release rejection and saved-hash handoff; un-KYC rejection at
  latest and historical blocks; transport failure never passes. Two additional
  unsigned Buyer grant checks reject. No valid VC or chain success was fabricated.
- [Four live-read UI cases](028-t04-ui-browser.json) pass at 1440/390 widths on
  dev 5173 and preview 4173: keyboard/focus, no overflow, origin guard, account
  invalidation, reload, cross-tab unknown journal and native lock exclusion.
  No forbidden requests/page errors. Mobile is desktop Chrome viewport emulation.
  A separate UI reviewer reports **ship** for all four captured create-Hold
  reviews and inspected source; later VC/simulation/execute/release screens and
  real MetaMask behavior remain outside that visual verdict.
- [Live public readback](028-t04-live-read.json) verifies T02 historical supply
  **0 at 40209377**, all six T03 transactions, and T04 starting state at
  **40226582**: Seller **100/held 0**, Buyer **0/held 0**, Seller valid KYC,
  Buyer not KYC, supply/cap **100/1000**. UI reviews also check Hold creation logs
  since issuance, including deleted Holds. No T04 operation existed in these reads.

## Manual acceptance still required

Victor opens **http://127.0.0.1:4173**, selects original **Seller**, and reviews
Create Hold 10. After creation, select original Admin and follow each displayed
stage. Each next review/checkbox/MetaMask approval remains manual. Preserve
public exports and screenshots for four transactions, two simulation records
and the Buyer VC verification. Final independent acceptance must establish
Seller **94**, Buyer **6**, both held **0**, Buyer valid KYC, supply/cap
**100/1000**, matching KYC seconds/issuer/ID/digest and no active Seller Hold.
Those final values are currently fixture expectations, not actual T04 results.
No T04 push/merge or next ticket. Native BBS exclusion, 62 audit findings, peer
incompatibilities, dfns license omissions and unresolved pre-event eligibility
remain. This proves no payment settlement or completed secondary market.
