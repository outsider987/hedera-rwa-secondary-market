---
name: HoldBook
description: A restrained trading console with a navy pixel motion infographic and inspectable Testnet evidence.
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
  demo-navy: "#101b2e"
  demo-ink: "#f4f2ec"
  demo-muted: "#becadc"
  demo-gold: "#ddbd80"
  demo-line: "#3e4a60"
  demo-hbar: "#fff"
  demo-cyan: "#79d3e6"
  pixel-ground: "#0b1423"
  pixel-surface: "#111d30"
  pixel-success: "#91d4b9"
  depth-buy: "#d8eee5"
  depth-sell: "#f2e6d0"
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
  demo-heading:
    fontSize: "clamp(2rem, 3.9vw, 4.2rem)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-.035em"
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
required account and the next explicit action. The authorized NOVA extension
adds an explanatory Overview and one generated fictional demo certificate within
the established visual identity. Asset facts remain accessible HTML outside the
illustration; it is not proof of ownership. No new font family is introduced.

T08 deployment and four human cases are verified in manual038. The showcase
contains dated T05/T08 evidence; historical balances are never presented as live.

The September 10 [pixel presentation](docs/plans/012-pixel-demo.md) leads
Overview with “Tokenized equity. Verifiable settlement.” Its restrained 16-bit
trading guild is a motion infographic for narrated recording: labeled roles,
inventory shares, an eligibility checkpoint and an order board explain the
separate recorded steps. NOVA and HBAR move together at atomic exchange, then
dated HTML proof takes priority. This replaces the earlier 3D presentation at
the user's request. The flat trading workbench retains its established visual
language; the detailed NOVA story and four T08 cases remain below the stage.

Two generated raster assets supply the trading hall and character/prop atlas.
They illustrate the story; all amounts, roles, eligibility states and proof
remain native HTML. No pixel font or gameplay controls are introduced.
The [Market/Header extension](docs/plans/013-market-characters.md) reuses those
assets for connected-account portraits and a static market floor. Header denotes
account identity; Market characters illustrate buy/sell sides across all accounts.

## Colors

Ink and muted text sit on a light ground, with fine separators and flat notice
panels. Blue identifies actions and selected filters. Green Buy and red Sell
always accompany words; they do not encode verification status. Primary and
selected controls retain legible white text on hover. Errors remain visible
in dark rust, alongside explanatory copy.

Within the presentation, demo-navy supports warm demo-ink text and cool
demo-muted annotations. Champagne demo-gold identifies NOVA, links, the opening
action and selected stage; white demo-hbar identifies the payment asset.
Demo-cyan identifies bids, the finite Hedera acknowledgement and visible focus
rings. Fine demo-line rules divide the stage and proof rows. Pixel-ground sits
behind the hall, while opaque pixel-surface labels keep text legible over art.
Pixel-success accompanies recorded eligibility and settlement labels. Market
depth uses pale depth-buy and depth-sell bars behind labeled quantities.
The market floor uses demo-cyan for Buy side and demo-gold for Sell side,
with demo-ink totals and pixel-surface backing behind the matching notice.
These scene colors retain
HTML asset, side and state labels; they do not replace the workbench's Buy/Sell
or connected-account semantics.

## Typography

Use the system font stack, tabular numerals and concise English. Body copy is
16px/1.6, generally limited to 72ch. The app header is 1.5rem; Market title is
1.75rem (1.5rem at 700px and below), with panel headings 1.25rem and the
Market order/book headings 1.125rem. Settlement quantities use 2rem/1.3 at weight
650, with the HBAR total below at 1rem. The showcase has a responsive headline
limited to 17ch and a 1.2rem introduction. Full IDs wrap inside details.

