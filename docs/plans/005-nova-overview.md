# T08 presentation extension — NOVA overview and navigation

September 8, 2026. Base: 14975b6. User approved the fictional digital equity
certificate direction after discussing an image, understandable tab flows,
component extraction and existing Tailwind. This authorizes one NOVA illustration,
Overview / Market / Activity / Settings, and bounded presentation extraction.
No new issuer, asset parameters, wallet action, framework or shadcn installation.
Existing uncommitted T08 showcase/manual closeout files belong to separate work.
During this extension they were independently committed as
578aaf5661eebc300064730b387cc5e370b31cee; that complete T08 outcome is preserved.

Scope: src/App.tsx, Header.tsx, OverviewPage.tsx, NovaAssetSummary.tsx,
AssetLifecycle.tsx, ActivityPage.tsx, SettingsPage.tsx, MarketPanel.tsx,
AccountBalance.tsx, OrderBook.tsx, OrdersTable.tsx, MatchesList.tsx,
SettlementPanel.tsx, TradePanel.tsx, styles.css, tests/shell.test.mjs,
tests/navigation.test.mjs, src/navigation.ts, public/assets/nova-demo-equity.png,
docs/prompts/032-nova-overview.md, docs/plans/005-nova-overview.md,
docs/design/nova-overview.md, DESIGN.md, PRODUCT.md, docs/ATTRIBUTION.md, docs/HANDOFF.md, AI_USAGE.md,
docs/ai-usage/050-nova-overview.md, docs/evidence/042-nova-overview.mjs/.json,
and docs/evidence/042-nova-{overview,market,activity,settings}-{desktop,mobile}.png.

Keep the existing navy/light/system-font interface. Overview is the default
entry and explains fictional common shares, NOVA versus HBAR, role labels and
order→match→lock→register→pay/deliver or verified return. Use native HTML/CSS for
flow; the generated certificate is illustrative, never a balance or certificate
of ownership. Current facts remain text outside the bitmap.

Market keeps a single mounted controller for queries, intent, selected match and
wallet guards. Activity exposes its existing orders/matches and historical T02–T05
records; selecting an action returns to Market. Keep Market's compact history
access for ongoing workflows. Legacy #trade/#history resolve to Activity.
Never mount duplicate settlement controllers or restore closed historical actions.

Acceptance: npm ci/test/typecheck/application and showcase builds; browser dev
and preview at desktop/mobile widths; image loading, all tabs and legacy anchors,
back/forward, keyboard/skip link, role identity, inactive polling, preserved draft
and original-operation behavior. Existing controlled wallet/SDK regression harness
may be reused with evidence output directed to this work item. No actual signing.
Stop at local reviewable commit, preserving unrelated user changes.
