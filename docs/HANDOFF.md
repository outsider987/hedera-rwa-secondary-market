# HoldBook handoff

## Current boundary / Git base

**The isolated ATS 8.0.0 compatibility trial passed. A guarded local patch exports the genuine network request and accepts a caller-owned read provider; four live Testnet SDK config reads returned payload `1`. Main-app SDK integration is the next proposed ticket, not activated. B1 remains repaired within its bounded gate; B2, VC and remaining human acceptance stay open. T01 is not complete.**

- `based_on_commit: 5e81069a700cc597f04b3aa254b774e60d76ac63` (trial base, not the commit containing this handoff). Previous base `0bf268105a9c1a2474dcd3bfb844652997be7e2d` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`. Victor's “好go” activated the isolated export/provider trial only. Commit work and documents locally; no automatic push/merge or next-ticket implementation. Read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). No acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest activation/outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current patch, actual SDK/transport checks and limits | [Trial evidence](evidence/017-sdk-readonly-trial.md), [Prompt 019](prompts/019-sdk-readonly-trial.md) |
| Original public API gaps / repair rationale | [Read-only options](evidence/016-sdk-readonly-options.md) |
| Historical SDK failure / mentor questions | [Prerequisite evidence](evidence/015-t01b-4-sdk-config.md) |
| Retained decoder repair | [Decoder evidence](evidence/014-t01a-decoder-rebuild.md) |
| npm lock-resolution decisions | [npm resolution evidence](evidence/013-t01a-npm-resolution.md) |
| Delivered application and accepted config scope | [Config evidence](evidence/010-t01b-3-config.md), [Prompt 012](prompts/012-t01b-3-config.md) |
| Wallet behavior and prior dependency findings | [Wallet evidence](evidence/008-t01b-1-wallet.md) |
| Original schema hashes / compatibility oracle | Evidence 007 inventories and restored tests, referenced directly by the generator/test scripts; the stopped trial remains historical |
| Provenance / current sources | [AI_USAGE](../AI_USAGE.md), [ATTRIBUTION](ATTRIBUTION.md) |

## Verified / remaining requirements

- **Application unchanged:** its manual deployment check verifies RPC chain 296, fixed Testnet Mirror contract IDs and runtime bytecode. Resolver `0.0.9212226` resolves to `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` (2,115 bytes); Factory `0.0.9213391` to `0xd1f118a40f3b02883d35909ef2517e7edd78379d` (390 bytes). The latest four live trial preflights confirmed these values. They are observations, not broader ABI/SDK compatibility guarantees.
- The app uses viem to read `getLatestVersionByConfiguration(bytes32)` from the verified Resolver for Equity config ID `0x0000000000000000000000000000000000000000000000000000000000000001`. The result must be bigint in 1..Number.MAX_SAFE_INTEGER and is recorded as a decimal string, not an SDK payload. Latest trial preflights returned version `1`; requery before creating NOVA.
- Existing app reads are wallet-independent, manually triggered, cancellable and never automatically retried/refreshed. One 10-second deadline covers the complete operation. Each attempt hides prior verification; stale/error results cannot restore it, and reload clears it. CCIP Read is disabled. Factory failure does not hide an independently verified config, but overall deployment success requires all three results. Reads use latest state, not a shared block snapshot.
- **Local SDK trial passed:** twelve published ESM/CJS/type files across four logical targets are protected by original/patched SHA-256 and ATS version 8.0.0. All files are checked before writes; clean installation reapplies the patch and reapplication changes zero. The genuine `SetNetworkRequest` is now exported, and optional `rpcNode.queryProvider` reaches `RPCQueryAdapter`. Original request validation and default provider construction remain intact. This is a disclosed local adaptation, not an upstream-supported API.
- The isolated page reuses the fixed deployment preflight, then feeds its fresh Resolver EVM address to the actual SDK `Management.resolveLatestConfigVersion`. One owned ethers provider per serialized attempt shares native abort/deadline through fetch and response-body consumption. Transport allows only the expected config eth_call, disables HTTP/network retries, redirects and CCIP gateways, then aborts/destroys on completion or cancellation. It uses no `Network.init`, deep import, fabricated validator, global transport override, wallet access, signature or transaction. The invalidation event is a trial hook; application/wagmi integration remains untested for this new path.
- Latest checks: `npm ci`, **52 app/adapter + 36 proto tests**, typecheck/build, **80 controlled + 4 live SDK browser cases** across dev/preview desktop/mobile sizes, and four app smoke cases pass. Every live SDK payload was safe integer `1`; no wallet access, forbidden request or page error occurred. Body/shared deadline, cancellation, invalidation, stale result, reload, duplicate actions, rejection and manual retry gates pass. Controlled failures are not live outages; mobile checks use desktop Chrome viewport emulation. ESM browser execution is verified; CJS patch hashes and syntax are checked without claiming CJS runtime acceptance.
- Main-app assets match evidence 014 by SHA-256: 393,895 JS bytes across two chunks and 16 rendered package locations, with no ATS/protobuf/Terminal3 modules. Its lazy viem CCIP chunk remains bundled despite disabled gateway lookup. The isolated SDK bundle has 348 rendered package locations; both regenerated decoders match evidence 014. Complete results, hashes, membership and audit differences are in [evidence 017 JSON](evidence/017-sdk-readonly-trial.json). Inclusion does not prove every module executed. Two existing dfns packages omit license metadata; no license is inferred.
- Dependencies remain pinned. Root postinstall runs the existing proto generator then `scripts/patch-ats-readonly.mjs`. Exact ethers **6.17.0**, already installed transitively, is now direct. Removing that one root dependency field yields the exact previous parsed lockfile; no resolved package, override or install-script approval changed. The separate earlier VC proposal named ethers 6.15.0: reconcile that scope before VC work, without treating this read trial as VC compatibility evidence.
- T01b-1 retains manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, storage memory fallback and address-only persistence. Real desktop observations remain in [manual evidence](evidence/011-t01-manual.md); remaining checks below are not waived.
- **B1 bounded repair remains passed:** both original published schema inventories/hashes are checked before generation. Public APIs, wire/64-bit fixtures, malformed/recursive/length boundaries and both package load orders pass. Deterministic generated output survives clean installation. `npm test` includes the gate; skipping postinstall fails it. This is not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
- **Historical research is preserved:** unpatched ATS lacked the public request export and caller-controlled transport. `Network.init` discovers wallet providers and registers listeners even with pairing disabled. Evidence 016 found no qualifying official alternative; the new local patch resolves only the isolated read path. Mentor questions remain drafted in evidence 015, not sent. The app still uses viem until a separate SDK integration ticket passes.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. Audit remains 80 findings (23 low, 32 moderate, 24 high, 1 critical), with unchanged advisory IDs, severity, ranges and affected paths. Six entries' effects/fix suggestions differ; none were applied. Full `npm ls --all` still exits 1 for TypeScript 7.0.2 and optional Base 2.4.0 peer incompatibilities. Neither the read trial nor absence from the app bundle waives these findings.
- **Still required for T01:** remaining manual checks below; main-app public-entry SDK/config integration; synthetic Admin-signed VC accepted and expired/tampered/wrong-subject credentials rejected. Victor approves every future VC signature and transaction manually in MetaMask. No T02/NOVA creation is activated.
- The unseen pre-event research draft remains uninspected; Victor must resolve event eligibility and project-license questions. No real KYC or legal-compliance claims.

## Victor acceptance — scheduled 2026-09-06 (Asia/Taipei)

Use desktop Chrome with only MetaMask installed. Start `npm run dev` (5173); after build, `npm run preview` (4173). Run the desktop flow on both. Use only public EVM/Hedera IDs and short observations; never export a browser profile, wallet object, secrets or signatures. Local role labels do not establish on-chain permissions.

Core desktop results on dev/preview are recorded in [manual evidence](evidence/011-t01-manual.md) and its [structured observations](evidence/011-t01-manual.json), dated 2026-09-06. Screenshots establish three-role verification, duplicate prevention and deployment/config version 1. Victor confirmed manual reload connection, automatic network recovery, and normal disconnect/reconnect and rejection/retry. Preview interactions beyond screenshots are operator-reported.

| Remaining human check | Status |
| --- | --- |
| Duplicate clicks while connection is pending | Pending |
| Independent comparison of all three raw Mirror account records | Pending |
| Deployment check while disconnected; reload resets result; no signing/transaction/automatic switch prompt | Pending |
| Mobile layout, focus and overflow (no mobile-wallet claim) | Pending |

Browser/MetaMask versions and the single-wallet environment are not independently recorded. Do not require repeat screenshots for already confirmed behaviors.

Record each outcome as Pending / Passed / Failed / Blocked with the actual date and observation. Do not force a live Mirror outage: timeout, storage denial, missing-provider and race cases already have controlled automated coverage. Record defects and define the evidence-backed repair scope; fix and revalidate before marking the affected requirement Passed.

## Next action / exact allowed files

The isolated trial has reached its boundary. Retain its guarded patch, commit documents with the work and stop; no automatic push/merge. User dev/preview servers (5173/4173) remain running. The trial closed its scratch servers (5185/4185) and fresh browser contexts.

Next proposed ticket: **T01b-4 main-app SDK config integration**, not activated. Reuse the validated public-root request and owned read-provider approach from evidence 017. Keep the existing ATS load diagnostic and working viem deployment/config preflight. Do not introduce another framework, global transport hook, SDK upgrade, fake validator or deep import.

Exact repository files when separately activated:

- `src/ats.ts`, `src/App.tsx`, `src/deployment.ts` for explicit manual SDK preparation/config checks and shared read controls using installed libraries. Existing wallet, styles and approved NOVA parameters remain unchanged.
- `tests/ats.test.mjs`, `tests/deployment.test.mjs`, `tests/shell.test.mjs`; preserve existing tests and add meaningful public SDK/result/lifecycle checks with Node's built-in runner.
- New `docs/evidence/018-t01b-4-sdk-integration.mjs`, `.md`, `.json`; `docs/prompts/020-t01b-4-sdk-integration.md`; `docs/ai-usage/024-t01b-4-sdk-integration.md`; HANDOFF, plan, ATTRIBUTION and AI_USAGE.
- No manifest/lock/patch changes are proposed. Preserve historical evidence and all existing diagnostics.

Acceptance: use TDD; manual public-root SDK loading and genuine request validation, independent of wallet initialization. Verify actual RPC chain 296 and the fixed contracts before supplying the fresh Resolver EVM address. Show an SDK payload only when it is a safe integer >= 1; keep preflight and SDK outcomes accurately labeled. Share a single native abort signal and 10-second deadline across preflight, SDK fetch and body consumption. Serialize pending operations, cancel/invalidate stale state, abort/destroy providers, and require a new manual attempt after rejection, timeout or reload. No HTTP/network automatic retry, redirect, CCIP gateway, signature, transaction or unapproved endpoint/method.

Run npm ci/test/typecheck/build, real SDK dev/preview desktop/mobile browsers with controlled transport and separate live reads, and complete rendered dependency accounting. Include delayed body, shared deadline, cancellation, late responses, duplicate actions, invalid payloads, 429/network-error, redirects/OffchainLookup and app lifecycle/reload coverage. Recheck that existing wallet/deployment behavior remains correct. Stop and retain diagnostics if the pinned SDK/deployment is incompatible. Do not claim full SDK, VC or T01 acceptance from config success. B2, the human checks above and every future manual MetaMask approval remain required; no VC or NOVA work follows automatically.
