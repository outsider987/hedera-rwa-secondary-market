# T05 implementation and verification — September 8, 2026

**Code and automated checks delivered; manual Testnet acceptance Pending.**
Base: `d85d19ca95fef467abf327a0620372c9b9f9ea88`; branch `feat/t05-atomic-trade`.

The fixed, non-upgradeable NovaHbarSwap exchanges 10 existing NOVA for 1 Testnet
HBAR. Buyer alone settles; Seller alone cancels or reclaims. Full-Hold checks
and terminal state precede ATS delivery and Seller payment; either failure
reverts the transaction. The app uses the genuine ATS SDK for the new Hold,
exact integer wallet/EVM units, reviewed expiry, pinned runtime verification,
and a separate public journal with immediate intent/hash persistence and one
bounded recovery. Unknown results cannot trigger automatic resubmission.
Trade / History / Settings replace the previous long console; T04 is read-only.

| Actual check | Result |
| --- | --- |
| npm ci | Pass; existing pins, lockfile and patches retained |
| Node tests | 98 app + 36 protobuf pass |
| Typecheck / production build | Pass |
| Foundry 1.7.1 / Solidity 0.8.36 / Paris | 16 local VM tests pass; committed artifact matches source/build |
| Dev / preview, 1440 and 390 px | Four live-read cases pass: review gating, focus, navigation, account invalidation, cancellation, reload and no overflow |
| Pending / original-hash recovery | Two isolated browser cases pass: cross-tab storage, native Web Lock exclusion, reload blocking resubmission; zero automatic external requests |
| Genuine SDK browser boundary | 14 controlled dev/preview cases pass; no actual wallet transaction |
| Live public prerequisites | Block 40244247: Seller 94 / Buyer 6, both held 0, supply/cap 100/1000, config 1, both KYC records cover reviewed expiry |

Raw evidence: [command and validation record](031-t05-validation.json),
[live preflight](031-t05-live-read.json), [page checks](031-t05-browser.json),
[genuine SDK checks](031-t05-sdk-browser.json). Runnable sources:
[preflight](031-t05-live-read.mjs), [pages](031-t05-browser.mjs),
[SDK boundary](031-t05-sdk-browser.mjs). Captures:
[dev desktop](031-t05-5173-1440.png), [dev mobile](031-t05-5173-390.png),
[preview desktop](031-t05-4173-1440.png), [preview mobile](031-t05-4173-390.png),
[History](031-t05-history.png), [Settings](031-t05-settings.png).
These are automated local-page captures with synthetic account connection,
not MetaMask approvals. Local VM tests cover failure rollback, races, expiry
and reentry; they do not prove behavior of a deployed Hedera swap.

Development verification corrected a 1,000-block relay log limit by covering
all blocks in pages. A controlled SDK probe showed Hold creation does not
itself check KYC; the existing T05 application preflight enforces it before
the wallet boundary. The corrected probe verifies that guard. Initial shell
assertions and capture waits were updated to the new interface. Detailed
results and corrections remain in the validation record.

The fresh UI reviewer's final disposition is **ship** for its one correction:
the cancellation review now uses Seller consistently for its account label
and selection indicator. A component-render regression verifies both Seller
and Buyer selections; the six page captures were confirmed after the repair.

Victor must perform the three manual transactions on preview 4173 and both
sets of read-only rejections, then verify receipt/runtime, same-hash ATS/swap
events, Mirror identity, Seller's 1 HBAR principal separately from fees, and
final **84 / 16 / held 0**, supply/cap **100/1000**. No T05 transaction ID or
completed trade is claimed. The [operator flow](../DEMO.md) is ready for that
acceptance; expired KYC or pinned incompatibility must stop it. Existing 62
audit findings, native BBS, peer/license and eligibility limits remain in
[attribution](../ATTRIBUTION.md) and [prior acceptance](029-t04-manual.md).
