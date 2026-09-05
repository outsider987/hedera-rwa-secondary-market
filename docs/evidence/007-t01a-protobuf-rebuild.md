# T01a bounded decoder rebuild trial — 2026-09-05

**FAILED at the npm dependency-tree gate; dependencies restored. Decoder
regeneration did not run.** This does not establish whether the proposed
compiler would produce a compatible, safe SDK artifact. B1/B2 remain blocked;
T01b is inactive. No MetaMask action is needed.

Clean base: `b5640298d0839640d444135da1180f0d5461bd11`, diagnostic branch.
[User acceptance and scope](../prompts/009-t01a-protobuf-rebuild.md) superseded
only the earlier no-regeneration restriction for the two original schemas.
The installation-conflict stop condition remained effective.

## Findings

- The installed `@hashgraph/proto 2.18.5` contains 166 original `.proto` files;
  `@hiero-ledger/proto 2.25.0` contains 174. Their complete relative path/hash
  inventories, published tarball integrity and build references are in the
  [source inventory](007-t01a-protobuf-rebuild-source-inventory.json).
- Upstream build commands use a named `hashgraph` root, `static-module`, ES6,
  `--force-long`, `--no-beautify`, `--no-convert`, `--no-delimited`, and
  `--no-verify`, followed by Babel for CommonJS. The source references are
  [SDK 2.64.5's task](https://github.com/hiero-ledger/hiero-sdk-js/blob/ce932c0ee3c13b22a18ed3a137b22ea56b0e57a1/packages/proto/Taskfile.yml)
  and [SDK 2.79.0's task](https://github.com/hiero-ledger/hiero-sdk-js/blob/0f0f23dc90a4d7cab67aa56bece38ecc1c135a06/packages/proto/Taskfile.yml).
  These commands were inspected, not executed; no schema was fetched from a
  newer release or changed.
- The isolated exact `protobufjs-cli 1.3.3` + `protobufjs 7.6.6` graph installed
  with scripts ignored and has zero audit findings. Its
  [full lock](007-t01a-protobuf-rebuild-compiler-lock.json) and
  [full audit](007-t01a-protobuf-rebuild-compiler-audit.json) preserve this result.
- The application trial added those exact development dependencies and used
  the four accepted version-qualified parent/child overrides. `npm install
  --package-lock-only --ignore-scripts --no-audit` and `npm ci` exited 0.
  Inspection showed two old Hashgraph copies still present. A targeted
  `npm update protobufjs --package-lock-only --ignore-scripts --no-audit`
  also exited 0 and left the lock byte-for-byte unchanged.
- **`npm ls protobufjs --all --json` exited 1 (`ELSPROBLEMS`)**: both
  `@hashgraph/sdk/node_modules/protobufjs` and
  `@hashgraph/proto/node_modules/protobufjs` remained **7.2.5**, invalid against
  their effective **7.6.6** requirement. Both Hiero parents resolved 7.6.6.
  gRPC's 7.6.6 was deduplicated to the root and had no invalid marker.
  [Complete tree result](007-t01a-protobuf-rebuild-tree-conflict.json).
- This full-graph result limits the earlier eight pure matcher assertions:
  matching a rule does not prove npm will rewrite an existing lock/tree.
  Installed npm 11.17.0 Arborist's virtual tree also reported both Hashgraph
  edges as raw `7.2.5`, effective `7.6.6`, resolved `7.2.5`, `INVALID`.
  A root cause within npm's lock/tree handling has not been established.
  No npm upgrade, broad override, lock deletion or manual lock patch was tried.
- The trial stopped at that gate. A draft local generator was removed without
  execution. Both generated `src/proto.js` and `lib/proto.js` files remained
  unchanged. Candidate decoder, project-build and browser acceptance were
  **not run**; there is no candidate bundle or claim that rebuilding succeeded.

## Audit and lock accounting

| Graph | Entries / affected locations | Low / moderate / high / critical |
| --- | --- | --- |
| Before | 83 / 104 | 22 / 32 / 27 / 2 |
| Rejected candidate | 82 / 102 | 22 / 32 / 26 / 2 |
| Restored | 83 / 104 | 22 / 32 / 27 / 2 |

Full audits: [before](007-t01a-protobuf-rebuild-before-audit.json),
[candidate](007-t01a-protobuf-rebuild-candidate-audit.json),
[restored](007-t01a-protobuf-rebuild-restored-audit.json).
All entries and affected paths were compared. No new advisory ID appeared.
The candidate removed the Hiero proto aggregate entry and one vulnerable
protobufjs location; both old Hashgraph locations and protobufjs's critical
finding remained. Other package/advisory exposure was not waived.
The before graph matches the prior 005 restored audit in severity, affected
paths and advisory sources/ranges. Audit aggregate metadata is not a decoder test.

The [54 changed lock records](007-t01a-protobuf-rebuild-lock-changes.json) were
fully accounted for: root development dependencies; compiler closure additions
and metadata flags; root runtime 7.5.4 → 7.6.6; removal of gRPC's redundant 7.6.6
location. No unrelated existing package version changed. The two vulnerable
Hashgraph records did not change. The
[rejected patch](007-t01a-protobuf-rebuild-rejected.patch) preserves exact package
and lock edits; it is diagnostic material, not an approved retained repair.

## Offline checks and restored verification

The [single Node test](007-t01a-protobuf-rebuild.test.mjs) extends the preserved
005 diagnostic with public namespace/API snapshots, recursive ThresholdKey
siblings and nested/top-level declared-length overruns. It retains the 16
synthetic wire/64-bit fixtures, truncation, unknown-group and Key/KeyList cases,
and option EOF input. Each probe runs in a separate child with a 5-second
SIGKILL timeout and 128 MiB heap cap; timeout, stack overflow and acceptance of
excessive depth all fail. Only whitelisted synthetic data/classifications are
recorded. Public namespace snapshots record 777 / 926 entries; they are not a
claim of complete ATS API compatibility or every schema field being exercised.

[Before](007-t01a-protobuf-rebuild-before-tests.json) and
[restored](007-t01a-protobuf-rebuild-restored-tests.json): **17 passed / 17 failed**,
exit 1 as required for the unsafe original dependencies. Wire fixtures and API
snapshots match after rollback. Both original decoders accept 128 Key/KeyList
or ThresholdKey nesting pairs and overflow at 8192; they also accept both
length-overrun fixtures. No unsafe outcome is counted as a pass.

After byte-for-byte restoration, `npm ci`, the six existing npm tests,
typecheck, build and `npm ls protobufjs --all --json` passed. The separate
security gate remains red. The [restored browser result](007-t01a-protobuf-rebuild-restored-browser.json)
passes dev/preview × desktop/mobile real SDK loading, duplicate-operation,
reload, keyboard/focus and overflow checks, with zero wallet access, outbound
attempts, page errors or console errors. It checks import/export presence only,
not wallet/VC/chain behavior. The [restored bundle inventory](007-t01a-protobuf-rebuild-restored-bundle.json)
contains the same 352 rendered package locations and identical emitted asset
hashes as [005 restored](005-t01a-protobuf-restored-bundle.json), which also
provides the unchanged pre-trial bundle baseline. No candidate bundle was built.
Existing large-chunk, vm-browserify eval, deprecation, pending-script and
experimental test-mock warnings remain; no script was approved.

[Verification summary and hashes](007-t01a-protobuf-rebuild-verification.json)
record the actual command outcomes and rollback invariants.
Record validation covered all 22 allowed changed/new files, 69 local links and
anchors, JSON parsing and Git whitespace checks. Dev/preview servers were stopped
after validation. Historical evidence was preserved and no project compiler or
override remains installed/configured after rollback.

## Reproduction

From this diagnostic commit, use a disposable checkout; do not apply the
rejected patch to ongoing work:

```sh
git worktree add --detach /tmp/holdbook-t01a007-repro HEAD
cd /tmp/holdbook-t01a007-repro
git apply docs/evidence/007-t01a-protobuf-rebuild-rejected.patch
npm ci
npm ls protobufjs --all --json
```

The last command is expected to exit 1 with the two invalid 7.2.5 locations.
Node 24.19.0/npm 11.17.0 are required. The patch includes the exact rejected lock;
it does not regenerate decoders. Keep dependency scripts subject to the existing
approval policy; do not run `npm approve-scripts`.

On the restored graph, rerun the offline diagnostic with a new output filename:

```sh
node docs/evidence/007-t01a-protobuf-rebuild.test.mjs --record /tmp/t01a007-new-tests.json
```

Exit 1 is expected. Existing evidence is never overwritten. To reproduce the
isolated compiler audit, copy its saved lock as `package-lock.json` into an empty
scratch directory and create `package.json` with the lock's root name/version,
`private: true`, and exactly `protobufjs: "7.6.6"`, `protobufjs-cli: "1.3.3"`
under `dependencies`; run `npm ci --ignore-scripts` then `npm audit --json` there.
Audit results may change as advisories evolve; the committed reports are dated.

## Mentor / next decision

1. What npm-11.17.0-compatible, reproducible lock strategy makes both Hashgraph
   paths resolve 7.6.6 under these bounded rules? Any alternative must preserve
   all unrelated versions and pass a real clean install/tree gate.
2. Once that gate works, can maintainers supply or review patched static
   artifacts generated from these exact schemas and build flags? The proposed
   compiler still needs actual public-entry, recursive sibling, length-boundary
   and browser verification; its clean audit alone is insufficient.
3. Terminal3's optional native BBS/tar and remaining Fireblocks/elliptic risks
   still require separate supported decisions. No local absence or zero browser
   membership resolves another platform's installation risk.

No mentor message, wallet/chain request, VC signature, push, deployment, PR
merge, script approval, upstream-source vendoring or human review is claimed.
