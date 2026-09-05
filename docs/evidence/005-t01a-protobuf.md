# T01a protobufjs trial — 2026-09-05

**FAILED; dependency changes rolled back. B1 and T01a remain BLOCKED.**
protobufjs 7.6.5 fixes the tested unknown-group and option-parser paths, but
both pinned proto packages still accept deeply nested known messages and
overflow the stack. The four ancestor overrides also leave an invalid gRPC
dependency edge in `npm ls`, despite a successful installation. No further
override, decoder regeneration, SDK upgrade, waiver or T01b was attempted.

Base: clean `diagnostic/t01a-sdk-load` at
`ecf219c4690072757da8d165e3af36903cc43ee9`.
The previous handoff base `09d8d3b` is an ancestor, not the handoff's own commit.
[Effective user instruction](../prompts/007-t01a-protobuf-trial.md).

## Decisive runtime results

The [single Node built-in test file](005-t01a-protobuf.test.mjs) imports each
proto's **public package entry** in a separate process. It never imports the
SDK, constructs a signer, reads a wallet, loads a schema file or contacts a
service. All values and bytes are synthetic. Each child has a 5,000 ms timeout,
SIGKILL on timeout, a 128 MiB old-space limit and a 64 KiB output cap. Evidence
contains only explicit classifications and synthetic fixture fields, not raw
errors, stacks, SDK objects or signatures.

| Probe (each proto unless stated) | Baseline | Candidate 7.6.5 |
| --- | --- | --- |
| 8 AccountID / ContractID / Timestamp / Key fixtures | Pass | Pass, identical bytes and decoded fields |
| Truncated varint, bytes, nested message | Rejected | Rejected |
| 4 unknown groups / 4 Key–KeyList pairs (positive controls) | Accepted | Accepted |
| 128 / 8192 unknown groups | Accepted (FAIL) | Explicit depth rejection |
| 128 Key–KeyList pairs, 708 bytes | Accepted (FAIL) | Accepted (FAIL) |
| 8192 Key–KeyList pairs, 59,994 bytes | Stack overflow (FAIL) | Stack overflow (FAIL) |
| Unterminated option, Hashgraph runtime | Rejected | Rejected |
| Unterminated option, Hiero runtime | 5-second timeout (FAIL) | Rejected |

Each Key–KeyList pair adds two known-message edges. Group and Key inputs are
built iteratively, so the deep-input failures occur in decoding, not recursive
fixture construction. Successful acceptance of excess depth, a timeout, stack
overflow, child crash or unexpected error is never classified as a safe reject.

The eight compatibility fixtures include numeric/alias AccountID,
numeric/EVM ContractID, large/negative Timestamp, ed25519 Key and a shallow
KeyList. An independent BigInt varint oracle checks expected bytes; decoded
Long values are compared as strings, including `9007199254740993`,
`9223372036854775807` and `-9223372036854775808`. These are serialization checks,
not claims that extreme timestamps are valid Hedera transactions. The two
packages each pass all eight fixtures, including re-encoding decoded bytes.

[Baseline](005-t01a-protobuf-before-tests.json): 22 cases, 13 pass / 9 fail.
[Candidate](005-t01a-protobuf-candidate-tests.json): 22 cases, 18 pass / 4 fail,
plus a passing installed-version check (23 Node tests, 19 pass / 4 fail).
Both commands exit 1. The candidate reports runtime recursion limit 100, yet
its Key tests still fail. Proto source hashes are identical before/after.

This confirms the limitation anticipated by the
[upstream recursion advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-685m-2w69-288q):
the reader and generated known-message decoder are separate paths. The
[7.6.5 decoder generator](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.5/src/decoder.js)
adds a depth argument/check to newly generated decoding functions. The pinned
packages ship older static Key/KeyList functions; replacing their imported
runtime does not regenerate them. The user-linked
[7.6.6 generator](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.6/src/decoder.js)
also contains depth propagation. Neither generator was run or copied.
This is an offline decoder failure, not a demonstrated remote exploit in HoldBook.