The presentation inherits system typography and tabular numerals. Its display
heading uses the demo-heading token, with a 13ch measure; Demo Mode expands
that to 16ch and uses clamp(2.4rem, 3.5vw, 4.2rem). At 700px and below,
ordinary presentation headings use 2.4rem. Explanatory copy uses 1.05rem/1.65
(0.95rem on mobile), while dates and source labels are quieter. Proof block
numbers use 1.7rem champagne text, reduced to 1.4rem on mobile. All quantities,
prices, states and proof links remain HTML rather than text baked into raster
art. Pixel role and quantity labels have opaque backing; completed order rows
retain full text opacity, using dashed borders to indicate the completed state.

## Layout

The trading console is at most 68rem wide with 1.25rem side gutters. The retained
recorded story uses the diagram/explanation layout described in its dated entry
below; account roles use three columns from md. Desktop Market
places order entry or the selected settlement first in the DOM and in the left
column, with compact pixel context and the book in the right column. Equal
flexible columns have a fine vertical rule and 2rem gap. The action area remains
in normal flow, with no constrained vertical scroll panes. Quantity and limit
price stay paired in equal columns with a .75rem gap. Matches precedes My orders
on both Market and Activity; Market uses a 2:3 history grid and Activity retains
3:2. At 1000px or below history stacks; at 850px or below the workspace stacks
in DOM order, placing entry and balance disclosure before the pixel floor and
book. At 700px header and account rows adapt.

The order table retains its 32rem minimum width inside a keyboard-focusable
horizontal scroll region. Prices and amounts align right. Match selection moves
focus to the action heading. Native details keep raw IDs and evidence out of
the main reading path. Historical Trade within Activity retains a flexible main area and 20rem
summary, stacking at 850px. Showcase balances use two columns and architecture
three; both stack at 700px.

Demo Mode expands only `.demo-mode` to min(100vw - 2.5rem, 96rem), centered
outside the console measure. `main` and navigation keep their normal width and
position across all four routes and Demo mode; Exit Demo remains below navigation.
The navy stage divides desktop space into 40:60 narration/visualization columns,
with a 24px gap and 32px side padding. Five equal-width stage buttons form a ruled strip below;
transport controls wrap underneath. At 700px and below, padding becomes 16px,
narration stacks above the scene, and the timer occupies its own line. Pixel
scenes have a 420px minimum height on desktop and mobile, with roles above two
asset lanes and the explanatory message below.
The five stages remain one compact row. Proof occupies the right scene column
on desktop over the dimmed exchange; on mobile it follows the narration in
normal document flow and the background scene is hidden.

Market's compact static floor sits above the book within its column. Buy and
Sell remain paired above a full-width matching notice at every breakpoint;
12px padding and 36×52px sprites keep this supporting context compact. The
pixel actors, exact open-order totals and live status remain visible when depth
is collapsed. The top-five price-level control starts collapsed. Expanding it
reveals paired native HTML bid/ask rows with flat quantity bars and optional
match outcomes; depth has no minimum height. The paired depth columns use a
24px gap, reduced to 12px at 700px and below. Full order tables remain beneath.

## Elevation & Depth

Workbench surfaces have no shadows. Borders, spacing and the notice tone
establish groups and hierarchy. Avoid decorative overlays or elevated card stacks.
The presentation gets illustrative depth from the generated pixel hall, displayed
at half opacity, and clipped sprites. Opaque label strips separate information
from scenery. The atlas has an opaque navy background, not transparency; SVG
viewports crop its individual props and characters, with pixelated rendering
and lighten blending. The market floor reuses the hall at quarter opacity;
header portraits sit on opaque pixel-ground. Proof uses a nearly opaque navy HTML panel over the
dimmed completed swap. No runtime lighting, Canvas or WebGL is used.

## Shapes

Buttons and fields have 4px corners and at least 44px height. Details summaries
and review labels also provide 44px targets; navigation links provide 52px.
Keep square section boundaries and thin separators.

## Components

