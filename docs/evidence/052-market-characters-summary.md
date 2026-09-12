# Market characters and stable navigation — September 10, 2026

Base: `5a43e2e7e872b10c2b27b0b893b5c9ac8bc94ce2`. Scope and authorization:
[plan013](../plans/013-market-characters.md), [prompt036](../prompts/036-market-characters.md).

Header shows the existing generated Admin/Seller/Buyer portrait only for a
recognized connected account. Market reuses the same atlas and hall behind
labeled buy/sell sides, exact BigInt open-order totals and server match updates.
These are all-market remaining quantities, not those illustrated accounts'
balances. Matching still transfers no assets; actual settlement outcomes remain.
No dependencies, asset bytes, wallet/controller, matching or chain changes.

Victor's follow-up exposed a shell bug: Demo widened `main` (desktop nav x176→20),
and an Exit Demo button before navigation moved it vertically. Only the Demo
surface now expands; the navigation retains its measure and the exit control
sits below it. Route changes reset scroll; clicking the current tab returns to
the top without native fragment scrolling shifting navigation.

Validation: npm ci, npm test (123 application +36 protobuf tests), typecheck,
production build and showcase build. Logs use this evidence prefix. Existing
install deprecations and build bundle warnings remain. The first typecheck
caught Order.side's empty-string union; totals now explicitly accept Buy/Sell.
The browser harness initially attempted disabled dev inputs, overmatched the
phrase “Waiting for new matches”, and used programmatic focus after mouse input;
those harness assumptions were corrected without relaxing application guards.

[Browser harness](052-market-characters-browser.mjs) and
[raw results](052-market-characters-browser.json) record dev/preview at1440×900
and390×844: connected role events, unknown/disconnected identities, all four
tabs in normal/Demo modes, navigation bounds, no horizontal overflow, snapshots,
batched/duplicate matches, stale/reconnect, settlement labels, selection,
preview drafts, unresolved public-record preservation, empty state, keyboard,
reduced motion, image failure, no page errors and zero write requests.
Fresh isolated headless Chrome143 with unsigned public-account fixtures; all
external traffic is blocked. This is not an actual MetaMask or physical-device
acceptance run. Prior full180s playback remains in evidence051; no new claim of
physical-device performance or new three-minute recording is made here.

Independent [finish review](052-market-characters-review.md): **ship** at its
reported source/dev-capture/browser-results scope; no material fixes. The final
documenter updated DESIGN from source and preview captures, preserving dated history. Victor still gives actual-wallet
and visual acceptance. Local commit only; no push, publication, chain action or
next ticket is authorized.
