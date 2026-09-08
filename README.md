# HoldBook

A local console for holding, transferring and releasing fictional NOVA shares
with Asset Tokenization Studio on Hedera Testnet.

**Verified flow: Hold 10 → Buyer KYC → Execute 6 → Release 4.**
Seller finishes with **94**, Buyer with **6**, and **zero shares held**.
These are recorded results from September 8, 2026, block **40241114**.

## Review the demo

- **[Two-minute demo script](docs/DEMO.md)** — what to show and say.
- **[Flow and architecture](docs/ARCHITECTURE.md)** — the recorded sequence and system diagram.
- **[Acceptance report](docs/evidence/029-t04-manual.md)** — four transactions,
  three expected rejections and verified final balances.
- **[Screenshot gallery](docs/evidence/029-t04-manual.html)** — open this file
  locally after cloning; keep its adjacent images. No wallet or server needed.
- **[Public verification data](docs/evidence/029-t04-manual.json)** — receipts,
  historical state, simulation results and replay harnesses.

The recorded run used four manually approved MetaMask transactions and one
Admin-signed Buyer credential. The three rejection checks were read-only
simulations; they have no transaction IDs. The walkthrough reuses these records.

## Run the console locally

Requires Node **24.19.0** and npm **11.17.0** (pins in `.nvmrc` and `package.json`).
From the repository root:

```sh
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. For an optional live read, use
**T04 · Hold lifecycle → Check current T04 state**; no wallet connection is
needed. The demo guide explains how current reads differ from recorded evidence.
Development: `npm run dev` at http://127.0.0.1:5173.

```sh
npm test
npm run typecheck
```

Recorded verification: **87 application + 36 protobuf tests**, typecheck,
build and dev/preview browser checks. [Implementation checks](docs/evidence/028-t04-implementation.md)
precede the completed manual acceptance linked above.

## Scope and provenance

NOVA is fictional; KYC claims are synthetic. This demonstrates an ATS asset
lifecycle. Order matching, payment settlement and public deployment are deferred.
Desktop MetaMask ECDSA is supported; native BBS is excluded.

[Known verification and dependency limits](docs/evidence/029-t04-manual.md) ·
[Third-party attribution](docs/ATTRIBUTION.md) · [AI assistance](AI_USAGE.md).
No project license has been selected. The unseen pre-event research draft and
eligibility questions remain [documented for Victor to resolve](docs/prompts/001-planning-record.md).
Maintainers: start with [AGENTS](AGENTS.md) and [HANDOFF](docs/HANDOFF.md).
