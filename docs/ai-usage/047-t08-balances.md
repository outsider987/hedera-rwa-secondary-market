# T08 current balances and active-operation feedback

September8,2026. `based_on_commit: 2e46607204b5db27c8c06e4ada7d9f75eb97924a` verified Git HEAD.
User observed that NOVA ownership was not visible and asked for a spinner during
contract work. This corrects the active T08 workbench; manual cancellation/reclaim
acceptance remains pending. [Scope amendment](../plans/004-matched-settlement.md).

## Delivered

Market shows current-account available NOVA, locked-in-Holds NOVA and their sum,
plus source block/time and manual refresh. Reads reuse the fixed public RPC and
installed ATS ABI at one block; wrong chain, invalid address and incomplete values
fail explicitly. TanStack Query keys include account/session and retain only that
account's last successful read on failure. Polling pauses in background/while the
operation lease is held, resumes afterward; zero is never a missing-data fallback.

Active settlement preparation, wallet waiting and verification show an inline CSS
spinner after status text. It stops on call completion/failure; idle unknown
outcomes do not rotate. Reduced motion removes rotation, retaining readable text.
No new package, signing path or transaction behavior.

Affected: src/market.ts, MarketPanel.tsx, SettlementPanel.tsx, styles.css;
tests/market.test.mjs; PRODUCT/DESIGN; spec004/HANDOFF/AI_USAGE/this entry;
evidence039 harness/JSON/desktop/mobile captures. Codex used ponytail, impeccable
and animate guidance. No human code review or new chain transaction is claimed.

## Checks and limits

npm ci,112 app+36 protobuf tests, typecheck, application/showcase builds passed.
Four isolated browser cases (dev/preview1440/390px) passed account isolation,
available+held totals, fixed-block reads, failed-refresh retention, spinner
lifecycle/reduced motion and no overflow. Both captures visually inspected.
Direct public reads at40259101 report Seller83/0 and Buyer17/0. An initial missing
RPC import failed the new regression test/typecheck; corrected before the final
passing run. An early dev launch during npm ci was retried after installation.
No contract/backend change, so their prior test results are unchanged.

[Raw checks](../evidence/039-t08-balances.json),
[browser harness](../evidence/039-t08-balances.mjs),
[desktop](../evidence/039-t08-balances-desktop.png),
[mobile](../evidence/039-t08-balances-mobile.png).
Captures include controlled held/offline states, not actual manual settlement
results. The new readout is informational; mutation preflight still independently
rechecks current asset/account/network/balances. Existing build size and dependency
audit limitations remain recorded in evidence037. No push/merge/publication.
