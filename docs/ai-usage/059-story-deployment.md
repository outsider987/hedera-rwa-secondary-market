# NOVA story publication — September 10, 2026

Base and deployed source:3f7a2bef98afae81a6a9f57a956bd96593db2b38.
User request, verbatim:「我們先deploy 上去吧」. This authorizes pushing and
publishing the existing completed story through the established Pages workflow.
Codex used Ponytail and existing gh/browser tooling; no new runtime dependency,
application code, backend deployment, database migration, merge or wallet action.

Scope: publish feat/t08-settlement; this usage entry, AI_USAGE, HANDOFF and
049-story-deployment.mjs/.json plus049-story-local-browser.json. Existing story
source/provenance058 is preserved. No next implementation ticket is activated.

[Pages run34479681250](https://github.com/outsider987/hedera-rwa-secondary-market/actions/runs/34479681250)
completed successfully for the exact source above after install/test/typecheck/build.
Local npm ci,116 application +36 protobuf tests, typecheck and build also passed.
Existing install-script, dependency and bundle warnings remain; Actions reported
its existing Node20-action deprecation annotation. No dependency repair attempted.

The existing048 browser harness was rerun from a temporary copy redirecting its
output paths to avoid overwriting dated evidence. All four dev/preview1440/390
cases passed issuance/trade/proof/expiry/reduced-motion/keyboard/retarget checks,
with zero page errors, overflow or mutation requests. [Local results](../evidence/049-story-local-browser.json).

The retained049 public harness adapts repository harness047 and checks the story,
image, four tabs and real cross-origin API reads at1440/390. Initial test assumed
Continue to trading existed at step1; corrected to the explicit chapter button.
Its old exact24-order count also failed: live data is now25 orders/11 matches.
Checks now allow growth from the prior baseline and retain actual observed counts;
counts alone are not a content-integrity audit. No market mutation was performed.
[Final live results](../evidence/049-story-deployment.json): health ready, original
settlement address, story loaded, no page errors/overflow. No new screenshots
or live MetaMask acceptance are claimed. Existing full story captures remain048.

Live site: https://outsider987.github.io/hedera-rwa-secondary-market/.
Cloud Run and Neon remain the existing deployment; public checks performed reads
only. Final documentation/evidence commit uses [skip ci] to preserve the verified
artifact. No remaining deployment blocker; next allowed implementation files:none.
