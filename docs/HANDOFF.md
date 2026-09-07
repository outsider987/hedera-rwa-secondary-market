# HoldBook handoff

## Current boundary / Git base

**T02 complete: Victor manually signed accepted Seller VCs on dev and preview,
attested to all retained T01 checks, and approved one preview NOVA deployment.
Independent receipt/event/current-getter/Mirror verification passed 56 checks.
Do not create another NOVA or advance to T03.**

- `based_on_commit: b526a75c2c089a735baa5dd7ecfdc331533a36cc` is the manual
  acceptance/repair base, verified in Git history; read actual HEAD from Git.
  Branch remains `diagnostic/t01b-4-sdk-config`; no automatic push/merge.
- [Evidence 024](evidence/024-vc-nova-manual.md), its public JSON and offline
  screenshot gallery preserve actual acceptance, original export/mismatch,
  repair and independent live results. T01 checkbox selections are operator
  attestations, not independent reproductions of every temporal behavior.
- Security ID **0.0.10402368**, address
  `0x261ce349df182988fa25d00868cf6cf434220c24`.
  Transaction hash
  `0xe1af1387ee185773e012a0e77b5c90ccffc5906ff46a1ac1dbb575b58c1ca05e`.
  Hedera transaction ID `0.0.7314364-1788760174-678049391`;
  consensus `1788760179.255892685`. Cap 1000, supply 0, config 1 and Admin's
  default management role match; rights are verified from the deployment event.
- Chrome 152.0.7977.76 / MetaMask 13.46.1 were operator-entered. Positive VC
  screenshots/public export establish observed application verification;
  full credentials/signatures were neither retained nor independently replayed.
- A real T02 readback defect was repaired within Prompt 023 authorization:
  Mirror reports the sender's numeric EVM form. Both that exact lookup and
  Admin's alias resolve to active account 0.0.10389090. `src/nova.ts` now reuses
  strict account validation after lookup; `tests/nova.test.mjs` covers wrong,
  deleted, missing and matching mappings. No local alias derivation or weakened
  transaction guard. Original mismatch remains in evidence 024.
- Clean npm ci, 65 app + 36 proto tests, typecheck/build and four live browser
  recovery cases (dev/preview at 1440/390 px) pass. After ci, dev was restarted
  to clear stale optimizer imports; failed and successful checks are in 024. Dependency lock and retained patch
  scripts are unchanged. Preserve evidence 021–023 and their historical results.
- Desktop ECDSA only; native BBS excluded. Remaining 62 audit findings, peer
  incompatibilities, dfns license omissions and event eligibility questions are
  not waived. No KYC grant, issuance or Hold was performed.

## Next action / exact allowed files (current)

Victor may reload preview 4173 and press **Query NOVA transaction** for the
saved hash, then export the complete public result. Reload invalidates the VC
but does not erase the transaction; querying does not need another VC signature.
Never clear the operation to create again. Dev can query the same asset.

The implementation/acceptance ticket stops here. Optional additional user
captures may be recorded in `docs/evidence/025-t02-followup.{md,json,html}`,
`docs/ai-usage/031-t02-followup.md`, `AI_USAGE.md`, `docs/HANDOFF.md` and
`docs/plans/001-ats-first.md` only. No additional implementation files are
activated. T03 requires a new explicit activation and exact scope first.

The sections below are historical. Their Pending states and older activation
prohibitions are superseded by Prompt 023 and evidence 024; their evidence and
acceptance requirements remain preserved.

## Historical boundary / Git base

The following records are historical; Prompt 023 and the current section above
control activation and support scope. The manual acceptance checklist remains
current and mandatory.


**The isolated B2 candidate passed 15 security/caller checks, 89 existing tests, 20 SDK browser cases and four unsigned VC browser cases. Its audit falls from 80 to 62, with zero affected Terminal3-closure entries. No dependency repair is retained; full B2 remains open because native binary compatibility is unverified. VC/NOVA and remaining human acceptance are unfinished.**

