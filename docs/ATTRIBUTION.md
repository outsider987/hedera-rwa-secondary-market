# Third-party sources / attribution

Current uses recorded through source commit `09d8d3b`, plus the documentation
navigation work. Dated AI/human contributions are indexed in [AI_USAGE.md](../AI_USAGE.md).
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

No logos, stock images, starter application or unseen pre-event master-plan
file were copied into this repository. The user-supplied plan and actual
prompts are disclosed in [the planning record](prompts/001-planning-record.md).
The mentioned pre-event draft was not supplied or inspected; Victor must resolve
any project-specific eligibility question with organizers. The former shared
source table remains verbatim in [the historical archive](ai-usage/000-t00.md#third-party-sources).
