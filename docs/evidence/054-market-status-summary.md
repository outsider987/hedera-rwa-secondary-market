# Market exchange and stable focus — September 11, 2026

Delivered one selected-match pixel exchange, reusing Overview's existing sprites.
It replaces the duplicate certificate/market illustrations, shows the actual
selling/buying accounts (including reversed roles), ATS Hold, exact NOVA/HBAR,
and whole-book totals separately. Top-five depth is always visible and replaces the duplicate full Order book per final user steering. Verified status drives 200ms asset positions;
reduced motion removes transitions. Locked, Ready, expiry, settled and returned
states differ; unavailable initial data makes no asset-position claim. No extra
fetch, signing callback, wallet or backend change.

Automatic review/result focus now prevents scrolling. The selected-match effect
no longer reruns because order review changed. Settlement state changes retain
the terms DOM instead of remounting the review/progress/result container.
Explicit selected-match and section navigation still moves focus/viewport.

Checks performed:
- npm ci, npm test: 124 application and 36 protobuf tests passed.
- npm run typecheck, npm run build, npm run build:showcase passed; after the
  unknown-state correction, the three focused header/presentation tests,
  typecheck and both builds passed again.
- [Browser script](054-market-focus-browser.mjs) and
  [results](054-market-focus-after.json): dev5173/preview4173,1440×844 and390×844,
  headless Chrome143, isolated public fixtures, no external writes/page errors.
  Accepted result focus no longer pulls upward; explicit navigation still scrolls.
  Desktop scrollY changed1000→1159; mobile changed1000→1181/1182 as content height
  changed under native scroll anchoring. This does not promise absolute pixel
  locking across every height change or at the page bottom.
- Ready→Settled polling retains the same terms DOM. Test-only Ready reuses
  public terms with browser time before expiry, then restores recorded Settled;
  it is a simulated UI transition, not new chain evidence.
- Node assertions cover eight status mappings, exact amounts, reverse roles,
  unknown initial data and stale copy. Four status page screenshots and four
  Ready detail screenshots are stored as `054-market-status-*` and
  `054-market-ready-*`. No horizontal overflow was found in the tested states.

Independent finish review: ship; initial unknown-state finding resolved.
No actual MetaMask signature or chain transaction performed. Victor authorized pushing the completed changes; publication status is recorded below.
Victor still verifies real wallet-return behavior and visual acceptance.

Final top-five-only steering: full npm test passed again (124+36), typecheck
and both builds passed, and all four browser configurations passed again.
One top-five heading, no duplicate Order book heading and no expand/collapse
button were asserted. Normal branch push is authorized; at this commit, remote
publication is not yet verified. Existing Pages automation will run on push.
