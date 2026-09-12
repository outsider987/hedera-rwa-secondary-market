# HoldBook — submission overview

September 12, 2026. Current judge-facing summary, superseding older milestone descriptions while retaining their original evidence and Git history. This is a prepared package, not a submission receipt.

**[Live application](https://outsider987.github.io/hedera-rwa-secondary-market/)** · [Repository](https://github.com/outsider987/hedera-rwa-secondary-market) · [Submission fields](SUBMISSION_FIELDS.md) · [Video](VIDEO.md)

## What it does

HoldBook explores what happens after tokenization: how eligible holders agree on a secondary trade and verify that delivery and payment actually completed. NOVA is fictional equity created with Hedera Asset Tokenization Studio. Synthetic credentials and on-chain KYC grants demonstrate eligibility, not real identity verification.

Parties place reviewed NOVA/HBAR limit orders with MetaMask EIP-712 signatures. A Go price-time matching service persists commands, orders and matches in PostgreSQL before acknowledging success. Matching does not reserve funds.

For an eligible new match, the seller separately locks NOVA through ATS and registers the exact terms. The buyer then approves payment. The custom contract delivers held NOVA and transfers HBAR atomically, or reverts. The API independently checks the original receipt, events, historical balances and payment evidence without possessing a signer.

## Actual results

| Capability | Recorded result | Proof |
| --- | --- | --- |
| ATS setup | NOVA 0.0.10402368, cap 1,000, initial supply 0 | [T02](evidence/024-vc-nova-manual.md) |
| KYC / issuance | Seller eligibility granted before issuance of 100 NOVA | [T03](evidence/027-t03-manual.md) |
| Compliance | Non-KYC rejection; later permitted execution and return | [T04](evidence/029-t04-manual.md) |
| Order book | Price/time matching, partial cancellation, reverse roles, persistence | [T07](evidence/035-t07-manual.md) |
| Normal settlement | 2 NOVA delivered / 0.20 HBAR principal, block 40258355 | [T08](evidence/038-t08-manual.md) |
| Reverse settlement | Buyer account sells 1 NOVA; Seller account pays 0.09 HBAR | [T08 JSON](evidence/038-t08-manual.json) |
| Cancel / expiry | Separate registered cancellation and expired-Hold reclaim, no payment | [T08 JSON](evidence/038-t08-manual.json) |

All four T08 cases were manually approved and independently checked. The actual acceptance used nine accepted order signatures and thirteen chain transactions, including deployment and a documented extra self-trade-prevented order. Reload and API restart preserved state. These are dated observations, not newly repeated trades or present balance guarantees.

The September 12 video shows a later **1 NOVA / 0.1 HBAR** trade. It is distinct from the 2-NOVA T08 normal evidence case and the historical fixed T05 **10 NOVA / 1 HBAR** demonstration.

## Judge entry points

Watch the English video, then inspect live Overview, Market and Activity without a wallet. Open the four-case report, [architecture](ARCHITECTURE.md), [source verification](SOURCE_VERIFICATION.md), and [README setup/checks](../README.md). Only the original demo accounts can create new trades; do not replay completed acceptance or restart the migrated local API.

Public deployment: GitHub Pages, Go on Cloud Run, PostgreSQL on Neon. This is a working Testnet prototype, not a production exchange. The natural partner target is **Hedera — Tokenization of Anything**: ATS Equity, synthetic VC, on-chain KYC and Holds, extended with a secondary order book and atomic settlement. [Integration and feedback copy](SUBMISSION_FIELDS.md#hedera-integration).

## Honest boundaries

- Current code, deployment, verification and CI outcomes are in [readiness evidence](evidence/057-submission-readiness.md).
- The English video is prepared, but platform upload/preview is unconfirmed. Labelled silent waits are sped up; speech is normal. Organizer acceptance of this editing choice is not asserted.
- [AI usage](../AI_USAGE.md), [attribution](ATTRIBUTION.md), actual specs/prompts and [video disclosure](VIDEO.md) are retained. All accepted wallet actions were manually approved by Victor.
- Fictional NOVA, synthetic credentials and Testnet 296 only; no real KYC, legal compliance, mainnet or production-safety claim. Existing dependency, peer and native-BBS limitations remain.
- Project-original software and associated documentation are [MIT-licensed](../LICENSE); third-party terms and historical verification metadata are explained in [LICENSING](LICENSING.md).
- Victor clarified on September 12 that there was no pre-event draft: he discussed topics with GPT and generated the draft later. This is his dated clarification, not an independent audit of the complete earlier chat or an organizer ruling. Prior records remain traceable.
- The authenticated ETHGlobal form, team/prize choices, video upload and final receipt have not been observed. This ticket does not submit the project to ETHGlobal.
