# Desktop Market clarity — September 11, 2026

The action panel now uses the same settlement-snapshot availability as its
illustration: NOVA, HBAR and required account remain unconfirmed before a
snapshot exists. Cached verified outcomes remain visible with stale-service
copy. Terminal outcomes precede historical eligibility restrictions; eligible
actions, pending recovery and historical mutation guards are unchanged.

Matches explains empty filtered results, missing data and stale snapshots;
Show all matches uses the existing filter. Accepted-order results link directly
to each returned match through the existing selection flow. The shared Matches
component also supplies these messages on Activity. Pixel identity, desktop
layout, amount precision and manual signing remain unchanged.

Actual checks:
- npm ci passed; 126 application tests and 36 protobuf tests passed.
- Typecheck, application build and showcase build passed.
- [Desktop browser script](055-market-clarity-browser.mjs) and
  [results](055-market-clarity-browser.json): dev 5173 and preview 4173,
  1440×900, headless Chrome 143, isolated public fixtures. Confirmed unknown
  fields, terminal result priority, filtered empty state, stale-data retention,
  keyboard Show all/direct-match actions and no horizontal overflow/page errors.
- [Dev capture](055-market-clarity-5173.png) and
  [preview capture](055-market-clarity-4173.png) preserve the historical
  restriction after direct navigation. Preview capture inspected visually.
- [Validation output](055-market-clarity-validation.txt) retains actual command
  logs. Existing 62 npm audit findings, install-script notices, Vite test HMR
  port notices and large application chunk warnings remain; no version changes.

No real wallet, signature, chain mutation or external browser request was used.
Fixture terminal/historical overlap is a UI regression case, not a finding
about current live deployment classification. Mobile acceptance is explicitly
deferred. Public fixtures prove rendering/navigation, not live settlement.
Victor still supplies human visual/MetaMask acceptance. Local only; no push or
deployment. No Appllama paid-library research or native simulator claim.
