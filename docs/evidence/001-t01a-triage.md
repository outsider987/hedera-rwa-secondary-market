# T01a dependency triage — 2026-09-05

**Status: BLOCKED before dependency changes or SDK loading.** The approved
in-range-only repair policy cannot replace the exact vulnerable protobufjs
versions required by ATS's pinned SDK graph. No override, package update,
polyfill, wallet access, signature, RPC/Mirror call or SDK import was attempted.

## Reproducible baseline / complete inventory

- Base HEAD: `10d69e7d2950f77e0aa4ee7a2842811fadf0f795`; main was clean.
- Verified `00a5dd1f0cda654167d4abe3a94f82559c30930e` is an ancestor; it remains
  the validated source/lockfile commit. This turn changes documentation only.
- Node `24.19.0`, npm `11.17.0`, Linux.
- `npm audit --json`: exit **1**, 78 vulnerable package entries:
  17 low, 32 moderate, 27 high, 2 critical. This is not 78 independent exploits.
- [Audit snapshot](001-t01a-audit.json) preserves all 78 entries, every advisory
  title/URL/range, aggregate `via` links and all 98 affected package locations.
  All 29 critical/high entries additionally have a dependency path, trigger
  summary, stage, and unresolved disposition. Paths come from lockfile
  dependency/optional/peer edges, not inferred runtime call paths.
- Installed flags were checked before and after clean npm ci. Optional means
  optional in the lockfile, not necessarily absent; actual presence is separate.
- Low/moderate entries are inventoried, not individually cleared. High/critical
  triage is static, not an exploit reproduction or exhaustive SDK reachability audit.

Before and after checks have identical hashes:

| File | SHA-256 |
| --- | --- |
| package.json | `c8eef12472b311aa1f216e412fb67c46f6e1a7bf1b3eb69ac8c7b2e6054492c9` |
| package-lock.json | `766b3d6d0850b8166ba5ab6c0fbfec3c2dbc6cd85ffaa93a6c37f08f172faaed` |

## Blocking dependency constraints

### B1 — exact protobufjs pins

| Parent | Dependency declaration | Registry-confirmed candidate | In declared range? |
| --- | --- | --- | --- |
| ATS 8.0.0 → @hashgraph/sdk 2.64.5 | protobufjs `7.2.5` | `7.6.5` | No |
| SDK 2.64.5 → @hashgraph/proto 2.18.5 | protobufjs `7.2.5` | `7.6.5` | No |
| ATS 8.0.0 → hedera-wallet-connect 2.1.2 → peer @hiero-ledger/sdk 2.79.0 | protobufjs `7.5.4` | `7.6.5` | No |
| Hiero SDK → @hiero-ledger/proto 2.25.0 | peer protobufjs `7.5.4` | `7.6.5` | No |

These are exact versions, not caret ranges. Installing another newer protobufjs
copy at the root would not repair the constrained copies. The already-installed
7.6.6 under @grpc/proto-loader is not in the affected-node list and does not
repair them either. Candidate 7.6.5 is beyond this snapshot's affected ranges;
it was only checked for publication/range exclusion, NOT installed or validated
against ATS. It is not an approved override or a blanket future security claim.

The schema-code-execution advisory requires attacker-influenced definitions
loaded through affected reflection/code-generation paths. The maintainer now
labels it high; the npm snapshot still labels it critical. Preserve both facts.
[Maintainer advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-xq3m-2v4x-88gg).

Static inspection found @hashgraph/proto's published lib entry using
`protobufjs/minimal.js` and pre-generated proto code. This is evidence against
that particular schema-loading path, NOT a waiver for every protobufjs issue.
Separately, nested binary data can exhaust the decoder stack; the installed
Reader.skipType recursively handles group fields without a depth guard.
No malformed payload was run. Future SDK/network reachability remains unresolved.
[Binary-recursion advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-685m-2w69-288q).

### B2 — optional tar/native tooling branch

Observed lockfile route:

```text
ATS 8.0.0
  → @terminal3/verify_vc 0.0.20
  → @terminal3/bbs_vc 0.2.18
  → @mattrglobal/bbs-signatures 1.4.0
  → optional @mattrglobal/node-bbs-signatures 0.18.1
  → @mapbox/node-pre-gyp 1.0.11
  → tar 6.2.1 (declared ^6.1.11)
```

The native package, node-pre-gyp, tar, neon-cli, tmp and toml are absent from
the final local installation; `npm explain tar` exits 1 with no dependency
found. npm ci still emitted a tar deprecation warning during installation.
Final absence does not prove the optional branch can never be fetched/executed
during installation, or that another platform/CI setting will omit it.

