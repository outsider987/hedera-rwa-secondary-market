# NOVA interactive story — September 10, 2026

Base: f5573a699da1c687d9b4388a8c54639c96a308c5.
User requested both an interactive NOVA certificate and animated issuance / trade
story, reviewed the step-controlled direction and explicitly approved with「好go」.
This is the active presentation ticket, superseding the original no-animation
restriction within Overview. Existing issuance and settlement remain complete.

Build two manually stepped chapters: setup / synthetic VC / KYC grant / issuance,
and recorded match / lock / register / settle, with separate cancel and expiry
reclaim cases. Reuse the existing certificate and public snapshot. Label animated
historical explanations, show evidence links and historical quantities, keep
expiry in Hold until verified reclaim. No wallet calls or new transactions.
CSS transform/opacity transitions suffice; preserve reduced-motion and keyboard
controls, stable stage space, responsive layout and English copy.

Allowed files: src/components/NovaStory.tsx, NovaAssetSummary.tsx,
AssetLifecycle.tsx, NovaFlow.tsx; src/styles.css; docs/plans/010-nova-story.md;
docs/prompts/033-nova-story.md; docs/evidence/048-nova-story.mjs/.json and
048-nova-story-*.png; docs/ai-usage/058-nova-story.md; AI_USAGE.md;
docs/HANDOFF.md; DESIGN.md; PRODUCT.md; docs/ATTRIBUTION.md.
Acceptance: npm ci/test/typecheck/build and showcase build, dev/preview browser
at 1440/390, all chapter/case steps, evidence alignment, expiry retention,
reduced motion, keyboard, rapid navigation, no overflow or mutation requests.
Stop at local commit. No next ticket, push or deployment in this extension.
