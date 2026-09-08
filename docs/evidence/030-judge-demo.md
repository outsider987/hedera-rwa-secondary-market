# Judge presentation verification — September 8, 2026

**Complete: concise English entry and two-minute walkthrough of existing evidence.**
Base: `f50cc999402b6ec7e6dbe8a0888fe5bf2062d2e1`; branch `docs/judge-demo`.

[README](../../README.md) provides report links and local commands in 315 words.
[DEMO](../DEMO.md) provides timed narration, screenshot links, the balance
sequence and three rejections in 500 words including tables. PRODUCT's stale
T00 status is corrected. Original screenshots, reports and verification JSON
are unchanged; no new chain operation, signature or human acceptance occurred.

| Check | Result |
| --- | --- |
| Local document links / anchor | 24 valid |
| Balances, four transactions, three rejections | Match acceptance 029 |
| npm ci; tests; typecheck; build | Pass; 87 app + 36 proto tests |
| Dev / preview at 1440 and 390 px | Pass; visible focus, no overflow or page errors |
| Preview without wallet: current T04 query | Pass; block 40241802, Seller 94 / Buyer 6 / both held 0, valid Buyer KYC, no active Seller Holds |
| Existing offline gallery at both widths | Eight images loaded; visible focus, no overflow or external requests |
| Original evidence, source, tests, dependencies, patches | Unchanged from base |

Initial page loads made no external requests. The optional preview query made
45 requests restricted to Testnet Mirror GETs and read-only Hashio RPC methods.
The first temporary harness omitted `eth_blockNumber` from its read allowlist;
that attempt was stopped, the harness corrected and the checks rerun successfully.
No application repair was needed. Browser automation used an existing external
Playwright installation; it added no project dependency.

[Check details and runnable harness sources](030-judge-demo.json) retain the
correction and results. Markdown links/content were checked locally; browser
checks cover the existing console/gallery, not GitHub's Markdown renderer.
Acceptance remains the dated block 40241114 in evidence 029. Current reads do
not renew KYC or replace historical evidence. Native BBS, audit/peer/license
and eligibility limits remain linked from README. No new demo recording exists.