Untrusted archives can exhaust resources while extracting. Other snapshot
advisories concern link/path handling and listing/replacement operations.
The current application has no archive interface.
[Decompression advisory](https://github.com/isaacs/node-tar/security/advisories/GHSA-23hp-3jrh-7fpw).

Registry-confirmed tar 7.5.21 is outside ^6.1.11. It addresses the latest affected
range in this snapshot, whereas 7.5.19 addresses only the decompression advisory
and is still covered by later findings. No candidate was installed; changing
node-pre-gyp's major line or overriding tar needs new direction.
[Later recursion advisory](https://github.com/advisories/GHSA-r292-9mhp-454m).

### Remaining high findings

Every high/critical package has its own triage record in the JSON snapshot.
The following summarizes the groups without claiming package presence equals
browser inclusion:

| Group | Trigger / current disposition |
| --- | --- |
| Hiero grpc-js 1.12.6 | Malformed compressed traffic/server requests; exact parent pin. No gRPC flow in shell; future transport path unresolved. |
| Custodian/Fireblocks and axios | Unsafe URL/proxy/redirect/configuration or request data; installed older copies under custodians and an exact axios 1.16.0 under Coinbase. No custodian/HTTP initialization; post-import exposure unverified. |
| Node ws | Crafted fragmented messages; exact older copies under ethers/viem. Browser adapter exclusion has not been demonstrated. |
| undici 5.29.0 via JSON-LD | HTTP/WebSocket parsing and request/cookie handling; parent declares ^5.21.2. No VC/context loading currently; future path unresolved. |
| React Native/Metro/image-size | Peer-installed native tooling with image-parser loop findings. Current build uses Vite, not Metro; no uploaded-image parsing. No post-SDK-import exclusion claim. |
| BBS/neon-cli/tmp/toml | Aggregate optional native install/build findings; untrusted archive/TOML/path parameters are relevant triggers. Native subtree absent after local install, not cleared globally. |
| ATS/SDK/proto aggregate entries | Follow their recorded `via` leaves; aggregate severity is not a separate independently reproduced exploit. |

The global stop at B1 means no partial update was attempted elsewhere. Some
branches may admit permitted updates; this report does not claim none do.
npm's root replacement suggestion is ATS **1.13.0**, a forbidden downgrade,
not a compatible remediation for this plan.

## Installation notices / SDK import gate

Clean npm ci passed, retaining six unapproved lifecycle-script notices:
protobufjs 7.2.5/7.5.4/7.6.6, @reown/appkit 1.8.19, keccak 3.0.4,
secp256k1 4.0.5. No approve-scripts command or allowScripts change was made.
These notices and package deprecations are distinct from audit findings.
The T00 Actions runtime notice remains historical and separate; no CI action
upgrade was included in this ticket.

Static inspection of ATS's official ESM entry found `dotenv.config()` before
its public re-exports. We did not execute it in Node (which could read .env),
try a private entry, stub it, or add a polyfill. Browser compatibility is still
unverified. No loader button/state-machine/test was added because the approved
stop condition occurred first. The page remains the honest T00 shell.

## Checks actually executed

| Check | Result |
| --- | --- |
| npm audit --json | Exit 1; 78 entries, snapshot preserved |
| npm ci | Exit 0; 1165 installed / 1166 audited, same 78 findings; no script approvals |
| Snapshot consistency | 78 entries and 98 version/presence observations match lockfile and post-ci installation |
| Candidate range assertions | Five parent dependency/peer constraints reject candidates above |
| npm test | 1 existing shell smoke test passed; no SDK test claimed |
| npm run typecheck | Exit 0 |
| npm run build | Exit 0; 16 modules; JS 193.81 kB / gzip 61.02 kB; CSS 1.90 kB, unchanged |
| Browser dev/preview, desktop/mobile | Four isolated Chrome scenarios passed: 0 page/console errors, 0 external requests, no overflow, keyboard skip link works |
| SDK browser loading / loader tests | NOT RUN / NOT IMPLEMENTED: blocked before import |
| MetaMask / VC / chain | NOT RUN; explicitly outside T01a |

Browser checks reran the existing ignored `.artifacts/t00-browser-smoke.mjs`
with ephemeral Playwright 1.63.0 and new browser contexts, without wallet profiles.
These validate the unchanged shell only; there is no SDK bundle-size comparison.
No new test framework or runtime dependency was added.

Reproduction: run npm ci, npm audit --json (expected nonzero), npm test,
npm run typecheck and npm run build; compare the two SHA-256 values above.
Use npm explain protobufjs/tar for installed paths, and inspect dependency AND
peerDependency declarations in package-lock.json for the B1/B2 constraints.
The snapshot is a dated projection, not a frozen assertion about future advisories.

## Resume decision / mentor packet

Ask Victor and the Hedera mentor to choose a supported resolution for ATS 8.0.0's
exact protobufjs/Hiero transport graph, and Terminal3's optional native branch:
an explicitly authorized compatibility trial of precise transitive overrides,
an upstream-supported parent-package change, or a documented, narrowly scoped
risk decision allowing only isolated load diagnostics. None is authorized here.
Candidate publication does not prove API or runtime compatibility.

Until that decision is recorded, remain at T01a blocked. T01b still requires all
original wallet/account/config/VC gates; neither source-only triage nor green
shell CI can authorize wallet integration.