The initial option fixture stopped inside an unmatched parenthesis and rejected
before reaching the vulnerable loop. Its [initial results](005-t01a-protobuf-before-tests-initial.json)
are retained. Reading parseOption led to the corrected EOF fixture
`syntax = "proto3"; option unfinished`, which reproduces the 7.5.4 timeout and
7.6.5 rejection described by the
[option parsing advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-j3f2-48v5-ccww).
No claim about that fix depends on the initial fixture.

## Dependency trial and rollback

Only the four approved version-qualified ancestor overrides were tried; the
exact rejected change is retained as a [patch](005-t01a-protobuf-candidate.patch).
No override remains in package.json. Both manifest and lockfile were restored
byte-for-byte from the start snapshot, then reinstalled with npm ci.

| Parent (unchanged) | Baseline runtime | Candidate runtime resolution |
| --- | --- | --- |
| @hashgraph/sdk 2.64.5 | nested 7.2.5 | root 7.6.5 |
| @hashgraph/proto 2.18.5 | nested 7.2.5 | root 7.6.5 |
| @hiero-ledger/sdk 2.79.0 | root 7.5.4 | root 7.6.5 |
| @hiero-ledger/proto 2.25.0 | root 7.5.4 (peer) | root 7.6.5 |
| @grpc/proto-loader 0.8.1 | nested 7.6.6 | unchanged nested 7.6.6 |

The [complete lock diff](005-t01a-protobuf-lock-changes.json) has five locations:
two old protobuf copies deduplicated, root runtime updated, unused
`@protobufjs/inquire` removed because the candidate no longer declares it, and
the nested long 5.3.2 peer flag removed without changing its version/integrity.
No other installed dependency version changed; all application/runtime pins and
the complete gRPC 7.6.6 lock entry remained identical. An initial local assertion
assumed three in-place replacements and was too narrow; the complete comparison
identified and checked these five explained changes without another graph edit.

`npm ci` succeeded on the candidate (1239 installed / 1240 audited), but
`npm ls protobufjs --all --json` exited 1 with `ELSPROBLEMS`.
The [whitelisted tree diagnostic](005-t01a-protobuf-tree-conflict.json) identifies
`@grpc/proto-loader@0.8.1`'s 7.6.6 copy as invalid against inherited override
7.6.5; its actual declared range is `^7.5.5`. npm documents that a nested
override applies to descendants at any depth, rather than only immediate edges.
[npm override semantics](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).
Preserving the bytes of 7.6.6 therefore did not yield a valid overridden tree.
No extra descendant exemption or gRPC downgrade was attempted. When this
conflict was observed, the already-running browser check and bounded offline
diagnosis were collected, then the candidate was rolled back; no further repair
iteration occurred.

Lock SHA-256: baseline/restored
`02230cb1fc129226e28f1e8fc0be6999d2106907818a84629255d86c033a6203`;
rejected candidate
`b58048e0de6bcbc6c653c455a3c1daff354e30d62552e9e02a2c5f6ccbb36876`.
Restored package.json SHA-256:
`b0aa4267b37fc777c250a8cf6210e0941cb5dd5de0f67c67fda7cc9b1c5e2d51`.

## Audit and browser evidence

Full public npm audit reports, including every advisory/aggregate entry,
range, location, severity and fix suggestion:
[before](005-t01a-protobuf-before-audit.json),
[candidate](005-t01a-protobuf-candidate-audit.json),
[restored](005-t01a-protobuf-restored-audit.json).
All audit commands exit 1; suggested force/parent fixes were not executed.

| Graph | Low | Moderate | High | Critical | Total entries | Locations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Before | 22 | 32 | 27 | 2 | 83 | 104 |
| Rejected candidate | 23 | 32 | 24 | 1 | 80 | 99 |
| Restored | 22 | 32 | 27 | 2 | 83 | 104 |

No new advisory ID appeared. protobufjs and the two proto aggregate entries
disappeared; @hashgraph/sdk moved from high to low, retaining its ethers path.
The candidate covers all twelve protobufjs advisory ranges in this audit, whose
highest affected 7.x version is 7.6.4. The disappearance of the audit entry did
not detect the stale generated decoder failure. After rollback B1's original
runtime versions and the remaining Terminal3/tar risks are again present.
The restored report has identical advisories, ranges, severities, affected
locations and counts. An exact whole-report comparison initially failed:
three advisory-aggregation/recommended-fix fields differ across audit runs;
the [complete differences](005-t01a-protobuf-restored-audit-differences.json)
are preserved. They are not lockfile changes or new advisories, and no suggested
fix was executed.

