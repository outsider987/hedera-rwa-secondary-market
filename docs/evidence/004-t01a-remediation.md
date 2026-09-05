# T01a browser remediation — 2026-09-05

**B3/B4 resolved for isolated import. T01a remains BLOCKED on dependency
security; no T01b, wallet, config/VC operation or transaction.**

Base: `daed90b3353094f003b487a053cfa119fcefc11a`, clean
`diagnostic/t01a-sdk-load`. Previous handoff base `20267d4` is an ancestor.
Victor approved the researched experiment with **“go”**;
[decision](../prompts/005-t01a-remediation-decision.md).

## Implementation and root causes

- Direct runtime proto 2.25.0 makes wallet-connect 2.1.2's undeclared runtime
  import resolvable. No wallet adapter upgrade or override was needed.
- Exact dev dependency vite-plugin-node-polyfills 0.28.0 supplies browser
  Buffer/process/global and selected buffer/process/util/stream/crypto/os/vm
  modules. Existing React/DOM, TypeScript, Vite, ATS, Node and npm pins remain.
- Vite browser aliases supply the dotenv/logging interfaces actually imported
  by ATS's root, LogService and Common exports. dotenv reads no host files;
  `envDir: false` disables Vite environment-file loading. There is no broad
  environment-variable injection or filesystem polyfill.
- The local logger emits fixed level summaries, never messages, metadata or
  formatter callbacks. Console is the supported transport marker; constructing
  a file transport explicitly fails. This is a limited browser environment
  adapter, not the full Winston API or a replacement for SDK business logic.
- Official package-root import, Management export check, application UI and
  single cached attempt remain unchanged. No SDK API is invoked.
- New Vite configuration is included in typechecking. One Node test checks
  payload opacity, fixed logging, formatter non-execution and rejected file
  logging, using a property-access trap with no real secrets.

Configuration references: pinned
[ATS Vite configuration](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/vite.config.ts),
[dotenv convention](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/src/dotenv-mock.js),
[logger convention](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/src/winston-mock.js)
(ATS 8.0.0 / Apache-2.0). Local adapters are independently written around the
observed APIs; no upstream SDK file was patched or vendored. The plugin's
[0.28.0 API](https://github.com/davidmyersdev/vite-plugin-node-polyfills/tree/v0.28.0)
is MIT; proto 2.25.0 is Apache-2.0. No new images, UI framework or project-wide
license declaration was introduced.

## Actual verification

| Check | Observed result |
| --- | --- |
| Runtime | Node 24.19.0 / npm 11.17.0 |
| npm ci | Exit 0; 1242 installed / 1243 audited |
| npm test | Exit 0; 6 tests, including adapter privacy and existing loader/shell checks |
| npm run typecheck | Exit 0, including vite.config.ts |
| npm run build | Exit 0; 9246 modules transformed |
| Real SDK load | Dev and valid preview, desktop/mobile: all 4 passed |
| Isolation | Each case: 0 wallet trap accesses, 0 external HTTP/WebSocket attempts |
| UX/error handling | Idle/loading/success/reload, duplicate guard, keyboard/focus, no overflow; 0 unhandled page or console errors |
| npm audit | Exit 1; 83 package entries, 104 affected locations; risks not waived |
| Build membership capture | Second build via Vite generateBundle; every emitted asset hash matched the browser-tested build |
| MetaMask / network / VC / chain | Not run; not authorized in T01a |

[Browser results](004-t01a-browser.json) use the existing
[reproduction script](002-t01a-browser.mjs). Run it with both servers running:

```sh
node docs/evidence/002-t01a-browser.mjs /absolute/path/to/playwright/package.json
```

Playwright 1.63.0 remains external diagnostic tooling; Chrome uses fresh
contexts, blocked service workers, intercepted outbound traffic and a wallet
getter trap supplying no provider. Six screenshots are ignored local artifacts;
the builder opened the dev desktop and preview mobile results. No independent
agent or human review was requested or claimed for this configuration change.
Historical failure evidence remains in 002-t01a-browser.json and Git.

The first success harness used a period where the unchanged UI uses a
semicolon, producing a timeout. Correcting the test matcher made all four
cases pass; application code was not changed. An isolated caught-exception
trace observed dependency feature probes (including require buffer/long and
process.binding fallbacks), not a final load failure. Successful import does
not prove those libraries' future transaction/VC operations work.

The first build started while npm ci was finishing. The subsequent independent
Vite build ran after ci completed, passed and reproduced identical artifacts.
No result depends on a partial installation. Node's module-mock experimental
notice remains, as do seven unapproved install-script notices (including two
protobufjs 7.2.5 copies); no scripts were approved. Build warns about vm-browserify
direct eval and large chunks; these are recorded, not suppressed.

## Dependency and bundle evidence

[Full audit/lock comparison](004-t01a-audit-comparison.json) projects only public
fields from npm audit and lock metadata. Before: 78 entries / 98 locations;
after: 83 / 104. Severity counts change from 17 to 22 low, with 32 moderate,
27 high and 2 critical unchanged. Five new low aggregate entries are
browserify-sign, create-ecdh, crypto-browserify, node-stdlib-browser and the
polyfill plugin, linked to the existing elliptic advisory. These are not five
new independently demonstrated vulnerabilities.

The 86 changed lock locations comprise the root manifest, added polyfill
dependencies, proto/protobuf peer placement and npm metadata/deduplication.
Root protobufjs moves from 7.2.5 to 7.5.4; **7.2.5 remains under Hashgraph SDK
and Hashgraph proto**. Hiero's proto becomes directly resolvable. No vulnerable
protobuf constraint is repaired. npm also removes the old nested TypeScript
5.9.3 copy under Coinbase; root TypeScript stays 7.0.2. All changes are listed,
including same-version metadata changes; no blanket update/fix was run.

[Bundle evidence](004-t01a-bundle.json) records chunk sizes and package paths
with positive renderedLength in Vite's generateBundle, across all lazy chunks.
The primary SDK chunk is 8,759,902 bytes / 1,643,345 gzip; the provider chunk is
2,512,611 / 578,595 gzip. All JavaScript chunks total 15,738,454 bytes. This
replaces the invalid failed-build size baseline, not a production performance
acceptance. Dynamic import keeps SDK loading manual.

Both vulnerable protobufjs 7.2.5 and 7.5.4 have rendered modules. Fireblocks'
axios 0.27.2, Terminal3 BBS code and elliptic 6.6.1 also appear. These are static
membership facts, not proof an exploit or wallet flow ran. The native BBS/tar
branch has no rendered module in this build and is absent after this local
installation; that cannot waive cross-platform installation or future VC risk.
Zero module counts elsewhere are similarly scoped to this build metric.

## Remaining gate / next allowed work

The browser experiment is complete; **B1/B2 and applicable dependency risks
remain unresolved**. Read the original triage together with current bundle
membership. A concrete supported patch trial or scoped risk decision is still
needed before T01b. Neither the user's go nor this import result approves
protobuf/tar overrides, a wallet risk waiver or a later ticket.

Continue only T01a records and specifically authorized repairs. Do not repeat
these passing load checks without a changed implementation or new concern.
Remote CI must be read for the actual Git HEAD; historical CI success is not
evidence for this commit. Main remains unchanged; the existing PR stays draft.
