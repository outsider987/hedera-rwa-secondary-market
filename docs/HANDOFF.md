# HoldBook handoff

## Current boundary / Git base

**Read-only API research is complete: no supported public ATS 8.0.0 path meeting wallet independence and transport requirements was found. T01b-4 stays blocked. The documented `Network.init` starts wallet discovery; `setNetwork` lacks its public request constructor and caller-controlled transport. A bounded compatibility trial is proposed below, not activated. Application/dependencies are unchanged; B1 remains repaired. B2, SDK/VC and remaining human acceptance stay open. T01 is not complete.**

- `based_on_commit: 0bf268105a9c1a2474dcd3bfb844652997be7e2d` (read-only research base, not the commit containing this handoff). Previous base `938aeb71838c6e65e18bb82d499d12c78698cbda` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`, from the retained decoder repair. Victor's “好確認下” activated the research ticket only. Commit research/documents locally. No automatic push/merge or compatibility patch is included; read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). User authorized this record-only addition; no acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest research outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current supported-API findings and proposed repair | [Read-only options](evidence/016-sdk-readonly-options.md), [Prompt 018](prompts/018-sdk-readonly-options.md) |
| Current SDK blocker and reproduction | [SDK prerequisite evidence](evidence/015-t01b-4-sdk-config.md), [Prompt 017](prompts/017-t01b-4-sdk-config.md) |
| Retained decoder repair | [Decoder repair evidence](evidence/014-t01a-decoder-rebuild.md) |
| npm lock-resolution decisions | [npm resolution evidence](evidence/013-t01a-npm-resolution.md) |
| Delivered application | [One-page config evidence](evidence/010-t01b-3-config.md) |
| Accepted plan and user decisions | [Prompt 012](prompts/012-t01b-3-config.md) |
| Wallet behavior and prior dependency findings | [Wallet evidence](evidence/008-t01b-1-wallet.md) |
| Original schema hashes / compatibility oracle | Evidence 007 source inventory and restored tests, referenced directly by the generator/test scripts; the stopped trial remains historical |
| Provenance / current sources | [AI_USAGE](../AI_USAGE.md), [ATTRIBUTION](ATTRIBUTION.md) |

## Verified / remaining requirements

- Manual deployment check uses actual RPC chain 296, fixed Testnet Mirror contract IDs, and viem runtime bytecode reads. Resolver `0.0.9212226` resolves to `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` (2,115 bytes); Factory `0.0.9213391` to `0xd1f118a40f3b02883d35909ef2517e7edd78379d` (390 bytes). Both were read through dev and preview. These are observations at check time, not config/ABI compatibility guarantees.
- The same manual action reads `getLatestVersionByConfiguration(bytes32)` from the verified Resolver for Equity config ID `0x0000000000000000000000000000000000000000000000000000000000000001`. Dev and preview both returned **version 1** on 2026-09-05. The result is checked as bigint in 1..Number.MAX_SAFE_INTEGER and recorded as a decimal string, not an SDK payload. Requery before creating NOVA.
- Checks are independent of MetaMask, manually triggered, limited to 10 seconds, cancellable and never automatically retried/refreshed. Each new attempt hides previous verification; errors and late responses cannot restore it. Reload clears deployment/config results. The entire operation shares one 10-second deadline. CCIP Read is disabled: OffchainLookup cannot trigger gateway requests. Factory failure does not hide an independently verified config, but overall success requires all three results.
- Latest research regression checks: default clean install runs the guarded generator; 50 app tests, 36 proto tests, typecheck/build and four dev/preview desktop/mobile app smoke checks pass. App assets match evidence 014 by SHA-256. SDK/runtime and live reads were not repeated during research. Historical evidence 015 contains six isolated SDK prerequisite runs reproducing the blocker, with no wallet access or forbidden requests; its live viem reads returned version 1 on 2026-09-06, not an SDK payload. Earlier complete deployment/wallet browser scenarios remain historical. No signatures, transactions or transaction IDs.
- Manifest/lock now retain exact compiler/runtime 1.3.3/7.6.6, four qualified parent overrides and root postinstall. Existing ATS diagnostics and application source are unchanged. Main-app assets are byte-identical to evidence 013: final JS 393,895 bytes, 16 rendered package locations, no ATS/protobuf/Terminal3 modules. The lazy viem CCIP chunk remains bundled despite disabled gateway lookup; no gateway request is allowed. Separate SDK diagnostic membership contains both regenerated decoders; inclusion does not prove execution or full SDK compatibility.
- T01b-1 remains implemented with manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, memory fallback on storage failure and address-only persistence. Real desktop observations are now recorded in [manual evidence](evidence/011-t01-manual.md); remaining checks are explicit.
- **B1 bounded repair passed:** both original published schema inventories/hashes are checked before generation. Exact public APIs, wire/64-bit fixtures, malformed/recursive/length-boundary cases and both package load orders pass. Generated output is deterministic and survives clean installation. `npm test` includes this gate; skipping postinstall leaves unsafe original decoders and fails it. This is bounded evidence, not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
- **T01b-4 blocked:** `Network.setNetwork` exists, `SetNetworkRequest` is absent from the public entry, and a plain object fails the required `validate()` call. No fake validator/deep import or broader `Network.init` was used. The latter initializes transaction adapters, outside this read-only ticket. Source review also identified hidden default ethers timeout/retry behavior; SDK payload/cancellation/retry/redirect browser acceptance remains unexecuted because initialization is blocked. The app retains the working viem path without claiming SDK compatibility.
- **Research completed:** official guide, installed public API and upstream main at `be4f860` provide no qualifying alternative. Initialization itself uses MetaMask with pairing disabled, but discovers the provider and registers listeners; it is not wallet-independent. Ethers exposes transport controls that ATS does not pass through. Config accepts the preflight-verified EVM address, avoiding the SDK Mirror contract lookup and its 404 retry loop. These are source findings, not new SDK runtime acceptance or maintainer confirmation. See evidence 016 for searches and precise limits.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. Current audit reports 80 vulnerabilities (23 low, 32 moderate, 24 high, 1 critical), with no new advisory source IDs versus the prior baseline; install-script approvals were not expanded. Targeted protobuf tree checks pass, but full `npm ls --all` still exits 1 for TypeScript 7.0.2 and optional Base 2.4.0 peer incompatibilities. Current complete observations are in evidence 014, not waived by zero app bundle membership.
- **Still required for T01:** remaining manual acceptance checks below; ATS SDK official-entry integration including config result compatibility; synthetic Admin-signed VC accepted and expired/tampered/wrong-subject credentials rejected. VC signatures require Victor's explicit MetaMask approval. No T02/NOVA creation is activated.
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

Research has reached its boundary. Commit documents together and stop; no auto-push/merge. No new SDK probe or patch was performed. Mentor questions remain drafted in evidence 015, not sent. Existing viem checks remain the usable deployment/config path without claiming SDK compatibility. User dev/preview servers (5173/4173) remain running; research smoke checks closed their fresh browser contexts.

Next proposed ticket: **isolated ATS 8.0.0 export/provider compatibility trial**, not activated. This would be a disclosed local compatibility patch, not an existing official API. Test two changes together: export the genuine `SetNetworkRequest`, and accept an optional caller-owned read provider through `rpcNode` into `RPCQueryAdapter`. Keep original validation and default behavior for callers without the new option. No global fetch/provider override, fabricated validator, deep import, wallet initialization or SDK upgrade.

Exact upstream logical targets, in the published package's ESM/CJS JS and type declarations only: `src/port/in/request/index`, `src/domain/context/network/JsonRpcRelay`, `src/app/usecase/command/network/setNetwork/SetNetworkCommandHandler`, and `src/port/out/rpc/RPCQueryAdapter`. A version/hash guard must reject unexpected originals, apply idempotently after clean installation and preserve upstream notices. Never commit node_modules or a full fork. Expanding these targets requires an evidence-backed scope update.

Proposed exact repository files when separately activated:

- `scripts/patch-ats-readonly.mjs`; `package.json`, `package-lock.json` only for reproducible patch wiring and making the already installed ethers **6.17.0** an exact direct dependency. This is a proposal, not a change to the separate VC dependency plan; no unrelated resolution changes.
- `tests/ats.test.mjs` for the public constructor/type/validation gate; new `docs/evidence/017-sdk-readonly-trial.mjs`, `.md`, `.json` for the isolated provider and browser candidate.
- `docs/prompts/019-sdk-readonly-trial.md`, `docs/ai-usage/023-sdk-readonly-trial.md`, HANDOFF, plan, ATTRIBUTION and AI_USAGE.
- No application source changes in this trial. Preserve all existing tests, ATS diagnostics and historical evidence.

Trial acceptance: begin with failing checks, then prove real public-root initialization without wallet access and a valid SDK payload from the same fixed Testnet Resolver. Feed the fresh preflight-verified EVM address into the SDK config request, not a derived address. Create one read provider per serialized attempt; share a native abort signal and 10-second deadline across preflight, SDK fetch and body consumption. Verify actual RPC chain 296 before pinning the provider network; disable ethers network-discovery retries, HTTP retries and redirects, and reject all unapproved endpoints/methods, including CCIP gateways. Destroy the provider and abort requests on completion/cancellation; late results cannot publish success. Retain safe-integer payload >= 1 checks and no automatic retries on reload/errors.

Run npm ci/test/typecheck/build; real SDK dev/preview desktop/mobile tests with controlled transport and separate live reads; timeout (including delayed body), cancellation, 429/network-error, redirects/OffchainLookup and stale-response cases; complete rendered dependency accounting. Stop and retain diagnostics if either change fails. Success permits proposing app integration, not automatically doing it. B2 remains required before VC or related installation changes; Victor approves every future VC signature or transaction manually in MetaMask. All remaining manual checks above persist.
