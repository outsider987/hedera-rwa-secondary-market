# T01a isolated SDK load diagnostic — 2026-09-05

**BLOCKED: the diagnostic UI handles failure, but the official SDK does not
load and the production build fails.** This is not T01a completion or a release.

## Scope and implementation

- Victor approved the concrete isolated diagnostic with **“Go”**;
  [authorization](../prompts/003-t01a-isolated-load.md).
- Base: `03d1a34e4faa13e6a93e0ac2365efabee4c6a3ee`, initially clean main.
  Prior base `10d69e7` and shell source `00a5dd1` are verified ancestors.
- Work is on `diagnostic/t01a-sdk-load`; main is unchanged. This branch has a
  known failing build and is not ready to merge. Read actual HEAD from Git.
- `src/ats.ts` uses the official package-root dynamic import and one cached
  promise. It checks the Management function's presence without calling it.
  Failures become a fixed result, without exposing SDK/error objects.
- The native button provides idle/loading/loaded/failed states, disables further
  attempts, and never starts loading automatically on reload.
- Dependency/runtime versions, lockfile, SDK source, styles and CI are unchanged.
  `package.json` changes only the Node test command's built-in module-mock flag.
- Node doubles exercise success-shaped, missing and throwing APIs, promise
  identity and safe results. They never execute the SDK or prove SDK readiness.
  Real browser checks use the unmodified official SDK.

## B3 — production module resolution

`npm run build` exits **1** with this curated diagnostic (local root removed):

```text
[vite]: Rolldown failed to resolve import "@hiero-ledger/proto" from
"node_modules/@hashgraph/hedera-wallet-connect/dist/lib/wallet/index.js".
```

| Installed package / path | Observed declaration or source |
| --- | --- |
| `@hashgraph/hedera-wallet-connect` 2.1.2 | `dist/lib/wallet/index.js:26` imports `@hiero-ledger/proto`; package.json does not declare it as a dependency/peer |
| wallet-connect peer `@hiero-ledger/sdk` | Exact 2.79.0 |
| `@hiero-ledger/sdk` 2.79.0 | Declares `@hiero-ledger/proto` exact 2.25.0 |
| `node_modules/@hiero-ledger/sdk/node_modules/@hiero-ledger/proto` | Present, 2.25.0; peer protobufjs exact 7.5.4 |
| `node_modules/@hiero-ledger/proto` | Absent after npm ci |

The nested installation is not visible through normal resolution from the
sibling wallet-connect package. No hoisting change, alias, direct dependency,
deep import or external-module workaround was attempted.

## B4 — browser runtime

Dev and failed-build emitted preview files both reach a caught
**`ReferenceError: process is not defined`** during the real SDK import.
Neither reaches the Management API check. A separate isolated Chrome debugger
observation paused on caught exceptions and immediately resumed. Earlier
internally caught errors concerned unavailable `require("buffer")`,
`require("long")`, and a null `Buffer` lookup; these are not each claimed as
the final import failure. The app catches the final error without logging it.

Build warnings externalize Node built-ins used by dotenv, Winston and other
transitive code, including fs/path/os/crypto/stream/util/http/https/zlib.
ATS's official ESM entry calls `dotenv.config()` before public exports.
The SDK was never executed in Node; no .env or wallet profile was read.
No polyfill or global stub was added. Fixing B3 alone would not prove B4 resolved.

## Actual checks

| Check | Result |
| --- | --- |
| Runtime | Node 24.19.0, npm 11.17.0 |
| npm ci | Exit 0; 1165 installed / 1166 audited; 6 unapproved-script notices, none approved |
| npm audit --json | Exit 1; 78 entries: 17 low, 32 moderate, 27 high, 2 critical |
| npm test | Exit 0; 5 tests including 3 loader scenarios; module-mock experimental warning remains |
| npm run typecheck | Exit 0 |
| npm run build | **Exit 1**, B3; 9182 modules transformed; emitted files are not a successful build |
| Dev desktop/mobile | Real SDK import **failed**, B4; failure UI checks passed |
| Preview desktop/mobile | Real SDK import **failed**, B4; only files emitted by the failed build were inspected; production acceptance blocked |
| UI detector | `src/App.tsx`: `[]` |
| Independent AI finish review | **ship, diagnostic UI only**; no material findings; no SDK/release approval |
| Wallet / VC / RPC / Mirror | Not called; T01b inactive |

[Browser script](002-t01a-browser.mjs) and [whitelisted JSON](002-t01a-browser.json)
record four cases: idle without SDK request, keyboard skip link/focus/activation,
delayed loading with disabled button, duplicate guard, safe failure, reload to
idle without retry, and no horizontal overflow. Each recorded one primary SDK
module request, zero wallet trap accesses, zero external HTTP/WebSocket attempts
and zero unhandled page/console errors. Internal dependency chunks are separate
from a user load attempt. Loading was delayed by gating the real module request,
not by substituting SDK code.

Fresh Chrome contexts contained no wallet data; outbound traffic was intercepted
and service workers blocked. A getter trap for window.ethereum supplied no
provider and recorded zero accesses. This is not a future wallet security waiver.
The first harness run counted another `src-*` dependency chunk as a duplicate
root request and failed its assertion. The matcher was corrected to derive the
exact primary chunk from the emitted app; all four final cases passed, with no
app change. No failed SDK result was relabeled as success.

Six full-page captures were opened by the builder and independent AI reviewer.
Screenshots are ignored local artifacts, not durable Git evidence; the committed
script regenerates them. Review was limited to code/captures/recorded checks;
the reviewer did not rerun the browser. No styling or design-document work was
introduced. The existing native control, focus ring and readable layout remain.

The failed build emitted an entry chunk of 196.41 kB (gzip 62.15 kB), a primary
SDK chunk of 9071.47 kB (gzip 1764.41 kB), plus other chunks. These are diagnostic
output sizes, not a valid release size. T00's entry was 193.81 kB (gzip 61.02 kB).

Lockfile SHA-256 remains
`766b3d6d0850b8166ba5ab6c0fbfec3c2dbc6cd85ffaa93a6c37f08f172faaed`.
[Audit comparison](002-t01a-audit-comparison.json) confirms all 78 advisory
entries and 98 installed-version/presence observations are unchanged. Only npm's
fixAvailable suggestions for two moderate DFNS entries changed; before/after
values are retained. No new high/critical entries. Complete inventory and B1/B2
triage remain in [the prior evidence](001-t01a-triage.md); no risk was remediated
or waived. Suggested ATS 1.13.0 downgrade remains forbidden.

## Reproduction / mentor packet

Run npm ci, npm test, npm run typecheck, npm run build on this diagnostic branch.
Build is expected to fail. For isolated diagnostics, run npm run dev and,
separately, npm run preview on the failed build's emitted files. The latter is
not a valid production preview. With external Playwright 1.63.0 and Chrome:

```sh
node docs/evidence/002-t01a-browser.mjs /absolute/path/to/playwright/package.json
```

The script's success means the recorded **failure behavior** was reproduced.
Do not add Playwright to project dependencies. Inspect caught exceptions in an
isolated browser debugger for B4; do not import the SDK in Node.

Victor/mentor now need a concrete supported resolution for B3, official browser
requirements for B4, and the original B1/B2 security constraints. No candidate
override, package change or polyfill is verified or approved. No mentor message
was sent. Keep T01a blocked and T01b inactive until an approved compatibility/
security plan and all remaining checks pass.
