# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed: React / Vite / TypeScript, exact versions in package.json; local
Go API and PostgreSQL for the unfunded market, pinned in engine/go.mod and
compose.yaml.

## Users

Victor operates the local console with MetaMask. Mentors and judges observe
the workflow and inspect its public transaction evidence.

## Product Purpose

Demonstrate an unfunded NOVA/HBAR limit-order market, building on the completed
ATS equity lifecycle and one verified fixed atomic trade of 10 fictional NOVA
shares for 1 Testnet HBAR. NOVA and KYC are synthetic. A match does not prove
payment or delivery.

## Operating Context

Localhost English console, Traditional Chinese handoff, three distinct accounts:
Admin (original test VC issuer), Seller and Buyer. Admin was T04 escrow; the
fixed swap contract is T05 escrow. Victor approves every MetaMask transaction
and signature manually on preview 4173. Market is the default tab, followed
by Trade / History / Settings. Seller and Buyer may each buy or sell; Admin
is view-only in Market. The [demo](docs/DEMO.md) separates current T07 manual
acceptance from completed T02–T05 history.

## Capabilities and Constraints

T02 NOVA creation, T03 Seller KYC / issuance and T04 Hold lifecycle are complete.
T04 demonstrates Hold 10, Buyer KYC, execute 6 and release 4, with three expected
read-only rejections. All T02–T04 mutation controls are closed.
T05 adds only the non-upgradeable NovaHbarSwap and its fixed HBAR payment.
Manual acceptance completed September 8: Seller 84 / Buyer 16 / held 0,
Seller principal 1 HBAR, final verification block 40247352. See
[T05 evidence](docs/evidence/032-t05-manual.md).

T06 supplies price-time matching; T07 adds a local Go/PostgreSQL service and
responsive Market interface: order form/review, asks and bids, My orders,
owner-only remainder cancellation, Matches and whitelisted public export.
Commands require reviewed EIP-712 signatures; public intent is saved before
signing, and unknown outcomes query the original request without resubmission.
Visible Market refreshes every two seconds; offline data stays labelled and
blocks new commands. Only connection-state changes belong to its live region.
Manual T07 acceptance **passed with documented recovery** in [evidence 035](docs/evidence/035-t07-manual.md).

Funds are not reserved. Matches are labelled “Matched · Not settled”. T07
creates no ATS Hold, payment or settlement, and its matches have no chain
transaction IDs. T08 is not activated. No real KYC, public site deployment,
branding project, illustrative assets or animation is included.

## Evidence on Hand

[T04 acceptance](docs/evidence/029-t04-manual.md) verifies four transactions,
two simulation records and final Seller 94 / Buyer 6 / both held 0 at block
40241114 on September 8, 2026. The report links original screenshots and public
verification data, and preserves verification limits. Current reads may differ
from this historical snapshot.

[T05 acceptance](docs/evidence/032-t05-manual.md) records the completed fixed
trade at block 40247352; its dated evidence is independent of the current book.
[T07 implementation](docs/evidence/034-t07-implementation.md) records current
automated checks and dev/preview desktop/mobile captures of a real API with an
empty book and controlled wallet provider. Populated UI is covered by an SSR
fixture, not live trades. No real T07 signature or completed manual acceptance
is claimed by those checks.

## Product Principles

- Read chain state before claiming success.
- Keep pending, failed and verified outcomes distinct.
- Make the required signer and action explicit before opening MetaMask.
- Prefer native accessible controls and the smallest working implementation.
