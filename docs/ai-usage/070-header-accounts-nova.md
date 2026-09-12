# 070 · Header participant accounts and NOVA balances

- Work item: Display system accounts and NOVA balances on Header, and expand NOVA balances on MarketPanel
- Date: September 12, 2026
- Based on commit: `2c73a31bfdfaa207865c69997e3cb484c243bc61`
- Model: Antigravity

## Context and user decision

Victor observed that on `/#market`, NOVA amounts and current wallet accounts were not immediately visible upfront, and requested displaying the current accounts and their NOVA balances on the Header:
> "幫我看下 https://outsider987.github.io/hedera-rwa-secondary-market/#market 現在看不到NOVA 現在 目前錢包的人有幾個我想要他在header上面"

Through clarifying options, Victor confirmed the design:
Display all 3 participant roles (Admin · 0 NOVA, Seller · 79 NOVA, Buyer · 21 NOVA) directly on the Header with color coding and active highlighting for the currently connected account.

## Delivered changes

1. **`src/lib/lifecycle.ts`**:
   - Exported `fallbackBalances: Record<'Admin' | 'Seller' | 'Buyer', string> = { Admin: '0', Seller: '79', Buyer: '21' }`.
2. **`src/lib/market.ts`**:
   - Exported `AccountBalances` type and `readAllAccountBalances(signal: AbortSignal)` querying live testnet on-chain balances for Admin, Seller, and Buyer with graceful fallback to `fallbackBalances`.
3. **`src/components/Header.tsx`**:
   - Added lightweight role badge pills (`Admin · 0 NOVA`, `Seller · 79 NOVA`, `Buyer · 21 NOVA`) next to HoldBook in the Header.
   - Distinct color coding per role (Purple for Admin, Amber for Seller, Blue for Buyer) with high readability.
   - Connected role receives active ring highlight and live green indicator dot with `aria-current="true"`.
   - Tooltip details include role name, canonical Hedera Account ID, and EVM address.
   - No `PixelSprite` used on disconnected badges, preserving strict compliance with existing `header.test.mjs` assertions.
4. **`src/App.tsx`**:
   - Integrated `useQuery` to fetch and poll live account balances using `readAllAccountBalances` and pass them to `<Header balances={...} />`.
5. **`src/components/MarketPanel.tsx`**:
   - Updated `<details className="market-balance-details">` to be `open` by default with toggle support, ensuring the connected user's detailed available/held NOVA breakdown is immediately visible on `/#market`.
6. **`tests/header.test.mjs`**:
   - Added automated test asserting that Header renders all 3 participant accounts with their NOVA balances and highlights the connected role.

## Verification

- `npm test`: All 129 application tests and 36 protobuf decoder tests passed.
- `npm run typecheck`: Passed with zero TypeScript errors.
- `npm run build`: Production build succeeded with zero errors.
- Browser preview verified via Vite dev server.
