# Main-app SDK config integration — September 6, 2026

**Integration passed: four live Testnet SDK reads returned payload `1`.** The page now offers **Prepare ATS SDK** and **Check SDK config**. Preparation loads the patched public package without accessing a wallet or making chain requests. Each check repeats the fixed Testnet deployment/viem preflight, then shows the separately validated SDK payload. The existing deployment-only check remains available.

One 10-second deadline covers preflight, SDK fetch and body consumption. Only the expected Resolver config call is allowed. Pending actions are serialized; cancellation, wallet transitions and reload invalidate old results. The provider is destroyed and requests aborted after each attempt. Retry is manual. No signature, transaction, VC or NOVA creation is implemented.

| Check | Actual result |
| --- | --- |
| TDD | Missing SDK entry points and initial UI failed first; implementation passes the focused checks |
| npm ci / test / typecheck / build | Pass: 53 app/adapter tests + 36 proto tests; retained patch survives clean install |
| Browser | 112 controlled + 4 live main-app SDK cases pass across dev/preview and desktop/mobile; 20 existing wagmi cases also pass |
| Dependencies / bundle | Manifest/lock unchanged; all 359 rendered package locations accounted for; SDK/protobuf/Terminal3 excluded from the initial static graph |

Timeout/body, invalid payload, cancellation, wallet transition, late response, reload, duplicate action, manual retry and load-failure gates pass. SDK checks add no wallet access beyond wagmi’s initial probe. Initial JS totals 562,314 bytes; the larger SDK code remains deferred. All 146 production assets match the tested preview. [Raw results, hashes and dependency inventory](018-t01b-4-sdk-integration.json).

Audit retains 80 findings and the two existing peer incompatibilities. Advisory IDs, severity and affected paths are unchanged; six impact/fix suggestions differ and none were applied. Two existing dfns packages still omit license metadata.

The SDK uses the disclosed local ATS 8.0.0 request/provider patch from [evidence 017](017-sdk-readonly-trial.md). This verifies the config read path, not broader SDK/VC compatibility. B2 and remaining human acceptance stay open. Controlled failures are not live outages; mobile checks use desktop Chrome viewport emulation.

Reproduce: `node docs/evidence/018-t01b-4-sdk-integration.mjs /external/playwright/package.json NEW-result.json --live`. Omit `--live` for controlled transport. The SDK itself is real in both modes. Delayed-body and late-response fixtures simulate body interruption and an abort-ignoring transport. Sources and versions: [ATTRIBUTION](../ATTRIBUTION.md). Authorization: [Prompt 020](../prompts/020-t01b-4-sdk-integration.md).
