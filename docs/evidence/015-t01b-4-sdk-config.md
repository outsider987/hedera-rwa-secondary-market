# T01b-4: official SDK config — September 6, 2026

**Blocked before SDK config execution.** ATS 8.0.0 exposes `Network.setNetwork` but does not export its required `SetNetworkRequest`. Plain objects fail the SDK's validation. Application code and dependencies remain unchanged.

The missing constructor is confirmed through the real public entry in dev and production preview. The [request export list](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/in/request/index.ts) omits it, while [validation](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/core/validation/Validation.ts) requires the request's `validate()` method. No fabricated validator or deep import was used. `Network.init` also initializes transaction adapters, which exceeds this ticket's read-adapter-only scope. [Source](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/in/network/Network.ts)

| Check | Actual result |
| --- | --- |
| Public SDK prerequisite | Missing constructor and plain-object rejection reproduced on dev/preview, desktop/mobile |
| Live Testnet preflight | Existing **viem** reads return config version 1 on dev/preview; no SDK payload obtained |
| Request boundaries | Six expected preflight requests per run; no SDK RPC, wallet access or forbidden requests |
| Application regression | npm ci, 50 app + 36 proto tests, typecheck/build and four browser smoke checks pass; app assets unchanged |
| SDK query acceptance | Payload, timeout/cancellation, retry and redirect cases remain **unexecuted**, blocked by initialization |

Source review also found a transport issue to resolve before adoption: the SDK constructs a default ethers provider without exposing cancellation or transport options. Its runtime defaults include a five-minute request timeout, 429 retry and network-discovery retry. These are source findings, **not browser-verified failures** in this ticket. [SDK adapter](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/port/out/rpc/RPCQueryAdapter.ts), [ethers provider](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/providers/provider-jsonrpc.ts), [ethers fetch](https://github.com/ethers-io/ethers.js/blob/v6.17.0/src.ts/utils/fetch.ts)

Reproduce with `node docs/evidence/015-t01b-4-sdk-config.mjs /external/playwright/package.json NEW-result.json --live --gate`. The final assertion deliberately exits 1 because integration is blocked. Omit `--live` for controlled transport only. [Structured results, source hashes and full bundle inventory](015-t01b-4-sdk-config.json).

Mentor questions: What supported public API initializes only read adapters in 8.0.0? The broader initializer runs [MetaMask discovery](https://github.com/hashgraph/asset-tokenization-studio/blob/be4f860e408ec5b1a24d12feb6f872aabff69319/packages/ats/sdk/src/app/service/wallet/metamask/MetamaskService.ts), so it does not provide the wallet-independent path required here. How can that path enforce cancellation, a 10-second deadline, no automatic retry and fixed endpoints? No SDK upgrade or workaround is activated. B1 remains repaired; B2, full T01/VC and outstanding human checks remain open. [Scope](../prompts/017-t01b-4-sdk-config.md) · [Work record](../ai-usage/021-t01b-4-sdk-config.md).
