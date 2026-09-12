# HoldBook — English submission copy

Prepared September 12, 2026. Copy the relevant sections into the actual dashboard;
its authenticated field names and limits have not been observed. This file is not
evidence of submission, team registration, prize selection or video upload.

## Project name

HoldBook

## Short description

A compliance-gated secondary market for ATS-issued demo equity on Hedera, connecting signed orders to verifiable atomic delivery and payment.

## Project description

Tokenizing an asset is only the beginning. HoldBook explores the next step: how eligible holders can agree on a secondary trade and verify that both delivery and payment really happened.

We created NOVA, a fictional equity asset, with Hedera Asset Tokenization Studio. Synthetic credential verification and on-chain KYC grants demonstrate the eligibility flow. Seller and Buyer place NOVA/HBAR limit orders using manually reviewed MetaMask signatures. A Go matching engine applies price-time priority, handles partial fills and cancellations, and persists commands and results in PostgreSQL.

A match is an agreement, not a settlement. The seller separately locks NOVA in an ATS Hold and confirms the matched terms. The buyer then approves HBAR payment. A custom settlement contract executes the Hold and pays the seller atomically, or reverts the transaction. The application verifies the receipt, events, historical balances and payment evidence, and can recover an unknown operation by its original ID or hash without automatically resubmitting it.

The Testnet acceptance includes normal and reverse trades, registered cancellation, expired-Hold reclaim and persistence across reload/restart. A wallet-free recorded presentation and evidence portfolio let reviewers inspect the results. NOVA and KYC are synthetic; this is a prototype, not a production exchange or real securities/identity service.

## How it is made

The frontend uses React, TypeScript and Vite, with wagmi/MetaMask wallet state, ATS SDK 8.0.0, and public RPC/Mirror reads. Terminal3 components support synthetic credential preparation and verification. The SDK runs in the browser; the Go service never signs transactions.

Go authenticates EIP-712 commands, serializes price-time matching and commits durable PostgreSQL results before acknowledging success. Solidity contracts integrate ATS Holds with explicit settlement terms and atomic HBAR delivery-versus-payment. Original-operation recovery checks receipt, calldata, contract runtime, events, balances and Mirror payment evidence.

GitHub Pages hosts the frontend, Cloud Run hosts the API, and Neon hosts PostgreSQL. Dependencies and local SDK/protobuf adaptations are pinned and disclosed. Automated application, decoder, contract and Go/PostgreSQL checks are distinguished from Victor's real, manually approved Testnet acceptance.

## Challenges and learning

The main challenge was keeping agreement, funding and settlement separate. A signed order must not silently authorize payment, a returned hash must not imply success, and an expired Hold must not be shown as returned until a return operation is verified.

We also worked through SDK/browser compatibility and bounded transport handling, wallet account changes, unknown operations, delayed indexing, historical balance verification and the distinction between wallet weibars and Hedera EVM tinybars. Documented recovery cases remain in the evidence rather than being rewritten as a perfect first attempt.

## Hedera integration

Suggested partner selection: **Hedera → Tokenization of Anything**, subject to the selected event participation track and organizer eligibility rules.

HoldBook uses Hedera Asset Tokenization Studio to create and manage NOVA equity, grant on-chain KYC and use Hold lifecycle operations. We extend that asset workflow with a NOVA/HBAR secondary order book and per-match atomic delivery-versus-payment. Hedera Testnet RPC and Mirror Node supply inspectable receipts, state transitions and payment/fee evidence. The custom settlement contract uses the original ATS asset, not a replacement token.

Key evidence: NOVA `0.0.10402368`; settlement contract `0.0.10419889`; [four settlement outcomes](evidence/038-t08-manual.md); [source verification](SOURCE_VERIFICATION.md); [architecture](ARCHITECTURE.md).

## Hedera developer feedback

ATS provides useful building blocks for equity eligibility and Holds. Browser integration would benefit from clearer examples combining wallet-controlled writes, cancellable reads and a complete Hold-to-delivery/payment flow. In the pinned SDK version, our bounded public-request/provider adaptations and protobuf compatibility work are documented with their actual tests and limitations. Clearer guidance on expired-Hold return, historical evidence and tinybar/weibar boundaries would also help developers avoid presenting an unknown result as a successful settlement.

## Links

- Application: https://outsider987.github.io/hedera-rwa-secondary-market/
- Repository: https://github.com/outsider987/hedera-rwa-secondary-market
- Architecture: https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/ARCHITECTURE.md
- Video file to upload: `HoldBook_v3_English.mp4`, approximately 3:43.93. No hosted video URL or platform upload is claimed.

## AI disclosure

Victor directed the project, chose scope and design decisions, reviewed observed results and manually approved all accepted wallet actions. AI tools assisted planning, implementation, debugging, tests, documentation and the disclosed presentation artwork. Exact work items and source attribution are indexed in [AI_USAGE](../AI_USAGE.md).

The demo uses Victor's recordings and speech. AI-assisted transcription and editing helped create English subtitles, select clips and mark accelerated silent waits; FFmpeg produced the final edit. There is no AI voiceover. Details are in [VIDEO](VIDEO.md). The final license, event-track eligibility, team details, upload preview and submission confirmation require human review.
