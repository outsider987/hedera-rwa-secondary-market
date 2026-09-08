# T08 pinned Header component

September 8, 2026. Base: `9411b6b4858c122c5a3080b9c10eb9db6dcb1605`,
verified Git HEAD; the prior handoff base d5fb5cc is an ancestor. Clean starting tree.
User requested: “我們的header 要是一個component 然後會被釘選在上面的”;
follow-up: “有tailwind 就用它”. Codex applied Ponytail and Impeccable guidance.

Extracted Header.tsx with the existing role, connection state, disabled state and
wallet callback passed from App. Existing installed Tailwind 4.3.3 prefixed
utilities supply sticky/top/z-index/opaque background; no dependency or wallet
logic changes. Skip link layers above the header; root scroll padding protects
native anchor navigation. Source/license attribution remains in ATTRIBUTION.md.

Affected: src/Header.tsx, src/App.tsx, src/styles.css, DESIGN.md, spec004,
HANDOFF, AI_USAGE, this record, and evidence040 harness/JSON/two screenshots.

Checks: npm ci passed; npm test passed 112 application and 36 protobuf tests;
typecheck, application build and showcase build passed. Four isolated Chrome
cases (dev5173/preview4173 ×1440/390px) passed scrolling pin position, opaque
background, wallet button visibility, no overflow, skip-link visibility and
anchor clearance/navigation. Both preview screenshots visually inspected.
[Runnable browser check](../evidence/040-t08-header.mjs) accepts the installed
Playwright module path as its argument; [results](../evidence/040-t08-header.json),
[desktop](../evidence/040-t08-header-desktop.png),
[mobile](../evidence/040-t08-header-mobile.png).

Detector reported 31 advisories for existing CSS font sizes/colors outside the
DESIGN metadata; no added typography/colors in that stylesheet. npm reports
62 dependency vulnerabilities (21 low/25 moderate/16 high) and blocked optional
upstream install scripts; existing build chunk-size warning remains. No dependency
repair attempted. Browser checks use a fresh context with API blocked and no
wallet; they establish presentation only, not live MetaMask or T08 acceptance.
Cancellation is already verified; expiry reclaim, final persistence and snapshot
remain pending under the prior exact T08 acceptance scope. No human review,
transaction, signature, push, merge or publication is claimed.
