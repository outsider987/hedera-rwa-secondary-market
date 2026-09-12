# NOVA transaction motion — bounded presentation extension

Base: 4cd15380676f3f69e34b229edb6c985c8ab1b655. User requests animation showing
NOVA trading or minting with corresponding information. This explicit request
supersedes the initial no-animation restriction for this presentation only.

Reuse the existing certificate, Tailwind and CSS. Live position follows verified
settlement data only: seller → Hold → buyer, or verified return to seller.
Expiry, pending, rejected and unknown operations never imply delivery or return.
Show quantity, unit price, total, current status and required actor in text.
Provide a manually stepped, explicitly illustrative mint/trade example in Overview;
closed issuance stays closed. Respect reduced motion. No dependencies, wallet,
backend, contract or asset changes.

Allowed files: src/NovaFlow.tsx, src/AssetLifecycle.tsx,
src/SettlementPanel.tsx, src/styles.css; this plan, docs/HANDOFF.md, AI_USAGE.md,
docs/ai-usage/051-nova-motion.md, docs/evidence/043-nova-motion.mjs/.json
and docs/evidence/043-nova-motion-*.png.
Acceptance: npm ci/test/typecheck, app/showcase builds; isolated dev/preview
browser checks at desktop/mobile widths including all visual states, expiry,
reduced motion, no overflow, no real signatures or chain mutations.
Stop at local commit; no next ticket, push, merge or deployment.
