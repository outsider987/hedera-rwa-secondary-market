# Market task-first layout — September 10, 2026

`based_on_commit: 9db7a0a1c1dba9303bc33bc6690091826676476f` (verified HEAD).
Victor reports Market is unintuitive and requires too much scrolling. This
explicitly authorizes a bounded re-layout, superseding plan013's arrangement.
Keep approved pixel art, identity semantics, exact data and all trading guards.

Operate direction: order entry first in DOM and in the left desktop column;
book and compact pixel summary alongside. Mobile follows the same DOM order.
Move balance into a native disclosure within the order workspace, with current
available/held values and error/loading indication readable in its summary.
Keep unavailable/pending/signing/recovery notices visible. A short funds notice
precedes the workspace. Top buttons focus/scroll to order or settlement, book,
and matches without changing routes. Matches precede personal order history.
Compact pixel actors remain; top-five depth becomes optional, initially collapsed.
No constrained vertical scroll panes, new library, image generation or game loop.

Allowed: MarketPanel, AccountBalance, OrderBook, MatchesList, OrdersTable only
as needed for layout/focus; MarketVisualization/presentation.css/styles.css;
Node built-in presentation/shell/header tests if impacted; new docs/plans/014,
docs/prompts/037, evidence/053-market-layout-*, usage063, AI_USAGE, HANDOFF,
DESIGN, PRODUCT, DEMO. No App/wallet/core/backend/contract/package/asset changes.

Acceptance: npm ci/test/typecheck/build/build:showcase; dev/preview desktop
1440x900 and mobile390x844, intermediate850px and narrow/zoomed320px. Record
before/after primary-control positions. Desktop order form and book in first
viewport in representative state; mobile reaches order fields before book.
Check focus/jumps, depth toggle, empty/stale/match data, role switch, preserved
drafts/selection/unresolved records and no mutation; long books must not postpone
order entry. Use unsigned public fixtures only. Fresh finish review, final
DESIGN documentation, evidence and local commit. No push/deploy/chain action.
Next ticket and exact allowed files: none until authorized.
