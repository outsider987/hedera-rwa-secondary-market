# T08 implementation evidence — September 8, 2026

Historical implementation-stage report. Its pending-manual statements below were
superseded by [completed manual acceptance038](038-t08-manual.md) and the final
[standalone showcase checks](038-t08-showcase.json). Original checks remain dated.

Base: `3088cb9e19abffdc3c6ed58e698c62a11d88f79e`. Scope: [spec 004](../plans/004-matched-settlement.md).
**Implementation delivered; manual acceptance pending. No T08 deployment, order
signature or chain transaction has been performed by this work.**

## Delivered behavior

One non-upgradeable contract binds exact matched terms and ATS Holds, pays HBAR
and delivers NOVA atomically, and supports seller cancellation/expired reclaim
including orphan Holds. Go independently reconstructs terms and verifies public
RPC/receipt/events, token balance transitions and Mirror payment evidence before
PostgreSQL accounting. A deployment sequence cutoff excludes historical orders.
Operations persist before prompts; unknown outcomes remain attached to the original
operation. The bounded public read path uses an explicit 180-second verification
budget; the runtime image includes CA certificates and their notice.

Market now shows next actor/action, lock/payment state, order/match filters,
review/recovery and responsive details. SDK 8.0.0 performs exact variable-quantity
Holds in either direction through the existing guarded wallet adapter. Tailwind
is prefixed without Preflight; short Motion transitions honor reduced motion.
T05 is historical read-only. The separate static build uses dated T05 whitelist
data and explicitly pending T08 cases; it performs no API or wallet requests.

## Actual checks

- npm ci; 111 application + 36 protobuf tests; typecheck; application and standalone
  showcase builds passed. Reproducible artifact check and 31 Foundry tests passed.
- Real PostgreSQL tests, race, vet and existing conservation fuzz passed; coverage
  includes concurrent preparation, old-order cutoff, rollback/lost response around
  commit, duplicate events, pool restart and controlled RPC outage. The 3-second fuzz budget completed
  35,717 executions. Actual database stop/start returns 503 then recovers unchanged
  original nine orders/five matches.
- Six browser cases passed: development/production at 1440/390px and static
  showcase at both sizes. Checked focus, keyboard details, role changes, expiry,
  stale-data retention/action disabling, reduced motion and overflow.
- Sixteen genuine SDK browser cases passed with controlled read/wallet boundaries:
  reject/hash, reverse Hold, unknown operation, stale session, wrong calldata,
  read-only and KYC gate. No signature or real transaction was produced.
- Historical public T05 reads at block 40247352 verify runtime/Settled state and
  balances 84/16 with zero held. T07 public orders/matches survive API rebuild and
  restart unchanged. Mechanical design check: zero findings; focused finish review
  passed after fixing selected-case hover contrast and current product/design docs.

[Validation JSON](037-t08-validation.json), [browser results](037-t08-browser.json)
([reproducible harness](037-t08-browser.mjs)), [SDK results](037-t08-sdk-browser.json)
([harness](037-t08-sdk-browser.mjs)), [desktop](037-t08-preview-desktop.png),
[mobile](037-t08-preview-mobile.png), [showcase](037-t08-showcase.png).

## Remaining limits / Victor action

[Manual 038](038-t08-manual.md) is entirely pending. Controlled browsers and local
contracts do not prove MetaMask, Hedera runtime compatibility, live KYC failure,
real cancellation races or the full production proof pipeline. Deploy once as
Admin, then execute the four fresh cases with manual approval of every prompt;
record actual fees/hashes/balance evidence, reload/restart and update the snapshot.
Do not claim the four planned cases are verified. Dependency audit remains 62
findings (21 low, 25 moderate, 16 high, zero critical); the existing SDK-sized chunk
warning remains. No package upgrade, chain fallback, push, merge or publication.
