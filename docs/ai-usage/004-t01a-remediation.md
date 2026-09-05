# T01a browser remediation — historical AI usage

[AI usage index](../../AI_USAGE.md) · [Current handoff](../HANDOFF.md)

Sections below were moved verbatim from AI_USAGE.md at
`09d8d3bda397da0810f144884f32dcbe5d779874`. Paths and “this file” retain
their original repository context; dated results are historical.

## 2026-09-05 — approved T01a browser remediation

- Victor replied **“go”** to the concrete researched remedy; scope/decision in
  `docs/prompts/005-t01a-remediation-decision.md`. This authorizes the two exact
  additions and necessary browser adapters, not overrides or wallet use.
- Codex added direct proto 2.25.0, dev polyfill plugin 0.28.0, Vite configuration
  and locally written browser environment/logging boundaries based on observed
  ATS imports and official browser configuration conventions. Ponytail guided
  reuse of the existing loader/UI, one focused privacy test and browser harness.
- Files: package manifest/npm-generated lock, Vite config, tsconfig include,
  `src/compat/dotenv.ts`, `src/compat/winston.ts`, `tests/ats.test.mjs`,
  `docs/evidence/002-t01a-browser.mjs`, `docs/evidence/004-t01a-*`, README,
  this file, handoff, plan amendment and latest prompt/decision record.
- npm ci, 6 Node tests, typecheck and production build passed. Four isolated
  dev/valid-preview desktop/mobile cases loaded the real SDK and checked the
  Management function's presence without calling it. Zero provider accesses,
  outbound attempts or unhandled page/console errors; duplicate/reload/focus
  behavior passed. Opened dev desktop and preview mobile captures.
- First browser matcher expected the wrong punctuation and timed out. Fixed
  the matcher, then all four cases passed; no application success condition
  changed. Caught dependency feature probes were examined in an isolated Chrome
  debugger; they were not relabeled as final load failures or API verification.
- First build overlapped the end of ci; an independent post-ci Vite build
  captured public module membership and reproduced every browser-tested asset
  hash. Node's experimental module-mock and install-script notices remain.
- Audit changed 78→83 entries / 98→104 locations: five new low aggregate
  entries through elliptic/polyfills, no new high/critical package entries.
  Both vulnerable protobuf versions have rendered modules. No security risk
  was remediated or waived; T01a security gate remains blocked.
- No SDK source patch, private/deep SDK entry, additional agent/human review,
  mentor message, SDK API invocation, wallet/profile/.env access, private-key
  signer, VC signature or chain call. Main remains unchanged; T01b is inactive.
- Official ATS configuration references are Apache-2.0; proto 2.25.0 is
  Apache-2.0; vite-plugin-node-polyfills 0.28.0 is MIT. Source links and browser
  adapter limits are in the evidence. No upstream SDK code was vendored.
  External Playwright 1.63.0 (Apache-2.0) remains outside project dependencies.

<!-- End of preserved historical sections. -->
