# HoldBook handoff

## Current boundary / Git base

**T01a npm resolution diagnosis is complete: the isolated graph workaround passes, but 12 generated-decoder security checks still fail. No app dependencies/source were changed. T01b-3 combined deployment and Equity config reads are implemented; automated and live public-endpoint checks pass. Victor has passed the core desktop MetaMask flows on dev/preview; specific remaining manual checks are listed below. T01 is not complete.**

- `based_on_commit: 2dfeff659419c18bac14d8e01f7046ba1af98d6a` (npm-diagnosis base, not the commit containing this handoff).
- Integration completed in `c45a072` (PR #2); current branch is `diagnostic/t01a-npm-resolution`; user authorized the bounded diagnosis via “go”. Historical integration: `feat/t01b-3-config-check` → `main`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). Previous handoff base `0828d79` was verified as an ancestor. User authorized push and merge; merge only after the latest PR head passes CI. Read the resulting HEAD/PR state from Git/GitHub; hand over on main after merge.
- User authorized the independent read-only slice and TDD. Human acceptance is scheduled for **2026-09-06, Asia/Taipei**; postponement does not remove requirements. The user subsequently authorized pushing and merging this branch; no public deployment or next implementation ticket is included.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). User authorized this record-only addition; no acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest T01b-3 authorization in the [plan](plans/001-ats-first.md).

| Need | Read |
| --- | --- |
| Current diagnosis and reproduction | [npm resolution evidence](evidence/013-t01a-npm-resolution.md), [Prompt 015](prompts/015-t01a-npm-resolution.md) |
| Delivered application | [One-page config evidence](evidence/010-t01b-3-config.md) |
| Accepted plan and user decisions | [Prompt 012](prompts/012-t01b-3-config.md) |
| Wallet behavior and prior dependency findings | [Wallet evidence](evidence/008-t01b-1-wallet.md) |
| T01a blocker / mentor questions | [Stopped decoder rebuild trial](evidence/007-t01a-protobuf-rebuild.md) |
| Provenance / current sources | [AI_USAGE](../AI_USAGE.md), [ATTRIBUTION](ATTRIBUTION.md) |

## Verified / remaining requirements

- Manual deployment check uses actual RPC chain 296, fixed Testnet Mirror contract IDs, and viem runtime bytecode reads. Resolver `0.0.9212226` resolves to `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` (2,115 bytes); Factory `0.0.9213391` to `0xd1f118a40f3b02883d35909ef2517e7edd78379d` (390 bytes). Both were read through dev and preview. These are observations at check time, not config/ABI compatibility guarantees.
- The same manual action reads `getLatestVersionByConfiguration(bytes32)` from the verified Resolver for Equity config ID `0x0000000000000000000000000000000000000000000000000000000000000001`. Dev and preview both returned **version 1** on 2026-09-05. The result is checked as bigint in 1..Number.MAX_SAFE_INTEGER and recorded as a decimal string, not an SDK payload. Requery before creating NOVA.
- Checks are independent of MetaMask, manually triggered, limited to 10 seconds, cancellable and never automatically retried/refreshed. Each new attempt hides previous verification; errors and late responses cannot restore it. Reload clears deployment/config results. The entire operation shares one 10-second deadline. CCIP Read is disabled: OffchainLookup cannot trigger gateway requests. Factory failure does not hide an independently verified config, but overall success requires all three results.
- `npm ci`, 50 Node tests, typecheck and build pass. Eight combined deployment/config browser scenarios cover dev/preview and desktop/mobile; 20 existing wallet browser regression scenarios also pass. Live public reads and synthetic cases are recorded separately. No signatures, transactions or transaction IDs.
- Package manifest/lockfile and existing ATS diagnostics are unchanged. The final JS totals 393,895 bytes across main and a lazy viem CCIP chunk; 16 rendered package locations, no ATS/protobuf/Terminal3 modules. The lazy chunk remains bundled despite disabled gateway lookup; no external gateway request is allowed. Bundle capture matches the browser-tested artifact hashes.
- T01b-1 remains implemented with manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, memory fallback on storage failure and address-only persistence. Real desktop observations are now recorded in [manual evidence](evidence/011-t01-manual.md); remaining checks are explicit.
- **B1 remains blocked:** resolve protobuf before restoring ATS decoding. The prior rebuild trial remains stopped/restored. New isolated evidence 013 explains the npm gate: hoisting KEEP plus unequal override sets prevents pruning. A targeted nested update, clean install and subsequent default lock-only install pass; runtime 7.6.6 still leaves 12 static decoder failures. No repair is retained in the app.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. `npm ci` still reports 83 vulnerabilities (22 low, 32 moderate, 27 high, 2 critical); install-script approvals were not expanded. Prior full-tree peer failures (40 TypeScript + 1 optional Base) remain recorded, not waived by zero bundle membership.
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

The bounded npm diagnosis is complete; commit its records and stop here. Do not auto-push/merge. The existing wallet app and manual evidence remain intact. Do not restart the already diagnosed npm experiment without new evidence.

Next proposed ticket is **original-schema decoder regeneration**, requiring a separate implementation activation. Keep exact compiler/runtime 1.3.3/7.6.6, the four qualified parent overrides and the now-proven targeted nested resolution command. No parent SDK upgrades, schema edits, manual upstream decoder patches, broad overrides or script approvals. Require public API/wire/64-bit compatibility and every existing malformed/recursive/length-boundary check to pass, then clean install/audit/lock accounting and official-entry dev/preview loading. Stop/restore on incompatibility or a failed security gate. Do not activate SDK config integration, VC or NOVA creation with this ticket.

Proposed exact files when activated:

- `package.json`, `package-lock.json`, `scripts/rebuild-proto.mjs`.
- New `docs/evidence/014-t01a-decoder-rebuild.test.mjs`, `.md`, `.json`, `.patch` (patch only if a candidate is rejected).
- `docs/prompts/016-t01a-decoder-rebuild.md`, `docs/ai-usage/020-t01a-decoder-rebuild.md`.
- `docs/HANDOFF.md`, `docs/plans/001-ats-first.md`, `docs/ATTRIBUTION.md`, `AI_USAGE.md`.

Existing tests and browser harnesses may be reused without changing historical files. Scratch diagnostic pages, build probes and generated artifacts stay outside the application and must be reproducible in the new evidence. B2 and all remaining human/SDK/VC acceptance stay open. Before any actual future transaction or VC signature, Victor approves it manually in MetaMask.
