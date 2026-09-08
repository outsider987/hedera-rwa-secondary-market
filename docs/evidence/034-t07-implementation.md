# T07 signed unfunded market — implementation verified

September 8, 2026. Market now supports reviewed EIP-712 limit orders, durable
matching, partial remainder cancellation and original-request recovery. Seller
and Buyer can trade both directions; Admin reads only. Go/PostgreSQL stores
commands/orders/matches under one market-row transaction, replying after commit.
**Funds are not reserved. Matched · Not settled.** No ATS Hold or payment occurs.
T06 remains independent commit `a485afb`; T07 human acceptance is **Pending**.

| Actual check | Result |
| --- | --- |
| Go 1.27.1 test / race / vet / fuzz | Passed; final fuzz 43,988 executions |
| Public EIP-712 signature vector + independent Go/viem command digest | Passed; no private-key signer |
| PostgreSQL 18.6 concurrency, duplicates, cancel/place, competing buys | Passed, explicit integration verifier double |
| Before-commit rollback, after-commit lost response, pool restart | Passed on real PostgreSQL with controlled fault injection |
| Actual API restart and PostgreSQL stop/start | Salt/book preserved; offline reads returned 503, then recovered |
| npm ci / test / typecheck / build | Passed; 104 app + 36 protobuf tests |
| Existing Foundry contract checks | 16 passed; T05 contract/artifact unchanged |
| Dev/preview at 1440/390px | Passed; native keyboard, review gates, overflow, offline retention, polling stop |
| Preview cross-tab lock, rejected/late wallet response and reload | Passed; no signed submission sent |
| Populated partial-cancel/reverse-match UI | Passed with explicit SSR fixture; not a live human trade |

[Public validation JSON](034-t07-validation.json) contains test output, module
inventory and hashes. [Browser harness](034-t07-browser.mjs) and
[results](034-t07-browser.json) retain the controlled/live boundaries. Captures:
[dev desktop](034-t07-5173-1440.png), [dev mobile](034-t07-5173-390.png),
[preview desktop](034-t07-4173-1440.png), [preview mobile](034-t07-4173-390.png).
The UI reviewer scored its one live-region fix resolved; this is a scoped verdict.
[Architecture diagram](../ARCHITECTURE.md#t06t07-local-unfunded-market).

Docker Desktop needed its WSL socket group restored for the existing docker
group and a valid WSL interop socket. The database stays on an internal network;
an API-only edge network enables loopback publication. Initial browser attempts
hit stale Vite optimization/proxy state, an overly strict test locator, and an
API restart overlapping a capture; servers/harness sequencing were corrected.
No product check is credited from those failed attempts. No unrelated container
or volume was removed. A disposable `holdbook_test` database holds verifier-double
tests, separate from the untouched empty manual book in `holdbook`.

Unknown/rejected wallet prompts remain pending until server-confirmed expiry;
invalid signatures cannot consume another owner's request. Raw signatures stay
in the local database, while exports whitelist signed-command digest, verification,
orders and matches. Browser screenshots show an empty book and controlled wallet
connections, not actual MetaMask success or screen-reader acceptance.

Next: Victor performs the [six-signature demo](../DEMO.md#t07--unfunded-matching-acceptance-pending)
and supplies actual public exports/captures for [manual report 035](035-t07-manual.md).
Only then can T07 be complete. No public push/merge or T08. Existing dependency,
native-BBS, licensing and event-eligibility limits remain in [ATTRIBUTION](../ATTRIBUTION.md).
