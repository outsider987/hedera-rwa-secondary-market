# T01a protobufjs bounded trial — 2026-09-05

- User decision: implement the supplied prior-agent plan in a fresh context,
  allowing only four exact-parent protobufjs 7.6.5 overrides, with failure
  rollback. [Preserved scope](../prompts/007-t01a-protobuf-trial.md).
  Actual clean base: `ecf219c4690072757da8d165e3af36903cc43ee9`; previous
  handoff base `09d8d3b` was verified as an ancestor. No new human review inferred.
- Codex used Ponytail guidance, Node's built-in tests/child processes and the
  existing browser/build diagnostics. No other agent, mentor or external reviewer
  was consulted. Public upstream advisories, published proto source and npm
  override documentation informed the checks; [sources](../ATTRIBUTION.md).
- Implementation: a single offline diagnostic test under evidence; existing
  browser harness gains explicit exclusive output path plus actual HEAD/lock
  hash. Temporarily changed package.json/npm-generated lockfile only for the
  trial, then restored both byte-for-byte. No application, UI, adapter, SDK
  source, decoder generator, asset parameter or transaction evidence change.
- Candidate: all 16 synthetic serialization fixtures matched baseline, including
  Long precision beyond Number's safe range. Unknown-group depth and option EOF
  rejection passed. Both static Key/KeyList decoders still accepted 128 pairs
  and overflowed at 8192 pairs. The candidate diagnostic exited 1 (19 passing
  Node tests including version check, 4 failures); failures were not waived.
- Candidate npm ci succeeded, but npm ls reported inherited override conflict
  with preserved gRPC protobufjs 7.6.6. Collected the bounded offline diagnosis
  and already-running browser result, then rolled back; no repair iteration or
  descendant exception was attempted. Five lock changes were fully explained.
- The initial option fixture rejected too early; preserved its separate result
  and corrected it to reproduce the known 7.5.4 timeout. An initial graph
  assertion assumed three in-place updates; inspection showed deduplication,
  unused inquire removal and peer metadata changes. Neither was hidden as a
  successful initial check. Later test reporting also records candidate version
  gate status and reader limit; older snapshots are retained without rewriting.
- Verification and limits: [full trial evidence](../evidence/005-t01a-protobuf.md).
  Baseline/candidate/restored npm ci, six npm tests, typecheck, production build
  and four isolated browser scenarios passed. SDK checks inspect root export
  presence only. Zero provider access, external HTTP/WebSocket attempts and
  page/console errors. Baseline desktop dev/mobile preview screenshots inspected.
  Restored diagnostic reproduces baseline failures; restored npm ls passes.
  No remote CI run is claimed for this local commit.
- Audit: 83→80 entries / 104→99 locations on candidate, no added advisory IDs;
  removal of protobufjs audit entries did not detect static decoder failures.
  Restored graph returns to 83 / 104. B1, Terminal3/tar and remaining applicable
  risks continue to block T01a; T01b is inactive. Warnings remain documented.
  Exact audit comparison initially found three effects/fixAvailable differences;
  preserved them and verified that advisories/ranges/locations/counts match.
- Final affected files: `docs/evidence/002-t01a-browser.mjs`, the single
  `005-t01a-protobuf.test.mjs`, `docs/evidence/005-t01a-protobuf*` records/patch,
  `docs/prompts/007-t01a-protobuf-trial.md`, plan scope, HANDOFF, ATTRIBUTION,
  this work item and AI_USAGE index. Package files have no final diff.
- No secrets/profile/.env read, private-key signer, SDK API invocation, wallet
  action, RPC/Mirror call, VC signature or transaction. No messages sent to
  others, public deployment, push, PR update or merge. Main remains unchanged.
  Pre-event draft was not supplied/inspected; eligibility and license questions
  remain Victor's pending decisions. Sources were read, not copied/vendored.
