# T01a bounded decoder rebuild decision — 2026-09-05

User, verbatim: **「好」** after the upstream research recommended a bounded
rebuild of the two pinned proto packages from their original schemas, using
protobufjs-cli 1.3.3 and protobufjs 7.6.6, with version-qualified child overrides.
This accepts that concrete trial and supersedes the previous no-regeneration
restriction only for these two packages. No further confirmation was requested.

Base: `b5640298d0839640d444135da1180f0d5461bd11`, clean diagnostic branch.
The documented base `fbe9b9f` is verified as an ancestor. Keep ATS 8.0.0,
both SDK/proto parent versions, original published schemas, framework/runtime
pins, application interface and transaction evidence unchanged.

Implementation scope: `package.json`, `package-lock.json`, one reproducible
Node rebuild script if the compiler/dependency gate passes, the existing browser
harness only if necessary, and a Node built-in diagnostic under
`docs/evidence/007-t01a-protobuf-rebuild*`. Record new evidence under that prefix;
do not overwrite historical results. Update this prompt, HANDOFF, the plan's
authorization, ATTRIBUTION and one AI_USAGE entry/index with the work.

First inspect the original published schema/build flags and audit the exact
compiler/runtime graph. Use only the four previously approved parent selectors,
now with old protobufjs child versions qualified; gRPC 7.6.6 cannot be downgraded.
Rebuild all generated message types from each unchanged schema, not just Key.
No manual upstream source patch, schema edits, SDK upgrades, new framework,
third-party install-script approval, wallet/chain action or T01b.

Require reproducible clean installation, full audit/lock/bundle review, public
proto API and synthetic wire/64-bit compatibility, bounded child-process checks
for malformed input, declared lengths and recursive siblings, plus npm
ci/test/typecheck/build and isolated dev/preview × desktop/mobile loading.
Installation conflict, incompatibility, security failure or a newly introduced
uncovered advisory stops the trial: restore this round's dependency/code changes
and commit diagnostics/questions. Pass retains the reproducible repair, but
Terminal3/tar and other remaining gates still block T01a. Commit records with
the outcome; no automatic push, merge, mentor message or MetaMask action.
