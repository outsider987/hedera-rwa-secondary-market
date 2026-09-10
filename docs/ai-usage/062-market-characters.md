# Market characters and navigation — September 10, 2026

`based_on_commit: 5a43e2e7e872b10c2b27b0b893b5c9ac8bc94ce2`, verified clean
starting tree. Victor asked for pixel characters in Market and role-specific
Header characters, then reported tab layout shifting on return to Overview.
[Prompt036](../prompts/036-market-characters.md) records the instructions;
[plan013](../plans/013-market-characters.md) defines this bounded extension.

Codex used impeccable and ponytail, reusing the generated imagery from usage061
without new image generation or pixel edits. Extracted the existing atlas
renderer into PixelSprite; Header consumes existing connected-account role
state; Market adds exact all-account open-order totals and side illustrations
around its existing snapshot-based matching feedback. Source changes: App,
Header, PixelSprite, SceneView extraction, MarketVisualization and the two CSS
files. New Node built-in tests cover identity and BigInt totals. No new package,
provider, signer, callback, API or backend was introduced.

The follow-up navigation fix confines wide Demo layout to the presentation
surface, moves the off-page exit control after navigation and resets route
scroll. The user report, not a new visual direction, authorized that scope.
Independent fresh finish reviewer and final DESIGN documenter are required by
impeccable; the fresh reviewer returned **ship**, and the final documenter updated only
DESIGN.md from the built source/captures; outcomes are recorded with evidence052. No human
acceptance or model identity is invented.

[Evidence052](../evidence/052-market-characters-summary.md) contains actual
checks, raw browser fixtures/captures, corrected harness assumptions and limits.
Required install/tests/typecheck/app/showcase builds pass. Only unsigned public
fixtures were used for browser account events. Existing generated asset prompts
and attribution remain unchanged. Victor performs actual-wallet/visual review;
this ticket stops at a local commit without push, deployment or chain actions.