- `based_on_commit: 9d9f62f8fd1a4aa2b24069937540a8f5da4579fa` (trial base, not the commit containing this handoff). Previous base `6a331f32404f07c977a0aecc14a41bcd9fc59797` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`. Victor's “開始吧” activated the isolated trial in Prompt 022. His later push request was completed first: origin was verified at `9d9f62f`. Commit trial records locally; no automatic additional push/merge or next-ticket implementation. Read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). No acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest activation/outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current isolated B2 trial | [Trial evidence](evidence/020-b2-dependency-trial.md), [Prompt 022](prompts/022-b2-dependency-trial.md) |
| Prior B2 research | [Readiness evidence](evidence/019-b2-vc-readiness.md), [Prompt 021](prompts/021-b2-vc-readiness.md) |
| Current main-app SDK controls and checks | [Integration evidence](evidence/018-t01b-4-sdk-integration.md), [Prompt 020](prompts/020-t01b-4-sdk-integration.md) |
| Retained patch, isolated transport checks and limits | [Trial evidence](evidence/017-sdk-readonly-trial.md), [Prompt 019](prompts/019-sdk-readonly-trial.md) |
| Original public API gaps / repair rationale | [Read-only options](evidence/016-sdk-readonly-options.md) |
| Historical SDK failure / mentor questions | [Prerequisite evidence](evidence/015-t01b-4-sdk-config.md) |
| Retained decoder repair | [Decoder evidence](evidence/014-t01a-decoder-rebuild.md) |
| npm lock-resolution decisions | [npm resolution evidence](evidence/013-t01a-npm-resolution.md) |
| Delivered application and accepted config scope | [Config evidence](evidence/010-t01b-3-config.md), [Prompt 012](prompts/012-t01b-3-config.md) |
| Wallet behavior and prior dependency findings | [Wallet evidence](evidence/008-t01b-1-wallet.md) |
| Original schema hashes / compatibility oracle | Evidence 007 inventories and restored tests, referenced directly by the generator/test scripts; the stopped trial remains historical |
| Provenance / current sources | [AI_USAGE](../AI_USAGE.md), [ATTRIBUTION](ATTRIBUTION.md) |

## Verified / remaining requirements

- The original **deployment-only action** retains its viem check verifies RPC chain 296, fixed Testnet Mirror contract IDs and runtime bytecode. Resolver `0.0.9212226` resolves to `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` (2,115 bytes); Factory `0.0.9213391` to `0xd1f118a40f3b02883d35909ef2517e7edd78379d` (390 bytes). The four live trial-017 preflights confirmed these values. They are observations, not broader ABI/SDK compatibility guarantees.
- The app uses viem to read `getLatestVersionByConfiguration(bytes32)` from the verified Resolver for Equity config ID `0x0000000000000000000000000000000000000000000000000000000000000001`. The result must be bigint in 1..Number.MAX_SAFE_INTEGER and is recorded as a decimal string, not an SDK payload. Latest trial preflights returned version `1`; requery before creating NOVA.
- Existing app reads are wallet-independent, manually triggered, cancellable and never automatically retried/refreshed. One 10-second deadline covers the complete operation. Each attempt hides prior verification; stale/error results cannot restore it, and reload clears it. CCIP Read is disabled. Factory failure does not hide an independently verified config, but overall deployment success requires all three results. Reads use latest state, not a shared block snapshot.
- **Local SDK trial passed:** twelve published ESM/CJS/type files across four logical targets are protected by original/patched SHA-256 and ATS version 8.0.0. All files are checked before writes; clean installation reapplies the patch and reapplication changes zero. The genuine `SetNetworkRequest` is now exported, and optional `rpcNode.queryProvider` reaches `RPCQueryAdapter`. Original request validation and default provider construction remain intact. This is a disclosed local adaptation, not an upstream-supported API.
- **Main-app SDK controls:** press `Prepare ATS SDK`, then `Check SDK config`. Preparation imports the actual patched public SDK/ethers and validates a genuine request without initializing Network or requesting a wallet. Each check repeats the fixed viem preflight and feeds its fresh Resolver EVM address to `Management.resolveLatestConfigVersion`. Only a safe integer payload >= 1 is displayed. Viem version and SDK payload have separate labels/statuses; SDK failure never becomes an SDK success through the viem result.
- One 10-second deadline is passed into the existing preflight and shared through SDK fetch/body consumption. An owned provider allows only the expected config eth_call, disables HTTP/network retries, redirects and CCIP, and is aborted/destroyed when settled. The app and SDK singleton serialize pending reads. Cancel, wallet transitions and reload invalidate prior SDK results; late transport replies cannot restore them. Preparation and retries are explicit. No `Network.init`, deep import, fabricated validator, global transport override, signer, VC or transaction is used.
- Latest checks: clean `npm ci`, **53 app/adapter + 36 proto tests**, typecheck/build and **20 unchanged wagmi browser regression cases** pass. **112 controlled + 4 live main-app SDK browser cases** pass across dev/preview desktop/mobile sizes. Every live SDK payload was `1`; no forbidden requests or page errors occurred. The new real MetaMask human check remains pending. Controlled errors/races are not live outages; mobile checks use desktop Chrome viewport emulation. CJS patch hashes/syntax remain verified by trial 017 without a CJS runtime acceptance claim.
- App SDK/Terminal3/protobuf modules are now present in lazy production chunks, deferred until manual SDK preparation. All 359 rendered package locations are recorded in [evidence 018](evidence/018-t01b-4-sdk-integration.json); the initial static chunk graph excludes them. All 146 main production assets match the tested preview. Initial static JS is 562,314 bytes; the larger SDK chunks remain deferred. Both regenerated decoders still match evidence 014. The SDK includes broad upstream dependencies: membership does not prove every module executed or establish B2/VC compatibility. Two existing dfns packages omit license metadata; no license is inferred.
- Dependencies remain pinned. Root postinstall runs the existing proto generator then `scripts/patch-ats-readonly.mjs`. Exact ethers **6.17.0**, already installed transitively, is now direct. Removing that one root dependency field yields the exact previous parsed lockfile; no resolved package, override or install-script approval changed. No manifest, lock, retained patch or install-script approval changed during app integration. The earlier VC proposal named ethers 6.15.0: reconcile that scope before VC work; the current 6.17.0 read path does not prove VC compatibility.
- T01b-1 retains manual wagmi connection, distinct EVM/Hedera role checks, switch invalidation, cancellation, 10-second Mirror timeout, storage memory fallback and address-only persistence. Real desktop observations remain in [manual evidence](evidence/011-t01-manual.md); remaining checks below are not waived.
- **B1 bounded repair remains passed:** both original published schema inventories/hashes are checked before generation. Public APIs, wire/64-bit fixtures, malformed/recursive/length boundaries and both package load orders pass. Deterministic generated output survives clean installation. `npm test` includes the gate; skipping postinstall fails it. This is not a blanket protobuf safety claim. Historical failures in 007/013 remain unchanged.
- **Historical research is preserved:** unpatched ATS lacked the public request export and caller-controlled transport. `Network.init` discovers wallet providers and registers listeners even with pairing disabled. Evidence 016 found no qualifying official alternative; the new local patch resolves only the isolated read path. Mentor questions remain drafted in evidence 015, not sent. The current integration adds the verified local SDK read path while retaining the separate viem action.
- **B2 remains blocked:** Terminal3/BBS/tar must be addressed before VC integration or related installation changes. Audit remains 80 findings (23 low, 32 moderate, 24 high, 1 critical), with unchanged advisory IDs, severity, ranges and affected paths. Six entries' effects/fix suggestions differ from evidence 017; none were applied. Full `npm ls --all` still exits 1 for TypeScript 7.0.2 and optional Base 2.4.0 peer incompatibilities. Neither the read trial nor absence from the app bundle waives these findings.
- **Still required for T01:** remaining manual checks below and B2 resolution; synthetic Admin-signed VC accepted and expired/tampered/wrong-subject credentials rejected. Victor approves every future VC signature and transaction manually in MetaMask. No T02/NOVA creation is activated.
- The unseen pre-event research draft remains uninspected; Victor must resolve event eligibility and project-license questions. No real KYC or legal-compliance claims.

The isolated B2 trial applied six overrides to five dependency targets in a disposable copy. A lock-only install with nested placement changed 22 scoped locations, avoiding the unrelated UUID drift of an initial update command. The candidate's 192-location Terminal3 closure has no matching audit entries; the unchanged repository still has its original 80 findings. Full candidate audit is 62 (21 low, 25 moderate, 16 high), with no new advisory IDs. All 15 security/caller tests passed after seven baseline failures; normal ci kept the candidate lock stable and reproduced the retained repairs. All 89 existing tests, typecheck/build, 20 SDK browser cases (four live payloads 1) and four public-verifier browser cases passed. The VC cases only rejected unsigned malformed/missing-proof/expired fixtures; no valid credential was accepted. See evidence 020 for the full graph, licenses and limits.

After normal ci, the native package and 94 other optional closure locations are absent. Their source/API tests used a separate scripts-disabled installation and do not prove native binary compatibility. Iniparser's README supplies the previously missing MIT text; native BBS and both neon license texts are recorded. B2 is not cleared, and remaining non-VC audit/dfns/peer findings are not waived.

## Victor acceptance — scheduled 2026-09-06 (Asia/Taipei)

Use desktop Chrome with only MetaMask installed. Start `npm run dev` (5173); after build, `npm run preview` (4173). Run the desktop flow on both. Use only public EVM/Hedera IDs and short observations; never export a browser profile, wallet object, secrets or signatures. Local role labels do not establish on-chain permissions.

Core desktop results on dev/preview are recorded in [manual evidence](evidence/011-t01-manual.md) and its [structured observations](evidence/011-t01-manual.json), dated 2026-09-06. Screenshots establish three-role verification, duplicate prevention and deployment/config version 1. Victor confirmed manual reload connection, automatic network recovery, and normal disconnect/reconnect and rejection/retry. Preview interactions beyond screenshots are operator-reported.

| Remaining human check | Status |
| --- | --- |
| Duplicate clicks while connection is pending | Pending |
| Independent comparison of all three raw Mirror account records | Pending |
| Deployment check while disconnected; reload resets result; no signing/transaction/automatic switch prompt | Pending |
| Mobile layout, focus and overflow (no mobile-wallet claim) | Pending |
| New SDK controls on dev/preview: manual preparation, payload, cancellation and reload without a wallet prompt | Partial: screenshot shows prepared/verified and payload 1; mode, cancellation, reload and prompt absence remain Pending |

Browser/MetaMask versions and the single-wallet environment are not independently recorded. Do not require repeat screenshots for already confirmed behaviors.

Record each outcome as Pending / Passed / Failed / Blocked with the actual date and observation. Do not force a live Mirror outage: timeout, storage denial, missing-provider and race cases already have controlled automated coverage. Record defects and define the evidence-backed repair scope; fix and revalidate before marking the affected requirement Passed.

## Next action / exact allowed files

The isolated trial is complete. Commit records together and stop. Existing
committed work through `9d9f62f` was pushed as requested; this trial's new
records are local until a later push instruction. No merge, VC or NOVA creation.
Scratch copies and harness servers were removed/closed; existing 5173/4173
remain available. Repository manifest/lock/source/retained patches are unchanged.

Next proposed ticket: **retain the scoped dependency repair and explicitly
record the native support boundary**, not activated. Before clearing B2 for VC,
obtain a concrete support decision: is browser ECDSA using the published WASM
fallback the supported environment, with native BBS excluded, or must native
binary compatibility be demonstrated? Ask the mentor which supported path
satisfies ATS 8.0.0/Terminal3 pins without enabling unreviewed native scripts.
These questions are drafted, not sent. Absent optional modules do not establish
native compatibility.

Exact allowed files if that retained-repair ticket is activated:

- `package.json`, `package-lock.json`: only the six override entries in evidence
  020 and their verified 22-location lock delta; all existing pins/repairs remain.
- New `tests/dependencies.test.mjs`: verify the six resolved dependency edges
  even when optional modules are absent; no new testing framework.
- New `docs/evidence/021-b2-retained-repair.mjs`, `.md`, `.json`;
  `docs/prompts/023-b2-retained-repair.md`,
  `docs/ai-usage/027-b2-retained-repair.md`; HANDOFF, plan, ATTRIBUTION, AI_USAGE.
- No application, signer, credential UI, retained SDK/proto patch or install-script
  approval changes. No new Terminal3 direct pins in this dependency-only ticket.

Acceptance: reproduce evidence 020 security/caller, normal clean-install,
full lock/audit/peer/license/bundle and existing app checks; preserve upstream
notices, including tar's ISC → BlueOak-1.0.0 change. State the native support
boundary and remaining 62 audit findings explicitly. Do not label B2 complete
or start VC/NOVA until its outstanding support/verification requirements are
resolved. Every future VC signature and transaction remains manual in MetaMask.
