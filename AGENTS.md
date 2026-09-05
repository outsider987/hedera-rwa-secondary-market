# HoldBook — agent rules

## Start every task from repository evidence

1. Read this file completely, then `docs/HANDOFF.md`. Before implementation,
   read the applicable plan/spec sections and effective authorization. Follow
   the handoff's reading map; a link alone does not require loading its target.
2. Inspect `git status --short --branch`, `git log --oneline -10`, and the tree.
3. Check `based_on_commit` against Git history. It is the base of the documented
   work, NOT the hash of the commit containing the handoff. `unborn` is valid only
   for the bootstrap record. Read actual HEAD from Git; never fabricate a hash.
4. Summarize completed work, blockers, and the active ticket before editing.
5. Implement only that ticket and its allowed files/acceptance tests. Preserve
   unrelated user changes. Stop at the ticket boundary; do not start the next
   ticket merely because it is documented.

Use `AI_USAGE.md` as a short provenance index. Read relevant entries under
`docs/ai-usage/` when tracing decisions or extending that work; do not load the
whole archive by default. Start with evidence summaries, then query the needed
JSON fields/package paths with Node or search. Read complete inventories when
the task requires completeness. Selective reading never waives applicable
rules, authorization, asset parameters or acceptance checks.

## ETHOnline / attribution

- Maintain honest, incremental Git history. Never backdate commits or claim that
  prior work was created during this event.
- The initial user-supplied plan mentioned a pre-event research draft. That file
  was not supplied or inspected. Do not claim its contents or eligibility have
  been verified, and do not hide its existence. Victor must resolve any
  project-specific pre-event design/asset eligibility question with organizers.
- Preserve the specs, user prompts, decisions, and planning artifacts actually
  used here, after removing secrets. See `docs/prompts/001-planning-record.md`.
  Do not import an unseen pre-event master-plan file as new event work.
- Disclose third-party code, libraries, assets, and adaptations with their
  source/version/license. Retain required upstream notices when copying code.
- Record affected files, AI assistance, human decisions and checks actually
  performed in one work-item entry under `docs/ai-usage/`; update the short
  `AI_USAGE.md` index with its link. Keep detailed validation in evidence and
  current third-party sources in `docs/ATTRIBUTION.md`. Preserve dated history;
  record corrections in a new entry. Do not invent human review/model identities.
- Public GitHub availability alone is not an assertion of a project license,
  event eligibility, real KYC, or legal compliance.
- Event rules: https://ethglobal.com/events/ethonline2026/info/details

## Secrets and chain safety

- Never request, read, print, commit, or upload private keys, seed phrases,
  local wallet files, API tokens, `.env` secrets, or browser wallet profiles.
  Never instantiate a signer from a private key, including upstream test keys.
- Victor approves EVERY transaction and VC signature manually in MetaMask.
  No CLI signer, server signer, CI wallet, automatic signature, or unattended
  chain mutation. Testnet only: chain ID 296 / 0x128.
- Bind three distinct public accounts: Admin (also Escrow and test VC issuer),
  Seller, Buyer. Resolve Hedera IDs through Mirror Node; do not derive ECDSA
  wallet addresses from numeric account IDs.
- Recheck chain, active account, role, asset, and inputs before each mutation.
  Invalidate stale wallet state on account/network changes. Serialize pending
  operations. Never automatically resubmit on rejection, timeout, or reload.
- Treat a submitted-but-unknown transaction as pending. Check MetaMask/receipts
  before retrying. Mirror indexing delay is not a failed transaction.
- Config resolution must return an integer payload >= 1. If the pinned
  deployment or SDK is incompatible, stop and record diagnostics for a mentor.
  Never fall back to old contracts, upgrade SDK, bypass VC verification, or
  silently alter the approved asset parameters.
- Evidence uses a whitelist of public fields. Do not export whole wallet/SDK
  objects, full VC signatures, or arbitrary error objects into public logs.
  No transaction ID exists for a simulation or rejected signature; label it so.

## Implementation / verification

- Follow `docs/plans/001-ats-first.md`. Reuse platform features and installed
  libraries. No speculative abstractions or new frameworks for this slice.
- Keep React/React DOM 19.2.8, Vite 8.2.2, TypeScript 7.0.2, ATS SDK 8.0.0,
  Node 24.19.0 and npm 11.17.0 pinned. Commit the npm lockfile.
- Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` when the
  shell exists. Use Node's built-in test runner, not another test framework.
- Validate the dev page and production preview in a browser. SDK/browser and
  real MetaMask behavior require T01 checks; a static shell build proves neither.
- UI copy and documents intended for judges or public review are English;
  planning/handoff prose may be Traditional Chinese.
  Keep keyboard navigation, visible focus, readable contrast, responsive layout,
  honest empty/error/pending states. No images, branding exercise, or animation.
- Keep evidence summaries to about one page: delivered behavior, actual checks,
  remaining blockers and links to raw evidence. Omit step-by-step work diaries;
  link detailed logs and audit inventories. Retain required attribution and
  material security or verification limitations.
- Before a ticket's final commit, update handoff and AI usage with actual checks,
  evidence, unresolved blockers, Victor actions, and the next ticket's exact
  allowed files. Commit docs WITH the work, not afterward. Confirm clean Git
  status at the boundary. Do not erase user changes to make it clean.

## Explicitly deferred

No Go, PostgreSQL, CLOB, matching, payment leg, settlement engine, public web
deployment, custom smart contracts, real identity/KYC collection, corporate
actions UI, alternate wallets, or mainnet until the relevant later plan is
approved. T04 proves an ATS asset lifecycle, not a completed secondary market.
