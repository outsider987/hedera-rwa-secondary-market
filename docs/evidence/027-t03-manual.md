# T03 manual acceptance — September 7, 2026

**Complete at verified block 40224162. Stop at T03.** Victor manually
performed six preview MetaMask transactions and one Admin-to-Seller VC signature.
The agent only queried public Testnet services; no signing or submission occurred
in the verification harness. Code base: `b099e01` on `feat/t03-kyc-issue`.

| Verified final field | Result |
| --- | --- |
| NOVA / chain / config | 0.0.10402368 / 296 / 1 |
| Admin roles / VC issuer | All three required roles present / registered |
| Seller KYC | Valid; Admin issuer; exact ID and Unix dates match grant |
| Seller available / held | 100 / 0 |
| Buyer available / held / KYC | 0 / 0 / not granted |
| Total supply / cap | 100 / 1000 |
| T02 creation-block supply | 0 at block 40209377 |

| Transaction (public explorer link) | Before → after block | Verification |
| --- | --- | --- |
| [Admin ISSUER role](https://hashscan.io/testnet/transaction/0xc13d62627f338103a8ea1ec3fa20b2db3dc888a725ccf35cfcc8bac890d046f2) | 40217061 → 40217062 | Complete |
| [Admin SSI_MANAGER role](https://hashscan.io/testnet/transaction/0x21beb3ae191c8516b3d98e5427819bfd775a8a8b3026dfde83e60811cdf5fb03) | 40221288 → 40221289 | Complete |
| [Admin KYC role](https://hashscan.io/testnet/transaction/0xc3322efc279672a14c54049bfcf95039c040e2bc0357126f08436ea515873140) | 40221714 → 40221715 | Complete |
| [Admin VC issuer](https://hashscan.io/testnet/transaction/0x295fd4e85ef148c7c3f09d5e39f2d63b266380d4526670a1d0ca2c275a49f6f5) | 40221996 → 40221997 | Complete |
| [Seller KYC](https://hashscan.io/testnet/transaction/0xb74802329031a287415455c470d02b0ea777d0f8ec4fc751a406345a1db67b10) | 40222968 → 40222969 | Complete |
| [Issue 100 NOVA](https://hashscan.io/testnet/transaction/0x6b9b42184a7d9490a34692c44b1b9e8f03a26d90e87bb451f64f06db26c05a5a) | 40223459 → 40223460 | Complete |

The real recovery functions independently queried RPC receipts, exact calldata
and asset events, historical before/after getters, Mirror results and sender
account mappings, consensus timestamps and transaction IDs. Current getters also
verified the fixed asset/config/cap/restrictions and all three account mappings.
`nextAction` returned no action. Issue used default partition 1, amount 100 and
empty data; all six transactions had zero transferred value.

VC ID: `urn:uuid:e52c3f39-f358-45b1-9c82-cc582c79e450`. Unix validity: `1788788191`–`1789393291`.
The public VC digest, Admin issuer, Seller subject and floored Unix-second dates
agree with the KYC record. Screenshot and export (9) show genuine application
verification and expired/tampered/wrong-subject rejection. Full VC/proof remained
in memory and was not exported or independently replayed; this is synthetic KYC.

[Public records, hashes, checks and replay harness](027-t03-manual.json) and
[standalone screenshot report](027-t03-manual.html) retain eight original images
and exports (5)–(12). Export (7) is the earlier confirmed state; (8) is complete.
(11)/(12) are the same issuance record. No SSI-only export was supplied in this
set: its screenshot hash was independently recovered. The latest user screenshot
is a journal, not a final balance table; current values above are live RPC reads.

Validation: npm ci, 75 app + 36 proto tests, typecheck/build and four clean
headless dev/preview desktop/mobile-viewport smoke cases passed. No code,
dependencies or patches changed; [implementation coverage](026-t03-implementation.md)
remains applicable. The harness timestamp-only correction is retained in JSON.
Native BBS exclusion, 62 audit findings, peer/dfns license omissions and event
eligibility limitations persist. No Buyer KYC, Hold, T04, push or merge.
