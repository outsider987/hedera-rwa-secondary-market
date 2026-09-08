# T07 signed market intent — September 8, 2026

The user's supplied T06–T07 plan explicitly directs continuation after T06's
independent local commit. T06 is `a485afb`; this milestone implements the durable
Go/PostgreSQL order service and Market tab described in the effective
[spec 003](../plans/003-matching-engine.md). This is the same authorization,
not a separately inferred next ticket. The first commit remains independent.

User-selected pins: Go 1.27.1, PostgreSQL 18.6, pgx 5.11.0, go-ethereum 1.17.5;
existing npm lock and SDK patches untouched. Victor alone signs every order and
cancel in MetaMask on preview 4173; no private-key signer even in tests. Persist
unfunded requests exactly once, use EIP-712 and existing wallet guards, show
honest unmatched/matched/cancelled/expired quantities and recover by original ID.
Never reserve funds, pay HBAR, create ATS Holds or reuse the historical T05 swap.

Acceptance includes real PostgreSQL concurrency/durability tests, public signature
vectors and explicit integration verifier doubles, all existing app/Foundry
checks, browser dev/preview desktop/mobile/keyboard/cross-tab/late signatures,
and six actual human signatures on a fresh book. Scenario and exact files are
preserved in spec 003. Public JSON/captures/report/architecture are English.
Stop at local commits; no push/merge/public deployment or T08. No unseen
pre-event master plan was read or imported.
