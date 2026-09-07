# T01a: decoder regeneration — September 6, 2026

**The bounded B1 repair passes and is retained.** Clean installation now regenerates both pinned proto packages from their original schemas. T01 remains incomplete: SDK config integration, B2 and VC acceptance are still pending.

`postinstall` uses protobufjs-cli 1.3.3 / runtime 7.6.6, validates every published schema hash, and stages ES6/CommonJS output before replacement. SDK/proto parent versions and schemas are unchanged. Generated files stay in `node_modules`; `npm test` runs the compatibility/security gate.

| Check | Actual result |
| --- | --- |
| Red → green | Runtime-only: 12/34 probes fail. Final: 34/34 probes, version gate and new load-order regression pass (36 tests) |
| Compatibility | Exact public API retained: 777 Hashgraph / 926 Hiero entries; all 16 wire/64-bit fixtures match |
| Reproducibility | Two default clean installs and repeat generation succeed; all four generated hashes match |
| Application | 50 tests, typecheck and build pass; four dev/preview desktop/mobile smoke checks pass; emitted assets unchanged |
| Official SDK entry | Four isolated dev/preview desktop/mobile load checks pass; no wallet access, external requests or browser errors |
| Bundle review | Diagnostic bundle contains both regenerated decoders and runtime 7.6.6; 351 package locations fully inventoried. Main app remains at 16 locations, with no ATS/protobuf/Terminal3 modules |
| Lock / audit | 57 changed records, including 42 compiler-closure additions; no unrelated existing version changes. Audit: 83 → 80 (23 low, 32 moderate, 24 high, 1 critical), no new advisory source IDs |

Two implementation defects were caught before retention: recursive archive selection added 53 unintended public types; deduplicating the runtime merged the packages' private root registries. Matching the upstream entrypoints and using pbjs's per-package/version root names fixes both without weakening the API oracle. Relocated imports resolve only within the hash-verified archive. Generation flags follow the pinned [Hashgraph](https://github.com/hiero-ledger/hiero-sdk-js/blob/ce932c0ee3c13b22a18ed3a137b22ea56b0e57a1/packages/proto/Taskfile.yml) and [Hiero](https://github.com/hiero-ledger/hiero-sdk-js/blob/0f0f23dc90a4d7cab67aa56bece38ecc1c135a06/packages/proto/Taskfile.yml) Taskfiles; the historical shell expansion is an inference supported by exact API comparison.

Reproduce the retained gate with `npm ci`, `npm test`, `npm run typecheck`, `npm run build` and `npm ls protobufjs --all`. Do not skip root postinstall: runtime replacement alone fails the decoder tests. The [structured record](014-t01a-decoder-rebuild.json) contains synthetic outcomes, source/output hashes, complete lock/audit and bundle inventories, plus isolated browser reproduction instructions. Its API snapshots are represented by counts/hashes; the unchanged full oracle remains in evidence 007.

Limits: these are bounded synthetic checks and SDK import/export checks, not complete SDK/VC validation. Full `npm ls --all` still reports the existing TypeScript and optional Base peer incompatibilities. Third-party install-script approvals were not expanded. B2 remains open before VC or related installation changes; no wallet, signature, transaction or live chain request occurred. [Prompt](../prompts/016-t01a-decoder-rebuild.md) · [AI work record](../ai-usage/020-t01a-decoder-rebuild.md).
