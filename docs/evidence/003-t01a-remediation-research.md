# T01a remediation research — 2026-09-05

Research only. **B3/B4 have concrete upstream remedies to test; no remedy has
been installed or validated here. B1/B2 remain unresolved.** T01a is blocked,
T01b inactive. Base: `20267d4667f829233174fe473a816ecf09a99fd2`, clean
`diagnostic/t01a-sdk-load`. [Request](../prompts/004-t01a-research-request.md).

## B3: missing runtime dependency

Published npm metadata confirms wallet-connect 2.1.2 declares
`@hiero-ledger/proto ^2.25.0` only in devDependencies. Its distributed runtime
imports that package. Our installed proto 2.25.0 is nested under Hiero SDK and
cannot be resolved from the sibling wallet-connect package; see
[local evidence](002-t01a-sdk-load.md).

An upstream reporter encountered the same packaging defect in 2.0.6 and
reported that adding proto directly fixed it. Maintainers merged the move to
peerDependencies on April 6; published wallet-connect 2.1.3 declares proto
`^2.25.0` as a peer. This supports a diagnosis of a packaging defect, not a
failure of the Hold/KYC design.
[Issue 648](https://github.com/hashgraph/hedera-wallet-connect/issues/648),
[merged PR 682](https://github.com/hashgraph/hedera-wallet-connect/pull/682),
[2.1.3 manifest](https://github.com/hashgraph/hedera-wallet-connect/blob/8218d6441be2ecd1785dcb687f4032cead68d5de/package.json).

**Preferred experiment, not a verified fix:** explicitly add
`@hiero-ledger/proto` exact `2.25.0` to our runtime dependencies, retaining
wallet-connect 2.1.2 and ATS 8.0.0. This supplies the missing public package
without changing wallet adapter code. npm resolution and the resulting lock
diff still need testing; proto itself peers on vulnerable protobufjs 7.5.4.

Alternative: a scoped wallet-connect 2.1.3 override. ATS pins 2.1.2, so this
exceeds its declared version. The patch release also changes the EIP-155
adapter toward WagmiAdapter; it is not solely a dependency declaration change.
Prefer the smaller experiment first.
[Release comparison](https://github.com/hashgraph/hedera-wallet-connect/compare/v2.1.2...v2.1.3),
[adapter change](https://github.com/hashgraph/hedera-wallet-connect/pull/678).

## B4: browser environment support

The official ATS v8 web configuration already provides Buffer/process/global
polyfills and selected Node module replacements, plus browser aliases for
dotenv and Winston. Browser adaptation is therefore an upstream precedent;
it must not replace the SDK or credential verification logic.
[Pinned official Vite configuration](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/vite.config.ts).

That app uses Vite 4.5.5, React 18.3.1, TypeScript 5.3.3 and
vite-plugin-node-polyfills 0.24.0. Our stack is newer. Plugin 0.24.0's published
peer range ends at Vite 7; plugin 0.28.0 includes Vite 8 and its release notes
describe a Vite 8 fix and CI coverage. **0.28.0 is a candidate exact dev pin,
not proof of ATS/Vite 8 compatibility.**
[ATS manifest](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/package.json),
[plugin release](https://github.com/davidmyersdev/vite-plugin-node-polyfills/releases/tag/v0.28.0).

Use only the browser facilities demanded by real import traces. Vite does not
automatically supply Node polyfills; Vite 8 replaces the previous optimizer
with Rolldown, so the old esbuild plugin hooks should not be copied blindly.
[Vite troubleshooting](https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility),
[Vite 8 migration](https://vite.dev/guide/migration#dependency-optimizer).

Review the two environment adapters separately. Official dotenv config is a
browser no-op; official Winston forwards arbitrary message/meta to console.
Our adaptation must preserve the public-log whitelist. Do not copy
EnvironmentPlugin("all"), expose host environment values, or use empty modules
to conceal missing SDK functionality. New failures require diagnosis, not an
expanding set of unexamined stubs.
[dotenv adapter](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/src/dotenv-mock.js),
[Winston adapter](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/apps/ats/web/src/winston-mock.js).

## B1/B2: security is a separate gate

Upstream patches exist, but our parents constrain installation. A protobufjs
schema-code issue has fixes at 7.5.5/8.0.1; a separate binary recursion issue
requires 7.5.6/8.0.2. These are per-advisory minimums, **not an all-clear version
recommendation**: the prior inventory includes other advisories. Trusted static
schemas alone do not resolve the binary decoding issue. Existing 7.2.5/7.5.4
exact upstream pins prevent an in-range repair.
[Schema advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-xq3m-2v4x-88gg),
[binary recursion advisory](https://github.com/protobufjs/protobuf.js/security/advisories/GHSA-685m-2w69-288q),
[full local triage](001-t01a-triage.md).

The optional Terminal3 native branch still requests tar ^6.1.11. The reviewed
tar advisory lists 7.5.21 as patched, outside that range. A locally absent
optional subtree does not establish absence in every installation.
[tar advisory](https://github.com/isaacs/node-tar/security/advisories/GHSA-r292-9mhp-454m).

After a successful isolated bundle, distinguish install-time, browser and VC
execution paths, compare the entire audit before/after, and resolve applicable
risks before wallet integration. Loading success cannot waive the 78 historical
audit entries. This research does not recommend a blanket override or force fix.

## Concrete proposed next experiment — not authorized by this research request

1. Keep all existing framework, ATS, Node and npm pins. Add only exact proto
   2.25.0 and polyfill plugin 0.28.0 as proposed above; inspect every lock change.
2. Add the minimum Vite 8 browser configuration and, only where required,
   reviewed dotenv/logging adapters. Keep official package-root SDK import and
   the real Management export check; never call Management or initialize Network.
3. Run npm ci/test/typecheck/build. Use the existing isolated browser harness,
   adapting its failure expectation to an actual successful load. Check dev and
   a **successful build's** preview, desktop/mobile, keyboard, duplicate/reload
   behavior, zero provider access and zero outbound attempts. Record new errors.
4. Preserve bundle size, dependency/audit diffs and remaining B1/B2 decisions.
   Stop within T01a; no wallet, VC signature or chain call.

Proposed exact files if this scope is approved: `package.json`,
`package-lock.json`, `vite.config.ts`; new `src/compat/dotenv.ts` and
`src/compat/winston.ts` only if traces require those adapters;
`docs/evidence/002-t01a-browser.mjs` and its JSON; a new
`docs/evidence/004-t01a-remediation.md`; `README.md`, `AI_USAGE.md`,
`docs/HANDOFF.md`, `docs/plans/001-ats-first.md` (scope amendment only),
`docs/prompts/005-t01a-remediation-decision.md` (actual decision only).
No source loader/UI change is currently needed. Additional packages or other
adapters need a concrete diagnosis and decision, not preemptive approval.

Using the entire official web app is a fallback reference environment, not the
preferred replacement: it changes the agreed stack and introduces much more UI
and dependency surface. It does not itself resolve the security gate. A backend
or custom contract rewrite is outside this slice and unnecessary for testing
the two identified browser integration remedies.

## Checks, attribution and limits

- Read Git history, local manifests/diagnostics, pinned upstream source,
  maintainer issues/releases/advisories, and public npm metadata. The 2.0.6
  reporter's successful workaround is not our 2.1.2 runtime result.
- No dependency installation/update, application edit, browser rerun, SDK
  execution, environment/secret access, wallet or chain operation this round.
  No new build, audit, compatibility or security success is claimed.
- Documentation links, Git base and unchanged dependency lock digest checked.
  Prior local/CI results remain historical; T01a stays blocked.
- Sources are references only: ATS and hedera-wallet-connect Apache-2.0;
  Vite/plugin/protobufjs/node-tar MIT. No upstream source copied into the app.
  Retain upstream notices if later adapting code.
