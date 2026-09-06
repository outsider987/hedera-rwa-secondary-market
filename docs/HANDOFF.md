# HoldBook handoff

## Current boundary / Git base

**T01b-4 is blocked before SDK config execution: the public SDK entry does not export the `SetNetworkRequest` required by its read-only initializer; plain objects fail validation. The existing viem preflight still returns Testnet config version 1 on dev/preview. Application code and dependencies are unchanged. B1's repair remains valid; B2, SDK integration and VC acceptance remain open. T01 is not complete.**

- `based_on_commit: 938aeb71838c6e65e18bb82d499d12c78698cbda` (SDK config ticket base, not the commit containing this handoff). Previous base `301833451e18cb993b4db480116f82def4b870e6` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`, from the retained decoder repair. Victor's “Go” activated the bounded SDK config slice; its stop condition now applies. Commit diagnostics/documents locally. No automatic push/merge or next ticket is included; read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). User authorized this record-only addition; no acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest T01b-4 outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
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
- Current checks: default clean install runs the guarded generator; 50 app tests, 36 proto tests, typecheck and build pass. Four current-app smoke checks pass. Six isolated SDK prerequisite runs (dev/preview × synthetic desktop/mobile and live desktop) reproduce the initialization blocker with no wallet access or forbidden requests. Live viem reads returned version 1 on 2026-09-06; this is not an SDK payload. Earlier complete deployment/wallet browser scenarios remain historical evidence, not rerun in this ticket. No signatures, transactions or transaction IDs.
- Manifest/lock now retain exact compiler/runtime 1.3.3/7.6.6, four qualified parent overrides and root postinstall. Existing ATS diagnostics and application source are unchanged. Main-app assets are byte-identical to evidence 013: final JS 393,895 bytes, 16 rendered package locations, no ATS/protobuf/Terminal3 modules. The lazy viem CCIP chunk remains bundled despite disabled gateway lookup; no gateway request is allowed. Separate SDK diagnostic membership contains both regenerated decoders; inclusion does not prove execution or full SDK compatibility.
- T01b-1 remains implemented with manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, memory fallback on storage failure and address-only persistence. Real desktop observations are now recorded in [manual evidence](evidence/011-t01-manual.md); remaining checks are explicit.
- **B1 bounded repair passed:** both original published schema inventories/hashes are checked before generation. Exact public APIs, wire/64-bit fixtures, malformed/recursive/length-boundary cases and both package load orders pass. Generated output is deterministic and survives clean installation. `npm test` includes this gate; skipping postinstall leaves unsafe original decoders and fails it. This is bounded evidence, not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
- **T01b-4 blocked:** `Network.setNetwork` exists, `SetNetworkRequest` is absent from the public entry, and a plain object fails the required `validate()` call. No fake validator/deep import or broader `Network.init` was used. The latter initializes transaction adapters, outside this read-only ticket. Source review also identified hidden default ethers timeout/retry behavior; SDK payload/cancellation/retry/redirect browser acceptance remains unexecuted because initialization is blocked. The app retains the working viem path without claiming SDK compatibility.
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

The T01b-4 stop condition has been reached; commit reproducible diagnostics and documents together and stop. Do not auto-push/merge. User dev/preview servers (5173/4173) remain running; the harness closes its temporary 5185/4185 servers and fresh browser contexts.

Next proposed ticket: **public SDK read-only initialization options**, not activated. Resolve both the missing request constructor and provider controls before resuming app integration. Research supported APIs/upstream guidance; do not repeat the demonstrated missing-export experiment without a changed candidate. Mentor questions are drafted in evidence 015 but have not been sent. No dependency patch, fake validation, deep import, wallet initialization, VC or mutation is approved by this research scope.

Proposed exact files when activated:

- New `docs/evidence/016-sdk-readonly-options.mjs`, `.md`, `.json` (MJS/JSON only for a concrete new bounded probe).
- `docs/prompts/018-sdk-readonly-options.md`, `docs/ai-usage/022-sdk-readonly-options.md`.
- `docs/HANDOFF.md`, `docs/plans/001-ats-first.md`, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.

Research acceptance: cite the exact supported initialization and transport controls, or state the remaining upstream gap; identify the smallest concrete change and exact files for a separately activated implementation. Do not waive the original safe SDK payload, Testnet, deadline/cancellation, stale-state, no-retry or endpoint requirements. Any future retained integration must still pass the full Node/browser/live-read/bundle gate and preserve manual acceptance. B2 must be resolved before VC or related installation changes; Victor approves every future VC signature or transaction manually in MetaMask.
