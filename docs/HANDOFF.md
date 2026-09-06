# HoldBook handoff

## Current boundary / Git base

**T01a's bounded decoder repair passes and is retained: clean installation rebuilds both original schemas, all 36 proto tests pass, and the official SDK entry loads in isolated dev/preview browsers. B2 and full SDK config/VC integration remain open. T01b-3 public deployment/config reads and Victor's core desktop MetaMask acceptance remain intact. T01 is not complete.**

- `based_on_commit: 301833451e18cb993b4db480116f82def4b870e6` (regeneration base, not the commit containing this handoff). Previous base `2dfeff659419c18bac14d8e01f7046ba1af98d6a` was verified as an ancestor.
- Current branch: `fix/t01a-decoder-rebuild`, from the local npm diagnosis. Victor's “Go” activated this bounded repair and local commit. No automatic push/merge or next ticket is included; read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). User authorized this record-only addition; no acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest regeneration outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current repair and reproduction | [Decoder repair evidence](evidence/014-t01a-decoder-rebuild.md), [Prompt 016](prompts/016-t01a-decoder-rebuild.md) |
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
- Current checks: two default clean installs run the guarded generator; 50 app tests, 36 proto tests, typecheck and build pass. Four current-app smoke checks and four isolated real SDK-entry load checks pass across dev/preview and desktop/mobile. The earlier eight deployment/config and 20 wallet browser scenarios remain historical regression evidence; they were not rerun in this repair. No signatures, transactions or transaction IDs.
- Manifest/lock now retain exact compiler/runtime 1.3.3/7.6.6, four qualified parent overrides and root postinstall. Existing ATS diagnostics and application source are unchanged. Main-app assets are byte-identical to evidence 013: final JS 393,895 bytes, 16 rendered package locations, no ATS/protobuf/Terminal3 modules. The lazy viem CCIP chunk remains bundled despite disabled gateway lookup; no gateway request is allowed. Separate SDK diagnostic membership contains both regenerated decoders; inclusion does not prove execution or full SDK compatibility.
- T01b-1 remains implemented with manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, memory fallback on storage failure and address-only persistence. Real desktop observations are now recorded in [manual evidence](evidence/011-t01-manual.md); remaining checks are explicit.
- **B1 bounded repair passed:** both original published schema inventories/hashes are checked before generation. Exact public APIs, wire/64-bit fixtures, malformed/recursive/length-boundary cases and both package load orders pass. Generated output is deterministic and survives clean installation. `npm test` includes this gate; skipping postinstall leaves unsafe original decoders and fails it. This is bounded evidence, not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
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

The decoder repair is complete; commit code and records together and stop. Do not auto-push/merge. Preserve the running user dev/preview servers (5173/4173); task diagnostic servers use separate ports and are stopped at handoff.

Next proposed ticket: **T01b-4 official ATS SDK config integration**, not activated. First inspect the pinned official API's initialization/query requirements; retain the existing public deployment verification and accept only an integer SDK payload >= 1. Use the fixed Testnet Resolver and Equity config. No SDK/parent upgrades, new dependencies, wallet prompts, VC or chain mutation. If the official query cannot meet these constraints or the pinned deployment is incompatible, record diagnostics and stop rather than bypassing the SDK.

Proposed exact files when activated:

- `src/ats.ts`, `src/App.tsx`, `src/deployment.ts`.
- `tests/ats.test.mjs`, `tests/shell.test.mjs`, `tests/deployment.test.mjs`.
- New `docs/evidence/015-t01b-4-sdk-config.mjs`, `.md`, `.json`.
- `docs/prompts/017-t01b-4-sdk-config.md`, `docs/ai-usage/021-t01b-4-sdk-config.md`.
- `docs/HANDOFF.md`, `docs/plans/001-ats-first.md`, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.

Acceptance: TDD for SDK result validation, rejection/timeout/cancellation and stale-result prevention; clean install, all tests, typecheck/build; official-entry dev/preview browser and live public-read evidence kept separate from synthetic cases; no wallet/signing/transaction or unapproved endpoint requests. Recheck complete rendered membership because bringing the SDK into the app changes its bundle. B2 must still be resolved before VC integration or related installation changes. Victor approves every future VC signature or transaction manually in MetaMask.