- Native hash navigation exposes Overview / Market / Activity / Settings, with
  Overview as the default. Legacy `#trade` and `#history` resolve to Activity.
  Current navigation is underlined with `aria-current`; the skip link preserves
  the selected page. Keep the visible 3px focus outline with 4px offset.
  Route changes return to the top; clicking the current tab also returns to the
  top without shifting navigation through native fragment scrolling.
- Header shows a shared PixelSprite only for a recognized connected Admin,
  Seller or Buyer, beside the existing text and guarded wallet button. The
  decorative SVG is hidden from assistive technology; role text remains readable
  without the image. A 32×46px portrait sits in a 44×52px navy frame with 4px
  corners. Disconnected and unassigned accounts have no named-role portrait.
- One mounted MarketPanel owns drafts, intents and selected settlement across
  tabs. Extracted balance, book, order and match components reuse its state.
  Activity selections return to Market; Settings contains account/network/SDK
  setup. Tab changes retain controllers and existing wallet guards.
- Market section shortcuts focus and scroll to the order or selected settlement
  heading, Order book and Matches without changing the URL. A compact funds
  notice precedes the workspace. Unavailable, signing, pending and recovery
  notices remain visible outside optional balance/depth content.
- The native balance disclosure follows the order or settlement panel and starts
  closed. Its summary shows available and held NOVA when read, including refresh
  or update-error status; otherwise it identifies loading, unavailable or unread
  state. Expanding it exposes the existing account label, available/locked/total
  values, refresh control and source block/time. Failed reads retain explicitly
  stale values; absent values are not zero. Disconnected copy asks for an account.
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
- Market data polls every two seconds while Market or Activity is visible. Its connection live region announces
  state changes while the ordinary last-update text records freshness. Failed
  reads retain prior data and disable operations requiring fresh state. Recovery
  details preserve the original operation/hash; querying never resubmits it.
- Within the workbench, settlement review/progress/result switches fade, using Motion opacity
  0→1 over 160ms. Reduced-motion preference sets opacity to 1 and duration to 0.
  Tailwind uses the `hb` prefix and imports theme/utilities without Preflight.
  The original NOVA overview extension reused it without new dependencies,
  shadcn or motion; the current pixel presentation uses native CSS transitions.
- Activity contains the historical TradePanel with Completed fixed trade and
  verification at block 40247352, T05's journal and earlier lifecycle data.
  Do not restore its former Setup / Lock / Buy mutation workflow.
- The static showcase offers a historical transaction timeline, balances,
  architecture, case selection and public JSON download. Its four T08 cases
  display verified outcomes, actual balance transitions, fees and transaction links. No API or wallet is required to view it.
- The recorded demo has an opening composition, Tokenize / Verify / Match /
  Settle scenes and Prove over the completed swap. Numbered native stage buttons
  expose pressed state. The persistent fictional-equity/synthetic-KYC/Testnet
  disclosure and dated source labels distinguish separate records. Proof uses
  a definition list, row-headed balance table and public evidence links;
  network fee remains visually separate from principal.
- Demo Mode (`?demo=1#overview`) retains header, navigation, exit and operational
  notices while hiding the detailed story. Manual cues are the default;
  Previous, Next, Replay scene and Restart demo remain explicit. Timed playback
  starts only through Play 3-minute sequence and supports Pause/Resume. Manual
  navigation stops playback; leaving Overview, backgrounding or exiting pauses
  it without catch-up. Return retains the cue; reload starts at the opening.
  Space/Right, Left and Escape operate the demo while interactive controls
  retain native keys. Narration uses a polite live region.
- Pixel scenes use finite native CSS transitions: asset routes move over 900ms
  and scene reveals over 700ms, both with cubic-bezier(.77,0,.175,1); reveal
  opacity and inventory color change over 250ms with ease. The NOVA and HBAR
  routes share the same settlement cue and duration. Recorded eligibility moves
  an explanatory NOVA prop without claiming an asset transfer; matching only
  updates remaining quantities and reveals receipts. The final settlement cue
  adds a 900ms Hedera acknowledgement using cubic-bezier(.23,1,.32,1), ending
  visibly at rest. There is no continuous game loop.
