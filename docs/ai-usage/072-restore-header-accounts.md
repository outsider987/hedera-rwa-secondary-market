# 072 · Restore Header participant accounts and NOVA balances

- Work item: Restore Header participant accounts and NOVA balances
- Date: September 12, 2026
- Based on commit: `2f3190faa1b794dee17fae16e6ffadc00fff0250`
- Model: Antigravity

## Context and user decision

Victor requested re-applying the Header accounts and NOVA balance feature after clarifying the settlement lifecycle:
> "再返回一次吧,是我誤會了"

Per repository policy, previous dated history in `070` and `071` is preserved, and the restoration is recorded as a clean forward commit.

## Delivered changes

1. Re-applied the Header accounts pills and live testnet balance querying from `18dd807`.
2. Expanded `<details className="market-balance-details">` by default on `/#market` with manual toggle.
3. Restored `tests/header.test.mjs` verification test.
4. Preserved AI usage history across `070`, `071`, and `072`, indexing all in `AI_USAGE.md`.

## Verification

- `npm test`: All 129 application tests and 36 protobuf decoder tests passed.
- `npm run typecheck`: Passed with zero TypeScript errors.
- `npm run build`: Production build succeeded.
