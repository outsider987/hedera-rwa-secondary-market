# T01a: npm override resolution — September 6, 2026

**The npm resolution failure is explained and an isolated workaround passes. B1 is still open: the unchanged generated decoders fail 12 security checks.** The working application's dependencies and source remain unchanged.

npm 11.17.0's hoisted placement selects the root `protobufjs 7.6.6` with KEEP. Its pruning step refuses to replace the nested Hashgraph `7.2.5` copies because their override sets differ and protobufjs has dependencies. Thus valid replacement edges coexist with invalid shadowing copies. The offline fixture reproduces this using npm's own [placement](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/place-dep.js#L200-L220) and [replacement/pruning logic](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/node.js#L1045-L1160); this is a local diagnosis, not an upstream-confirmed report.

With the previous four qualified overrides and compiler/runtime pins in a disposable copy, this single targeted command fixes the graph:

```sh
npm update protobufjs --package-lock-only --ignore-scripts --no-audit --install-strategy=nested
```

The command uses npm's [documented nested strategy](https://docs.npmjs.com/cli/v11/commands/npm-update/#install-strategy), without changing permanent npm configuration. The final graph resolves all four parents and gRPC to `7.6.6`; it does not retain extra nested protobuf copies. No app lock deletion, manual lock repair, broad override or SDK/npm upgrade was used.

| Check | Actual result |
| --- | --- |
| TDD resolution gate | Hoisted full graph: 2 passed / 1 failed; nested candidate: 3 passed / 0 failed |
| Clean install / targeted npm ls | Passed with scripts disabled; a subsequent normal lock-only install left the lock identical |
| Lock review | 57 changed records: 42 compiler-closure additions, 4 removals, 10 metadata changes, 1 runtime version change; no unrelated existing version changed |
| Existing decoder diagnostic | Baseline 17 passed / 17 failed; candidate 22 passed / **12 failed**. Runtime version gate passed; static recursion and length guards still fail |
| Audit | 83 → 80 aggregate findings (candidate: 23 low, 32 moderate, 24 high, 1 critical); no new advisory source IDs. Audit does not inspect static decoder safety |
| Application regression | 50 tests, typecheck and build passed in the isolated candidate; 4 dev/preview desktop/mobile smoke checks, no external requests; all emitted assets identical to the existing build |

## Reproduce / next boundary

Run `node --test docs/evidence/013-t01a-npm-resolution.test.mjs` for the offline fixture. `RESOLUTION_GATE=hoisted` intentionally fails the desired placement gate. To reproduce the full graph, copy the public app manifest/lock to a scratch directory, use `candidateManifest` from the [structured record](013-t01a-npm-resolution.json), run lock-only install, the targeted command above, then `npm ci --ignore-scripts` and `npm ls protobufjs --all`. Set `RESOLUTION_PROJECT` to that directory to run the full graph test. The record contains complete lock deltas, audits, decoder observations, hashes and browser checks.

Next proposed ticket: rebuild both pinned proto packages from their original schemas with the previously reviewed compiler, require all decoder/security/API checks to pass, then test official-entry browser loading. This diagnosis does not activate regeneration or waive B2/SDK/VC gates. No wallet or chain operation occurred. [Prompt](../prompts/015-t01a-npm-resolution.md) · [AI work record](../ai-usage/019-t01a-npm-resolution.md).
