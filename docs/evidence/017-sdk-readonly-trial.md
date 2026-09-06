# Isolated SDK read-only compatibility trial — September 6, 2026

**The isolated trial passed: four live Testnet SDK reads returned payload `1`.** This is a disclosed local ATS 8.0.0 compatibility patch. Application integration is the next proposed ticket.

The patch exports the genuine `SetNetworkRequest` and passes an optional caller-owned `queryProvider` into the SDK's RPC query adapter. Original request validation and the default provider construction remain intact. Twelve published ESM/CJS/type files across four logical targets are protected by version and original/patched SHA-256 checks; every file is validated before any write. Clean installation regenerates the existing protobuf decoders, then reapplies this patch. [Patch](../../scripts/patch-ats-readonly.mjs) · [authorization](../prompts/019-sdk-readonly-trial.md).

The isolated page reuses the fixed Testnet deployment preflight, supplies its verified Resolver EVM address to the real SDK, and owns one ethers provider per attempt. One native abort signal/deadline covers preflight, SDK fetch and response-body consumption. Transport permits only the expected Resolver config call, disables retries/redirects/CCIP, and destroys the provider at completion. Reload requires a new manual preparation/check. No wallet initialization or signer is used.

| Check | Actual result |
| --- | --- |
| TDD | Public type/export and installed-patch gates failed before repair; both now pass |
| Reproducibility | npm ci reapplies 12 files; reapplication changes zero; unknown version/content rejected before writes |
| Repository regression | 52 app/adapter tests + 36 proto tests, typecheck and build pass |
| Current app | Four dev/preview desktop/mobile smoke checks pass; all four built assets match evidence 014 |
| SDK browser/real Testnet | 80 controlled cases + 4 live reads pass across dev/preview and desktop/mobile sizes; zero wallet access, forbidden requests or page errors |
| Dependencies | Exact direct ethers 6.17.0 added; every resolved package otherwise unchanged |

Cancellation, invalidation, late responses, reload, duplicate actions and manual retry pass. Shared deadlines, including delayed body consumption, finish in 10,001–10,003 ms. Invalid payloads, wrong chain/address, missing code, 429, network/RPC errors, redirects and OffchainLookup cannot produce success or automatic retries. Mobile results use desktop Chrome viewport emulation.

Audit remains **80** findings with unchanged advisory IDs, severities, ranges and affected package paths; six entries' impact/fix suggestions differ. The existing TypeScript and optional Base peer problems persist. The SDK bundle inventory covers 348 package locations; two existing dfns packages omit license metadata. B2 remains required before VC/related installation changes.

Reproduce: `node docs/evidence/017-sdk-readonly-trial.mjs /external/playwright/package.json NEW-result.json --live`. Omit `--live` for controlled responses; `--smoke` checks only success. The delayed-body fixture supplies a synthetic Response stream; the late-response fixture deliberately ignores abort. These are not live outages. [Raw results, source hashes and complete dependency inventory](017-sdk-readonly-trial.json).

Sources: pinned ATS [request exports](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/in/request/index.ts), [network command handler](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/app/usecase/command/network/setNetwork/SetNetworkCommandHandler.ts), [RPC adapter](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/out/rpc/RPCQueryAdapter.ts); ethers [per-request hooks](https://docs.ethers.org/v6/api/utils/fetching/) and [provider lifecycle](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/providers/provider-jsonrpc.ts). Upstream notices are preserved. Passing this bounded trial does not establish broader SDK, VC, mainnet or transaction compatibility. T01 and remaining human acceptance stay open.
