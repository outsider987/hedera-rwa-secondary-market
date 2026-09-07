# Third-party sources / attribution

Current uses include wagmi wallet state, viem/SDK deployment and config reads,
manual Terminal3 Seller VC verification, and guarded NOVA creation/readback.
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
| ATS SDK 8.0.0 | Locally patched public requests and owned read/manual-wallet providers; guarded NOVA creation/readback accepted in evidence 024 | Apache-2.0; [ATS](https://github.com/hashgraph/asset-tokenization-studio), [patch scope/evidence](evidence/017-sdk-readonly-trial.md) |
| ethers 6.17.0 | Exact direct dependency; owned read/wallet providers, UTF-8 ECDSA verification semantics and ABI encoding/decoding | MIT; [ethers source](https://github.com/ethers-io/ethers.js/tree/v6.17.0), [fetch controls](https://docs.ethers.org/v6/api/utils/fetching/) |
| wagmi 3.7.7 / @wagmi/core 3.6.5 / @wagmi/connectors 8.2.0 | React connection state and injected EIP-1193 connector; no other connector activated | MIT; [wagmi](https://github.com/wevm/wagmi), [official integration](https://wagmi.sh/react/getting-started), [provider reconnect setting](https://wagmi.sh/react/api/WagmiProvider), [injected](https://wagmi.sh/react/api/connectors/injected) |
| viem 2.56.3 | Direct dependency; wagmi utilities and public Testnet chain/bytecode reads using createClient with getChainId/getCode/readContract actions; CCIP Read disabled | MIT; [viem](https://github.com/wevm/viem) |
| @tanstack/react-query / query-core 5.102.8 | Account/deployment query lifecycle and wagmi mutations | MIT; [TanStack Query](https://github.com/TanStack/query) |
| mipd 0.0.7 / use-sync-external-store 1.4.0 / nested zustand 5.0.0 | New wagmi closure; provider discovery is disabled | MIT; [mipd](https://github.com/wevm/mipd), [React](https://github.com/facebook/react), [Zustand](https://github.com/pmndrs/zustand); full [added package metadata](evidence/008-t01b-1-lock-diff.json) |
| Hedera Mirror Node account REST API | Public EVM-to-Hedera-ID lookup on Testnet; browser evidence uses synthetic responses | [Official account endpoint documentation](https://docs.hedera.com/reference/rest-api/accounts); no documentation code copied |
| Hedera Mirror Node contract REST API / fixed ATS v8 deployments | Public Testnet contract ID-to-EVM lookup; runtime code independently read through JSON-RPC | [Official contract endpoint](https://docs.hedera.com/api-reference/contracts/get-contract-by-id), [pinned deployment IDs](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/.env.example); no documentation code copied |
| ATS contracts 8.0.0 DiamondCutManager ABI | Minimal initial ABI for independent config lookup; Factory/IAsset ABIs are additionally loaded lazily for NOVA calldata, events and current getters | Apache-2.0; [pinned contract](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/contracts/contracts/infrastructure/diamond/DiamondCutManager.sol#L118-L122), [SDK query semantics](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/out/rpc/RPCQueryAdapter.ts#L719-L729) |
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
| Terminal3 verify_vc 0.0.20 / vc_core 0.0.19 | Exact direct dependencies for genuine payload preparation and manual ECDSA verification; human positive acceptance Pending | MIT in published manifests; [verify_vc](https://www.npmjs.com/package/@terminal3/verify_vc/v/0.0.20), [vc_core](https://www.npmjs.com/package/@terminal3/vc_core/v/0.0.19) |
| Ponytail / Impeccable skills | AI workflow guidance; not bundled application code/assets | [Dated usage records](../AI_USAGE.md) |

Browser configuration and adapter conventions reference the
[pinned ATS v8 configuration](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/vite.config.ts)
(Apache-2.0). The local dotenv/logging boundaries were written around observed
APIs. That historical remediation did not patch SDK files; later dated sections
below disclose the retained patches. Details and source links:
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

The subsequent [isolated compatibility trial](evidence/017-sdk-readonly-trial.md)
adapts small published ATS snippets in four logical targets: request exports,
[JsonRpcRelay](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/domain/context/network/JsonRpcRelay.ts),
[SetNetworkCommandHandler](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/app/usecase/command/network/setNetwork/SetNetworkCommandHandler.ts)
and RPCQueryAdapter (Apache-2.0). Original notices remain in every patched
implementation; the repository stores replacement snippets and hashes, not a
fork or node_modules. The request constructor and validation implementation are
unchanged. Ethers 6.17.0 uses its public per-request/provider options; its source
is not patched or vendored. The isolated page/harness independently reuses this
repository's existing deployment checks and diagnostic patterns. This local
adaptation is not an upstream-supported read-only API or a VC acceptance claim.
The [trial inventory](evidence/017-sdk-readonly-trial.json) covers all 348
rendered SDK package locations. Existing `@dfns/sdk` and `@dfns/sdk-keysigner`
0.1.0-beta.5 have no license field or top-level license/notice file in the
installed packages; their license is not inferred. Trial 017 left the main-app
bundle unchanged; the subsequent integration accounts for the SDK lazy bundle.

The [main-app integration](evidence/018-t01b-4-sdk-integration.md) reuses that
verified local patch and the existing viem preflight without dependency changes.
SDK loading is explicit; its complete lazy bundle inventory is retained with
the new evidence. Broad upstream modules may be bundled without being invoked;
config-read acceptance does not establish VC or transaction compatibility.

The [B2 readiness research](evidence/019-b2-vc-readiness.md) inspects published
Terminal3 sources (vc_core/verify_vc/verify_vc_core/ecdsa_vc/bbs_vc/revoke_vc,
MIT), MATTR BBS 1.4.0's native/WASM loader (Apache-2.0), and ATS KYC call paths
(Apache-2.0). No upstream implementation was copied or altered. Current public
npm metadata and maintainer advisories are linked in evidence 019, which records
all 196 dependency/optional/peer locations and affected advisory paths.
Proposed tar 7.5.22 declares **BlueOak-1.0.0**, unlike installed-lock tar 6.2.1's
ISC; it has not been installed. Proposed UUID 11.1.1, tmp 0.2.7, toml 4.2.0 and
Undici 6.28.0 declare MIT. Native neon-cli references LICENSE-*; lock-only
iniparser 1.0.5 lacks license metadata, so no license is inferred. These and
existing dfns gaps require resolution for affected future work. Reusing the
published verifier does not establish legal compliance or acceptance of a VC.

The [isolated B2 trial](evidence/020-b2-dependency-trial.md) uses independently
written bounded fixtures informed by maintainer advisories, linked there and
in the raw results. No cryptographic implementation or SDK source was changed.
The disposable candidate uses tar 7.5.22 (BlueOak-1.0.0), toml 4.2.0, tmp 0.2.7,
Undici 6.28.0 and UUID 11.1.1 (MIT); none is retained in the repository manifest.
Node-pre-gyp 1.0.11's extraction/packaging callers (BSD-3-Clause), neon-cli 0.10.1's
Cargo parser and external-editor 3.1.0's temporary-file lifecycle (MIT) informed
the compatibility tests. Both LICENSE-APACHE and LICENSE-MIT exist in neon-cli;
retain both texts rather than inferring a license choice from its metadata.
Native BBS 0.18.1 includes its Apache-2.0 text. The full **iniparser 1.0.5 README
contains MIT license text**, resolving the prior metadata-only gap for this
published package; its hash is recorded. Existing dfns license gaps remain.
Native source inspection and scripts-disabled tests do not establish binary
compatibility. Playwright 1.63.0 remains external diagnostic tooling; the
standalone unsigned VC probe uses actual published Terminal3 public imports.

The [retained repair](evidence/021-b2-retained-repair.md) now installs evidence
020's exact six overrides. Tar 7.5.22 is BlueOak-1.0.0; toml 4.2.0, tmp 0.2.7,
Undici 6.28.0 and both scoped UUID 11.1.1 copies are MIT. Terminal3 vc_core
0.0.19 / verify_vc 0.0.20 are direct pins (MIT); ethers remains 6.17.0.
Historical statements above that the candidate is unretained describe their
dated stages. Native BBS is outside desktop ECDSA support, not verified.
No cryptographic or existing SDK/proto repair source changed.

The [VC flow](evidence/022-vc-implementation.md) uses Terminal3 vc_core 0.0.19,
verify_vc 0.0.20 and the proof layout/hash semantics of ecdsa_vc 0.1.16 (MIT).
The application independently adapts the proof fields to a manually approved
wagmi provider personal_sign request, preserving UTF-8 hash-string semantics.
Published verifier code is unchanged; no upstream private-key issuer or key
fixture was copied. The [MetaMask signing guide](https://docs.metamask.io/metamask-connect/evm/guides/sign-data/)
was consulted on September 6, 2026. Viem's existing keccak256/stringToHex/getAddress
utilities implement matching JSON hash/checksum operations, checked against
pinned ethers 6.17.0. Native BBS is explicitly outside this supported path.


## September 7, 2026 — managed NOVA creation and readback

[Evidence 023](evidence/023-nova-implementation.md) extends the current uses above:
ATS SDK 8.0.0 is locally adapted in 16 published ESM/CJS/type files for the public
Network provider option, RPC adapter, MetaMask service and genuine configuration
request export. The separate patch checks version and original/patched SHA-256
before writing; upstream Apache-2.0 notices remain. The managed RPC adapter
sets the configured Mirror instance HTTP timeout to 10 seconds; the Mirror
adapter source is unchanged. Equity.create and existing
proto/read-only patches are unchanged. Source: the installed published SDK,
[ATS repository at the pinned source revision](https://github.com/hashgraph/asset-tokenization-studio/tree/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk).

The installed contracts 8.0.0 Factory and IAsset ABIs (Apache-2.0) now supply
lazy calldata/event encoding and current getter decoding. The deployment event
is the stated source for rights omitted by the SDK's Equity getter. No Solidity
contract is copied or deployed from custom code. ethers 6.17.0 (MIT) supplies
owned browser/read providers and ABI Interface; its public getTransaction method
is wrapped on the owned instance to stop the signer's post-send retry after a
bounded lookup failure. [Signer/provider source](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/providers/provider-jsonrpc.ts).

Public receipt/RPC and Mirror REST records provide chain evidence; the
[Mirror OpenAPI schema](https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml)
was consulted for contract results and timestamp-filtered transactions. Native
Web Locks and Web Storage provide same-origin exclusion and public operation
persistence. Existing licenses, the 62 audit findings, peer incompatibilities
and dfns license omissions remain; no native BBS support is asserted.


September 7 acceptance correction: [evidence 024](evidence/024-vc-nova-manual.md)
records actual manual ECDSA VC and NOVA acceptance. Readback resolves Mirror's
reported sender through its public Testnet accounts endpoint and reuses the
existing application account validator. This is an application repair, not an
upstream SDK/contract change; no third-party code or dependency was added.
