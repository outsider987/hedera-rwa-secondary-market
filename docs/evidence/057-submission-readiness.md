# Submission readiness — September 12, 2026

Base: `7f5eb8ecd97aebd8a5a90edd27c7d660cd38b82f`. Local preparation and source
verification are complete. Authorized GitHub integration is pending the PR's
actual final-head CI result; no merge or deployment success is assumed here.

Scope: current judge documentation, submission copy, video/AI disclosure,
public contract source verification, existing showcase publication, and
CI-gated integration into main. No trading behavior or chain state changes.

## Delivered and checked

Current README/submission/demo/architecture summaries distinguish the completed
T08 order-book settlement from the historical T05 fixed swap. English form copy,
Hedera integration feedback and video/AI disclosures are ready. Pages now builds
the existing standalone showcase into the same artifact; its public check must
follow deployment.

Pinned npm ci passed; 132 application and 36 protobuf tests, typecheck,
main/showcase builds, original contract artifact checks, and 31 Foundry tests
passed. Five read-only dev/preview browser cases passed, including desktop,
390px layouts, tab navigation and standalone outcome selection. Desktop/showcase
captures were visually inspected. No wallet connection, signature or transaction
was used. All 81 checked local document links resolve; git diff --check passed.
[Browser observations](057-submission-browser.json),
[machine-readable summary](057-submission-readiness.json).

All three existing source-verification jobs completed: NovaSettlement and
NovaHbarSwap creation/runtime `match`; ATS-created NOVA ResolverProxy
creation/runtime `exact_match` through official similarity verification.
The custom sources passed local metadata-hash, compiler and runtime checks.
No contract was redeployed and no chain transaction sent. This verifies source
matching, not security, all ATS facets, or a separately observed HashScan badge.
[Service responses](057-contract-verification.json),
[identities and method](../SOURCE_VERIFICATION.md).

Existing npm audit findings (62: 21 low, 25 moderate, 16 high), dependency script
approval warnings, and build eval/chunk warnings remain. No dependency upgrade,
license choice, original API restart or database reset was made. Go/PostgreSQL,
race, vet and fuzz validation is required in CI before merge; local browser
snapshot replay is not live backend or wallet acceptance.

## Dated provenance clarification

Earlier documentation recorded a user-mentioned, uninspected “pre-event draft”.
On September 12 Victor clarified, verbatim:

> 賽前沒有草稿的,我只是跟GPT 討論聊天主題這樣,後來才把草稿生出來

According to Victor, there was no pre-event draft; he discussed topics with GPT
and generated the draft later. The earlier description is corrected, not erased
from historical records. There is no missing pre-event draft file to demand on
the basis of the old wording. The full earlier conversations and their timing
have not been independently reviewed; organizer eligibility is not asserted.

## Remaining human boundaries

Project-wide license selection remains a human decision. The authenticated
ETHGlobal form/upload/final receipt and organizer acceptance of labelled
waiting-only video acceleration are not confirmed. No event submission or
wallet approval is performed in this task.
