# 071 · Revert Header participant accounts and NOVA balances

- Work item: Revert Header participant accounts and NOVA balances
- Date: September 12, 2026
- Based on commit: `18dd807b42820877cd3b322c5ba35e26b91a4886`
- Model: Antigravity

## Context and user decision

Victor requested reverting the previous push (`18dd807`):
> "我們revert 上次的推送吧"

Per repository policy, previous dated history in `docs/ai-usage/070-header-accounts-nova.md` is preserved, and the reversion is recorded as a clean forward commit.

## Delivered changes

1. Reverted changes to `src/App.tsx`, `src/components/Header.tsx`, `src/components/MarketPanel.tsx`, `src/lib/lifecycle.ts`, `src/lib/market.ts`, and `tests/header.test.mjs`.
2. Restored the exact state of `2c73a31bfdfaa207865c69997e3cb484c243bc61`.
3. Preserved AI usage history in `docs/ai-usage/070-header-accounts-nova.md` and indexed both 070 and 071 in `AI_USAGE.md`.

## Verification

- `npm test`: All 128 application tests and 36 protobuf decoder tests passed.
- `npm run typecheck`: Passed with zero TypeScript errors.
- `npm run build`: Production build succeeded.
