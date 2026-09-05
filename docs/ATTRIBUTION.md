# Third-party sources / attribution

Current uses include the bounded rebuild trial based on `b5640298`, stopped at
the dependency-tree gate and restored. Dated AI/human
contributions are indexed in [AI_USAGE.md](../AI_USAGE.md).
This list covers directly used libraries, tools and references; transitive
versions remain in [package-lock.json](../package-lock.json). No project-wide
license or event eligibility is asserted by public GitHub availability.

| Material / version | Use | License / source |
| --- | --- | --- |
| React / React DOM 19.2.8 | Console UI | MIT; [React](https://github.com/facebook/react) |
| Vite 8.2.2 | Dev/build tooling | MIT; [Vite](https://github.com/vitejs/vite) |
| TypeScript 7.0.2 | Typechecking | Apache-2.0; [TypeScript](https://github.com/microsoft/TypeScript) |
| ATS SDK 8.0.0 | Real root import; wallet/VC/chain integration pending | Apache-2.0; [ATS](https://github.com/hashgraph/asset-tokenization-studio) |
| @hiero-ledger/proto 2.25.0 | Supplies wallet-connect's missing runtime import | Apache-2.0; [Hiero SDK repository](https://github.com/hiero-ledger/hiero-sdk-js) |
| @hashgraph/proto 2.18.5 / @hashgraph/sdk 2.64.5 / @hiero-ledger/sdk 2.79.0 | Existing transitive parents; public proto compatibility and decoder diagnostic | Apache-2.0; [Hiero SDK repository](https://github.com/hiero-ledger/hiero-sdk-js), exact versions in lockfile |
| protobufjs 7.2.5 / 7.5.4 / 7.6.6; rejected candidates 7.6.5 and 7.6.6 | Runtime baseline and bounded trials; no upstream source copied or regenerated | BSD-3-Clause; [protobuf.js](https://github.com/protobufjs/protobuf.js), [7.6.6 source](https://github.com/protobufjs/protobuf.js/tree/protobufjs-v7.6.6) |
| protobufjs-cli 1.3.3 | Installed/audited for the bounded rebuild trial; removed from project dependencies before generation or candidate browser build | BSD-3-Clause; [CLI source](https://github.com/protobufjs/protobuf.js/tree/protobufjs-cli-v1.3.3/cli); exact temporary closure and declared licenses in [compiler lock](evidence/007-t01a-protobuf-rebuild-compiler-lock.json) |
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
