# T01a protobuf repair research — 2026-09-05

**A complete runtime-only repair was not found. Fix the static decoders and
the override selection separately.** No dependency/application change was made.
Base: clean `fbe9b9f3ca4d5982049c4ddec0fdb7b1606d644e`; previous handoff base
`ecf219c` is an ancestor. T01a remains blocked; T01b is inactive.

## What upstream evidence establishes

The [protobufjs recursion advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-685m-2w69-288q)
covers both unknown-group skipping and generated nested-message decoding.
Its first fixes are runtime 7.5.6 / 8.0.2; later advisories require newer
versions. That does not imply previously generated static code is rewritten.
The [7.6.6 decoder generator](https://github.com/protobufjs/protobuf.js/blob/protobufjs-v7.6.6/src/decoder.js)
emits a depth check and forwards depth into child decodes. The
[CLI 1.3.3 static target](https://github.com/protobufjs/protobuf.js/blob/protobufjs-cli-v1.3.3/cli/targets/static.js)
calls the runtime's decoder generator. Therefore rebuilding the original schema
with compatible patched compiler/runtime versions is the relevant repair path.
This conclusion follows from source, plus the earlier failed runtime-only trial;
no decoder was regenerated in this research.

[protobufjs 7.6.6](https://github.com/protobufjs/protobuf.js/releases/tag/protobufjs-v7.6.6)
was released August 27. Its [backport](https://github.com/protobufjs/protobuf.js/pull/2422)
also includes [Any.fromObject depth](https://github.com/protobufjs/protobuf.js/pull/2419)
and [declared-length decoding](https://github.com/protobufjs/protobuf.js/pull/2420)
fixes. For a future rebuild trial, **protobufjs-cli 1.3.3 + protobufjs 7.6.6**
is a concrete 7.x-compatible tooling candidate: the published CLI declares
`protobufjs: ^7.6.2`. It is not an ATS compatibility certification, a full audit
of the compiler's dependencies, or authorization to replace the earlier 7.6.5
trial. Both build tooling and runtime need review before that experiment.

## Published upgrades checked

Fresh npm registry metadata and selected exact tarball source were inspected.
[Public evidence](006-t01a-protobuf-research.json) records versions, dependency
declarations, publication times, source hashes and SHA-512 integrity verification.

| Package | Published version checked | Relevant finding |
| --- | --- | --- |
| ATS SDK | latest 8.0.0 | Still pins @hashgraph/sdk 2.64.5; no newer published ATS release found |
| @hashgraph/sdk | latest 2.81.0 | Declares protobufjs 8.0.0; changing to latest is not a proven security repair |
| @hashgraph/proto | latest stable 2.25.0 | Peer protobufjs 7.5.4; build CLI 1.0.2 |
| @hiero-ledger/sdk | latest 2.87.0 | Declares protobufjs 8.6.6 and proto 2.31.0 |
| @hiero-ledger/proto | latest 2.31.0 | Peer protobufjs 8.0.1; build CLI 2.0.1; published Key/KeyList lack depth checks |
| protobufjs | latest-7 7.6.6; latest 8.8.0 | A newer runtime alone does not update static decoders |

Sources: [ATS package](https://registry.npmjs.org/@hashgraph%2Fasset-tokenization-sdk),
[Hashgraph SDK](https://registry.npmjs.org/@hashgraph%2Fsdk),
[Hashgraph proto](https://registry.npmjs.org/@hashgraph%2Fproto),
[Hiero SDK](https://registry.npmjs.org/@hiero-ledger%2Fsdk),
[Hiero proto](https://registry.npmjs.org/@hiero-ledger%2Fproto),
[protobufjs](https://registry.npmjs.org/protobufjs),
[CLI 1.3.3](https://registry.npmjs.org/protobufjs-cli/1.3.3).

The integrity-verified
[proto 2.31.0 tarball](https://registry.npmjs.org/@hiero-ledger/proto/-/proto-2.31.0.tgz)
contains `Key.decode(r,l,e)` and `KeyList.decode(r,l,e)` with neither a depth
check nor depth forwarding in their complete function bodies. Only the named
`package/lib/proto.js` member was read; no installation or execution occurred.
That is a source finding, not a newly executed exploit or runtime result.
It rules out recommending this package solely because it is newer.
Hiero SDK [2.87.0 release notes](https://github.com/hiero-ledger/hiero-sdk-js/releases/tag/v2.87.0)
also list removed APIs, so replacing ATS's exact SDK pin requires compatibility
work beyond protobuf. No such upgrade was made.

## gRPC conflict: narrower selectors are a candidate

The prior override matched every protobufjs descendant of a selected parent.
[npm's documented semantics](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides)
and [npm 11.17.0 Arborist source](https://github.com/npm/cli/blob/v11.17.0/workspaces/arborist/lib/override-set.js)
explain why it also affected gRPC. Version-qualify the **child** selector, not
only the parent. An illustrative next-trial configuration is:

```json
{
  "overrides": {
    "@hashgraph/sdk@2.64.5": { "protobufjs@7.2.5": "7.6.5" },
    "@hashgraph/proto@2.18.5": { "protobufjs@7.2.5": "7.6.5" },
    "@hiero-ledger/sdk@2.79.0": { "protobufjs@7.5.4": "7.6.5" },
    "@hiero-ledger/proto@2.25.0": { "protobufjs@7.5.4": "7.6.5" }
  }
}
```

This snippet deliberately retains the old trial's candidate to isolate the
selection issue. It has **not** been applied and is **not** a complete repair.
Arborist matches the originally declared dependency range by intersection:
the exact old pins match these selectors, while gRPC 0.8.1's `^7.5.5` matches
neither. Eight pure rule-selection assertions against installed npm 11.17.0
passed; results are in the JSON. This checks matching only, not deduplication,
peer resolution, npm ci or a complete npm ls graph. A broad `^7.2.5` dependency
can still intersect either selector; this is not an exact installed-version
filter. Whole-graph acceptance remains mandatory.

## Recommended next decision

1. Prefer an upstream-supported rebuild/backport of **both original proto
   schemas**, preserving their APIs, exports and wire fields, with a patched
   compatible generator/runtime. Ask the maintainers which artifact ATS 8.0.0
   supports; the checked published versions do not establish one.
2. If a local experiment is desired before an upstream release, define a
   separate, bounded regeneration/patch scope for the two proto packages and
   the matching runtime. Preserve exact schema revisions, build flags, Long
   handling and upstream notices; do not hand-edit only Key and leave sibling
   recursive decoders unprotected. Current rules forbid this source change;
   the research request does not override them.
3. Include narrower dependency selectors in that same complete experiment.
   Reuse the existing public-entry compatibility/depth tests, add declared-length
   boundary coverage for the selected generator, and require clean npm ci/ls,
   complete audit/lock/bundle comparison and all isolated browser checks.
   Compiler success or an empty protobuf audit entry is not the acceptance gate.

Merely setting Reader.recursionLimit cannot repair a function that never reads
it. Increasing stack size also fails the depth-rejection requirement. The
advisory lists boundary rejection/process isolation as possible mitigations;
neither establishes a fix for the SDK's internal decode paths here. No mitigation
was substituted for the agreed rejection checks.

Terminal3 is separate: registry latest verify_vc 0.0.39 still depends on bbs_vc
0.2.37, which still declares `@mattrglobal/bbs-signatures: ^1.3.1`; the old BBS
dependency family is not removed by merely choosing the latest verifier.
The inspected BBS 2.0.0 manifest has no optional native dependency, but it is
outside that declared major range and is not a validated Terminal3 replacement.
No VC verification or tar risk is waived by this research.

## Checks / scope

User request: [research instruction](../prompts/008-t01a-protobuf-research.md).
Read-only registry/source inspection, tarball integrity checks, exact Key/KeyList
body inspection and eight pure npm matching assertions were performed. npm ci,
project tests, browser checks and audit were not repeated because no application,
dependency or runtime code changed; their prior results remain historical.
Git scope, local links and unchanged manifest/lock/asset-rule checks apply to
this documentation commit: seven record files, 45 local links/anchors checked;
AGENTS, plan, manifest and lock bytes unchanged; git diff --check passed.
No upstream code or tarball is vendored in Git.

The ATS project's [security contact policy](https://github.com/hashgraph/asset-tokenization-studio/security)
provides a private reporting route. No email, GitHub issue, mentor message, push
or PR update was sent. The existing evidence packet can support that discussion;
this research does not claim maintainers accepted a fix or confirmed exploitability.
