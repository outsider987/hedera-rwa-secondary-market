# Third-party sources / attribution

Current uses include the independent wagmi wallet slice and the viem deployment
and Equity config checks based on `0828d79`.
The earlier stopped trial is historical; the bounded original-schema repair is
now retained in evidence 014. Dated AI/human
contributions are indexed in [AI_USAGE.md](../AI_USAGE.md).
This list covers directly used libraries, tools and references; transitive
versions remain in [package-lock.json](../package-lock.json). No project-wide
license or event eligibility is asserted by public GitHub availability.

| Material / version | Use | License / source |
| --- | --- | --- |
| React / React DOM 19.2.8 | Console UI | MIT; [React](https://github.com/facebook/react) |
| Vite 8.2.2 | Dev/build tooling | MIT; [Vite](https://github.com/vitejs/vite) |
| TypeScript 7.0.2 | Typechecking | Apache-2.0; [TypeScript](https://github.com/microsoft/TypeScript) |
| ATS SDK 8.0.0 | Diagnostic public-entry loading and read-initialization prerequisite probe; current app SDK/VC integration pending | Apache-2.0; [ATS](https://github.com/hashgraph/asset-tokenization-studio) |
| wagmi 3.7.7 / @wagmi/core 3.6.5 / @wagmi/connectors 8.2.0 | React connection state and injected EIP-1193 connector; no other connector activated | MIT; [wagmi](https://github.com/wevm/wagmi), [official integration](https://wagmi.sh/react/getting-started), [provider reconnect setting](https://wagmi.sh/react/api/WagmiProvider), [injected](https://wagmi.sh/react/api/connectors/injected) |
| viem 2.56.3 | Direct dependency; wagmi utilities and public Testnet chain/bytecode reads using createClient with getChainId/getCode/readContract actions; CCIP Read disabled | MIT; [viem](https://github.com/wevm/viem) |
| @tanstack/react-query / query-core 5.102.8 | Account/deployment query lifecycle and wagmi mutations | MIT; [TanStack Query](https://github.com/TanStack/query) |
| mipd 0.0.7 / use-sync-external-store 1.4.0 / nested zustand 5.0.0 | New wagmi closure; provider discovery is disabled | MIT; [mipd](https://github.com/wevm/mipd), [React](https://github.com/facebook/react), [Zustand](https://github.com/pmndrs/zustand); full [added package metadata](evidence/008-t01b-1-lock-diff.json) |
| Hedera Mirror Node account REST API | Public EVM-to-Hedera-ID lookup on Testnet; browser evidence uses synthetic responses | [Official account endpoint documentation](https://docs.hedera.com/reference/rest-api/accounts); no documentation code copied |
| Hedera Mirror Node contract REST API / fixed ATS v8 deployments | Public Testnet contract ID-to-EVM lookup; runtime code independently read through JSON-RPC | [Official contract endpoint](https://docs.hedera.com/api-reference/contracts/get-contract-by-id), [pinned deployment IDs](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/.env.example); no documentation code copied |
| ATS contracts 8.0.0 DiamondCutManager ABI | Minimal view-function ABI used for Equity config lookup; tests compare calldata with the installed official artifact, without importing SDK/contract modules into the app | Apache-2.0; [pinned contract](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/contracts/contracts/infrastructure/diamond/DiamondCutManager.sol#L118-L122), [SDK query semantics](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/out/rpc/RPCQueryAdapter.ts#L719-L729) |
| Existing nested abitype 1.2.3 / ox 0.14.44 | Additional rendered viem ABI/RPC helpers for readContract; versions and lock unchanged | MIT; [ABIType](https://github.com/wevm/abitype), [Ox](https://github.com/wevm/ox); [bundle membership](evidence/010-t01b-3-bundle.json) |
| @hiero-ledger/proto 2.25.0 | Supplies wallet-connect's missing runtime import | Apache-2.0; [Hiero SDK repository](https://github.com/hiero-ledger/hiero-sdk-js) |
| @hashgraph/proto 2.18.5 / @hashgraph/sdk 2.64.5 / @hiero-ledger/sdk 2.79.0 | Existing transitive parents; public proto compatibility and decoder diagnostic | Apache-2.0; [Hiero SDK repository](https://github.com/hiero-ledger/hiero-sdk-js), exact versions in lockfile |
| protobufjs 7.6.6 | Retained exact runtime/dev pin and four qualified parent overrides; older runtime trials remain historical | BSD-3-Clause; [protobuf.js](https://github.com/protobufjs/protobuf.js), [7.6.6 source](https://github.com/protobufjs/protobuf.js/tree/protobufjs-v7.6.6) |
| protobufjs-cli 1.3.3 | Retained exact dev tool for root postinstall regeneration; native static-module ES6/CommonJS wrappers | BSD-3-Clause; [CLI source](https://github.com/protobufjs/protobuf.js/tree/protobufjs-cli-v1.3.3/cli); full added closure/licenses in [repair record](evidence/014-t01a-decoder-rebuild.json) |
| @hiero-ledger/proto 2.31.0 | Published source inspected for prior repair research only; not installed or bundled | Apache-2.0; [published metadata](https://registry.npmjs.org/@hiero-ledger%2Fproto/2.31.0) |
| long 5.3.1 / 5.3.2 (proto paths) | Existing transitive 64-bit representation; public Long.isLong in diagnostic only | Apache-2.0; [long.js](https://github.com/dcodeIO/long.js), all paths/versions in lockfile |
| vite-plugin-node-polyfills 0.28.0 | Vite 8 browser compatibility | MIT; [plugin](https://github.com/davidmyersdev/vite-plugin-node-polyfills/tree/v0.28.0) |
| @types/react 19.2.18 / @types/react-dom 19.2.7 | Type declarations | MIT; [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| Node 24.19.0 / npm 11.17.0 | Runtime/package manager | Their upstream licenses apply; [Node](https://github.com/nodejs/node), [npm](https://github.com/npm/cli) |
| GitHub checkout / setup-node actions | CI tooling; exact refs in the workflow | MIT; [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node) |
| Playwright 1.63.0 | External diagnostic tool, not a project dependency | Apache-2.0; [Playwright](https://github.com/microsoft/playwright) |
| Terminal3 verify_vc 0.0.20 / vc_core 0.0.19 | Planning/compatibility references and ATS transitive dependencies; no VC flow implemented | MIT in published manifests; [verify_vc](https://www.npmjs.com/package/@terminal3/verify_vc/v/0.0.20), [vc_core](https://www.npmjs.com/package/@terminal3/vc_core/v/0.0.19) |
| Ponytail / Impeccable skills | AI workflow guidance; not bundled application code/assets | [Dated usage records](../AI_USAGE.md) |

Browser configuration and adapter conventions reference the
[pinned ATS v8 configuration](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/vite.config.ts)
(Apache-2.0). The local dotenv/logging boundaries were written around observed
APIs; no upstream SDK file was patched or vendored. Details and source links:
[remediation evidence](evidence/004-t01a-remediation.md).

The independently written protobuf test uses synthetic fields and a BigInt wire
oracle. It references the upstream
[recursion advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-685m-2w69-288q),
[option parsing advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-j3f2-48v5-ccww),
[7.6.5 decoder](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.5/src/decoder.js)
and [7.6.6 decoder](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.6/src/decoder.js).
Ancestor override behavior was checked against [npm's override documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).
The subsequent [research](evidence/006-t01a-protobuf-research.md) also reads
[npm 11.17.0's matcher](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/override-set.js)
and the [7.6.6 backport](https://github.com/protobufjs/protobuf.js/pull/2422).
Eight pure matching assertions used the existing installed npm tooling; no
Arborist source, compiler or published proto archive was vendored into Git.
Published package source was read only; no SDK decoder, signer or upstream test
key was copied. The browser harness and ignored build-membership capture reuse
this repository's earlier diagnostic code. See [trial evidence](evidence/005-t01a-protobuf.md).

The later [bounded rebuild trial](evidence/007-t01a-protobuf-rebuild.md) inspected
the unchanged published schemas and generation flags in the pinned SDK
[2.64.5 Taskfile](https://github.com/hiero-ledger/hiero-sdk-js/blob/ce932c0ee3c13b22a18ed3a137b22ea56b0e57a1/packages/proto/Taskfile.yml)
and [2.79.0 Taskfile](https://github.com/hiero-ledger/hiero-sdk-js/blob/0f0f23dc90a4d7cab67aa56bece38ecc1c135a06/packages/proto/Taskfile.yml)
(Apache-2.0). Only paths, hashes and the referenced pbjs command are recorded;
no upstream implementation or schema is vendored. The single 007 Node test
extends this repository's preserved 005 test with synthetic threshold and length
cases and public API snapshots. The draft generator was not executed and was
removed when the tree gate failed; no rebuilt artifact is claimed.

No logos, stock images, starter application or unseen pre-event master-plan
file were copied into this repository. The user-supplied plan and actual
prompts are disclosed in [the planning record](prompts/001-planning-record.md).
The mentioned pre-event draft was not supplied or inspected; Victor must resolve
any project-specific eligibility question with organizers. The former shared
source table remains verbatim in [the historical archive](ai-usage/000-t00.md#third-party-sources).

The [npm resolution diagnosis](evidence/013-t01a-npm-resolution.md) uses installed npm 11.17.0 / Arborist (ISC) in a synthetic test fixture. It references upstream [place-dep.js](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/place-dep.js), [node.js](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/node.js), and the [nested install strategy](https://docs.npmjs.com/cli/v11/commands/npm-update/#install-strategy). No upstream source was copied into the repository. The isolated candidate used protobufjs 7.6.6 and protobufjs-cli 1.3.3 (BSD-3-Clause); neither is added as a direct application dependency by this diagnostic.

The subsequent [retained repair](evidence/014-t01a-decoder-rebuild.md) regenerates
the unchanged Apache-2.0 schemas in @hashgraph/proto 2.18.5 and
@hiero-ledger/proto 2.25.0 using their pinned Taskfiles above and the BSD-3-Clause
compiler. Generated outputs remain inside the installed packages; upstream
license files are retained. No schema or generated upstream implementation is
committed to Git. Archive entrypoint selection is inferred from the unquoted
Taskfile glob and checked against the exact original public API; see
[shell pattern semantics](https://www.gnu.org/s/bash/manual/html_node/Pattern-Matching.html).
The local generator resolves only verified archive files and uses pbjs private
root names to keep the two public proto modules independent. The new Node test
reuses the repository's synthetic diagnostics and adds both load orders.
The SDK bundle inventory accounts for six already-shipped embedded Lit files
under @phosphor-icons/webcomponents; their owning locked package is unchanged.
The compiler adds no rendered browser modules. This correction does not rewrite
the outcomes of earlier rejected trials.

The [T01b-4 prerequisite diagnostic](evidence/015-t01b-4-sdk-config.md) uses the
unchanged public SDK entry and references the pinned
[request exports](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/in/request/index.ts),
[request validation](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/core/validation/Validation.ts),
[Network API](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/in/network/Network.ts)
and RPC adapter (Apache-2.0). Ethers 6.17.0 (MIT), already installed, was reviewed
for provider/fetch defaults; it was not added as a direct dependency or used to
replace the SDK transport. [Provider source](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/providers/provider-jsonrpc.ts),
[fetch source](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/utils/fetch.ts).
The independently written diagnostic reuses the existing deployment check and
build/browser patterns. Only temporary probe source is generated; no upstream
implementation is copied into Git, and no SDK config result is fabricated.

The subsequent [read-only options research](evidence/016-sdk-readonly-options.md)
compares those sources with the [official SDK integration guide](https://docs.tokenization-studio.hedera.com/ats/developer-guides/sdk-integration/),
ATS initialization/request fields, MetaMask discovery/listeners, contract-address
selection and Mirror retry implementation (Apache-2.0). It also references
[ethers FetchRequest controls](https://docs.ethers.org/v6/api/utils/fetching/)
and the [6.17.0 browser transport](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/utils/geturl-browser.ts)
(MIT). GitHub public API metadata/search results were read on September 6, 2026;
no maintainer response, new upstream repair or runtime compatibility is claimed.
No source implementation was copied or dependency changed in this research.
