# Market next actions — September 11, 2026

`based_on_commit: fb63d31055d23559cb13ea9c3f912fcf8fea5cc2`.
Victor said “go” to the proposed task-first desktop Market and selected-match
next-step flow. Retain current pixel identity and the four plan016 repairs.

Deliver a compact top-of-Market task area: unresolved operations first, then
fresh eligible matches requiring the connected account, waiting/no-task states,
and explicit navigation to existing review controls. Never auto-select a match,
submit, switch an account, or treat unavailable/stale data as actionable.
Selected matches show a native ordered progress list for the normal lifecycle,
the current responsible account and next action; expiry/return/historical and
unknown states remain distinct from successful settlement. Existing guards and
recovery/storage semantics remain authoritative.

Allowed: src/components/{MarketPanel,MatchesList,SettlementPanel,MarketNextActions}.tsx;
src/presentation/marketTasks.ts; src/styles.css; tests/market-tasks.test.mjs;
docs/evidence/056-market-tasks*; this plan; docs/prompts/040-market-next-actions.md;
docs/ai-usage/067-market-next-actions.md; AI_USAGE.md; docs/HANDOFF.md; DESIGN.md.
No backend, wallet/core, contract, dependency, image, payment or signature changes.

Acceptance: npm ci/test/typecheck/build/build:showcase, pure/render tests for
normal/reverse actors, expiry, returned/unknown/stale states and historical
eligibility, isolated desktop dev/preview fixtures for task navigation, account
changes, reload recovery, keyboard/focus and pending-state priority. No mobile
acceptance or real wallet/chain claim. Local commit only, no push/deployment.
Next ticket and exact allowed files: none until authorized.
