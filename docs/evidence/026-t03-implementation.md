# T03 implementation — September 7, 2026

**Code and automated verification are delivered. Manual T03 chain acceptance
is Pending; no T03 transaction or VC signature was performed by this work.**
Base: `daf7dcc8e443277f0a64e87bc283f48cc7456325`; branch `feat/t03-kyc-issue`.
[Authorized plan](../prompts/024-t03-kyc-issue.md) · [Validation manifest](026-t03-validation.json).

The existing console now checks the original NOVA and three Mirror account
mappings, config 1, cap 1000, restrictions and current balances. It reviews one
missing Admin role at a time, issuer registration, Seller KYC and exactly 100
NOVA issuance. The genuine SDK public requests are used; KYC receives a UTF-8
JSON/Base64 copy and retains its internal Terminal3 verification. Role IDs are
pinned SDK constants, not hashes inferred from enum labels. No dependency or
retained SDK/protobuf patch changed. T02 creation is closed; its readback uses
the creation block, independently of T03 current supply.

Every transaction requires Admin, chain 296, fresh state, exact reviewed
calldata, zero value and preview 127.0.0.1:4173. A shared native Web Lock covers
VC signatures and transactions; the existing session/operation lease remains.
Public intent precedes the wallet request and a returned hash is saved even
when late. Unknown/submitted operations require recovery. Successful recovery
checks receipt/block binding, exact asset event/calldata, historical before/after
state and Mirror sender mapping. Confirmed reverted transactions need matching
unchanged state and Mirror evidence before an explicit new review. Saved
completion flags are reverified. Existing KYC or issuance without evidence
requires its original hash; changed supply/balances never enable a top-up.
Full credentials/signatures stay in memory; operation exports whitelist public
inputs, snapshots and transaction identifiers.

## Actual checks

- `npm ci`, **75 application + 36 protobuf tests**, typecheck and production
  build pass. [Development failures/corrections](026-t03-development-checks.json)
  preserve the initial red tests, wrong inferred role IDs and KYC JSON-order
  regression. SDK harness/fixture defects are distinguished from app defects.
- **20 genuine SDK browser cases** pass across dev/production: three role
  grants, issuer registration and issue each reach exactly one rejecting or
  confirmation-timeout synthetic wallet. The real SDK rejects an unsigned KYC
  input. Cross-tab exclusion passes. [Final SDK results](026-t03-sdk-browser-final.json)
  are separate from the first failed [build](026-t03-sdk-browser.json) and
  [runtime candidate](026-t03-sdk-browser-rerun.json). No synthetic success or
  valid credential substitutes for human acceptance.
- **Four live-read UI cases**, **28 VC regression cases**, and **four final-build
  smoke cases** pass (dev/preview, desktop/mobile). Keyboard focus, overflow,
  account invalidation, reload and cross-tab journal display are checked;
  unknown-operation refusal is exercised by Node state tests. No forbidden
  external requests or page errors were observed. Mobile means desktop Chrome
  viewport emulation. [UI results/captures](026-t03-ui-browser.json) ·
  [VC regression](026-t03-vc-regression.json) · [Final smoke](026-t03-final-smoke.json).
- [Live read-only evidence](026-t03-live-read.json) verifies T02 historical
  supply **0 at block 40209377**, and current supply/balances/held **0 at block
  40214540**, with all three Admin roles missing, issuer absent and neither
  account KYC'd. Supply **100** is covered by explicit state/ABI fixtures only.
  A separate UI reviewer reports **ship** for the captured first-role review,
  with no required correction; later real transaction states remain unobserved.

## Remaining acceptance

Victor connects the original Admin on preview, checks/reviews each action,
approves it in MetaMask, then queries its hash before checking the next action.
After issuer registration, prepare/review/sign/verify Seller VC in the existing
panel. Export each public operation. Final acceptance must establish three
Admin roles and issuer registration, matching valid Seller KYC, Seller available
100 / held 0, Buyer not KYC / balance 0, supply/cap 100/1000. Record actual hashes,
public JSON and screenshots in the separate manual report before closing T03.
Native BBS remains excluded; the retained 62 audit findings, peer incompatibilities,
dfns license gaps and event eligibility questions are not waived. No Buyer KYC,
Hold, new asset, public deployment, push, merge or T04 is included.
