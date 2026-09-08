# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed: React / Vite / TypeScript, exact versions in package.json.

## Users

Victor operates the local console with MetaMask. Mentors and judges observe
the workflow and inspect its public transaction evidence.

## Product Purpose

Prove a fictional ATS equity lifecycle on Hedera Testnet before designing a
secondary market. NOVA is synthetic, not a real security or identity service.

## Operating Context

Localhost English console, Traditional Chinese handoff, three distinct accounts:
Admin (also Escrow / test VC issuer), Seller and Buyer. Victor manually approved
the recorded MetaMask operations. The [judge demo](docs/DEMO.md) uses existing
evidence and optional read-only queries.

## Capabilities and Constraints

T02 NOVA creation, T03 Seller KYC / issuance and T04 Hold lifecycle are complete.
T04 demonstrates Hold 10, Buyer KYC, execute 6 and release 4, with three expected
read-only rejections. Creation and T03 issuance controls are closed.
No backend, order book, cash settlement, real KYC, public site deployment,
branding project, illustrative assets or animation in this slice.

## Evidence on Hand

[T04 acceptance](docs/evidence/029-t04-manual.md) verifies four transactions,
two simulation records and final Seller 94 / Buyer 6 / both held 0 at block
40241114 on September 8, 2026. The report links original screenshots and public
verification data, and preserves verification limits. Current reads may differ
from this historical snapshot.

## Product Principles

- Read chain state before claiming success.
- Keep pending, failed and verified outcomes distinct.
- Make the required signer and action explicit before opening MetaMask.
- Prefer native accessible controls and the smallest working implementation.
