# T05 — One atomic NOVA / Testnet HBAR trade

Status: implementation and automated checks delivered September 8, 2026;
manual Testnet acceptance Pending. See [evidence 031](../evidence/031-t05-implementation.md).
`based_on_commit: d85d19ca95fef467abf327a0620372c9b9f9ea88` (merged main).
Branch: `feat/t05-atomic-trade`. Stop at local commits; no push or deployment by an agent.
The [supplied plan](../prompts/027-t05-atomic-trade.md) authorizes this ticket and
supersedes the earlier deferral of a payment leg/custom contract only for this swap.
The exact allowed files are enumerated in [HANDOFF](../HANDOFF.md).

## Fixed trade and prerequisites

Victor switches the original three accounts on one computer. Admin manually
deploys NovaHbarSwap; Seller uses the genuine ATS SDK to hold 10 NOVA with the
swap as escrow, Buyer as target and empty data; Buyer pays exactly 1 Testnet HBAR
and receives all 10 NOVA in one transaction. Normal flow: three individually
approved MetaMask transactions on http://127.0.0.1:4173. Network fees are additional.
The non-upgradeable swap has no Admin purchase or withdrawal privilege.

Retain NOVA 0.0.10402368, its original public account bindings, default partition,
chain 296, config 1, decimals 0, supply 100 and cap 1000. Before starting, verify
Seller available 94, Buyer available 6, both held 0, no active Holds, valid KYC
and no unresolved operations. Stop on changed state, expired KYC or pinned ATS
incompatibility; record diagnostics without renewal or SDK/deployment fallback.
Fix expiry to the reviewed block timestamp +86,400 seconds and preserve that
block. Both KYC records must cover expiry before deployment and Hold creation.
Derive the Hold ID from HeldByPartition, never from an assumed counter.

## Contract and transaction boundaries

Fixed asset, partition, Seller, Buyer, quantity 10 and price 1 HBAR; expiry is
fixed at construction. Mutation entry points: settle(holdId), cancel(holdId),
reclaim(holdId). Buyer alone purchases; Seller alone cancels before expiry or
reclaims after expiry. Terminal state prevents another settlement. Verify the
full Hold and mark completion before external calls; delivery or Seller payment
failure reverts all effects. Check the pinned ATS boundary at exact expiry.

Integer units only: wallet value 10^18 weibars; Solidity msg.value and Seller
payment 10^8 tinybars. Source: [Hedera Ethereum transactions](https://docs.hedera.com/native/smart-contracts/ethereum-transaction).
Keep the existing ATS path's zero-value guard. Add a distinct exact transaction
guard for constructor bytecode/arguments, contract calls and payable value.
Reuse wallet review, session lease, Web Lock and existing public read clients.

Use a separate whitelisted public T05 journal: persist intent before asking
MetaMask; save the hash immediately, including a late hash after invalidation;
run one recovery with a total 180-second deadline. Unknown outcomes permit
explicit original-hash recovery only. No automatic retry on rejection, timeout,
reload or indexing delay. Verify deployment receipt, constructor and runtime
code; settlement needs same-hash ATS and swap events, Mirror identities and
HBAR principal evidence independent of fees. Imported completion is not proof.
T04 controls become read-only history.

## Interface direction

Trade / History / Settings native navigation; Trade by default. Quote first:
10 NOVA × 0.1 HBAR = 1 HBAR. Show Setup → Lock → Buy → Complete, required account
and one primary action. Review and explicit checkbox precede each submission.
Keep pending/error/cancel controls visible; collapse addresses, calldata,
timestamps and recovery tools in native details. History labels verification
blocks separately from current balances and retains all three T04 rejections.
Settings contains accounts, SDK, network and deployment information.

Preserve navy, light background and system fonts; body 16px, main figures 36px,
consistent spacing and fine rules. Desktop trade plus summary, mobile one column.
English short copy, keyboard access, visible focus, 44px controls, no UI package,
images, branding work or animation. [DESIGN](../../DESIGN.md) records this direction.

## Acceptance

| Stage | Seller available | Buyer available | Seller held |
| --- | ---: | ---: | ---: |
| Start | 94 | 6 | 0 |
| Hold 10 | 84 | 6 | 10 |
| Settled | 84 | 16 | 0 |

Supply/cap stay 100/1000, Buyer held stays 0; Seller receives 1 HBAR principal.
Foundry 1.7.1 / Solidity 0.8.36, Paris target, local VM only, no CLI signer:
success, wrong Buyer, under/overpayment, duplicate settlement, wrong Hold,
expiry boundaries, cancel/buy races, reclaim, reentrancy, and complete rollback
on delivery/payment failure. App checks cover wrong signer/chain/runtime/calldata/
units, rejection, account change, cross-tab/reload/late hash/timeout/Mirror delay.
Testnet simulations before settlement: wrong Buyer and wrong payment; after:
duplicate purchase. Retain exact blocks/calldata; simulations have no tx ID.

Run npm ci, Node built-in tests, typecheck, build and contract checks. Inspect
dev and production preview desktop/mobile, keyboard, navigation, pending states
and request scope. Local VM covers cancellation/expiry/faults without repeating
T04 or adding live trades. Manual acceptance remains Pending until Victor's
three actual transactions and independent evidence establish every transition.
Then retain an English report, public JSON, screenshots and architecture update.
No backend, matching, multi-device sync, new asset, reissuance or public site.
