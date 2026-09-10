# Pixel characters in Market and Header

September 10, 2026. `based_on_commit: 5a43e2e7e872b10c2b27b0b893b5c9ac8bc94ce2`.
User asks to extend the pixel presentation into Market and show the character
for each active role in Header. This authorizes this bounded extension of the
existing visual world, superseding the prior no-next-ticket boundary only here.

Header: reuse App's recognized public-account role, showing Admin/Seller/Buyer
portrait beside the existing text. No role picker or wallet behavior change.
Disconnected/unrecognized accounts show no named-role character; account changes
update the portrait through existing reactive state. Keep network/wallet notices,
Connect/Disconnect disabled behavior, text semantics, keyboard and mobile layout.

Market: an initially expanded compact pixel trading-floor panel within the
existing collapsible depth visualization. Reuse the current hall and portrait
atlas. Buy/Sell sides remain explicit labels; the characters illustrate market sides,
not account ownership. Totals cover all accounts, including reversed-role orders. Show exact
remaining totals from current orders using BigInt and accepted match batches
from the existing snapshot adapter. Never animate movement of NOVA/HBAR here.
Keep depth bars/tables, stale/empty handling, actual settlement outcomes and
matching-does-not-transfer copy. No extra data source, fetch, signature or write.
No continual character motion; operational changes remain <=250ms. Existing
reduced motion applies. Missing images leave readable role/data text.

Direction contract: preserve navy/gold/cyan pixel art and the flat operational
workbench. Header is Operate: a small identity cue, not decoration over controls.
Market puts the two roles around a central server-match notice, with the real
book immediately below. Native HTML contains all authoritative data. Reuse the
sprite-region renderer from Overview in one shared PixelSprite component.

Allowed files: src/components/{Header,PixelSprite}.tsx; src/styles.css;
src/presentation/MarketVisualization.tsx and presentation.css;
src/presentation/components/SceneView.tsx (sprite extraction only); tests/header.test.mjs,
tests/presentation.test.mjs; docs/evidence/052-market-characters-*; this plan,
docs/prompts/036-market-characters.md, docs/ai-usage/062-market-characters.md,
AI_USAGE, HANDOFF, DESIGN, PRODUCT, ATTRIBUTION, DEMO, SUBMISSION. No package,
asset pixel, App role lookup, controller, wallet, backend or contract changes.

Checks: npm ci/test/typecheck/build/build:showcase; Header role/unassigned/
disconnected/disabled tests; dev/preview1440×900 and390×844, live account-event
portrait changes through an unsigned fixture, empty/stale/new-match snapshots,
reconnect/duplicate suppression, settlement labels, drafts/selection/recovery,
keyboard, reduced motion, asset failure and no page error/overflow/new mutation.
Independent finish review and DESIGN documentation, then local commit. No push,
deployment or chain action. Victor still performs actual-wallet/human acceptance.
Next ticket and exact allowed files: none until authorized.

Follow-up: Victor reports all tabs shifting after returning to Overview. Include
src/App.tsx and presentation.css shell alignment/route-scroll fixes: the wide
Demo stage must not resize navigation; Exit Demo stays below navigation. Verify
all four routes in normal/Demo modes and preserve mounted operational state.