- Reduced motion removes the pixel transitions and acknowledgement animation,
  showing endpoints. Hidden/background scenes unmount. Missing raster art leaves
  all role labels, amounts, state explanations, controls and proof readable.
  Three/R3F and their rendering boundary have been removed; no DPR policy or
  WebGL fallback applies to the current presentation.
- Read-only Market depth uses existing polling snapshots: exact HTML top-five
  levels per side, explicit empty/stale copy and resolved match outcomes.
  The static floor's “All open bids” and “All open asks” totals sum exact remaining
  quantities across all accounts and price levels, including reversed-role orders;
  they are neither balances nor the illustrated accounts' orders. Fresh server
  matches receive batched count/quantity feedback in the central status region.
  Its border and background highlight changes take 200ms ease. Changed depth
  ratios use a finite 200ms bar transform with cubic-bezier(.23,1,.32,1),
  with both transitions disabled under reduced motion. Initial, history and reconnect snapshots do not replay
  old matches. Bars are explanatory; existing order tables remain the
  detailed record and matching never depicts an asset transfer. Characters stay
  at rest; no NOVA/HBAR movement or continual animation appears on this floor.

## Do's and Don'ts

- Do keep current state, fixture captures and verified historical results distinct.
- Do explain who acts next and preserve keyboard focus through panel changes.
- Do keep full terms and recovery available through native details.
- Don't imply an order reserves funds or an expired Hold has been returned.
- Don't label T08 cases verified before actual manual evidence is recorded.
- Do keep workbench motion to its approved state transitions and active-operation
  spinner; the separately authorized recorded demo and Market depth use the
  finite presentation behavior above. No Animate UI.
- Don't combine T02/T03 issuance, T07 matches and the T05 swap into one fictional
  transaction, or make generated imagery necessary to inspect their evidence.
- Do reuse the existing pixel atlas for recorded scenes, recognized Header roles
  and labeled Market sides; keep authoritative values in HTML and depth bars flat.
  Don't add scores, rewards, fabricated trades or automatic
  wallet actions to the trading-guild metaphor.

Sources: [Market](src/components/MarketPanel.tsx), [settlement](src/components/SettlementPanel.tsx),
[Trade](src/components/TradePanel.tsx), [showcase](src/showcase.tsx),
[styles](src/styles.css), [pixel scenes](src/presentation/components/SceneView.tsx),
[presentation styles](src/presentation/presentation.css),
[Header](src/components/Header.tsx), [shared sprites](src/components/PixelSprite.tsx),
[Market depth](src/presentation/MarketVisualization.tsx),
[T08 browser evidence](docs/evidence/037-t08-browser.json).
The current Market/Header refresh follows source and the supplied preview
1440/390px Market and Demo captures. [Evidence052](docs/evidence/052-market-characters-summary.md)
records fixture browser acceptance; actual-wallet and human visual acceptance
remain separate. No new artwork, dependency or wallet behavior accompanies it.
The [Market layout direction](docs/plans/014-market-layout.md) supersedes that
extension's book-first arrangement. This documentation refresh inspected current
source and the 1440/390px dev Market and selected-settlement captures; the final
browser matrix belongs to [evidence053](docs/evidence/053-market-layout-summary.md).
It establishes no real MetaMask execution or physical-phone acceptance.
Browser fixtures establish only their recorded scenarios; real MetaMask and
full T08 acceptance remain separate requirements in [spec 004](docs/plans/004-matched-settlement.md).

## T08 balance visibility and busy feedback correction

The current account's balance sits below the Market heading and above the funds
notice. Three plain definition-list items (available, locked, combined total) wrap
on narrow screens; the account label, refresh control, source block and time stay
visible. Failed reads retain values with explicit stale copy; missing values use
an em dash rather than zero. Query keys include account/session; polling pauses
while wallet operations hold the shared lease. No balance number is animated.

