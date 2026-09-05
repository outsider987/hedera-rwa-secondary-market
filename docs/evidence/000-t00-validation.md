# T00-min validation — 2026-09-05

Scope: static React shell and repository/tooling only. No wallet integration,
SDK runtime import, RPC calls, VC signature, or Testnet transaction was tested.

## Reproducible local checks

Environment: Node 24.19.0, npm 11.17.0, Linux. Manifest dependencies are exact;
`npm ls --depth=0` confirms React/React DOM 19.2.8, ATS 8.0.0, Vite 8.2.2,
TypeScript 7.0.2, @types/react 19.2.18 and @types/react-dom 19.2.7.

| Check | Result |
| --- | --- |
| `npm ci --no-fund` | Exit 0, clean install; audit warnings remain below |
| `npm test` | 1 Node built-in shell smoke test passed, 0 failed |
| `npm run typecheck` | Exit 0 |
| `npm run build` | Exit 0; 16 modules, JS 193.81 kB / gzip 61.02 kB; CSS 1.90 kB |
| `git diff --check` | Passed |
| Impeccable static detector | `[]`; no findings |

The smoke test server-renders App through the existing Vite/React dependencies
and checks honest planned/pending states, the skip target, and the absence of
transaction forms/buttons. It does NOT test an ATS integration.

## Browser checks

Used Playwright 1.63.0 as an ephemeral diagnostic tool with installed Google
Chrome, new isolated contexts and no user wallet/browser profile. Playwright
was NOT added to application dependencies or the CI test framework.

| Endpoint | Viewport | Console/page errors | External requests | Horizontal overflow | Keyboard skip link |
| --- | --- | ---: | ---: | --- | --- |
| Dev, 127.0.0.1:5173 | 1440 × 1000 | 0 | 0 | None | Passed |
| Dev, 127.0.0.1:5173 | 390 × 844 | 0 | 0 | None | Passed |
| Preview, 127.0.0.1:4173 | 1440 × 1000 | 0 | 0 | None | Passed |
| Preview, 127.0.0.1:4173 | 390 × 844 | 0 | 0 | None | Passed |

Each scenario checked the page title, HoldBook heading, unconnected/no-evidence
copy, no outbound requests, no page/console errors, overflow, and Tab/Enter on
the skip link. Four full-page screenshots were inspected. Initial smoke caught
a favicon 404; `index.html` now uses an empty data favicon and all four reruns
passed. The runtime errors were not silenced or excluded from the check.

Local diagnostic script/screenshots are ignored under `.artifacts/`:
`t00-browser-smoke.mjs`, `t00-{dev,preview}-{desktop,mobile}.png`.
These local artifacts are convenience copies, not required handoff state;
the results and reproduction steps above are preserved in Git.

An independent read-only Impeccable finish reviewer inspected the four captures
and source/test files: **ship**, no material issues at the T00 scope, no fixes.
The minimal-shell user brief replaced the skill's branding/asset workflow.
This review does not establish SDK/MetaMask readiness or security clearance.

## Dependency audit — unresolved

`npm audit --json` reported **78 vulnerable package entries**:
17 low, 32 moderate, 27 high, 2 critical. This is an audit of the dependency
graph, not proof that each advisory is reachable in the shipped shell.

- `protobufjs` is critical in the ATS dependency graph: 7.2.5 through
  `@hashgraph/sdk 2.64.5` / `@hashgraph/proto 2.18.5`; 7.5.4 through the
  `@hiero-ledger/sdk 2.79.0` peer chain from `@hashgraph/hedera-wallet-connect`.
  Example: https://github.com/advisories/GHSA-xq3m-2v4x-88gg
- `tar 6.2.1` is critical in the lockfile's optional
  `@mapbox/node-pre-gyp 1.0.11` dependency branch. It was NOT present in the
  final local installation (`npm explain tar` found no installed dependency).
  Example: https://github.com/advisories/GHSA-23hp-3jrh-7fpw
- The root ATS package receives a high aggregate finding. npm's suggested
  replacement was ATS **1.13.0**, incompatible with the approved 8.0.0 plan.
  No `npm audit fix`, downgrade, override or unreviewed script approval ran.
- npm also reported unapproved lifecycle scripts for `@reown/appkit`,
  protobufjs variants, keccak and secp256k1. They were not blanket-approved;
  shell tests/build pass without doing so. T01 must inspect any needed script.

T00 deliberately does not import ATS; browser smoke observed zero external
requests. That is NOT a security waiver for T01: before wallet/VC integration,
triage reachable advisories and resolve incompatible fixes with Victor/mentor.
Do not silently change the version pins to make audit output green.

## GitHub

- Public repository created: https://github.com/outsider987/hedera-rwa-secondary-market
- Default branch: `main`.
- Guardrails commit: `e162b247db651eca4ff2d6afa48d6b40711091d7`.
- CI actions pinned to observed v4 commit refs: checkout
  `11d5960a326750d5838078e36cf38b85af677262`; setup-node
  `49933ea5288caeca8642d1e84afbd3f7d6820020`.
- Remote shell CI result: pending first shell push; record its actual run before
  marking T00 handed off. Local results above are already complete.
