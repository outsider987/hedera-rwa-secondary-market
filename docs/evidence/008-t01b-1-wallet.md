# T01b-1: MetaMask account setup

Local wallet setup is implemented. **Victor's real MetaMask checks are pending; T01a security issues remain unresolved.**

## What works

- Connect MetaMask manually and display its actual address and network. Role assignment requires Hedera Testnet, chain 296.
- Assign Admin, Seller and Buyer after Mirror verification. EVM addresses and Hedera IDs must be distinct.
- Revalidate after account or network changes. Retry failed or timed-out lookups manually.
- Save only public role addresses. Reload requires manual connection and verification; storage failure shows a warning and keeps changes in memory.

Role labels do not prove on-chain permissions. This work performed no contract reads, signatures or transactions; no transaction ID exists.

## Verification

| Check | Result |
| --- | --- |
| npm ci / typecheck / build | Passed |
| Node tests | 9 passed |
| Real wagmi with a simulated provider | 20 cases passed: rejection, duplicate clicks, switching, disconnect, timeout, stale responses and storage failures |
| Dev / preview at desktop / mobile sizes | Passed: keyboard focus, layout, no automatic connection on reload and no unexpected external requests |
| Browser bundle | No ATS, protobuf or Terminal3; approximately 304 kB of JavaScript |
| Dependency changes | 8 package locations added; existing versions unchanged; no new advisory IDs |

Automation used synthetic accounts and Mirror responses. Mobile checks cover layout only. Human review and real-wallet acceptance are not claimed.

## Still pending

- **Victor:** verify three distinct accounts, connection rejection, network switching, disconnect and reload in desktop MetaMask.
- **Security:** audit retains 83 entries across 104 locations, including 2 critical entries. Resolve protobuf before restoring ATS decoding, and Terminal3/BBS/tar before VC integration or related installation changes.
- **Full dependency tree:** `npm ls --all` fails on 40 existing TypeScript peer mismatches and 1 new, unused optional Base wallet mismatch (2.4.0 installed; ^2.5.1 required). Versions were kept as authorized.

## Evidence and reproduction

[Checks and changes](008-t01b-1-verification.json) · [Browser results](008-t01b-1-browser.json) ·
[Lock diff](008-t01b-1-lock-diff.json) · [Peer comparison](008-t01b-1-peer-comparison.json) ·
[Audit before](008-t01b-1-before-audit.json) / [after](008-t01b-1-after-audit.json) · [Bundle inventory](008-t01b-1-bundle.json)

Run `npm ci`, `npm test`, `npm run typecheck` and `npm run build`.
Start dev and preview separately, then run with an external Playwright installation:

```sh
node docs/evidence/008-t01b-1-browser.mjs /absolute/path/to/playwright/package.json NEW-result.json
```

Implementation base: `25bc5de9a6e54ae3f4a8a257055f8cb07c319d3e`. [User authorization](../prompts/010-t01b-1-wallet.md).
