# HoldBook interface direction

## Overview

T06–T07 approved extension, September 8, 2026, now implemented. Victor reviews
unfunded NOVA/HBAR limit orders; judges inspect the book and historical evidence.
The built interface preserves the T05 navy/light/system-font identity. Manual
T07 acceptance remains **Pending**. T05 acceptance completed September 8 in
[evidence 032](docs/evidence/032-t05-manual.md); older Pending UI labels and
captures remain historical, not the current acceptance record.

## Colors

Navy text `#172b3a`, blue actions `#155781` (hover `#0a3652`), light ground
`#f7f9fb`, secondary text `#485d6b` and fine separators `#d4dfe7`.
Notices use `#e8f0f6`; errors use `#85351b`. Surfaces are flat, without shadows.

## Typography

`system-ui, sans-serif`; 16px body with 1.6 line height and tabular numerals.
Trade quantity and total are 36px, weight 650, line height 1.2. Copy is concise
English, with semantic headings and explicit account, state and action labels.

## Layout

The container is at most 68rem wide with 1.25rem side gutters. Desktop Market
places the order book left and the order ticket right in two flexible columns,
separated by a fine vertical rule and a 2rem gap. The ticket starts with the
active role, address suffix and Testnet label. Buy/Sell are visible pressed-state
buttons; green/red distinguish direction alongside text, with deep blue retained
for primary actions. Prices and quantities align right.

My orders and Matches share a lower 3:2 grid. At 1000px or below, histories
stack; at 850px or below, the book and ticket stack in DOM order. My orders uses
Open/All filters and a compact semantic table. On narrow screens only its table
scrolls horizontally, preserving legible headers and 44px action targets.
Native details keep full IDs, expiry and cancelled/expired quantities available.
Accepted requests show a result instead of the form; New order explicitly starts
a blank draft. Results are labelled as quantities when processed; live quantities
remain in My orders. Account changes clear amount fields. Pending requests keep
new-order controls unavailable, including after reload.

The retained desktop Trade
has a flexible main area and 20rem summary sidebar separated by a 3rem gap
and fine rule. At 850px or below, the summary follows the main area in one
column; at 700px or below, the header and account rows also stack.

## Components

- Native hash links provide Market / Trade / History / Settings navigation,
  defaulting to Market. The current link has an underline and `aria-current`.
- Market leads with NOVA / HBAR and **Funds are not reserved**. Native side,
  whole-share quantity and HBAR price fields show the maximum intent amount.
  Seller and Buyer can each buy or sell; Admin is view-only. Review shows the
  account, action, amounts and UTC deadlines, with an explicit acknowledgement
  before manual EIP-712 signing in MetaMask on production preview 4173.
- The book separates asks (lowest first) and bids (highest first), with honest
  empty rows. My orders exposes remaining, matched, cancelled and expired
  amounts plus owner-only cancellation review. Matches says **Matched · Not
  settled**; order and match identifiers sit in native details.
- Visible Market polls every two seconds. The live region announces only the
  connection state, Live or Offline; the adjacent last-update time is ordinary
  text so routine polls do not repeatedly announce it. Offline retains the last
  received data and disables submissions. Saved pending requests expose their
  original ID and query-only recovery; unknown outcomes never automatically resend.
- Trade leads with **10 NOVA**, **0.1 HBAR per NOVA**, **1 HBAR total** and
  Setup / Lock / Buy / Complete progress. Cancellation changes Complete to
  Returned. One primary next action accompanies the required account; a
  cancellation review consistently identifies Seller and its selection state.
- Review shows account, chain, value, asset, recipient and UTC expiry. A native
  checkbox gates approval; manual transactions require production preview 4173
  and Victor's MetaMask approval. Read-only checks are labeled separately.
- Native details disclose addresses, calldata, expiry basis and recovery.
  Pending operations open the recovery details; saved intent and any known
  hash are retained. Unknown outcomes cannot be resubmitted. Errors and statuses
  remain visible; unchecked balances have an explicit empty state.
- History separates the T05 saved journal and read-only T02–T04 history from
  current Trade snapshots. T04 labels its verified block 40241114 and 94/6
  balances. Settings contains account bindings, network and deployment checks.
- Buttons and inputs use 4px corners. Buttons, fields, summaries and the review
  label have 44px minimum height; navigation links have 52px. A skip link and
  visible 3px focus outline support keyboard use.

## Do's and Don'ts

Keep current reads, saved progress and verified historical results distinct.
An unfunded match proves neither reservation nor settlement. Preserve the
historical fixed trade, native controls and progressive disclosure. No new
branding, images, fonts, animation or UI packages.

Built sources: [App](src/App.tsx), [MarketPanel](src/MarketPanel.tsx),
[market](src/market.ts), [TradePanel](src/TradePanel.tsx) and
[styles](src/styles.css). [T07 evidence 034](docs/evidence/034-t07-implementation.md)
records dev/preview desktop/mobile checks. Captures show a real API with an
empty book and a controlled wallet provider; populated order/match rendering
uses an SSR fixture. Neither establishes real signed orders or live trades.
[Manual evidence 035](docs/evidence/035-t07-manual.md) remains Pending until
Victor's six manual MetaMask signatures and acceptance observations are recorded.

Historical [evidence 031](docs/evidence/031-t05-implementation.md)
links six page captures and passing checks: four dev/preview desktop/mobile
cases using live reads with synthetic connections, two isolated pending/reload/
Web Lock cases and 14 genuine SDK cases with controlled HTTP/wallet responses.
Those checks established UI behavior within those boundaries; subsequent real
T05 approvals and completed manual acceptance are recorded separately in 032.
