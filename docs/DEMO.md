# HoldBook — demo and judge guide

Current guide: September 12, 2026. This replaces the old narration script; original dated reports and Git history remain unchanged. Do not repeat completed chain actions.

## Inspect without a wallet

Open the [live app](https://outsider987.github.io/hedera-rwa-secondary-market/). Overview explains creation, eligibility, matching and settlement. Demo mode has manual scene controls and optional three-minute playback; it is a recorded explanation, not a new transaction.

The current presentation connects Match and Settle using **T08: 2 NOVA at 0.10 HBAR, total 0.20 HBAR, block 40258355**. KYC and issuance have earlier evidence. The illustrative certificate is not an artwork being sold, proof of real backing or legal ownership.

Market shows public orders and per-match settlement states. Activity contains outcomes and historical proof; Settings contains configuration. Dated balances/KYC are not current guarantees. There is no public onboarding for arbitrary wallets.

## English recording

`HoldBook_v3_English.mp4` is about **3:43.93**, with English subtitles and Victor's own speech, not synthesized voice.

| Video time | Content |
| --- | --- |
| 00:00–00:11.07 | Introduction to HoldBook and Hedera ATS |
| 00:11.07–00:23.33 | Fictional asset and NOVA |
| 00:23.33–00:43.20 | Synthetic credential verification and KYC grant |
| 00:43.20–00:46.73 | Short introduction to the market |
| 00:46.73–02:58.07 | Real order, signature, seller Hold/terms, buyer payment and result |
| 02:58.07–03:43.93 | Reflections, Settings/Activity and closing |

The practical recorded trade is **1 NOVA for 0.1 HBAR**, not the September 8 T08 normal case. Six silent waits are sped up and labelled. See [video edits, checks and rule uncertainty](VIDEO.md).

## Explain the flow

1. **Agreement:** parties sign limit orders; Go authenticates, matches and persists them. Matching transfers neither NOVA nor HBAR and reserves no funds.
2. **Seller commitment:** seller manually approves an ATS Hold, then separately registers the terms. The contract is the Hold escrow; Admin does not execute this matched trade manually.
3. **Buyer payment:** buyer reviews exact principal plus fees. One contract transaction executes delivery and payment atomically.
4. **Proof:** a hash is not success. Receipt, events, historical balances and Mirror payment evidence must pass verification.

Unknown operations query their original ID/hash, never automatically resubmit. Cancellation and expired-Hold reclaim are separate verified return paths; expiry alone returns nothing.

## Evidence for questions

| Question | Open |
| --- | --- |
| Was ATS used for creation and issuance? | [T02](evidence/024-vc-nova-manual.md), [T03](evidence/027-t03-manual.md) |
| What does compliance mean here? | [Synthetic-KYC rejection and permitted execution](evidence/029-t04-manual.md) |
| Are partial fills and recovery tested? | [T07 results](evidence/035-t07-manual.md) |
| Does the order book settle? | [T08 normal/reverse/cancel/reclaim](evidence/038-t08-manual.md) |
| How is payment atomic? | [Component and sequence diagrams](ARCHITECTURE.md#component-and-interaction-diagrams) |
| Can we inspect deployed source? | [Verification](SOURCE_VERIFICATION.md) |
| What did AI and Victor each do? | [AI index](../AI_USAGE.md), [video disclosure](VIDEO.md) |

T02–T05 and T07 are earlier milestones, not the current feature boundary. Original procedures, observations and recovery deviations remain in their reports. Do not fabricate a clean run or repeat a transaction to fill a missing screenshot.
