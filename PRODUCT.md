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

Prove one fixed atomic trade of 10 fictional NOVA shares for 1 Testnet HBAR,
building on the completed ATS equity lifecycle. NOVA and KYC are synthetic.

## Operating Context

Localhost English console, Traditional Chinese handoff, three distinct accounts:
Admin (original test VC issuer), Seller and Buyer. Admin was T04 escrow; the
fixed swap contract is T05 escrow. Victor approves each MetaMask transaction
on preview 4173. Trade / History / Settings separates the next action from
dated evidence and setup. The [demo](docs/DEMO.md) distinguishes manual T05
acceptance from completed T02–T04 history.

## Capabilities and Constraints

T02 NOVA creation, T03 Seller KYC / issuance and T04 Hold lifecycle are complete.
T04 demonstrates Hold 10, Buyer KYC, execute 6 and release 4, with three expected
read-only rejections. All T02–T04 mutation controls are closed.
T05 adds only the non-upgradeable NovaHbarSwap and its fixed HBAR payment.
Manual acceptance remains Pending: expected final Seller 84 / Buyer 16 / held 0
is not a live result. No backend, order book, real KYC, public site deployment,
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
