# Market status and stable focus — September 11, 2026

`based_on_commit: 05f324d223bfe691bfb0f55de282be770639e485`.
Victor reports upward scrolling after signing and requests combining the selected
match illustration with the Market pixel participants to explain current status.
Preserve the pixel identity; prioritize selected match and verified asset/payment
state, distinguish whole-book totals, keep stale and pending notices. Remove the
duplicate certificate illustration only from SettlementPanel. Use native
preventScroll for automatic state focus; preserve deliberate section navigation.

Allowed: MarketPanel, SettlementPanel, MarketVisualization, presentation.css,
focused tests/browser evidence054, this plan, prompt038, usage065, AI_USAGE,
HANDOFF and DESIGN. No wallet/core/backend/contract/dependency changes.
Verify npm ci/test/typecheck/build/showcase and isolated dev/preview browser
at desktop/mobile widths, accepted-order focus and selected settlement states.
No real signatures or transactions; Victor verifies actual MetaMask behavior.
Victor subsequently requested removing the duplicate Order book and displaying Top 5 directly, then explicitly authorized push: “好了就推送”. Normal branch push and resulting existing Pages automation are authorized. Next ticket: none.

Victor clarified: use Overview’s exchange process as the visual reference.
Reuse its sprites with real state-driven 200ms asset transitions, no demo data.
