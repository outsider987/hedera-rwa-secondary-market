# Guarded NOVA creation and recovery — September 7, 2026

**T02 implementation is ready for human acceptance. No real NOVA transaction
or accepted human VC is recorded.** [Authorization](../prompts/023-vc-nova-implementation.md)
· [Final checks](023-nova-final-verification.json) · [Earlier checks and inventories](023-nova-implementation.json)
· [Final SDK boundary cases](023-nova-sdk-browser-final.json)
· [Offline UI captures](023-nova-gallery.html).

The existing console now reviews every fixed NOVA creation value, three public
accounts and the freshly resolved integer config. Actual creation requires a
current genuinely verified Seller VC, the retained T01 human checklist and
manual MetaMask approval, exclusively at production preview 127.0.0.1:4173.
Dev can review and recover a public hash. A second preflight returns changed
accounts/config to review before requesting any transaction.

A separate ATS 8.0.0 patch adds an owned BrowserProvider to the public
Network.connect entry and exports the genuine SetConfigurationRequest. Its
16 version/SHA-256 guarded ESM/CJS/type files cover four logical targets:
public exports, Network, RPC adapter and MetaMask service. Original request
validation, Equity.create, Terminal3 verifier and the existing proto/read-only
patch scripts remain unchanged. The managed path avoids wallet discovery,
connection requests and SDK wallet listeners; providers are released afterward.

The wallet boundary rechecks Admin/chain 296 and permits only the exact reviewed
Factory deployEquity calldata with zero value. Public intent is durably saved
before requesting approval; a returned hash is saved immediately. A native
same-origin Web Lock excludes concurrent creation tabs; unavailable locking or
storage disables creation. Rejection, awaiting approval, pending receipt,
unknown outcome, confirmed deployment, Mirror delay, mismatch and completion
remain distinct. Unknown/submitted records block a new deployment after reload.
The owned provider bounds confirmation lookup and stops ethers' otherwise
indefinite post-send retry loop. It never retries a transaction request.

Recovery independently verifies the RPC receipt, transaction, block binding,
exact Factory event and deployed address. Current metadata, supply, cap, config,
Admin roles, lists and flags are read at one recorded block. Rights/regulation
are explicitly sourced from the confirmed event, because the ATS Equity getter
omits rights. Mirror supplies security ID, consensus timestamp and the actual
Hedera transaction ID. Source or setting mismatches fail verification without
enabling another creation. Exports whitelist public fields and derive HashScan
links; neither a saved record nor SDK completion is treated as chain success.

Node checks use genuine ABI encoders/decoders with explicitly synthetic RPC/
Mirror boundaries. Browser probes execute genuine public SDK create calls with
rejected or timed-out synthetic providers, never a fake SDK success or valid
credential. They verify exact SDK calldata, request validation, provider release,
no discovery, immediate hash capture, bounded failure and native cross-tab
exclusion. App cases cover gates, storage denial, reload/export and cross-tab
record changes at desktop/mobile sizes on dev/preview. The raw JSON records
actual counts and failures repaired during TDD. The UI reviewer’s stale live
status finding was fixed and scored resolved.

Remaining: Victor's positive Seller VC on both origins, retained T01 observations
and browser/MetaMask versions, then exactly one manually approved preview NOVA
transaction and matching readback. Full dependency audit still has 62 findings;
peer and dfns license gaps remain, and native BBS is excluded. No KYC grant,
issuance, Hold, mainnet, push or merge is performed by this ticket.

Final checks: **101 Node tests** (65 app, 36 proto), npm ci, typecheck/build;
**84 browser cases** (12 NOVA UI, four managed SDK, 28 VC, 20 wallet and 20 SDK
config, including four live payloads 1) passed. The SDK/Terminal3 initial-load
exclusion and all 152 built asset hashes passed; 359 rendered package locations
are inventoried. A temporary shared Vite optimizer cache produced a dev HTTP
504 during concurrent harness runs. Finishing the legacy harness, restarting
dev and isolating the new harness cache restored all app regressions. The raw
JSON preserves that failure and the successful reruns; preview was unaffected.


A final source check found that unchanged SDK Mirror reads had no HTTP timeout.
A failing genuine-SDK browser case reached its 20-second harness deadline.
The managed RPC adapter now sets the configured Mirror instance's timeout to
10 seconds, within the same two guarded adapter files; the Mirror adapter and
Equity.create source are unchanged. Both browser modes rejected the stalled
Mirror query at approximately 10 seconds, with no wallet request and providers
released. Final clean-install/rebuild and boundary results are recorded separately
in the final-check JSON; earlier dated raw results remain intact.
