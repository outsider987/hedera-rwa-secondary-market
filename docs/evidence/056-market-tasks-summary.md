# Market next actions — September 11, 2026

Market now leads with Your next step. The connected account sees up to three
eligible matches requiring its action, exact NOVA/HBAR amounts and explicit
Open match buttons. A longer queue links to the existing Needs your action
filter; an empty queue links to Active. Unresolved order/settlement operations
take priority, including attempted-but-unknown local settlement records after
reload. Stale/missing snapshots suppress actionable task claims. Admin and
disconnected accounts receive distinct guidance.

Selected matches focus the action heading and show Matched → Lock NOVA →
Confirm terms → Pay HBAR → Complete, derived from existing settlement status.
Actual match buyer/seller addresses determine the next actor, including reverse
trades. Expiry/returned/historical/unknown states do not imply successful
completion. Review, manual approval, cancellation and original-operation query
controls remain; no wallet/core/API/contract changes or new dependencies.

Validation:
- npm ci passed; 128 application tests and 36 protobuf tests passed. Tests cover
  reverse roles, expiry equality, unregistered Hold return, terminal outcomes,
  historical exclusion, stale suppression, recovery priority and bounded tasks.
- Typecheck and app/showcase builds passed, repeated after final step alignment
  and setup-navigation cleanup.
- [Browser script](056-market-tasks-browser.mjs) and
  [results](056-market-tasks-browser.json): dev5173/preview4173 at1440×900,
  isolated headless Chrome143. Keyboard task selection, action focus, account
  switching, step changes, stale suppression, expiry/reclaim, returned states,
  reload recovery and no overflow/page errors passed. Final checks confirmed step alignment and advanced the controlled browser
  clock through the existing recovery-panel fade before capture.
- [Ready preview](056-market-tasks-ready-4173.png) and
  [recovery preview](056-market-tasks-recovery-4173.png) have equivalent dev
  captures. [Validation logs](056-market-tasks-validation.txt) retain checks.

Fixtures adjust public order sequence/status and browser time to exercise UI
states. The unknown-operation fixture has no signature or transaction hash.
External requests/local HTTP mutations are blocked. No real wallet, new chain
transaction, physical-device or mobile acceptance claim. Existing 62 npm audit
findings, install-script/HMR/chunk notices remain; no dependency changes.
Victor still supplies human visual/real-wallet acceptance. Local commit only;
no push, deployment or paid Appllama library usage.
