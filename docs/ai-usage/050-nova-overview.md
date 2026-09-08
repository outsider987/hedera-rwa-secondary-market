# NOVA overview, tab flow and component extraction

September 8, 2026. Starting base14975b6; the independent T08 closeout was committed
as578aaf5661eebc300064730b387cc5e370b31cee during this work and is preserved.
User approved the fictional-company digital equity direction, a NOVA image,
clearer tabs and component separation with existing Tailwind. [Prompt032](../prompts/032-nova-overview.md)
and [scope005](../plans/005-nova-overview.md) preserve the approved direction.
Codex used Ponytail, Impeccable and imagegen; no human code/art review is claimed.

## Delivered

Overview introduces NOVA as fictional demo common shares, explains NOVA versus
HBAR, account roles, six lifecycle steps and cancellation/expiry return. The
1536×1024 generated certificate explicitly says Demo Equity / Hedera Testnet;
actual asset information stays in accessible HTML. Exact generation prompt is
embedded in the PNG and documented with source attribution. No shadcn dependency.

Tabs are Overview / Market / Activity / Settings. Legacy Trade/History anchors
resolve to Activity, and Skip to content preserves the selected tab. Activity
shows current orders/matches and dated T02–T05 history. Selecting a match or
remaining-order cancellation returns to Market; cancellation clears the selected
settlement panel so the order review is visible. Market keeps its original
history access and a single controller for drafts/intents/selected settlement.

App falls from407 to92 lines. Extracted pages: OverviewPage, ActivityPage,
SettingsPage; presentation: NovaAssetSummary, AssetLifecycle, AccountBalance,
OrderBook, OrdersTable, MatchesList. Existing Tailwind supplies the new layout;
existing table/control styles, wallet guards and pending-operation storage remain.
Closed historical mutations remain closed. No new chain transaction or signature.

## Validation and limits

`npm ci --prefer-offline --no-audit`,114 application +36 protobuf tests,
typecheck, application and showcase builds passed. Four isolated dev/preview
1440/390px browser cases pass image loading, tabs/legacy links/back navigation,
skip link, selected-match preservation/return, inactive polling and no overflow.
Preview additionally verifies draft retention across tabs and reset on account
change; dev controls remain disabled. All eight preview captures inspected.
[Browser harness](../evidence/042-nova-overview.mjs) accepts a Playwright module
path; [raw results](../evidence/042-nova-overview.json) enumerate actual checks.
Captures: [Overview desktop](../evidence/042-nova-overview-desktop.png) /
[mobile](../evidence/042-nova-overview-mobile.png),
[Market desktop](../evidence/042-nova-market-desktop.png) /
[mobile](../evidence/042-nova-market-mobile.png),
[Activity desktop](../evidence/042-nova-activity-desktop.png) /
[mobile](../evidence/042-nova-activity-mobile.png),
[Settings desktop](../evidence/042-nova-settings-desktop.png) /
[mobile](../evidence/042-nova-settings-mobile.png).

Browser fixtures use an isolated read-only wallet and mocked local API. External
RPC/Mirror is blocked in the final harness; unavailable balances/account lookups
are deliberate states. An early screenshot pass allowed a public balance query
and was replaced with explicit blocking to avoid a loading-state capture.
An initial async-navigation assertion needed a wait, mobile tab names overflowed
before reducing Tailwind gaps/wrapping, and full-page captures needed scroll-to-top
for a correct sticky-header position. Final evidence supersedes those attempts.
The detector's one purple-heading warning is the already-approved Admin color;
image provenance scan has no missing prompt. Existing optional install-script and
chunk-size warnings remain; no fresh audit or dependency repair was attempted.
T08's actual chain acceptance remains the separate completed manual038 evidence.
No backend/SDK/contract changes, public deployment, push or merge.

Independent Impeccable finish review returned **ship** after reading all eight
captures and the relevant source/navigation. It found no material presentation
or state-loss regression within scope. This was AI review, not human review or
live MetaMask validation. Design/product documentation is synchronized with the
implemented tabs; see [design record](../design/nova-overview.md).
