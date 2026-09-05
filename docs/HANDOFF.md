# HoldBook handoff

## Current boundary / Git base

**T01b-3 combined deployment and Equity config reads are implemented; automated and live public-endpoint checks pass. Victor's real MetaMask acceptance remains Pending. T01 is not complete.**

- `based_on_commit: 54452080fca81051f41f9dd422d98f6a1e82b9ae` (integration base, not the commit containing this handoff).
- Integration: `feat/t01b-3-config-check` → `main`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). Previous handoff base `0828d79` was verified as an ancestor. User authorized push and merge; merge only after the latest PR head passes CI. Read the resulting HEAD/PR state from Git/GitHub; hand over on main after merge.
- User authorized the independent read-only slice and TDD. Human acceptance is scheduled for **2026-09-06, Asia/Taipei**; postponement does not remove requirements. The user subsequently authorized pushing and merging this branch; no public deployment or next implementation ticket is included.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest T01b-3 authorization in the [plan](plans/001-ats-first.md).

| Need | Read |
| --- | --- |
| Current result and reproduction | [One-page config evidence](evidence/010-t01b-3-config.md) |
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
- T01b-1 remains implemented with manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, memory fallback on storage failure and address-only persistence. Automated provider/Mirror tests do not prove real MetaMask acceptance or live account lookup.
- **B1 remains blocked:** resolve protobuf before restoring ATS decoding. The prior rebuild trial remains stopped/restored; do not repeat it as a side effect.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. `npm ci` still reports 83 vulnerabilities (22 low, 32 moderate, 27 high, 2 critical); install-script approvals were not expanded. Prior full-tree peer failures (40 TypeScript + 1 optional Base) remain recorded, not waived by zero bundle membership.
- **Still required for T01:** real three-account acceptance; ATS SDK official-entry integration including config result compatibility; synthetic Admin-signed VC accepted and expired/tampered/wrong-subject credentials rejected. VC signatures require Victor's explicit MetaMask approval. No T02/NOVA creation is activated.
- The unseen pre-event research draft remains uninspected; Victor must resolve event eligibility and project-license questions. No real KYC or legal-compliance claims.

## Victor acceptance — scheduled 2026-09-06 (Asia/Taipei)

Use desktop Chrome with only MetaMask installed. Start `npm run dev` (5173); after build, `npm run preview` (4173). Run the desktop flow on both. Use only public EVM/Hedera IDs and short observations; never export a browser profile, wallet object, secrets or signatures. Local role labels do not establish on-chain permissions.

| Check | Required action / expected result | Status | Actual date / observation |
| --- | --- | --- | --- |
| Manual connection | Reload without a wallet prompt; Connect, reject once, then retry. Pending request cannot be duplicated. | Pending | — |
| Three roles | Assign Admin (also Escrow/test VC issuer), Seller and Buyer from three distinct accounts on 296. Independently compare each address/ID with live Testnet Mirror. | Pending | — |
| Assignment guards | A duplicate account cannot take another role. Clear before replacement; other roles remain intact. | Pending | — |
| Account/network switches | Change account; switch away from 296 and back. Stale verification disappears immediately; only a fresh valid Mirror result enables assignment. | Pending | — |
| Disconnect | Disconnect disables assignment and removes active verification. Reconnect explicitly. | Pending | — |
| Persistence / Retry | Reload restores only public addresses as awaiting verification. Connect manually to revalidate. If Mirror is unindexed/unavailable, keep unverified and retry manually when ready. | Pending | — |
| Deployment and config check | Without connecting, check chain, both fixed deployments and the latest Equity config version. Record the actual version; do not assume it remains 1. Confirm no signing, transaction or automatic network-switch prompt. Reload returns to Not checked. | Pending | — |
| Mobile layout | Check readable content, focus/buttons and no horizontal overflow. Mobile-wallet compatibility is not claimed. | Pending | — |

Record each outcome as Pending / Passed / Failed / Blocked with the actual date and observation. Do not force a live Mirror outage: timeout, storage denial, missing-provider and race cases already have controlled automated coverage. Record defects and define the evidence-backed repair scope; fix and revalidate before marking the affected requirement Passed.

## Next action / exact allowed files

Stop at this ticket boundary. Next work is human acceptance and its records, not ATS SDK integration/VC or dependency repair. Record-only exact files:

- `docs/HANDOFF.md`, `docs/plans/001-ats-first.md` (status/scope only), `AI_USAGE.md`.
- New `docs/evidence/011-t01-manual.md` and `docs/evidence/011-t01-manual.json`.
- New `docs/prompts/013-t01-manual.md` and `docs/ai-usage/017-t01-manual.md`.

This replaces the earlier unused manual-record filename reservation. Preserve historical evidence and the full pending T01 requirements. Keep public evidence English and about one page; link raw results. Commit records with the work, keep a clean boundary, and do not push/merge future work automatically. This integration alone is explicitly authorized. Do not assume old local servers remain running.