[Before bundle](005-t01a-protobuf-before-bundle.json) and
[candidate bundle](005-t01a-protobuf-candidate-bundle.json) contain complete
package membership for every emitted lazy chunk, plus per-audit-path counts.
The metric is Vite generateBundle `renderedLength > 0`, not execution or
exploitability. An evidence-only build reproduced all asset hashes of the
preceding npm run build before browser testing.

| Bundle metric | Before | Rejected candidate |
| --- | ---: | ---: |
| Rendered package paths | 352 | 351 |
| All JS bytes | 15,738,454 | 15,735,014 |
| Main SDK chunk bytes / gzip | 8,759,902 / 1,643,345 | 8,745,399 / 1,640,686 |
| Provider chunk bytes / gzip | 2,512,611 / 578,595 | 2,523,674 / 578,799 |
| Rendered protobuf runtime | 7.2.5 and 7.5.4 | 7.6.5 |

The [browser harness](002-t01a-browser.mjs) now requires a new output filename,
records actual Git HEAD and lock hash, and uses exclusive creation to protect
historical JSON. Application code/UI, adapters and transaction evidence are
unchanged. Fresh Chrome contexts with no wallet profile block external HTTP and
WebSocket traffic and trap provider access. All four scenarios passed both
[before](005-t01a-protobuf-before-browser.json) and
[with the candidate](005-t01a-protobuf-candidate-browser.json): dev/valid preview
× desktop/mobile, real SDK import and Management export presence, manual
idle/loading/loaded/reload states, duplicate prevention, keyboard/focus, no
overflow, zero wallet accesses/outbound attempts/page errors/console errors.
This does not call Management or prove wallet/config/VC APIs ready. Baseline
dev-desktop and preview-mobile screenshots were visually inspected; screenshots
are ignored local artifacts, not persistent evidence or new product images.

## Completed verification / final state

| Check | Baseline | Candidate | Restored |
| --- | --- | --- | --- |
| npm ci | Exit 0; 1242 installed | Exit 0; 1239 installed | Exit 0; 1242 installed |
| npm test (existing project regression) | 6 passed | 6 passed | 6 passed |
| npm run typecheck / npm run build | Both exit 0 | Both exit 0 | Both exit 0 |
| Explicit protobuf diagnostic | Exit 1; 13/22 pass | Exit 1; 19/23 pass | Exit 1; 13/22 pass |
| npm ls protobufjs --all --json | Not separately run | Exit 1; inherited override conflict | Exit 0; no problems |
| Isolated dev/preview × desktop/mobile | 4 passed | 4 passed | 4 passed |
| Provider accesses / outbound attempts | 0 / 0 | 0 / 0 | 0 / 0 |

[Restored decoder results](005-t01a-protobuf-restored-tests.json) reproduce every
baseline outcome and fixture. [Restored bundle](005-t01a-protobuf-restored-bundle.json)
asset hashes exactly match the baseline. [Restored browser results](005-t01a-protobuf-restored-browser.json)
again confirm manual real SDK import only. Dev and preview servers started for
this trial were stopped after verification. Local checks are complete; no
remote CI run or independent human/agent review is claimed for this commit.
Final scope checks verified unchanged package bytes/asset rules, preserved
historical evidence, 63 local links/anchors, matching evidence hashes and clean
application of the saved candidate patch; git diff --check passed.

Known warnings persist: large chunks, vm-browserify eval, package deprecations,
Node's experimental module mocks and unapproved install scripts (7 baseline /
5 candidate / 7 restored notices). No script approval was added. The native
Terminal3/tar branch is absent after final local ci, which does not remove its
lockfile/cross-platform risk. No source/lock changes remain outside the allowed
diagnostic script and records. Prior evidence and user files are preserved.

## Reproduction

