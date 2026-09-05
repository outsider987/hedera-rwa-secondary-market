# T01b-2: Testnet deployment checks

Manual deployment checks work without MetaMask. **Live Testnet reads passed in dev and preview; Victor's real-wallet acceptance is Pending for September 6, 2026 (Asia/Taipei). T01a remains blocked.**

## Delivered

Check the RPC network, resolve the two fixed contract IDs through Mirror, then read runtime bytecode. No address is derived from a numeric ID. Queries have a 10-second deadline, manual retry and stale-result protection; reload does not connect or recheck automatically.

| Live Testnet result | EVM address | Runtime bytes |
| --- | --- | --- |
| Resolver `0.0.9212226` | `0xba2d5fc2083a0b8f164c50e65d782087fba18e0a` | 2,115 |
| Factory `0.0.9213391` | `0xd1f118a40f3b02883d35909ef2517e7edd78379d` | 390 |

RPC chain ID was 296. These reads establish code presence at check time, not ATS compatibility or a valid config version. No signature, transaction or transaction ID exists.

## Verification

| Check | Result |
| --- | --- |
| TDD | 20 core Node tests failed before implementation, then passed; a browser test also reproduced stale data after an unexpected query error before its fix |
| npm ci / test / typecheck / build | Passed; final suite: 31 Node tests |
| Dev / preview browser checks | 8 deployment scenarios and 20 existing wallet scenarios passed; desktop/mobile layout and keyboard checks included |
| Live public endpoints | Both deployments passed in dev and preview; zero wallet or forbidden requests |
| Bundle / dependencies | JS 310,557 bytes; no ATS/protobuf/Terminal3 modules; package manifest and lockfile unchanged |

## Pending

Victor's [complete manual checklist](../HANDOFF.md#victor-acceptance--scheduled-2026-09-06-asiataipei) remains open, including distinct accounts, live account Mirror lookup, rejection, switching, Clear/replacement, disconnect and reload. Mobile acceptance covers layout only.

Protobuf repair, Terminal3/BBS/tar remediation, ATS config payload >= 1 and synthetic VC positive/negative verification remain required. Installation still reports 83 vulnerabilities, including 2 critical; [existing peer mismatches](008-t01b-1-wallet.md#still-pending) remain unresolved. Deployment presence does not close T01 or authorize NOVA creation.

## Evidence / reproduction

[Checks and TDD](009-t01b-2-verification.json) · [Deployment browser results](009-t01b-2-browser-verified.json) · [Wallet regression](009-t01b-2-wallet-verified.json) · [Live reads](009-t01b-2-live-verified.json) · [Bundle](009-t01b-2-bundle.json)

Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build`; start dev and preview. With external Playwright 1.63.0 and desktop Chrome:

```sh
node docs/evidence/009-t01b-2-browser.mjs /absolute/path/to/playwright/package.json NEW-result.json
# Add --live for fixed public Testnet reads, without a wallet.
node docs/evidence/008-t01b-1-browser.mjs /absolute/path/to/playwright/package.json NEW-wallet-result.json
node docs/evidence/009-t01b-2-bundle.mjs NEW-bundle-result.json
```

[Accepted plan](../prompts/011-t01b-2-deployment.md) · [Work record](../ai-usage/014-t01b-2-deployment.md). Base: `66dea387a64ef385e5e84d3f7eb0f62699ed69cf`.