A one-em CSS ring follows the active settlement status text, rotating linearly
once per second only while preparation, wallet waiting or verification is running.
It disappears when the call finishes, including failure; reduced motion disables
rotation and retains the status text. The user explicitly requested this feedback.

## Pinned console header

The console Header component retains the existing title, Testnet/account label
and guarded wallet button. Installed prefixed Tailwind utilities pin its opaque,
full-width wrapper at top: 0 while scrolling. The skip link layers above it;
root scroll padding leaves room for native anchor and keyboard navigation.

## Connected account colors

Header uses installed Tailwind purple-50/purple-900 for Admin,
amber-50/amber-900 for Seller, and blue-50/blue-900 for Buyer. The opaque pinned
header surface and explicit role label change together with the connected account.
These identify bound accounts, not the buy/sell side of an individual match or
transaction success. Disconnected and unassigned accounts retain neutral colors;
an unknown connected account is labeled Unassigned account.

## NOVA presentation review

Finish disposition: ship. The [design record](docs/design/nova-overview.md) and
[evidence 042](docs/evidence/042-nova-overview.json) document the extension and
passing dev/preview desktop/mobile presentation checks. The eight Overview,
Market, Activity and Settings captures use public fixtures; they establish no new
MetaMask execution or chain acceptance. Existing verified T08 cases remain complete.

## NOVA recorded story — September 10, 2026

Overview now uses a full-width story stage with Create NOVA / Trade NOVA chapters.
The original hero illustration is reused inside this stage. Four issuance steps
separate setup, synthetic credential, KYC grant and issuance. Trade uses the
committed normal/reverse/cancel/reclaim cases with step-specific proofs and
historical balances. Expiry has no transaction and retains registered balances.

Desktop uses a 3:2 diagram/explanation split, stacking at850px. Stage positions
are fixed thirds; NOVA and HBAR move together only at recorded settlement.
CSS transform transitions use700ms cubic-bezier(.77,0,.175,1) for explanation;
credential/lock opacity uses250ms cubic-bezier(.23,1,.32,1). Native buttons
retarget the motion, with no autoplay. Keyboard and reduced-motion preferences
use instant position changes. Existing navy, blue/amber stations and system type
remain; labels use12/14px, body16px and explanation headings24px.

This retained story now follows the new recorded-demo stage and is hidden while
Demo Mode is active. The description above records its own interaction grammar;
the new presentation's palette, controls and rendering behavior are documented
in the canonical sections of this file. This documentation pass inspected source
and supplied desktop/mobile captures; runtime acceptance and performance results
belong to [evidence050](docs/evidence/050-demo-experience.md). It does not establish
physical-device performance or Victor's narration/visual acceptance.

## Superseded 3D presentation — September 10, 2026

The first recorded-demo implementation used lit Three.js/R3F tokens, stations
and network geometry. Its finite moves normally took 1.4–1.6 seconds, with
endpoint rendering for reduced motion. Scenes were lazy loaded with next-scene
preload; hidden/background scenes unmounted. Market paired HTML depth with a
separate navy 3D scene. These choices and the rendering notes below describe
the implementation recorded in [evidence050](docs/evidence/050-demo-experience.md),
superseded by plan012; they are not current design instructions.

The Canvas boundary also probes native WebGL2 before mount because the pinned
R3F renderer initializes asynchronously. The temporary probe context is released;
unsupported browsers use the same static scene and HTML evidence without
mounting a visible Canvas. Context-loss events switch to that fallback as well.

Final presentation DPR is 0.75: the first software-rendered desktop measurements
showed long-tail frames at DPR1. All critical text remains native HTML. Physical
recording-device validation is required before increasing rendering resolution.

The current pixel documentation was checked against the implemented components
and styles. Actual runtime checks belong to
[evidence051](docs/evidence/051-pixel-demo.md); this refresh does not establish
physical-device performance or Victor's narration/visual acceptance.