From the restored checkout, with pinned Node 24.19.0 / npm 11.17.0:

```sh
mkdir -p .artifacts
npm ci
npm test
npm run typecheck
npm run build
node --test docs/evidence/005-t01a-protobuf.test.mjs
```

The final command **must currently fail**; it is a diagnostic security gate
outside the unchanged six-test npm regression suite. To capture a new result
without overwriting history:

```sh
node docs/evidence/005-t01a-protobuf.test.mjs --record .artifacts/protobuf-recheck.json --compare docs/evidence/005-t01a-protobuf-before-tests.json
```

The rejected patch is for diagnosis, not a recommended repair. In an isolated
clean checkout, it can reproduce the exact candidate without updating the SDK:

```sh
git apply docs/evidence/005-t01a-protobuf-candidate.patch
npm ci
npm ls protobufjs --all
node docs/evidence/005-t01a-protobuf.test.mjs --candidate --record .artifacts/protobuf-candidate-recheck.json --compare docs/evidence/005-t01a-protobuf-before-tests.json
```

The last two commands are expected to fail. Restore the diagnostic checkout:

```sh
git apply -R docs/evidence/005-t01a-protobuf-candidate.patch
npm ci
```

Capture a fresh audit using `npm audit --json` (nonzero with vulnerabilities).
For browser verification run `npm run build` first, start `npm run dev -- --force`
and `npm run preview` in separate terminals, then:

```sh
node docs/evidence/002-t01a-browser.mjs /absolute/path/to/playwright/package.json .artifacts/protobuf-browser-recheck.json
```

Playwright 1.63.0 is external diagnostic tooling; the harness uses
`/usr/bin/google-chrome`. Do not use a persistent browser/wallet profile.

To regenerate the full rendered package inventory using the installed Vite
(a local evidence build, no configuration or package mutation):

```sh
node --input-type=module <<'NODE'
import { build } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
const lock = JSON.parse(readFileSync('package-lock.json')).packages;
await build({ plugins: [{ name: 'protobuf-membership-recheck',
  generateBundle(_options, bundle) {
    const packages = new Map();
    for (const item of Object.values(bundle)) {
      if (item.type !== 'chunk') continue;
      for (const [id, info] of Object.entries(item.modules)) {
        if (info.renderedLength === 0) continue;
        const start = id.indexOf('/node_modules/');
        if (start < 0) continue;
        const path = id.slice(start + 1).match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)/)?.[1];
        if (!path || !lock[path]) continue;
        const entry = packages.get(path) ?? { path, version: lock[path].version, renderedModules: 0, renderedBytes: 0 };
        entry.renderedModules++;
        entry.renderedBytes += info.renderedLength;
        packages.set(path, entry);
      }
    }
    writeFileSync('.artifacts/protobuf-membership-recheck.json',
      JSON.stringify([...packages.values()].sort((a, b) => a.path.localeCompare(b.path)), null, 2) + '\n', { flag: 'wx' });
  }
}] });
NODE
```

The historical capture also records per-chunk sizes/gzip, every asset SHA-256
and joins the complete audit's paths to these module counts. Its metric is the
same loop above, reused from the preceding trial's ignored local build tool.

## Mentor questions / boundary

1. Which upstream-supported proto/SDK release supplies static Key/KeyList
   decoders that actually enforce nesting limits, and is it supported with
   ATS 8.0.0? A runtime-only override is insufficient in both tested packages.
2. Is there an approved supported dependency change that preserves the gRPC
   7.6.6 branch and passes npm tree validation? The four ancestor overrides
   alone conflict; no additional override syntax was tried.
3. What supported resolution addresses Terminal3's optional native BBS/tar
   install risk and the remaining rendered axios/elliptic/VC risks? Their
   absence from some local paths cannot waive other-platform installation or
   future API use. These remain separate blockers even if B1 is later fixed.

These questions are prepared for Victor/mentor; no message was sent. No wallet,
RPC/Mirror/config query, signature, chain transaction, project-license decision,
eligibility determination or public deployment occurred. Main and the existing
draft PR remain untouched. Continue only T01a diagnostics or a separately
specified supported repair; T01b is inactive.
