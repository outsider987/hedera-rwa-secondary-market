# HoldBook handoff

## Current boundary / Git base

**B2 dependency readiness research is complete; a scoped repair trial is proposed, not yet run. SDK config remains automated-passed, and Victor supplied a screenshot displaying payload `1`. B2, VC, NOVA and the remaining human checklist stay open; T01 is not complete.**

- `based_on_commit: 6a331f32404f07c977a0aecc14a41bcd9fc59797` (research base, not the commit containing this handoff). Previous base `95b00f958e5487a1680e3e277c49397d4ff79947` was verified as an ancestor.
- Current branch: `diagnostic/t01b-4-sdk-config`. Victor's request to proceed with VC/NOVA activated the prerequisite B2 research scope in Prompt 021. Commit work and documents locally; no automatic push/merge or next-ticket implementation. Read actual HEAD from Git.
- Historical integration: PR #2 merged as `c45a072`, including T01b-2 (`0828d79`) and T01b-3 (`5445208`). The screenshot record is at `2dfeff6`. Manual acceptance on **2026-09-06, Asia/Taipei** covers the recorded observations only; remaining requirements are preserved below.

Visual companion: [offline screenshot evidence HTML](evidence/012-t01-manual-gallery.html), with unchanged embedded screenshots and [hash manifest](evidence/012-t01-manual-gallery.json). No acceptance requirement is removed.

## Reading map

Read AGENTS and this file fully, then the shared rules and latest activation/outcome in the [plan](plans/001-ats-first.md). Future implementation requires its own activation.

| Need | Read |
| --- | --- |
| Current B2 research and proposed trial | [Readiness evidence](evidence/019-b2-vc-readiness.md), [Prompt 021](prompts/021-b2-vc-readiness.md) |
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

B2 research enumerated all 196 Terminal3 dependency/optional/peer locations, including the absent native branch. Nineteen audit entries intersect that closure; full audit remains 80 with unchanged advisory ranges. The proposed five dependency targets require six parent-scoped overrides and cross declared ranges; none are installed. Current ci, 89 Node tests, typecheck/build and four controlled unchanged-app browser smoke cases passed. Source analysis supports retaining ethers 6.17.0 for a trial, not VC compatibility. See evidence 019 for exact versions, licenses and limitations.

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

B2 research has reached its boundary. Commit these records locally and stop;
no automatic push/merge or next-ticket implementation. No VC or NOVA is created.
Existing local dev/preview remain available on 5173/4173.

Next proposed ticket: **isolated B2 dependency compatibility trial**, not activated.
Keep application/framework/ATS/Terminal3 pins and ethers 6.17.0. In a disposable
copy only, test these exact additional override entries (merge with retained
protobuf overrides; never replace them):

```json
{
  "@mapbox/node-pre-gyp@1.0.11": { "tar": "7.5.22" },
  "neon-cli@0.10.1": { "toml": "4.2.0" },
  "external-editor@3.1.0": { "tmp": "0.2.7" },
  "@digitalbazaar/http-client@3.4.1": { "undici": "6.28.0" },
  "@terminal3/vc_core@0.0.19": { "uuid": "11.1.1" },
  "@terminal3/bbs_vc@0.2.18": { "uuid": "11.1.1" }
}
```

These are published candidate versions, not a compatible or approved repair.
Do not change cryptographic implementations, disable the BBS verifier, enable
native install scripts or globally omit optional dependencies to hide findings.
Tar's license changes ISC to BlueOak-1.0.0. Preserve notices and inspect the
native/neon license files and iniparser metadata gap before claiming coverage.

Exact allowed repository files when separately activated:

- New `docs/evidence/020-b2-dependency-trial.mjs`,
  `docs/evidence/020-b2-dependency-trial.test.mjs`,
  `docs/evidence/020-b2-dependency-trial.md`,
  `docs/evidence/020-b2-dependency-trial.json`.
- New `docs/prompts/022-b2-dependency-trial.md`,
  `docs/ai-usage/026-b2-dependency-trial.md`; HANDOFF, plan, ATTRIBUTION, AI_USAGE.
- Scratch manifests/locks may change; repository manifest/lock/app/patch files
  remain unchanged. Any retained repair needs its own exact scope afterward.

Acceptance: TDD security checks fail against affected baseline dependencies,
pass against candidates; inspect callers before writing tests. Cover tar
traversal/depth/PAX/size boundaries and node-pre-gyp extraction API; toml
prototype/recursion and neon parsing; tmp path validation and external-editor
cleanup; http-client/Undici Agent behavior with controlled local HTTP; UUID
v4 format and affected buffer bounds. Do not execute upstream private-key
fixtures. Test actual public verifier loading and malformed/expired rejection
without any signer; positive Admin-signed VC acceptance stays pending for the
later manual VC ticket. No fabricated signature or mock verifier counts.

Compare the entire scratch lock, transitive audit, peers, licenses, optional
closure and browser bundle; no unrelated drift/new advisory accepted. Reproduce
with clean install and unchanged script approvals, retained proto/SDK gates,
89 Node tests, typecheck/build and SDK dev/preview checks. Do not infer native
binary compatibility from absent optional modules; if that path cannot be
verified, record the limit and request mentor guidance rather than clear B2.

Mentor questions if blocked: which supported installation repairs tar/toml/tmp
without changing ATS 8.0.0 or Terminal3 verification? Is a maintained WASM-only
BBS distribution available with identical public verification semantics? Can
Terminal3 validate the proposed UUID/Undici range changes? These questions are
drafted, not sent. No T02/NOVA or chain mutation follows automatically.
