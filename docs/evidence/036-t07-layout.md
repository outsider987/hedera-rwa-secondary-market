# T07 trading interface refinement — September 8, 2026

The book now sits left of the order ticket. The ticket shows active role/address,
visible Buy/Sell buttons and blank amount fields. An accepted command shows its
result until New order; it explicitly distinguishes processed quantities from
live order state. Pending requests block new-order controls after reload.
My orders and Matches share 60:40 columns, stacking at 1000px. Open/All filters,
compact order rows and Cancel remaining N reduce scrolling and target ambiguity.
Narrow tables scroll locally; keyboard details retain 44px targets.

Validation: npm ci; 104 application and 36 protobuf tests; typecheck and production
build passed. Existing market SSR test was updated for the All filter. Six browser
cases (dev5173/preview4173 ×1440/980/390) passed layout, no page overflow, keyboard
details, filters, successful-result reload and pending blocking. Preview also
passed blank New order, cleared inputs on account change, and unsigned synthetic
cancel preparation with preserved matched2/remaining3 in review. The mechanical
detector returned no findings. Existing build chunk warnings remain.

[Runnable harness](036-t07-layout-browser.mjs), [browser results](036-t07-layout-browser.json),
[public/synthetic fixtures](036-t07-layout-fixtures.json),
[desktop](036-t07-4173-1440.png), [narrow window](036-t07-4173-980.png),
[mobile](036-t07-4173-390.png). Run the harness from the repo root with an installed
Playwright module path as its first argument; it launches an isolated Chrome.
Captures use exported public order data and controlled read-only wallet/HTTP,
not a real MetaMask acceptance session. No private signer or successful signature
is created. Three cancel preparations are intercepted fixtures; zero signed
submissions reach the API. Live Mirror account reads support the review guard.

Corrections during verification: an early test run overlapped npm ci and failed
on unavailable modules, then passed after installation. Initial visual checks
found narrow header wrapping and selected-button hover contrast; both were fixed.
The first cancel harness route accidentally intercepted Mirror reads and timed
out; scoping the fixture to the local origin resolved it. Only final successful
runs are counted. No Go/contract changes; their prior checks remain historical.

T07 manual acceptance stays Pending: Seller must cancel the remaining3 of order
2a362bc4488fb1a570a21b964bd232876207b84a1b258d0ab40f81eb2ba3e500, then provide
actual export/reload observations. All matches remain unfunded and unsettled.
No T08, push or merge. This commit also completes the previously interrupted
history-column change; manual035 screenshots are preserved.
