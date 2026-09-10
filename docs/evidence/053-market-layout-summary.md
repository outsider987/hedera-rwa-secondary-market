# Market task-first layout — September 10, 2026

Base `9db7a0a1c1dba9303bc33bc6690091826676476f`; [plan014](../plans/014-market-layout.md)
and [prompt037](../prompts/037-market-layout.md) record Victor's scrolling complaint.

Order entry now leads the DOM and left desktop column, with the book and compact
pixel summary alongside. Mobile reaches the form before any book rows. Quantity
and price share a row. Balance detail is a native disclosure within the entry
column, with available/held or loading/error state visible in the summary.
Top buttons focus Order/Settlement, Order book or Matches without changing routes.
Matches precedes personal orders. Depth is initially collapsed; pixel participants
and server match notices remain visible. No assets, dependencies, wallet, trading
algorithm, API, contract, signature or chain mutation changed.

Measured representative Seller fixture, from the document top:

| Viewport | Before order heading | After order heading | Before review button | After review button |
| --- | ---: | ---: | ---: | ---: |
| Preview1440×900 | 1189.5px | 449.2px | 1552.7px | 699.5px |
| Preview390×844 | 1992.4px | 575.0px | 2355.6px | 825.4px |

At390px, the amount fields are visible in the first viewport; the review button
still crosses its bottom edge slightly. Full books/history remain naturally
scrollable; the quick buttons avoid searching through them. This does not claim
an entire trading/settlement workflow fits every screen without scrolling.
[Baseline measurements](053-market-layout-before.json),
[final browser results](053-market-layout-browser.json) and
[runnable harness](053-market-layout-browser.mjs) retain exact positions/checks.

npm ci;123 application +36 protobuf tests; typecheck; app and showcase builds
pass with existing install/build warnings. The layout playbook's independent
assessment identified context before tasks; before/after mechanical layout scans
are empty. Final browser matrix covers dev/preview1440/390 and preview850/320:
focus/jumps, disclosures, no horizontal overflow, draft/selection preservation,
unresolved-record notices, snapshots, empty/stale/reconnect,50-order books,
reduced motion and unavailable images. Dev signing inputs remain intentionally
disabled; only preview fixtures test editable drafts. One harness navigation
incorrectly expected reconnection after a same-document hash change; explicit
reload corrected it. One long browser process closed during the fourth config;
completed records were retained and remaining configs resumed in a fresh browser.
The initial600px heading threshold was too strict for320px wrapping; its bound
was corrected to700px while retaining measured input-position and overflow checks.
At320px, wrapped navigation/labels put the full inputs below the fold; a short
scroll is still required. This narrow case establishes reflow without page overflow.

All checks use isolated headless Chrome143, unsigned public fixtures and blocked
external traffic. No real MetaMask, physical-phone or browser-zoom acceptance
is implied;320px is a narrow reflow check. Independent [finish review](053-market-layout-review.md): **ship** at its
reported source/four-dev-capture scope. Final DESIGN documentation is complete. Victor still reviews the local result.
No push, deployment, chain operation or next ticket is authorized.
