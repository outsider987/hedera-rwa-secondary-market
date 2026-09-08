# HoldBook interface direction

## Overview

T05 approved direction, September 8, 2026, now implemented. Victor reviews one
fixed Testnet trade; judges inspect historical evidence. The built interface
preserves the existing navy/light/system-font identity. Manual T05 acceptance
remains **Pending**.

## Colors

Navy text `#172b3a`, blue actions `#155781` (hover `#0a3652`), light ground
`#f7f9fb`, secondary text `#485d6b` and fine separators `#d4dfe7`.
Notices use `#e8f0f6`; errors use `#85351b`. Surfaces are flat, without shadows.

## Typography

`system-ui, sans-serif`; 16px body with 1.6 line height and tabular numerals.
Trade quantity and total are 36px, weight 650, line height 1.2. Copy is concise
English, with semantic headings and explicit account, state and action labels.

## Layout

The container is at most 68rem wide with 1.25rem side gutters. Desktop Trade
has a flexible main area and 20rem summary sidebar separated by a 3rem gap
and fine rule. At 850px or below, the summary follows the main area in one
column; at 700px or below, the header and account rows also stack.

## Components

- Native hash links provide Trade / History / Settings navigation, defaulting
  to Trade. The current link has an underline and `aria-current`.
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
Preserve the fixed trade, native controls and progressive disclosure. No new
branding, images, fonts, animation or UI packages.

Built sources: [App](src/App.tsx), [TradePanel](src/TradePanel.tsx) and
[styles](src/styles.css). [Evidence 031](docs/evidence/031-t05-implementation.md)
links six page captures and passing checks: four dev/preview desktop/mobile
cases using live reads with synthetic connections, two isolated pending/reload/
Web Lock cases and 14 genuine SDK cases with controlled HTTP/wallet responses.
These establish UI behavior within those boundaries; actual MetaMask approvals
and manual trade acceptance remain unobserved.
