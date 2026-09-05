# T01a isolated loading diagnostic — historical AI usage

[AI usage index](../../AI_USAGE.md) · [Current handoff](../HANDOFF.md)

Sections below were moved verbatim from AI_USAGE.md at
`09d8d3bda397da0810f144884f32dcbe5d779874`. Paths and “this file” retain
their original repository context; dated results are historical.

## 2026-09-05 — authorized T01a isolated SDK load diagnostic

- Human direction: Victor replied **“Go”** to a concrete isolated-load scope;
  `docs/prompts/003-t01a-isolated-load.md`. No dependency changes, polyfills,
  wallet use or T01b were approved.
- Codex authored the official-root loader, native UI states, Node tests, browser
  reproduction script/whitelisted JSON, audit comparison and blocker handoff.
  Ponytail guided the single cached promise; Impeccable guided the bounded UI
  checks. No branding, animation, styling or design-document work.
- Files: `src/App.tsx`, `src/ats.ts`, `tests/shell.test.mjs`, `tests/ats.test.mjs`,
  `package.json` (test flag only), README, handoff, this file, plan policy amendment,
  `docs/prompts/003-t01a-isolated-load.md`, `docs/evidence/002-t01a-*`.
- npm ci / 5 Node tests / typecheck passed. Build **failed** resolving
  `@hiero-ledger/proto`; real browser SDK loading **failed** on undefined process.
  Four dev/failed-build-preview desktop/mobile scenarios passed failure handling,
  keyboard/focus, duplicate/reload and isolation assertions. Preview is not a
  valid production build. Unit doubles are explicitly not SDK readiness proof.
- The browser harness first mistook a different dependency chunk for a repeated
  primary SDK request; its matcher was corrected, all four final cases passed.
  App code was unchanged. Detector returned `[]`; six captures were opened.
- A separate read-only AI Impeccable finish reviewer opened all six captures
  and inspected code/evidence: **ship, diagnostic UI only**, no material findings.
  This is not human review, a successful SDK load or release approval.
- npm audit remained at 78 advisory entries / 98 affected locations; two npm
  fixAvailable suggestions changed and were preserved. No new high/critical
  findings. No vulnerability was repaired or waived.
- Playwright 1.63.0 remains an external diagnostic tool (Apache-2.0,
  https://github.com/microsoft/playwright), not a project dependency.
- No dependency/lockfile/SDK source change, script approval, .env/secrets/wallet
  profile access, provider calls, signatures, chain calls or mentor outreach.
  `diagnostic/t01a-sdk-load` preserves the known failing diagnostic without
  changing main. T01a remains blocked; T01b is inactive.

<!-- End of preserved historical sections. -->
