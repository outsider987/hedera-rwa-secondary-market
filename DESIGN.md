---
name: HoldBook
description: A restrained trading console with inspectable Testnet evidence.
colors:
  ink: "#172b3a"
  action: "#155781"
  action-hover: "#0a3652"
  ground: "#f7f9fb"
  surface: "#fff"
  muted: "#485d6b"
  separator: "#d4dfe7"
  notice: "#e8f0f6"
  error: "#85351b"
  buy: "#17634b"
  sell: "#963e32"
typography:
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  market-heading:
    fontSize: "1.75rem"
    lineHeight: 1.4
  settlement-amount:
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.3
  showcase-heading:
    fontSize: "clamp(2rem, 5vw, 3.4rem)"
    lineHeight: 1.1
rounded:
  control: "4px"
spacing:
  action-gap: "0.5rem"
  column-gap: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.875rem"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.surface}"
---

# HoldBook interface direction

## Overview

The existing navy/light/system-font console now includes the T08 settlement
workbench and a separate evidence showcase. Its emphasis is on amounts, the
required account and the next explicit action. Preserve this established visual
identity; no new branding, imagery or font family is part of T08.

This describes implemented UI, not completed chain acceptance. T08 deployment,
signatures, transactions and all four human acceptance cases remain pending.
The showcase's verified snapshot applies only to historical T05 evidence.

## Colors

Ink and muted text sit on a light ground, with fine separators and flat notice
panels. Blue identifies actions and selected filters. Green Buy and red Sell
always accompany words; they do not encode verification status. Primary and
selected controls retain legible white text on hover. Errors remain visible
in dark rust, alongside explanatory copy.

## Typography

Use the system font stack, tabular numerals and concise English. Body copy is
16px/1.6, generally limited to 72ch. The app header is 1.5rem; Market title is
1.75rem and panel headings 1.25rem. Settlement quantities use 2rem/1.3 at weight
650, with the HBAR total below at 1rem. The showcase has a responsive headline
limited to 17ch and a 1.2rem introduction. Full IDs wrap inside details.

## Layout

The console is at most 68rem wide with 1.25rem side gutters. Desktop Market
places the book left and the order or selected settlement panel right in equal
flexible columns, separated by a fine vertical rule and 2rem gap. This is a
consistent action area, not a sticky or fixed-position panel. My orders and
Matches use a lower 3:2 grid. At 1000px or below the lower panels stack; at
850px or below the upper panels stack. At 700px header and account rows adapt.

The order table retains its 32rem minimum width inside a keyboard-focusable
horizontal scroll region. Prices and amounts align right. Match selection moves
focus to the action heading. Native details keep raw IDs and evidence out of
the main reading path. Trade retains a flexible historical main area and 20rem
summary, stacking at 850px. Showcase balances use two columns and architecture
three; both stack at 700px.

## Elevation & Depth

Surfaces have no shadows. Borders, spacing and the notice tone establish groups
and hierarchy. Avoid decorative overlays or elevated card stacks.

## Shapes

Buttons and fields have 4px corners and at least 44px height. Details summaries
and review labels also provide 44px targets; navigation links provide 52px.
Keep square section boundaries and thin separators.

## Components

- Native hash navigation exposes Market / Trade / History / Settings; current
  navigation is underlined with `aria-current`. Keep the skip link and visible
  3px focus outline with 4px offset.
- Orders remain unfunded. Buy/Sell uses pressed-state buttons; review requires
  explicit acknowledgement before a manual signature. Open/All order filters
  expose original, matched, remaining and cancelled quantities. Cancel remaining
  quantity is distinct from Cancel settlement. Success persists until New order;
  account changes clear drafts and review consent.
- Matches defaults to Active, with Needs your action / Completed / All options.
  Admin can inspect every match. The settlement header separates account identity
  from buying or selling this match. Its amount, lock/payment state, required
  account and UTC expiry lead the panel; details contain terms and public JSON.
- Settlement progress separates lock (step 1/2), confirmation (step 2/2), buyer
  review, unknown submission, verified delivery and verified return. Expired
  means reclaim is required, not that the shares returned. A fee and transaction
  link appear when the selected saved operation has verified evidence.
- Visible Market polls every two seconds. Its connection live region announces
  state changes while the ordinary last-update text records freshness. Failed
  reads retain prior data and disable operations requiring fresh state. Recovery
  details preserve the original operation/hash; querying never resubmits it.
- Only settlement review/progress/result switches fade, using Motion opacity
  0→1 over 160ms. Reduced-motion preference sets opacity to 1 and duration to 0.
  Tailwind uses the `hb` prefix and imports theme/utilities without Preflight.
- Trade displays Completed fixed trade and offers only historical verification
  at block 40247352. History preserves T05's journal and earlier lifecycle data.
  Do not restore its former Setup / Lock / Buy mutation workflow.
- The static showcase offers a historical transaction timeline, balances,
  architecture, case selection and public JSON download. Its four T08 cases
  currently display expected amounts and Pending manual acceptance, with no
  invented transaction timeline. No API or wallet is required to view it.

## Do's and Don'ts

- Do keep current state, fixture captures and verified historical results distinct.
- Do explain who acts next and preserve keyboard focus through panel changes.
- Do keep full terms and recovery available through native details.
- Don't imply an order reserves funds or an expired Hold has been returned.
- Don't label T08 cases verified before actual manual evidence is recorded.
- Don't expand motion beyond the approved state transitions or add Animate UI.

Sources: [Market](src/MarketPanel.tsx), [settlement](src/SettlementPanel.tsx),
[Trade](src/TradePanel.tsx), [showcase](src/showcase.tsx),
[styles](src/styles.css), [T08 browser evidence](docs/evidence/037-t08-browser.json).
Browser fixtures establish only their recorded scenarios; real MetaMask and
full T08 acceptance remain separate requirements in [spec 004](docs/plans/004-matched-settlement.md).
