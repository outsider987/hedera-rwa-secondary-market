# T01a browser remediation authorization — 2026-09-05

After the assistant recommended the bounded experiment in
[remediation research](../evidence/003-t01a-remediation-research.md), Victor
replied verbatim: **“go”**.

The recommendation was to keep the existing architecture and pins, supply
missing proto 2.25.0, add Vite-8-compatible polyfills 0.28.0 and necessary
browser environment adapters, then verify real SDK loading in isolated dev
and a successful production preview. Security remains a separate gate before
MetaMask/VC integration. This approval supersedes the older prohibition on
these specific additions; no repeated approval is required for them.

- Base: `daed90b3353094f003b487a053cfa119fcefc11a`, clean diagnostic branch.
- Allowed implementation: `package.json`, `package-lock.json`, `vite.config.ts`,
  `tsconfig.json` (include the new Vite configuration in typechecking),
  `src/compat/dotenv.ts`, `src/compat/winston.ts`.
- Reuse existing loader/UI. `tests/ats.test.mjs` may add a focused check that
  the new environment/logging boundary never evaluates or logs payloads.
  The browser harness
  `docs/evidence/002-t01a-browser.mjs` may gain real-success checks and adapter
  privacy assertions; preserve the previous failure JSON as historical evidence.
- Records: `README.md`, `AI_USAGE.md`, `docs/HANDOFF.md`, plan (this scope only),
  this prompt, `docs/evidence/004-t01a-remediation.md` and its public
  browser/audit/bundle JSON evidence. Ignored artifacts may hold local diagnostics.
- No SDK or wallet-connect version change, override, force fix, new framework,
  other new direct dependency, private/deep SDK entry, fake SDK/VC result,
  install-script approval, wallet/chain/VC operation or T01b activation.
- Recheck clean npm ci, Node tests, typecheck, build; dev/preview desktop/mobile,
  real Management export presence without calling it, manual-load/duplicate/
  reload/keyboard behavior, zero provider access and outbound attempts.
- Compare complete before/after audit and lock graph, record bundle size and
  remaining risks. Do not equate successful loading with security clearance.
- Save diagnosis if a further unsupported dependency/adapter is required.
  Commit the actual result with attribution and handoff; stop within T01a.
