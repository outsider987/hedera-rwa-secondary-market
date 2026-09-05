# T01b-3: Equity config lookup

**Live Testnet Equity config version: 1**, read successfully in dev and preview on September 5, 2026. This verifies the on-chain value; **ATS SDK integration and Victor's real MetaMask acceptance remain pending**.

## Delivered

The existing button now checks deployment and config together. It verifies chain 296 and the fixed Mirror contract records, reads bytecode, then calls `getLatestVersionByConfiguration(bytes32)` on the verified Resolver for config ID `0x0000000000000000000000000000000000000000000000000000000000000001`.

Versions must be in 1..Number.MAX_SAFE_INTEGER. Resolver, Factory and config results remain separate; all must pass for overall success. One 10-second deadline covers the entire operation. Retry is manual, reload clears results, and late/error responses cannot restore previous verification. CCIP Read is disabled to prevent off-chain gateway requests.

## Verification

| Check | Result |
| --- | --- |
| TDD | Before implementation: 21 Node checks passed, 19 failed; browser reproduced missing config UI. A separate red test exposed default CCIP gateway lookup before it was disabled |
| npm ci / test / typecheck / build | Passed; final suite: 50 Node tests |
| Browser | 8 deployment/config scenarios and 20 wallet regression scenarios passed, including dev/preview, desktop/mobile, keyboard and stale-result checks |
| Live Testnet | Both runs returned version 1; Resolver 2,115 bytes and Factory 390 bytes; no wallet or forbidden requests |
| Bundle / dependencies | 393,895 bytes of JS across two chunks; no ATS/protobuf/Terminal3 modules; package manifest and lockfile unchanged |

The minimal ABI is checked against the installed contracts 8.0.0 artifact. Reads use `latest`, not a shared block snapshot. No signature or transaction occurred; no transaction ID exists. The version must be queried again before NOVA creation.

## Pending

The full [September 6 manual checklist](../HANDOFF.md#victor-acceptance--scheduled-2026-09-06-asiataipei) is retained and now includes config observations. T01a protobuf and Terminal3/BBS/tar issues, SDK integration and VC verification remain open. Installation still reports 83 vulnerabilities, including 2 critical; previous dependency peer failures are not waived. T01 is not complete.

## Evidence / reproduction

[Checks, TDD and ABI provenance](010-t01b-3-verification.json) · [Browser](010-t01b-3-browser.json) · [Wallet regression](010-t01b-3-wallet.json) · [Live reads](010-t01b-3-live.json) · [Bundle](010-t01b-3-bundle.json)

Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build`; start dev and preview. Use external Playwright 1.63.0 and desktop Chrome:

```sh
node docs/evidence/010-t01b-3-browser.mjs /absolute/path/to/playwright/package.json NEW-result.json
# Add --live for the fixed public Testnet queries.
node docs/evidence/008-t01b-1-browser.mjs /absolute/path/to/playwright/package.json NEW-wallet-result.json
node docs/evidence/009-t01b-2-bundle.mjs NEW-bundle-result.json
```

[Accepted plan](../prompts/012-t01b-3-config.md) · [Work record](../ai-usage/015-t01b-3-config.md). Base: `0828d797c403e13f150edc5b2d63170cb76a8689`.
